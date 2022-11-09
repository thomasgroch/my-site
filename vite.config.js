import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import EnvironmentPlugin from 'vite-plugin-environment'
import i18nResources from "vite-plugin-i18n-resources"

export default defineConfig({
  plugins: [
  i18nResources({
    path: resolve(__dirname, "src/locales"),
  }),
	vue(),
	EnvironmentPlugin({
    NODE_ENV: 'local',
    URL: '',
    NODE_VERSION: '',
    REPOSITORY_URL: '',
    COMMIT_REF: '',
    BRANCH: '',
    NETLIFY_IMAGES_CDN_DOMAIN: '',
    CONTEXT: '',
  }, { defineOn: 'import.meta.env' }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '~': resolve(__dirname, 'src/assets'),
    },
  },
  server: {
    open: false,
  },
})
