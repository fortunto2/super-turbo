import type { CoreMessage } from 'ai';
import { TEST_PROMPTS } from './basic';

// AI SDK v5: LanguageModelV1StreamPart is no longer exported
// Define stream part types locally for test purposes matching LanguageModelV2StreamPart
type StreamPart =
  | { type: 'text-delta'; id: string; delta: string }
  | { type: 'reasoning'; id: string; delta: string }
  | {
      type: 'tool-call';
      toolCallId: string;
      toolName: string;
      toolCallType: string;
      args: string;
    }
  | {
      type: 'finish';
      finishReason: string;
      usage: { completionTokens: number; promptTokens: number };
    };

export function compareMessages(
  firstMessage: CoreMessage,
  secondMessage: CoreMessage,
): boolean {
  if (firstMessage.role !== secondMessage.role) return false;

  if (
    !Array.isArray(firstMessage.content) ||
    !Array.isArray(secondMessage.content)
  ) {
    return false;
  }

  if (firstMessage.content.length !== secondMessage.content.length) {
    return false;
  }

  for (let i = 0; i < firstMessage.content.length; i++) {
    const item1 = firstMessage.content[i];
    const item2 = secondMessage.content[i];

    if (!item1 || !item2) return false;
    if (item1.type !== item2.type) return false;

    if (item1.type === 'image' && item2.type === 'image') {
      // if (item1.image.toString() !== item2.image.toString()) return false;
      // if (item1.mimeType !== item2.mimeType) return false;
    } else if (item1.type === 'text' && item2.type === 'text') {
      if ('text' in item1 && 'text' in item2 && item1.text !== item2.text)
        return false;
    } else if (item1.type === 'tool-result' && item2.type === 'tool-result') {
      if (
        'toolCallId' in item1 &&
        'toolCallId' in item2 &&
        item1.toolCallId !== item2.toolCallId
      )
        return false;
    } else {
      return false;
    }
  }

  return true;
}

const textToDeltas = (text: string): StreamPart[] => {
  const deltas = text.split(' ').map((char, i) => ({
    type: 'text-delta' as const,
    id: `text-${i}`,
    delta: `${char} `,
  }));

  return deltas;
};

const reasoningToDeltas = (text: string): StreamPart[] => {
  const deltas = text.split(' ').map((char, i) => ({
    type: 'reasoning' as const,
    id: `reasoning-${i}`,
    delta: `${char} `,
  }));

  return deltas;
};

