// Coleções de conteúdo. Tudo é editável à mão ou pelo painel do Sveltia CMS
// (public/admin/config.yml), que grava nesses mesmos arquivos. A exceção é o
// src/data/resume.json, no formato JSON Resume, editado só à mão.
//
// Os esquemas são o contrato do conteúdo: um campo faltando, uma URL malformada
// ou uma imagem que não existe derrubam o build, e a pipeline cancela o deploy.
//
// Convenções:
// - Texto que o visitante lê vem nos dois idiomas, { pt, en }, sempre.
// - Imagem fica em src/assets/<coleção>/<entrada>/<campo>.<ext>, o caminho
//   que o painel grava.
import { defineCollection } from 'astro:content'
import { file, glob } from 'astro/loaders'
import { z } from 'astro/zod'

// Campo vazio pode chegar como '' ou null. Os dois contam como ausente.
const blank = (value) => (value === '' || value === null ? undefined : value)
const optional = (schema) => z.preprocess(blank, schema.optional())

const text = z.string().trim().min(1)
const url = z.string().url()
const translated = z.object({ pt: text, en: text })
const order = z.preprocess(blank, z.number().int().default(0))

const projects = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      company: text,
      position: translated,
      // Índice das chaves general.project.type_N. O seletor do painel grava texto.
      type: z.coerce.number().int().min(0).max(3),
      startDate: z.string().regex(/^\d{4}$/, 'use só o ano, com quatro dígitos'),
      website: optional(url),
      image: z.preprocess(blank, image().optional()),
      summary: translated,
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

// Colofão em /meta: um arquivo só, com os grupos na ordem em que aparecem.
// Vira uma entrada única, `groups`.
const meta = defineCollection({
  loader: file('src/content/meta.yaml'),
  schema: z
    .array(
      z.object({
        title: translated,
        intro: translated,
        items: z
          .array(
            z.object({
              name: translated,
              // Pacote npm: a versão é lida do package-lock.json no build.
              pkg: optional(text),
              // Versão fixa, para o que não é pacote npm.
              version: optional(text),
              url,
              note: translated,
            })
          )
          .min(1),
      })
    )
    .min(1),
})

// Identidade (nome, cargo, redes), lida do currículo em JSON Resume, que
// continua sendo a fonte. Vira uma entrada única, `basics`.
const resume = defineCollection({
  loader: file('src/data/resume.json', { parser: (json) => ({ basics: JSON.parse(json).basics }) }),
  schema: z.object({
    name: text,
    label: text,
    websiteRepo: url,
    profiles: z.array(z.object({ network: text, username: text, url })).min(1),
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
      // Série: posts com o mesmo `series` ganham navegação entre si, na ordem
      // de `seriesPart` (ver seriesOf em src/lib/blog.js).
      series: optional(text),
      seriesPart: z.preprocess(blank, z.number().int().min(1).optional()),
      cover: z.preprocess(blank, image().optional()),
      coverAlt: optional(text),
    }),
})

export const collections = { projects, stack, meta, resume, blog }
