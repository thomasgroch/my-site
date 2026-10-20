// Tabuleiro em casas: direções e contas que a cobrinha e o Pac-Man dividem.
import { plural } from '../text.js'

export const UP = { x: 0, y: -1, name: 'Up', arrow: '↑' }
export const LEFT = { x: -1, y: 0, name: 'Left', arrow: '←' }
export const DOWN = { x: 0, y: 1, name: 'Down', arrow: '↓' }
export const RIGHT = { x: 1, y: 0, name: 'Right', arrow: '→' }
// A ordem desempata como no arcade: cima, esquerda, baixo, direita.
export const DIRS = [UP, LEFT, DOWN, RIGHT]
export const DIRECTIONS = { up: UP, left: LEFT, down: DOWN, right: RIGHT }

export const same = (a, b) => a.x === b.x && a.y === b.y
export const add = (a, d) => ({ x: a.x + d.x, y: a.y + d.y })
export const opposite = (d) => DIRS.find((o) => o.x === -d.x && o.y === -d.y)
export const randomOf = (list) => list[Math.floor(Math.random() * list.length)]

// Onde fica o alvo em relação a uma casa, para o prompt:
// whereIs(2, -3) → '3 tiles up and 2 tiles to the right'; '' quando é a mesma casa.
export const whereIs = (dx, dy) =>
  [dy && `${plural(Math.abs(dy), 'tile')} ${dy < 0 ? 'up' : 'down'}`, dx && `${plural(Math.abs(dx), 'tile')} to the ${dx < 0 ? 'left' : 'right'}`]
    .filter(Boolean)
    .join(' and ')
