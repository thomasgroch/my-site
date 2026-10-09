import js from '@eslint/js'
import globals from 'globals'
import ignores from 'eslint-config-flat-gitignore'

export default [
  ignores(),
  // Biblioteca de terceiros, copiada como está (ver o cabeçalho do arquivo).
  { ignores: ['public/vendor/**'] },
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
