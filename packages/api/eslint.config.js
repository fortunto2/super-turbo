import js from "@eslint/js";

export default [
    {
        ignores: [
            "src/superduperai/api/**",
            "dist/**",
            "node_modules/**"
        ]
    },
    js.configs.recommended
];