import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "data/index": "src/data/index.ts"
  },
  format: ["cjs", "esm"],
  dts: false,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [
    "react", 
    "react-dom",
    "sonner",
    "clsx",
    "lucide-react"
  ],
  banner: {
    js: '"use client";',
  },
});
