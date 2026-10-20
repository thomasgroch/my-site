// O que aprende na cobrinha. O modelo não muda: seus pesos são fixos. Quem
// aprende é esta camada fina por cima dele, que decide quanto confiar em cada
// sinal ao escolher uma direção:
//
//   nota(direção) = Σ peso × sinal        escolha ~ softmax(notas)
//
// Os sinais são a opinião do modelo e três fatos do tabuleiro. Começa com
// peso 1 no modelo e 0 no resto, ou seja, jogando igual ao modelo. Depois de
// cada decisão, o resultado (comeu, morreu, chegou mais perto ou não) ajusta
// os pesos pelo gradiente de política (REINFORCE): o que levou a um resultado
// melhor que a média ganha peso. É aprendizado por reforço, pequeno o bastante
// para caber numa página, e fica salvo no navegador, um por modelo.

import { softmax } from './math.js'
import { recall, remember } from '../storage.js'

export const SIGNALS = [
  { key: 'model', label: '🤖 Model' },
  { key: 'food', label: '🍎 Closer to food' },
  { key: 'room', label: '📏 Room ahead' },
  { key: 'straight', label: '⬆️ Keep straight' },
]

const START = { model: 1, food: 0, room: 0, straight: 0 }
const RATE = 0.08
const LIMIT = 4
const HISTORY = 100

// Uma linha de sinais por direção: [{ model, food, room, straight }, …].
export function policy(weights, rows) {
  return softmax(rows.map((row) => SIGNALS.reduce((sum, { key }) => sum + weights[key] * row[key], 0)))
}

// Um passo de REINFORCE para a softmax linear: o sinal da direção escolhida
// menos a média sob a política, vezes a vantagem (recompensa − linha de base).
export function reinforce(weights, rows, probs, chosen, advantage, rate = RATE) {
  const next = { ...weights }
  for (const { key } of SIGNALS) {
    const expected = rows.reduce((sum, row, i) => sum + probs[i] * row[key], 0)
    const step = rate * advantage * (rows[chosen][key] - expected)
    next[key] = Math.max(-LIMIT, Math.min(LIMIT, weights[key] + step))
  }
  return next
}

export const sample = (probs, random = Math.random()) => {
  let left = random
  for (let i = 0; i < probs.length; i++) if ((left -= probs[i]) < 0) return i
  return probs.length - 1
}

// O estado guardado: pesos, linha de base e maçãs por partida.
export function createLearner(storageKey) {
  const fresh = () => ({ weights: { ...START }, baseline: 0, games: [] })
  let state = fresh()
  try {
    const saved = JSON.parse(recall(storageKey))
    if (saved?.weights) state = { ...fresh(), ...saved, weights: { ...START, ...saved.weights } }
  } catch {
    // Guardado inválido: começa do zero.
  }
  const save = () => remember(storageKey, JSON.stringify(state))

  return {
    get weights() {
      return state.weights
    },
    get games() {
      return state.games
    },
    policy: (rows) => policy(state.weights, rows),
    learn(rows, probs, chosen, reward) {
      state.weights = reinforce(state.weights, rows, probs, chosen, reward - state.baseline)
      state.baseline += 0.05 * (reward - state.baseline)
      save()
    },
    endGame(apples) {
      state.games = [...state.games, apples].slice(-HISTORY)
      save()
    },
    forget() {
      state = fresh()
      save()
    },
  }
}
