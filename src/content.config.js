// Coleções de conteúdo. Cada entrada é um arquivo próprio em
// src/content/<coleção>/, editável à mão ou pelo painel do Keystatic
// (keystatic.config.js), que grava nesses mesmos arquivos.
//
// Os esquemas são o contrato do conteúdo: um campo faltando, uma URL malformada
// ou uma imagem que não existe derrubam o build, e a pipeline cancela o deploy.
import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

// O Keystatic grava campo vazio como '' ou null. Os dois contam como ausente.
const blank = (value) => (value === '' || value === null ? undefined : value)
const optional = (schema) => z.preprocess(blank, schema.optional())

const text = z.string().trim().min(1)
const url = z.string().url()
// Texto em português, com inglês opcional. Sem tradução, a versão em inglês do
// site mostra o português.
const bilingual = z.object({ pt: text, en: optional(text) })
// Texto obrigatório nos dois idiomas.
const translated = z.object({ pt: text, en: text })
const order = z.preprocess(blank, z.number().int().default(0))

const projects = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      company: text,
      position: bilingual,
      // Índice das chaves general.project.type_N. O seletor do Keystatic grava texto.
      type: z.coerce.number().int().min(0).max(3),
      startDate: z.string().regex(/^\d{4}$/, 'use só o ano, com quatro dígitos'),
      website: optional(url),
      // Caminho relativo ao arquivo YAML; uma imagem inexistente quebra o build.
      image: z.preprocess(blank, image().optional()),
      summary: bilingual,
      // Desempate entre projetos do mesmo ano: menor aparece antes.
      order,
    }),
})

const stack = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/stack' }),
  schema: ({ image }) =>
    z.object({
      name: text,
      group: z.enum(['back', 'front', 'database', 'infra', 'misc', 'history']),
      href: url,
      logo: image(),
      order,
    }),
})

const meta = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/meta' }),
  schema: z.object({
    title: translated,
    intro: translated,
    order,
    items: z
      .array(
        z.object({
          name: text,
          nameEn: optional(text),
          // Pacote npm: a versão é lida do package-lock.json no build.
          pkg: optional(text),
          // Versão fixa, para o que não é pacote npm.
          version: optional(text),
          url,
          note: translated,
        })
      )
      .min(1),
  }),
})

// Blog, só em inglês. Rascunhos aparecem no `astro dev` e ficam fora do build
// de produção (ver src/lib/blog.js).
const blog = defineCollection({
  loader: glob({ pattern: '*.{md,mdx}', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: text,
      description: text,
      pubDate: z.coerce.date(),
      updatedDate: z.preprocess(blank, z.coerce.date().optional()),
      draft: z.boolean().default(false),
      tags: z.array(text).default([]),
      cover: z.preprocess(blank, image().optional()),
      coverAlt: optional(text),
    }),
})

export const collections = { projects, stack, meta, blog }
