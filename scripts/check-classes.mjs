#!/usr/bin/env node
// Confere se toda classe usada nos templates existe no CSS gerado em dist/.
// Pega erros de renomeação de utilitários (ex.: Tailwind v3 -> v4).
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]))
const files = walk('src').filter((f) => /\.(astro|mjs)$/.test(f))
const css = readdirSync('dist/_astro').filter((f) => f.endsWith('.css')).map((f) => readFileSync(join('dist/_astro', f), 'utf8')).join('\n')

const tokens = new Set()
const add = (s) => s.split(/\s+/).forEach((t) => t && !/[{}$]/.test(t) && tokens.add(t))
for (const f of files) {
  const src = readFileSync(f, 'utf8')
  for (const m of src.matchAll(/class="([^"]+)"/g)) add(m[1])
  for (const m of src.matchAll(/class:list=\{\[([\s\S]*?)\]\}/g)) for (const q of m[1].matchAll(/'([^']+)'/g)) add(q[1])
  for (const m of src.matchAll(/@apply ([^;]+);/g)) add(m[1])
}
const escape = (t) => t.replace(/([:/[\]#.()%,!])/g, '\\$1')
const missing = [...tokens].filter((t) => !css.includes('.' + escape(t)))
console.log(`classes usadas: ${tokens.size} | ausentes no CSS: ${missing.length}`)
if (missing.length) {
  console.log(missing.join('\n'))
  process.exit(1)
}
