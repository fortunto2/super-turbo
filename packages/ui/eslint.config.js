import baseConfig from '@turbo-super/eslint-config';

export default [
  ...baseConfig,
  {
    files: ['**/*.{js,ts,tsx}'],
    ignores: ['dist/**', 'node_modules/**', '**/*.d.ts'],
  },
];
