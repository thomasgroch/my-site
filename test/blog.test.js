import { describe, it, expect } from 'vitest'
import { byNewest, formatDate, readingTime, tableOfContents } from '../src/lib/blog.js'

describe('tempo de leitura', () => {
  it('tem mínimo de um minuto', () => {
    expect(readingTime('').minutes).toBe(1)
    expect(readingTime(undefined).minutes).toBe(1)
  })

  it('arredonda para cima a 220 palavras por minuto', () => {
    expect(readingTime(Array(220).fill('word').join(' '))).toEqual({ words: 220, minutes: 1 })
    expect(readingTime(Array(221).fill('word').join(' '))).toEqual({ words: 221, minutes: 2 })
  })

  it('ignora marcação, imagens e tags de componente, mas conta o texto dos links', () => {
    const body = '## Title\n\n<Callout type="tip">Use it</Callout>\n\n![alt text](../x.png) see [the docs](https://x.dev)'
    expect(readingTime(body).words).toBe(6)
  })
})

describe('sumário', () => {
  it('fica só com h2 e h3, na ordem do texto', () => {
    const headings = [
      { depth: 1, slug: 'a', text: 'A' },
      { depth: 2, slug: 'b', text: 'B' },
      { depth: 3, slug: 'c', text: 'C' },
      { depth: 4, slug: 'd', text: 'D' },
      { depth: 2, slug: 'e', text: 'E' },
    ]
    expect(tableOfContents(headings).map((h) => h.slug)).toEqual(['b', 'c', 'e'])
  })
})

describe('ordenação e datas', () => {
  const post = (date) => ({ data: { pubDate: new Date(date) } })

  it('posts mais recentes primeiro', () => {
    const sorted = [post('2026-01-01'), post('2026-06-01'), post('2025-12-31')].sort(byNewest)
    expect(sorted.map((p) => p.data.pubDate.toISOString().slice(0, 10))).toEqual(['2026-06-01', '2026-01-01', '2025-12-31'])
  })

  it('formata em inglês sem deslocar o dia pelo fuso horário', () => {
    expect(formatDate(new Date('2026-09-14'))).toBe('September 14, 2026')
  })
})
