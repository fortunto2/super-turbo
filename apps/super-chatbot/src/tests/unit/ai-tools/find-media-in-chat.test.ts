import { describe, it, expect, vi, beforeEach } from 'vitest';
import { findMediaInChat } from '@/lib/ai/tools/find-media-in-chat';
import type { ChatMedia } from '@/lib/ai/context';
import { contextManager } from '@/lib/ai/context';

// Mock contextManager
vi.mock('@/lib/ai/context', async () => {
  const actual = await vi.importActual('@/lib/ai/context');
  return {
    ...actual,
    contextManager: {
      getChatMedia: vi.fn(),
    },
  };
});

describe('findMediaInChat', () => {
  const mockOptions = {
    abortSignal: new AbortController().signal,
    messages: [],
    toolCallId: 'test-call-id',
  };

  const mockChatMedia: ChatMedia[] = [
    {
      url: 'https://example.com/image1.jpg',
      id: 'img-1',
      role: 'user',
      timestamp: new Date('2025-10-07T10:00:00Z'),
      prompt: 'A beautiful sunset over mountains',
      messageIndex: 0,
      mediaType: 'image',
    },
    {
      url: 'https://example.com/image2.jpg',
      id: 'img-2',
      role: 'assistant',
      timestamp: new Date('2025-10-07T11:00:00Z'),
      prompt: 'A cat playing with moon',
      messageIndex: 1,
      mediaType: 'image',
    },
    {
      url: 'https://example.com/video1.mp4',
      id: 'vid-1',
      role: 'user',
      timestamp: new Date('2025-10-07T12:00:00Z'),
      prompt: 'Fast car racing',
      messageIndex: 2,
      mediaType: 'video',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should find last uploaded image', async () => {
    vi.mocked(contextManager.getChatMedia).mockResolvedValue(mockChatMedia);

    const result = await (findMediaInChat.execute as any)(
      {
        chatId: 'chat-123',
        mediaType: 'image',
        query: 'last uploaded',
        limit: 5,
      },
      mockOptions,
    );

    expect(result.success).toBe(true);
    expect(result.found).toBe(1);
    expect(result.media[0]?.id).toBe('img-1');
    expect(result.media[0]?.role).toBe('user');
  });

  it('should find image by content (moon)', async () => {
    vi.mocked(contextManager.getChatMedia).mockResolvedValue(mockChatMedia);

    const result = await (findMediaInChat.execute as any)(
      {
        chatId: 'chat-123',
        mediaType: 'image',
        query: 'with moon',
        limit: 5,
      },
      mockOptions,
    );

    expect(result.success).toBe(true);
    expect(result.found).toBeGreaterThan(0);
    // Should find img-2 because prompt contains "moon"
    const hasMoonImage = result.media.some((m: any) =>
      m.prompt?.includes('moon'),
    );
    expect(hasMoonImage).toBe(true);
  });

  it('should filter by media type', async () => {
    vi.mocked(contextManager.getChatMedia).mockResolvedValue(mockChatMedia);

    const result = await (findMediaInChat.execute as any)(
      {
        chatId: 'chat-123',
        mediaType: 'video',
        limit: 5,
      },
      mockOptions,
    );

    expect(result.success).toBe(true);
    expect(result.found).toBe(1);
    expect(result.media[0]?.type).toBe('video');
    expect(result.media[0]?.id).toBe('vid-1');
  });

  it('should return helpful message when no media found', async () => {
    vi.mocked(contextManager.getChatMedia).mockResolvedValue([]);

    const result = await (findMediaInChat.execute as any)(
      {
        chatId: 'chat-123',
        mediaType: 'image',
        query: 'nonexistent',
        limit: 5,
      },
      mockOptions,
    );

    expect(result.success).toBe(true);
    expect(result.found).toBe(0);
    expect(result.message).toContain('No media found');
    expect(result.suggestion).toBeTruthy();
  });

  it('should filter by role (user)', async () => {
    vi.mocked(contextManager.getChatMedia).mockResolvedValue(mockChatMedia);

    const result = await (findMediaInChat.execute as any)(
      {
        chatId: 'chat-123',
        mediaType: 'image',
        role: 'user',
        limit: 5,
      },
      mockOptions,
    );

    expect(result.success).toBe(true);
    expect(result.media.every((m: any) => m.role === 'user')).toBe(true);
  });

  it('should limit results', async () => {
    vi.mocked(contextManager.getChatMedia).mockResolvedValue(mockChatMedia);

    const result = await (findMediaInChat.execute as any)(
      {
        chatId: 'chat-123',
        mediaType: 'any',
        limit: 2,
      },
      mockOptions,
    );

    expect(result.success).toBe(true);
    expect(result.media.length).toBeLessThanOrEqual(2);
  });

  it('should handle errors gracefully', async () => {
    vi.mocked(contextManager.getChatMedia).mockRejectedValue(
      new Error('Database error'),
    );

    const result = await (findMediaInChat.execute as any)(
      {
        chatId: 'chat-123',
        mediaType: 'image',
        limit: 5,
      },
      mockOptions,
    );

    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });
});
