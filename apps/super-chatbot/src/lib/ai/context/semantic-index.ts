/**
 * Семантический индекс для поиска изображений по содержимому
 * Автоматически извлекает ключевые слова из промптов и строит поисковый индекс
 */

import type { ChatImage } from "../chat/image-context";

export interface SemanticIndexEntry {
  imageId: string;
  extractedKeywords: string[];
}

export interface SearchResult {
  image: ChatImage;
  relevanceScore: number;
  matchedKeywords: string[];
  reasoningText: string;
}

export class SemanticIndex {
  private index: Map<string, SemanticIndexEntry> = new Map();
  private keywordIndex: Map<string, Set<string>> = new Map();
  private stopWords = new Set([
    // Русские стоп-слова
    "и",
    "в",
    "во",
    "не",
    "что",
    "он",
    "на",
    "я",
    "с",
    "со",
    "как",
    "а",
    "то",
    "все",
    "она",
    "так",
    "его",
    "но",
    "да",
    "ты",
    "к",
    "у",
    "же",
    "вы",
    "за",
    "бы",
    "по",
    "только",
    "ее",
    "мне",
    "было",
    "вот",
    "от",
    "меня",
    "еще",
    "нет",
    "о",
    "из",
    "ему",
    "теперь",
    "когда",
    "даже",
    "ну",
    "вдруг",
    "ли",
    "если",
    "уже",
    "или",
    "ни",
    "быть",
    "был",
    "него",
    "до",
    "вас",
    "нибудь",
    "опять",
    "уж",
    "вам",
    "ведь",
    "там",
    "потом",
    "себя",
    "ничего",
    "ей",
    "может",
    "они",
    "тут",
    "где",
    "есть",
    "надо",
    "ней",
    "для",
    "мы",
    "тебя",
    "их",
    "чем",
    "была",
    "сам",
    "чтоб",
    "без",
    "будто",
    "чего",
    "раз",
    "тоже",
    "себе",
    "под",
    "будет",
    "ж",
    "тогда",
    "кто",
    "этот",
    "того",
    "потому",
    "этого",
    "какой",
    "совсем",
    "ним",
    "здесь",
    "этом",
    "один",
    "почти",
    "мой",
    "тем",
    "чтобы",
    "нее",
    "сейчас",
    "были",
    "куда",
    "зачем",
    "всех",
    "никогда",
    "можно",
    "при",
    "наконец",
    "два",
    "об",
    "другой",
    "хоть",
    "после",
    "над",
    "больше",
    "тот",
    "через",
    "эти",
    "нас",
    "про",
    "всего",
    "них",
    "какая",
    "много",
    "разве",
    "три",
    "эту",
    "моя",
    "впрочем",
    "хорошо",
    "свою",
    "этой",
    "перед",
    "иногда",
    "лучше",
    "чуть",
    "том",
    "нельзя",
    "такой",
    "им",
    "более",
    "всегда",
    "конечно",
    "всю",
    "между",
    // Английские стоп-слова
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "by",
    "for",
    "from",
    "has",
    "he",
    "in",
    "is",
    "it",
    "its",
    "of",
    "on",
    "that",
    "the",
    "to",
    "was",
    "will",
    "with",
    "would",
    "could",
    "should",
    "may",
    "might",
    "can",
    "must",
    "shall",
    "this",
    "these",
    "those",
    "i",
    "you",
    "we",
    "they",
    "she",
    "him",
    "her",
    "us",
    "them",
    "my",
    "your",
    "his",
    "her",
    "its",
    "our",
    "their",
    "me",
    "him",
    "her",
    "us",
    "them",
  ]);

