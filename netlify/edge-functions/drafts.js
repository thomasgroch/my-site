/* global Netlify */
// Rascunhos do blog só abrem com o cookie `draft`. Roda em /blog/* (ver
// netlify.toml). A página de rascunho é reconhecida pela marca que o Layout
// põe nela, <meta name="robots" content="noindex">; posts publicados passam
// direto, sem ler o corpo mais de uma vez. Com o cookie, /blog/ vira a lista
// que inclui os rascunhos, /blog/drafts/, que sem cookie é um rascunho como
// os outros (404).
//
// Para entrar: abra qualquer URL do blog com ?key=<DRAFT_KEY>. A função grava
// o cookie por um ano e redireciona para a URL limpa. DRAFT_KEY é uma variável
// do Netlify; sem ela, todo rascunho responde 404 (fechado por padrão).
//
// O `astro dev` não passa por aqui: no dev tudo abre. O MP3 e o VTT da
// narração ficam em /audio/ e não são protegidos.
const COOKIE = 'draft'
const MARK = '<meta name="robots" content="noindex"'
const YEAR = 60 * 60 * 24 * 365

// Decisão pura, testável em Node (test/drafts.test.js):
// 'login' (grava o cookie e redireciona), 'drafts' (serve /blog/drafts/ no
// lugar de /blog/), 'pass' (deixa passar) ou 'hide' (404).
export function gate({ url, cookie, key, html }) {
  if (key && url.searchParams.get('key') === key) return 'login'
  const authed = Boolean(key) && cookie === key
  if (authed && /^\/blog\/?$/.test(url.pathname)) return 'drafts'
  if (!html.includes(MARK)) return 'pass'
  return authed ? 'pass' : 'hide'
}

export default async (request, context) => {
  const key = Netlify.env.get('DRAFT_KEY')
  const url = new URL(request.url)
  const cookie = context.cookies.get(COOKIE)
  const first = gate({ url, key, cookie, html: '' })
  if (first === 'drafts') return context.rewrite('/blog/drafts/')
  if (first === 'login') {
    url.searchParams.delete('key')
    return new Response(null, {
      status: 302,
      headers: {
        location: url.pathname + url.search,
        'set-cookie': `${COOKIE}=${key}; Path=/; Max-Age=${YEAR}; HttpOnly; Secure; SameSite=Lax`,
      },
    })
  }
  const response = await context.next()
  if (!(response.headers.get('content-type') || '').includes('text/html')) return response
  const html = await response.text()
  if (gate({ url, key, cookie, html }) === 'hide') {
    return new Response('Not found', { status: 404, headers: { 'content-type': 'text/plain' } })
  }
  return new Response(html, { status: response.status, headers: response.headers })
}
