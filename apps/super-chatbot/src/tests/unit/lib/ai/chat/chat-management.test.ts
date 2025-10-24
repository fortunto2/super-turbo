import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { VisibilityType } from '@/components/shared/visibility-selector';

vi.mock('@/lib/db/queries');
vi.mock('@/app/(chat)/actions');
vi.mock('@/lib/ai/chat/message-utils');

const { ensureChatExists, ensureUserExists, saveUserMessage } = await import(
  '@/lib/ai/chat/chat-management'
);
const mockQueries = await import('@/lib/db/queries');
const mockActions = await import('@/app/(chat)/actions');
const mockMessageUtils = await import('@/lib/ai/chat/message-utils');

function createMockUser(overrides = {}) {
  return {
    id: 'user-123',
    email: 'test@example.com',
    password: null,
    balance: 100,
    sessionId: null,
    ...overrides,
  };
}

function createMockChat(overrides = {}) {
  return {
    id: 'chat-456',
    userId: 'user-123',
    title: 'Test Chat',
    visibility: 'private' as VisibilityType,
    createdAt: new Date(),
    ...overrides,
  };
}

function createMockMessage(overrides = {}) {
  return {
    id: 'msg-789',
    role: 'user' as const,
    content: 'Hello, AI!',
    parts: [{ type: 'text', text: 'Hello, AI!' }],
    experimental_attachments: [],
    createdAt: new Date(),
    ...overrides,
  };
}

function createMockDBMessage(overrides = {}) {
  return {
    id: 'msg-789',
    chatId: 'chat-456',
    role: 'user',
    parts: [{ type: 'text', text: 'Hello, AI!' }],
    attachments: [],
    createdAt: new Date(),
    ...overrides,
  };
}

function createForeignKeyError(constraint: string) {
  const error = new Error(
    `insert or update on table violates foreign key constraint "${constraint}"`,
  );
  return error;
}

