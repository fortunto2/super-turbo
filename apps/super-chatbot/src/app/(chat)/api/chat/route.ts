import { auth } from '@/app/(auth)/auth';
import { systemPrompt } from '@/lib/ai/prompts';
import { myProvider } from '@/lib/ai/providers';
import {
  getChatById,
  getMessagesByChatId,
  saveMessages,
} from '@/lib/db/queries';
import { withMonitoring } from '@/lib/monitoring/simple-monitor';
import { streamText } from 'ai';
import { NextResponse } from 'next/server';
import { postRequestBodySchema } from './schema';

import {
  ensureChatExists,
  saveUserMessage,
} from '@/lib/ai/chat/chat-management';
import { formatErrorResponse } from '@/lib/ai/chat/error-handler';
// Import utilities
import {
  convertDBMessagesToUIMessages,
  ensureMessageHasUUID,
  normalizeMessageParts,
  normalizeUIMessage,
} from '@/lib/ai/chat/message-utils';

// Import tools (old SuperDuperAI tools - kept for backward compatibility)
import { configureImageGeneration } from '@/lib/ai/tools/configure-image-generation';
import { configureScriptGeneration } from '@/lib/ai/tools/configure-script-generation';
import { configureVideoGeneration } from '@/lib/ai/tools/configure-video-generation';
import { createDocument } from '@/lib/ai/tools/create-document';
import { requestSuggestions } from '@/lib/ai/tools/request-suggestions';
import { updateDocument } from '@/lib/ai/tools/update-document';

// Import new tools (Nano Banana + FAL AI)
import { nanoBananaImageGenerationForChat } from '@/lib/ai/tools/nano-banana-chat-image-generation';
import { falVideoGenerationForChat } from '@/lib/ai/tools/fal-chat-video-generation';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

