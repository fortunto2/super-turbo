import { OpenAPI } from "@turbo-super/api";
import { getSuperduperAIConfig } from "@/lib/config/superduperai";

/**
 * Настраивает OpenAPI клиент с автоматическим добавлением токена авторизации
 * Работает как на сервере, так и на клиенте
 */
export function setupOpenAPI(): void {
  if (typeof window === "undefined") {
    // На сервере - используем реальный URL и токен
    const config = getSuperduperAIConfig();
    OpenAPI.BASE = config.url;
    OpenAPI.TOKEN = config.token;
  } else {
    // На клиенте - НЕ настраиваем OpenAPI, используем только fetch interceptor
    // OpenAPI будет использовать дефолтные настройки, а fetch interceptor перехватит запросы
  }
}

/**
 * Создает заголовки авторизации для запросов
 */
export function createAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") {
    // На сервере - добавляем токен напрямую
    const config = getSuperduperAIConfig();
    return {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    };
  } else {
    // На клиенте - заголовки будут добавлены через fetch interceptor
    return {
      "Content-Type": "application/json",
    };
  }
}
