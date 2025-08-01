import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/client.ts", "src/tools-page.tsx"],
  format: ["cjs", "esm"],
  dts: false, // Временно отключаем генерацию типов
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [
    "react",
    "react-dom",
    "next",
    "@turbo-super/ui",
    "@turbo-super/shared",
    "lucide-react",
    "clsx",
    "class-variance-authority",
    "tailwind-merge",
  ],
  treeshake: true,
});
