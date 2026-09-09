// Função Netlify (API v2: recebe Request, devolve Response) do formulário de
// contato. Responde HTML: um fragmento para o htmx, ou um redirect com âncora
// para quem está sem JavaScript. Envia os e-mails direto na API do Mailgun.
import { contactMessages, CONTACT_LOCALES, fill, escapeHtml, successBox, errorBox } from '../src/lib/contact-messages.mjs'

const SITE = 'https://thomasdev.xyz'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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

  try {
    await Promise.all([
      sendMail({
        to: process.env.MAILGUN_SENDER || 'contato@thomasdev.xyz',
        'h:Reply-To': data.email,
        subject: fill(messages.notify_subject, data),
        html: notifyHtml(data),
      }),
      sendMail({
        to: data.email,
        subject: fill(messages.thanks_subject, data),
        html: thanksHtml(messages, data),
      }),
    ])
  } catch (error) {
    console.error('[contact] envio falhou:', error)
    return failure(messages.error_server, 502)
  }
  return success()
}

async function sendMail(fields) {
  const {
    MAILGUN_API_KEY,
    MAILGUN_DOMAIN = 'thomasdev.xyz',
    MAILGUN_HOST = 'api.mailgun.net',
    MAILGUN_FROM = 'Thomas Dev <contato@thomasdev.xyz>',
  } = process.env

  // Sem chave (dev, testes, preview sem env): registra e segue como sucesso.
  if (!MAILGUN_API_KEY) {
    console.log('[contact] MAILGUN_API_KEY ausente; e-mail não enviado:', fields.subject)
    return
  }

  const response = await fetch(`https://${MAILGUN_HOST}/v3/${MAILGUN_DOMAIN}/messages`, {
    method: 'POST',
    headers: { Authorization: `Basic ${Buffer.from(`api:${MAILGUN_API_KEY}`).toString('base64')}` },
    body: new URLSearchParams({ from: MAILGUN_FROM, ...fields }),
  })
  if (!response.ok) throw new Error(`Mailgun ${response.status}: ${await response.text()}`)
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

function thanksHtml(messages, data) {
  return `<div style="font-family:system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#333;line-height:1.5">
  <h2 style="margin:0 0 16px;color:#22c55e">${escapeHtml(fill(messages.thanks_greeting, data))}</h2>
  <p>${escapeHtml(messages.thanks_body)}</p>
  <p>${escapeHtml(messages.thanks_sign)}</p>
  <p style="font-size:13px;color:#999"><a href="${SITE}" style="color:#22c55e">thomasdev.xyz</a></p>
</div>`
}
