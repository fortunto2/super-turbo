import { z } from 'zod';

export const MessagePartSchema = z.object({
  type: z.string(),
  text: z.string().optional(),
}).passthrough();

export const UIMessageSchema = z.object({
  id: z.string().optional(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().optional(),
  parts: z.array(MessagePartSchema).optional(),
  experimental_attachments: z.array(z.any()).optional(),
  createdAt: z.date().optional(),
}).passthrough();

export const DBMessageSchema = z.object({
  id: z.string(),
  chatId: z.string(),
  role: z.string(),
  parts: z.unknown(),
  attachments: z.unknown(),
  createdAt: z.date(),
});

export type UIMessageInput = z.infer<typeof UIMessageSchema>;
export type DBMessageInput = z.infer<typeof DBMessageSchema>;
