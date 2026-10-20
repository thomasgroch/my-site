// O que todo jogo em canvas da demo tem: o laço de animação e os controles
// (teclado, direcional, swipe, pausa fora da tela ou em segundo plano).
import { DIRECTIONS } from './grid.js'

const KEYS = { ArrowUp: 'up', KeyW: 'up', ArrowLeft: 'left', KeyA: 'left', ArrowDown: 'down', KeyS: 'down', ArrowRight: 'right', KeyD: 'right' }

// `step(dt)` avança a simulação, `draw()` desenha, `running()` diz se o laço
// continua. `maxDt` limita o salto depois de uma aba parada; `substep` divide
// o tempo em fatias fixas, para a física do Pac-Man.
export function createLoop({ running, step, draw, maxDt = 0.1, substep = Infinity }) {
  let raf = 0
  let last = 0
  function frame(now) {
    raf = 0
    let dt = Math.min(maxDt, (now - last) / 1000)
    last = now
    while (dt > 0) {
      const s = Math.min(dt, substep)
      step(s)
      dt -= s
    }
    draw()
    if (running()) raf = requestAnimationFrame(frame)
  }
  return {
    // Desenha fora do laço (uma resposta do modelo chegou com o jogo parado).
    get idle() {
      return !raf
    },
    start() {
      if (raf || !running()) return
      last = performance.now()
      raf = requestAnimationFrame(frame)
    },
  }
}

// `game` expõe active, paused, setPaused, steer e resize (createGame).
export function bindControls(card, game, { canvas, wrap }) {
  new ResizeObserver(([entry]) => game.resize(entry.contentRect.width)).observe(wrap)

  card.querySelectorAll('[data-dir]').forEach((button) =>
    button.addEventListener('pointerdown', (event) => {
      event.preventDefault()
      game.steer(DIRECTIONS[button.dataset.dir])
    })
  )

  // As setas só são do jogo enquanto ele roda e ninguém está digitando.
  window.addEventListener('keydown', (event) => {
    if (!game.active && !game.paused) return
    if (event.target.closest?.('input, textarea, select, [contenteditable]')) return
    if (event.code === 'KeyP' || event.code === 'Escape') {
      game.setPaused(!game.paused)
      return event.preventDefault()
    }
    const dir = KEYS[event.code]
    if (!dir || game.paused) return
    event.preventDefault()
    game.steer(DIRECTIONS[dir])
  })

  let touch = null
  canvas.addEventListener('pointerdown', (event) => (touch = { x: event.clientX, y: event.clientY }))
  canvas.addEventListener('pointerup', (event) => {
    if (!touch) return
    const dx = event.clientX - touch.x
    const dy = event.clientY - touch.y
    touch = null
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 16) return
    game.steer(DIRECTIONS[Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up'])
  })

  // Pausa sozinho quando sai da tela ou a aba fica em segundo plano.
  new IntersectionObserver(([entry]) => entry.intersectionRatio < 0.3 && game.setPaused(true), { threshold: [0, 0.3] }).observe(canvas)
  document.addEventListener('visibilitychange', () => document.hidden && game.setPaused(true))
}
