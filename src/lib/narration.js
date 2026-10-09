// Texto de narração de um post, a partir do arquivo MDX cru. Determinístico:
// o mesmo arquivo sempre dá o mesmo texto, e é o hash desse texto que o
// scripts/narrate.mjs compara para saber se o áudio ficou velho. Sem
// dependências, no mesmo espírito do readingTime em blog.js.
//
// O que é lido: título, descrição, cabeçalhos, parágrafos, citações e itens de
// lista, na ordem do texto. Imagens viram "Imagem: <alt>". Blocos de código,
// diagramas e tabelas viram uma frase fixa. Linhas de componente (<Snake />),
// imports e URLs soltas são ignorados. Um comentário `{/* audio: ... */}` vira
// fala que não aparece na página, útil para descrever uma demo.
//
// Cada trecho tem um `kind`: 'text' está na página e entra no WebVTT do
// karaokê; 'aside' só é falado (frases fixas, imagens, comentários de áudio).

const PHRASES = {
  pt: {
    image: 'Imagem:',
    code: 'Aqui o post mostra um bloco de código.',
    diagram: 'Aqui o post mostra um diagrama.',
    table: 'Aqui o post mostra uma tabela.',
  },
}

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/
const AUDIO_NOTE_RE = /^\{\/\*\s*audio:\s*([\s\S]*?)\s*\*\/\}$/
const EMOJI_RE = /\p{Extended_Pictographic}|\p{Emoji_Modifier}|️|‍|⃣/gu

export function splitFrontmatter(raw) {
  const match = raw.match(FRONTMATTER_RE)
  if (!match) return { frontmatter: '', body: raw }
  return { frontmatter: match[1], body: raw.slice(match[0].length) }
}

