/**
 * E2E тесты для админской панели
 * Тестируют функциональность управления пользователями и системой
 */

import { test, expect, type Page } from "@playwright/test";

test.describe("Admin Panel E2E Tests", () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();

    // Настройка моков для админской панели
    await page.addInitScript(() => {
      // Mock для auth с админскими правами
      window.localStorage.setItem("auth-token", "admin-token");
      window.localStorage.setItem("user-role", "admin");

      // Mock для API
      window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === "string" ? input : input.toString();
        const options = init;
        if (url.includes("/api/admin/users")) {
          if (options?.method === "GET") {
            return new Response(
              JSON.stringify({
                users: [
                  {
                    id: "user1",
                    email: "user1@example.com",
                    name: "User 1",
                    role: "user",
                  },
                  {
                    id: "user2",
                    email: "user2@example.com",
                    name: "User 2",
                    role: "user",
                  },
                  {
                    id: "user3",
                    email: "admin@example.com",
                    name: "Admin User",
                    role: "admin",
                  },
                ],
              }),
              { status: 200 }
            );
          }
          if (options?.method === "PUT") {
            return new Response(
              JSON.stringify({
                success: true,
                user: options.body ? JSON.parse(options.body as string) : {},
              }),
              { status: 200 }
            );
          }
          if (options?.method === "DELETE") {
            return new Response(
              JSON.stringify({
                success: true,
              }),
              { status: 200 }
            );
          }
        }
        if (url.includes("/api/admin/balance")) {
          return new Response(
            JSON.stringify({
              success: true,
              balance: 1000,
            }),
            { status: 200 }
          );
        }
        if (url.includes("/api/admin/add-credits")) {
          return new Response(
            JSON.stringify({
              success: true,
              newBalance: 1500,
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

  test("should access admin panel with proper authentication", async () => {
    await page.goto("/admin");

    // Проверяем, что админская панель загрузилась
    await expect(page.locator("h1")).toContainText("Admin Panel");

    // Проверяем, что видны основные разделы
    await expect(page.locator("[data-testid='users-section']")).toBeVisible();
    await expect(page.locator("[data-testid='system-section']")).toBeVisible();
    await expect(
      page.locator("[data-testid='analytics-section']")
    ).toBeVisible();
  });

  test("should deny access without admin privileges", async () => {
    // Настраиваем мок для обычного пользователя
    await page.addInitScript(() => {
      window.localStorage.setItem("user-role", "user");
    });

    await page.goto("/admin");

    // Проверяем, что доступ запрещен
    await expect(page.locator("[data-testid='access-denied']")).toBeVisible();
    await expect(page.locator("[data-testid='access-denied']")).toContainText(
      "Admin access required"
    );
  });

  test("should display users list correctly", async () => {
    await page.goto("/admin");

    // Переходим к разделу пользователей
    await page.click("[data-testid='users-tab']");

    // Проверяем, что список пользователей загрузился
    await expect(page.locator("[data-testid='users-table']")).toBeVisible();

    // Проверяем, что отображаются все пользователи
    const userRows = page.locator("[data-testid='user-row']");
    await expect(userRows).toHaveCount(3);

    // Проверяем данные первого пользователя
    await expect(userRows.nth(0)).toContainText("user1@example.com");
    await expect(userRows.nth(0)).toContainText("User 1");
    await expect(userRows.nth(0)).toContainText("user");
  });

  test("should edit user information", async () => {
    await page.goto("/admin");

    // Переходим к разделу пользователей
    await page.click("[data-testid='users-tab']");

    // Нажимаем кнопку редактирования первого пользователя
    await page.locator("[data-testid='edit-user-button']").first().click();

    // Проверяем, что открылось модальное окно редактирования
    await expect(page.locator("[data-testid='edit-user-modal']")).toBeVisible();

    // Изменяем имя пользователя
    await page.fill("[data-testid='user-name-input']", "Updated User 1");

    // Изменяем роль пользователя
    await page.selectOption("[data-testid='user-role-select']", "admin");

    // Сохраняем изменения
    await page.click("[data-testid='save-user-button']");

    // Проверяем, что модальное окно закрылось
    await expect(
      page.locator("[data-testid='edit-user-modal']")
    ).not.toBeVisible();

    // Проверяем, что изменения применились
    await expect(
      page.locator("[data-testid='user-row']").first()
    ).toContainText("Updated User 1");
    await expect(
      page.locator("[data-testid='user-row']").first()
    ).toContainText("admin");
  });

  test("should delete user", async () => {
    await page.goto("/admin");

    // Переходим к разделу пользователей
    await page.click("[data-testid='users-tab']");

    // Нажимаем кнопку удаления второго пользователя
    await page.locator("[data-testid='delete-user-button']").nth(1).click();

    // Проверяем, что появилось подтверждение удаления
    await expect(
      page.locator("[data-testid='delete-confirmation']")
    ).toBeVisible();
    await expect(
      page.locator("[data-testid='delete-confirmation']")
    ).toContainText("Are you sure you want to delete this user?");

    // Подтверждаем удаление
    await page.click("[data-testid='confirm-delete-button']");

    // Проверяем, что пользователь удален
    await expect(page.locator("[data-testid='user-row']")).toHaveCount(2);
  });

  test("should update user balance", async () => {
    await page.goto("/admin");

    // Переходим к разделу пользователей
    await page.click("[data-testid='users-tab']");

    // Нажимаем кнопку изменения баланса первого пользователя
    await page.locator("[data-testid='balance-button']").first().click();

    // Проверяем, что открылось модальное окно изменения баланса
    await expect(page.locator("[data-testid='balance-modal']")).toBeVisible();

    // Вводим новое значение баланса
    await page.fill("[data-testid='balance-input']", "1500");

    // Сохраняем изменения
    await page.click("[data-testid='save-balance-button']");

    // Проверяем, что модальное окно закрылось
    await expect(
      page.locator("[data-testid='balance-modal']")
    ).not.toBeVisible();

    // Проверяем, что баланс обновился
    await expect(
      page.locator("[data-testid='user-balance']").first()
    ).toContainText("1500");
  });

  test("should add credits to user", async () => {
    await page.goto("/admin");

    // Переходим к разделу пользователей
    await page.click("[data-testid='users-tab']");

    // Нажимаем кнопку добавления кредитов
    await page.locator("[data-testid='add-credits-button']").first().click();

    // Проверяем, что открылось модальное окно добавления кредитов
    await expect(
      page.locator("[data-testid='add-credits-modal']")
    ).toBeVisible();

    // Вводим количество кредитов для добавления
    await page.fill("[data-testid='credits-input']", "500");

    // Добавляем кредиты
    await page.click("[data-testid='add-credits-submit']");

    // Проверяем, что модальное окно закрылось
    await expect(
      page.locator("[data-testid='add-credits-modal']")
    ).not.toBeVisible();

    // Проверяем, что кредиты добавились
    await expect(
      page.locator("[data-testid='user-balance']").first()
    ).toContainText("1500");
  });

  test("should display system health", async () => {
    await page.goto("/admin");

    // Переходим к разделу системы
    await page.click("[data-testid='system-tab']");

    // Проверяем, что отображается информация о системе
    await expect(page.locator("[data-testid='system-health']")).toBeVisible();

    // Проверяем основные метрики
    await expect(page.locator("[data-testid='cpu-usage']")).toBeVisible();
    await expect(page.locator("[data-testid='memory-usage']")).toBeVisible();
    await expect(page.locator("[data-testid='disk-usage']")).toBeVisible();

    // Проверяем статус сервисов
    await expect(page.locator("[data-testid='database-status']")).toBeVisible();
    await expect(page.locator("[data-testid='api-status']")).toBeVisible();
    await expect(
      page.locator("[data-testid='websocket-status']")
    ).toBeVisible();
  });

  test("should display analytics data", async () => {
    await page.goto("/admin");

    // Переходим к разделу аналитики
    await page.click("[data-testid='analytics-tab']");

    // Проверяем, что отображается аналитика
    await expect(
      page.locator("[data-testid='analytics-dashboard']")
    ).toBeVisible();

    // Проверяем основные метрики
    await expect(page.locator("[data-testid='total-users']")).toBeVisible();
    await expect(page.locator("[data-testid='active-users']")).toBeVisible();
    await expect(
      page.locator("[data-testid='generations-today']")
    ).toBeVisible();
    await expect(page.locator("[data-testid='revenue']")).toBeVisible();

    // Проверяем графики
    await expect(page.locator("[data-testid='users-chart']")).toBeVisible();
    await expect(
      page.locator("[data-testid='generations-chart']")
    ).toBeVisible();
  });

  test("should handle bulk operations", async () => {
    await page.goto("/admin");

    // Переходим к разделу пользователей
    await page.click("[data-testid='users-tab']");

    // Выбираем несколько пользователей
    await page.locator("[data-testid='user-checkbox']").nth(0).check();
    await page.locator("[data-testid='user-checkbox']").nth(1).check();

    // Проверяем, что появились кнопки массовых операций
    await expect(page.locator("[data-testid='bulk-actions']")).toBeVisible();

    // Нажимаем кнопку массового изменения баланса
    await page.click("[data-testid='bulk-balance-button']");

    // Проверяем, что открылось модальное окно массового изменения
    await expect(
      page.locator("[data-testid='bulk-balance-modal']")
    ).toBeVisible();

    // Вводим новое значение баланса
    await page.fill("[data-testid='bulk-balance-input']", "2000");

    // Применяем изменения
    await page.click("[data-testid='bulk-balance-submit']");

    // Проверяем, что модальное окно закрылось
    await expect(
      page.locator("[data-testid='bulk-balance-modal']")
    ).not.toBeVisible();

    // Проверяем, что баланс обновился у выбранных пользователей
    await expect(
      page.locator("[data-testid='user-balance']").nth(0)
    ).toContainText("2000");
    await expect(
      page.locator("[data-testid='user-balance']").nth(1)
    ).toContainText("2000");
  });

  test("should handle search and filtering", async () => {
    await page.goto("/admin");

    // Переходим к разделу пользователей
    await page.click("[data-testid='users-tab']");

    // Используем поиск
    await page.fill("[data-testid='user-search']", "user1");

    // Проверяем, что результаты отфильтровались
    await expect(page.locator("[data-testid='user-row']")).toHaveCount(1);
    await expect(page.locator("[data-testid='user-row']")).toContainText(
      "user1@example.com"
    );

    // Очищаем поиск
    await page.fill("[data-testid='user-search']", "");

    // Проверяем, что все пользователи снова видны
    await expect(page.locator("[data-testid='user-row']")).toHaveCount(3);

    // Используем фильтр по роли
    await page.selectOption("[data-testid='role-filter']", "admin");

    // Проверяем, что отображаются только админы
    await expect(page.locator("[data-testid='user-row']")).toHaveCount(1);
    await expect(page.locator("[data-testid='user-row']")).toContainText(
      "admin"
    );
  });

  test("should handle pagination", async () => {
    // Настраиваем мок для большого количества пользователей
    await page.addInitScript(() => {
      window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === "string" ? input : input.toString();
        const options = init;
        if (url.includes("/api/admin/users")) {
          const page = Number.parseInt(
            new URL(url).searchParams.get("page") || "1"
          );
          const limit = Number.parseInt(
            new URL(url).searchParams.get("limit") || "10"
          );
          const start = (page - 1) * limit;
          const end = start + limit;

          const users = Array.from({ length: 25 }, (_, i) => ({
            id: `user${i + 1}`,
            email: `user${i + 1}@example.com`,
            name: `User ${i + 1}`,
            role: "user",
          }));

          return new Response(
            JSON.stringify({
              users: users.slice(start, end),
              total: 25,
              page,
              limit,
            }),
            { status: 200 }
          );
        }
        return new Response("Not Found", { status: 404 });
      };
    });

    await page.goto("/admin");

    // Переходим к разделу пользователей
    await page.click("[data-testid='users-tab']");

    // Проверяем, что отображается первая страница
    await expect(page.locator("[data-testid='user-row']")).toHaveCount(10);
    await expect(page.locator("[data-testid='pagination-info']")).toContainText(
      "1 of 3"
    );

    // Переходим на вторую страницу
    await page.click("[data-testid='next-page-button']");

    // Проверяем, что загрузилась вторая страница
    await expect(page.locator("[data-testid='user-row']")).toHaveCount(10);
    await expect(page.locator("[data-testid='pagination-info']")).toContainText(
      "2 of 3"
    );

    // Переходим на третью страницу
    await page.click("[data-testid='next-page-button']");

    // Проверяем, что загрузилась третья страница
    await expect(page.locator("[data-testid='user-row']")).toHaveCount(5);
    await expect(page.locator("[data-testid='pagination-info']")).toContainText(
      "3 of 3"
    );
  });
});
