// Função Netlify que recebe o webhook email.received do Resend e encaminha a
// mensagem para FORWARD_TO. Só aceita chamadas assinadas com RESEND_WEBHOOK_SECRET.
import { createHmac, timingSafeEqual } from 'node:crypto'

const API = 'https://api.resend.com'
const SIGNATURE_MAX_AGE = 300

export const config = { path: '/api/inbound' }

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } })
  }

  const body = await request.text()
  if (!validSignature(request.headers, body)) return new Response('Unauthorized', { status: 401 })

  const event = JSON.parse(body)
  if (event.type !== 'email.received') return new Response(null, { status: 204 })

  try {
    await forward(event.data.email_id)
  } catch (error) {
    // Erro faz o Resend tentar de novo; a chave de idempotência evita duplicar.
    console.error('[inbound] encaminhamento falhou:', error)
    return new Response('Bad Gateway', { status: 502 })
  }
  return new Response(null, { status: 204 })
}

// Assinatura do Svix: HMAC-SHA256 de "id.timestamp.corpo", com o segredo em base64.
function validSignature(headers, body) {
  const id = headers.get('svix-id')
  const timestamp = headers.get('svix-timestamp')
  const signatures = headers.get('svix-signature')
  const secret = process.env.RESEND_WEBHOOK_SECRET
  if (!id || !timestamp || !signatures || !secret) return false
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > SIGNATURE_MAX_AGE) return false

  const expected = createHmac('sha256', Buffer.from(secret.replace(/^whsec_/, ''), 'base64'))
    .update(`${id}.${timestamp}.${body}`)
    .digest()
  return signatures.split(' ').some((entry) => {
    const [version, value = ''] = entry.split(',')
    const received = Buffer.from(value, 'base64')
    return version === 'v1' && received.length === expected.length && timingSafeEqual(received, expected)
  })
}

async function forward(emailId) {
  const { RESEND_INBOUND_API_KEY, FORWARD_TO, FORWARD_FROM = 'contact@thomasdev.xyz' } = process.env
  if (!RESEND_INBOUND_API_KEY || !FORWARD_TO) throw new Error('RESEND_INBOUND_API_KEY ou FORWARD_TO ausente')

  const api = async (path, init = {}) => {
    const response = await fetch(`${API}${path}`, {
      ...init,
      headers: { Authorization: `Bearer ${RESEND_INBOUND_API_KEY}`, 'Content-Type': 'application/json', ...init.headers },
    })
    if (!response.ok) throw new Error(`Resend ${response.status}: ${await response.text()}`)
    return response.json()
  }

  const email = await api(`/emails/receiving/${emailId}`)
  const { data: attachments = [] } = await api(`/emails/receiving/${emailId}/attachments`)
  const sender = String(email.from ?? '').replace(/[^\w@.+\- ]/g, ' ').replace(/\s+/g, ' ').trim()

  await api('/emails', {
    method: 'POST',
    headers: { 'Idempotency-Key': `inbound-${emailId}` },
    body: JSON.stringify({
      from: `${sender} via thomasdev <${FORWARD_FROM}>`,
      to: FORWARD_TO,
      reply_to: email.from,
      subject: email.subject || '(sem assunto)',
      html: email.html || undefined,
      text: email.text || (email.html ? undefined : ' '),
      attachments: attachments.map((file) => ({
        filename: file.filename,
        path: file.download_url,
        content_type: file.content_type,
        content_id: file.content_id?.replace(/^<|>$/g, '') || undefined,
      })),
    }),
  })
}
