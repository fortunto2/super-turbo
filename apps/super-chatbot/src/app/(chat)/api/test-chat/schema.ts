import { z } from 'zod';

export const testChatRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string(),
      id: z.string().optional(),
    }),
  ),
});

export type TestChatRequest = z.infer<typeof testChatRequestSchema>;
