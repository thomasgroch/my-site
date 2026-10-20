// Inferência fora da thread principal. Adaptado do worker.js do SemIf
// (MIT): o wllama vem do jsDelivr em vez de vendorizado, e cada mensagem
// carrega um `id` para a resposta voltar a quem pediu (engine.js).
import { MODELS } from './models.js'

const WLLAMA = 'https://cdn.jsdelivr.net/npm/@wllama/wllama@3.6.1/esm'

// Pedidos ao Hugging Face não levam a URL do blog como referrer.
const browserFetch = self.fetch.bind(self)
self.fetch = (input, init = {}) => browserFetch(input, { ...init, referrerPolicy: 'no-referrer' })

// Começa a baixar já, mas sem top-level await: o listener de mensagens
// precisa estar registrado antes de qualquer postMessage chegar.
const wllama = import(/* @vite-ignore */ `${WLLAMA}/index.js`)

const labelsFor = (count) => Array.from({ length: count }, (_, index) => String.fromCharCode(65 + index))
let engine
let modelId

function messagesFor({ state, question, options }, mode) {
  const labels = labelsFor(options.length)
  const outputInstruction =
    mode === 'direct'
      ? `Reply with exactly one option letter from: ${labels.join(', ')}.`
      : `Estimate the probability that each allowed option is the correct decision.
Return only one JSON object mapping each option to its probability. Form every key as "<label>: <full option text>" using the allowed options above.
For example, if the unrelated options were "A. Route north" and "B. Route south", valid output would be:
{"A: Route north": 0.65, "B: Route south": 0.35}
For the actual decision, include every supplied option exactly once and in order. Each value must be a JSON number from 0 to 1, and the probabilities must sum to 1. Output JSON only, with no markdown or explanation.`
  const optionBlock = options.map((option, index) => `${labels[index]}. ${option}`).join('\n')
  return [
    { role: 'system', content: 'Make the requested decision from the supplied state. Follow the output format exactly.' },
    { role: 'user', content: `State:\n${state}\n\nQuestion:\n${question}\n\nAllowed options:\n${optionBlock}\n\n${outputInstruction}` },
  ]
}

function softmax(values) {
  const maximum = Math.max(...values)
  const exponents = values.map((value) => Math.exp(value - maximum))
  const total = exponents.reduce((sum, value) => sum + value, 0)
  return exponents.map((value) => value / total)
}

function optionLogprobs(response, labels) {
  const entries = response.choices?.[0]?.logprobs?.content?.[0]?.top_logprobs ?? []
  const logits = labels.map((label) => {
    const ascii = label.charCodeAt(0)
    const entry = entries.find((item) => item.token === label || (item.bytes?.length === 1 && item.bytes[0] === ascii))
    return Number(entry?.logprob)
  })
  if (logits.some((value) => !Number.isFinite(value))) {
    throw new Error(`The model did not return valid option logits for ${labels.join(', ')}.`)
  }
  return logits
}

// Confere se o JSON gerado tem uma probabilidade por opção e soma 1. Qwen3
// às vezes abre com <think>…</think> mesmo com o raciocínio desligado.
function validateGeneration(text, options) {
  try {
    const parsed = JSON.parse(text.trim().replace(/^<think>[\s\S]*?<\/think>\s*/i, ''))
    const labels = labelsFor(options.length)
    const keys = options.map((option, index) => `${labels[index]}: ${option}`)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('expected one JSON object')
    if (Object.keys(parsed).length !== keys.length || !keys.every((key) => key in parsed)) {
      throw new Error('expected one probability for every exact option key')
    }
    const probabilities = keys.map((key) => parsed[key])
    if (probabilities.some((p) => typeof p !== 'number' || p < 0 || p > 1)) throw new Error('probabilities must be numbers from 0 to 1')
    if (Math.abs(probabilities.reduce((a, b) => a + b, 0) - 1) > 0.02) throw new Error('probabilities must sum to 1')
    return { valid: true, choice: probabilities.indexOf(Math.max(...probabilities)) }
  } catch (error) {
    return { valid: false, validationError: error?.message ?? 'invalid JSON' }
  }
}

