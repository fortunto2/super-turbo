/**
 * Система семантического поиска для улучшения понимания контекста
 * Использует универсальный подход без жестко заданных категорий
 */

import type { ChatMedia } from "./universal-context";
import { semanticIndex } from "./semantic-index";

interface SemanticMatch {
  media: ChatMedia;
  similarity: number;
  reasoning: string;
  matchedKeywords: string[];
}

interface EmbeddingVector {
  values: number[];
  metadata: {
    mediaId: string;
    text: string;
    timestamp: number;
  };
}

/**
 * Простой анализатор семантического сходства на основе ключевых слов
 * Теперь использует универсальный семантический индекс
 */
export class SemanticContextAnalyzer {
  private keywordEmbeddings = new Map<string, number[]>();
  private mediaEmbeddings = new Map<string, EmbeddingVector>();

  // Веса для разных типов контента
  private readonly weights = {
    prompt: 1.0,
    fileName: 0.8,
    url: 0.3,
    role: 0.2,
  };

  /**
   * Находит семантически похожие медиа-файлы
   */
  async findSimilarMedia(
    query: string,
    chatMedia: ChatMedia[],
    threshold = 0.6
  ): Promise<SemanticMatch[]> {
    console.log(
      `🔍 SemanticSearch: Searching for "${query}" in ${chatMedia.length} media files`
    );

    const queryKeywords = this.extractKeywords(query);
    const matches: SemanticMatch[] = [];

    for (const media of chatMedia) {
      const similarity = await this.calculateSimilarity(queryKeywords, media);

      if (similarity >= threshold) {
        const matchedKeywords = this.findMatchedKeywords(queryKeywords, media);
        matches.push({
          media,
          similarity,
          reasoning: `Семантическое сходство: ${Math.round(similarity * 100)}% (${matchedKeywords.join(", ")})`,
          matchedKeywords,
        });
      }
    }

    // Сортируем по убыванию сходства
    matches.sort((a, b) => b.similarity - a.similarity);

    console.log(
      `🎯 SemanticSearch: Found ${matches.length} similar media files`
    );
    return matches;
  }

  /**
   * Извлекает ключевые слова из текста
   * Теперь использует универсальный семантический индекс
   */
  private extractKeywords(text: string): string[] {
    // Используем универсальную функцию извлечения ключевых слов
    // из семантического индекса для консистентности
    return semanticIndex.extractKeywords(text);
  }

  /**
   * Вычисляет семантическое сходство между запросом и медиа-файлом
   */
  private async calculateSimilarity(
    queryKeywords: string[],
    media: ChatMedia
  ): Promise<number> {
    let totalScore = 0;
    let maxPossibleScore = 0;

    // Анализируем промпт медиа-файла
    if (media.prompt) {
      const promptKeywords = this.extractKeywords(media.prompt);
      const promptScore = this.calculateKeywordOverlap(
        queryKeywords,
        promptKeywords
      );
      totalScore += promptScore * this.weights.prompt;
      maxPossibleScore += this.weights.prompt;
    }

    // Анализируем имя файла (извлекаем из URL)
    if (media.url) {
      const fileName = media.url.split("/").pop() || "";
      if (fileName) {
        const fileNameKeywords = this.extractKeywords(fileName);
        const fileNameScore = this.calculateKeywordOverlap(
          queryKeywords,
          fileNameKeywords
        );
        totalScore += fileNameScore * this.weights.fileName;
        maxPossibleScore += this.weights.fileName;
      }
    }

    // Анализируем URL (частично)
    if (media.url) {
      const urlKeywords = this.extractKeywords(media.url);
      const urlScore = this.calculateKeywordOverlap(queryKeywords, urlKeywords);
      totalScore += urlScore * this.weights.url;
      maxPossibleScore += this.weights.url;
    }

    // Анализируем роль (user/assistant)
    if (media.role) {
      const roleScore = this.calculateRoleRelevance(queryKeywords, media.role);
      totalScore += roleScore * this.weights.role;
      maxPossibleScore += this.weights.role;
    }

    // Возвращаем нормализованный score
    return maxPossibleScore > 0 ? totalScore / maxPossibleScore : 0;
  }

