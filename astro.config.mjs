import { defineConfig } from 'astro/config'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import sitemap from '@astrojs/sitemap'
import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import keystatic from '@keystatic/astro'

// O painel do Keystatic (/keystatic) grava direto nos arquivos de src/content
// e só existe no `astro dev`. Suas rotas não são pré-renderizáveis, então
// ficam fora do build: o site publicado continua estático, sem adapter e sem
// React. Só o painel usa React.
const admin = process.argv.includes('dev') ? [react(), keystatic()] : []

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
    ...admin,
  ],
  markdown: {
    // Dois temas, trocados por CSS pela classe `dark` (BlogPost.astro).
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
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
