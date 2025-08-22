import { baseConfig } from "@turbo-super/tailwind/config";

const config: any = {
  ...baseConfig,
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/features/src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // Можно добавить специфичные для chatbot настройки
  theme: {
    ...baseConfig?.theme,
    extend: {
      ...baseConfig?.theme?.extend,
      // Дополнительные настройки для chatbot
    },
  },
};

export default config;
