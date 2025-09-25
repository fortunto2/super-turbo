import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()] as any,
  test: {
    environment: "jsdom",
    setupFiles: ["./src/tests/helpers/setup.ts"],
    globals: true,
    css: true,
    // Конфигурация для разных типов тестов
    include: [
      "src/tests/unit/**/*.test.{ts,tsx}",
      "src/tests/integration/**/*.test.{ts,tsx}",
    ],
    // Исключаем E2E тесты (они запускаются через Playwright)
    exclude: ["src/tests/e2e/**/*.test.{ts,tsx}", "node_modules/**", "dist/**"],
    // Настройки для интеграционных тестов
    testTimeout: 10000, // 10 секунд для интеграционных тестов
    hookTimeout: 10000,
    // Параллельное выполнение тестов
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: false,
      },
    },
    // Покрытие кода
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/**",
        "src/tests/**",
        "**/*.d.ts",
        "**/*.config.*",
        "**/coverage/**",
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
