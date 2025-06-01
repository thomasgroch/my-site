import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import EnvironmentPlugin from 'vite-plugin-environment'
import { readdirSync, readFileSync } from 'fs'

// Create a minimal version of the i18n resources plugin directly in the config file
function createI18nResourcesPlugin(options = {}) {
  const path = options.path || './src/locales'
  const virtualFileId = 'vite-i18n-resources'

  // Function to get all JSON files in a directory recursively
  function getFiles(dir = path, type = 'json') {
    try {
      const entries = readdirSync(dir, { withFileTypes: true })
      
      // Get JSON files in current directory
      let files = entries
        .filter(file => !file.isDirectory() && file.name.split('.').pop() === type)
        .map(file => `${dir}/${file.name}`)
      
      // Get files from subdirectories
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

  // Function to extract messages from files
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

  // Get all translation files and process them
  const files = getFiles(path, 'json')
  const messages = files.reduce(getMessages, {})

  // Return the plugin object
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
      if (!file.includes(path) || file.split('.').pop() !== 'json') return
      
      const matched = file.match(/(.+\/)*(.+)\.(.+)\.json/i)
      if (matched && matched.length > 1) {
        const updatedFiles = getFiles(path, 'json')
        const updatedMessages = updatedFiles.reduce(getMessages, {})
        
        server.ws.send({
          type: 'custom',
          event: 'locales-update',
          data: updatedMessages
        })
      }
    }
  }
}

// List of all dependencies that should be marked as external
const externalDependencies = [
  // Template engines from consolidate.js
  'velocityjs',
  'dustjs-linkedin',
  'atpl',
  'liquor',
  'twig',
  'ejs',
  'eco',
  'jazz',
  'jqtpl',
  'hamljs',
  'hamlet',
  'whiskers',
  'haml-coffee',
  'hogan.js',
  'templayed',
  'walrus',
  'mustache',
  'just',
  'ect',
  'mote',
  'toffee',
  'dot',
  'bracket-template',
  'ractive',
  'htmling',
  'babel-core',
  'plates',
  'react-dom/server',
  'react',
  'vash',
  'slm',
  'marko',
  'teacup/lib/express',
  // Additional paths
  './src/hamlc',
  '@babel/preset-typescript/package.json',
  'file',
  'system',
  // Paths from require.resolve warnings
  '../../bin/coffee',
  '../../bin/markoc'
]

// Use standard defineConfig
export default defineConfig({
  plugins: [
    // Use our custom implementation instead of the imported plugin
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
  },
  build: {
    rollupOptions: {
      external: externalDependencies
    }
  },
  optimizeDeps: {
    // Exclude problematic packages from dependency optimization
    exclude: [
      'consolidate',
      'haml-coffee',
      'walrus',
      'coffee-script',
      'marko'
    ]
  }
})