  /**
   * Добавляет изображение в семантический индекс
   */
  addImage(image: ChatImage): void {
    if (!image.prompt) return;

    const imageId = image.id || image.url;
    const keywords = this.extractKeywords(image.prompt);

    const entry: SemanticIndexEntry = {
      imageId,
      extractedKeywords: keywords,
    };

    this.index.set(imageId, entry);

    // Добавляем в обратный индекс ключевых слов для эффективного поиска
    keywords.forEach((keyword) => {
      if (!this.keywordIndex.has(keyword)) {
        this.keywordIndex.set(keyword, new Set());
      }
      this.keywordIndex.get(keyword)?.add(imageId);
    });

    console.log("🔍 SemanticIndex: Added image to index", {
      imageId,
      prompt: image.prompt,
      keywords: keywords,
    });
  }

  /**
   * Ищет изображения по семантическому запросу
   */
  search(query: string, chatImages: ChatImage[]): SearchResult[] {
    const queryKeywords = this.extractKeywords(query);
    console.log("🔍 SemanticIndex: Searching with keywords", {
      query,
      queryKeywords,
    });

    if (queryKeywords.length === 0) {
      return [];
    }

    // Создаем карту изображений для быстрого доступа O(1)
    const imageMap = new Map<string, ChatImage>();
    chatImages.forEach((image) => {
      imageMap.set(image.id || image.url, image);
    });

    const results: SearchResult[] = [];
    const imageScoreMap = new Map<
      string,
      { score: number; matchedKeywords: string[] }
    >();

    // Сначала пробуем точный поиск через keywordIndex
    queryKeywords.forEach((queryKeyword) => {
      const matchingImageIds = this.keywordIndex.get(queryKeyword);
      if (matchingImageIds) {
        matchingImageIds.forEach((imageId) => {
          const entry = this.index.get(imageId);
          const image = imageMap.get(imageId);
          if (!entry || !image) return;

          const { score, matchedKeywords } = this.calculateRelevance(
            [queryKeyword], // Проверяем только текущее ключевое слово
            entry.extractedKeywords
          );

          if (score > 0) {
            const existing = imageScoreMap.get(imageId);
            if (existing) {
              // Объединяем результаты для нескольких ключевых слов
              existing.score += score;
              existing.matchedKeywords.push(...matchedKeywords);
              existing.matchedKeywords = [...new Set(existing.matchedKeywords)]; // Убираем дубликаты
            } else {
              imageScoreMap.set(imageId, { score, matchedKeywords });
            }
          }
        });
      }
    });

    // Если не найдено точных совпадений, пробуем частичное совпадение по всем изображениям
    if (imageScoreMap.size === 0) {
      queryKeywords.forEach((queryKeyword) => {
        chatImages.forEach((image) => {
          const imageId = image.id || image.url;
          const entry = this.index.get(imageId);
          if (!entry) return;

          const { score, matchedKeywords } = this.calculateRelevance(
            [queryKeyword],
            entry.extractedKeywords
          );

          if (score > 0) {
            const existing = imageScoreMap.get(imageId);
            if (existing) {
              existing.score += score;
              existing.matchedKeywords.push(...matchedKeywords);
              existing.matchedKeywords = [...new Set(existing.matchedKeywords)];
            } else {
              imageScoreMap.set(imageId, { score, matchedKeywords });
            }
          }
        });
      });
    }

    // Сортируем по релевантности и создаем результаты
    Array.from(imageScoreMap.entries())
      .sort(([, a], [, b]) => b.score - a.score)
      .forEach(([imageId, { score, matchedKeywords }]) => {
        const image = imageMap.get(imageId);
        if (image) {
          // Используем score напрямую, так как он уже нормализован в calculateRelevance
          const normalizedScore = score;
          results.push({
            image,
            relevanceScore: normalizedScore,
            matchedKeywords,
            reasoningText: `Найдено совпадение по ключевым словам: ${matchedKeywords.join(", ")}`,
          });
        }
      });

    console.log("🔍 SemanticIndex: Search results", {
      query,
      resultsCount: results.length,
      topResults: results.slice(0, 3).map((r) => ({
        url: r.image.url,
        score: r.relevanceScore,
        keywords: r.matchedKeywords,
      })),
    });

    return results;
  }

