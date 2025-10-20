import { MockLanguageModelV2, simulateReadableStream } from 'ai/test';

// Default mock response chunks
const getDefaultResponseChunks = () => [
  { type: 'text-start', id: 'text-1' },
  { type: 'text-delta', id: 'text-1', delta: 'Hello, ' },
  { type: 'text-delta', id: 'text-1', delta: 'world!' },
  { type: 'text-end', id: 'text-1' },
  {
    type: 'finish',
    finishReason: 'stop',
    usage: { inputTokens: 3, outputTokens: 10, totalTokens: 13 },
  },
];

export const chatModel = new MockLanguageModelV2({
  doGenerate: async () => ({
    finishReason: 'stop' as const,
    usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
    content: [{ type: 'text', text: `Hello, world!` }],
    warnings: [],
  }),
  doStream: async () => ({
    stream: simulateReadableStream({
      chunkDelayInMs: 500,
      initialDelayInMs: 1000,
      chunks: getDefaultResponseChunks(),
    }),
  } as any),
});

export const reasoningModel = new MockLanguageModelV2({
  doGenerate: async () => ({
    finishReason: 'stop' as const,
    usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
    content: [{ type: 'text', text: `Hello, world!` }],
    warnings: [],
  }),
  doStream: async () => ({
    stream: simulateReadableStream({
      chunkDelayInMs: 500,
      initialDelayInMs: 1000,
      chunks: [
        // V5: reasoning chunks with start/delta/end pattern
        {
          type: 'reasoning-start',
          id: 'reasoning-1',
        },
        {
          type: 'reasoning-delta',
          id: 'reasoning-1',
          delta: 'I need to consider how to greet the user.',
        },
        {
          type: 'reasoning-delta',
          id: 'reasoning-1',
          delta: ' Based on the prompt, a simple greeting is appropriate.',
        },
        {
          type: 'reasoning-delta',
          id: 'reasoning-1',
          delta: ' A standard "Hello, world!" response will work well.',
        },
        {
          type: 'reasoning-end',
          id: 'reasoning-1',
        },
        // V5: text chunks with start/delta/end pattern
        { type: 'text-start', id: 'text-1' },
        { type: 'text-delta', id: 'text-1', delta: 'Hello, ' },
        { type: 'text-delta', id: 'text-1', delta: 'world!' },
        { type: 'text-end', id: 'text-1' },
        {
          type: 'finish',
          finishReason: 'stop',
          usage: { inputTokens: 3, outputTokens: 10, totalTokens: 13 },
        },
      ],
    }),
  }),
});

export const titleModel = new MockLanguageModelV2({
  doGenerate: async () => ({
    finishReason: 'stop' as const,
    usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
    content: [{ type: 'text', text: `This is a test title` }],
    warnings: [],
  }),
  doStream: async () => ({
    stream: simulateReadableStream({
      chunkDelayInMs: 500,
      initialDelayInMs: 1000,
      chunks: [
        { type: 'text-start', id: 'text-1' },
        { type: 'text-delta', id: 'text-1', delta: 'This is a test title' },
        { type: 'text-end', id: 'text-1' },
        {
          type: 'finish',
          finishReason: 'stop',
          usage: { inputTokens: 3, outputTokens: 10, totalTokens: 13 },
        },
      ],
    }),
  }),
});

export const artifactModel = new MockLanguageModelV2({
  doGenerate: async () => ({
    finishReason: 'stop' as const,
    usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
    content: [{ type: 'text', text: `Hello, world!` }],
    warnings: [],
  }),
  doStream: async () => ({
    stream: simulateReadableStream({
      chunkDelayInMs: 50,
      initialDelayInMs: 100,
      chunks: getDefaultResponseChunks(),
    }),
  } as any),
});
