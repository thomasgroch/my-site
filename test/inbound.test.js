import { createHmac } from 'node:crypto'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import handler from '../functions/inbound.mjs'

const secret = Buffer.from('segredo').toString('base64')
const event = JSON.stringify({ type: 'email.received', data: { email_id: 'abc' } })

function post(body = event, { key = secret, timestamp = Math.floor(Date.now() / 1000) } = {}) {
  const signature = createHmac('sha256', Buffer.from(key, 'base64')).update(`msg.${timestamp}.${body}`).digest('base64')
  const headers = { 'svix-id': 'msg', 'svix-timestamp': String(timestamp), 'svix-signature': `v1,${signature}` }
  return handler(new Request('http://localhost/api/inbound', { method: 'POST', body, headers }))
}

beforeEach(() => {
  vi.unstubAllEnvs()
  vi.stubEnv('RESEND_WEBHOOK_SECRET', `whsec_${secret}`)
  vi.stubEnv('RESEND_INBOUND_API_KEY', 'test-key')
  vi.stubEnv('FORWARD_TO', 'destino@example.com')
  globalThis.fetch = vi.fn(async (url) => {
    if (url.endsWith('/attachments')) {
      return Response.json({ data: [{ filename: 'a.pdf', download_url: 'https://x/a.pdf', content_type: 'application/pdf' }] })
    }
    if (url.includes('/receiving/')) {
      return Response.json({ from: 'Maria <maria@example.com>', subject: 'Oi', html: '<p>Oi</p>', text: 'Oi' })
    }
    return Response.json({ id: 'sent' })
  })
})

describe('encaminhamento de e-mails recebidos', () => {
  it('só aceita POST', async () => {
    const res = await handler(new Request('http://localhost/api/inbound'))
    expect(res.status).toBe(405)
  })

  it('recusa assinatura inválida sem chamar a API', async () => {
    const res = await post(event, { key: Buffer.from('outro').toString('base64') })
    expect(res.status).toBe(401)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('recusa assinatura antiga', async () => {
    const res = await post(event, { timestamp: Math.floor(Date.now() / 1000) - 3600 })
    expect(res.status).toBe(401)
  })

  it('ignora outros eventos', async () => {
    const res = await post(JSON.stringify({ type: 'email.sent', data: {} }))
    expect(res.status).toBe(204)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('encaminha conteúdo e anexos, com resposta para o remetente original', async () => {
    const res = await post()
    expect(res.status).toBe(204)
    const [url, init] = fetch.mock.calls[2]
    expect(url).toBe('https://api.resend.com/emails')
    expect(init.headers['Idempotency-Key']).toBe('inbound-abc')
    const sent = JSON.parse(init.body)
    expect(sent.to).toBe('destino@example.com')
    expect(sent.reply_to).toBe('Maria <maria@example.com>')
    expect(sent.from).toBe('Maria via thomasdev <contact@thomasdev.xyz>')
    expect(sent.attachments[0].path).toBe('https://x/a.pdf')
  })

  it('falha da API vira 502 para o Resend tentar de novo', async () => {
    globalThis.fetch = vi.fn(async () => new Response('erro', { status: 500 }))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const res = await post()
    expect(res.status).toBe(502)
  })
})
