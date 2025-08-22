import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: false, // Отключаем DTS сборку из-за проблем с React типами
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: [
    "@turbo-super/core",
    "@turbo-super/api",
    "react",
    "react-dom",
    "lucide-react",
    "@turbo-super/ui",
  ],
});
