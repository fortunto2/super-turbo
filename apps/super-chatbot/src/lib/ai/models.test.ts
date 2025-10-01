import { simulateReadableStream } from "ai";
import { MockLanguageModelV2 } from "ai/test";
import { getResponseChunksByPrompt } from "@/tests/prompts/utils";

export const chatModel = new MockLanguageModelV2({
  doGenerate: async () => ({
    rawCall: { rawPrompt: null, rawSettings: {} },
    finishReason: "stop",
    usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
    content: [{ type: "text", text: `Hello, world!` }],
    warnings: [],
  }),
  // supportsStructuredOutputs: true as const, // Removed in AI SDK v5
  doStream: async ({ prompt }: any) => ({
    stream: simulateReadableStream({
      chunkDelayInMs: 500,
      initialDelayInMs: 1000,
      chunks: getResponseChunksByPrompt(prompt),
    }),
    rawCall: { rawPrompt: null, rawSettings: {} },
  }),
});

export const reasoningModel = new MockLanguageModelV2({
  doGenerate: async () => ({
    rawCall: { rawPrompt: null, rawSettings: {} },
    finishReason: "stop",
    usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
    content: [{ type: "text", text: `Hello, world!` }],
    warnings: [],
  }),
  // supportsStructuredOutputs: true as const, // Removed in AI SDK v5
  doStream: async ({ prompt }: any) => ({
    stream: simulateReadableStream({
      chunkDelayInMs: 500,
      initialDelayInMs: 1000,
      chunks: [
        // Сначала отправляем рассуждения (как в AI SDK 4.2)
        {
          type: "text-delta",
          id: "test-id",
          delta: "I need to consider how to greet the user.",
        },
        {
          type: "text-delta",
          id: "test-id",
          delta: " Based on the prompt, a simple greeting is appropriate.",
        },
        {
          type: "text-delta",
          id: "test-id",
          delta: ' A standard "Hello, world!" response will work well.',
        },
        // Затем отправляем ответ
        { type: "text-delta", id: "test-id", delta: "Hello, " },
        { type: "text-delta", id: "test-id", delta: "world!" },
        {
          type: "finish",
          finishReason: "stop",
          usage: { outputTokens: 10, inputTokens: 3, totalTokens: 13 },
        },
      ],
    }),
    rawCall: { rawPrompt: null, rawSettings: {} },
  }),
});

export const titleModel = new MockLanguageModelV2({
  doGenerate: async () => ({
    rawCall: { rawPrompt: null, rawSettings: {} },
    finishReason: "stop",
    usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
    content: [{ type: "text", text: `This is a test title` }],
    warnings: [],
  }),
  doStream: async () => ({
    stream: simulateReadableStream({
      chunkDelayInMs: 500,
      initialDelayInMs: 1000,
      chunks: [
        { type: "text-delta", id: "test-id", delta: "This is a test title" },
        {
          type: "finish",
          finishReason: "stop",
          usage: { outputTokens: 10, inputTokens: 3, totalTokens: 13 },
        },
      ],
    }),
    rawCall: { rawPrompt: null, rawSettings: {} },
  }),
});

export const artifactModel = new MockLanguageModelV2({
  doGenerate: async () => ({
    rawCall: { rawPrompt: null, rawSettings: {} },
    finishReason: "stop",
    usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
    content: [{ type: "text", text: `Hello, world!` }],
    warnings: [],
  }),
  // supportsStructuredOutputs: true as const, // Removed in AI SDK v5
  doStream: async ({ prompt }: any) => ({
    stream: simulateReadableStream({
      chunkDelayInMs: 50,
      initialDelayInMs: 100,
      chunks: getResponseChunksByPrompt(prompt),
    }),
    rawCall: { rawPrompt: null, rawSettings: {} },
  }),
});
