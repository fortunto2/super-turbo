export const DEFAULT_CHAT_MODEL: string = 'chat-model';

export interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'chat-model',
    name: 'Nano Banana',
    description:
      'Gemini 1.5 Flash - Fast and intelligent chat model with true streaming',
  },
  {
    id: 'chat-model-reasoning',
    name: 'O4-mini',
    description: 'Compact and efficient Azure OpenAI model',
  },
  {
    id: 'o3-reasoning',
    name: 'o3',
    description: 'Latest OpenAI model with advanced reasoning capabilities',
  },
  {
    id: 'o3-pro-reasoning',
    name: 'o3-pro',
    description: 'Professional version of o3 with enhanced performance',
  },
  {
    id: 'gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash Lite',
    description: 'Fast and efficient Google Gemini model for quick responses',
  },
  {
    id: 'nano-banana',
    name: 'Nano Banana Chat',
    description:
      'Gemini 1.5 Flash optimized for chat conversations with true streaming',
  },
];
