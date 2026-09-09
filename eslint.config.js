import js from '@eslint/js'
import globals from 'globals'
import ignores from 'eslint-config-flat-gitignore'

export default [
  ignores(),
  js.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: { ...globals.node, ...globals.browser },
    },
  },
  {
    files: ['cypress/**/*.js', 'cypress.config.js'],
    languageOptions: {
      globals: { ...globals.mocha, cy: 'readonly', Cypress: 'readonly', expect: 'readonly', assert: 'readonly' },
    },
  },
]
