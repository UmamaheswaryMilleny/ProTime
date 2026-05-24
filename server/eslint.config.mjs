import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import globals from 'globals';

export default [
  // ─── Global ignores ──────────────────────────────────────────────────────────
  {
    ignores: ['dist/**', 'node_modules/**', 'logs/**'],
  },

  // ─── TypeScript source files ──────────────────────────────────────────────
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        // Node.js globals (process, Buffer, console, __dirname, etc.)
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      // ─── Base JS rules ──────────────────────────────────────────────
      ...js.configs.recommended.rules,

      // TypeScript's own checker already covers undefined variables,
      // so the JS no-undef rule produces false positives for TS builtins.
      'no-undef': 'off',
      'no-console': 'off',

      // ─── TypeScript-specific rules ──────────────────────────────────
      ...tsPlugin.configs.recommended.rules,

      // Warn (not error) on any — codebase uses it deliberately in some spots
      '@typescript-eslint/no-explicit-any': 'warn',

      // Ignore intentionally-unused identifiers that start with _
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',        // function / method parameters
          varsIgnorePattern: '^_',         // local variables
          caughtErrorsIgnorePattern: '^_', // catch (err: unknown) → catch (_err: unknown)
        },
      ],
    },
  },
];
