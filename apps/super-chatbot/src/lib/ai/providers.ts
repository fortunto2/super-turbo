import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";
import { createAzure } from "@ai-sdk/azure";
// Убираем импорт Vertex AI - будем использовать прямой API
import { isTestEnvironment } from "@/lib/constants";
// import {
//   chatModel,
//   reasoningModel,
//   titleModel,
//   artifactModel,
// } from "./models.test";

// Создаем настроенный экземпляр провайдера Azure
const azureApiVersion =
  process.env.AZURE_OPENAI_API_VERSION || "2024-02-15-preview";
console.log("🔧 Azure OpenAI API Version:", azureApiVersion);
console.log("🔧 All Azure env vars:", {
  apiKey: process.env.AZURE_OPENAI_API_KEY ? "***" : "NOT_SET",
  resourceName: process.env.AZURE_OPENAI_RESOURCE_NAME || "NOT_SET",
  endpoint: process.env.AZURE_OPENAI_ENDPOINT || "NOT_SET",
  apiVersion: azureApiVersion,
  region: process.env.AZURE_OPENAI_REGION || "NOT_SET",
});

// Попробуем разные способы создания Azure провайдера
let customAzure;
try {
  // Способ 1: Стандартный
  customAzure = createAzure({
    apiKey: process.env.AZURE_OPENAI_API_KEY || "",
    resourceName: process.env.AZURE_OPENAI_RESOURCE_NAME || "",
    apiVersion: azureApiVersion,
  });
  console.log("🔧 Azure provider created with standard method");
} catch (error) {
  console.log("🔧 Standard method failed, trying alternative:", error);
  try {
    // Способ 2: С endpoint
    customAzure = createAzure({
      apiKey: process.env.AZURE_OPENAI_API_KEY || "",
      endpoint: process.env.AZURE_OPENAI_ENDPOINT || "",
      apiVersion: azureApiVersion,
    });
    console.log("🔧 Azure provider created with endpoint method");
  } catch (error2) {
    console.log("🔧 Endpoint method failed, trying baseURL:", error2);
    // Способ 3: С baseURL
    customAzure = createAzure({
      apiKey: process.env.AZURE_OPENAI_API_KEY || "",
      baseURL: process.env.AZURE_OPENAI_ENDPOINT || "",
      apiVersion: azureApiVersion,
    });
    console.log("🔧 Azure provider created with baseURL method");
  }
}

console.log("🔧 Azure provider configuration:", {
  hasApiKey: !!process.env.AZURE_OPENAI_API_KEY,
  resourceName: process.env.AZURE_OPENAI_RESOURCE_NAME,
  endpoint: process.env.AZURE_OPENAI_ENDPOINT,
  apiVersion: azureApiVersion,
  region: process.env.AZURE_OPENAI_REGION,
  constructedEndpoint: `https://${process.env.AZURE_OPENAI_RESOURCE_NAME}.openai.azure.com`,
});

// Создаем модели Azure - пробуем разные имена развертывания
const mainModel = customAzure(
  process.env.AZURE_GPT41_DEPLOYMENT_NAME || "gpt-4"
);
const o4MiniModel = customAzure(
  process.env.AZURE_O4MINI_DEPLOYMENT_NAME || "o4-mini"
);
const o3Model = customAzure(process.env.AZURE_O3_DEPLOYMENT_NAME || "o3");
const o3ProModel = customAzure(
  process.env.AZURE_O3_PRO_DEPLOYMENT_NAME || "o3-pro"
);

// Создаем простую модель Gemini 2.5 Flash Lite через прямой API
// Это будет использоваться только для Gemini чата
const geminiModel = {
  // Заглушка для тестов
  provider: "google-ai-platform",
  modelId: "gemini-2.5-flash-lite",
  apiKey: process.env.GOOGLE_AI_API_KEY || "",
};

// AI SDK 5: Попробуем использовать Azure провайдер напрямую как глобальный
// Согласно документации, можно установить провайдер как глобальный
export const myProvider = customAzure;

// AI SDK 5: Устанавливаем Azure провайдер как глобальный
// Это позволяет использовать просто строки как model IDs
globalThis.AI_SDK_DEFAULT_PROVIDER = customAzure;
console.log("🔧 Global provider set:", !!globalThis.AI_SDK_DEFAULT_PROVIDER);
console.log(
  "🔧 Global provider type:",
  typeof globalThis.AI_SDK_DEFAULT_PROVIDER
);

// Также создаем старый провайдер для совместимости
export const legacyProvider = customProvider({
  languageModels: {
    "chat-model": mainModel,
    "chat-model-reasoning": wrapLanguageModel({
      model: o4MiniModel,
      middleware: extractReasoningMiddleware({ tagName: "think" }),
    }),
    "o3-reasoning": wrapLanguageModel({
      model: o3Model,
      middleware: extractReasoningMiddleware({ tagName: "think" }),
    }),
    "o3-pro-reasoning": wrapLanguageModel({
      model: o3ProModel,
      middleware: extractReasoningMiddleware({ tagName: "think" }),
    }),
    "gemini-2.5-flash-lite": geminiModel as any,
    "title-model": mainModel,
    "artifact-model": mainModel,
  },
});
