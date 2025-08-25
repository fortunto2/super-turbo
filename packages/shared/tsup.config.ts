import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "data/index": "src/data/index.ts",
    "translation/index": "src/translation/index.ts",
  },
  format: ["cjs", "esm"],
  dts: false,
  splitting: false,
  sourcemap: true,
  clean: false,
  external: ["react", "react-dom", "sonner", "clsx", "lucide-react"],
  banner: {
    js: '"use client";',
  },
});
