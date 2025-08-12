// AI Providers types

export interface ChatModel {
  id: string;
  name: string;
  description: string;
  capabilities?: string[];
  maxTokens?: number;
  temperature?: number;
}

export interface AIProvider {
  id: string;
  name: string;
  type: 'azure' | 'openai' | 'anthropic' | 'custom';
  config: Record<string, any>;
  models: ChatModel[];
}

export interface ModelConfig {
  apiKey: string;
  baseURL?: string;
  apiVersion?: string;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface GenerationConfig {
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}
