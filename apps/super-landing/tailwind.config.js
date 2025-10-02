/* eslint-env node */
/* eslint-disable no-undef, @typescript-eslint/no-require-imports */
const { baseConfig } = require("@turbo-super/tailwind/config");

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...baseConfig,
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/features/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // Можно добавить специфичные для landing настройки
  theme: {
    ...baseConfig.theme,
    extend: {
      ...baseConfig.theme.extend,
      // Дополнительные настройки для landing
    },
  },
}; 