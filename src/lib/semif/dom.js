// O que os componentes da demo repetem ao ligar o HTML ao motor.
import { argmax } from './math.js'

// within(card)('[data-x]'): querySelector preso a um elemento.
export const within = (root) => (selector) => root.querySelector(selector)

// announcer(status)(texto, 'ok' | 'error'): a linha de status com o tom.
export const announcer = (status) => (text, kind = '') => {
  status.textContent = text
  status.dataset.kind = kind
}

// Volta cada [data-<key>] ao placeholder.
export const reset = ($, keys, value = '—') => keys.forEach((key) => ($(`[data-${key}]`).textContent = value))

// Barras de probabilidade, uma linha por opção: rótulo, barra e nota, com a
// maior destacada. `name(option, i)` dá a letra; `score(p)` formata a nota.
export function bars(container, options, probabilities, { name = (_, i) => String.fromCharCode(65 + i), score = (p) => p.toFixed(3) } = {}) {
  const best = argmax(probabilities)
  container.replaceChildren(
    ...options.flatMap((option, index) => {
      const label = document.createElement('span')
      label.innerHTML = '<b></b> <small></small>'
      label.querySelector('b').textContent = name(option, index)
      label.querySelector('small').textContent = option
      const bar = document.createElement('div')
      bar.className = 'meter'
      bar.innerHTML = `<i style="width:${Math.max(1, probabilities[index] * 100)}%"></i>`
      const em = document.createElement('em')
      em.textContent = score(probabilities[index])
      if (index === best) em.className = 'semif-top'
      return [label, bar, em]
    })
  )
}

// '↑ 60% · ← 40%', da maior para a menor.
export const odds = (options, probabilities) =>
  options
    .map((d, i) => [d, probabilities[i]])
    .sort((a, b) => b[1] - a[1])
    .map(([d, p]) => `${d.arrow} ${Math.round(p * 100)}%`)
    .join(' · ')
