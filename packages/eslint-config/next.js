module.exports = {
  extends: [
    "./index.js",
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended"
  ],
  plugins: ["@typescript-eslint"],
  rules: {
    "@next/next/no-html-link-for-pages": "off",
    "@typescript-eslint/no-unused-vars": "error",
    "react/no-unescaped-entities": "off"
  },
  env: {
    browser: true,
    node: true,
    es6: true
  }
} 