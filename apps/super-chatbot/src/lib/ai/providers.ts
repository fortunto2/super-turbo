import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { createAzure } from '@ai-sdk/azure';
// Убираем импорт Vertex AI - будем использовать прямой API
import { isTestEnvironment } from '@/lib/constants';
import {
  chatModel,
  reasoningModel,
  titleModel,
  artifactModel,
} from './models.mock';

// Создаем настроенный экземпляр провайдера Azure
const customAzure = createAzure({
  apiKey: process.env.AZURE_OPENAI_API_KEY || '',
  resourceName: process.env.AZURE_OPENAI_RESOURCE_NAME || '',
  apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-05-01-preview',
  useDeploymentBasedUrls: true, // Enable deployment-based URLs for Azure
});

// Создаем модели Azure
const mainModel = customAzure(
  process.env.AZURE_GPT41_DEPLOYMENT_NAME || 'gpt-4.1',
);
const o4MiniModel = customAzure(
  process.env.AZURE_O4MINI_DEPLOYMENT_NAME || 'o4-mini',
);
const o3Model = customAzure(process.env.AZURE_O3_DEPLOYMENT_NAME || 'o3');
const o3ProModel = customAzure(
  process.env.AZURE_O3_PRO_DEPLOYMENT_NAME || 'o3-pro',
);

// Создаем простую модель Gemini 2.5 Flash Lite через прямой API
// Это будет использоваться только для Gemini чата
const geminiModel = {
  // Заглушка для тестов
  provider: 'google-ai-platform',
  modelId: 'gemini-2.5-flash-lite',
  apiKey: process.env.GOOGLE_AI_API_KEY || '',
};

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model': chatModel as any,
        'chat-model-reasoning': reasoningModel as any,
        'title-model': titleModel as any,
        'artifact-model': artifactModel as any,
        'gemini-2.5-flash-lite': chatModel as any, // Используем mock для тестов
      },
    })
  : customProvider({
      languageModels: {
        'chat-model': mainModel,
        'chat-model-reasoning': wrapLanguageModel({
          model: o4MiniModel,
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'o3-reasoning': wrapLanguageModel({
          model: o3Model,
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'o3-pro-reasoning': wrapLanguageModel({
          model: o3ProModel,
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'gemini-2.5-flash-lite': geminiModel as any,
        'title-model': mainModel,
        'artifact-model': mainModel,
      },
    });
