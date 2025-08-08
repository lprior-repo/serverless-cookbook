import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import functional from 'eslint-plugin-functional';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.eslint.json',
      },
      globals: {
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        console: 'readonly',
        global: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      functional,
    },
    rules: {
      // TypeScript ESLint recommended rules
      ...tsPlugin.configs.recommended.rules,
      ...tsPlugin.configs['recommended-requiring-type-checking'].rules,
      
      // Strict functional programming rules
      'functional/no-let': 'error',
      'functional/no-loop-statements': 'error',
      'functional/no-return-void': 'error',
      'functional/no-this-expressions': 'error',
      'functional/no-throw-statements': 'error',
      'functional/no-try-statements': 'error',
      'functional/no-classes': 'error',
      'functional/no-conditional-statements': 'error',
      'functional/no-expression-statements': 'error',
      'functional/immutable-data': 'error',
      'functional/prefer-readonly-type': 'error',
      'functional/prefer-tacit': 'warn',
      'functional/functional-parameters': 'error',
      'functional/no-mixed-types': 'error',
      'functional/readonly-type': 'error',
      'functional/type-declaration-immutability': 'error',

      // Additional TypeScript strict rules
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/prefer-readonly-parameter-types': 'error',

      // General JavaScript/TypeScript rules
      'no-var': 'error',
      'prefer-const': 'error',
      'no-param-reassign': 'error',
      'no-console': 'warn',
      'complexity': ['error', 5],
      'max-depth': ['error', 2],
      'max-params': ['error', 3],
      'max-lines-per-function': ['error', { max: 25, skipBlankLines: true, skipComments: true }],
    },
  },
  {
    // Exception rules for test files
    files: ['**/*.test.{js,ts}', '**/__tests__/**/*.{js,ts}'],
    rules: {
      'functional/no-expression-statements': 'off',
      'functional/no-return-void': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      'no-console': 'off',
    },
  },
  {
    // Exception rules for configuration files
    files: ['*.config.{js,ts}', 'eslint.config.js'],
    rules: {
      'functional/no-expression-statements': 'off',
      'functional/immutable-data': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },
];