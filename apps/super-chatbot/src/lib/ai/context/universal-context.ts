/**
 * Универсальная система контекста для медиа-файлов
 * Поддерживает изображения, видео, аудио и другие типы медиа
 */

import { contextCache, generateMessageHash, CacheUtils } from "./cache";

export type MediaType = "image" | "video" | "audio" | "document";

export type ConfidenceLevel = "high" | "medium" | "low";

export interface MediaContext {
  sourceUrl?: string;
  sourceId?: string;
  mediaType: MediaType;
  confidence: ConfidenceLevel;
  reasoning: string;
  metadata?: Record<string, any>;
}

export interface ChatMedia {
  url: string;
  id?: string;
  role: "user" | "assistant";
  timestamp: Date;
  prompt?: string;
  messageIndex: number;
  mediaType: MediaType;
  metadata?: Record<string, any>;
}

export interface ContextAnalyzer {
  mediaType: MediaType;
  analyzeContext(
    userMessage: string,
    chatMedia: ChatMedia[],
    currentAttachments?: any[]
  ): Promise<MediaContext>;
  extractMediaFromMessage(message: any): ChatMedia[];
  getReferencePatterns(): ReferencePattern[];
}

export interface ReferencePattern {
  pattern: RegExp;
  weight: number;
  description: string;
  targetResolver: (message: string, media: ChatMedia[]) => ChatMedia | null;
}

/**
 * Базовый класс для анализаторов контекста
 */
export abstract class BaseContextAnalyzer implements ContextAnalyzer {
  abstract mediaType: MediaType;

  abstract getReferencePatterns(): ReferencePattern[];

  async analyzeContext(
    userMessage: string,
    chatMedia: ChatMedia[],
    currentAttachments?: any[]
  ): Promise<MediaContext> {
    console.log(`🔍 [${this.mediaType}] analyzeContext: Starting analysis`, {
      userMessage,
      chatMediaLength: chatMedia.length,
      currentAttachments: currentAttachments?.length || 0,
    });

    // 1. Проверяем текущее сообщение на наличие медиа
    const currentMedia = this.checkCurrentMessage(currentAttachments);
    if (currentMedia) {
      return {
        sourceUrl: currentMedia.url,
        sourceId: currentMedia.id,
        mediaType: this.mediaType,
        confidence: "high",
        reasoning: `Медиа найдено в текущем сообщении пользователя`,
        metadata: currentMedia.metadata,
      };
    }

    // 2. Проверяем, есть ли медиа в истории чата
    const filteredMedia = chatMedia.filter(
      (m) => m.mediaType === this.mediaType
    );
    if (filteredMedia.length === 0) {
      return {
        mediaType: this.mediaType,
        confidence: "low",
        reasoning: `В истории чата не найдено ${this.mediaType} файлов`,
      };
    }

    // 3. Анализируем текст сообщения на предмет ссылок
    const references = this.analyzeReferences(userMessage, filteredMedia);
    if (references.length > 0) {
      const bestMatch = references.sort((a, b) => b.relevance - a.relevance)[0];
      return {
        sourceUrl: bestMatch.media.url,
        sourceId: bestMatch.media.id,
        mediaType: this.mediaType,
        confidence: bestMatch.relevance > 0.7 ? "high" : "medium",
        reasoning: `Найдена ссылка на ${this.mediaType}: ${bestMatch.reasoning}`,
        metadata: bestMatch.media.metadata,
      };
    }

    // 4. Используем эвристики
    const heuristicMatch = this.findByHeuristics(userMessage, filteredMedia);
    if (heuristicMatch) {
      return {
        sourceUrl: heuristicMatch.media.url,
        sourceId: heuristicMatch.media.id,
        mediaType: this.mediaType,
        confidence: "medium",
        reasoning: `Медиа выбрано по эвристике: ${heuristicMatch.reasoning}`,
        metadata: heuristicMatch.media.metadata,
      };
    }

    // 5. По умолчанию используем последнее медиа
    const lastMedia = filteredMedia[filteredMedia.length - 1];
    return {
      sourceUrl: lastMedia.url,
      sourceId: lastMedia.id,
      mediaType: this.mediaType,
      confidence: "low",
      reasoning: `Используется последний ${this.mediaType} файл из чата`,
      metadata: lastMedia.metadata,
    };
  }

  abstract extractMediaFromMessage(message: any): ChatMedia[];

  private checkCurrentMessage(currentAttachments?: any[]): ChatMedia | null {
    if (!currentAttachments?.length) return null;

    const currentMedia = currentAttachments.find((a: any) =>
      this.isValidMediaAttachment(a)
    );

    if (currentMedia?.url) {
      return {
        url: currentMedia.url,
        id: currentMedia.id,
        role: "user",
        timestamp: new Date(),
        messageIndex: 0, // Current message index
        mediaType: this.mediaType,
        metadata: this.extractMetadata(currentMedia),
      };
    }

    return null;
  }

  private analyzeReferences(
    userMessage: string,
    chatMedia: ChatMedia[]
  ): Array<{ media: ChatMedia; relevance: number; reasoning: string }> {
    const messageLower = userMessage.toLowerCase();
    const references: Array<{
      media: ChatMedia;
      relevance: number;
      reasoning: string;
    }> = [];

    const patterns = this.getReferencePatterns();

    patterns.forEach(({ pattern, weight, targetResolver }) => {
      if (pattern.test(messageLower)) {
        const targetMedia = targetResolver(messageLower, chatMedia);
        if (targetMedia) {
          references.push({
            media: targetMedia,
            relevance: weight,
            reasoning: `Найдено совпадение с паттерном: ${pattern.source}`,
          });
        }
      }
    });

    return references;
  }

