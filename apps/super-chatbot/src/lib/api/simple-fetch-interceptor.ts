/**
 * Простой fetch интерцептор для автоматического добавления токена SuperDuperAI
 */

import { getSuperduperToken } from "@/lib/config/token-cache";

// Сохраняем оригинальный fetch
const originalFetch = globalThis.fetch;

/**
 * Перехватчик fetch для автоматического добавления токена
 */

async function interceptedFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  let url: string;

  // Получаем URL из входных параметров
  if (typeof input === "string") {
    url = input;
  } else if (input instanceof URL) {
    url = input.toString();
  } else if (input instanceof Request) {
    url = input.url;
  } else {
    url = "";
  }

  // Если запрос идет к SuperDuperAI API
  if (url.includes("/api/v1/")) {
    console.log("🔍 Intercepting SuperDuperAI API request:", url);

    // На клиенте - перенаправляем через прокси
    if (typeof window !== "undefined") {
      const proxyUrl = url.replace(/^.*\/api\/v1\//, "/api/proxy/");
      console.log("🔄 Redirecting to proxy:", proxyUrl);
      return originalFetch(proxyUrl, init);
    }

    // На сервере - добавляем токен
    const token = getSuperduperToken();
    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${token}`);

    // НЕ устанавливаем Content-Type для FormData - браузер сам установит с boundary
    if (!(init.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    console.log("🔑 Added SuperDuperAI token to server request");

    return originalFetch(input, {
      ...init,
      headers,
    });
  }

  // Для всех остальных запросов - используем оригинальный fetch
  return originalFetch(input, init);
}

/**
 * Устанавливаем интерцептор
 */
export function setupFetchInterceptor(): void {
  if (globalThis.fetch !== interceptedFetch) {
    console.log("🔧 Setting up simple fetch interceptor");
    globalThis.fetch = interceptedFetch;
  }
}

/**
 * Восстанавливаем оригинальный fetch
 */
export function restoreFetch(): void {
  globalThis.fetch = originalFetch;
  console.log("🔧 Restored original fetch");
}

// Автоматически устанавливаем интерцептор при импорте
if (
  typeof globalThis !== "undefined" &&
  typeof globalThis.fetch === "function"
) {
  setupFetchInterceptor();
}
