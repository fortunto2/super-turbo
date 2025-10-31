import { customProvider } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

// ✅ Используем @ai-sdk/google с GOOGLE_AI_API_KEY
// Это работает из коробки и поддерживает streaming + tools
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_AI_API_KEY || '',
});

/**
 * Централизованная конфигурация моделей Gemini
 *
 * Быстрое переключение моделей через .env.local:
 * - GEMINI_MAIN_MODEL=gemini-2.5-flash (по умолчанию)
 * - GEMINI_PRO_MODEL=gemini-2.5-pro (по умолчанию)
 * - GEMINI_FLASH_MODEL=gemini-2.5-flash (по умолчанию)
 *
 * Доступные стабильные модели (список получен через list-gemini-models.mjs):
 * - gemini-2.5-flash - Стабильная, быстрая, июнь 2025
 * - gemini-2.5-flash-lite - Облегченная версия
 * - gemini-2.5-pro - Pro версия
 * - gemini-2.0-flash - Flash 2.0
 * - gemini-2.0-flash-001 - Стабильная 2.0
 * - gemini-flash-latest - Всегда последняя Flash
 * - gemini-pro-latest - Всегда последняя Pro
 *
 * При исчерпании квоты:
 * 1. Откройте .env.local
 * 2. Добавьте: GEMINI_MAIN_MODEL=gemini-2.0-flash
 * 3. Перезапустите сервер
 */
const GEMINI_CONFIG = {
  main: process.env.GEMINI_MAIN_MODEL || 'gemini-2.5-flash',
  pro: process.env.GEMINI_PRO_MODEL || 'gemini-2.5-pro',
  flash: process.env.GEMINI_FLASH_MODEL || 'gemini-2.5-flash',
  // Можно добавить fallback модели при исчерпании квоты
  fallback: process.env.GEMINI_FALLBACK_MODEL || 'gemini-2.0-flash-001',
};

// Логирование используемых моделей при старте
console.log('🤖 Gemini Models Configuration:');
console.log(`   Main: ${GEMINI_CONFIG.main}`);
console.log(`   Pro: ${GEMINI_CONFIG.pro}`);
console.log(`   Flash: ${GEMINI_CONFIG.flash}`);
console.log(`   Fallback: ${GEMINI_CONFIG.fallback}`);

// Создаем модели на основе конфигурации
const mainModel = google(GEMINI_CONFIG.main);
const proModel = google(GEMINI_CONFIG.pro);
const flashModel = google(GEMINI_CONFIG.flash);
const nanoBananaModel = google(GEMINI_CONFIG.main); // Nano Banana использует main модель

// Azure OpenAI (не работает - ключ истёк или неправильный endpoint)
// import { createAzure } from '@ai-sdk/azure';
// const customAzure = createAzure({
//   apiKey: process.env.AZURE_OPENAI_API_KEY || '',
//   resourceName: process.env.AZURE_OPENAI_RESOURCE_NAME || '',
//   apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2025-04-01-preview',
// });
// const mainModel = customAzure('model-router');

// Create provider - mock models are only loaded in test environment to avoid bundling vitest
export const myProvider: ReturnType<typeof customProvider> = customProvider({
  languageModels: {
    'chat-model': nanoBananaModel, // Nano Banana (Gemini 2.0 Flash) - default for chat
    'nano-banana': nanoBananaModel, // Explicit Nano Banana model
    'chat-model-reasoning': proModel, // Google Gemini 1.5 Pro
    'o3-reasoning': proModel, // Gemini Pro для reasoning
    'o3-pro-reasoning': proModel, // Gemini Pro для advanced reasoning
    'gemini-1.5-flash': flashModel, // Gemini 1.5 Flash
    'gemini-1.5-pro': proModel, // Gemini 1.5 Pro
    'gemini-2.0-flash-exp': flashModel, // Alias (2.0 not supported with API key)
    'gemini-2.5-flash-lite': flashModel, // Alias
    'title-model': flashModel, // Быстрая модель для заголовков
    'artifact-model': nanoBananaModel, // Nano Banana для артефактов
  },
});
