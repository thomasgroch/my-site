import { describe, it, expect, vi, beforeEach } from 'vitest'
import handler from '../functions/contact.mjs'

const valid = { locale: 'pt', nome: 'Maria', email: 'maria@example.com', mensagem: 'Olá, tudo bem?' }

function post(fields, { htmx = true } = {}) {
  const body = new FormData()
  for (const [key, value] of Object.entries(fields)) body.append(key, value)
  const headers = htmx ? { 'HX-Request': 'true' } : {}
  return handler(new Request('http://localhost/.netlify/functions/contact', { method: 'POST', body, headers }))
}

beforeEach(() => {
  vi.unstubAllEnvs()
  vi.stubEnv('MAILGUN_API_KEY', 'test-key')
  vi.stubEnv('MAILGUN_DOMAIN', 'example.test')
  globalThis.fetch = vi.fn(async () => new Response('{"id":"<x@example.test>"}', { status: 200 }))
})

describe('função de contato', () => {
  it('só aceita POST', async () => {
    const res = await handler(new Request('http://localhost/x', { method: 'GET' }))
    expect(res.status).toBe(405)
  })

  it('exige nome, e-mail e mensagem', async () => {
    const res = await post({ locale: 'pt', nome: 'Maria' })
    expect(res.status).toBe(422)
    expect(await res.text()).toContain('Preencha nome, e-mail e mensagem.')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('valida o formato do e-mail', async () => {
    const res = await post({ ...valid, email: 'nao-e-email' })
    expect(res.status).toBe(422)
    expect(await res.text()).toContain('e-mail válido')
  })

  it('honeypot preenchido finge sucesso e não envia nada', async () => {
    const res = await post({ ...valid, 'bot-field': 'http://spam' })
    expect(res.status).toBe(200)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('envia notificação e agradecimento pelo Mailgun e devolve a caixa de sucesso', async () => {
    const res = await post(valid)
    expect(res.status).toBe(200)
    expect(res.headers.get('HX-Retarget')).toBe('#contact-form')
    expect(res.headers.get('HX-Reswap')).toBe('outerHTML')
    expect(await res.text()).toContain('Sua mensagem foi enviada com sucesso!')

    expect(fetch).toHaveBeenCalledTimes(2)
    const [url, init] = fetch.mock.calls[0]
    expect(url).toBe('https://api.mailgun.net/v3/example.test/messages')
    expect(init.headers.Authorization).toBe(`Basic ${Buffer.from('api:test-key').toString('base64')}`)
    const notify = init.body
    expect(notify.get('to')).toBe('contato@thomasdev.xyz')
    expect(notify.get('h:Reply-To')).toBe('maria@example.com')
    expect(notify.get('html')).toContain('Olá, tudo bem?')
    const thanks = fetch.mock.calls[1][1].body
    expect(thanks.get('to')).toBe('maria@example.com')
    expect(thanks.get('subject')).toContain('Maria')
  })

  it('escapa HTML vindo do formulário', async () => {
    await post({ ...valid, nome: '<b>x</b>', mensagem: '<script>alert(1)</script>' })
    const notify = fetch.mock.calls[0][1].body.get('html')
    expect(notify).not.toContain('<script>')
    expect(notify).toContain('&lt;script&gt;')
  })

  it('responde no idioma do formulário', async () => {
    const res = await post({ ...valid, locale: 'en' })
    expect(await res.text()).toContain('Your message has been sent successfully!')
  })

  it('sem htmx redireciona de volta com a âncora de sucesso', async () => {
    const res = await post({ ...valid, locale: 'en' }, { htmx: false })
    expect(res.status).toBe(303)
    expect(res.headers.get('Location')).toBe('/en/contato#enviado')
  })

  it('sem htmx redireciona com a âncora de erro quando falta campo', async () => {
    const res = await post({ locale: 'pt' }, { htmx: false })
    expect(res.status).toBe(303)
    expect(res.headers.get('Location')).toBe('/contato#erro')
  })

  it('falha do Mailgun vira 502 com mensagem amigável', async () => {
    globalThis.fetch = vi.fn(async () => new Response('Forbidden', { status: 401 }))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const res = await post(valid)
    expect(res.status).toBe(502)
    expect(await res.text()).toContain('Não consegui enviar agora')
  })

  it('sem chave do Mailgun responde sucesso sem chamar a API', async () => {
    vi.stubEnv('MAILGUN_API_KEY', '')
    vi.spyOn(console, 'log').mockImplementation(() => {})
    const res = await post(valid)
    expect(res.status).toBe(200)
    expect(fetch).not.toHaveBeenCalled()
  })
})
