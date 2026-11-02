// Função Netlify (API v2: recebe Request, devolve Response) do formulário de
// contato. Responde HTML: um fragmento para o htmx, ou um redirect com âncora
// para quem está sem JavaScript. Envia a notificação direto na API do Resend.
// Nunca envie e-mail ao endereço digitado no formulário: qualquer um poderia
// usar o site para mandar spam a terceiros pelo domínio.
import { contactMessages, CONTACT_LOCALES, escapeHtml, successBox, errorBox } from '../src/lib/contact-messages.mjs'
import { fill } from '../src/lib/text.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_LENGTH = { nome: 100, email: 254, telefone: 30, cidade: 100, mensagem: 5000 }

// O limite do Netlify exige `path`, que substitui a rota /.netlify/functions/contact.
export const config = {
  path: '/api/contact',
  rateLimit: { windowLimit: 5, windowSize: 60, aggregateBy: ['ip', 'domain'] },
}

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } })
  }

  const form = await request.formData()
  const line = (name) => String(form.get(name) ?? '').replace(/\s+/g, ' ').trim()
  const locale = CONTACT_LOCALES.includes(line('locale')) ? line('locale') : 'pt'
  const messages = contactMessages[locale]
  const isHtmx = request.headers.get('hx-request') === 'true'
  const backTo = `${locale === 'pt' ? '' : `/${locale}`}/contato`

  const html = (body, status = 200, headers = {}) =>
    new Response(body, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', ...headers } })
  const redirect = (hash) => new Response(null, { status: 303, headers: { Location: `${backTo}#${hash}` } })
  const success = () =>
    isHtmx ? html(successBox(locale), 200, { 'HX-Retarget': '#contact-form', 'HX-Reswap': 'outerHTML' }) : redirect('enviado')
  const failure = (text, status) => (isHtmx ? html(errorBox(locale, text), status) : redirect('erro'))

  // Honeypot: só robôs preenchem o campo escondido. Finge sucesso e descarta.
  if (line('bot-field')) return success()

  const data = {
    nome: line('nome'),
    email: line('email'),
    telefone: line('telefone'),
    cidade: line('cidade'),
    mensagem: String(form.get('mensagem') ?? '').trim(),
  }
  if (!data.nome || !data.email || !data.mensagem) return failure(messages.error_required, 422)
  if (!EMAIL_RE.test(data.email)) return failure(messages.error_email, 422)
  if (Object.entries(MAX_LENGTH).some(([name, max]) => data[name].length > max)) return failure(messages.error_length, 422)

  try {
    await sendMail({
      to: process.env.CONTACT_TO || 'contact@thomasdev.xyz',
      reply_to: data.email,
      subject: fill(messages.notify_subject, data),
      html: notifyHtml(data),
    })
  } catch (error) {
    console.error('[contact] envio falhou:', error)
    return failure(messages.error_server, 502)
  }
  return success()
}

async function sendMail(fields) {
  const { RESEND_API_KEY, RESEND_FROM = 'Thomas Dev <contact@thomasdev.xyz>' } = process.env

  // Sem chave (dev, testes, preview sem env): registra e segue como sucesso.
  if (!RESEND_API_KEY) {
    console.log('[contact] RESEND_API_KEY ausente; e-mail não enviado:', fields.subject)
    return
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: RESEND_FROM, ...fields }),
  })
  if (!response.ok) throw new Error(`Resend ${response.status}: ${await response.text()}`)
}

function notifyHtml(data) {
  const rows = [
    ['Nome', data.nome],
    ['E-mail', data.email],
    ['Telefone', data.telefone],
    ['Cidade', data.cidade],
  ]
    .filter(([, value]) => value)
    .map(([label, value]) => `<tr><th align="left" style="padding:4px 16px 4px 0">${label}</th><td>${escapeHtml(value)}</td></tr>`)
    .join('')
  return `<table>${rows}</table><p style="white-space:pre-wrap">${escapeHtml(data.mensagem)}</p>`
}
