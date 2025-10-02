import path from "path";
import { fileURLToPath } from "url";

import { fixupConfigRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";
// import importPlugin from "eslint-plugin-import";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
    resolvePluginsRelativeTo: __dirname,
});

/** @type {import('typescript-eslint').ConfigWithExtends} */
const config = tseslint.config(
    {
        ignores: [
            ".next",
            "dist",
            "public",
            "node_modules",
            "next.config.mjs",
            "postcss.config.mjs",
            "prettier.config.cjs",
            "eslint.config.js",
            "render-storyboard.mjs",
            "render-timeline.mjs",
            "src/shared/api/**/*",
            ".contentlayer/**",
            ".wrangler/**",
            "scripts/**",
            "src/tests/**"
        ],
    },

    js.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    ...fixupConfigRules(compat.extends("plugin:@next/next/recommended")),
    ...fixupConfigRules(compat.extends("plugin:react/recommended")),
    ...fixupConfigRules(compat.extends("plugin:react-hooks/recommended")),
    ...fixupConfigRules(compat.extends("plugin:jsx-a11y/strict")),
    // ...fixupConfigRules(compat.extends("plugin:import/recommended")),
    eslintConfigPrettier,

    {
        files: ["**/*.config.js", "**/*.config.mjs", "**/*.config.ts"],
        rules: {
            "@typescript-eslint/await-thenable": "off",
        },
    },
    {
        ignores: [
            "**/node_modules/**",
            "**/.next/**",
            "**/dist/**",
            "**/build/**",
            "**/.contentlayer/**",
            "**/public/**",
        ],
        linterOptions: {
            reportUnusedDisableDirectives: true,
        },
        languageOptions: {
            parserOptions: {
                project: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        settings: {
            react: {
                version: "detect",
            },
            "import/resolver": {
                typescript: {},
            },
        },
        rules: {
            "@typescript-eslint/no-non-null-assertion": ["off"],

            "react-hooks/exhaustive-deps": ["off"],

            "jsx-a11y/no-autofocus": ["off"],

            "@typescript-eslint/require-await": ["warn"],

            "@typescript-eslint/no-unsafe-return": ["off"],


            "@typescript-eslint/no-unsafe-assignment": ["off"],

            "@typescript-eslint/no-floating-promises": ["warn"],

            "@typescript-eslint/no-empty-object-type": ["off"],

            "@typescript-eslint/consistent-type-definitions": "off",

            // Отключаем правила, которые не влияют на качество кода
            "@typescript-eslint/prefer-nullish-coalescing": ["off"],
            "@typescript-eslint/no-unnecessary-condition": ["off"],
            "@typescript-eslint/no-unsafe-argument": ["off"],

            "@typescript-eslint/no-unsafe-member-access": ["off"],

            "@typescript-eslint/no-unsafe-call": ["off"],

            "@typescript-eslint/no-explicit-any": ["off"],

            "@typescript-eslint/restrict-template-expressions": ["off"],

            "@typescript-eslint/unbound-method": ["off"],

            "@typescript-eslint/no-unused-vars": [
                "warn",
                { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
            ],

            "@typescript-eslint/consistent-type-imports": [
                "warn",
                { prefer: "type-imports", fixStyle: "separate-type-imports" },
            ],

            "@typescript-eslint/no-misused-promises": [
                "error",
                { checksVoidReturn: { attributes: false } },
            ],


            "react/react-in-jsx-scope": "off",

            "react/display-name": "off",

            // "import/no-unresolved": "error", // Disabled - plugin not available
        },
    },
);

export default config;