import general_pt from '../locales/general.pt.json'
import general_en from '../locales/general.en.json'
import contact_pt from '../locales/contact.pt.json'
import contact_en from '../locales/contact.en.json'

// Código curto usado nas URLs (/en/...). A tag BCP 47 fica em LOCALE_TAGS e é
// o que vai para <html lang>, hreflang e og:locale.
export const LOCALES = ['pt', 'en']
export const DEFAULT_LOCALE = 'pt'
export const LOCALE_TAGS = { pt: 'pt-BR', en: 'en' }
export const LOCALE_NAMES = { pt: 'Português', en: 'English' }
export const OG_LOCALES = { pt: 'pt_BR', en: 'en_US' }

const messages = {
  pt: { general: general_pt, contact: contact_pt },
  en: { general: general_en, contact: contact_en },
}

export function getMessages(locale) {
  return messages[locale] || messages[DEFAULT_LOCALE]
}

// Tradutor puro, sem estado global: cada página recebe o locale resolvido
// pela URL e cria o seu `t`. Suporta interpolação simples: t('x', { nome }).
export function createTranslator(locale) {
  const dict = getMessages(locale)
  return function t(key, params) {
    const value = key.split('.').reduce((acc, part) => acc?.[part], dict)
    if (value === undefined || value === null) return key
    if (!params) return value
    return String(value).replace(/\{(\w+)\}/g, (_, name) => (name in params ? params[name] : `{${name}}`))
  }
}

export function localePath(locale, path = '/') {
  const clean = path === '/' ? '' : path.replace(/\/$/, '')
  return locale === DEFAULT_LOCALE ? clean || '/' : `/${locale}${clean}`
}

// Separa o prefixo de idioma de um pathname: '/en/stack' -> { locale: 'en', path: '/stack' }
export function splitLocale(pathname) {
  const match = pathname.match(/^\/(en)(?=\/|$)/)
  if (!match) return { locale: DEFAULT_LOCALE, path: pathname || '/' }
  return { locale: match[1], path: pathname.slice(match[0].length) || '/' }
}
