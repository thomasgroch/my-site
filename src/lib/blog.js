// Funções do blog sem dependência do Astro, para poderem ser testadas em Node
// (test/blog.test.js).
import { readdirSync, readFileSync } from 'node:fs'
import { basename, extname, join } from 'node:path'
import { frontmatterValue, splitFrontmatter } from './narration.js'

const WORDS_PER_MINUTE = 220

// Rascunhos (`draft: true`) são publicados, mas não listados: a URL responde
// (com noindex, ver [slug].astro), e o post fica fora da lista, do feed e do
// sitemap. No `astro dev` a lista os mostra, para achá-los.
export function isListed(post) {
  return Boolean(import.meta.env?.DEV) || !post.data.draft
}

// Slugs dos rascunhos, lidos do disco: o sitemap é montado em astro.config.mjs,
// antes de as coleções existirem.
export function draftSlugs(dir = 'src/content/blog') {
  return readdirSync(dir)
    .filter((name) => ['.md', '.mdx'].includes(extname(name)))
    .filter((name) => frontmatterValue(splitFrontmatter(readFileSync(join(dir, name), 'utf8')).frontmatter, 'draft') === 'true')
    .map((name) => basename(name, extname(name)))
    .sort()
}

export function byNewest(a, b) {
  return b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
}

// Minutos de leitura a partir do texto do post. Marcação, componentes MDX e
// imagens não contam; o texto dos links conta.
export function readingTime(body = '') {
  const text = String(body)
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~|-]/g, ' ')
  const words = text.split(/\s+/).filter(Boolean).length
  return { words, minutes: Math.max(1, Math.ceil(words / WORDS_PER_MINUTE)) }
}

// Partes da série de `post`, na ordem de `seriesPart` e, no empate, da data.
// Vazio quando o post não faz parte de uma série. Outras partes em rascunho
// ficam de fora (não estão listadas); o próprio post entra mesmo em rascunho.
export function seriesOf(post, posts = []) {
  const name = post.data.series
  if (!name) return []
  const part = (entry) => entry.data.seriesPart ?? Infinity
  return posts
    .filter((entry) => entry.data.series === name && (entry.id === post.id || !entry.data.draft))
    .sort((a, b) => part(a) - part(b) || a.data.pubDate - b.data.pubDate)
}

// Sumário a partir dos títulos que o Astro extrai do post: só h2 e h3.
export function tableOfContents(headings = []) {
  return headings.filter((heading) => heading.depth === 2 || heading.depth === 3)
}

export function formatDate(date) {
  return date.toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })
}
