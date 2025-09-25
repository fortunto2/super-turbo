/**
 * Система семантического поиска для улучшения понимания контекста
 * Использует векторные embeddings для поиска семантически похожих медиа
 */

import type { ChatMedia } from "./universal-context";

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
 * В будущем может быть заменен на полноценный векторный поиск с embeddings
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
    threshold: number = 0.6
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
   */
  private extractKeywords(text: string): string[] {
    // Используем универсальную функцию извлечения ключевых слов
    // из семантического индекса для консистентности
    const { semanticIndex } = require('./semantic-index');
    return semanticIndex.extractKeywords(text);
      // Природа
      nature: [
        "луна",
        "moon",
        "солнце",
        "sun",
        "звезды",
        "stars",
        "небо",
        "sky",
        "облака",
        "clouds",
        "дождь",
        "rain",
        "снег",
        "snow",
        "лес",
        "forest",
        "море",
        "sea",
        "горы",
        "mountains",
      ],

      // Животные
      animals: [
        "собака",
        "dog",
        "кошка",
        "cat",
        "птица",
        "bird",
        "рыба",
        "fish",
        "лошадь",
        "horse",
        "корова",
        "cow",
      ],

      // Люди
      people: [
        "девочка",
        "girl",
        "мальчик",
        "boy",
        "ребенок",
        "child",
        "семья",
        "family",
        "человек",
        "person",
        "женщина",
        "woman",
        "мужчина",
        "man",
      ],

      // Транспорт
      transport: [
        "машина",
        "car",
        "самолет",
        "airplane",
        "поезд",
        "train",
        "велосипед",
        "bicycle",
        "мотоцикл",
        "motorcycle",
        "корабль",
        "ship",
      ],

      // Здания
      buildings: [
        "дом",
        "house",
        "замок",
        "castle",
        "церковь",
        "church",
        "школа",
        "school",
        "больница",
        "hospital",
      ],

      // Еда
      food: [
        "пицца",
        "pizza",
        "торт",
        "cake",
        "фрукты",
        "fruits",
        "овощи",
        "vegetables",
      ],

      // Цвета
      colors: [
        "красный",
        "red",
        "синий",
        "blue",
        "зеленый",
        "green",
        "желтый",
        "yellow",
        "черный",
        "black",
        "белый",
        "white",
      ],

      // Эмоции
      emotions: [
        "счастливый",
        "happy",
        "грустный",
        "sad",
        "злой",
        "angry",
        "усталый",
        "tired",
      ],

      // Стили
      styles: [
        "реалистичный",
        "realistic",
        "мультфильм",
        "cartoon",
        "аниме",
        "anime",
        "фэнтези",
        "fantasy",
        "научная фантастика",
        "sci-fi",
      ],
    };

    // Используем универсальную функцию извлечения ключевых слов
    // из семантического индекса для консистентности
    const { semanticIndex } = require('./semantic-index');
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

    // Анализируем имя файла
    if (media.url) {
      const fileName = media.url.split("/").pop() || "";
      const fileNameKeywords = this.extractKeywords(fileName);
      const fileNameScore = this.calculateKeywordOverlap(
        queryKeywords,
        fileNameKeywords
      );
      totalScore += fileNameScore * this.weights.fileName;
      maxPossibleScore += this.weights.fileName;
    }

    // Анализируем роль (пользователь vs ассистент)
    if (media.role === "assistant") {
      // Сгенерированные изображения имеют небольшой бонус
      totalScore += 0.1 * this.weights.role;
    }
    maxPossibleScore += this.weights.role;

    // Нормализуем результат
    const similarity = maxPossibleScore > 0 ? totalScore / maxPossibleScore : 0;

    console.log(
      `🔍 SemanticSearch: Similarity for ${media.url}: ${Math.round(similarity * 100)}%`
    );
    return similarity;
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

    // Используем коэффициент Жаккара для измерения сходства
    return intersection.size / union.size;
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
      const promptMatches = queryKeywords.filter((q) =>
        promptKeywords.some((p) => p.toLowerCase() === q.toLowerCase())
      );
      matched.push(...promptMatches);
    }

    if (media.url) {
      const fileName = media.url.split("/").pop() || "";
      const fileNameKeywords = this.extractKeywords(fileName);
      const fileNameMatches = queryKeywords.filter((q) =>
        fileNameKeywords.some((f) => f.toLowerCase() === q.toLowerCase())
      );
      matched.push(...fileNameMatches);
    }

    return [...new Set(matched)];
  }

  /**
   * Создает векторное представление текста (упрощенная версия)
   */
  private createTextVector(text: string): number[] {
    const keywords = this.extractKeywords(text);
    const vector = new Array(100).fill(0); // Упрощенный вектор размерности 100

    // Заполняем вектор на основе ключевых слов
    keywords.forEach((keyword, index) => {
      const hash = this.simpleHash(keyword);
      vector[hash % 100] += 1;
    });

    return vector;
  }

  /**
   * Простая хэш-функция для создания векторов
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Конвертируем в 32-битное число
    }
    return Math.abs(hash);
  }

  /**
   * Вычисляет косинусное сходство между векторами
   */
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Находит медиа-файлы по семантическому описанию
   */
  async findBySemanticDescription(
    description: string,
    chatMedia: ChatMedia[]
  ): Promise<ChatMedia[]> {
    console.log(
      `🔍 SemanticSearch: Finding media by description: "${description}"`
    );

    const matches = await this.findSimilarMedia(description, chatMedia, 0.3);
    return matches.map((match) => match.media);
  }

  /**
   * Получает статистику семантического поиска
   */
  getStats(): {
    totalEmbeddings: number;
    averageSimilarity: number;
    topKeywords: Array<{ keyword: string; frequency: number }>;
  } {
    const keywordFreq = new Map<string, number>();

    // Подсчитываем частоту ключевых слов
    for (const embedding of this.mediaEmbeddings.values()) {
      const keywords = this.extractKeywords(embedding.metadata.text);
      keywords.forEach((keyword) => {
        keywordFreq.set(keyword, (keywordFreq.get(keyword) || 0) + 1);
      });
    }

    const topKeywords = Array.from(keywordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([keyword, frequency]) => ({ keyword, frequency }));

    return {
      totalEmbeddings: this.mediaEmbeddings.size,
      averageSimilarity: 0, // Будет вычисляться при необходимости
      topKeywords,
    };
  }
}

/**
 * Глобальный экземпляр семантического анализатора
 */
export const semanticAnalyzer = new SemanticContextAnalyzer();
