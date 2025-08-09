import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import functional from 'eslint-plugin-functional';

export default [
  {
    ignores: ['dist/**/*', 'node_modules/**/*', '*.d.ts'],
  },
  js.configs.recommended,
  {
    files: ['src/**/*.{js,ts}'],
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
      'functional/no-return-void': 'warn', // Allow void returns for side effects
      'functional/no-this-expressions': 'error',
      'functional/no-throw-statements': 'error',
      'functional/no-try-statements': 'error',
      'functional/no-classes': 'error',
      'functional/no-conditional-statements': 'error',
      'functional/no-expression-statements': 'warn', // Allow expression statements for side effects
      'functional/immutable-data': 'error',
      'functional/prefer-readonly-type': 'warn', // Allow some flexibility
      'functional/prefer-tacit': 'warn',
      'functional/functional-parameters': 'off', // Allow functions without parameters for Effect.js compatibility
      'functional/no-mixed-types': 'error',
      'functional/readonly-type': 'warn', // Allow some flexibility
      'functional/type-declaration-immutability': 'warn', // Allow some flexibility

      // Additional TypeScript strict rules
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/prefer-readonly-parameter-types': 'warn', // Allow some flexibility for Effect.ts
      '@typescript-eslint/no-unsafe-return': 'warn', // Allow for Effect.ts patterns
      '@typescript-eslint/no-unsafe-assignment': 'warn', // Allow for Effect.ts patterns

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
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        test: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
      },
    },
    rules: {
      'functional/no-expression-statements': 'off',
      'functional/no-return-void': 'off',
      'functional/functional-parameters': 'off',
      'functional/no-conditional-statements': 'off',
      'functional/immutable-data': 'off',
      'max-lines-per-function': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      'no-console': 'off',
      'no-undef': 'off',
    },
  },
  {
    // Exception rules for configuration files
    files: ['*.config.{js,ts,cjs}', 'eslint.config.js', 'jest.config.js', 'jest.config.cjs'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        // Don't use project for config files
      },
      globals: {
        process: 'readonly',
        module: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
    rules: {
      'functional/no-expression-statements': 'off',
      'functional/immutable-data': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      'functional/functional-parameters': 'off',
      'no-undef': 'off',
    },
  },
];