  /**
   * Извлекает ключевые слова из текста
   */
  public extractKeywords(text: string): string[] {
    const words = text
      .toLowerCase()
      .replace(/[^\w\s\u0400-\u04FF]/g, " ") // Оставляем только буквы и пробелы (включая кириллицу)
      .split(/\s+/)
      .filter((word) => word.length > 2 && !this.stopWords.has(word));

    // Убираем дубликаты и возвращаем
    return [...new Set(words)];
  }

  /**
   * Вычисляет релевантность между запросом и ключевыми словами изображения
   */
  private calculateRelevance(
    queryKeywords: string[],
    imageKeywords: string[]
  ): {
    score: number;
    matchedKeywords: string[];
  } {
    const matchedKeywords: string[] = [];
    let score = 0;

    queryKeywords.forEach((queryKeyword) => {
      // Точное совпадение
      if (imageKeywords.includes(queryKeyword)) {
        matchedKeywords.push(queryKeyword);
        score += 1.0;
        return;
      }

      // Частичное совпадение (содержит или имеет общий корень)
      const partialMatches = imageKeywords.filter((imgKeyword) => {
        const hasInclude =
          imgKeyword.includes(queryKeyword) ||
          queryKeyword.includes(imgKeyword);
        const hasRoot = this.hasCommonRoot(queryKeyword, imgKeyword);
        return hasInclude || hasRoot;
      });

      if (partialMatches.length > 0) {
        matchedKeywords.push(...partialMatches);
        score += 0.7;
        return;
      }

      // Семантическое совпадение (синонимы)
      const synonyms = this.findSynonyms(queryKeyword);
      const synonymMatches = imageKeywords.filter((imgKeyword) =>
        synonyms.some(
          (synonym) =>
            imgKeyword.includes(synonym) || synonym.includes(imgKeyword)
        )
      );

      if (synonymMatches.length > 0) {
        matchedKeywords.push(...synonymMatches);
        score += 0.5;
      }
    });

    // Нормализуем score относительно количества совпадений, но не меньше 0.3 для хороших совпадений
    const matchedCount = matchedKeywords.length;
    const normalizedScore =
      matchedCount > 0 ? Math.max(score / Math.max(matchedCount, 1), 0.3) : 0;

    return {
      score: normalizedScore,
      matchedKeywords: [...new Set(matchedKeywords)],
    };
  }

  /**
   * Проверяет, имеют ли два слова общий корень
   */
  private hasCommonRoot(word1: string, word2: string): boolean {
    // Проверяем общие корни для русских слов
    const commonRoots = [
      // Луна/лунный
      { root: "лун", variants: ["лун", "лунн", "лунн"] },
      // Солнце/солнечный
      { root: "солн", variants: ["солн", "солнеч"] },
      // Лес/лесной
      { root: "лес", variants: ["лес", "лесн"] },
      // Дерево/деревья
      { root: "дерев", variants: ["дерев", "деревь"] },
      // Кот/кота
      { root: "кот", variants: ["кот", "кот"] },
      // Небо/небесный
      { root: "неб", variants: ["неб", "небес"] },
      // Звезда/звезды
      { root: "звезд", variants: ["звезд", "звезд"] },
    ];

    const lowerWord1 = word1.toLowerCase();
    const lowerWord2 = word2.toLowerCase();

    for (const { root, variants } of commonRoots) {
      const hasVariant1 = variants.some((variant) =>
        lowerWord1.includes(variant)
      );
      const hasVariant2 = variants.some((variant) =>
        lowerWord2.includes(variant)
      );

      if (hasVariant1 && hasVariant2) {
        return true;
      }
    }

    // Проверяем английские общие корни
    const englishRoots = [
      { root: "sun", variants: ["sun", "sunny", "solar"] },
      { root: "moon", variants: ["moon", "lunar", "lun"] },
      { root: "forest", variants: ["forest", "tree", "wood"] },
      { root: "cat", variants: ["cat", "feline"] },
      { root: "sky", variants: ["sky", "celestial"] },
      { root: "star", variants: ["star", "stellar"] },
    ];

    for (const { root, variants } of englishRoots) {
      const hasVariant1 = variants.some((variant) =>
        lowerWord1.includes(variant)
      );
      const hasVariant2 = variants.some((variant) =>
        lowerWord2.includes(variant)
      );

      if (hasVariant1 && hasVariant2) {
        return true;
      }
    }

    return false;
  }

