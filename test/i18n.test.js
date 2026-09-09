import { describe, it, expect } from 'vitest'
import { LOCALES, DEFAULT_LOCALE, LOCALE_TAGS, getMessages, createTranslator, localePath, splitLocale } from '@/i18n'
import { contactMessages } from '@/lib/contact-messages.mjs'

const keysOf = (obj, prefix = '') =>
  Object.entries(obj).flatMap(([key, value]) =>
    value && typeof value === 'object' ? keysOf(value, `${prefix}${key}.`) : [`${prefix}${key}`]
  )

describe('arquivos de idioma', () => {
  const base = keysOf(getMessages(DEFAULT_LOCALE)).sort()
  for (const locale of LOCALES) {
    it(`${locale} tem exatamente as chaves de ${DEFAULT_LOCALE}`, () => {
      expect(keysOf(getMessages(locale)).sort()).toEqual(base)
    })
    it(`${locale} tem todas as mensagens do formulário de contato`, () => {
      expect(Object.keys(contactMessages[locale]).sort()).toEqual(Object.keys(contactMessages.pt).sort())
    })
    it(`${locale} tem uma tag BCP 47`, () => {
      expect(LOCALE_TAGS[locale]).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/)
    })
  }
})

describe('createTranslator', () => {
  const t = createTranslator('en')
  it('resolve chaves aninhadas', () => expect(t('general.nav_about')).toBe('About'))
  it('devolve a chave quando não existe tradução', () => expect(t('general.nao_existe')).toBe('general.nao_existe'))
  it('interpola variáveis', () => expect(createTranslator('pt')('general.nav_about', { x: 1 })).toBe('Sobre'))
  it('cai para pt em locale desconhecido', () => expect(createTranslator('xx')('general.nav_about')).toBe('Sobre'))
})

describe('localePath / splitLocale', () => {
  it('não prefixa o idioma padrão', () => {
    expect(localePath('pt', '/')).toBe('/')
    expect(localePath('pt', '/stack')).toBe('/stack')
  })
  it('prefixa os demais idiomas', () => {
    expect(localePath('en', '/')).toBe('/en')
    expect(localePath('en', '/contato')).toBe('/en/contato')
  })
  it('separa o prefixo de um pathname', () => {
    expect(splitLocale('/en/stack')).toEqual({ locale: 'en', path: '/stack' })
    expect(splitLocale('/en')).toEqual({ locale: 'en', path: '/' })
    expect(splitLocale('/projetos')).toEqual({ locale: 'pt', path: '/projetos' })
  })
})
