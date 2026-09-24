// Pac-Man com um fantasma controlado pelo modelo. Três fantasmas usam a IA
// clássica do arcade (alvo por distância em cada cruzamento). O 🤖 pede ao
// modelo a direção do próximo cruzamento assim que deixa o anterior; se a
// resposta ainda não chegou, ele para ali, pensando. Essa espera é a latência
// do modelo, visível no labirinto.
import { direct, status as brain } from './engine.js'

// # parede, _ vazio fora do labirinto, - porta da casa dos fantasmas,
// . pastilha, o energizador. A linha 9 é o túnel: as bordas se ligam.
const MAP = [
  '###################',
  '#........#........#',
  '#o##.###.#.###.##o#',
  '#.................#',
  '#.##.#.#####.#.##.#',
  '#....#...#...#....#',
  '####.### # ###.####',
  '___#.#       #.#___',
  '####.# ##-## #.####',
  '    .  #   #  .    ',
  '####.# ##### #.####',
  '___#.#       #.#___',
  '####.# ##### #.####',
  '#........#........#',
  '#.##.###.#.###.##.#',
  '#o.#..... .....#.o#',
  '##.#.#.#####.#.#.##',
  '#....#...#...#....#',
  '#.######.#.######.#',
  '#.................#',
  '###################',
]
const W = MAP[0].length
const H = MAP.length

const UP = { x: 0, y: -1, name: 'Up', arrow: '↑' }
const LEFT = { x: -1, y: 0, name: 'Left', arrow: '←' }
const DOWN = { x: 0, y: 1, name: 'Down', arrow: '↓' }
const RIGHT = { x: 1, y: 0, name: 'Right', arrow: '→' }
const STOP = { x: 0, y: 0, name: 'Stop', arrow: '·' }
// A ordem desempata como no arcade: cima, esquerda, baixo, direita.
const DIRS = [UP, LEFT, DOWN, RIGHT]
export const DIRECTIONS = { up: UP, left: LEFT, down: DOWN, right: RIGHT }

const PAC_START = { x: 9, y: 15 }
const DOOR_OUT = { x: 9, y: 7 }
const HOUSE = { x: 9, y: 9 }
// Modo dos fantasmas clássicos ao longo da fase: dispersar e perseguir.
const SCHEDULE = [['scatter', 7], ['chase', 20], ['scatter', 7], ['chase', 20], ['scatter', 5], ['chase', Infinity]]
const MAX_WAIT = 2.5
const COLORS = { wall: '#0f1f4d', edge: '#3b82f6', door: '#f9a8d4', pellet: '#fde68a', pac: '#facc15', scared: '#1d4ed8', flash: '#e5e7eb' }

const wrapX = (x) => ((x % W) + W) % W
const cell = (x, y) => (y < 0 || y >= H ? '#' : MAP[y][wrapX(x)])
const isWall = (c) => c === '#' || c === '_'
const open = (x, y, door = false) => {
  const c = cell(x, y)
  return !isWall(c) && (c !== '-' || door)
}
const keyOf = ({ x, y }) => `${x},${y}`
const same = (a, b) => a.x === b.x && a.y === b.y
const opposite = (d) => DIRS.find((o) => o.x === -d.x && o.y === -d.y) ?? STOP
const exits = (tile, from, door = false) =>
  DIRS.filter((d) => d !== opposite(from) && open(tile.x + d.x, tile.y + d.y, door))
const randomOf = (items) => items[Math.floor(Math.random() * items.length)]
const tileOf = (e) => ({ x: e.tx, y: e.ty })

// Primeiro passo do caminho mais curto até `target` (volta da casa e saída).
function bfsStep(from, target, door) {
  const dist = new Map([[keyOf(target), 0]])
  const queue = [target]
  while (queue.length) {
    const t = queue.shift()
    for (const d of DIRS) {
      const next = { x: wrapX(t.x + d.x), y: t.y + d.y }
      if (!open(next.x, next.y, door) || dist.has(keyOf(next))) continue
      dist.set(keyOf(next), dist.get(keyOf(t)) + 1)
      queue.push(next)
    }
  }
  let best = STOP
  let bestDist = Infinity
  for (const d of DIRS) {
    const value = dist.get(keyOf({ x: wrapX(from.x + d.x), y: from.y + d.y }))
    if (value !== undefined && value < bestDist) [best, bestDist] = [d, value]
  }
  return best
}

