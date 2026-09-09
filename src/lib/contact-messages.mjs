// Textos e fragmentos HTML do formulário de contato, compartilhados entre a
// página (Astro) e a função Netlify (functions/contact.mjs). Fica em ESM puro
// para os dois lados importarem sem depender de JSON ou de bundler.

export const contactMessages = {
  pt: {
    success: 'Sua mensagem foi enviada com sucesso!',
    success_detail: 'Retornarei ao seu contato em breve, cheque o seu email 😉',
    send_another: 'Enviar outra mensagem',
    error_title: 'Ops, algo deu errado.',
    error_generic: 'Verifique se os campos estão preenchidos corretamente.',
    error_required: 'Preencha nome, e-mail e mensagem.',
    error_email: 'Informe um e-mail válido.',
    error_server: 'Não consegui enviar agora. Tente de novo em instantes.',
    notify_subject: 'Novo contato de {nome} pelo site thomasdev.xyz',
    thanks_subject: 'Olá {nome}. Thomas aqui, obrigado pelo seu interesse.',
    thanks_greeting: 'Oi {nome},',
    thanks_body: 'Já recebi sua mensagem, em breve entrarei em contato com um feedback. =]',
    thanks_sign: 'Att, Thomas',
  },
  en: {
    success: 'Your message has been sent successfully!',
    success_detail: 'I will get back to you shortly, check your email 😉',
    send_another: 'Send another message',
    error_title: 'Oops, something went wrong.',
    error_generic: 'Check that the fields are filled in correctly.',
    error_required: 'Please fill in name, e-mail and message.',
    error_email: 'Please enter a valid e-mail address.',
    error_server: 'I could not send it right now. Please try again in a moment.',
    notify_subject: 'New contact from {nome} via thomasdev.xyz',
    thanks_subject: 'Hello {nome}. Thomas here, thank you for your interest.',
    thanks_greeting: 'Hi {nome},',
    thanks_body: 'I have received your message and will get back to you with feedback soon. =]',
    thanks_sign: 'Regards, Thomas',
  },
}

export const CONTACT_LOCALES = Object.keys(contactMessages)

export function fill(text, params = {}) {
  return String(text).replace(/\{(\w+)\}/g, (_, k) => (k in params ? params[k] : `{${k}}`))
}

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
}

// Caixa de sucesso: substitui o formulário inteiro (htmx) ou aparece via
// :target em #enviado (sem JavaScript).
export function successBox(locale, { id = '', extraClass = '' } = {}) {
  const m = contactMessages[locale] || contactMessages.pt
  return `<div${id ? ` id="${id}"` : ''} class="${extraClass} rounded-sm border-t-4 border-green-400 bg-green-100 px-5 py-4 text-left dark:bg-neutral-700" role="status">
  <p class="font-semibold text-green-600 dark:text-green-400">${escapeHtml(m.success)}</p>
  <p class="text-sm text-neutral-600 dark:text-neutral-300">${escapeHtml(m.success_detail)}</p>
  <p class="mt-3 text-sm"><a href="">${escapeHtml(m.send_another)}</a></p>
</div>`
}

export function errorBox(locale, text, { id = '', extraClass = '' } = {}) {
  const m = contactMessages[locale] || contactMessages.pt
  return `<div${id ? ` id="${id}"` : ''} class="${extraClass} rounded-sm border border-red-400 bg-red-100 px-4 py-3 text-left text-red-700 dark:bg-red-950 dark:text-red-200" role="alert">
  <strong class="font-bold">☹️ ${escapeHtml(m.error_title)}</strong>
  <span class="block">${escapeHtml(text || m.error_generic)}</span>
</div>`
}
