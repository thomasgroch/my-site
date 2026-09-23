#!/usr/bin/env node
// Confere se toda classe usada nos templates existe no CSS gerado em dist/.
// Pega erros de renomeação de utilitários (ex.: Tailwind v3 -> v4).
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

// Classes que existem só como gancho de JS/teste e nunca são estilizadas.
const HOOKS = new Set(['locale-link'])
// Um nome de classe começa com letra/dígito; descarta caminhos e operadores
// que aparecem dentro de expressões em `class:list`.
const CLASS_NAME = /^[a-zA-Z0-9][\w:./[\]#()%,!-]*$/

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]))
const files = walk('src').filter((f) => /\.(astro|mjs)$/.test(f))
const css = readdirSync('dist/_astro')
  .filter((f) => f.endsWith('.css'))
  .map((f) => readFileSync(join('dist/_astro', f), 'utf8'))
  .join('\n')
// CSS escrito à mão num <style> de componente também conta: o de um post só
// chega ao dist/ quando existe post publicado.
const ownCss = files
  .filter((f) => f.endsWith('.astro'))
  .flatMap((f) => [...readFileSync(f, 'utf8').matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]))
  .join('\n')

const tokens = new Set()
const add = (value) =>
  String(value)
    .split(/\s+/)
    .forEach((t) => t && !HOOKS.has(t) && CLASS_NAME.test(t) && tokens.add(t))

for (const file of files) {
  const src = readFileSync(file, 'utf8')
  for (const m of src.matchAll(/class="([^"]+)"/g)) add(m[1])
  for (const m of src.matchAll(/@apply ([^;]+);/g)) add(m[1])
  // class:list={[ 'a b', { 'c d': cond, invisible: cond } ]}
  for (const m of src.matchAll(/class:list=\{\[([\s\S]*?)\]\}/g)) {
    for (const q of m[1].matchAll(/'([^']+)'\s*(:?)/g)) if (!q[1].startsWith('/')) add(q[1])
    for (const k of m[1].matchAll(/[{,]\s*([A-Za-z][\w-]*)\s*:/g)) add(k[1])
  }
}

const escape = (t) => t.replace(/([:/[\]#.()%,!])/g, '\\$1')
const missing = [...tokens].filter((t) => !(css + ownCss).includes('.' + escape(t)))
console.log(`classes usadas: ${tokens.size} | ausentes no CSS: ${missing.length}`)
if (missing.length) {
  console.log(missing.join('\n'))
  process.exit(1)
}
