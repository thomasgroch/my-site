import { describe, it, expect } from 'vitest'
import { narration, frontmatterValue, webvtt } from '../src/lib/narration.js'

const post = (body, front = 'title: Um título\ndescription: A descrição.\nlang: pt') => `---\n${front}\n---\n${body}`
const spoken = (body) => narration(post(body)).text.split('\n\n').slice(2)

describe('narração', () => {
  it('começa pelo título e pela descrição, cada um como frase', () => {
    const { lang, title, text } = narration(post(''))
    expect(lang).toBe('pt')
    expect(title).toBe('Um título')
    expect(text).toBe('Um título.\n\nA descrição.')
  })

  it('lê cabeçalhos e itens de lista como frases, sem emoji nem marcação', () => {
    expect(spoken('## Jogue 🐍\n\n- **🔮 Perguntar antes.** A resposta leva `0,3 s` (⏰).\n- 🧱 Não oferecer becos')).toEqual([
      'Jogue.',
      'Perguntar antes. A resposta leva 0,3 s.',
      'Não oferecer becos.',
    ])
  })

  it('junta as linhas de um parágrafo e de uma citação', () => {
    expect(spoken('Primeira linha\nsegunda linha.\n\n> Uma pergunta\n> em duas linhas?')).toEqual(['Primeira linha segunda linha.', 'Uma pergunta em duas linhas?'])
  })

  it('mantém o texto dos links e descarta URLs soltas e notas de rodapé', () => {
    const { text } = narration(post('Veja [a doc](https://x.dev) em https://x.dev/page e <https://y.dev>[^1].'))
    expect(text).toContain('Veja a doc em e.')
    expect(text).not.toContain('http')
  })

  it('troca código, diagrama e tabela por uma frase só falada', () => {
    const body = '```js\nlet a = 1\n```\n\n```mermaid\nflowchart TD\n```\n\n| a | b |\n| - | - |\n| 1 | 2 |\n\nFim.'
    const { segments } = narration(post(body))
    expect(segments.slice(2)).toEqual([
      { kind: 'aside', text: 'Aqui o post mostra um bloco de código.' },
      { kind: 'aside', text: 'Aqui o post mostra um diagrama.' },
      { kind: 'aside', text: 'Aqui o post mostra uma tabela.' },
      { kind: 'text', text: 'Fim.' },
    ])
  })

  it('ignora imports e linhas de componente, mas lê o comentário de áudio', () => {
    const body = "import Snake from '@/x.astro'\n\n<Wide>\n\n<Snake />\n\n</Wide>\n\n{/* audio: Aqui fica o jogo. */}\n\nTexto."
    const { segments } = narration(post(body))
    expect(segments.slice(2)).toEqual([
      { kind: 'aside', text: 'Aqui fica o jogo.' },
      { kind: 'text', text: 'Texto.' },
    ])
  })

  it('descreve imagens pelo alt e recusa imagem sem alt', () => {
    expect(narration(post('![Uma cobra](../x.png)')).segments.at(-1)).toEqual({ kind: 'aside', text: 'Imagem: Uma cobra.' })
    expect(() => narration(post('![](../x.png)'), { file: 'p.mdx' })).toThrow(/p\.mdx:6: imagem sem alt/)
  })

  it('é determinística', () => {
    const raw = post('## A\n\nTexto com **negrito** e _itálico_.')
    expect(narration(raw)).toEqual(narration(raw))
  })

  it('lê o frontmatter com e sem aspas', () => {
    expect(frontmatterValue('title: "Com: dois pontos"', 'title')).toBe('Com: dois pontos')
    expect(frontmatterValue("title: 'It''s'", 'title')).toBe("It's")
    expect(frontmatterValue('title: Sem aspas', 'title')).toBe('Sem aspas')
    expect(frontmatterValue('title: x', 'lang')).toBeUndefined()
  })
})

describe('webvtt', () => {
  const words = (list) => list.map(([text, start, end]) => ({ text, start, end }))

  it('gera um cue por trecho visível, com o tempo de cada palavra, e pula os trechos só falados', () => {
    const segments = [
      { kind: 'text', text: 'Olá, mundo.' },
      { kind: 'aside', text: 'Aqui o post mostra um diagrama.' },
      { kind: 'text', text: 'Pac-Man (99%) venceu!' },
    ]
    const timed = words([
      ['Olá', 0.1, 0.4],
      ['mundo', 0.5, 0.9],
      ['Aqui', 1, 1.2],
      ['o', 1.2, 1.3],
      ['post', 1.3, 1.5],
      ['mostra', 1.5, 1.8],
      ['um', 1.8, 1.9],
      ['diagrama', 1.9, 2.4],
      ['PacMan', 63, 63.5],
      ['99', 63.5, 63.8],
      ['venceu', 63.8, 64.2],
    ])
    expect(webvtt(segments, timed)).toBe(
      'WEBVTT\n\n' +
        '00:00:00.100 --> 00:00:00.900\n<00:00:00.100>Olá, <00:00:00.500>mundo.\n\n' +
        '00:01:03.000 --> 00:01:04.200\n<00:01:03.000>Pac-Man <00:01:03.500>(99%) <00:01:03.800>venceu!\n'
    )
  })

  it('acusa texto e alinhamento fora de sincronia', () => {
    const segments = [{ kind: 'text', text: 'Um dois três' }]
    expect(() => webvtt(segments, words([['Um', 0, 1], ['três', 1, 2]]))).toThrow(/esperava "dois", veio "três"/)
    expect(() => webvtt(segments, words([['Um', 0, 1], ['dois', 1, 2], ['três', 2, 3], ['quatro', 3, 4]]))).toThrow(/sobrou 1 palavra/)
  })
})
