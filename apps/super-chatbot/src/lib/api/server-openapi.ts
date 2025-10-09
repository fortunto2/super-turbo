import { OpenAPI } from '@turbo-super/api';
import { getSuperduperAIConfig } from '@/lib/config/superduperai';

/**
 * Инициализирует OpenAPI клиент на сервере с токеном из переменных окружения
 * Используется в серверных компонентах и API роутах
 */
export function initializeServerOpenAPI(): void {
  if (typeof window !== 'undefined') {
    throw new Error(
      'initializeServerOpenAPI should only be called on the server',
    );
  }

  const config = getSuperduperAIConfig();

  OpenAPI.BASE = config.url;
  OpenAPI.TOKEN = config.token;
}

/**
 * Получает настроенный OpenAPI клиент для сервера
 */
export function getServerOpenAPI() {
  initializeServerOpenAPI();
  return OpenAPI;
}
