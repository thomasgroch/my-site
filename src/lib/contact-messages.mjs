// Textos e fragmentos HTML do formulário de contato, compartilhados entre a
// página (Astro) e a função Netlify (functions/contact.mjs). Fica em ESM puro
// para os dois lados importarem sem depender de JSON ou de bundler.

export const contactMessages = {
  pt: {
    success: 'Sua mensagem foi enviada com sucesso!',
    success_detail: 'Retornarei ao seu contato em breve 😉',
    send_another: 'Enviar outra mensagem',
    error_title: 'Ops, algo deu errado.',
    error_generic: 'Verifique se os campos estão preenchidos corretamente.',
    error_required: 'Preencha nome, e-mail e mensagem.',
    error_email: 'Informe um e-mail válido.',
    error_length: 'Algum campo passou do tamanho permitido.',
    error_captcha: 'Não consegui confirmar que você é humano. Tente de novo.',
    error_server: 'Não consegui enviar agora. Tente de novo em instantes.',
    notify_subject: 'Novo contato de {nome} pelo site thomasdev.xyz',
  },
  en: {
    success: 'Your message has been sent successfully!',
    success_detail: 'I will get back to you shortly 😉',
    send_another: 'Send another message',
    error_title: 'Oops, something went wrong.',
    error_generic: 'Check that the fields are filled in correctly.',
    error_required: 'Please fill in name, e-mail and message.',
    error_email: 'Please enter a valid e-mail address.',
    error_length: 'One of the fields is too long.',
    error_captcha: 'I could not confirm you are human. Please try again.',
    error_server: 'I could not send it right now. Please try again in a moment.',
    notify_subject: 'New contact from {nome} via thomasdev.xyz',
  },
}

export const CONTACT_LOCALES = Object.keys(contactMessages)

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
}

// Caixas de resposta (.notice em src/styles/components.css): a de sucesso
// substitui o formulário inteiro (htmx) ou aparece via :target em #enviado
// (sem JavaScript).
export function successBox(locale) {
  const m = contactMessages[locale] || contactMessages.pt
  return `<div class="notice stack" data-tone="ok" role="status">
  <p><strong>${escapeHtml(m.success)}</strong></p>
  <p>${escapeHtml(m.success_detail)}</p>
  <p><a href="">${escapeHtml(m.send_another)}</a></p>
</div>`
}

export function errorBox(locale, text) {
  const m = contactMessages[locale] || contactMessages.pt
  return `<div class="notice" data-tone="error" role="alert">
  <strong>☹️ ${escapeHtml(m.error_title)}</strong>
  <span>${escapeHtml(text || m.error_generic)}</span>
</div>`
}