  /**
   * Вычисляет пересечение ключевых слов
   */
  private calculateKeywordOverlap(
    keywords1: string[],
    keywords2: string[]
  ): number {
    if (keywords1.length === 0 || keywords2.length === 0) return 0;

    const set1 = new Set(keywords1.map((k) => k.toLowerCase()));
    const set2 = new Set(keywords2.map((k) => k.toLowerCase()));

    const intersection = new Set([...set1].filter((x) => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    // Jaccard similarity
    return intersection.size / union.size;
  }

  /**
   * Вычисляет релевантность роли
   */
  private calculateRoleRelevance(keywords: string[], role: string): number {
    const roleKeywords = {
      user: ["загружен", "uploaded", "мой", "my"],
      assistant: ["сгенерирован", "generated", "создан", "created"],
    };

    const relevantKeywords =
      roleKeywords[role as keyof typeof roleKeywords] || [];
    const hasRelevantKeyword = keywords.some((keyword) =>
      relevantKeywords.some((rk) => keyword.toLowerCase().includes(rk))
    );

    return hasRelevantKeyword ? 1.0 : 0.5; // Нейтральный score для неопределенных ролей
  }

  /**
   * Находит совпадающие ключевые слова
   */
  private findMatchedKeywords(
    queryKeywords: string[],
    media: ChatMedia
  ): string[] {
    const matched: string[] = [];

    if (media.prompt) {
      const promptKeywords = this.extractKeywords(media.prompt);
      const querySet = new Set(queryKeywords.map((k) => k.toLowerCase()));
      const promptSet = new Set(promptKeywords.map((k) => k.toLowerCase()));

      for (const keyword of promptKeywords) {
        if (querySet.has(keyword.toLowerCase())) {
          matched.push(keyword);
        }
      }
    }

    return [...new Set(matched)];
  }

  /**
   * Добавляет медиа-файл в индекс для будущего поиска
   */
  addMediaToIndex(media: ChatMedia): void {
    if (media.prompt) {
      const keywords = this.extractKeywords(media.prompt);
      const embedding = this.createSimpleEmbedding(keywords);

      this.mediaEmbeddings.set(media.id || media.url, {
        values: embedding,
        metadata: {
          mediaId: media.id || media.url,
          text: media.prompt,
          timestamp: media.timestamp.getTime(),
        },
      });

      console.log(
        `📝 SemanticSearch: Added media to index: ${media.id || media.url}`
      );
    }
  }

  /**
   * Создает простое векторное представление на основе ключевых слов
   * В будущем может быть заменено на настоящие embeddings
   */
  private createSimpleEmbedding(keywords: string[]): number[] {
    // Простое хеширование ключевых слов в числа
    return keywords.map((keyword) => {
      let hash = 0;
      for (let i = 0; i < keyword.length; i++) {
        const char = keyword.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return Math.abs(hash) / 1000000; // Нормализация
    });
  }

  /**
   * Очищает индекс
   */
  clearIndex(): void {
    this.keywordEmbeddings.clear();
    this.mediaEmbeddings.clear();
    console.log("🧹 SemanticSearch: Index cleared");
  }

  /**
   * Получает статистику индекса
   */
  getIndexStats(): {
    totalMedia: number;
    totalKeywords: number;
    averageKeywordsPerMedia: number;
  } {
    const totalMedia = this.mediaEmbeddings.size;
    const totalKeywords = this.keywordEmbeddings.size;
    const totalKeywordCount = Array.from(this.mediaEmbeddings.values()).reduce(
      (sum, embedding) => sum + embedding.values.length,
      0
    );

    return {
      totalMedia,
      totalKeywords,
      averageKeywordsPerMedia:
        totalMedia > 0 ? totalKeywordCount / totalMedia : 0,
    };
  }
}

// Экспортируем глобальный экземпляр
export const semanticAnalyzer = new SemanticContextAnalyzer();
