// Cobrinha jogada pelo modelo. Como o fantasma do Pac-Man, ela pergunta com
// antecedência: escolhe a casa onde vai precisar decidir (alinhada com a
// comida, ou a última antes de um obstáculo), a alguns passos de distância
// conforme a latência medida, e segue reto até lá. Se a resposta não chegou
// quando a cabeça chega, ela continua reto; só desvia sozinha, por reflexo,
// quando a casa da frente mata. Você pode assumir o controle a
// qualquer momento. Sem modelo, ela vira ao acaso entre as casas livres.
//
// A leitura é a calibrada do engine.js: sem ela, um modelo pequeno escolhe
// sempre a primeira opção e a cobra sobe até a parede.
import { calibrated, warmUp, status as brain } from './engine.js'
import { createLearner, sample } from './learner.js'
import { DIRS, RIGHT, add, opposite as back, randomOf, same, whereIs } from './grid.js'
import { createLoop } from './arcade.js'
import { argmax } from './math.js'

export { DIRECTIONS } from './grid.js'

const N = 15
// Passos por segundo: o controle de velocidade vai de SPEEDS.min a SPEEDS.max.
export const SPEEDS = { min: 2, max: 20, initial: 3 }
const RESTART = 2

const COLORS = { board: '#070b14', grid: '#111a2e', wall: '#1e3a8a', body: '#22c55e', head: '#86efac', you: '#facc15', food: '#ef4444', arrow: '#4ade80' }

// Cada motor lê melhor um jeito de perguntar. O LLM responde a um pedido
// ("para que lado você vai?"); o Laya, um encoder, acerta mais quando a
// pergunta é sobre o que o texto diz ("onde está a maçã?"): 36 de 36 contra
// 20 de 36 com o pedido do LLM. `neutral` é o pedido sem a posição da comida,
// que mede o viés de posição (engine.js).
const PROMPTS = {
  wllama: {
    state: (where) => `You are a snake in a game of Snake. The food is ${where} from your head. You want to eat it.`,
    neutral: 'You are a snake in a game of Snake. The food is somewhere on the board. You want to eat it.',
    question: 'Which way takes you toward the food?',
    option: (d) => d.name,
  },
  laya: {
    state: (where) => `Snake game. The apple is ${where} from the snake.`,
    neutral: 'Snake game. The apple is somewhere on the board.',
    question: 'Where is the apple?',
    option: (d) => ({ Up: 'up', Down: 'down', Left: 'to the left', Right: 'to the right' })[d.name],
  },
}
const promptOf = () => PROMPTS[brain.runtime] ?? PROMPTS.wllama

// Folga sobre a latência média ao escolher a que distância perguntar.
const MARGIN = 1.25

