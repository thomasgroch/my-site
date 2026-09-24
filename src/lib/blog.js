// Funções puras do blog, sem dependência do Astro, para poderem ser testadas
// em Node (test/blog.test.js).

const WORDS_PER_MINUTE = 220

// Rascunhos aparecem no `astro dev`. No build de produção ficam de fora, a
// menos que se peça explicitamente: BLOG_DRAFTS=1 npm run build.
export function includeDrafts() {
  return Boolean(import.meta.env?.DEV) || process.env.BLOG_DRAFTS === '1'
}

export function isVisible(post) {
  return includeDrafts() || !post.data.draft
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
// Vazio quando o post não faz parte de uma série.
export function seriesOf(post, posts = []) {
  const name = post.data.series
  if (!name) return []
  const part = (entry) => entry.data.seriesPart ?? Infinity
  return posts
    .filter((entry) => entry.data.series === name)
    .sort((a, b) => part(a) - part(b) || a.data.pubDate - b.data.pubDate)
}

// Sumário a partir dos títulos que o Astro extrai do post: só h2 e h3.
export function tableOfContents(headings = []) {
  return headings.filter((heading) => heading.depth === 2 || heading.depth === 3)
}

export function formatDate(date) {
  return date.toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })
}
