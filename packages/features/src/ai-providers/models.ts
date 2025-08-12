import { ChatModel } from './types';

export const DEFAULT_CHAT_MODEL: string = 'chat-model';

export const chatModels: Array<ChatModel> = [
  {
    id: 'chat-model',
    name: 'GPT-4.1',
    description: 'Advanced Azure OpenAI model with improved capabilities',
    capabilities: ['text-generation', 'reasoning', 'analysis'],
    maxTokens: 8192,
    temperature: 0.7
  },
  {
    id: 'chat-model-reasoning',
    name: 'O4-mini',
    description: 'Compact and efficient Azure OpenAI model',
    capabilities: ['text-generation', 'reasoning'],
    maxTokens: 4096,
    temperature: 0.5
  },
  {
    id: 'o3-reasoning',
    name: 'o3',
    description: 'Latest OpenAI model with advanced reasoning capabilities',
    capabilities: ['text-generation', 'reasoning', 'analysis', 'creative'],
    maxTokens: 16384,
    temperature: 0.7
  },
  {
    id: 'o3-pro-reasoning',
    name: 'o3-pro',
    description: 'Professional version of o3 with enhanced performance',
    capabilities: ['text-generation', 'reasoning', 'analysis', 'creative', 'professional'],
    maxTokens: 32768,
    temperature: 0.7
  }
];

export const getModelById = (id: string): ChatModel | undefined => {
  return chatModels.find(model => model.id === id);
};

export const getModelsByCapability = (capability: string): ChatModel[] => {
  return chatModels.filter(model => 
    model.capabilities?.includes(capability)
  );
};

export const getDefaultModel = (): ChatModel => {
  return chatModels.find(model => model.id === DEFAULT_CHAT_MODEL) || chatModels[0];
};
