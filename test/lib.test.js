import { describe, it, expect } from 'vitest'
import { fill, plural } from '../src/lib/text.js'
import { argmax, softmax } from '../src/lib/semif/math.js'
import { DIRS, opposite, whereIs } from '../src/lib/semif/grid.js'

describe('text', () => {
  it('interpola e deixa a chave ausente como está', () => {
    expect(fill('Oi {nome}, {x}', { nome: 'Ana' })).toBe('Oi Ana, {x}')
  })
  it('plural regular do inglês', () => {
    expect(plural(1, 'tile')).toBe('1 tile')
    expect(plural(3, 'tile')).toBe('3 tiles')
  })
})

describe('math', () => {
  it('softmax soma 1 e preserva a ordem', () => {
    const probs = softmax([1, 3, 2])
    expect(probs.reduce((a, b) => a + b)).toBeCloseTo(1)
    expect(argmax(probs)).toBe(1)
  })
})

describe('grid', () => {
  it('cada direção tem a sua oposta', () => {
    for (const d of DIRS) expect(opposite(opposite(d))).toBe(d)
  })
  it('descreve onde o alvo está', () => {
    expect(whereIs(2, -3)).toBe('3 tiles up and 2 tiles to the right')
    expect(whereIs(-1, 0)).toBe('1 tile to the left')
    expect(whereIs(0, 0)).toBe('')
  })
})