export const getResponseChunksByPrompt = (
  prompt: CoreMessage[],
  isReasoningEnabled = false,
): Array<StreamPart> => {
  const recentMessage = prompt.at(-1);

  if (!recentMessage) {
    throw new Error('No recent message found!');
  }

  const message = recentMessage as CoreMessage;

  if (isReasoningEnabled) {
    if (compareMessages(message, TEST_PROMPTS.USER_SKY as CoreMessage)) {
      return [
        ...reasoningToDeltas('The sky is blue because of rayleigh scattering!'),
        ...textToDeltas("It's just blue duh!"),
        {
          type: 'finish',
          finishReason: 'stop',
          usage: { completionTokens: 10, promptTokens: 3 },
        },
      ];
    } else if (
      compareMessages(message, TEST_PROMPTS.USER_GRASS as CoreMessage)
    ) {
      return [
        ...reasoningToDeltas(
          'Grass is green because of chlorophyll absorption!',
        ),
        ...textToDeltas("It's just green duh!"),
        {
          type: 'finish',
          finishReason: 'stop',
          usage: { completionTokens: 10, promptTokens: 3 },
        },
      ];
    }
  }

  if (
    recentMessage &&
    compareMessages(recentMessage, TEST_PROMPTS.USER_THANKS as CoreMessage)
  ) {
    return [
      ...textToDeltas("You're welcome!"),
      {
        type: 'finish',
        finishReason: 'stop',
        usage: { completionTokens: 10, promptTokens: 3 },
      },
    ];
  } else if (
    recentMessage &&
    compareMessages(recentMessage, TEST_PROMPTS.USER_GRASS as CoreMessage)
  ) {
    return [
      ...textToDeltas("It's just green duh!"),
      {
        type: 'finish',
        finishReason: 'stop',
        usage: { completionTokens: 10, promptTokens: 3 },
      },
    ];
  } else if (
    recentMessage &&
    compareMessages(recentMessage, TEST_PROMPTS.USER_SKY as CoreMessage)
  ) {
    return [
      ...textToDeltas("It's just blue duh!"),
      {
        type: 'finish',
        finishReason: 'stop',
        usage: { completionTokens: 10, promptTokens: 3 },
      },
    ];
  } else if (
    compareMessages(message, TEST_PROMPTS.USER_NEXTJS as CoreMessage)
  ) {
    return [
      ...textToDeltas('With Next.js, you can ship fast!'),

      {
        type: 'finish',
        finishReason: 'stop',
        usage: { completionTokens: 10, promptTokens: 3 },
      },
    ];
  } else if (
    compareMessages(message, TEST_PROMPTS.USER_IMAGE_ATTACHMENT as CoreMessage)
  ) {
    return [
      ...textToDeltas('This painting is by Monet!'),
      {
        type: 'finish',
        finishReason: 'stop',
        usage: { completionTokens: 10, promptTokens: 3 },
      },
    ];
  } else if (
    compareMessages(message, TEST_PROMPTS.USER_TEXT_ARTIFACT as CoreMessage)
  ) {
    return [
      {
        type: 'tool-call',
        toolCallId: 'call_123',
        toolName: 'createDocument',
        toolCallType: 'function',
        args: JSON.stringify({
          title: 'Essay about Silicon Valley',
          kind: 'text',
        }),
      },
      {
        type: 'finish',
        finishReason: 'stop',
        usage: { completionTokens: 10, promptTokens: 3 },
      },
    ];
  } else if (
    compareMessages(
      message,
      TEST_PROMPTS.CREATE_DOCUMENT_TEXT_CALL as CoreMessage,
    )
  ) {
    return [
      ...textToDeltas(`\n
# Silicon Valley: The Epicenter of Innovation

## Origins and Evolution

Silicon Valley, nestled in the southern part of the San Francisco Bay Area, emerged as a global technology hub in the late 20th century. Its transformation began in the 1950s when Stanford University encouraged its graduates to start their own companies nearby, leading to the formation of pioneering semiconductor firms that gave the region its name.

## The Innovation Ecosystem

What makes Silicon Valley unique is its perfect storm of critical elements: prestigious universities like Stanford and Berkeley, abundant venture capital, a culture that celebrates risk-taking, and a dense network of talented individuals. This ecosystem has consistently nurtured groundbreaking technologies from personal computers to social media platforms to artificial intelligence.

## Challenges and Criticisms

Despite its remarkable success, Silicon Valley faces significant challenges including extreme income inequality, housing affordability crises, and questions about technology's impact on society. Critics argue the region has developed a monoculture that sometimes struggles with diversity and inclusion.

## Future Prospects

As we move forward, Silicon Valley continues to reinvent itself. While some predict its decline due to remote work trends and competition from other tech hubs, the region's adaptability and innovative spirit suggest it will remain influential in shaping our technological future for decades to come.
`),
      {
        type: 'finish',
        finishReason: 'stop',
        usage: { completionTokens: 10, promptTokens: 3 },
      },
    ];
  } else if (
    compareMessages(
      message,
      TEST_PROMPTS.CREATE_DOCUMENT_TEXT_RESULT as CoreMessage,
    )
  ) {
    return [
      {
        type: 'text-delta',
        id: 'document-created',
        delta: 'A document was created and is now visible to the user.',
      },
      {
        type: 'finish',
        finishReason: 'tool-calls',
        usage: { completionTokens: 10, promptTokens: 3 },
      },
    ] as StreamPart[];
  } else if (
    compareMessages(message, TEST_PROMPTS.GET_WEATHER_CALL as CoreMessage)
  ) {
    return [
      {
        type: 'tool-call',
        toolCallId: 'call_456',
        toolName: 'getWeather',
        toolCallType: 'function',
        args: JSON.stringify({ latitude: 37.7749, longitude: -122.4194 }),
      },
      {
        type: 'finish',
        finishReason: 'stop',
        usage: { completionTokens: 10, promptTokens: 3 },
      },
    ];
  } else if (
    compareMessages(message, TEST_PROMPTS.GET_WEATHER_RESULT as CoreMessage)
  ) {
    return [
      ...textToDeltas('The current temperature in San Francisco is 17°C.'),
      {
        type: 'finish',
        finishReason: 'stop',
        usage: { completionTokens: 10, promptTokens: 3 },
      },
    ];
  }

  return [{ type: 'text-delta', id: 'unknown', delta: 'Unknown test prompt!' }];
};
