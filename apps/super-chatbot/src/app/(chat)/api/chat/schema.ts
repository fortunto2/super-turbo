import { z } from "zod";

const textPartSchema = z.object({
  text: z.string().optional(), // Сделаем text опциональным
  type: z.enum([
    "text",
    "step-start",
    "step-finish",
    "reasoning",
    "tool-call",
    "tool-result",
    "tool-invocation", // Добавляем поддержку tool-invocation
  ]), // Поддерживаем все типы частей
});

const messageSchema = z
  .object({
    id: z.string().uuid(),
    createdAt: z.coerce.date(),
    role: z.enum(["user", "assistant"]),
    content: z.string().optional(), // Сделаем content опциональным
    parts: z.array(textPartSchema).optional(), // Сделаем parts опциональным
    experimental_attachments: z
      .array(
        z.object({
          url: z.string().url(),
          name: z.string().min(1),
          contentType: z.enum([
            "image/png",
            "image/jpg",
            "image/jpeg",
            "image/webp", // Добавим поддержку webp
            "video/mp4",
            "video/webm",
            "video/avi",
            "video/mov",
            "audio/mp3",
            "audio/wav",
            "audio/ogg",
            "audio/m4a",
            "text/markdown",
          ]),
        })
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
        data.parts.some((part) => part.text && part.text.length > 0);
      const hasAttachments =
        data.experimental_attachments &&
        data.experimental_attachments.length > 0;

      return hasContent || hasPartsWithText || hasAttachments;
    },
    {
      message: "Message must have content, parts with text, or attachments",
      path: ["content"],
    }
  );

export const postRequestBodySchema = z
  .object({
    id: z.string().uuid(),
    // Поддерживаем оба формата: message (объект) или messages (массив)
    message: messageSchema.optional(),
    messages: z.array(messageSchema).optional(),
    selectedChatModel: z.enum([
      "chat-model",
      "chat-model-reasoning",
      "o3-reasoning",
      "o3-pro-reasoning",
      "gemini-2.5-flash-lite",
    ]),
    selectedVisibilityType: z.enum(["public", "private"]),
  })
  .refine(
    (data) => data.message || (data.messages && data.messages.length > 0),
    {
      message: "Either 'message' or 'messages' field is required",
      path: ["message"],
    }
  );

export type PostRequestBody = z.infer<typeof postRequestBodySchema>;
