import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  // AICODE-NOTE: Внешние зависимости для правильной сборки
  external: [
    "react",
    "react-dom",
    "@turbo-super/ui",
    "@turbo-super/api",
    "@turbo-super/core",
    "@turbo-super/shared",
  ],
  outDir: "dist",
  // AICODE-NOTE: Платформа node для совместимости с workspace
  platform: "node",
  // AICODE-NOTE: Включаем все workspace зависимости как external
  bundle: true,
  minify: false,
});