  /**
   * Простой словарь синонимов для улучшения поиска
   */
  public findSynonyms(word: string): string[] {
    const synonymMap: Record<string, string[]> = {
      // Природа
      солнце: ["sun", "солнечный", "sunny", "solar"],
      луна: ["moon", "лунный", "lunar", "ночной", "night"],
      звезды: ["stars", "звездный", "stellar"],
      небо: ["sky", "небесный", "celestial"],
      облака: ["clouds", "облачный", "cloudy"],
      море: ["sea", "океан", "ocean", "вода", "water"],
      лес: ["forest", "деревья", "trees", "природа", "nature"],
      горы: ["mountains", "горный", "mountainous"],

      // Животные
      собака: ["dog", "пес", "пёс", "собачка"],
      кошка: ["cat", "кот", "котик", "котенок"],
      птица: ["bird", "птичий", "avian"],
      рыба: ["fish", "рыбный", "piscine"],

      // Люди
      девочка: ["girl", "девушка", "woman", "женщина"],
      мальчик: ["boy", "парень", "man", "мужчина"],
      ребенок: ["child", "детский", "childish"],

      // Транспорт
      машина: ["car", "автомобиль", "авто", "vehicle"],
      самолет: ["airplane", "plane", "авиация", "aviation"],
      поезд: ["train", "железнодорожный", "railway"],
      ракета: ["rocket", "ракетный", "launch", "космический", "spacecraft"],

      // Здания
      дом: ["house", "здание", "building"],
      замок: ["castle", "замковый", "castellated"],

      // Цвета
      красный: ["red", "краснота", "redness"],
      синий: ["blue", "синева", "blueness"],
      зеленый: ["green", "зелень", "greenness"],
      желтый: ["yellow", "желтизна", "yellowness"],
      черный: ["black", "чернота", "blackness"],
      белый: ["white", "белизна", "whitenes"],
    };

    return synonymMap[word] || [];
  }

  /**
   * Очищает индекс для конкретного чата
   */
  clearChat(chatId: string): void {
    // В реальной реализации здесь должна быть логика удаления
    // только записей, относящихся к конкретному чату
    // Пока что очищаем весь индекс для простоты
    this.index.clear();
    this.keywordIndex.clear();
    console.log("🔍 SemanticIndex: Cleared index for chat", chatId);
  }

  /**
   * Полностью очищает индекс
   */
  clear(): void {
    this.index.clear();
    this.keywordIndex.clear();
    console.log("🔍 SemanticIndex: Index completely cleared");
  }

  /**
   * Получает статистику индекса
   */
  getStats(): {
    totalImages: number;
    totalKeywords: number;
    averageKeywordsPerImage: number;
  } {
    const totalImages = this.index.size;
    const totalKeywords = this.keywordIndex.size;
    const totalKeywordCount = Array.from(this.index.values()).reduce(
      (sum, entry) => sum + entry.extractedKeywords.length,
      0
    );

    return {
      totalImages,
      totalKeywords,
      averageKeywordsPerImage:
        totalImages > 0 ? totalKeywordCount / totalImages : 0,
    };
  }
}

// Глобальный экземпляр семантического индекса
export const semanticIndex = new SemanticIndex();
