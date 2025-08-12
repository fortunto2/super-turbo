import { AIProvider, ModelConfig } from "./types";
import { chatModels } from "./models";
import {
  chatModel,
  reasoningModel,
  titleModel,
  artifactModel,
} from "./test-models";

// Default AI provider configuration
export const defaultAIProvider: AIProvider = {
  id: "default",
  name: "Default AI Provider",
  type: "custom",
  config: {
    apiKey: "",
    baseURL: "",
    timeout: 30000,
  },
  models: chatModels,
};

// Legacy provider for compatibility with AI SDK
// This provides test models by default, but can be overridden in the app
export const myProvider = {
  languageModel: (modelId: string) => {
    // Return test models for compatibility with AI SDK
    // In real implementation, this would return the actual model from the provider
    const testModels: Record<string, any> = {
      "chat-model": chatModel,
      "chat-model-reasoning": reasoningModel,
      "title-model": titleModel,
      "artifact-model": artifactModel,
    };

    const testModel = testModels[modelId];
    if (testModel) {
      return testModel;
    }

    // Fallback to a generic test model
    return {
      id: modelId,
      name: modelId,
      description: `Test Model ${modelId}`,
      capabilities: ["text-generation"],
      maxTokens: 4096,
      temperature: 0.7,
      // AI SDK compatibility properties
      specificationVersion: "v1",
      provider: "mock",
      modelId: modelId,
      defaultObjectGenerationMode: "json",
      // Use doGenerate method for compatibility with AI SDK
      doGenerate: async (params: any) => ({
        rawCall: { rawPrompt: params.prompt || "", rawSettings: {} },
        finishReason: "stop",
        usage: { completionTokens: 10, promptTokens: 3 },
        text: `Generated text for: ${params.prompt || "unknown prompt"}`,
      }),
      doStream: async (params: any) => ({
        stream: {
          chunks: [
            {
              type: "text-delta",
              textDelta: `Generated text for: ${params.prompt || "unknown prompt"}`,
            },
            {
              type: "finish",
              finishReason: "stop",
              logprobs: undefined,
              usage: { completionTokens: 10, promptTokens: 3 },
            },
          ],
        },
        rawCall: { rawPrompt: params.prompt || "", rawSettings: {} },
      }),
    } as any; // Type assertion for compatibility
  },
};

// Get provider by ID
export const getProviderById = (id: string): AIProvider | undefined => {
  if (id === "default") return defaultAIProvider;
  return undefined;
};

// Get all available providers
export const getAllProviders = (): AIProvider[] => {
  return [defaultAIProvider];
};

// Validate provider configuration
export const validateProviderConfig = (config: ModelConfig): boolean => {
  return !!(config.apiKey && config.apiKey.trim().length > 0);
};

// Create custom provider
export const createCustomProvider = (
  id: string,
  name: string,
  config: ModelConfig,
  models: any[] = []
): AIProvider => {
  return {
    id,
    name,
    type: "custom",
    config,
    models: models.length > 0 ? models : chatModels,
  };
};
