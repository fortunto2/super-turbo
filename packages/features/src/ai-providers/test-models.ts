// Test models for compatibility with AI SDK
// These are simplified versions that don't depend on external packages

// Mock response chunks for testing
const getResponseChunksByPrompt = (prompt: string) => [
  { type: "text-delta", textDelta: "Hello, world!" },
  {
    type: "finish",
    finishReason: "stop",
    logprobs: undefined,
    usage: { completionTokens: 10, promptTokens: 3 },
  },
];

// Simple mock models for testing
export const chatModel = {
  id: "chat-model",
  name: "Test Chat Model",
  description: "Test model for chat",
  doGenerate: async () => ({
    rawCall: { rawPrompt: null, rawSettings: {} },
    finishReason: "stop",
    usage: { promptTokens: 10, completionTokens: 20 },
    text: `Hello, world!`,
  }),
  doStream: async (params: { prompt: string }) => ({
    stream: {
      chunks: getResponseChunksByPrompt(params.prompt),
    },
    rawCall: { rawPrompt: null, rawSettings: {} },
  }),
};

export const reasoningModel = {
  id: "chat-model-reasoning",
  name: "Test Reasoning Model",
  description: "Test model with reasoning",
  doGenerate: async () => ({
    rawCall: { rawPrompt: null, rawSettings: {} },
    finishReason: "stop",
    usage: { promptTokens: 10, completionTokens: 20 },
    text: `Hello, world!`,
    reasoning: `This is reasoning text that explains the thought process behind the answer.`,
  }),
  doStream: async (params: { prompt: string }) => ({
    stream: {
      chunks: [
        // Сначала отправляем рассуждения (как в AI SDK 4.2)
        {
          type: "reasoning",
          textDelta: "I need to consider how to greet the user.",
        },
        {
          type: "reasoning",
          textDelta: " Based on the prompt, a simple greeting is appropriate.",
        },
        {
          type: "reasoning",
          textDelta: ' A standard "Hello, world!" response will work well.',
        },
        // Затем отправляем ответ
        { type: "text-delta", textDelta: "Hello, " },
        { type: "text-delta", textDelta: "world!" },
        {
          type: "finish",
          finishReason: "stop",
          logprobs: undefined,
          usage: { completionTokens: 10, promptTokens: 3 },
        },
      ],
    },
    rawCall: { rawPrompt: null, rawSettings: {} },
  }),
};

export const titleModel = {
  id: "title-model",
  name: "Test Title Model",
  description: "Test model for titles",
  doGenerate: async () => ({
    rawCall: { rawPrompt: null, rawSettings: {} },
    finishReason: "stop",
    usage: { promptTokens: 10, completionTokens: 20 },
    text: `This is a test title`,
  }),
  doStream: async () => ({
    stream: {
      chunks: [
        { type: "text-delta", textDelta: "This is a test title" },
        {
          type: "finish",
          finishReason: "stop",
          logprobs: undefined,
          usage: { completionTokens: 10, promptTokens: 3 },
        },
      ],
    },
    rawCall: { rawPrompt: null, rawSettings: {} },
  }),
};

export const artifactModel = {
  id: "artifact-model",
  name: "Test Artifact Model",
  description: "Test model for artifacts",
  doGenerate: async () => ({
    rawCall: { rawPrompt: null, rawSettings: {} },
    finishReason: "stop",
    usage: { promptTokens: 10, completionTokens: 20 },
    text: `Hello, world!`,
  }),
  doStream: async (params: { prompt: string }) => ({
    stream: {
      chunks: getResponseChunksByPrompt(params.prompt),
    },
    rawCall: { rawPrompt: null, rawSettings: {} },
  }),
};
