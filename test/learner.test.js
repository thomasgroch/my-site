import { describe, it, expect } from 'vitest'
import { policy, reinforce, sample } from '../src/lib/semif/learner.js'
import { softmax } from '../src/lib/semif/math.js'

// A camada que aprende na cobrinha (learner.js): começa igual ao modelo e se
// afasta dele só pelo que os resultados ensinam.
const START = { model: 1, food: 0, room: 0, straight: 0 }
const row = (model, food = 0, room = 0, straight = 0) => ({ model, food, room, straight })

describe('cobrinha: camada que aprende', () => {
  it('com os pesos iniciais, joga igual ao modelo', () => {
    const modelProbs = [0.7, 0.2, 0.1]
    const probs = policy(START, modelProbs.map((p) => row(Math.log(p))))
    probs.forEach((p, i) => expect(p).toBeCloseTo(modelProbs[i]))
  })

  it('recompensa acima da média reforça o sinal da direção escolhida', () => {
    const rows = [row(0, 1), row(0, -1)]
    const probs = softmax([0, 0])
    const after = reinforce(START, rows, probs, 0, 1)
    expect(after.food).toBeGreaterThan(0)
    expect(reinforce(START, rows, probs, 0, -1).food).toBeLessThan(0)
  })

  it('repetir a lição desloca a escolha para o sinal que dá certo', () => {
    // O modelo prefere a direção 0, mas só a 1 aproxima da comida e é premiada.
    const rows = [row(Math.log(0.8), -1), row(Math.log(0.2), 1)]
    let weights = START
    for (let i = 0; i < 200; i++) {
      const probs = policy(weights, rows)
      weights = reinforce(weights, rows, probs, 1, 1)
      weights = reinforce(weights, rows, policy(weights, rows), 0, -1)
    }
    expect(policy(weights, rows)[1]).toBeGreaterThan(0.9)
  })

  it('os pesos ficam limitados', () => {
    let weights = START
    for (let i = 0; i < 1000; i++) weights = reinforce(weights, [row(0, 1), row(0, -1)], [0.5, 0.5], 0, 10)
    expect(weights.food).toBeLessThanOrEqual(4)
  })

  it('sorteia conforme as probabilidades', () => {
    expect(sample([0.2, 0.5, 0.3], 0.1)).toBe(0)
    expect(sample([0.2, 0.5, 0.3], 0.6)).toBe(1)
    expect(sample([0.2, 0.5, 0.3], 0.99)).toBe(2)
  })
})
