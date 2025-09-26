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

    // 3.1. СЕМАНТИЧЕСКИЙ ПОИСК
    try {
      const { semanticAnalyzer } = await import("./semantic-search");
      const semanticMatches = await semanticAnalyzer.findSimilarMedia(
        userMessage,
        filteredMedia,
        0.6
      );
      if (semanticMatches.length > 0) {
        const bestSemanticMatch = semanticMatches[0];
        return {
          sourceUrl: bestSemanticMatch.media.url,
          sourceId: bestSemanticMatch.media.id,
          mediaType: this.mediaType,
          confidence: bestSemanticMatch.similarity > 0.8 ? "high" : "medium",
          reasoning: `Семантический поиск: ${bestSemanticMatch.reasoning}`,
          metadata: {
            ...bestSemanticMatch.media.metadata,
            semanticSimilarity: bestSemanticMatch.similarity,
          },
        };
      }
    } catch (error) {
      console.warn("Semantic search failed:", error);
    }

    // 3.2. ВРЕМЕННОЙ АНАЛИЗ
    try {
      const { temporalAnalyzer } = await import("./temporal-analysis");
      const temporalMatches = await temporalAnalyzer.analyzeTemporalReferences(
        userMessage,
        filteredMedia
      );
      if (temporalMatches.length > 0) {
        const bestTemporalMatch = temporalMatches[0];
        return {
          sourceUrl: bestTemporalMatch.media.url,
          sourceId: bestTemporalMatch.media.id,
          mediaType: this.mediaType,
          confidence:
            bestTemporalMatch.confidence > 0.7
              ? "high"
              : bestTemporalMatch.confidence > 0.5
                ? "medium"
                : "low",
          reasoning: `Временной анализ: ${bestTemporalMatch.reasoning}`,
          metadata: {
            ...bestTemporalMatch.media.metadata,
            temporalDistance: bestTemporalMatch.temporalDistance,
          },
        };
      }
    } catch (error) {
      console.warn("Temporal analysis failed:", error);
    }

    // 4. ПОИСК ПО СОДЕРЖИМОМУ ИЗОБРАЖЕНИЯ (по ключевым словам в промпте)
    const contentMatch = this.findByContent(userMessage, filteredMedia);
    if (contentMatch) {
      return {
        sourceUrl: contentMatch.media.url,
        sourceId: contentMatch.media.id,
        mediaType: this.mediaType,
        confidence: contentMatch.relevance > 0.7 ? "high" : "medium",
        reasoning: `Поиск по содержимому: ${contentMatch.reasoning}`,
        metadata: {
          ...contentMatch.media.metadata,
          contentRelevance: contentMatch.relevance,
        },
      };
    }

    // 5. Используем эвристики
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

    // 6. По умолчанию НЕ используем медиа, если пользователь не просил явно
    return {
      mediaType: this.mediaType,
      confidence: "low",
      reasoning: `В истории чата не найдено подходящих ${this.mediaType} файлов для использования`,
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

  private findByContent(
    userMessage: string,
    chatMedia: ChatMedia[]
  ): { media: ChatMedia; relevance: number; reasoning: string } | null {
    const messageLower = userMessage.toLowerCase();

    // Извлекаем ключевые слова из сообщения пользователя
    const keywords = this.extractKeywords(messageLower);
    console.log(
      `🔍 [${this.mediaType}] findByContent: Keywords from "${userMessage}":`,
      keywords
    );

    if (keywords.length === 0) {
      console.log(
        `🔍 [${this.mediaType}] findByContent: No keywords found, skipping content search`
      );
      return null;
    }

    let bestMatch: ChatMedia | null = null;
    let bestRelevance = 0;
    let bestReasoning = "";

    for (const media of chatMedia) {
      // Проверяем промпт изображения на наличие ключевых слов
      const mediaPrompt = media.prompt || media.metadata?.prompt || "";
      const mediaPromptLower = mediaPrompt.toLowerCase();

      let relevance = 0;
      const matchedKeywords: string[] = [];

      for (const keyword of keywords) {
        if (mediaPromptLower.includes(keyword)) {
          relevance += this.getKeywordWeight(keyword);
          matchedKeywords.push(keyword);
        }
      }

      if (relevance > bestRelevance) {
        bestMatch = media;
        bestRelevance = relevance;
        bestReasoning = `найдены ключевые слова: ${matchedKeywords.join(", ")}`;
      }
    }

    console.log(`🔍 [${this.mediaType}] findByContent: Best match:`, {
      hasMatch: !!bestMatch,
      relevance: bestRelevance,
      reasoning: bestReasoning,
      mediaUrl: bestMatch?.url,
      mediaPrompt: bestMatch?.prompt,
    });

    if (bestMatch && bestRelevance > 0.3) {
      return {
        media: bestMatch,
        relevance: Math.min(bestRelevance, 1.0),
        reasoning: bestReasoning,
      };
    }

    console.log(
      `🔍 [${this.mediaType}] findByContent: No suitable match found (relevance: ${bestRelevance})`
    );
    return null;
  }

  private extractKeywords(text: string): string[] {
    // Извлекаем существительные и важные слова
    const commonWords = new Set([
      "the",
      "a",
      "an",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
      "this",
      "that",
      "is",
      "are",
      "was",
      "were",
      "be",
      "been",
      "have",
      "has",
      "had",
      "do",
      "does",
      "did",
      "will",
      "would",
      "could",
      "should",
      "may",
      "might",
      "can",
      "must",
      "shall",
      "photo",
      "image",
      "picture",
      "make",
      "create",
      "generate",
      "add",
      "take",
      "next",
      "with",
      "to",
      "the",
      "a",
      "an",
    ]);

    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 2 && !commonWords.has(word));

    return [...new Set(words)]; // Убираем дубликаты
  }

  private getKeywordWeight(keyword: string): number {
    // Веса для разных типов ключевых слов
    const weights: Record<string, number> = {
      // Животные - высокий приоритет
      cat: 1.0,
      кот: 1.0,
      кошка: 1.0,
      котенок: 1.0,
      котик: 1.0,
      dog: 1.0,
      собака: 1.0,
      пес: 1.0,
      щенок: 1.0,
      собачка: 1.0,
      mouse: 1.0,
      мышь: 1.0,
      мышка: 1.0,
      snake: 1.0,
      змея: 1.0,
      змейка: 1.0,
      bird: 0.8,
      птица: 0.8,
      птичка: 0.8,
      fish: 0.8,
      рыба: 0.8,
      рыбка: 0.8,

      // Объекты - средний приоритет
      car: 0.7,
      машина: 0.7,
      автомобиль: 0.7,
      house: 0.7,
      дом: 0.7,
      здание: 0.7,
      tree: 0.7,
      дерево: 0.7,
      flower: 0.6,
      цветок: 0.6,

      // Цвета - низкий приоритет
      red: 0.3,
      красный: 0.3,
      blue: 0.3,
      синий: 0.3,
      green: 0.3,
      зеленый: 0.3,
      yellow: 0.3,
      желтый: 0.3,
    };

    return weights[keyword] || 0.5; // Дефолтный вес
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
    chatId?: string,
    userId?: string
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

    // Записываем выбор для обучения предпочтений, если доступны userId и chatId
    if (userId && chatId && context.sourceUrl) {
      try {
        const { userPreferenceLearner } = await import("./user-preferences");
        const selectedMedia = chatMedia.find(
          (media) => media.url === context.sourceUrl
        );
        if (selectedMedia) {
          await userPreferenceLearner.recordUserChoice(
            chatId,
            userId,
            userMessage,
            selectedMedia,
            chatMedia,
            context.confidence === "high"
              ? 0.9
              : context.confidence === "medium"
                ? 0.7
                : 0.5,
            context.reasoning
          );
        }
      } catch (error) {
        console.warn("Failed to record user choice for learning:", error);
      }
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
