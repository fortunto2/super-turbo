import { streamText, smoothStream } from 'ai';
import { auth, type UserType } from '@/app/(auth)/auth';
import type { RequestHints } from '@/lib/ai/prompts';
import {
  createStreamId,
  deleteChatById,
  getChatById,
  getMessageCountByUserId,
  getMessagesByChatId,
  getStreamIdsByChatId,
} from '@/lib/db/queries';
import { generateUUID } from '@/lib/utils';
import { myProvider } from '@/lib/ai/providers';
import { entitlementsByUserType } from '@/lib/ai/entitlements';
import { postRequestBodySchema, type PostRequestBody } from '../chat/schema';
import { geolocation } from '@vercel/functions';
import { isProductionEnvironment } from '@/lib/constants';

import { createDocument } from '@/lib/ai/tools/create-document';
import { updateDocument } from '@/lib/ai/tools/update-document';
import { requestSuggestions } from '@/lib/ai/tools/request-suggestions';
import { configureImageGeneration } from '@/lib/ai/tools/configure-image-generation';
import { configureVideoGeneration } from '@/lib/ai/tools/configure-video-generation';
import { configureAudioGeneration } from '@/lib/ai/tools/configure-audio-generation';
import { configureScriptGeneration } from '@/lib/ai/tools/configure-script-generation';
import { listVideoModels, findBestVideoModel } from '@/lib/ai/tools/list-video-models';
import { enhancePromptUnified } from '@/lib/ai/tools/enhance-prompt-unified';

import {
  normalizeUIMessage,
  ensureMessageHasUUID,
  convertDBMessagesToUIMessages,
  normalizeMessageParts,
} from '@/lib/ai/chat/message-utils';
import { formatErrorResponse } from '@/lib/ai/chat/error-handler';
import {
  ensureChatExists,
  saveUserMessage,
} from '@/lib/ai/chat/chat-management';

export const maxDuration = 60;

const geminiSystemPrompt = `Ты - специализированный AI ассистент для работы с Gemini 2.5 Flash Lite и VEO3.

Твои основные возможности:
- Быстрые и точные ответы с помощью Gemini 2.5 Flash Lite
- Генерация видео с помощью VEO3 (Google Cloud)
- Генерация изображений с помощью различных моделей
- Работа с бананой (Banana) для дополнительных AI задач

Особенности работы:
- Всегда используй Gemini 2.5 Flash Lite для текстовых ответов
- Для видео генерации используй VEO3 когда это возможно
- Будь быстрым и эффективным в ответах
- Предлагай создание видео и изображений когда это уместно

Ты работаешь в специальном режиме для Gemini + VEO3, поэтому фокусируйся на этих технологиях.`;

