import { generateUUID } from '@/lib/utils';
import {
  convertDBMessagesToUIMessages as convertFromDB,
  type DBMessage,
} from '@/lib/types/message-conversion';

export interface NormalizedUIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  parts?: Array<{ type: string; text: string; [key: string]: any }>;
  experimental_attachments?: any[];
  createdAt: Date;
  [key: string]: any;
}

function extractContentFromParts(parts?: Array<any>): string {
  if (!parts || parts.length === 0) {
    return '';
  }

  return parts
    .filter((part) => part && typeof part === 'object')
    .map((part) => {
      // Handle text parts
      if (part.type === 'text') {
        return part.text || '';
      }

      // Handle tool-call parts - extract any text content
      if (part.type === 'tool-call' || part.type?.startsWith('tool-')) {
        // Try to extract text from tool result or output
        if (part.result?.text) return part.result.text;
        if (part.output?.text) return part.output.text;
        if (part.result?.content) return part.result.content;
        if (part.output?.content) return part.output.content;
        if (part.result?.message) return part.result.message;
        if (part.output?.message) return part.output.message;

        // Try to extract from nested structures
        if (part.result?.parts?.[0]?.text) return part.result.parts[0].text;
        if (part.output?.parts?.[0]?.text) return part.output.parts[0].text;
        if (part.result?.parts?.[0]?.content)
          return part.result.parts[0].content;
        if (part.output?.parts?.[0]?.content)
          return part.output.parts[0].content;

        // If no text found, return empty string for tool calls
        return '';
      }

      // Handle other part types
      if (part.text) return part.text;
      if (part.content) return part.content;

      return '';
    })
    .filter((text) => text && text.trim().length > 0)
    .join(' ');
}

function ensurePartsArray(
  message: any,
  content: string,
): Array<{ type: string; text: string; [key: string]: any }> {
  if (!message.parts || message.parts.length === 0) {
    return [{ type: 'text', text: content }];
  }

  return message.parts.map((part: any) => ({
    ...part,
    text: part.text || '',
  }));
}

function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export function normalizeUIMessage(message: any): NormalizedUIMessage {
  const normalizedMessage =
    !message || typeof message !== 'object' ? {} : message;

  // Debug logging for problematic messages
  if (normalizedMessage.role === 'assistant' && normalizedMessage.content) {
    console.log(
      '🔍 normalizeUIMessage - assistant message content type:',
      typeof normalizedMessage.content,
    );
    if (Array.isArray(normalizedMessage.content)) {
      console.log(
        '🔍 normalizeUIMessage - content is array, length:',
        normalizedMessage.content.length,
      );
    } else if (typeof normalizedMessage.content === 'object') {
      console.log(
        '🔍 normalizeUIMessage - content is object, keys:',
        Object.keys(normalizedMessage.content),
      );
    }
  }

  // Handle different content types from AI SDK v5
  let contentFromField = normalizedMessage.content || '';

  // If content is an array (AI SDK v5 tool responses), convert to string
  if (Array.isArray(contentFromField)) {
    contentFromField = contentFromField
      .filter((item) => item && typeof item === 'object')
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item.text) return item.text;
        if (item.content) return item.content;
        return JSON.stringify(item);
      })
      .join(' ');
  }

  // If content is an object, try to extract text or convert to string
  if (typeof contentFromField === 'object' && contentFromField !== null) {
    if (contentFromField.text) {
      contentFromField = contentFromField.text;
    } else if (contentFromField.content) {
      contentFromField = contentFromField.content;
    } else {
      // For tool calls, try to extract meaningful text or return empty
      if (contentFromField.type === 'tool-call') {
        contentFromField = ''; // Tool calls don't need text content
      } else {
        contentFromField = JSON.stringify(contentFromField);
      }
    }
  }

  const contentFromParts = extractContentFromParts(normalizedMessage.parts);
  let content = contentFromField || contentFromParts || '';

  // CRITICAL FIX: If assistant message has only tool calls without text content,
  // add default text to prevent validation errors on next request
  if (
    normalizedMessage.role === 'assistant' &&
    !content &&
    normalizedMessage.parts &&
    Array.isArray(normalizedMessage.parts) &&
    normalizedMessage.parts.some((p: any) =>
      p && typeof p === 'object' && p.type &&
      (p.type === 'tool-call' || p.type.startsWith('tool-'))
    )
  ) {
    content = 'Generated content using AI tools.';
    console.log('🔧 Added default content for tool-only message');
  }

  const parts = ensurePartsArray(normalizedMessage, content);

  const id =
    normalizedMessage.id && isValidUUID(normalizedMessage.id)
      ? normalizedMessage.id
      : generateUUID();

  const createdAt = normalizedMessage.createdAt || new Date();

  const result = {
    ...normalizedMessage,
    id,
    content,
    parts,
    createdAt,
    role: normalizedMessage.role || 'user',
  };

  // Debug logging for final result
  if (normalizedMessage.role === 'assistant') {
    console.log('🔍 normalizeUIMessage - final result:', {
      id: result.id,
      contentLength: result.content?.length || 0,
      hasContent: !!result.content,
      partsCount: result.parts?.length || 0,
    });
  }

  return result;
}

export function ensureMessageHasUUID(message: any): NormalizedUIMessage {
  const normalizedMessage =
    !message || typeof message !== 'object' ? {} : message;

  const hasValidUUID =
    normalizedMessage.id && isValidUUID(normalizedMessage.id);

  if (hasValidUUID) {
    return {
      ...normalizedMessage,
      id: normalizedMessage.id,
    } as NormalizedUIMessage;
  }

  return { ...normalizedMessage, id: generateUUID() } as NormalizedUIMessage;
}

/**
 * Normalize message parts to use generic type names for AI SDK v5
 * Converts tool-specific types like "tool-configureImageGeneration" to "tool-call"
 */
export function normalizeMessageParts(message: any): any {
  if (!message || !message.parts || !Array.isArray(message.parts)) {
    return message;
  }

  const normalizedParts = message.parts.map((part: any) => {
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

  return { ...message, parts: normalizedParts };
}

export { convertFromDB as convertDBMessagesToUIMessages };
export type { DBMessage };
