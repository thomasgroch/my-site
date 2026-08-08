import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import EnvironmentPlugin from 'vite-plugin-environment'
import { readdirSync, readFileSync } from 'fs'

function createI18nResourcesPlugin(options = {}) {
  const localesPath = options.path || './src/locales'
  const virtualFileId = 'vite-i18n-resources'

  function getFiles(dir = localesPath, type = 'json') {
    try {
      const entries = readdirSync(dir, { withFileTypes: true })
      let files = entries
        .filter(file => !file.isDirectory() && file.name.split('.').pop() === type)
        .map(file => `${dir}/${file.name}`)

      entries
        .filter(entry => entry.isDirectory())
        .forEach(folder => {
          files = files.concat(getFiles(`${dir}/${folder.name}`, type))
        })

      return files
    } catch (error) {
      console.error(`[i18n-resources] Error reading directory: ${error.message}`)
      return []
    }
  }

  function getMessages(messages, file) {
    try {
      const matched = file.match(/(.+\/)*(.+)\.(.+)\.json/i)
      if (matched && matched.length > 1) {
        const lang = matched[3]
        const section = matched[2]

        if (!messages[lang]) {
          messages[lang] = {}
        }

        const data = readFileSync(file)
        messages[lang][section] = JSON.parse(data)
      }

      return messages
    } catch (error) {
      console.error(`[i18n-resources] Error processing file ${file}: ${error.message}`)
      return messages
    }
  }

  const files = getFiles(localesPath, 'json')
  const messages = files.reduce(getMessages, {})

  return {
    name: 'vite-plugin-i18n-resources',
    resolveId(id) {
      if (id === virtualFileId) {
        return virtualFileId
      }
    },
    load(id) {
      if (id === virtualFileId) {
        return `export const messages = ${JSON.stringify(messages)}`
      }
    },
    handleHotUpdate({ file, server }) {
      if (!file.includes(localesPath) || file.split('.').pop() !== 'json') return

      const updatedFiles = getFiles(localesPath, 'json')
      const updatedMessages = updatedFiles.reduce(getMessages, {})

      server.ws.send({
        type: 'custom',
        event: 'locales-update',
        data: updatedMessages
      })
    }
  }
}

export default defineConfig({
  plugins: [
    createI18nResourcesPlugin({
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
    open: false
  }
})