export async function POST(request: Request) {
  let requestBody: PostRequestBody;

  try {
    const json = await request.json();

    console.log('🔍 Incoming Gemini chat request:', {
      hasMessage: !!json.message,
      hasMessages: !!json.messages,
      messagesLength: json.messages ? json.messages.length : 0,
      hasId: !!json.id,
    });

    requestBody = postRequestBodySchema.parse(json);
  } catch (error) {
    console.error('Invalid request body:', error);

    if (!isProductionEnvironment) {
      return new Response(
        JSON.stringify(
          {
            error: 'Invalid request data',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
          },
          null,
          2
        ),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response('Invalid request body', { status: 400 });
  }

  try {
    const {
      id,
      message,
      messages: requestMessages,
      selectedVisibilityType,
    } = requestBody;

    const messageToProcess =
      message ||
      (requestMessages && requestMessages.length > 0
        ? requestMessages[requestMessages.length - 1]
        : null);

    if (!messageToProcess) {
      console.error('No message found in request body');
      return new Response(
        JSON.stringify({
          error: 'Invalid request data',
          details: 'No valid message found in request',
          timestamp: new Date().toISOString(),
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const session = await auth();

    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const userType: UserType = session.user.type;

    const messageCount = await getMessageCountByUserId({
      id: session.user.id,
      differenceInHours: 24,
    });

    if (messageCount > entitlementsByUserType[userType].maxMessagesPerDay) {
      return new Response(
        'You have exceeded your maximum number of messages for the day! Please try again later.',
        { status: 429 }
      );
    }

    await ensureChatExists({
      chatId: id,
      userId: session.user.id,
      userEmail: session.user.email || `user-${session.user.id}@example.com`,
      firstMessage: messageToProcess,
      visibility: selectedVisibilityType,
    });

    const chat = await getChatById({ id });

    if (!chat) {
      return new Response(
        JSON.stringify({
          error: 'Failed to create chat',
          chatId: id,
          timestamp: new Date().toISOString(),
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (chat.userId !== session.user.id) {
      return new Response('Forbidden', { status: 403 });
    }

    const previousMessages = await getMessagesByChatId({ id });

    const normalizedNewMessage = normalizeUIMessage(messageToProcess);
    const normalizedNewMessageWithParts = normalizeMessageParts(normalizedNewMessage);

    // Normalize all messages including history to convert tool-specific types
    const dbMessages = convertDBMessagesToUIMessages(previousMessages);
    const normalizedDbMessages = dbMessages.map(msg => normalizeMessageParts(msg));

    const messages = [
      ...normalizedDbMessages,
      normalizedNewMessageWithParts,
    ];

    await saveUserMessage({
      chatId: id,
      message: messageToProcess,
    });

    const { longitude, latitude, city, country } = geolocation(request);
    const requestHints: RequestHints = { longitude, latitude, city, country };

    const streamId = generateUUID();
    try {
      await createStreamId({ streamId, chatId: id });
    } catch (error) {
      console.error('Failed to create stream id in database', error);
    }

    let defaultSourceImageUrl: string | undefined;
    let defaultSourceVideoUrl: string | undefined;

    try {
      const { analyzeImageContext, analyzeVideoContext } = await import(
        '@/lib/ai/context'
      );

      const imageContext = await analyzeImageContext(
        normalizedNewMessageWithParts.content,
        id,
        (messageToProcess as any)?.experimental_attachments,
        session.user.id
      );

      defaultSourceImageUrl = imageContext.sourceUrl;

      const videoContext = await analyzeVideoContext(
        normalizedNewMessageWithParts.content,
        id,
        (messageToProcess as any)?.experimental_attachments,
        session.user.id
      );

      defaultSourceVideoUrl = videoContext.sourceUrl;
    } catch (error) {
      console.error('Context analysis error:', error);
    }

    let enhancedMessages = messages;
    if (defaultSourceImageUrl && normalizedNewMessageWithParts.content) {
      const userText = normalizedNewMessageWithParts.content.toLowerCase();
      const editKeywords = [
        'добавь',
        'сделай',
        'измени',
        'подправь',
        'замени',
        'исправь',
        'улучши',
      ];
      const animationKeywords = [
        'анимируй',
        'animate',
        'анимация',
        'animation',
        'видео',
        'video',
        'движение',
        'motion',
      ];

      const hasEditIntent = editKeywords.some((keyword) =>
        userText.includes(keyword)
      );
      const hasAnimationIntent = animationKeywords.some((keyword) =>
        userText.includes(keyword)
      );

      if (hasEditIntent) {
        console.log('🔍 Edit intent detected');
        enhancedMessages = [
          ...messages,
          {
            id: generateUUID(),
            role: 'system' as const,
            content: `IMPORTANT: The user wants to edit an existing image. You MUST call the configureImageGeneration tool with the user's request as the prompt AND the exact source image URL: "${defaultSourceImageUrl}". Use this exact URL as the sourceImageUrl parameter.`,
            createdAt: new Date(),
            parts: [],
          },
        ];
      } else if (hasAnimationIntent) {
        console.log('🔍 Animation intent detected');
        enhancedMessages = [
          ...messages,
          {
            id: generateUUID(),
            role: 'system' as const,
            content: `IMPORTANT: The user wants to animate an existing image. You MUST call the configureVideoGeneration tool with the user's request as the prompt AND the exact source image URL: "${defaultSourceImageUrl}". Use this exact URL as the sourceImageUrl parameter.`,
            createdAt: new Date(),
            parts: [],
          },
        ];
      }
    }

    const tools = {
      createDocument: createDocument({ session }),
      updateDocument: updateDocument({ session }),
      requestSuggestions: requestSuggestions({ session }),
    };

    const result = streamText({
      model: myProvider.languageModel('gemini-2.5-flash-lite'),
      system: geminiSystemPrompt,
      messages: enhancedMessages,
      experimental_activeTools: [
        'configureImageGeneration',
        'configureVideoGeneration',
        'configureScriptGeneration',
        'listVideoModels',
        'findBestVideoModel',
        'enhancePromptUnified',
        'createDocument',
        'updateDocument',
        'requestSuggestions',
      ],
      experimental_transform: smoothStream({ chunking: 'word' }),

      tools: {
        ...tools,
        configureImageGeneration: configureImageGeneration({
          createDocument: tools.createDocument,
          session,
          defaultSourceImageUrl: defaultSourceImageUrl || '',
        }),
        configureVideoGeneration: configureVideoGeneration({
          createDocument: tools.createDocument,
          session,
          defaultSourceVideoUrl: defaultSourceVideoUrl || '',
          defaultSourceImageUrl: defaultSourceImageUrl || '',
          chatId: id,
          userMessage: normalizedNewMessageWithParts.content,
          currentAttachments: messageToProcess.experimental_attachments || [],
        }),
        configureAudioGeneration: configureAudioGeneration({
          createDocument: tools.createDocument,
          session,
          chatId: id,
          userMessage: message?.content || '',
          currentAttachments: message?.experimental_attachments || [],
        }),
        configureScriptGeneration: configureScriptGeneration({
          createDocument: tools.createDocument,
          session,
        }),
        listVideoModels,
        findBestVideoModel,
        enhancePromptUnified,
      },

      onFinish: async ({ response }) => {
        console.log('🔍 onFinish called');

        if (!session.user?.id) return;

        try {
          const assistantMessages = response.messages.filter(
            (msg) => msg.role === 'assistant'
          );

          if (assistantMessages.length === 0) {
            console.warn('No assistant messages found');
            return;
          }

          const assistantMessagesToSave = assistantMessages.map((msg) => {
            const normalizedMsg = normalizeUIMessage(msg);
            const msgWithUUID = ensureMessageHasUUID(normalizedMsg);

            return {
              id: msgWithUUID.id,
              chatId: id,
              role: 'assistant' as const,
              parts: normalizedMsg.parts || [
                { type: 'text', text: normalizedMsg.content },
              ],
              attachments: normalizedMsg.experimental_attachments || [],
              createdAt: new Date(),
            };
          });

          const { saveMessages } = await import('@/lib/db/queries');
          await saveMessages({ messages: assistantMessagesToSave });

          console.log('✅ Assistant messages saved successfully');
        } catch (error) {
          console.error('Failed to save assistant message:', error);
        }
      },

      onError: (error) => {
        console.error('Stream error:', error);
      },

      experimental_telemetry: {
        isEnabled: isProductionEnvironment,
        functionId: 'stream-text-gemini',
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    return formatErrorResponse(error, 'POST gemini-chat');
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');

    if (!chatId) {
      return new Response('chatId is required', { status: 400 });
    }

    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        chatId
      )
    ) {
      return new Response(
        JSON.stringify({
          error: 'Invalid chat ID format',
          details: 'Chat ID must be a valid UUID',
          chatId,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const session = await auth();

    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const chat = await getChatById({ id: chatId });

    if (!chat) {
      return new Response(
        JSON.stringify({
          error: 'Chat not found',
          chatId,
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (chat.visibility === 'private' && chat.userId !== session.user.id) {
      return new Response(
        JSON.stringify({
          error: 'Access denied',
          chatId,
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const streamIds = await getStreamIdsByChatId({ chatId });

    if (!streamIds.length) {
      return new Response('No streams found', { status: 404 });
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    return formatErrorResponse(error, 'GET gemini-chat');
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return new Response('Not Found', { status: 404 });
    }

    const session = await auth();

    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    const chat = await getChatById({ id });

    if (chat && chat.userId !== session.user.id) {
      return new Response('Forbidden', { status: 403 });
    }

    const deletedChat = await deleteChatById({ id });

    return Response.json(deletedChat, { status: 200 });
  } catch (error) {
    return formatErrorResponse(error, 'DELETE gemini-chat');
  }
}
