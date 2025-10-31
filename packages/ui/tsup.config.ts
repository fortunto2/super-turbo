import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  splitting: false,
  sourcemap: true,

  clean: true,
  external: [
    "react",
    "react-dom",
    "sonner",
    "clsx",
    "lucide-react",
    "class-variance-authority",
    "tailwind-merge",
  ],
  esbuildOptions(options) {
    options.jsx = "automatic";
  },
});
