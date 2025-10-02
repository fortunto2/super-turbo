import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/config.ts",
    config: "src/config.ts",
  },
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ["tailwindcss"],
  outDir: "dist",
  treeshake: true,
  // Исправляем предупреждения о mixed exports
  output: {
    exports: "named"
  },
  // Копируем CSS файлы
  loader: {
    ".css": "copy",
  },
  // Включаем CSS файлы в сборку
  noExternal: [],
});
