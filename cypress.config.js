import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    // `npm run dev` sobe o site em 3000 e as funções em 8888 (proxy pelo Vite).
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:3000/',
    supportFile: false,
  },
  projectId: 'j5r4nw',
})
