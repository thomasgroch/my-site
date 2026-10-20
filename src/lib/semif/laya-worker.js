// O Laya como segundo motor, com o mesmo protocolo do worker.js. Não é um
// LLM: é um encoder (mmBERT) treinado só para decidir, e devolve um logit por
// opção numa única passada, sem gerar texto. Roda a exportação ONNX da
// onnx-community pelo Transformers.js, vindo do jsDelivr. A montagem da
// sequência segue o build_sequence do Laya (Apache-2.0), pela adaptação do
// open-jev (MIT):
//   [CLS] "choice question: {pergunta}" [SEP] [MASK] opção … [SEP] estado [SEP]
import { MODELS } from './models.js'

const TRANSFORMERS = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.1'
const MAX_OPTION_TOKENS = 48

// Começa a baixar já, mas sem top-level await: o listener de mensagens
// precisa estar registrado antes de qualquer postMessage chegar.
const transformers = import(/* @vite-ignore */ TRANSFORMERS)

let lib
let model
let tokenizer
let special
let settings
let modelId

const raw = (text) => Array.from(tokenizer(text, { add_special_tokens: false }).input_ids.data, Number)

function single(text) {
  const ids = raw(text)
  if (ids.length !== 1) throw new Error(`The tokenizer does not know the token ${text}.`)
  return ids[0]
}

// O Transformers.js junta espaços seguidos de um jeito diferente do
// tokenizador original deste modelo, então o texto entra palavra por palavra.
function encode(input) {
  const text = input.split(special.maskText).join(' ')
  if (text === '') return []
  if (!settings.splitWords) return raw(text)
  const ids = []
  for (const piece of (text.startsWith(' ') ? text : ` ${text}`).split(/(?= )/)) {
    const word = piece.slice(1)
    if (word === '') ids.push(special.space)
    else ids.push(...raw(word))
  }
  return ids
}

function sequence({ state, question, options }) {
  let marked = options.map((option) => [special.mask, ...encode(` ${option}`).slice(0, MAX_OPTION_TOKENS)])
  const size = () => marked.reduce((sum, option) => sum + option.length, 0)
  let budget = settings.headLength - size()
  if (budget < 16) {
    const per = Math.max(4, Math.floor((settings.headLength - 16) / marked.length))
    marked = marked.map((option) => option.slice(0, per))
    budget = settings.headLength - size()
  }
  const head = encode(`choice question: ${question}`).slice(0, Math.max(8, budget))
  let ids = [special.cls, ...head, special.sep]
  const markers = []
  for (const option of marked) {
    markers.push(ids.length)
    ids.push(...option)
  }
  ids.push(special.sep)
  const room = Math.max(0, settings.maxLength - ids.length - 1)
  ids = [...ids, ...encode(state).slice(0, room), special.sep].slice(0, settings.maxLength)
  return { ids, markers }
}

function softmax(values) {
  const maximum = Math.max(...values)
  const exponents = values.map((value) => Math.exp(value - maximum))
  const total = exponents.reduce((sum, value) => sum + value, 0)
  return exponents.map((value) => value / total)
}

async function direct(data) {
  if (!model) throw new Error('Load a model first.')
  const started = performance.now()
  const { ids, markers } = sequence(data)
  const { Tensor } = lib
  const int64 = (values) => BigInt64Array.from(values, BigInt)
  const { logits } = await model({
    input_ids: new Tensor('int64', int64(ids), [1, ids.length]),
    attention_mask: new Tensor('int64', int64(ids.map(() => 1)), [1, ids.length]),
    marker_pos: new Tensor('int64', int64(markers), [1, markers.length]),
    marker_mask: new Tensor('bool', Uint8Array.from(markers, () => 1), [1, markers.length]),
    qtype: new Tensor('int64', int64([0]), [1]),
  })
  const scores = Array.from(logits.to('float32').data).slice(0, markers.length)
  return {
    totalMs: performance.now() - started,
    inputTokens: ids.length,
    probabilities: softmax(scores.map((score) => score / settings.temperature)),
  }
}

async function load(requestedModelId, progress) {
  if (model) throw new Error(`${MODELS[modelId].name} is already loaded.`)
  const selected = MODELS[requestedModelId]
  if (selected?.runtime !== 'laya') throw new Error('Choose one of the listed models.')
  lib = await transformers
  const loadStart = performance.now()
  // Vários arquivos baixam em paralelo: a barra soma todos.
  const files = new Map()
  const progress_callback = ({ status, file, loaded, total }) => {
    if (status !== 'progress' || !total) return
    files.set(file, { loaded, total })
    const sum = (key) => [...files.values()].reduce((all, item) => all + item[key], 0)
    progress({ phase: 'download', loaded: sum('loaded'), total: Math.max(sum('total'), selected.bytes) })
  }
  const source = { revision: selected.revision, progress_callback }
  tokenizer = await lib.AutoTokenizer.from_pretrained(selected.repo, source)
  const loaded = await lib.AutoModel.from_pretrained(selected.repo, { ...source, dtype: 'fp16', device: 'webgpu' })
  const laya = loaded.config.laya ?? {}
  const names = tokenizer.config ?? {}
  const maskText = names.mask_token ?? '<mask>'
  settings = {
    headLength: laya.head_max_len ?? 256,
    maxLength: laya.max_len ?? 1024,
    splitWords: laya.split_words === true,
    // A temperatura de fábrica para escolhas; o Laya recusa fora de 0,5 a 5.
    temperature: Math.min(5, Math.max(0.5, laya.temperature?.[0] ?? 1)),
  }
  special = { maskText, space: raw(' ')[0] }
  Object.assign(special, {
    cls: single(names.cls_token ?? '<bos>'),
    sep: single(names.sep_token ?? '<eos>'),
    mask: single(maskText),
  })
  model = loaded
  modelId = requestedModelId
  const loadMs = performance.now() - loadStart
  progress({ phase: 'warmup', loadMs })
  // Uma passada de verdade compila os shaders antes de qualquer medição.
  const warmupStart = performance.now()
  await direct({ state: 'Warm up.', question: 'Are you ready?', options: ['Ready', 'Not ready'] })
  return { modelId, name: selected.name, loadMs, warmupMs: performance.now() - warmupStart }
}

const handlers = {
  load: (payload, notify) => load(payload.modelId, notify),
  direct,
  generate: () => Promise.reject(new Error(`${MODELS[modelId]?.name ?? 'This model'} only decides: it cannot write text, so there is nothing to generate.`)),
}

self.addEventListener('message', async ({ data: { id, type, payload } }) => {
  const notify = (data) => self.postMessage({ id, type: 'update', data })
  try {
    self.postMessage({ id, type: 'done', data: await handlers[type](payload, notify) })
  } catch (error) {
    console.error(error)
    self.postMessage({ id, type: 'error', message: error?.message ?? String(error) })
  }
})
