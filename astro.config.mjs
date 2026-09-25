import { defineConfig } from 'astro/config'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import sitemap from '@astrojs/sitemap'
import mdx from '@astrojs/mdx'
import { shikiTransformers } from './src/lib/shiki.js'

export default defineConfig({
  site: 'https://thomasdev.xyz',
  integrations: [
    mdx(),
    sitemap({
      // Gera <xhtml:link hreflang> entre as duas versões de cada página.
      i18n: {
        defaultLocale: 'pt',
        locales: { pt: 'pt-BR', en: 'en' },
      },
      filter: (page) => !page.includes('/404'),
    }),
  ],
  markdown: {
    // Dois temas, trocados por CSS pela classe `dark` (BlogPost.astro).
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
      transformers: shikiTransformers,
    },
  },
  vite: {
    // Tailwind 4: configuração fica no próprio CSS (src/tailwind.css).
    plugins: [tailwindcss()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: {
      // Em dev o formulário fala com `netlify functions:serve` (porta 8888)
      // pela mesma origem, igual à produção. Sem CORS.
      proxy: { '/.netlify/functions': 'http://localhost:8888' },
    },
  },
})