  private findByHeuristics(
    userMessage: string,
    chatMedia: ChatMedia[]
  ): { media: ChatMedia; reasoning: string } | null {
    const messageLower = userMessage.toLowerCase();

    // Проверяем на контекст редактирования
    const editWords = this.getEditWords();
    const hasEditIntent = editWords.some((word) => messageLower.includes(word));

    if (hasEditIntent) {
      // Приоритет: последнее сгенерированное медиа, затем последнее загруженное
      const generatedMedia = chatMedia.filter((m) => m.role === "assistant");
      const uploadedMedia = chatMedia.filter((m) => m.role === "user");

      let targetMedia: ChatMedia;
      let reasoning: string;

      if (generatedMedia.length > 0) {
        targetMedia = generatedMedia[generatedMedia.length - 1];
        reasoning = `контекст редактирования - используется последнее сгенерированное ${this.mediaType}`;
      } else if (uploadedMedia.length > 0) {
        targetMedia = uploadedMedia[uploadedMedia.length - 1];
        reasoning = `контекст редактирования - используется последнее загруженное ${this.mediaType}`;
      } else {
        targetMedia = chatMedia[chatMedia.length - 1];
        reasoning = `контекст редактирования - используется последний ${this.mediaType} в чате`;
      }

      return { media: targetMedia, reasoning };
    }

    return null;
  }

  protected abstract isValidMediaAttachment(attachment: any): boolean;
  protected abstract extractMetadata(attachment: any): Record<string, any>;
  protected abstract getEditWords(): string[];
}

/**
 * Менеджер контекста для работы с разными типами медиа
 */
export class UniversalContextManager {
  private analyzers: Map<MediaType, ContextAnalyzer> = new Map();

  registerAnalyzer(analyzer: ContextAnalyzer): void {
    this.analyzers.set(analyzer.mediaType, analyzer);
    console.log(`🔧 Registered context analyzer for: ${analyzer.mediaType}`);
  }

  async analyzeContext(
    mediaType: MediaType,
    userMessage: string,
    chatMedia: ChatMedia[],
    currentAttachments?: any[],
    chatId?: string
  ): Promise<MediaContext> {
    // Проверяем кэш, если доступен chatId
    if (chatId && CacheUtils.shouldUseCache(userMessage, currentAttachments)) {
      const messageHash = generateMessageHash(userMessage, currentAttachments);
      const cachedContext = await contextCache.getCachedContext(
        chatId,
        messageHash,
        mediaType
      );

      if (cachedContext) {
        console.log(
          `🎯 Using cached context for ${mediaType} in chat ${chatId}`
        );
        return cachedContext;
      }
    }

    const analyzer = this.analyzers.get(mediaType);
    if (!analyzer) {
      throw new Error(`No analyzer registered for media type: ${mediaType}`);
    }

    const context = await analyzer.analyzeContext(
      userMessage,
      chatMedia,
      currentAttachments
    );

    // Сохраняем в кэш, если доступен chatId
    if (chatId && CacheUtils.shouldUseCache(userMessage, currentAttachments)) {
      const messageHash = generateMessageHash(userMessage, currentAttachments);
      await contextCache.setCachedContext(
        chatId,
        messageHash,
        mediaType,
        context
      );
    }

    return context;
  }

  async getChatMedia(chatId: string): Promise<ChatMedia[]> {
    try {
      const { getMessagesByChatId } = await import("@/lib/db/queries");
      const messages = await getMessagesByChatId({ id: chatId });

      const allMedia: ChatMedia[] = [];

      messages.forEach((msg, index) => {
        try {
          const attachments = msg.attachments as any[];
          if (Array.isArray(attachments)) {
            attachments.forEach((att) => {
              // Определяем тип медиа по content type
              const mediaType = this.detectMediaType(att?.contentType);
              if (mediaType && this.isValidUrl(att?.url)) {
                const analyzer = this.analyzers.get(mediaType);
                if (analyzer) {
                  const media = analyzer.extractMediaFromMessage(att);
                  if (media.length > 0) {
                    allMedia.push(
                      ...media.map((m) => ({
                        ...m,
                        role: msg.role as "user" | "assistant",
                        timestamp: msg.createdAt,
                        messageIndex: index,
                      }))
                    );
                  }
                }
              }
            });
          }
        } catch (error) {
          console.warn("Error parsing message attachments:", error);
        }
      });

      return allMedia;
    } catch (error) {
      console.error("Error getting chat media:", error);
      return [];
    }
  }

  private detectMediaType(contentType?: string): MediaType | null {
    if (!contentType) return null;

    if (contentType.startsWith("image/")) return "image";
    if (contentType.startsWith("video/")) return "video";
    if (contentType.startsWith("audio/")) return "audio";
    if (contentType.includes("pdf") || contentType.includes("document"))
      return "document";

    return null;
  }

  private isValidUrl(url?: string): boolean {
    return typeof url === "string" && /^https?:\/\//.test(url);
  }
}

// Глобальный экземпляр менеджера контекста
export const contextManager = new UniversalContextManager();