export function createGame(canvas, { onHud, onRobot, onLearn = () => {} }) {
  const ctx = canvas.getContext('2d')
  let T = 20
  let dpr = 1
  let clock = 0
  let phase = 'idle'
  let paused = false
  let pilot = 'model'
  let stepTime = 1 / SPEEDS.initial
  let snake = []
  let dir = RIGHT
  let want = null
  let food = null
  let score = 0
  let best = 0
  let games = 0
  let death = null
  let plan = null
  let measured = null
  // Aprendizado (learner.js): desligado, a cobra joga só com o modelo.
  let learning = false
  let learner = null
  let credit = null
  const stats = { decisions: 0, totalMs: 0, waitMs: 0, late: 0, reflex: 0, last: null }

  const head = () => snake[0]
  const hud = () => onHud({ score, best, games, phase, paused, pilot, death })
  const showLearning = () => onLearn({ on: learning, weights: learner?.weights ?? null, games: learner?.games ?? [] })
  const report = () => onRobot({ ...stats, brain: brain.state === 'ready' ? brain.name : null, pending: plan?.status === 'pending', ahead: ahead(), pilot })

  // O rabo sai da casa no mesmo passo, então não conta como obstáculo.
  function hazard(tile, body = snake) {
    if (tile.x < 0 || tile.y < 0 || tile.x >= N || tile.y >= N) return 'a wall'
    if (body.slice(0, -1).some((part) => same(part, tile))) return 'your own body'
    return null
  }

  // Quantas casas livres dá para alcançar a partir de `start`.
  function room(start, body) {
    const blocked = new Set(body.slice(0, -1).map((part) => part.y * N + part.x))
    const seen = new Set([start.y * N + start.x])
    const queue = [start]
    for (const tile of queue) {
      for (const d of DIRS) {
        const next = add(tile, d)
        const key = next.y * N + next.x
        if (next.x < 0 || next.y < 0 || next.x >= N || next.y >= N || blocked.has(key) || seen.has(key)) continue
        seen.add(key)
        queue.push(next)
      }
    }
    return seen.size
  }

  // As direções que o modelo pode escolher com a cabeça em `body[0]`: livres,
  // nunca a volta, e sem entrar num bolsão menor que a própria cobra. Se
  // todas levam a um bolsão, sobra a de mais espaço. Vêm com o espaço de cada.
  function openDirections(body, heading) {
    const moves = DIRS.filter((d) => d !== back(heading) && !hazard(add(body[0], d), body)).map((d) => {
      const next = add(body[0], d)
      return { d, space: room(next, [next, ...body].slice(0, body.length)) }
    })
    const enough = moves.filter((move) => move.space >= body.length)
    const most = Math.max(...moves.map((move) => move.space))
    return enough.length ? enough : moves.filter((move) => move.space === most)
  }

  function placeFood() {
    const free = []
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (!snake.some((part) => same(part, { x, y }))) free.push({ x, y })
    food = free.length ? randomOf(free) : null
  }

  function newGame() {
    const y = Math.floor(N / 2)
    snake = [4, 3, 2].map((x) => ({ x, y }))
    dir = RIGHT
    want = null
    score = 0
    death = null
    plan = null
    credit = null
    stats.last = null
    placeFood()
    phase = 'playing'
    clock = 0
    hud()
    report()
    think()
  }

  // --- o modelo ------------------------------------------------------------

  // Quantos passos a cobra anda enquanto espera uma resposta.
  function ahead() {
    const ms = stats.decisions ? stats.waitMs / stats.decisions : 700
    return Math.max(1, Math.ceil((ms * MARGIN) / 1000 / stepTime))
  }

  // A casa da próxima decisão, seguindo reto: longe o bastante para a
  // resposta chegar, e de preferência onde a cobra se alinha com a comida.
  // Um obstáculo antes disso antecipa a decisão. Com a comida no caminho não
  // há o que decidir até comer.
  function decisionTile() {
    const reach = ahead()
    const path = []
    let tile = head()
    for (let n = 1; ; n++) {
      const next = add(tile, dir)
      if (hazard(next)) break
      if (same(next, food)) return null
      tile = next
      path.unshift(tile)
      const toAlign = (food.x - tile.x) * dir.x + (food.y - tile.y) * dir.y
      if (n >= reach && toAlign <= 0) break
    }
    // O corpo como vai estar quando a cabeça chegar lá.
    return { tile, body: [...path, ...snake].slice(0, snake.length) }
  }

  function promptFor(tile, options) {
    const prompt = promptOf()
    return {
      state: prompt.state(whereIs(food.x - tile.x, food.y - tile.y)),
      question: prompt.question,
      options: options.map(prompt.option),
      neutral: { state: prompt.neutral },
    }
  }

  function think() {
    if (plan || phase !== 'playing' || pilot !== 'model' || brain.state !== 'ready' || !food) return
    const spot = decisionTile()
    if (!spot) return
    const { tile } = spot
    const moves = openDirections(spot.body, dir)
    const options = moves.map((move) => move.d)
    if (!options.length) return
    const next = { tile, options, status: 'pending' }
    plan = next
    if (options.length === 1) {
      Object.assign(next, { status: 'ready', choice: options[0], probs: null })
      return report()
    }
    const asked = performance.now()
    calibrated(promptFor(tile, options)).then(
      ({ probabilities: probs, totalMs }) => {
        if (plan !== next) return
        Object.assign(next, { status: 'ready', choice: options[argmax(probs)], probs, modelProbs: probs, ms: totalMs })
        if (learning && learner) {
          // A camada decide: a opinião do modelo vira um sinal entre quatro.
          const distance = (tile) => Math.abs(food.x - tile.x) + Math.abs(food.y - tile.y)
          const rows = moves.map(({ d, space }, i) => ({
            model: Math.max(-6, Math.log(probs[i] + 1e-9)),
            food: Math.sign(distance(tile) - distance(add(tile, d))),
            room: Math.min(1, space / (2 * spot.body.length)),
            straight: d === dir ? 1 : 0,
          }))
          const chosen = learner.policy(rows)
          const index = sample(chosen)
          Object.assign(next, { choice: options[index], probs: chosen, learn: { rows, probs: chosen, chosen: index } })
        }
        stats.decisions += 1
        stats.totalMs += totalMs
        stats.waitMs += performance.now() - asked
        stats.last = next
        report()
        if (loop.idle) draw()
      },
      () => {
        if (plan === next) plan = null
        report()
      }
    )
    report()
  }

  // --- regras --------------------------------------------------------------

  function advance() {
    if (pilot === 'model' && brain.state !== 'ready') {
      // Sem cérebro: uma casa livre ao acaso, de preferência a da frente.
      const safe = DIRS.filter((d) => d !== back(dir) && !hazard(add(head(), d)))
      if (safe.length && (!safe.includes(dir) || Math.random() < 0.25)) want = randomOf(safe)
    } else if (pilot === 'model' && plan && same(head(), plan.tile)) {
      // Chegou à casa da decisão. Sem resposta, segue reto e pergunta de novo.
      if (plan.status === 'ready') {
        want = plan.choice
        settle(0)
        if (plan.learn) credit = { ...plan.learn, distance: distanceToFood(), steps: 0 }
      } else stats.late += 1
      plan = null
    }
    if (want && want !== back(dir)) dir = want
    want = null
    // Reflexo: a resposta não veio e a casa da frente mata. A cobra desvia
    // sozinha para o lado de mais espaço, e isso fica contado no painel.
    if (pilot === 'model' && brain.state === 'ready' && hazard(add(head(), dir))) {
      const [escape] = openDirections(snake, dir).sort((a, b) => b.space - a.space)
      if (escape) {
        dir = escape.d
        plan = null
        stats.reflex += 1
      }
    }
    const next = add(head(), dir)
    const hit = hazard(next)
    if (hit) return die(hit)
    snake.unshift(next)
    if (credit) credit.steps += 1
    if (food && same(next, food)) {
      settle(1)
      score += 1
      best = Math.max(best, score)
      placeFood()
      if (!food) return die(null)
    } else {
      snake.pop()
    }
    hud()
    think()
  }

  const distanceToFood = () => (food ? Math.abs(food.x - head().x) + Math.abs(food.y - head().y) : 0)

  // Fecha a conta da última decisão: +1 se comeu, −1 se morreu, e no meio um
  // pouco pelo quanto a cobra chegou mais perto da comida por passo.
  function settle(bonus) {
    if (!credit) return
    const closer = (credit.distance - distanceToFood()) / Math.max(1, credit.steps)
    const reward = bonus || 0.3 * Math.max(-1, Math.min(1, closer))
    learner.learn(credit.rows, credit.probs, credit.chosen, reward)
    credit = null
    showLearning()
  }

  function die(cause) {
    settle(-1)
    if (learning && learner && pilot === 'model' && brain.state === 'ready') {
      learner.endGame(score)
      showLearning()
    }
    phase = 'over'
    clock = 0
    games += 1
    death = cause
    plan = null
    hud()
    report()
  }

  function step(dt) {
    clock += dt
    if (phase === 'over') {
      // Assistindo, a próxima partida começa sozinha.
      if (pilot === 'model' && clock >= RESTART) newGame()
      return
    }
    while (phase === 'playing' && clock >= stepTime) {
      clock -= stepTime
      advance()
    }
  }

  // --- desenho -------------------------------------------------------------

  function label(text, y, size, color) {
    ctx.font = `700 ${size}px ui-monospace, monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.lineWidth = size * 0.3
    ctx.strokeStyle = COLORS.board
    ctx.strokeText(text, N / 2, y)
    ctx.fillStyle = color
    ctx.fillText(text, N / 2, y)
  }

  // Na casa da decisão: um ? enquanto o modelo pensa, depois as setas com o
  // tamanho da probabilidade de cada direção.
  function drawPlan() {
    if (!plan || pilot !== 'model') return
    const cx = plan.tile.x + 0.5
    const cy = plan.tile.y + 0.5
    ctx.strokeStyle = ctx.fillStyle = COLORS.arrow
    if (plan.status === 'pending') {
      ctx.lineWidth = 0.06
      ctx.setLineDash([0.16, 0.12])
      ctx.strokeRect(plan.tile.x + 0.1, plan.tile.y + 0.1, 0.8, 0.8)
      ctx.setLineDash([])
      ctx.font = '700 0.6px ui-monospace, monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('?', cx, cy + 0.03)
      return
    }
    plan.options.forEach((d, i) => {
      const p = plan.probs ? plan.probs[i] : 1
      if (p < 0.03) return
      const length = 0.7 + p * 1.6
      ctx.globalAlpha = 0.35 + p * 0.65
      ctx.lineWidth = 0.08 + p * 0.14
      ctx.beginPath()
      ctx.moveTo(cx + d.x * 0.3, cy + d.y * 0.3)
      ctx.lineTo(cx + d.x * length, cy + d.y * length)
      ctx.stroke()
      const tip = { x: cx + d.x * (length + 0.25), y: cy + d.y * (length + 0.25) }
      const wing = 0.14 + p * 0.16
      ctx.beginPath()
      ctx.moveTo(tip.x, tip.y)
      ctx.lineTo(tip.x - d.x * wing * 1.6 - d.y * wing, tip.y - d.y * wing * 1.6 - d.x * wing)
      ctx.lineTo(tip.x - d.x * wing * 1.6 + d.y * wing, tip.y - d.y * wing * 1.6 + d.x * wing)
      ctx.fill()
    })
    ctx.globalAlpha = 1
  }

  function draw() {
    const size = (N + 1) * T
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.fillStyle = COLORS.wall
    ctx.fillRect(0, 0, size, size)
    ctx.setTransform(dpr * T, 0, 0, dpr * T, dpr * T * 0.5, dpr * T * 0.5)
    ctx.fillStyle = COLORS.board
    ctx.fillRect(0, 0, N, N)
    ctx.strokeStyle = COLORS.grid
    ctx.lineWidth = 0.03
    ctx.beginPath()
    for (let i = 1; i < N; i++) {
      ctx.moveTo(i, 0)
      ctx.lineTo(i, N)
      ctx.moveTo(0, i)
      ctx.lineTo(N, i)
    }
    ctx.stroke()

    if (phase !== 'idle') {
      if (food) {
        ctx.fillStyle = COLORS.food
        ctx.beginPath()
        ctx.arc(food.x + 0.5, food.y + 0.5, 0.32, 0, Math.PI * 2)
        ctx.fill()
      }
      snake.forEach((part, i) => {
        ctx.globalAlpha = phase === 'over' ? 0.45 : 1
        ctx.fillStyle = i === 0 ? (pilot === 'you' ? COLORS.you : COLORS.head) : COLORS.body
        ctx.beginPath()
        ctx.roundRect(part.x + 0.07, part.y + 0.07, 0.86, 0.86, 0.22)
        ctx.fill()
      })
      ctx.globalAlpha = 1
      // Olhos na direção do movimento.
      ctx.fillStyle = COLORS.board
      for (const side of [-1, 1]) {
        ctx.beginPath()
        ctx.arc(head().x + 0.5 + dir.x * 0.18 + dir.y * side * 0.2, head().y + 0.5 + dir.y * 0.18 + dir.x * side * 0.2, 0.08, 0, Math.PI * 2)
        ctx.fill()
      }
      if (phase === 'playing') drawPlan()
    }

    const banner = paused ? ['PAUSED', '#e5e7eb'] : { idle: ['PRESS START', COLORS.head], over: [food ? 'GAME OVER' : 'BOARD FULL!', food ? COLORS.food : COLORS.arrow] }[phase]
    if (banner) label(banner[0], N / 2, 1.1, banner[1])
  }

  // --- laço e controles ----------------------------------------------------

  const running = () => !paused && (phase === 'playing' || (phase === 'over' && pilot === 'model'))
  const loop = createLoop({ running, step, draw })

  function setPilot(value) {
    if (pilot === value) return
    pilot = value
    want = null
    plan = null
    credit = null
    hud()
    report()
    think()
    draw()
    loop.start()
  }

  return {
    get active() {
      return running()
    },
    get paused() {
      return paused
    },
    get pilot() {
      return pilot
    },
    start() {
      newGame()
      draw()
      loop.start()
    },
    setPaused(value) {
      if (phase !== 'playing' || paused === value) return
      paused = value
      hud()
      draw()
      loop.start()
    },
    setPilot,
    setLearning(value) {
      learning = value
      credit = null
      showLearning()
    },
    forget() {
      learner?.forget()
      credit = null
      showLearning()
    },
    // Mais rápido, o modelo tem menos tempo: pergunta de mais longe, faz
    // curvas mais abertas e chega atrasado mais vezes.
    setSpeed(stepsPerSecond) {
      stepTime = 1 / Math.max(SPEEDS.min, Math.min(SPEEDS.max, stepsPerSecond))
      report()
    },
    // Qualquer comando seu tira o modelo do volante.
    steer(next) {
      if (phase !== 'playing') return
      setPilot('you')
      want = next
    },
    resize(width) {
      T = Math.max(12, Math.min(30, Math.floor(width / (N + 1))))
      dpr = window.devicePixelRatio || 1
      canvas.style.width = canvas.style.height = `${(N + 1) * T}px`
      canvas.width = canvas.height = (N + 1) * T * dpr
      draw()
    },
    // O modelo acabou de carregar (ou trocar): mede o viés antes da primeira
    // curva e volta a perguntar.
    refresh() {
      // Modelo novo: as médias do anterior não valem para ele.
      if (brain.state === 'ready' && brain.modelId !== measured) {
        measured = brain.modelId
        Object.assign(stats, { decisions: 0, totalMs: 0, waitMs: 0, late: 0, reflex: 0, last: null })
        plan = null
        // Cada modelo tem a sua camada: o que vale para um não vale para outro.
        learner = createLearner(`semif-snake-learner:${brain.modelId}`)
        credit = null
        showLearning()
      }
      if (brain.state === 'ready') {
        const prompt = promptOf()
        for (const count of [3, 2]) warmUp({ state: prompt.neutral, question: prompt.question, options: DIRS.slice(0, count).map(prompt.option), neutral: { state: prompt.neutral } })
      }
      report()
      think()
    },
  }
}
