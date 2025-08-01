import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: false,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [
    "react", 
    "react-dom",
    "@turbo-super/ui",
    "sonner",
    "clsx",
    "lucide-react"
  ],
  banner: {
    js: '"use client";',
  },
});
