import { z } from 'zod';

const textPartSchema = z.object({
  text: z.union([z.string(), z.array(z.any())]).optional(), // AI SDK v5: text can be string or array
  type: z.string(), // AI SDK v5: Accept any string type (will be normalized internally)
}).passthrough(); // Allow additional fields for tool-specific data

const messageSchema = z
  .object({
    id: z.string().optional(), // AI SDK v5: id is optional, will be generated if missing
    createdAt: z.coerce.date().optional(), // AI SDK v5: createdAt is optional
    role: z.enum(['user', 'assistant']),
    content: z.string().optional(), // Сделаем content опциональным
    parts: z.array(textPartSchema).optional(), // Сделаем parts опциональным
    experimental_attachments: z
      .array(
        z.object({
          url: z.string().url(),
          name: z.string().min(1),
          contentType: z.enum([
            'image/png',
            'image/jpg',
            'image/jpeg',
            'image/webp', // Добавим поддержку webp
            'video/mp4',
            'video/webm',
            'video/avi',
            'video/mov',
            'audio/mp3',
            'audio/wav',
            'audio/ogg',
            'audio/m4a',
            'text/markdown',
          ]),
        }),
      )
      .optional(),
  })
  .refine(
    (data) => {
      // Проверяем, что есть либо content, либо parts с текстом, либо attachments
      const hasContent = data.content && data.content.length > 0;
      const hasPartsWithText =
        data.parts &&
        data.parts.length > 0 &&
        data.parts.some((part) => {
          if (!part.text) return false;
          // AI SDK v5: text can be string or array
          if (typeof part.text === 'string') return part.text.length > 0;
          if (Array.isArray(part.text)) return part.text.length > 0;
          return false;
        });
      const hasAttachments =
        data.experimental_attachments &&
        data.experimental_attachments.length > 0;

      return hasContent || hasPartsWithText || hasAttachments;
    },
    {
      message: 'Message must have content, parts with text, or attachments',
      path: ['content'],
    },
  );

export const postRequestBodySchema = z
  .object({
    id: z.string().uuid(),
    // Поддерживаем оба формата: message (объект) или messages (массив)
    message: messageSchema.optional(),
    messages: z.array(messageSchema).optional(),
    selectedChatModel: z.enum([
      'chat-model',
      'chat-model-reasoning',
      'o3-reasoning',
      'o3-pro-reasoning',
      'gemini-2.5-flash-lite',
    ]).optional().default('chat-model'), // AI SDK v5: optional with default
    selectedVisibilityType: z.enum(['public', 'private']).optional().default('private'), // AI SDK v5: optional with default
  })
  .refine(
    (data) => data.message || (data.messages && data.messages.length > 0),
    {
      message: "Either 'message' or 'messages' field is required",
      path: ['message'],
    },
  );

export type PostRequestBody = z.infer<typeof postRequestBodySchema>;