async function load(requestedModelId, progress) {
  if (engine) throw new Error(`${MODELS[modelId].name} is already loaded. Reload the page to switch models.`)
  if (!Object.hasOwn(MODELS, requestedModelId)) throw new Error('Choose one of the listed models.')
  const selected = MODELS[requestedModelId]
  const { Wllama, LoggerWithoutDebug } = await wllama
  engine = new Wllama({ default: `${WLLAMA}/wasm/wllama.wasm` }, { logger: LoggerWithoutDebug, suppressNativeLog: true, parallelDownloads: 4 })
  try {
    const loadStart = performance.now()
    await engine.loadModelFromUrl(selected.url, {
      n_ctx: 2048,
      n_batch: 512,
      n_gpu_layers: 999,
      cache_prompt: false,
      progressCallback: ({ loaded, total }) => progress({ phase: 'download', loaded, total }),
    })
    const loadMs = performance.now() - loadStart
    progress({ phase: 'warmup', loadMs })
    // Uma passada de verdade compila os shaders antes de qualquer medição.
    const warmupStart = performance.now()
    await engine.createChatCompletion({
      messages: [{ role: 'user', content: 'Reply with the single word ready.' }],
      max_tokens: 1,
      temperature: 0,
      cache_prompt: false,
      chat_template_kwargs: { enable_thinking: false },
    })
    modelId = requestedModelId
    return { modelId, name: selected.name, loadMs, warmupMs: performance.now() - warmupStart }
  } catch (error) {
    try { await engine.exit() } catch { /* limpeza de melhor esforço */ }
    engine = undefined
    throw error
  }
}

function requireEngine() {
  if (!engine || !modelId) throw new Error('Load a model first.')
}

// Leitura direta: uma única passada, gramática restrita às letras, e softmax
// sobre os logprobs de A, B, C… Nenhum token é realmente gerado para o leitor.
async function direct(data) {
  requireEngine()
  const started = performance.now()
  const labels = labelsFor(data.options.length)
  const response = await engine.createChatCompletion({
    messages: messagesFor(data, 'direct'),
    max_tokens: 1,
    temperature: 1,
    top_k: 0,
    top_p: 1,
    logprobs: true,
    top_logprobs: 20,
    logit_bias: Object.fromEntries(labels.map((_, index) => [String(MODELS[modelId].labelBase + index), 100])),
    grammar: `root ::= ${labels.map((label) => `"${label}"`).join(' | ')}`,
    cache_prompt: false,
    chat_template_kwargs: { enable_thinking: false },
  })
  const probabilities = softmax(optionLogprobs(response, labels))
  return {
    totalMs: performance.now() - started,
    inputTokens: response.usage?.prompt_tokens ?? 0,
    probabilities,
  }
}

// Geração: o modelo escreve o JSON token a token, em streaming.
async function generate(data, update) {
  requireEngine()
  const started = performance.now()
  let firstTokenAt = null
  let text = ''
  let usage = null
  // O stream nem sempre traz `usage`; cada chunk com texto é um token.
  let pieces = 0
  const stream = await engine.createChatCompletion({
    messages: messagesFor(data, 'generation'),
    stream: true,
    max_tokens: 512,
    temperature: 0,
    cache_prompt: false,
    chat_template_kwargs: { enable_thinking: false },
  })
  for await (const chunk of stream) {
    const piece = chunk.choices?.[0]?.delta?.content ?? ''
    if (piece && firstTokenAt == null) firstTokenAt = performance.now()
    if (piece) pieces += 1
    text += piece
    if (chunk.usage) usage = chunk.usage
    update({ text, tokens: usage?.completion_tokens || pieces, ttftMs: firstTokenAt == null ? null : firstTokenAt - started })
  }
  text = text.trim()
  return {
    totalMs: performance.now() - started,
    ttftMs: firstTokenAt == null ? null : firstTokenAt - started,
    inputTokens: usage?.prompt_tokens ?? 0,
    tokens: usage?.completion_tokens || pieces,
    text,
    ...validateGeneration(text, data.options),
  }
}

const handlers = { load: (payload, notify) => load(payload.modelId, notify), direct: (payload) => direct(payload), generate }

self.addEventListener('message', async ({ data: { id, type, payload } }) => {
  const notify = (data) => self.postMessage({ id, type: 'update', data })
  try {
    self.postMessage({ id, type: 'done', data: await handlers[type](payload, notify) })
  } catch (error) {
    console.error(error)
    self.postMessage({ id, type: 'error', message: error?.message ?? String(error) })
  }
})
