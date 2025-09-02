import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true, // Отключаем DTS сборку из-за проблем с workspace зависимостями
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ["react", "react-dom", "@turbo-super/ui"],
  outDir: "dist",
});
