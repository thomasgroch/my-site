#!/usr/bin/env node
// Narração dos posts em MP3, com o mesmo motor do atalho Insert do Hammerspoon:
// Kokoro pelo mlx-audio, no próprio Mac. Só regenera o que mudou.
//
//   node scripts/narrate.mjs              # gera o que está velho
//   node scripts/narrate.mjs --dry-run    # só diz o que geraria
//   node scripts/narrate.mjs --force      # regenera tudo
//   node scripts/narrate.mjs --only <slug>
//   node scripts/narrate.mjs --print <slug>   # mostra o texto que seria lido
//
// Lê src/content/blog/*.mdx, monta o texto (src/lib/narration.js), compara o
// hash com src/data/narration.json e grava, para os posts cujo texto, voz ou
// VERSION mudou:
//   public/audio/<slug>.mp3   a narração
//   public/audio/<slug>.vtt   o tempo de cada palavra, para o karaokê
// O nome dos arquivos é o slug, para a URL ser tão permanente quanto a do
// post. Rascunhos entram: é no dev que se ouve. Só posts com `lang` em VOICES
// são narrados.
//
// O texto é sintetizado em lotes de até BATCH caracteres (uns dois minutos):
// o alinhador aceita até cinco minutos por passada. Cada lote vira um WAV,
// que o alinhador casa com o seu próprio texto; os tempos são somados e os
// WAVs concatenados num MP3 só.
//
// Pré-requisitos locais: mlx-audio (uv tool install mlx-audio) e ffmpeg
// (brew install ffmpeg). O build do Netlify não roda isto: MP3, VTT e
// manifesto vão no commit.
import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import { basename, extname, join } from 'node:path'
import { narration, webvtt } from '../src/lib/narration.js'

const VOICES = { pt: { voice: 'pm_alex', langCode: 'p', language: 'Portuguese' } }
const MODEL = 'mlx-community/Kokoro-82M-bf16'
const ALIGNER = 'mlx-community/Qwen3-ForcedAligner-0.6B-4bit'
// Entra no hash: mude quando as regras de narração mudarem e tudo deve ser regravado.
const VERSION = 2
const BATCH = 2400 // caracteres por lote de síntese (~2,5 min de áudio)
const BITRATE = '48k' // mono, 24 kHz: ~0,36 MB por minuto, de sobra para voz
const BIN = join(homedir(), '.local/bin')
const TTS = process.env.NARRATE_TTS ?? join(BIN, 'mlx_audio.tts.generate')
const STT = process.env.NARRATE_STT ?? join(BIN, 'mlx_audio.stt.generate')
const BLOG = 'src/content/blog'
const AUDIO = 'public/audio'
const MANIFEST = 'src/data/narration.json'

const args = process.argv.slice(2)
const flag = (name) => args.includes(name)
const value = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined)
const ONLY = value('--only') ?? value('--print')

const posts = readdirSync(BLOG)
  .filter((name) => ['.md', '.mdx'].includes(extname(name)))
  .sort()
  .map((name) => ({ slug: basename(name, extname(name)), file: join(BLOG, name) }))
  .filter((post) => !ONLY || post.slug === ONLY)
if (ONLY && posts.length === 0) {
  console.error(`Nenhum post com slug "${ONLY}" em ${BLOG}.`)
  process.exit(1)
}

const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {}
const hashOf = (text, voice) =>
  createHash('sha256').update(JSON.stringify({ v: VERSION, model: MODEL, aligner: ALIGNER, voice, text })).digest('hex')
const run = (bin, params, input) => {
  const result = spawnSync(bin, params, { input, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  if (result.error) throw new Error(`${bin}: ${result.error.message}`)
  if (result.status !== 0) throw new Error(`${bin} saiu com ${result.status}:\n${(result.stderr || result.stdout).slice(-800)}`)
  return result.stdout
}
const duration = (file) => Number(run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]))
const minutes = (seconds) => `${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(2, '0')}`

// Lotes de trechos, sem partir um trecho, até BATCH caracteres cada.
function batches(segments) {
  const out = [[]]
  let size = 0
  for (const segment of segments) {
    if (out.at(-1).length && size + segment.text.length > BATCH) {
      out.push([])
      size = 0
    }
    out.at(-1).push(segment)
    size += segment.text.length
  }
  return out
}

