import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  noExternal: ["@radix-ui/colors"], // Исключаем radix-ui colors из внешних зависимостей
  external: [
    "@turbo-super/core",
    "@turbo-super/api",
    "react",
    "react-dom",
    "lucide-react",
    "@turbo-super/ui",
  ],
  // Исключаем CSS из сборки
  outExtension({ format }) {
    return {
      js: format === "cjs" ? ".js" : ".mjs",
    };
  },
});
