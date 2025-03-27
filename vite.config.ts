import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import EnvironmentPlugin from 'vite-plugin-environment'

export default defineConfig({
  plugins: [
    vue({
      script: {
        defineModel: true,
        propsDestructure: true
      }
    }),
    nodePolyfills(),
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
    }
  },
  define: {
    'process.env': {},
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        index: './src/index.ts'
      },
      output: {
        assetFileNames: (assetInfo) => {
          let extType = assetInfo.name.split('.')[1]
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            extType = 'images'
          } else if (/woff|woff2|eot|ttf|otf/i.test(extType)) {
            extType = 'fonts'
          } else if (extType === 'css') {
            extType = 'css'
          }
          return `assets/${extType}/[name]-[hash][extname]`
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    }
  },
  server: {
    port: 3000,
  },
  publicDir: 'public',
  json: {
    stringify: true
  }
})

