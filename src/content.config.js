// Coleções de conteúdo. Cada entrada é um arquivo YAML próprio em
// src/content/<coleção>/, formato que os CMS baseados em Git editam bem.
//
// Os esquemas são o contrato do conteúdo: um campo faltando, uma URL malformada
// ou uma imagem que não existe derrubam o build, e a pipeline cancela o deploy.
import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

// Texto em português, com inglês opcional. Sem tradução, a versão em inglês do
// site mostra o português.
const bilingual = z.object({ pt: z.string().min(1), en: z.string().min(1).optional() })
// Texto obrigatório nos dois idiomas.
const translated = z.object({ pt: z.string().min(1), en: z.string().min(1) })

const projects = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      company: z.string().min(1),
      position: bilingual,
      // Índice das chaves general.project.type_N nos arquivos de idioma.
      type: z.number().int().min(0).max(3),
      startDate: z.string().regex(/^\d{4}$/, 'use só o ano, com quatro dígitos'),
      website: z.string().url().optional(),
      // Caminho relativo ao arquivo YAML; uma imagem inexistente quebra o build.
      image: image().optional(),
      summary: bilingual,
      // Desempate entre projetos do mesmo ano: menor aparece antes.
      order: z.number().int(),
    }),
})

const stack = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/stack' }),
  schema: ({ image }) =>
    z.object({
      name: z.string().min(1),
      group: z.enum(['back', 'front', 'database', 'infra', 'misc', 'history']),
      href: z.string().url(),
      logo: image(),
      order: z.number().int(),
    }),
})

const meta = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/meta' }),
  schema: z.object({
    title: translated,
    intro: translated,
    order: z.number().int(),
    items: z
      .array(
        z.object({
          name: z.string().min(1),
          nameEn: z.string().min(1).optional(),
          // Pacote npm: a versão é lida do package-lock.json no build.
          pkg: z.string().optional(),
          // Versão fixa, para o que não é pacote npm.
          version: z.string().optional(),
          url: z.string().url(),
          note: translated,
        })
      )
      .min(1),
  }),
})

export const collections = { projects, stack, meta }
