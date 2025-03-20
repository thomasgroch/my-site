import { defineConfig } from '@rsbuild/core';
import { pluginVue } from '@rsbuild/plugin-vue';
import { pluginStylus } from '@rsbuild/plugin-stylus';
import { pluginNodePolyfill } from '@rsbuild/plugin-node-polyfill';
import { resolve } from 'path';

// Load environment variables
// const envVars = {
//   'process.env.PUBLIC_NODE_ENV': process.env.PUBLIC_NODE_ENV || 'development',
//   'process.env.PUBLIC_URL': process.env.PUBLIC_URL || '',
//   'process.env.PUBLIC_NODE_VERSION': process.env.PUBLIC_NODE_VERSION || '',
//   'process.env.PUBLIC_REPOSITORY_URL': process.env.PUBLIC_REPOSITORY_URL || '',
//   'process.env.PUBLIC_COMMIT_REF': process.env.PUBLIC_COMMIT_REF || '',
//   'process.env.PUBLIC_BRANCH': process.env.PUBLIC_BRANCH || '',
//   'process.env.PUBLIC_NETLIFY_IMAGES_CDN_DOMAIN': process.env.PUBLIC_NETLIFY_IMAGES_CDN_DOMAIN || '',
//   'process.env.PUBLIC_CONTEXT': process.env.PUBLIC_CONTEXT || '',
// };

export default defineConfig({
  plugins: [
    pluginVue(),
    pluginStylus(),
    pluginNodePolyfill(),
  ],
  source: {
    entry: {
      index: './src/index.js'
    },
    alias: {
      '@': resolve(__dirname, 'src'),
      '~': resolve(__dirname, 'src/assets'),
    },
    // define: envVars,
  },
  output: {
    distPath: {
      root: 'dist',
      js: 'assets/js',
      css: 'assets/css',
      svg: 'assets/svg',
      font: 'assets/fonts',
      image: 'assets/images',
      media: 'assets/media',
    },
  },
  dev: {
    startUrl: false,
  },
  html: {
    template: './public/index.html',
    title: 'Thomas Groch',
    inject: 'body',
    templateParameters: {
      PUBLIC_URL: ''
    }
  },
  server: {
    publicPath: '/',
  },
});
