#!/usr/bin/env node
// Peso sem compressão de cada página do build: HTML + CSS + JS + imagens locais
// referenciadas. É a métrica do 512KB Club (verde < 100KB, laranja < 250KB,
// azul < 512KB). Sai com código 1 se alguma página passar de 512KB.
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const DIST = 'dist'
const LIMIT = 512 * 1024
const TIERS = [
  [100, 'verde'],
  [250, 'laranja'],
  [512, 'azul'],
]

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)]
  )
const size = (file) => {
  try {
    return statSync(file).size
  } catch {
    return 0
  }
}
const localPath = (url) => (url.startsWith('/') && !url.startsWith('//') ? join(DIST, url.split(/[?#]/)[0]) : null)

const rows = walk(DIST)
  .filter((file) => file.endsWith('.html'))
  .map((file) => {
    const html = readFileSync(file, 'utf8')
    const pick = (re) => [...html.matchAll(re)].map((m) => m[1])
    const css = pick(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)
    const js = pick(/<script[^>]+src="([^"]+)"/g)
    const img = pick(/<img[^>]+src="([^"]+)"/g)
    const external = [...css, ...js, ...img].filter((u) => /^https?:\/\//.test(u))
    const sum = (urls) => [...new Set(urls)].map(localPath).filter(Boolean).reduce((acc, p) => acc + size(p), 0)
    const parts = { html: size(file), css: sum(css), js: sum(js), img: sum(img) }
    const total = Object.values(parts).reduce((a, b) => a + b, 0)
    const page = '/' + relative(DIST, file).replace(/index\.html$/, '').replace(/\.html$/, '')
    return { page, ...parts, total, external: external.length }
  })
  .sort((a, b) => b.total - a.total)

const kb = (n) => (n / 1024).toFixed(1).padStart(7)
console.log(`${'página'.padEnd(16)}    html     css      js     img   total  faixa`)
for (const r of rows) {
  const tier = TIERS.find(([max]) => r.total <= max * 1024)?.[1] ?? 'ACIMA DO LIMITE'
  const ext = r.external ? ` (+${r.external} externo)` : ''
  console.log(`${r.page.padEnd(16)} ${kb(r.html)} ${kb(r.css)} ${kb(r.js)} ${kb(r.img)} ${kb(r.total)}  ${tier}${ext}`)
}

const over = rows.filter((r) => r.total > LIMIT)
if (over.length) {
  console.error(`\n${over.length} página(s) acima de 512KB: ${over.map((r) => r.page).join(', ')}`)
  process.exit(1)
}