// Sintetiza e alinha lote a lote. Devolve a duração total e a lista de
// palavras com tempos absolutos, na ordem do texto.
function synthesize(segments, { voice, langCode, language }, out) {
  const dir = mkdtempSync(join(tmpdir(), 'narrate-'))
  try {
    const wavs = []
    const words = []
    let offset = 0
    for (const [i, batch] of batches(segments).entries()) {
      const text = batch.map((segment) => segment.text).join('\n\n')
      const wav = join(dir, `batch-${i}.wav`)
      run(TTS, ['--model', MODEL, '--voice', voice, '--lang_code', langCode, '--output_path', dir, '--file_prefix', `batch-${i}`, '--join_audio', '--audio_format', 'wav'], text)
      if (!existsSync(wav)) throw new Error(`o Kokoro não gravou ${wav}`)
      run(STT, ['--model', ALIGNER, '--audio', wav, '--text', text, '--language', language, '--format', 'json', '--output-path', join(dir, `align-${i}`)])
      const aligned = JSON.parse(readFileSync(join(dir, `align-${i}.json`), 'utf8')).segments
      for (const word of aligned) words.push({ text: word.text, start: offset + word.start, end: offset + word.end })
      offset += duration(wav)
      wavs.push(wav)
    }
    writeFileSync(join(dir, 'list.txt'), wavs.map((wav) => `file '${wav}'`).join('\n'))
    mkdirSync(AUDIO, { recursive: true })
    run('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', join(dir, 'list.txt'), '-ac', '1', '-b:a', BITRATE, out])
    return { seconds: duration(out), words }
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

const plan = []
const failures = []
for (const post of posts) {
  try {
    const spoken = narration(readFileSync(post.file, 'utf8'), { file: post.file })
    const engine = VOICES[spoken.lang]
    if (!engine) continue
    const hash = hashOf(spoken.text, engine.voice)
    const mp3 = join(AUDIO, `${post.slug}.mp3`)
    const vtt = join(AUDIO, `${post.slug}.vtt`)
    const stale = flag('--force') || manifest[post.slug]?.hash !== hash || !existsSync(mp3) || !existsSync(vtt)
    plan.push({ ...post, spoken, engine, hash, mp3, vtt, stale })
  } catch (error) {
    failures.push(post.slug)
    console.error(`  ✗ ${error.message}`)
  }
}

if (value('--print')) {
  const item = plan[0]
  if (item) console.log(`${item.spoken.text}\n\n[${item.spoken.chars} caracteres]`)
  process.exit(item ? 0 : 1)
}

const stale = plan.filter((item) => item.stale)
console.log(`${stale.length}/${plan.length} posts para narrar${flag('--dry-run') ? ' [dry run]' : ''}`)
for (const item of plan) console.log(`  ${item.stale ? '•' : '–'} ${item.slug} ${item.stale ? `(${item.spoken.chars} caracteres)` : 'sem mudança'}`)

if (!flag('--dry-run')) {
  for (const item of stale) {
    try {
      const started = Date.now()
      const { seconds, words } = synthesize(item.spoken.segments, item.engine, item.mp3)
      writeFileSync(item.vtt, webvtt(item.spoken.segments, words))
      const bytes = readFileSync(item.mp3).length
      manifest[item.slug] = { hash: item.hash, voice: item.engine.voice, seconds: Math.round(seconds), bytes, chars: item.spoken.chars, words: words.length, generatedAt: new Date().toISOString() }
      console.log(`  ✓ ${item.slug} (${minutes(seconds)}, ${(bytes / 1e6).toFixed(1)} MB, ${words.length} palavras, ${Math.round((Date.now() - started) / 1000)}s)`)
    } catch (error) {
      failures.push(item.slug)
      console.error(`  ✗ ${item.slug}: ${error.message}`)
    }
  }

  // Post apagado, ou que deixou de ter voz: somem o áudio, o VTT e a entrada.
  if (!ONLY) {
    const known = new Set(plan.map((item) => item.slug))
    for (const slug of Object.keys(manifest)) {
      if (known.has(slug) || failures.includes(slug)) continue
      rmSync(join(AUDIO, `${slug}.mp3`), { force: true })
      rmSync(join(AUDIO, `${slug}.vtt`), { force: true })
      delete manifest[slug]
      console.log(`  – ${slug} removido`)
    }
  }

  const sorted = Object.fromEntries(Object.keys(manifest).sort().map((slug) => [slug, manifest[slug]]))
  writeFileSync(MANIFEST, `${JSON.stringify(sorted, null, 2)}\n`)
}

if (failures.length) {
  console.error(`${failures.length} post(s) falharam: ${failures.join(', ')}`)
  process.exit(1)
}