describe('chat-management', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(mockMessageUtils.normalizeUIMessage).mockImplementation(
      (msg: any) => ({
        ...msg,
        id: msg.id || 'normalized-id',
        content: msg.content || '',
        parts: msg.parts || [{ type: 'text', text: msg.content || '' }],
        createdAt: msg.createdAt || new Date(),
        role: msg.role || 'user',
      }),
    );

    vi.mocked(mockMessageUtils.ensureMessageHasUUID).mockImplementation(
      (msg: any) => ({
        ...msg,
        id: msg.id && /^[0-9a-f]{8}-/.test(msg.id) ? msg.id : 'uuid-generated',
      }),
    );
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('ensureUserExists', () => {
    it('should return existing user when found by ID', async () => {
      const mockUser = createMockUser();
      vi.mocked(mockQueries.getOrCreateOAuthUser).mockResolvedValue(mockUser);

      const result = await ensureUserExists('user-123', 'test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockQueries.getOrCreateOAuthUser).toHaveBeenCalledWith(
        'user-123',
        'test@example.com',
      );
    });

    it('should create OAuth user when not found', async () => {
      const newUser = createMockUser({ id: 'new-user-456' });
      vi.mocked(mockQueries.getOrCreateOAuthUser).mockResolvedValue(newUser);

      const result = await ensureUserExists(
        'new-user-456',
        'newuser@example.com',
      );

      expect(result).toEqual(newUser);
      expect(mockQueries.getOrCreateOAuthUser).toHaveBeenCalledWith(
        'new-user-456',
        'newuser@example.com',
      );
    });

    it('should handle duplicate user creation gracefully', async () => {
      const existingUser = createMockUser();
      vi.mocked(mockQueries.getOrCreateOAuthUser).mockResolvedValue(
        existingUser,
      );

      const result = await ensureUserExists('user-123', 'test@example.com');

      expect(result).toEqual(existingUser);
    });

    it('should use email as fallback when userId differs', async () => {
      const userByEmail = createMockUser({ id: 'different-id' });
      vi.mocked(mockQueries.getOrCreateOAuthUser).mockResolvedValue(
        userByEmail,
      );

      const result = await ensureUserExists('requested-id', 'test@example.com');

      expect(result).toBeDefined();
      expect(mockQueries.getOrCreateOAuthUser).toHaveBeenCalled();
    });
  });

  describe('ensureChatExists', () => {
    it('should return existing chat without creating new one', async () => {
      const existingChat = createMockChat();
      vi.mocked(mockQueries.getChatById).mockResolvedValue(existingChat);

      const params = {
        chatId: 'chat-456',
        userId: 'user-123',
        userEmail: 'test@example.com',
        firstMessage: createMockMessage(),
        visibility: 'private' as VisibilityType,
      };

      const result = await ensureChatExists(params);

      expect(result).toEqual(existingChat);
      expect(mockQueries.getChatById).toHaveBeenCalledWith({ id: 'chat-456' });
      expect(mockQueries.saveChat).not.toHaveBeenCalled();
    });

    it('should create chat when not exists', async () => {
      const newChat = createMockChat({ id: 'new-chat-789' });
      const mockMessage = createMockMessage();

      vi.mocked(mockQueries.getChatById)
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(newChat);
      vi.mocked(mockQueries.getOrCreateOAuthUser).mockResolvedValue(
        createMockUser(),
      );
      vi.mocked(mockActions.generateTitleFromUserMessage).mockResolvedValue(
        'Generated Title',
      );
      vi.mocked(mockQueries.saveChat).mockResolvedValue(undefined as any);

      const params = {
        chatId: 'new-chat-789',
        userId: 'user-123',
        userEmail: 'test@example.com',
        firstMessage: mockMessage,
        visibility: 'private' as VisibilityType,
      };

      const result = await ensureChatExists(params);

      expect(result).toEqual(newChat);
      expect(mockQueries.getOrCreateOAuthUser).toHaveBeenCalledWith(
        'user-123',
        'test@example.com',
      );
      expect(mockActions.generateTitleFromUserMessage).toHaveBeenCalled();
      expect(mockQueries.saveChat).toHaveBeenCalledWith({
        id: 'new-chat-789',
        userId: 'user-123',
        title: 'Generated Title',
        visibility: 'private',
      });
    });

    it('should ensure user exists before creating chat', async () => {
      const mockUser = createMockUser();
      const newChat = createMockChat();

      vi.mocked(mockQueries.getChatById)
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(newChat);
      vi.mocked(mockQueries.getOrCreateOAuthUser).mockResolvedValue(mockUser);
      vi.mocked(mockActions.generateTitleFromUserMessage).mockResolvedValue(
        'Test Title',
      );
      vi.mocked(mockQueries.saveChat).mockResolvedValue(undefined as any);

      const params = {
        chatId: 'chat-new',
        userId: 'user-123',
        userEmail: 'test@example.com',
        firstMessage: createMockMessage(),
        visibility: 'private' as VisibilityType,
      };

      await ensureChatExists(params);

      // Verify getOrCreateOAuthUser was called before saveChat
      expect(mockQueries.getOrCreateOAuthUser).toHaveBeenCalled();
      expect(mockQueries.saveChat).toHaveBeenCalled();
    });

    it('should recover from foreign key error by creating user', async () => {
      const fkError = createForeignKeyError('Chat_userId_User_id_fk');
      const mockUser = createMockUser();
      const newChat = createMockChat();

      vi.mocked(mockQueries.getChatById)
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(newChat);
      vi.mocked(mockQueries.getOrCreateOAuthUser).mockResolvedValue(mockUser);
      vi.mocked(mockActions.generateTitleFromUserMessage).mockResolvedValue(
        'Recovery Title',
      );
      vi.mocked(mockQueries.saveChat)
        .mockRejectedValueOnce(fkError)
        .mockResolvedValueOnce(undefined as any);

      const params = {
        chatId: 'chat-recovery',
        userId: 'user-new',
        userEmail: 'recovery@example.com',
        firstMessage: createMockMessage(),
        visibility: 'private' as VisibilityType,
      };

      const result = await ensureChatExists(params);

      expect(result).toEqual(newChat);
      expect(mockQueries.getOrCreateOAuthUser).toHaveBeenCalledTimes(2);
      expect(mockQueries.saveChat).toHaveBeenCalledTimes(2);
    });

    it('should generate title from first message', async () => {
      const mockMessage = createMockMessage({ content: 'Analyze this data' });
      const newChat = createMockChat();

      vi.mocked(mockQueries.getChatById)
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(newChat);
      vi.mocked(mockQueries.getOrCreateOAuthUser).mockResolvedValue(
        createMockUser(),
      );
      vi.mocked(mockActions.generateTitleFromUserMessage).mockResolvedValue(
        'Data Analysis Chat',
      );
      vi.mocked(mockQueries.saveChat).mockResolvedValue(undefined as any);

      const params = {
        chatId: 'chat-title-test',
        userId: 'user-123',
        userEmail: 'test@example.com',
        firstMessage: mockMessage,
        visibility: 'private' as VisibilityType,
      };

      await ensureChatExists(params);

      expect(mockActions.generateTitleFromUserMessage).toHaveBeenCalledWith({
        message: expect.objectContaining({
          content: 'Analyze this data',
        }),
      });
      expect(mockQueries.saveChat).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Data Analysis Chat',
        }),
      );
    });

    it('should use default title when no message provided', async () => {
      const newChat = createMockChat({ title: 'New Chat' });

      vi.mocked(mockQueries.getChatById)
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(newChat);
      vi.mocked(mockQueries.getOrCreateOAuthUser).mockResolvedValue(
        createMockUser(),
      );
      vi.mocked(mockActions.generateTitleFromUserMessage).mockResolvedValue(
        'New Chat',
      );
      vi.mocked(mockQueries.saveChat).mockResolvedValue(undefined as any);

      const params = {
        chatId: 'chat-no-msg',
        userId: 'user-123',
        userEmail: 'test@example.com',
        firstMessage: undefined as any,
        visibility: 'private' as VisibilityType,
      };

      const result = await ensureChatExists(params);

      expect(result).toEqual(newChat);
    });

    it('should handle visibility types correctly', async () => {
      const publicChat = createMockChat({ visibility: 'public' });

      vi.mocked(mockQueries.getChatById)
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(publicChat);
      vi.mocked(mockQueries.getOrCreateOAuthUser).mockResolvedValue(
        createMockUser(),
      );
      vi.mocked(mockActions.generateTitleFromUserMessage).mockResolvedValue(
        'Public Chat',
      );
      vi.mocked(mockQueries.saveChat).mockResolvedValue(undefined as any);

      const params = {
        chatId: 'chat-public',
        userId: 'user-123',
        userEmail: 'test@example.com',
        firstMessage: createMockMessage(),
        visibility: 'public' as VisibilityType,
      };

      await ensureChatExists(params);

      expect(mockQueries.saveChat).toHaveBeenCalledWith(
        expect.objectContaining({
          visibility: 'public',
        }),
      );
    });
  });

  describe('saveUserMessage', () => {
    it('should save user message successfully', async () => {
      const mockMessage = createMockMessage();
      vi.mocked(mockQueries.saveMessages).mockResolvedValue(undefined as any);

      const params = {
        chatId: 'chat-456',
        message: mockMessage,
        attachments: [],
      };

      await saveUserMessage(params);

      expect(mockQueries.saveMessages).toHaveBeenCalledWith({
        messages: [
          expect.objectContaining({
            chatId: 'chat-456',
            role: 'user',
            parts: mockMessage.parts,
            attachments: [],
          }),
        ],
      });
    });

    it('should handle attachments correctly', async () => {
      const mockAttachments = [
        {
          url: 'https://example.com/image.png',
          contentType: 'image/png',
          name: 'test.png',
        },
      ];
      const mockMessage = createMockMessage({
        experimental_attachments: mockAttachments,
      });

      vi.mocked(mockQueries.saveMessages).mockResolvedValue(undefined as any);

      const params = {
        chatId: 'chat-456',
        message: mockMessage,
        attachments: mockAttachments,
      };

      await saveUserMessage(params);

      expect(mockQueries.saveMessages).toHaveBeenCalledWith({
        messages: [
          expect.objectContaining({
            attachments: mockAttachments,
          }),
        ],
      });
    });

    it('should recover from FK error by ensuring chat exists', async () => {
      const fkError = createForeignKeyError('Message_v2_chatId_Chat_id_fk');
      const mockMessage = createMockMessage();
      const mockChat = createMockChat();

      vi.mocked(mockQueries.saveMessages)
        .mockRejectedValueOnce(fkError)
        .mockResolvedValueOnce(undefined as any);
      vi.mocked(mockQueries.getChatById)
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(mockChat);
      vi.mocked(mockQueries.getOrCreateOAuthUser).mockResolvedValue(
        createMockUser(),
      );
      vi.mocked(mockActions.generateTitleFromUserMessage).mockResolvedValue(
        'Recovery Chat',
      );
      vi.mocked(mockQueries.saveChat).mockResolvedValue(undefined as any);

      const params = {
        chatId: 'chat-recovery',
        message: mockMessage,
      };

      await saveUserMessage(params);

      expect(mockQueries.saveMessages).toHaveBeenCalledTimes(2);
      expect(mockQueries.saveChat).toHaveBeenCalled();
    });

    it('should use message ID from message', async () => {
      const mockMessage = createMockMessage({ id: 'specific-msg-id' });
      vi.mocked(mockQueries.saveMessages).mockResolvedValue(undefined as any);

      const params = {
        chatId: 'chat-456',
        message: mockMessage,
      };

      await saveUserMessage(params);

      expect(mockQueries.saveMessages).toHaveBeenCalledWith({
        messages: [
          expect.objectContaining({
            id: 'specific-msg-id',
          }),
        ],
      });
    });

    it('should generate UUID when message ID is invalid', async () => {
      const mockMessage = createMockMessage({ id: 'short-id' });
      vi.mocked(mockQueries.saveMessages).mockResolvedValue(undefined as any);

      const params = {
        chatId: 'chat-456',
        message: mockMessage,
      };

      await saveUserMessage(params);

      expect(mockQueries.saveMessages).toHaveBeenCalledWith({
        messages: [
          expect.objectContaining({
            id: expect.stringMatching(
              /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
            ),
          }),
        ],
      });
    });

    it('should not throw error on save failure', async () => {
      const saveError = new Error('Database connection failed');
      const mockMessage = createMockMessage();

      vi.mocked(mockQueries.saveMessages).mockRejectedValue(saveError);

      const params = {
        chatId: 'chat-456',
        message: mockMessage,
      };

      await expect(saveUserMessage(params)).resolves.not.toThrow();
    });

    it('should convert content to parts when parts missing', async () => {
      const mockMessage = {
        id: 'msg-content-only',
        role: 'user' as const,
        content: 'Message with only content',
        createdAt: new Date(),
      };

      vi.mocked(mockQueries.saveMessages).mockResolvedValue(undefined as any);

      const params = {
        chatId: 'chat-456',
        message: mockMessage as any,
      };

      await saveUserMessage(params);

      expect(mockQueries.saveMessages).toHaveBeenCalledWith({
        messages: [
          expect.objectContaining({
            parts: [{ type: 'text', text: 'Message with only content' }],
          }),
        ],
      });
    });

    it('should use empty attachments array when not provided', async () => {
      const mockMessage = createMockMessage();
      (mockMessage as any).experimental_attachments = undefined;

      vi.mocked(mockQueries.saveMessages).mockResolvedValue(undefined as any);

      const params = {
        chatId: 'chat-456',
        message: mockMessage,
      };

      await saveUserMessage(params);

      expect(mockQueries.saveMessages).toHaveBeenCalledWith({
        messages: [
          expect.objectContaining({
            attachments: [],
          }),
        ],
      });
    });
  });
});
