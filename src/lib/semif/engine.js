// Um worker e um modelo por vez, divididos entre o laboratório e o jogo.
// Carregar outro modelo encerra o worker anterior, o que devolve a memória
// da GPU; cada motor tem o seu (worker.js para o wllama, laya-worker.js para
// o Laya). Os pedidos entram numa fila: duas passadas ao mesmo tempo disputariam a GPU
// e bagunçariam as medições.
import { MODELS } from './models.js'

const listeners = new Set()
const pending = new Map()
let worker
let nextId = 0
let queue = Promise.resolve()

export const status = { state: 'idle', modelId: null, runtime: null, name: null }

function setStatus(patch) {
  Object.assign(status, patch)
  listeners.forEach((listener) => listener(status))
}

export function subscribe(listener) {
  listeners.add(listener)
  listener(status)
  return () => listeners.delete(listener)
}

function startWorker(modelId) {
  worker?.terminate()
  const stopped = new Error('Another model was loaded.')
  pending.forEach((request) => request.reject(stopped))
  pending.clear()
  // Um `new Worker(new URL(...))` literal por arquivo, para o Vite empacotar.
  worker =
    MODELS[modelId]?.runtime === 'laya'
      ? new Worker(new URL('@/lib/semif/laya-worker.js', import.meta.url), { type: 'module' })
      : new Worker(new URL('@/lib/semif/worker.js', import.meta.url), { type: 'module' })
  worker.addEventListener('message', ({ data: { id, type, data, message } }) => {
    const request = pending.get(id)
    if (!request) return
    if (type === 'update') return request.onUpdate?.(data)
    pending.delete(id)
    if (type === 'done') request.resolve(data)
    else request.reject(new Error(message))
  })
  worker.addEventListener('error', (event) => {
    const error = new Error(`Worker failed: ${event.message ?? 'unknown error'}`)
    pending.forEach((request) => request.reject(error))
    pending.clear()
    setStatus({ state: 'error', error: error.message })
  })
}

function call(type, payload, onUpdate) {
  const run = () =>
    new Promise((resolve, reject) => {
      const id = ++nextId
      pending.set(id, { resolve, reject, onUpdate })
      if (!worker) return reject(new Error('Load a model first.'))
      worker.postMessage({ id, type, payload })
    })
  const result = queue.then(run, run)
  queue = result.catch(() => {})
  return result
}

export async function load(modelId, onProgress) {
  startWorker(modelId)
  setStatus({ state: 'loading', modelId, runtime: MODELS[modelId]?.runtime ?? 'wllama', name: null, error: null })
  try {
    const result = await call('load', { modelId }, onProgress)
    setStatus({ state: 'ready', name: result.name })
    return result
  } catch (error) {
    setStatus({ state: 'error', error: error.message })
    throw error
  }
}

// { state, question, options } → { probabilities, totalMs, inputTokens }
export const direct = (data) => call('direct', data)

// Leitura direta com o viés de posição descontado. Modelos pequenos preferem
// a primeira letra seja qual for a pergunta (o Qwen3 0.6B dá ~99% para "A"),
// então mede-se quanto cada posição ganha num pedido sem informação e isso é
// descontado da resposta. `neutral` troca os campos que decidem a resposta
// (ex.: { question: 'N/A' }); a medida roda as opções por todas as posições,
// para a preferência por uma delas se anular, e fica guardada por modelo,
// pedido neutro e número de opções.
const priors = new Map()

function priorFor({ neutral, ...data }) {
  const base = { ...data, ...neutral }
  const key = [status.modelId, base.state, base.question, base.options.length].join('|')
  if (!priors.has(key)) {
    const measure = async () => {
      const count = base.options.length
      const sums = base.options.map(() => 0)
      for (let shift = 0; shift < count; shift++) {
        const { probabilities } = await direct({ ...base, options: base.options.map((_, i) => base.options[(i + shift) % count]) })
        probabilities.forEach((p, i) => (sums[i] += Math.log(p + 1e-9) / count))
      }
      return sums
    }
    priors.set(key, measure().catch((error) => (priors.delete(key), Promise.reject(error))))
  }
  return priors.get(key)
}

// { state, question, options, neutral } → o mesmo de direct(), com
// `probabilities` calibradas e as originais em `raw`.
export async function calibrated(data) {
  const prior = await priorFor(data)
  const result = await direct(data)
  const logits = result.probabilities.map((p, i) => Math.log(p + 1e-9) - prior[i])
  const top = Math.max(...logits)
  const exps = logits.map((value) => Math.exp(value - top))
  const total = exps.reduce((sum, value) => sum + value, 0)
  return { ...result, raw: result.probabilities, probabilities: exps.map((value) => value / total) }
}

// Mede o viés antes da primeira pergunta de verdade, para ela não esperar.
export const warmUp = (data) => priorFor(data).then(() => {}, () => {})

// Mesmo formato; onUpdate recebe o texto parcial a cada token.
export const generate = (data, onUpdate) => call('generate', data, onUpdate)

export const seconds = (ms) => `${(ms / 1000).toFixed(3)} s`
