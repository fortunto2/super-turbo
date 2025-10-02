import { defineConfig } from "tsup";

export const createBaseConfig = (options: {
  entry: string | string[] | Record<string, string>;
  external?: string[];
  noExternal?: string[];
  banner?: { js?: string };
  outExtension?: (options: { format: string }) => { js: string };
}) =>
  defineConfig({
    entry: options.entry,
    format: ["cjs", "esm"],
    dts: true, // Включаем генерацию типов по умолчанию
    splitting: false,
    sourcemap: true,
    clean: true,
    treeshake: true,
    external: ["react", "react-dom", "next", ...(options.external || [])],
    noExternal: options.noExternal || [],
    banner: options.banner,
    outExtension:
      options.outExtension ||
      (({ format }) => ({
        js: format === "esm" ? ".mjs" : ".js",
      })),
    esbuildOptions(options) {
      options.jsx = "automatic";
    },
  });
