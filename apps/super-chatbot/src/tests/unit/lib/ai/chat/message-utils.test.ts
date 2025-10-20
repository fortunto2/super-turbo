import { describe, it, expect, } from 'vitest';
import {
  normalizeUIMessage,
  convertDBMessagesToUIMessages,
  ensureMessageHasUUID,
} from '@/lib/ai/chat/message-utils';
import type { DBMessage } from '@/lib/types/message-conversion';

function createUserMessage(overrides = {}): any {
  return {
    role: 'user',
    content: 'Hello, world!',
    createdAt: new Date(),
    ...overrides,
  };
}

function createAssistantMessage(overrides = {}): any {
  return {
    role: 'assistant',
    parts: [{ type: 'text', text: 'Hi there!' }],
    createdAt: new Date(),
    ...overrides,
  };
}

function createDBMessage(overrides = {}): DBMessage {
  return {
    id: '123e4567-e89b-12d3-a456-426614174000',
    chatId: 'chat-123',
    role: 'user',
    parts: [{ type: 'text', text: 'Test message' }],
    attachments: [],
    createdAt: new Date(),
    ...overrides,
  };
}

function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

describe('message-utils', () => {
  describe('normalizeUIMessage', () => {
    it('should normalize message with content field', () => {
      const message = createUserMessage({ content: 'Hello AI' });

      const normalized = normalizeUIMessage(message);

      expect(normalized.content).toBe('Hello AI');
      expect(normalized.parts).toBeDefined();
      expect(normalized.parts?.[0]?.type).toBe('text');
      expect(normalized.parts?.[0]?.text).toBe('Hello AI');
      expect(normalized.id).toBeDefined();
      expect(isValidUUID(normalized.id)).toBe(true);
    });

    it('should normalize message with parts field', () => {
      const message = createAssistantMessage({
        parts: [
          { type: 'text', text: 'Part 1' },
          { type: 'text', text: 'Part 2' },
        ],
      });

      const normalized = normalizeUIMessage(message);

      expect(normalized.parts).toHaveLength(2);
      expect(normalized.parts?.[0]?.text).toBe('Part 1');
      expect(normalized.parts?.[1]?.text).toBe('Part 2');
      expect(normalized.content).toBe('Part 1 Part 2');
    });

    it('should generate UUID when missing', () => {
      const message = createUserMessage();

      const normalized = normalizeUIMessage(message);

      expect(normalized.id).toBeDefined();
      expect(isValidUUID(normalized.id)).toBe(true);
    });

    it('should preserve existing UUID', () => {
      const existingUUID = '550e8400-e29b-41d4-a716-446655440000';
      const message = createUserMessage({ id: existingUUID });

      const normalized = normalizeUIMessage(message);

      expect(normalized.id).toBe(existingUUID);
    });

    it('should handle missing content and parts gracefully', () => {
      const message = { role: 'user' as const };

      const normalized = normalizeUIMessage(message);

      expect(normalized.content).toBe('');
      expect(normalized.parts).toEqual([{ type: 'text', text: '' }]);
      expect(normalized.id).toBeDefined();
    });

    it('should add createdAt when missing', () => {
      const beforeTest = new Date();
      const message = createUserMessage();
      (message as any).createdAt = undefined;

      const normalized = normalizeUIMessage(message);

      expect(normalized.createdAt).toBeDefined();
      expect(normalized.createdAt).toBeInstanceOf(Date);
      expect(normalized.createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeTest.getTime(),
      );
    });

    it('should preserve experimental_attachments', () => {
      const attachments = [
        { url: 'https://example.com/image.jpg', contentType: 'image/jpeg' },
      ];
      const message = createUserMessage({ experimental_attachments: attachments });

      const normalized = normalizeUIMessage(message);

      expect(normalized.experimental_attachments).toEqual(attachments);
    });

    it('should handle empty parts array', () => {
      const message = createUserMessage({ content: 'Test', parts: [] });

      const normalized = normalizeUIMessage(message);

      expect(normalized.content).toBe('Test');
      expect(normalized.parts).toEqual([{ type: 'text', text: 'Test' }]);
    });

    it('should preserve parts with missing text property', () => {
      const message = createAssistantMessage({
        parts: [{ type: 'tool-call', toolName: 'test' }],
      });

      const normalized = normalizeUIMessage(message);

      expect(normalized.parts?.[0]?.type).toBe('tool-call');
      expect(normalized.parts?.[0]?.text).toBe('');
    });
  });

  describe('ensureMessageHasUUID', () => {
    it('should keep valid UUID', () => {
      const validUUID = '123e4567-e89b-12d3-a456-426614174000';
      const message = createUserMessage({ id: validUUID });

      const result = ensureMessageHasUUID(message);

      expect(result.id).toBe(validUUID);
      expect(isValidUUID(result.id)).toBe(true);
    });

    it('should generate UUID for short ID from AI SDK', () => {
      const shortId = 'msg_abc123';
      const message = createUserMessage({ id: shortId });

      const result = ensureMessageHasUUID(message);

      expect(result.id).not.toBe(shortId);
      expect(isValidUUID(result.id)).toBe(true);
    });

    it('should generate UUID when ID is missing', () => {
      const message = createUserMessage();
      (message as any).id = undefined;

      const result = ensureMessageHasUUID(message);

      expect(result.id).toBeDefined();
      expect(isValidUUID(result.id)).toBe(true);
    });

    it('should generate UUID when ID is undefined', () => {
      const message = createUserMessage({ id: undefined });

      const result = ensureMessageHasUUID(message);

      expect(result.id).toBeDefined();
      expect(isValidUUID(result.id)).toBe(true);
    });

    it('should generate UUID when ID is null', () => {
      const message = createUserMessage({ id: null });

      const result = ensureMessageHasUUID(message);

      expect(result.id).toBeDefined();
      expect(isValidUUID(result.id)).toBe(true);
    });

    it('should not modify message except for ID', () => {
      const message = createUserMessage({
        id: 'short-id',
        content: 'Test content',
        role: 'user',
      });

      const result = ensureMessageHasUUID(message);

      expect(result.content).toBe('Test content');
      expect(result.role).toBe('user');
    });
  });

  describe('convertDBMessagesToUIMessages', () => {
    it('should convert single DB message to UI message', () => {
      const dbMessage = createDBMessage();

      const uiMessages = convertDBMessagesToUIMessages([dbMessage]);

      expect(uiMessages).toHaveLength(1);
      expect(uiMessages[0]?.id).toBe(dbMessage.id);
      expect(uiMessages[0]?.role).toBe('user');
    });

    it('should convert multiple DB messages', () => {
      const dbMessages = [
        createDBMessage({ id: 'msg-1', role: 'user' }),
        createDBMessage({ id: 'msg-2', role: 'assistant' }),
        createDBMessage({ id: 'msg-3', role: 'user' }),
      ];

      const uiMessages = convertDBMessagesToUIMessages(dbMessages);

      expect(uiMessages).toHaveLength(3);
      expect(uiMessages[0]?.id).toBe('msg-1');
      expect(uiMessages[1]?.id).toBe('msg-2');
      expect(uiMessages[2]?.id).toBe('msg-3');
    });

    it('should handle empty array', () => {
      const uiMessages = convertDBMessagesToUIMessages([]);

      expect(uiMessages).toEqual([]);
    });

    it('should preserve message order', () => {
      const dbMessages = [
        createDBMessage({ id: 'msg-1', createdAt: new Date('2024-01-01') }),
        createDBMessage({ id: 'msg-2', createdAt: new Date('2024-01-02') }),
        createDBMessage({ id: 'msg-3', createdAt: new Date('2024-01-03') }),
      ];

      const uiMessages = convertDBMessagesToUIMessages(dbMessages);

      expect(uiMessages[0]?.id).toBe('msg-1');
      expect(uiMessages[1]?.id).toBe('msg-2');
      expect(uiMessages[2]?.id).toBe('msg-3');
    });

    it('should use existing convertDBMessagesToUIMessages from message-conversion', () => {
      const dbMessage = createDBMessage({
        parts: [{ type: 'text', text: 'Hello from DB' }],
      });

      const uiMessages = convertDBMessagesToUIMessages([dbMessage]);

      expect(uiMessages[0]?.parts).toBeDefined();
      expect(Array.isArray(uiMessages[0]?.parts)).toBe(true);
    });

    it('should handle DB messages with complex parts', () => {
      const dbMessage = createDBMessage({
        role: 'assistant',
        parts: [
          { type: 'text', text: 'Text part' },
          { type: 'tool-call', toolName: 'generateImage' },
        ],
      });

      const uiMessages = convertDBMessagesToUIMessages([dbMessage]);

      expect(uiMessages[0]?.role).toBe('assistant');
      expect(uiMessages[0]?.parts).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null message gracefully in normalizeUIMessage', () => {
      const result = normalizeUIMessage(null as any);

      expect(result.id).toBeDefined();
      expect(result.content).toBe('');
      expect(result.parts).toEqual([{ type: 'text', text: '' }]);
    });

    it('should handle undefined message gracefully in normalizeUIMessage', () => {
      const result = normalizeUIMessage(undefined as any);

      expect(result.id).toBeDefined();
      expect(result.content).toBe('');
      expect(result.parts).toEqual([{ type: 'text', text: '' }]);
    });

    it('should handle message with only role in normalizeUIMessage', () => {
      const message = { role: 'assistant' as const };

      const result = normalizeUIMessage(message);

      expect(result.role).toBe('assistant');
      expect(result.id).toBeDefined();
      expect(result.content).toBe('');
    });

    it('should handle DB message with null parts', () => {
      const dbMessage = createDBMessage({ parts: null as any });

      const uiMessages = convertDBMessagesToUIMessages([dbMessage]);

      expect(uiMessages).toHaveLength(1);
      expect(uiMessages[0]?.parts).toBeDefined();
    });

    it('should handle DB message with undefined parts', () => {
      const dbMessage = createDBMessage({ parts: undefined as any });

      const uiMessages = convertDBMessagesToUIMessages([dbMessage]);

      expect(uiMessages).toHaveLength(1);
      expect(uiMessages[0]?.parts).toBeDefined();
    });
  });

  describe('Type Safety', () => {
    it('should return properly typed UIMessage from normalizeUIMessage', () => {
      const message = createUserMessage();

      const normalized = normalizeUIMessage(message);

      expect(normalized).toHaveProperty('id');
      expect(normalized).toHaveProperty('role');
      expect(normalized).toHaveProperty('content');
      expect(normalized).toHaveProperty('parts');
      expect(normalized).toHaveProperty('createdAt');
    });

    it('should return array of UIMessages from convertDBMessagesToUIMessages', () => {
      const dbMessages = [createDBMessage()];

      const uiMessages = convertDBMessagesToUIMessages(dbMessages);

      expect(Array.isArray(uiMessages)).toBe(true);
      uiMessages.forEach((msg) => {
        expect(msg).toHaveProperty('id');
        expect(msg).toHaveProperty('role');
      });
    });
  });
});
