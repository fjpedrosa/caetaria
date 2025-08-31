import simpleImportSort from 'eslint-plugin-simple-import-sort';
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript', 'prettier'),

  {
    ignores: [
      // # Coverage
      'coverage/**/*',
      '*.lcov',

      // # Test results
      'test-results/**/*',
      'playwright-report/**/*',
      'tests/e2e/test-results/**/*',

      // # Build artifacts
      '.next/**/*',
      'dist/**/*',
      'build/**/*',

      // # Dependencies
      'node_modules/**/*',

      // # Environment files
      '.env*',
      '.env.*',
      '.env.development',
      '.env.production',
      '.env.test'
    ]
  },

  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'simple-import-sort': simpleImportSort
    },
    rules: {
      'react-refresh/only-export-components': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'simple-import-sort/exports': 'warn',
      '@next/next/no-html-link-for-pages': 'error',
      '@next/next/no-img-element': 'warn',
      '@next/next/no-sync-scripts': 'error',
      '@next/next/no-page-custom-font': 'error',
      '@next/next/no-head-element': 'error',
      '@next/next/no-css-tags': 'error',
      '@next/next/no-script-component-in-head': 'error',
      '@next/next/no-title-in-document-head': 'error',
      '@next/next/no-typos': 'warn',
      '@next/next/no-duplicate-head': 'error',
      'react/no-unescaped-entities': 'off',
      'simple-import-sort/imports': [
        'warn',
        {
          groups: [
            ['^react$', '^[a-z]', '^@'],
            ['^@/'], // alias de src
            ['^~'],
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
            ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
            ['^.+\\.s?css$'],
            ['^\\u0000']
          ]
        }
      ],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
      ],
      '@typescript-eslint/no-require-imports': 'off',
      'no-trailing-spaces': ['error'],
      quotes: ['error', 'single'],
    }
  }
];

export default eslintConfig;
