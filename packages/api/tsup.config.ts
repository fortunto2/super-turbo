import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: false, // Отключаем генерацию типов для auto-generated кода
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ["@turbo-super/core"],
  noExternal: ["@turbo-super/core"], // Включаем core в бандл
  // Игнорируем ошибки TypeScript
  onSuccess: "echo 'Build completed (ignoring TypeScript errors)'",
  // Явно указываем расширения для ESM
  outExtension({ format }) {
    return {
      js: format === "esm" ? ".mjs" : ".js",
    };
  },
});
