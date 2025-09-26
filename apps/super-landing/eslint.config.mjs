import { FlatCompat } from '@eslint/eslintrc';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Создаем полную конфигурацию в формате .eslintrc.js
const eslintrcConfig = {
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ],
  settings: {
    react: {
      version: '19.0' // Явно указываем версию React
    }
  }
};

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended
});

export default [
  js.configs.recommended,
  ...compat.config(eslintrcConfig), // Используем полную конфигурацию
  ...tseslint.configs.recommended,
  {
    ignores: [
      '.next/**', 
      'node_modules/**',
      'public/**',
      '**/*.config.js',
      '**/*.config.mjs',
      'next-env.d.ts',
      '.open-next/**',
      'out/**',
      '.contentlayer/**',
      '.wrangler/**',
      'scripts/**'
    ]
  },
  {
    files: ['**/*.{js,mjs,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        process: 'readonly',
        console: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        global: 'readonly',
        Buffer: 'readonly',
        fetch: 'readonly'
      }
    },
    // Настройки для React дублируем здесь для надежности
    settings: {
      react: {
        version: '19.0' // Та же версия, что и выше
      }
    },
    rules: {
      // Отключаем правила Next.js, которые вызывают ошибки
      '@next/next/no-duplicate-head': 'off',
      '@next/next/no-html-link-for-pages': 'off',
      '@next/next/no-img-element': 'off',
      '@next/next/no-page-custom-font': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      
      // Строгие правила TypeScript (только для файлов с type information)
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { 
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^_', 
        'ignoreRestSiblings': true 
      }],
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      
      // React Hooks правила
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      
      // Общие правила
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-alert': 'warn',
      'no-var': 'error',
      'prefer-const': 'error',
      'no-unused-expressions': 'error',
      'no-duplicate-imports': 'warn',
      'no-useless-return': 'error',
      'no-useless-constructor': 'error',
      'no-useless-catch': 'error',
      'no-useless-concat': 'error',
      'no-useless-escape': 'error',
      'no-useless-rename': 'error',
      'no-void': 'error',
      'prefer-template': 'warn',
      'prefer-arrow-callback': 'error',
      'prefer-destructuring': ['warn', {
        'array': true,
        'object': true
      }, {
        'enforceForRenamedProperties': false
      }]
    }
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        },
        project: './tsconfig.json',
        tsconfigRootDir: __dirname
      },
      globals: {
        process: 'readonly',
        console: 'readonly',
        fetch: 'readonly'
      }
    },
    settings: {
      react: {
        version: '19.0'
      }
    },
    rules: {
      // Строгие правила TypeScript для файлов с type information
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { 
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^_', 
        'ignoreRestSiblings': true 
      }],
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      
      // React Hooks правила
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      
      // Общие правила
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-alert': 'warn',
      'no-var': 'error',
      'prefer-const': 'error',
      'no-unused-expressions': 'error',
      'no-duplicate-imports': 'warn',
      'no-useless-return': 'error',
      'no-useless-constructor': 'error',
      'no-useless-catch': 'error',
      'no-useless-concat': 'error',
      'no-useless-escape': 'error',
      'no-useless-rename': 'error',
      'no-void': 'error',
      'prefer-template': 'warn',
      'prefer-arrow-callback': 'error',
      'prefer-destructuring': ['warn', {
        'array': true,
        'object': true
      }, {
        'enforceForRenamedProperties': false
      }]
    }
  }
]; 