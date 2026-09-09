#!/usr/bin/env node
// Confere se todo link e recurso interno do build aponta para um arquivo que
// existe. Substitui o plugin netlify-plugin-checklinks: mesmo resultado, sem
// dependência e rodando igual no Mac, no Linux e no build do Netlify.
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import { join, relative, resolve, dirname } from 'node:path'

const DIST = 'dist'

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]))

// Um link interno resolve para o arquivo em si ou para o index.html da pasta.
const resolves = (url) => {
  const clean = decodeURI(url.split(/[?#]/)[0])
  const base = join(DIST, clean)
  for (const candidate of [base, `${base}.html`, join(base, 'index.html')]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return true
  }
  return false
}

const pages = walk(DIST).filter((f) => f.endsWith('.html'))
const problems = []

for (const file of pages) {
  const html = readFileSync(file, 'utf8')
  const refs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((m) => m[1])
  for (const ref of new Set(refs)) {
    if (/^(https?:|mailto:|tel:|data:|#|\/\/)/.test(ref) || ref === '') continue
    // Caminhos relativos são resolvidos a partir da pasta da própria página.
    const url = ref.startsWith('/') ? ref : '/' + relative(DIST, resolve(dirname(file), ref))
    if (!resolves(url)) problems.push(`${relative(DIST, file)} -> ${ref}`)
  }
}

console.log(`páginas: ${pages.length} | links internos quebrados: ${problems.length}`)
if (problems.length) {
  console.log(problems.join('\n'))
  process.exit(1)
}
