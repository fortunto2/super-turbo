/**
 * Type conversion utilities for message interfaces
 * Solves @ts-expect-error issues in chat/route.ts and message-editor.tsx
 */

import type { UIMessage } from 'ai';

// Database message type (matches actual DB query structure)
export interface DBMessage {
  id: string;
  chatId: string;
  role: string;
  parts: unknown; // DB returns unknown type
  attachments: unknown; // DB returns unknown type
  createdAt: Date;
}

// Legacy message type for migration
export interface MessageDeprecated {
  id: string;
  chatId: string;
  role: string;
  content: string | any[];
  createdAt: Date;
}

/**
 * Convert database messages to UI messages compatible with AI SDK
 */
export function convertDBMessagesToUIMessages(
  dbMessages: DBMessage[],
): UIMessage[] {
  return dbMessages.map((dbMessage): UIMessage => {
    // Safely parse parts from unknown type
    const parts = Array.isArray(dbMessage.parts) ? dbMessage.parts : [];

    // Handle different role types
    if (dbMessage.role === 'user') {
      // User messages: combine parts into content string
      const textContent = parts
        .filter(
          (part: any) =>
            part && typeof part === 'object' && part.type === 'text',
        )
        .map((part: any) => part.text || '')
        .join(' ');

      return {
        id: dbMessage.id,
        role: 'user',
        content: textContent || 'Empty message',
        createdAt: dbMessage.createdAt,
        parts: [],
      } as UIMessage;
    }

    if (dbMessage.role === 'assistant') {
      // Assistant messages: normalize parts structure for schema validation
      // Tool-specific types like "tool-configureImageGeneration" need to be converted to "tool-call"
      const normalizedParts = parts.map((part: any) => {
        if (part && typeof part === 'object' && part.type) {
          // If the type starts with "tool-" but isn't one of the allowed generic types
          if (
            part.type.startsWith('tool-') &&
            part.type !== 'tool-call' &&
            part.type !== 'tool-result' &&
            part.type !== 'tool-invocation'
          ) {
            return { ...part, type: 'tool-call' };
          }
        }
        return part;
      });

      // Extract text content from parts for Gemini API compatibility
      // Gemini requires content field to be populated
      const textContent = normalizedParts
        .filter(
          (part: any) =>
            part && typeof part === 'object' && part.type === 'text',
        )
        .map((part: any) => part.text || '')
        .join(' ');

      // CRITICAL FIX: If message has only tool calls without text content,
      // add default text to prevent validation errors
      const hasToolCalls = normalizedParts.some(
        (part: any) =>
          part && typeof part === 'object' && part.type &&
          (part.type === 'tool-call' || part.type.startsWith('tool-'))
      );
      const finalContent = textContent || (hasToolCalls ? 'Generated content using AI tools.' : '');

      return {
        id: dbMessage.id,
        role: 'assistant',
        content: finalContent, // Populate content from parts for Gemini API
        parts: normalizedParts as any, // Explicit cast to fix TypeScript error
        createdAt: dbMessage.createdAt,
      } as UIMessage;
    }

    // Fallback for other roles
    return {
      id: dbMessage.id,
      role: dbMessage.role as any,
      content:
        typeof dbMessage.parts === 'string'
          ? dbMessage.parts
          : JSON.stringify(dbMessage.parts),
      createdAt: dbMessage.createdAt,
      parts: [],
    } as UIMessage;
  });
}

/**
 * Convert legacy deprecated messages to UI messages for migration
 */
export function convertDeprecatedMessagesToUIMessages(
  messages: MessageDeprecated[],
): UIMessage[] {
  return messages.map((message): UIMessage => {
    // Handle content as string or array
    const content =
      typeof message.content === 'string'
        ? message.content
        : Array.isArray(message.content)
          ? message.content
              .map((part) =>
                typeof part === 'object' && part.text
                  ? part.text
                  : String(part),
              )
              .join(' ')
          : String(message.content);

    return {
      id: message.id,
      role: message.role as any,
      content,
      createdAt: message.createdAt,
      parts: [],
    } as UIMessage;
  });
}

/**
 * Type guard to check if a message is a DB message
 */
export function isDBMessage(message: any): message is DBMessage {
  return (
    message &&
    typeof message.id === 'string' &&
    typeof message.chatId === 'string' &&
    typeof message.role === 'string' &&
    Array.isArray(message.parts) &&
    message.createdAt instanceof Date
  );
}

/**
 * Type guard to check if a message is a deprecated message
 */
export function isDeprecatedMessage(
  message: any,
): message is MessageDeprecated {
  return (
    message &&
    typeof message.id === 'string' &&
    typeof message.chatId === 'string' &&
    typeof message.role === 'string' &&
    (typeof message.content === 'string' || Array.isArray(message.content)) &&
    message.createdAt instanceof Date
  );
}