export const POST = withMonitoring(async (request: Request) => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Debug: Log raw request to understand what AI SDK v5 sends
    console.log(
      '🔍 REQUEST BODY - messages count:',
      body.messages?.length || 0,
    );
    if (body.messages) {
      console.log(
        '🔍 REQUEST BODY - message roles:',
        body.messages.map((m: any) => m.role),
      );
      console.log(
        '🔍 REQUEST BODY - message IDs:',
        body.messages.map((m: any) => m.id),
      );
    }

    // Validate request body using schema
    const validationResult = postRequestBodySchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request format',
          details: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    let {
      messages: rawMessages,
      message: singleMessage,
      id: chatId,
      selectedChatModel,
      selectedVisibilityType,
    } = validationResult.data;

    // Convert single message to array format if needed
    if (singleMessage && !rawMessages) {
      rawMessages = [singleMessage];
    }

    // Ensure we have messages
    if (!rawMessages || rawMessages.length === 0) {
      return NextResponse.json(
        { error: 'No messages provided' },
        { status: 400 },
      );
    }

    // AI SDK v5: Ensure all messages have proper UUID and createdAt
    // Also normalize message parts to convert tool-specific types to generic types
    const normalizedMessages = rawMessages.map((msg: any) => {
      const normalized = normalizeUIMessage(msg);
      const withUUID = ensureMessageHasUUID(normalized);
      return normalizeMessageParts(withUUID);
    });

    // Ensure chat exists (with automatic FK recovery)
    await ensureChatExists({
      chatId,
      userId: session.user.id,
      userEmail: session.user.email || `user-${session.user.id}@example.com`,
      firstMessage: normalizedMessages[normalizedMessages.length - 1],
      visibility: selectedVisibilityType || 'private',
    });

    const chat = await getChatById({ id: chatId });
    if (!chat) {
      return formatErrorResponse(
        new Error('Failed to create chat'),
        'Chat API',
      );
    }

    // Get previous messages from database
    const previousMessages = await getMessagesByChatId({ id: chatId });
    console.log(`🔍 Loaded ${previousMessages.length} messages from DB`);

    // Convert to UI format
    const previousUIMessages = convertDBMessagesToUIMessages(previousMessages);
    console.log(`🔍 Converted to ${previousUIMessages.length} UI messages`);
    console.log(
      `🔍 Previous UI messages:`,
      previousUIMessages.map((m) => ({
        role: m.role,
        partsCount: m.parts?.length || 0,
        hasAttachments: !!(m as any).experimental_attachments?.length,
      })),
    );

    // CRITICAL FIX: AI SDK v5 sendMessage creates new IDs each time
    // So we can't rely on ID matching alone - need content-based deduplication
    // Create a map of previous messages by content hash for deduplication
    const previousMessageMap = new Map();
    for (const msg of previousUIMessages) {
      // Create a content hash based on role + text content
      // IMPORTANT: Check both content field AND parts array
      let textContent = '';
      const msgAny = msg as any;
      if (typeof msgAny.content === 'string' && msgAny.content.trim()) {
        textContent = msgAny.content;
      } else {
        const textPart = msg.parts?.find((p: any) => p.type === 'text') as any;
        textContent = textPart?.text || '';
      }
      const contentHash = `${msg.role}:${textContent}`;
      previousMessageMap.set(contentHash, msg);
    }

    // Filter out messages that already exist by content (not just ID)
    const newMessages = normalizedMessages.filter((msg) => {
      if (msg.role === 'system') return false;

      const msgAny = msg as any;
      const textContent =
        typeof msgAny.content === 'string'
          ? msgAny.content
          : msg.parts?.find((p: any) => p.type === 'text')?.text || '';
      const contentHash = `${msg.role}:${textContent}`;

      const isDuplicate = previousMessageMap.has(contentHash);
      if (isDuplicate) {
        console.log(
          `🔍 Skipping duplicate message: ${contentHash.substring(0, 50)}...`,
        );
      }
      return !isDuplicate;
    });

    console.log(
      `🔍 Filtered messages: ${newMessages.length} new out of ${normalizedMessages.length} total`,
    );

    // Combine previous messages with only NEW messages
    const allMessages = [...previousUIMessages, ...newMessages];

    // CRITICAL FIX: Ensure all messages have proper parts array for Gemini API
    // Convert content string to parts if needed AND remove parts without text
    const messagesForAPI = allMessages
      .map((msg) => {
        const msgAny = msg as any;
        // If message has no parts but has content string, convert it to parts
        if (
          (!msg.parts || msg.parts.length === 0) &&
          msgAny.content &&
          typeof msgAny.content === 'string'
        ) {
          return {
            ...msg,
            parts: [
              {
                type: 'text',
                text: msgAny.content,
              },
            ],
          };
        }

        // For messages with parts, filter out problematic parts (like step-start)
        // but keep text and tool parts that are needed for functionality
        if (msg.parts && msg.parts.length > 0) {
          const validParts = msg.parts.filter((p: any) => {
            // Keep text parts with valid content
            if (
              p.type === 'text' &&
              p.text &&
              typeof p.text === 'string' &&
              p.text.trim().length > 0
            ) {
              return true;
            }
            // Keep tool invocation parts (needed for image/video generation)
            if (p.type?.startsWith('tool-')) {
              return true;
            }
            // Filter out everything else (step-start, etc.)
            return false;
          });

          // If we have valid parts, return message with only those parts
          if (validParts.length > 0) {
            return {
              ...msg,
              parts: validParts,
            };
          }
        }

        return msg;
      })
      .filter((msg) => {
        // For all messages, ensure they have at least one valid text OR tool part
        // Text parts are required for conversation, tool parts are required for image/video generation
        const hasTextPart = msg.parts?.some(
          (p: any) =>
            p.type === 'text' &&
            p.text &&
            typeof p.text === 'string' &&
            p.text.trim().length > 0,
        );

        const hasToolPart = msg.parts?.some((p: any) =>
          p.type?.startsWith('tool-'),
        );

        const isValid = hasTextPart || hasToolPart;

        if (!isValid) {
          console.log(
            `🔍 Filtering out ${msg.role} message without valid text or tool parts:`,
            {
              id: msg.id,
              role: msg.role,
              partsCount: msg.parts?.length,
            },
          );
        }

        return isValid;
      });

    // CRITICAL FIX: Remove experimental_attachments from all messages to prevent token overflow
    // Images and videos in attachments can cause massive token consumption
    const messagesWithoutAttachments = messagesForAPI.map((msg) => {
      const { experimental_attachments, ...rest } = msg as any;
      return rest;
    });

    console.log(
      `🔍 Messages for API: ${messagesWithoutAttachments.length} out of ${allMessages.length} total`,
    );
    console.log(
      `🔍 Removed attachments from messages to prevent token overflow`,
    );

    // Debug: Log all messages structure before sending to API
    messagesWithoutAttachments.forEach((msg, index) => {
      const msgAny = msg as any;
      console.log(`🔍 Message ${index}:`, {
        role: msg.role,
        partsCount: msg.parts?.length,
        partsTypes: msg.parts?.map((p: any) => p.type).join(', '),
        contentLength:
          typeof msgAny.content === 'string' ? msgAny.content.length : 0,
      });
    });

    // Save user messages to database (with automatic FK recovery)
    const userMessages = normalizedMessages.filter(
      (msg) => msg.role === 'user',
    );

    // AICODE-FIX: Only save NEW user messages that aren't already in the database
    // Use content-based deduplication (same as above)
    const newUserMessages = userMessages.filter((msg) => {
      const msgAny = msg as any;
      const textContent =
        typeof msgAny.content === 'string'
          ? msgAny.content
          : msg.parts?.find((p: any) => p.type === 'text')?.text || '';
      const contentHash = `${msg.role}:${textContent}`;
      return !previousMessageMap.has(contentHash);
    });

    console.log(
      `💾 Saving user messages: ${newUserMessages.length} new out of ${userMessages.length} total`,
    );
    console.log(`💾 Previous messages count:`, previousMessageMap.size);
    console.log(
      `💾 Previous message hashes:`,
      Array.from(previousMessageMap.keys()).map((hash) =>
        hash.substring(0, 50),
      ),
    );
    console.log(
      `💾 User message contents:`,
      userMessages.map((m) => {
        const text =
          typeof m.content === 'string'
            ? m.content
            : m.parts?.find((p: any) => p.type === 'text')?.text || '';
        const hash = `${m.role}:${text}`;
        const isDuplicate = previousMessageMap.has(hash);
        return {
          text: text.substring(0, 30),
          hash: hash.substring(0, 50),
          isDuplicate,
        };
      }),
    );

    for (const userMsg of newUserMessages) {
      await saveUserMessage({
        chatId,
        message: userMsg,
      });
    }

    // Generate response using AI SDK v5
    const chatModel = selectedChatModel || 'chat-model';

    // Create tools with proper parameters
    const createDocumentTool = createDocument({ session });
    const updateDocumentTool = updateDocument({ session });
    const lastMessage = normalizedMessages[normalizedMessages.length - 1];

    // Old SuperDuperAI tools (kept for backward compatibility)
    const imageGenerationTool = configureImageGeneration({
      createDocument: createDocumentTool,
      session,
      chatId,
      userMessage: lastMessage?.content || '',
      currentAttachments: lastMessage?.experimental_attachments || [],
    });
    const videoGenerationTool = configureVideoGeneration({
      createDocument: createDocumentTool,
      session,
      chatId,
      userMessage: lastMessage?.content || '',
      currentAttachments: lastMessage?.experimental_attachments || [],
    });

    // New tools (Nano Banana + FAL AI)
    const nanoBananaImageTool = nanoBananaImageGenerationForChat({
      createDocument: createDocumentTool,
      session,
      chatId,
      userMessage: lastMessage?.content || '',
      currentAttachments: lastMessage?.experimental_attachments || [],
    });
    const falVideoTool = falVideoGenerationForChat({
      createDocument: createDocumentTool,
      session,
      chatId,
      userMessage: lastMessage?.content || '',
      currentAttachments: lastMessage?.experimental_attachments || [],
    });

    const scriptGenerationTool = configureScriptGeneration({
      createDocument: createDocumentTool,
      session,
    });
    const suggestionsTool = requestSuggestions({ session });

    // Debug: Log available tools and system prompt
    const toolsObject = {
      // Old SuperDuperAI tools (kept for backward compatibility)
      configureImageGeneration: imageGenerationTool,
      configureVideoGeneration: videoGenerationTool,
      // New tools (Nano Banana + FAL AI - primary image/video generation)
      nanoBananaImageGeneration: nanoBananaImageTool,
      falVideoGeneration: falVideoTool,
      // Other tools
      configureScriptGeneration: scriptGenerationTool,
      createDocument: createDocumentTool,
      updateDocument: updateDocumentTool,
      requestSuggestions: suggestionsTool,
    };

    console.log('🔧 Available tools:', Object.keys(toolsObject));
    console.log('🤖 Using model:', chatModel);
    console.log('📝 Messages count:', messagesWithoutAttachments.length);
    console.log(
      '📝 Last user message:',
      messagesWithoutAttachments[messagesWithoutAttachments.length - 1]
        ?.content,
    );

    const systemPromptText = systemPrompt({
      selectedChatModel: chatModel,
      requestHints: { latitude: '0', longitude: '0', city: '', country: '' },
    });
    console.log(
      '📋 System prompt first 500 chars:',
      systemPromptText.substring(0, 500),
    );

    // CRITICAL: Detect image generation requests and force tool usage
    const lastUserMessage = messagesWithoutAttachments[messagesWithoutAttachments.length - 1];
    const isImageGenerationRequest = lastUserMessage?.content && typeof lastUserMessage.content === 'string' &&
      /(?:сделай|создай|сгенерируй|нарисуй|покажи|нужно|хочу|можешь|make|create|generate|draw|show|need|want|can you).*?(?:фото|картинк|изображени|рисунок|иллюстраци|image|picture|photo|drawing|illustration)/i.test(lastUserMessage.content.toLowerCase());

    const isVideoGenerationRequest = lastUserMessage?.content && typeof lastUserMessage.content === 'string' &&
      /(?:сделай|создай|сгенерируй|нарисуй|покажи|нужно|хочу|можешь|make|create|generate|show|need|want|can you).*?(?:видео|ролик|анимаци|video|clip|animation)/i.test(lastUserMessage.content.toLowerCase());

    console.log('🔍 Request type detection:', {
      isImageGeneration: isImageGenerationRequest,
      isVideoGeneration: isVideoGenerationRequest,
      lastMessage: lastUserMessage?.content?.substring(0, 100)
    });

    const result = streamText({
      model: myProvider.languageModel(chatModel),
      system: systemPromptText,
      messages: messagesWithoutAttachments, // Use filtered messages without attachments to prevent token overflow
      temperature: 0.7,
      tools: {
        // Old SuperDuperAI tools (kept for backward compatibility)
        configureImageGeneration: imageGenerationTool,
        configureVideoGeneration: videoGenerationTool,
        // New tools (Nano Banana + FAL AI - primary image/video generation)
        nanoBananaImageGeneration: nanoBananaImageTool,
        falVideoGeneration: falVideoTool,
        // Other tools
        configureScriptGeneration: scriptGenerationTool,
        createDocument: createDocumentTool,
        updateDocument: updateDocumentTool,
        requestSuggestions: suggestionsTool,
      },
      // CRITICAL: Force tool usage for image/video generation to ensure models call the right tool
      toolChoice: (isImageGenerationRequest || isVideoGenerationRequest) ? 'required' : 'auto',
      // REMOVED stopWhen - let AI SDK handle tool execution naturally without interference
      onError: ({ error }) => {
        console.error('❌ Stream error:', error);
        if (error instanceof Error) {
          console.error('❌ Error stack:', error.stack);
        }
      },
    });

    // AI SDK v5: Use toUIMessageStreamResponse() WITHOUT originalMessages
    // The client manages its own message state and will receive the response via streaming
    // We don't need to send back messages - client already has them
    // NOTE: Do NOT use consumeStream() here as it interferes with tool execution and client streaming
    return result.toUIMessageStreamResponse({
      onFinish: async ({ messages: finishedMessages, responseMessage }) => {
        try {
          console.log(
            '📝 onFinish called with messages:',
            finishedMessages.length,
          );
          console.log(
            '📝 responseMessage:',
            responseMessage ? 'present' : 'null',
          );

          if (!responseMessage) {
            console.log('📝 ⚠️ No response message to save');
            return;
          }

          // Debug: Log the raw responseMessage structure
          console.log(
            '📝 🔍 responseMessage keys:',
            Object.keys(responseMessage),
          );
          console.log(
            '📝 🔍 responseMessage.parts:',
            (responseMessage as any).parts ? 'present' : 'missing',
          );
          if ((responseMessage as any).parts) {
            console.log(
              '📝 🔍 responseMessage.parts length:',
              (responseMessage as any).parts.length,
            );
            console.log(
              '📝 🔍 responseMessage.parts types:',
              (responseMessage as any).parts.map((p: any) => p.type).join(', '),
            );
          }

          // Extract document IDs from tool results in the response message parts
          const toolDocuments: Array<{
            id: string;
            title: string;
            kind: string;
          }> = [];

          // Check responseMessage parts for tool invocations
          if ((responseMessage as any).parts) {
            console.log(
              '📝 🔍 Processing',
              (responseMessage as any).parts.length,
              'parts...',
            );
            for (const part of (responseMessage as any).parts) {
              console.log('📝 🔍 Part type:', part.type);
              console.log('📝 🔍 Part state:', (part as any).state);
              console.log('📝 🔍 Part output:', (part as any).output);
              console.log('📝 🔍 Part keys:', Object.keys(part));

              // AI SDK v5: Tool data is directly in part, not in nested toolInvocation
              // Check for tool parts with completed state and output
              // State can be 'output-available' or 'result'
              if (
                part.type &&
                typeof part.type === 'string' &&
                part.type.startsWith('tool-') &&
                ((part as any).state === 'output-available' ||
                  (part as any).state === 'result') &&
                (part as any).output
              ) {
                const toolName = part.type.replace('tool-', '');
                const toolResult = (part as any).output;

                console.log(
                  '📝 🔍 Tool found:',
                  toolName,
                  'state:',
                  (part as any).state,
                );
                console.log('📝 🔍 Tool result:', toolResult);

                // Check for script documents from either configureScriptGeneration OR createDocument
                // Case 1: configureScriptGeneration tool
                if (
                  toolName === 'configureScriptGeneration' &&
                  toolResult.id &&
                  toolResult.kind
                ) {
                  toolDocuments.push({
                    id: toolResult.id,
                    title: toolResult.title || 'Document',
                    kind: toolResult.kind,
                  });
                  console.log(
                    '📝 ✅ Found script document from configureScriptGeneration:',
                    toolResult.id,
                  );
                }
                // Case 2: createDocument tool with kind === "script"
                else if (
                  toolName === 'createDocument' &&
                  toolResult.kind === 'script' &&
                  toolResult.id
                ) {
                  toolDocuments.push({
                    id: toolResult.id,
                    title: toolResult.title || 'Document',
                    kind: toolResult.kind,
                  });
                  console.log(
                    '📝 ✅ Found script document from createDocument:',
                    toolResult.id,
                  );
                }
              }
            }
          }

          // Normalize the response message and add attachments for script documents
          const normalized = normalizeUIMessage(responseMessage);
          const withUUID = ensureMessageHasUUID(normalized);

          const attachments = normalized.experimental_attachments || [];

          // Add attachments for script documents created by tools
          for (const doc of toolDocuments) {
            if (doc.kind === 'script') {
              attachments.push({
                name:
                  doc.title.length > 200
                    ? `${doc.title.substring(0, 200)}...`
                    : doc.title,
                url: `${
                  typeof process !== 'undefined' &&
                  process.env.NEXT_PUBLIC_APP_URL
                    ? process.env.NEXT_PUBLIC_APP_URL
                    : 'http://localhost:3001'
                }/api/document?id=${doc.id}`,
                contentType: 'text/markdown' as const,
                documentId: doc.id,
              });
              console.log('📝 ✅ Added script attachment to message:', doc.id);
            }
          }

          // Create the assistant message to save
          const assistantMessage = {
            id: withUUID.id,
            chatId,
            role: 'assistant' as const,
            parts: normalized.parts,
            attachments: attachments,
            createdAt: new Date(),
          };

          console.log('📝 Saving assistant message to database');
          await saveMessages({ messages: [assistantMessage] });
          console.log('📝 ✅ Assistant message saved successfully');
          console.log('📝 ✅ Message details:', {
            id: assistantMessage.id,
            attachments: attachments.length,
            partsCount: normalized.parts?.length || 0,
          });
        } catch (error) {
          console.error('Failed to save assistant messages:', error);
          // Don't throw - let the stream complete even if save fails
        }
      },
    });
  } catch (error) {
    return formatErrorResponse(error, 'Chat API');
  }
});
