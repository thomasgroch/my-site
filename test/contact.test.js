import { describe, it, expect, vi, beforeEach } from 'vitest'
import handler, { config } from '../functions/contact.mjs'

const valid = { locale: 'pt', nome: 'Maria', email: 'maria@example.com', mensagem: 'Olá, tudo bem?' }

function post(fields, { htmx = true } = {}) {
  const body = new FormData()
  for (const [key, value] of Object.entries(fields)) body.append(key, value)
  const headers = htmx ? { 'HX-Request': 'true' } : {}
  return handler(new Request('http://localhost/api/contact', { method: 'POST', body, headers }))
}

beforeEach(() => {
  vi.unstubAllEnvs()
  vi.stubEnv('RESEND_API_KEY', 'test-key')
  vi.stubEnv('TURNSTILE_SECRET_KEY', '')
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

  it('envia só a notificação pelo Resend e devolve a caixa de sucesso', async () => {
    const res = await post(valid)
    expect(res.status).toBe(200)
    expect(res.headers.get('HX-Retarget')).toBe('#contact-form')
    expect(res.headers.get('HX-Reswap')).toBe('outerHTML')
    expect(await res.text()).toContain('Sua mensagem foi enviada com sucesso!')

    expect(fetch).toHaveBeenCalledTimes(1)
    const [url, init] = fetch.mock.calls[0]
    expect(url).toBe('https://api.resend.com/emails')
    expect(init.headers.Authorization).toBe('Bearer test-key')
    const notify = JSON.parse(init.body)
    expect(notify.to).toBe('contact@thomasdev.xyz')
    expect(notify.reply_to).toBe('maria@example.com')
    expect(notify.html).toContain('Olá, tudo bem?')
  })

  it('nunca envia e-mail ao endereço digitado', async () => {
    await post({ ...valid, nome: 'Compre em http://spam.example' })
    const recipients = fetch.mock.calls.map(([, init]) => JSON.parse(init.body).to)
    expect(recipients).not.toContain(valid.email)
  })

  it('recusa campo acima do tamanho máximo', async () => {
    const res = await post({ ...valid, nome: 'x'.repeat(101) })
    expect(res.status).toBe(422)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('declara rota própria com limite por IP', () => {
    expect(config.path).toBe('/api/contact')
    expect(config.rateLimit).toEqual({ windowLimit: 5, windowSize: 60, aggregateBy: ['ip', 'domain'] })
  })

  it('com Turnstile ativo, recusa envio sem token', async () => {
    vi.stubEnv('TURNSTILE_SECRET_KEY', 'segredo')
    const res = await post(valid)
    expect(res.status).toBe(403)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('com Turnstile ativo, recusa token inválido', async () => {
    vi.stubEnv('TURNSTILE_SECRET_KEY', 'segredo')
    globalThis.fetch = vi.fn(async () => Response.json({ success: false }))
    const res = await post({ ...valid, 'cf-turnstile-response': 'ruim' })
    expect(res.status).toBe(403)
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('com Turnstile ativo, envia quando o token é válido', async () => {
    vi.stubEnv('TURNSTILE_SECRET_KEY', 'segredo')
    globalThis.fetch = vi.fn(async () => Response.json({ success: true }))
    const res = await post({ ...valid, 'cf-turnstile-response': 'bom' })
    expect(res.status).toBe(200)
    expect(fetch.mock.calls[1][0]).toBe('https://api.resend.com/emails')
  })

  it('escapa HTML vindo do formulário', async () => {
    await post({ ...valid, nome: '<b>x</b>', mensagem: '<script>alert(1)</script>' })
    const notify = JSON.parse(fetch.mock.calls[0][1].body).html
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

  it('falha do Resend vira 502 com mensagem amigável', async () => {
    globalThis.fetch = vi.fn(async () => new Response('Forbidden', { status: 401 }))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const res = await post(valid)
    expect(res.status).toBe(502)
    expect(await res.text()).toContain('Não consegui enviar agora')
  })

  it('sem chave do Resend responde sucesso sem chamar a API', async () => {
    vi.stubEnv('RESEND_API_KEY', '')
    vi.spyOn(console, 'log').mockImplementation(() => {})
    const res = await post(valid)
    expect(res.status).toBe(200)
    expect(fetch).not.toHaveBeenCalled()
  })
})
