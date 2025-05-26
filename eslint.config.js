import js from '@eslint/js';
import ignores from 'eslint-config-flat-gitignore';
import vuePlugin from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';

// Basic configuration with support for Vue, Cypress, and Node.js
export default [
  // Use gitignore patterns
  ignores(),
  
  // Base JS config
  js.configs.recommended,
  
  // Node.js files (including CommonJS)
  {
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        // Node.js globals
        module: 'writable',
        require: 'readonly',
        process: 'readonly',
        console: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        exports: 'writable',
        // Browser globals
        document: 'readonly',
        window: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly'
      }
    },
    rules: {
      // Be more lenient with unused vars for now
      'no-unused-vars': 'warn',
      'no-undef': 'warn'
    }
  },
  
  // Vue files
  {
    files: ['**/*.vue'],
    plugins: {
      vue: vuePlugin
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parser: vueParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        },
        // Extract script blocks from .vue files and parse them as JS/TS
        vueFeatures: {
          filter: true,
          interpolationAsNonHTML: false
        }
      },
      globals: {
        // Browser globals
        document: 'readonly',
        window: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        // Node.js globals that might be used in Vue files
        process: 'readonly',
        // Vue global properties
        defineProps: 'readonly',
        defineEmits: 'readonly',
        defineExpose: 'readonly',
        withDefaults: 'readonly'
      }
    },
    // Use a more minimal set of rules for Vue files to start
    rules: {
      // Disable comment directive since it's causing issues
      'vue/comment-directive': 'off',
      'vue/no-parsing-error': 'warn',
      // Be more lenient with unused vars for now
      'no-unused-vars': 'warn',
      'no-undef': 'warn'
    }
  },
  
  // Cypress test files
  {
    files: ['**/*.cy.js', 'cypress/**/*.js', 'cypress.config.js'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: {
        // Cypress-specific globals
        cy: 'readonly',
        Cypress: 'readonly',
        describe: 'readonly',
        context: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        assert: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        before: 'readonly',
        after: 'readonly',
        // Node.js globals
        module: 'writable',
        require: 'readonly',
        process: 'readonly',
        console: 'readonly',
        // Browser globals for browser-based testing
        document: 'readonly',
        window: 'readonly',
        localStorage: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly'
      }
    },
    rules: {
      // Be more lenient with unused vars for now
      'no-unused-vars': 'warn',
      'no-undef': 'warn'
    }
  }
];

