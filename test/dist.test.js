// Testes do HTML publicado. Rodam em Node puro, sem navegador: o que antes
// exigia Cypress para checar marcação, idioma e links agora é leitura do
// próprio `dist/`. Pré-requisito: `npm run build` (o script `verify` faz isso).
import { describe, it, expect, beforeAll } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { parseHTML } from 'linkedom'

const DIST = 'dist'
const cache = new Map()

function page(path) {
  if (!cache.has(path)) {
    const file = `${DIST}${path}`
    if (!existsSync(file)) throw new Error(`${file} não existe. Rode "npm run build" antes dos testes.`)
    cache.set(path, parseHTML(readFileSync(file, 'utf8')).document)
  }
  return cache.get(path)
}

beforeAll(() => {
  if (!existsSync(DIST)) throw new Error('dist/ não existe. Rode "npm run build" antes dos testes.')
})

describe('formulário de contato', () => {
  const doc = () => page('/contato/index.html')

  it('envia para a função do Netlify, por htmx e por POST normal', () => {
    const form = doc().querySelector('#contact-form')
    expect(form.getAttribute('action')).toBe('/.netlify/functions/contact')
    expect(form.getAttribute('hx-post')).toBe('/.netlify/functions/contact')
    expect(form.getAttribute('method')).toBe('post')
  })

  it('exige nome, e-mail e mensagem, e deixa telefone e cidade opcionais', () => {
    const field = (id) => doc().querySelector(`#${id}`)
    for (const id of ['nome', 'email', 'mensagem']) expect(field(id).hasAttribute('required'), id).toBe(true)
    for (const id of ['telefone', 'cidade']) expect(field(id).hasAttribute('required'), id).toBe(false)
    expect(field('email').getAttribute('type')).toBe('email')
  })

  it('manda o locale e tem honeypot e botão de envio', () => {
    expect(doc().querySelector('input[name="locale"]').getAttribute('value')).toBe('pt')
    expect(doc().querySelector('input[name="bot-field"]')).not.toBeNull()
    expect(doc().querySelector('#contact-form button[type="submit"]')).not.toBeNull()
  })

  it('tem o alvo do htmx e as caixas de fallback sem JavaScript', () => {
    expect(doc().querySelector('#form-status')).not.toBeNull()
    expect(doc().querySelector('#enviado').textContent).toContain('enviada com sucesso')
    expect(doc().querySelector('#erro').textContent).toContain('algo deu errado')
  })
})

describe('idiomas', () => {
  it('cada página declara a língua certa', () => {
    expect(page('/index.html').documentElement.getAttribute('lang')).toBe('pt-BR')
    expect(page('/en/index.html').documentElement.getAttribute('lang')).toBe('en')
  })

  it('a home em inglês mostra o conteúdo traduzido', () => {
    expect(page('/en/index.html').body.textContent).toContain('Web developer')
    expect(page('/index.html').body.textContent).toContain('Desenvolvedor web')
  })

  it('o rodapé leva para a mesma página no outro idioma', () => {
    const hrefs = (p) => [...page(p).querySelectorAll('.locale-link')].map((a) => a.getAttribute('href'))
    expect(hrefs('/stack/index.html')).toEqual(['/stack', '/en/stack'])
    expect(hrefs('/en/contato/index.html')).toEqual(['/contato', '/en/contato'])
  })

  it('canonical e hreflang apontam para as duas versões', () => {
    const doc = page('/en/stack/index.html')
    expect(doc.querySelector('link[rel="canonical"]').getAttribute('href')).toBe('https://thomasdev.xyz/en/stack')
    const alt = [...doc.querySelectorAll('link[rel="alternate"]')].map((l) => [l.getAttribute('hreflang'), l.getAttribute('href')])
    expect(alt).toEqual([
      ['pt-BR', 'https://thomasdev.xyz/stack'],
      ['en', 'https://thomasdev.xyz/en/stack'],
      ['x-default', 'https://thomasdev.xyz/stack'],
    ])
  })

  it('a 404 não é indexada e não tem canonical', () => {
    expect(page('/404.html').querySelector('meta[name="robots"]').getAttribute('content')).toBe('noindex')
    expect(page('/404.html').querySelector('link[rel="canonical"]')).toBeNull()
  })
})

describe('detecção de idioma no primeiro acesso', () => {
  // Executa o script inline gerado, com localStorage, navigator e location
  // falsos. Substitui o teste de navegador sem perder o comportamento.
  function run(path, { language, chosen = false }) {
    const doc = page(path)
    const script = [...doc.querySelectorAll('script:not([src])')].find(
      (s) => s.textContent.includes('locale-chosen') && s.textContent.includes('location.replace')
    )
    if (!script) return { script: false, replaced: null }
    const store = chosen ? { 'locale-chosen': '1' } : {}
    const location = { replaced: null, replace(url) { this.replaced = url } }
    const localStorage = { getItem: (k) => store[k] ?? null, setItem: (k, v) => (store[k] = v) }
    new Function('localStorage', 'navigator', 'location', script.textContent)(localStorage, { language }, location)
    return { script: true, replaced: location.replaced }
  }

  it('navegador em inglês vai para /en', () => {
    expect(run('/index.html', { language: 'en-US' }).replaced).toBe('/en')
  })

  it('preserva a página ao redirecionar', () => {
    expect(run('/stack/index.html', { language: 'en-GB' }).replaced).toBe('/en/stack')
  })

  it('navegador em português fica onde está', () => {
    expect(run('/index.html', { language: 'pt-BR' }).replaced).toBeNull()
  })

  it('idioma já escolhido não é sobrescrito', () => {
    expect(run('/index.html', { language: 'en-US', chosen: true }).replaced).toBeNull()
  })

  it('as páginas em inglês não carregam o script de redirecionamento', () => {
    expect(run('/en/index.html', { language: 'en-US' }).script).toBe(false)
  })
})

describe('orçamento e higiene das páginas', () => {
  const rotas = ['/index.html', '/en/index.html', '/stack/index.html', '/projetos/index.html', '/contato/index.html', '/meta/index.html', '/404.html']

  it('nenhuma página carrega framework de JavaScript', () => {
    for (const rota of rotas) {
      const externos = [...page(rota).querySelectorAll('script[src]')]
        .map((s) => s.getAttribute('src'))
        .filter((src) => !src.includes('umami'))
      // Só a página de contato tem JavaScript próprio, o htmx.
      expect(externos.length, rota).toBe(rota.includes('contato') ? 1 : 0)
    }
  })

  it('toda imagem tem dimensões e texto alternativo', () => {
    for (const rota of rotas) {
      for (const img of page(rota).querySelectorAll('img')) {
        expect(img.hasAttribute('width'), `${rota} ${img.getAttribute('src')}`).toBe(true)
        expect(img.hasAttribute('height'), `${rota} ${img.getAttribute('src')}`).toBe(true)
        expect(img.hasAttribute('alt'), `${rota} ${img.getAttribute('src')}`).toBe(true)
      }
    }
  })

  it('cada página tem um só h1 e um título próprio', () => {
    const titulos = new Set()
    for (const rota of rotas) {
      expect(page(rota).querySelectorAll('h1').length, rota).toBe(1)
      titulos.add(page(rota).title)
    }
    expect(titulos.size).toBe(rotas.length)
  })
})
