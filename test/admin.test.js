import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { parse } from 'yaml'

// O painel (public/admin/config.yml) só grava os campos que conhece: uma chave
// nova num JSON de src/locales sem o campo no painel sumiria no primeiro
// "Salvar", e o site mostraria o nome da chave no lugar do texto.
const config = parse(readFileSync('public/admin/config.yml', 'utf8'))
const texts = config.collections.find((collection) => collection.name === 'texts')
const fieldNames = (fields) => fields.map((field) => (field.fields ? [field.name, fieldNames(field.fields)] : field.name))
const jsonKeys = (object) => Object.entries(object).map(([key, value]) => (typeof value === 'object' ? [key, jsonKeys(value)] : key))

describe('painel: textos do site', () => {
  for (const file of texts.files) {
    for (const locale of config.i18n.locales) {
      const path = file.file.replace('{{locale}}', locale)
      it(`${path} tem os campos do painel, na mesma ordem`, () => {
        expect(fieldNames(file.fields)).toEqual(jsonKeys(JSON.parse(readFileSync(path, 'utf8'))))
      })
    }
  }

  it('cobre todos os arquivos de src/locales', () => {
    const covered = texts.files.flatMap((file) => config.i18n.locales.map((locale) => file.file.replace('{{locale}}', locale)))
    const existing = readdirSync('src/locales').map((name) => `src/locales/${name}`)
    expect(covered.sort()).toEqual(existing.sort())
  })
})
