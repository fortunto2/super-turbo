/**
 * E2E тесты для основного потока чата
 * Тестируют полный пользовательский сценарий от входа до генерации контента
 */

import { test, expect, type Page } from "@playwright/test";

test.describe("Chat Flow E2E Tests", () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();

    // Настройка моков для тестовой среды
    await page.addInitScript(() => {
      // Mock для auth
      window.localStorage.setItem("auth-token", "test-token");

      // Mock для API
      window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === "string" ? input : input.toString();
        if (url.includes("/api/chat")) {
          return new Response(
            JSON.stringify({
              messages: [
                { role: "user", content: "Hello" },
                { role: "assistant", content: "Hello! How can I help you?" },
              ],
            }),
            { status: 200 }
          );
        }
        if (url.includes("/api/generate/image")) {
          return new Response(
            JSON.stringify({
              url: "https://example.com/test-image.jpg",
              id: "test-image-id",
            }),
            { status: 200 }
          );
        }
        if (url.includes("/api/generate/video")) {
          return new Response(
            JSON.stringify({
              url: "https://example.com/test-video.mp4",
              id: "test-video-id",
            }),
            { status: 200 }
          );
        }
        return new Response("Not Found", { status: 404 });
      };
    });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test("should complete full chat flow", async () => {
    // 1. Переход на главную страницу
    await page.goto("/");

    // Проверяем, что страница загрузилась
    await expect(page.locator("h1")).toContainText("Super Turbo");

    // 2. Создание нового чата
    await page.click("[data-testid='new-chat-button']");

    // Проверяем, что открылся интерфейс чата
    await expect(page.locator("[data-testid='chat-input']")).toBeVisible();

    // 3. Отправка сообщения
    await page.fill(
      "[data-testid='chat-input']",
      "Create a beautiful sunset image"
    );
    await page.click("[data-testid='send-button']");

    // Проверяем, что сообщение появилось в чате
    await expect(page.locator("[data-testid='user-message']")).toContainText(
      "Create a beautiful sunset image"
    );

    // 4. Ожидание ответа от AI
    await expect(
      page.locator("[data-testid='assistant-message']")
    ).toBeVisible();
    await expect(
      page.locator("[data-testid='assistant-message']")
    ).toContainText("Hello! How can I help you?");

    // 5. Проверяем, что появились кнопки действий
    await expect(
      page.locator("[data-testid='image-generate-button']")
    ).toBeVisible();
    await expect(
      page.locator("[data-testid='video-generate-button']")
    ).toBeVisible();
  });

  test("should generate image successfully", async () => {
    await page.goto("/");

    // Создаем чат и отправляем сообщение
    await page.click("[data-testid='new-chat-button']");
    await page.fill(
      "[data-testid='chat-input']",
      "Create a beautiful sunset image"
    );
    await page.click("[data-testid='send-button']");

    // Ждем ответа
    await expect(
      page.locator("[data-testid='assistant-message']")
    ).toBeVisible();

    // Нажимаем кнопку генерации изображения
    await page.click("[data-testid='image-generate-button']");

    // Проверяем, что открылся интерфейс генерации изображения
    await expect(
      page.locator("[data-testid='image-generator-form']")
    ).toBeVisible();

    // Заполняем форму генерации
    await page.fill(
      "[data-testid='prompt-input']",
      "A beautiful sunset over the ocean"
    );
    await page.selectOption("[data-testid='style-select']", "photorealistic");
    await page.selectOption("[data-testid='size-select']", "1024x1024");

    // Запускаем генерацию
    await page.click("[data-testid='generate-button']");

    // Проверяем, что появился индикатор загрузки
    await expect(
      page.locator("[data-testid='generation-progress']")
    ).toBeVisible();

    // Ждем завершения генерации (в реальном тесте это может занять больше времени)
    await page.waitForSelector("[data-testid='generated-image']", {
      timeout: 30000,
    });

    // Проверяем, что изображение сгенерировалось
    const image = page.locator("[data-testid='generated-image']");
    await expect(image).toBeVisible();
    await expect(image).toHaveAttribute(
      "src",
      /https:\/\/example\.com\/test-image\.jpg/
    );
  });

  test("should generate video successfully", async () => {
    await page.goto("/");

    // Создаем чат и отправляем сообщение
    await page.click("[data-testid='new-chat-button']");
    await page.fill("[data-testid='chat-input']", "Create a video of a sunset");
    await page.click("[data-testid='send-button']");

    // Ждем ответа
    await expect(
      page.locator("[data-testid='assistant-message']")
    ).toBeVisible();

    // Нажимаем кнопку генерации видео
    await page.click("[data-testid='video-generate-button']");

    // Проверяем, что открылся интерфейс генерации видео
    await expect(
      page.locator("[data-testid='video-generator-form']")
    ).toBeVisible();

    // Заполняем форму генерации
    await page.fill(
      "[data-testid='prompt-input']",
      "A beautiful sunset over the ocean"
    );
    await page.selectOption("[data-testid='model-select']", "veo-3");
    await page.selectOption("[data-testid='style-select']", "cinematic");
    await page.selectOption("[data-testid='resolution-select']", "1920x1080");
    await page.fill("[data-testid='duration-input']", "5");

    // Запускаем генерацию
    await page.click("[data-testid='generate-button']");

    // Проверяем, что появился индикатор загрузки
    await expect(
      page.locator("[data-testid='generation-progress']")
    ).toBeVisible();

    // Ждем завершения генерации
    await page.waitForSelector("[data-testid='generated-video']", {
      timeout: 60000,
    });

    // Проверяем, что видео сгенерировалось
    const video = page.locator("[data-testid='generated-video']");
    await expect(video).toBeVisible();
    await expect(video).toHaveAttribute(
      "src",
      /https:\/\/example\.com\/test-video\.mp4/
    );
  });

  test("should handle generation errors gracefully", async () => {
    // Настраиваем мок для возврата ошибки
    await page.addInitScript(() => {
      window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === "string" ? input : input.toString();
        if (url.includes("/api/generate/image")) {
          return new Response(
            JSON.stringify({
              error: "Generation failed",
            }),
            { status: 500 }
          );
        }
        return new Response("Not Found", { status: 404 });
      };
    });

    await page.goto("/");

    // Создаем чат и отправляем сообщение
    await page.click("[data-testid='new-chat-button']");
    await page.fill("[data-testid='chat-input']", "Create an image");
    await page.click("[data-testid='send-button']");

    // Ждем ответа
    await expect(
      page.locator("[data-testid='assistant-message']")
    ).toBeVisible();

    // Нажимаем кнопку генерации изображения
    await page.click("[data-testid='image-generate-button']");

    // Заполняем форму и запускаем генерацию
    await page.fill("[data-testid='prompt-input']", "Test prompt");
    await page.click("[data-testid='generate-button']");

    // Проверяем, что появилось сообщение об ошибке
    await expect(page.locator("[data-testid='error-message']")).toBeVisible();
    await expect(page.locator("[data-testid='error-message']")).toContainText(
      "Generation failed"
    );

    // Проверяем, что есть кнопка повтора
    await expect(page.locator("[data-testid='retry-button']")).toBeVisible();
  });

  test("should save and load chat history", async () => {
    await page.goto("/");

    // Создаем чат
    await page.click("[data-testid='new-chat-button']");
    await page.fill(
      "[data-testid='chat-input']",
      "Hello, this is a test message"
    );
    await page.click("[data-testid='send-button']");

    // Ждем ответа
    await expect(
      page.locator("[data-testid='assistant-message']")
    ).toBeVisible();

    // Сохраняем чат
    await page.click("[data-testid='save-chat-button']");

    // Проверяем, что чат появился в истории
    await expect(page.locator("[data-testid='chat-history']")).toBeVisible();
    await expect(page.locator("[data-testid='chat-item']")).toContainText(
      "Hello, this is a test message"
    );

    // Переходим к другому чату
    await page.click("[data-testid='new-chat-button']");

    // Возвращаемся к сохраненному чату
    await page.click("[data-testid='chat-item']");

    // Проверяем, что сообщения загрузились
    await expect(page.locator("[data-testid='user-message']")).toContainText(
      "Hello, this is a test message"
    );
    await expect(
      page.locator("[data-testid='assistant-message']")
    ).toBeVisible();
  });

  test("should handle multiple concurrent generations", async () => {
    await page.goto("/");

    // Создаем чат
    await page.click("[data-testid='new-chat-button']");
    await page.fill(
      "[data-testid='chat-input']",
      "Create both an image and video"
    );
    await page.click("[data-testid='send-button']");

    // Ждем ответа
    await expect(
      page.locator("[data-testid='assistant-message']")
    ).toBeVisible();

    // Запускаем генерацию изображения
    await page.click("[data-testid='image-generate-button']");
    await page.fill("[data-testid='prompt-input']", "Test image");
    await page.click("[data-testid='generate-button']");

    // Запускаем генерацию видео в новом окне
    const newPage = await page.context().newPage();
    await newPage.goto("/");
    await newPage.click("[data-testid='new-chat-button']");
    await newPage.click("[data-testid='video-generate-button']");
    await newPage.fill("[data-testid='prompt-input']", "Test video");
    await newPage.click("[data-testid='generate-button']");

    // Проверяем, что обе генерации работают независимо
    await expect(
      page.locator("[data-testid='generation-progress']")
    ).toBeVisible();
    await expect(
      newPage.locator("[data-testid='generation-progress']")
    ).toBeVisible();

    await newPage.close();
  });

  test("should handle WebSocket disconnection and reconnection", async () => {
    await page.goto("/");

    // Создаем чат
    await page.click("[data-testid='new-chat-button']");

    // Симулируем отключение WebSocket
    await page.evaluate(() => {
      // Mock для WebSocket
      const mockWebSocket = {
        readyState: 3, // CLOSED
        close: () => {},
        send: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
      };
      (window as any).WebSocket = class MockWebSocket {
        static readonly CONNECTING = 0;
        static readonly OPEN = 1;
        static readonly CLOSING = 2;
        static readonly CLOSED = 3;
        readonly CONNECTING = 0;
        readonly OPEN = 1;
        readonly CLOSING = 2;
        readonly CLOSED = 3;
        constructor() {
          return mockWebSocket as any;
        }
      };
    });

    // Пытаемся отправить сообщение
    await page.fill("[data-testid='chat-input']", "Test message");
    await page.click("[data-testid='send-button']");

    // Проверяем, что появилось сообщение о проблемах с подключением
    await expect(
      page.locator("[data-testid='connection-error']")
    ).toBeVisible();

    // Симулируем восстановление подключения
    await page.evaluate(() => {
      const mockWebSocket = {
        readyState: 1, // OPEN
        close: () => {},
        send: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
      };
      (window as any).WebSocket = class MockWebSocket {
        static readonly CONNECTING = 0;
        static readonly OPEN = 1;
        static readonly CLOSING = 2;
        static readonly CLOSED = 3;
        readonly CONNECTING = 0;
        readonly OPEN = 1;
        readonly CLOSING = 2;
        readonly CLOSED = 3;
        constructor() {
          return mockWebSocket as any;
        }
      };
    });

    // Проверяем, что подключение восстановилось
    await expect(
      page.locator("[data-testid='connection-status']")
    ).toContainText("Connected");
  });
});
