import type { Config } from "tailwindcss";
import { baseConfig } from "@turbo-super/tailwind/config";

const config: Config = {
  ...baseConfig,
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/tailwind/src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    ...baseConfig.theme,
    extend: {
      ...(baseConfig.theme?.extend || {}),
      backgroundImage: {
        "card-gradient":
          "linear-gradient(to left, rgb(33, 33, 33) 70%, transparent)",
      },
      colors: {
        ...(baseConfig.theme?.extend?.colors || {}),
        scene: {
          DEFAULT: "hsl(var(--scene))",
          foreground: "hsl(var(--scene-foreground))",
        },
      },
    },
  },
  plugins: [
    ...(baseConfig.plugins || []),
    // Дополнительные плагины для features
  ],
};

export default config;