// Valor escalar do frontmatter, com ou sem aspas. Basta para title,
// description e lang; o esquema de verdade é o do Astro (src/content.config.js).
export function frontmatterValue(frontmatter, key) {
  const line = frontmatter.match(new RegExp(`^${key}:[ \\t]*(.*)$`, 'm'))?.[1]?.trim()
  if (!line) return undefined
  if (line.startsWith('"') && line.endsWith('"')) return line.slice(1, -1).replace(/\\"/g, '"')
  if (line.startsWith("'") && line.endsWith("'")) return line.slice(1, -1).replace(/''/g, "'")
  return line
}

const stripTags = (text) => text.replace(/<[^>]+>/g, ' ')

// Texto corrido de uma linha de Markdown: tira marcação, links viram o seu
// texto, imagens viram descrição. `where` só serve para a mensagem de erro.
function inline(text, phrases, where) {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, (_, alt) => {
      if (!alt.trim()) throw new Error(`${where}: imagem sem alt. Descreva a imagem no alt para ela ser narrada.`)
      return ` ${phrases.image} ${alt.trim()}. `
    })
    .replace(/\[\^[^\]]+\]/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<https?:\/\/[^>]+>/g, '')
    .replace(/(?:https?:\/\/|www\.)\S+/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\*\*|__|~~|`/g, '')
    .replace(/\*/g, '')
    .replace(/\b_|_\b/g, '')
    .replace(EMOJI_RE, '')
    .replace(/\(\s*\)/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,;:!?)])/g, '$1')
    .trim()
}

// Cabeçalhos e itens de lista viram uma frase, para a voz fazer a pausa.
const sentence = (text) => (text && !/[.!?:…]$/.test(text) ? `${text}.` : text)

/** @returns {{ lang: string, title: string, segments: {kind: 'text'|'aside', text: string}[], text: string, chars: number }} */
export function narration(raw, { file = 'post' } = {}) {
  const { frontmatter, body } = splitFrontmatter(raw)
  const lang = frontmatterValue(frontmatter, 'lang') ?? 'en'
  const phrases = PHRASES[lang] ?? PHRASES.pt
  const title = inline(frontmatterValue(frontmatter, 'title') ?? '', phrases, file)
  if (!title) throw new Error(`${file}: post sem título.`)

  const segments = [{ kind: 'text', text: sentence(title) }]
  const push = (text, kind = 'text') => {
    if (text && text !== segments[segments.length - 1].text) segments.push({ kind, text })
  }
  push(sentence(inline(frontmatterValue(frontmatter, 'description') ?? '', phrases, file)))

  let paragraph = []
  let paragraphAt = file // linha em que o parágrafo começou, para o erro
  let fence = null
  let inTable = false
  const flush = () => {
    if (paragraph.length) {
      const text = paragraph.join(' ')
      // Parágrafo que é só uma imagem não está na página como texto.
      push(inline(text, phrases, paragraphAt), /^!\[[^\]]*\]\([^)]*\)$/.test(text) ? 'aside' : 'text')
    }
    paragraph = []
  }

  // Linhas que o frontmatter ocupa, para o erro apontar a linha certa do arquivo.
  const offset = raw.slice(0, raw.length - body.length).split('\n').length - 1
  const lines = body.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const where = `${file}:${i + 1 + offset}`
    const trimmed = lines[i].trim()

    if (fence !== null) {
      if (/^```/.test(trimmed)) fence = null
      continue
    }
    const open = trimmed.match(/^```(\w*)/)
    if (open) {
      flush()
      push(open[1] === 'mermaid' ? phrases.diagram : phrases.code, 'aside')
      fence = open[1]
      continue
    }
    if (trimmed === '') {
      flush()
      inTable = false
      continue
    }
    if (trimmed.startsWith('|')) {
      flush()
      if (!inTable) push(phrases.table, 'aside')
      inTable = true
      continue
    }
    const note = trimmed.match(AUDIO_NOTE_RE)
    if (note) {
      flush()
      push(inline(note[1], phrases, where), 'aside')
      continue
    }
    if (/^(import|export)\s/.test(trimmed) || /^---+$/.test(trimmed)) continue
    // Linha só de tags (<Wide>, <ModelLoader prefer="fast" />): nada a dizer.
    if (trimmed.startsWith('<') && !stripTags(trimmed).trim()) continue

    const heading = trimmed.match(/^#{1,6}\s+(.*)$/)
    if (heading) {
      flush()
      push(sentence(inline(heading[1], phrases, where)))
      continue
    }
    const item = trimmed.match(/^(?:[-*+]|\d+[.)])\s+(.*)$/)
    if (item) {
      flush()
      push(sentence(inline(item[1], phrases, where)))
      continue
    }
    if (!paragraph.length) paragraphAt = where
    paragraph.push(trimmed.replace(/^>\s?/, ''))
  }
  flush()

  const text = segments.map((segment) => segment.text).join('\n\n')
  return { lang, title, segments, text, chars: text.length }
}

// Mesma normalização que o transcript-tracer usa para casar palavras.
export const comparable = (word) =>
  word
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^\p{L}\p{N}]/gu, '')

const stamp = (seconds) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = (seconds % 60).toFixed(3).padStart(6, '0')
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${s}`
}

// WebVTT para o karaokê (public/vendor/transcript-tracer.js): um cue por
// trecho visível, com o tempo de cada palavra. `words` é a lista do alinhador
// para o texto inteiro, na ordem, com {text, start, end} em segundos. Trechos
// 'aside' consomem palavras mas não viram cue: o tracer só tolera cinco
// palavras seguidas que estejam no áudio e não na página.
export function webvtt(segments, words) {
  let next = 0
  const cues = []
  for (const segment of segments) {
    const timed = []
    for (const token of segment.text.split(/\s+/)) {
      const key = comparable(token)
      if (!key) continue
      const word = words[next]
      if (!word || comparable(word.text) !== key) {
        throw new Error(`alinhamento fora de ordem em "${segment.text.slice(0, 40)}": esperava "${token}", veio "${word?.text ?? 'fim'}"`)
      }
      timed.push({ token, start: word.start, end: word.end })
      next++
    }
    if (segment.kind !== 'text' || !timed.length) continue
    const line = timed.map(({ token, start }) => `<${stamp(start)}>${token}`).join(' ')
    cues.push(`${stamp(timed[0].start)} --> ${stamp(timed[timed.length - 1].end)}\n${line}`)
  }
  if (next !== words.length) throw new Error(`alinhamento sobrou ${words.length - next} palavra(s) depois do texto`)
  return `WEBVTT\n\n${cues.join('\n\n')}\n`
}