// Anda pelo corredor, fazendo as curvas sozinho, até o próximo cruzamento.
function nextCrossing(from, dir) {
  let tile = from
  let d = dir
  for (let steps = 0; steps < 60; steps++) {
    tile = { x: wrapX(tile.x + d.x), y: tile.y + d.y }
    const options = exits(tile, d)
    if (options.length >= 2) return { tile, options }
    if (!options.length) return null
    d = options[0]
  }
  return null
}

const closest = (options, from, target) =>
  options.reduce((best, d) => {
    const score = (from.x + d.x - target.x) ** 2 + (from.y + d.y - target.y) ** 2
    return score < best.score ? { d, score } : best
  }, { d: options[0], score: Infinity }).d

function plural(n, word) {
  return `${n} ${word}${n === 1 ? '' : 's'}`
}

export function createGame(canvas, { onHud, onRobot }) {
  const ctx = canvas.getContext('2d')
  let T = 20
  let dpr = 1
  let raf = 0
  let last = 0
  let time = 0
  let phase = 'idle'
  let paused = false
  let phaseTime = 0
  let roundTime = 0
  let score = 0
  let lives = 3
  let level = 1
  let pellets = new Map()
  let modeIndex = 0
  let modeTime = SCHEDULE[0][1]
  let fright = 0
  let combo = 0
  let want = null
  let tokens = 0
  let popups = []
  let pac
  let ghosts = []
  const stats = { decisions: 0, totalMs: 0, waits: 0, timeouts: 0, last: null }

  const levelSpeed = () => 1 + 0.05 * (level - 1)
  const hud = () => onHud({ score, lives, level, phase, paused })
  const report = () => onRobot({ ...stats, brain: brain.state === 'ready' ? brain.name : null, pending: robot()?.plan?.status === 'pending' })
  const robot = () => ghosts.find((g) => g.robot)
  const mode = () => SCHEDULE[modeIndex][0]

  function resetPellets() {
    pellets = new Map()
    MAP.forEach((row, y) => [...row].forEach((c, x) => (c === '.' || c === 'o') && pellets.set(keyOf({ x, y }), c)))
  }

  function resetPositions() {
    pac = { tx: PAC_START.x, ty: PAC_START.y, t: 0, dir: STOP, face: LEFT }
    want = null
    fright = 0
    roundTime = 0
    const ghost = (name, color, start, release, extra = {}) =>
      ({ name, color, tx: start.x, ty: start.y, t: 0, dir: release === 0 ? LEFT : STOP, state: release === 0 ? 'active' : 'house', release, frightened: false, ...extra })
    ghosts = [
      ghost('blinky', '#ef4444', DOOR_OUT, 0, { corner: { x: W - 2, y: -3 }, target: () => tileOf(pac) }),
      ghost('pinky', '#f9a8d4', HOUSE, 1, {
        corner: { x: 1, y: -3 },
        target: () => ({ x: pac.tx + (pac.dir.x || pac.face.x) * 4, y: pac.ty + (pac.dir.y || pac.face.y) * 4 }),
      }),
      ghost('robot', '#4ade80', { x: 8, y: 9 }, 3, { robot: true, plan: null, shown: null, waiting: false }),
      ghost('clyde', '#fb923c', { x: 10, y: 9 }, 6, {
        corner: { x: 0, y: H + 1 },
        target(g) {
          const far = (g.tx - pac.tx) ** 2 + (g.ty - pac.ty) ** 2 > 64
          return far ? tileOf(pac) : this.corner
        },
      }),
    ]
    report()
  }

  function newGame() {
    Object.assign(stats, { decisions: 0, totalMs: 0, waits: 0, timeouts: 0, last: null })
    score = 0
    lives = 3
    level = 1
    startLevel()
  }

  function startLevel() {
    resetPellets()
    modeIndex = 0
    modeTime = SCHEDULE[0][1]
    resetPositions()
    phase = 'ready'
    phaseTime = 2
    paused = false
    hud()
  }

  // Meia volta no meio do caminho: troca de casa de origem e destino.
  function reverse(e) {
    if (e.dir === STOP) return
    if (e.t > 0) {
      e.tx = wrapX(e.tx + e.dir.x)
      e.ty += e.dir.y
      e.t = 1 - e.t
    }
    e.dir = opposite(e.dir)
  }

  function move(e, dist, arrive) {
    while (dist > 0 && e.dir !== STOP && !e.waiting) {
      const need = 1 - e.t
      if (dist < need) {
        e.t += dist
        return
      }
      dist -= need
      e.tx = wrapX(e.tx + e.dir.x)
      e.ty += e.dir.y
      e.t = 0
      arrive(e)
    }
  }

  function frighten() {
    fright = Math.max(2, 6 - (level - 1) * 0.5)
    combo = 0
    for (const g of ghosts) {
      if (g.state !== 'active') continue
      g.frightened = true
      if (g.robot) cancelPlan(g)
      else reverse(g)
    }
  }

  function arrivePac(p) {
    const key = keyOf(tileOf(p))
    const pellet = pellets.get(key)
    if (pellet) {
      pellets.delete(key)
      score += pellet === 'o' ? 50 : 10
      if (pellet === 'o') frighten()
      if (!pellets.size) {
        phase = 'cleared'
        phaseTime = 2
      }
      hud()
    }
    if (want && open(p.tx + want.x, p.ty + want.y)) p.dir = want
    else if (!open(p.tx + p.dir.x, p.ty + p.dir.y)) p.dir = STOP
    if (p.dir !== STOP) p.face = p.dir
  }

  // --- o fantasma 🤖 -------------------------------------------------------

  function cancelPlan(g) {
    g.plan = null
    g.waiting = false
  }

  function promptFor(plan) {
    const dx = pac.tx - plan.tile.x
    const dy = pac.ty - plan.tile.y
    const parts = [
      dy && `${plural(Math.abs(dy), 'tile')} ${dy < 0 ? 'up' : 'down'}`,
      dx && `${plural(Math.abs(dx), 'tile')} to the ${dx < 0 ? 'left' : 'right'}`,
    ].filter(Boolean)
    const where = parts.length ? `${parts.join(' and ')} from you` : 'right here'
    return {
      state: `You are a ghost in a Pac-Man maze, standing at a crossroads. Pac-Man is ${where}. ${
        plan.frightened ? 'Pac-Man just ate a power pellet, so you are scared and must get away from him.' : 'You want to catch him.'
      }`,
      question: plan.frightened ? 'Which way takes you away from Pac-Man?' : 'Which way takes you toward Pac-Man?',
      options: plan.options.map((d) => d.name),
    }
  }

  function planNext(g) {
    const hit = nextCrossing(tileOf(g), g.dir)
    if (!hit) return cancelPlan(g)
    const plan = { ...hit, key: keyOf(hit.tile), status: 'pending', token: ++tokens, frightened: fright > 0 }
    g.plan = plan
    if (brain.state !== 'ready') {
      Object.assign(plan, { status: 'ready', choice: randomOf(hit.options), probs: null })
      return report()
    }
    direct(promptFor(plan)).then(
      ({ probabilities, totalMs }) => {
        const best = probabilities.indexOf(Math.max(...probabilities))
        Object.assign(plan, { status: 'ready', choice: hit.options[best], probs: probabilities, ms: totalMs })
        stats.decisions += 1
        stats.totalMs += totalMs
        stats.last = plan
        report()
        if (!raf) draw()
      },
      (error) => {
        Object.assign(plan, { status: 'ready', choice: null, error: error.message })
        report()
      }
    )
    report()
  }

  function fallback(g, here, options) {
    return g.frightened ? randomOf(options) : closest(options, here, tileOf(pac))
  }

  function takePlan(g, here, options) {
    const { choice } = g.plan
    g.dir = options.includes(choice) ? choice : fallback(g, here, options)
    g.shown = g.plan.probs ? g.plan : null
    g.waiting = false
    planNext(g)
  }

  function robotArrive(g, here, options) {
    if (g.plan?.key === keyOf(here)) {
      if (g.plan.status === 'ready') return takePlan(g, here, options)
      g.waiting = true
      g.waitStart = time
      stats.waits += 1
      return report()
    }
    g.dir = fallback(g, here, options)
    planNext(g)
  }

  function resolveWait(g) {
    const here = tileOf(g)
    const options = exits(here, g.dir)
    if (g.plan?.status === 'ready') return takePlan(g, here, options)
    if (time - g.waitStart < MAX_WAIT) return
    stats.timeouts += 1
    g.waiting = false
    g.dir = fallback(g, here, options)
    planNext(g)
  }

  // --- fantasmas -----------------------------------------------------------

  function arriveGhost(g) {
    const here = tileOf(g)
    if (g.state === 'eyes') {
      if (same(here, HOUSE)) g.state = 'leaving'
      g.dir = bfsStep(here, g.state === 'eyes' ? HOUSE : DOOR_OUT, true)
      return
    }
    if (g.state === 'leaving') {
      if (!same(here, DOOR_OUT)) return (g.dir = bfsStep(here, DOOR_OUT, true))
      g.state = 'active'
      g.dir = g.robot ? RIGHT : LEFT
      if (g.robot) planNext(g)
      return
    }
    const options = exits(here, g.dir)
    if (!options.length) return (g.dir = opposite(g.dir))
    if (options.length === 1) {
      g.dir = options[0]
      if (g.robot && !g.plan) planNext(g)
      return
    }
    if (g.robot) return robotArrive(g, here, options)
    if (g.frightened) return (g.dir = randomOf(options))
    g.dir = closest(options, here, mode() === 'scatter' ? g.corner : g.target(g))
  }

  function ghostSpeed(g) {
    if (g.state === 'eyes') return 12
    if (g.state !== 'active') return 3
    if (g.frightened) return 3.5
    return (g.robot ? 5.5 : 6) * levelSpeed()
  }

  function eat(g) {
    combo += 1
    const points = 200 * 2 ** (combo - 1)
    score += points
    popups.push({ x: g.tx, y: g.ty, text: String(points), ttl: 1 })
    g.state = 'eyes'
    g.frightened = false
    if (g.robot) cancelPlan(g)
    hud()
  }

  function collide() {
    const px = pac.tx + pac.dir.x * pac.t
    const py = pac.ty + pac.dir.y * pac.t
    for (const g of ghosts) {
      if (g.state !== 'active') continue
      let dx = Math.abs(px - (g.tx + g.dir.x * g.t))
      dx = Math.min(dx, W - dx)
      const dy = Math.abs(py - (g.ty + g.dir.y * g.t))
      if (dx + dy > 0.7) continue
      if (g.frightened) eat(g)
      else {
        lives -= 1
        phase = 'dying'
        phaseTime = 1.6
        ghosts.forEach((ghost) => ghost.robot && cancelPlan(ghost))
        hud()
        return
      }
    }
  }

  function step(s) {
    time += s
    popups = popups.filter((p) => (p.ttl -= s) > 0)
    if (phase === 'ready' && (phaseTime -= s) <= 0) phase = 'playing'
    if (phase === 'dying' && (phaseTime -= s) <= 0) {
      if (lives > 0) {
        resetPositions()
        phase = 'ready'
        phaseTime = 1.5
      } else phase = 'over'
      hud()
    }
    if (phase === 'cleared' && (phaseTime -= s) <= 0) {
      level += 1
      startLevel()
    }
    if (phase !== 'playing') return

    roundTime += s
    if (fright > 0) {
      fright -= s
      if (fright <= 0) ghosts.forEach((g) => (g.frightened = false))
    } else if ((modeTime -= s) <= 0 && modeIndex < SCHEDULE.length - 1) {
      modeIndex += 1
      modeTime = SCHEDULE[modeIndex][1]
      ghosts.forEach((g) => g.state === 'active' && !g.robot && reverse(g))
    }

    if (want && pac.dir !== STOP && want === opposite(pac.dir)) {
      reverse(pac)
      pac.face = pac.dir
    }
    if (pac.dir === STOP && want && open(pac.tx + want.x, pac.ty + want.y)) pac.dir = pac.face = want
    move(pac, (fright > 0 ? 7 : 6.5) * levelSpeed() * s, arrivePac)
    if (phase !== 'playing') return

    for (const g of ghosts) {
      if (g.state === 'house') {
        if (roundTime < g.release) continue
        g.state = 'leaving'
        g.dir = bfsStep(tileOf(g), DOOR_OUT, true)
      }
      if (g.waiting) resolveWait(g)
      move(g, ghostSpeed(g) * s, arriveGhost)
    }
    collide()
  }

  // --- desenho -------------------------------------------------------------

  function label(text, x, y, size, color) {
    ctx.save()
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.font = `700 ${Math.round(size * T)}px ui-sans-serif, system-ui, sans-serif`
    ctx.fillStyle = color
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, (x + 0.5) * T, (y + 0.5) * T)
    ctx.restore()
  }

  function drawMaze() {
    ctx.lineWidth = 0.1
    ctx.strokeStyle = COLORS.edge
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const c = cell(x, y)
        if (c === '-') {
          ctx.fillStyle = COLORS.door
          ctx.fillRect(x - 0.5, y - 0.08, 1, 0.16)
        }
        if (c !== '#') continue
        ctx.fillStyle = COLORS.wall
        ctx.fillRect(x - 0.5, y - 0.5, 1, 1)
        ctx.beginPath()
        for (const d of DIRS) {
          if (isWall(cell(x + d.x, y + d.y))) continue
          const ex = x + d.x * 0.5
          const ey = y + d.y * 0.5
          ctx.moveTo(ex - d.y * 0.5, ey - d.x * 0.5)
          ctx.lineTo(ex + d.y * 0.5, ey + d.x * 0.5)
        }
        ctx.stroke()
      }
    }
    for (const [key, kind] of pellets) {
      const [x, y] = key.split(',').map(Number)
      if (kind === 'o' && Math.floor(time * 4) % 2 && phase === 'playing') continue
      ctx.fillStyle = COLORS.pellet
      ctx.beginPath()
      ctx.arc(x, y, kind === 'o' ? 0.28 : 0.1, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  function drawPac() {
    const x = pac.tx + pac.dir.x * pac.t
    const y = pac.ty + pac.dir.y * pac.t
    const angle = Math.atan2(pac.face.y, pac.face.x)
    let mouth = pac.dir === STOP ? 0.15 : 0.04 + 0.22 * Math.abs(Math.sin(time * 14))
    if (phase === 'dying') mouth = Math.min(1, 0.15 + (1.6 - phaseTime) / 1.3)
    ctx.fillStyle = COLORS.pac
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.arc(x, y, 0.45, angle + mouth * Math.PI, angle + (2 - mouth) * Math.PI)
    ctx.closePath()
    if (mouth < 1) ctx.fill()
  }

  function drawGhost(g) {
    let x = g.tx + g.dir.x * g.t
    let y = g.ty + g.dir.y * g.t
    if (g.state === 'house') y += Math.sin(time * 5 + g.release) * 0.15
    const r = 0.45
    const eyesOnly = g.state === 'eyes'
    const flashing = g.frightened && fright < 2 && Math.floor(time * 6) % 2
    if (!eyesOnly) {
      ctx.fillStyle = g.frightened ? (flashing ? COLORS.flash : COLORS.scared) : g.color
      ctx.beginPath()
      ctx.arc(x, y - 0.05, r, Math.PI, 0)
      const wave = Math.floor(time * 8) % 2 ? 0 : 0.12
      for (let k = 0; k <= 6; k++) ctx.lineTo(x + r - (k * 2 * r) / 6, y + r - ((k + (wave ? 1 : 0)) % 2) * 0.13)
      ctx.closePath()
      ctx.fill()
      if (g.robot) {
        ctx.strokeStyle = ctx.fillStyle
        ctx.lineWidth = 0.07
        ctx.beginPath()
        ctx.moveTo(x, y - r - 0.03)
        ctx.lineTo(x, y - r - 0.25)
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(x, y - r - 0.28, 0.08, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    const look = g.dir === STOP ? DOWN : g.dir
    for (const side of [-1, 1]) {
      const ex = x + side * 0.17
      const ey = y - 0.1
      if (g.frightened) {
        ctx.fillStyle = flashing ? '#ef4444' : '#fde68a'
        ctx.fillRect(ex - 0.05, ey - 0.02, 0.1, 0.1)
        continue
      }
      ctx.fillStyle = 'white'
      ctx.beginPath()
      ctx.ellipse(ex, ey, 0.12, 0.15, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#1e3a8a'
      ctx.beginPath()
      ctx.arc(ex + look.x * 0.05, ey + look.y * 0.06, 0.065, 0, Math.PI * 2)
      ctx.fill()
    }
    if (g.waiting) label('💭', x, y - 1, 0.8, 'white')
  }

  // Setas do 🤖: o comprimento e a opacidade seguem a probabilidade.
  function drawPlan(g) {
    const plan = g.plan?.status === 'ready' && g.plan.probs ? g.plan : g.shown
    if (g.plan?.status === 'pending') {
      const { x, y } = g.plan.tile
      ctx.setLineDash([0.12, 0.12])
      ctx.strokeStyle = 'rgba(74, 222, 128, 0.8)'
      ctx.lineWidth = 0.06
      ctx.beginPath()
      ctx.arc(x, y, 0.42, 0, Math.PI * 2)
      ctx.stroke()
      ctx.setLineDash([])
      label('?', x, y, 0.55, '#4ade80')
    }
    if (!plan?.probs) return
    const { x, y } = plan.tile
    plan.options.forEach((d, i) => {
      const p = plan.probs[i]
      const len = 0.35 + 1.1 * p
      ctx.strokeStyle = ctx.fillStyle = `rgba(74, 222, 128, ${0.25 + 0.75 * p})`
      ctx.lineWidth = 0.14
      ctx.beginPath()
      ctx.moveTo(x + d.x * 0.3, y + d.y * 0.3)
      ctx.lineTo(x + d.x * len, y + d.y * len)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(x + d.x * (len + 0.25), y + d.y * (len + 0.25))
      ctx.lineTo(x + d.x * len - d.y * 0.18, y + d.y * len - d.x * 0.18)
      ctx.lineTo(x + d.x * len + d.y * 0.18, y + d.y * len + d.x * 0.18)
      ctx.fill()
      if (p >= 0.05) label(`${Math.round(p * 100)}%`, x + d.x * (len + 0.75), y + d.y * (len + 0.55), 0.42, 'white')
    })
  }

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.fillStyle = '#070b14'
    ctx.fillRect(0, 0, W * T, H * T)
    ctx.setTransform(dpr * T, 0, 0, dpr * T, dpr * T * 0.5, dpr * T * 0.5)
    drawMaze()
    if (phase !== 'idle' && phase !== 'over') {
      const g = robot()
      if (g) drawPlan(g)
      if (phase !== 'dying') ghosts.forEach(drawGhost)
      drawPac()
    }
    popups.forEach((p) => label(p.text, p.x, p.y, 0.5, '#67e8f9'))
    const banner = paused ? ['PAUSED', '#e5e7eb'] : { idle: ['PRESS START', COLORS.pac], ready: ['READY!', COLORS.pac], over: ['GAME OVER', '#ef4444'], cleared: ['LEVEL CLEAR!', '#4ade80'] }[phase]
    if (banner) label(banner[0], 9, 11, 0.8, banner[1])
  }

  // --- laço e controles ----------------------------------------------------

  const running = () => !paused && ['ready', 'playing', 'dying', 'cleared'].includes(phase)

  function frame(now) {
    raf = 0
    let dt = Math.min(0.05, (now - last) / 1000)
    last = now
    while (dt > 0) {
      const s = Math.min(dt, 1 / 120)
      step(s)
      dt -= s
    }
    draw()
    if (running()) raf = requestAnimationFrame(frame)
  }

  function loop() {
    if (raf || !running()) return
    last = performance.now()
    raf = requestAnimationFrame(frame)
  }

  return {
    get active() {
      return running()
    },
    get phase() {
      return phase
    },
    start() {
      newGame()
      loop()
    },
    setPaused(value) {
      if (!['ready', 'playing', 'dying', 'cleared'].includes(phase) || paused === value) return
      paused = value
      hud()
      draw()
      loop()
    },
    get paused() {
      return paused
    },
    steer(dir) {
      want = dir
    },
    resize(width) {
      T = Math.max(12, Math.min(28, Math.floor(width / W)))
      dpr = window.devicePixelRatio || 1
      canvas.style.width = `${W * T}px`
      canvas.style.height = `${H * T}px`
      canvas.width = W * T * dpr
      canvas.height = H * T * dpr
      draw()
    },
    refresh: report,
  }
}
