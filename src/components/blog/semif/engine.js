// Um worker e um modelo por página, divididos entre o laboratório e o jogo.
// Os pedidos entram numa fila: duas passadas ao mesmo tempo disputariam a GPU
// e bagunçariam as medições.
const listeners = new Set()
const pending = new Map()
let worker
let nextId = 0
let queue = Promise.resolve()

export const status = { state: 'idle', modelId: null, name: null }

function setStatus(patch) {
  Object.assign(status, patch)
  listeners.forEach((listener) => listener(status))
}

export function subscribe(listener) {
  listeners.add(listener)
  listener(status)
  return () => listeners.delete(listener)
}

function getWorker() {
  if (worker) return worker
  worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' })
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
  return worker
}

function call(type, payload, onUpdate) {
  const run = () =>
    new Promise((resolve, reject) => {
      const id = ++nextId
      pending.set(id, { resolve, reject, onUpdate })
      getWorker().postMessage({ id, type, payload })
    })
  const result = queue.then(run, run)
  queue = result.catch(() => {})
  return result
}

export async function load(modelId, onProgress) {
  setStatus({ state: 'loading', modelId, error: null })
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

// Mesmo formato; onUpdate recebe o texto parcial a cada token.
export const generate = (data, onUpdate) => call('generate', data, onUpdate)

export const seconds = (ms) => `${(ms / 1000).toFixed(3)} s`
