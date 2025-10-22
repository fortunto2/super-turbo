import {
  customProvider,
} from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

// ✅ Используем @ai-sdk/google с GOOGLE_AI_API_KEY
// Это работает из коробки и поддерживает streaming + tools
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_AI_API_KEY || '',
});

// Используем модели доступные через Google AI API (не Vertex AI)
const mainModel = google('gemini-2.0-flash-exp'); // Gemini 2.0 Flash Experimental
const proModel = google('gemini-1.5-pro-latest'); // Gemini 1.5 Pro
const flashModel = google('gemini-2.0-flash-exp'); // Gemini 2.0 Flash
const nanoBananaModel = google('gemini-2.0-flash-exp'); // Nano Banana

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
