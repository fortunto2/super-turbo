/**
 * Простое кэширование токена SuperDuperAI
 * Читает токен из env один раз и кэширует в памяти
 */

let cachedToken: string | null = null;
let tokenTimestamp = 0;

// Время жизни кэша - 30 минут (токен не меняется, но периодически перечитываем на всякий случай)
const CACHE_DURATION = 30 * 60 * 1000;

/**
 * Получить токен SuperDuperAI с кэшированием
 */
export function getSuperduperToken(): string {
  const now = Date.now();

  // Проверяем кэш
  if (cachedToken && now - tokenTimestamp < CACHE_DURATION) {
    return cachedToken;
  }

  // Читаем токен из env
  const token =
    process.env.SUPERDUPERAI_TOKEN || process.env.SUPERDUPERAI_API_KEY || "";

  if (!token) {
    throw new Error("SUPERDUPERAI_TOKEN environment variable is required");
  }

  // Кэшируем токен
  cachedToken = token;
  tokenTimestamp = now;

  return token;
}

/**
 * Очистить кэш токена (для тестов или принудительного обновления)
 */
export function clearTokenCache(): void {
  cachedToken = null;
  tokenTimestamp = 0;
}
