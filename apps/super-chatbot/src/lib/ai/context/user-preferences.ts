/**
 * Система обучения на пользовательских предпочтениях
 * Анализирует выборы пользователя и улучшает точность контекстного анализа
 */

import type { ChatMedia, MediaContext } from './universal-context';
import { semanticIndex } from './semantic-index';

interface UserChoice {
  chatId: string;
  userId: string;
  userMessage: string;
  selectedMedia: ChatMedia;
  availableOptions: ChatMedia[];
  timestamp: Date;
  confidence: number;
  reasoning: string;
}

interface UserPreference {
  userId: string;
  pattern: string;
  preference: {
    preferredMediaTypes: string[];
    preferredRoles: ('user' | 'assistant')[];
    preferredTimeframes: number[][]; // в часах, массив диапазонов [min, max]
    keywordWeights: Record<string, number>;
  };
  usageCount: number;
  lastUsed: Date;
  accuracy: number;
}

interface LearningStats {
  totalChoices: number;
  accuracyRate: number;
  topPatterns: Array<{ pattern: string; usageCount: number; accuracy: number }>;
  userPreferences: Map<string, UserPreference[]>;
}

/**
 * Система обучения на предпочтениях пользователя
 */
export class UserPreferenceLearner {
  private userChoices: UserChoice[] = [];
  private userPreferences = new Map<string, UserPreference[]>();
  private learningEnabled = true;

  // Настройки обучения
  private readonly minChoicesForLearning = 3;
  private readonly maxPreferencesPerUser = 50;
  private readonly accuracyThreshold = 0.7;

  /**
   * Записывает выбор пользователя для обучения
   */
  async recordUserChoice(
    chatId: string,
    userId: string,
    userMessage: string,
    selectedMedia: ChatMedia,
    availableOptions: ChatMedia[],
    confidence: number,
    reasoning: string,
  ): Promise<void> {
    if (!this.learningEnabled) return;

    const choice: UserChoice = {
      chatId,
      userId,
      userMessage,
      selectedMedia,
      availableOptions,
      timestamp: new Date(),
      confidence,
      reasoning,
    };

    this.userChoices.push(choice);
    console.log(
      `🧠 UserPreferenceLearner: Recorded choice for user ${userId}:`,
      {
        message: `${userMessage.substring(0, 50)}...`,
        selectedMedia: selectedMedia.url,
        confidence,
        reasoning,
      },
    );

    // Запускаем обучение асинхронно
    this.learnFromChoice(choice).catch((error) => {
      console.error('🧠 UserPreferenceLearner: Learning failed:', error);
    });
  }

  /**
   * Обучение на основе выбора пользователя
   */
  private async learnFromChoice(choice: UserChoice): Promise<void> {
    const { userId, userMessage, selectedMedia, availableOptions } = choice;

    // Извлекаем паттерны из сообщения пользователя
    const patterns = this.extractUserPatterns(userMessage);

    for (const pattern of patterns) {
      const existingPreference = this.findExistingPreference(userId, pattern);

      if (existingPreference) {
        // Обновляем существующее предпочтение
        await this.updatePreference(existingPreference, choice);
      } else {
        // Создаем новое предпочтение
        await this.createPreference(userId, pattern, choice);
      }
    }
  }

  /**
   * Извлекает паттерны из сообщения пользователя
   */
  private extractUserPatterns(message: string): string[] {
    const patterns: string[] = [];

    // Используем универсальную функцию извлечения ключевых слов
    // из семантического индекса для более гибкого анализа
    const keywords = semanticIndex.extractKeywords(message);

    // Создаем паттерны на основе извлеченных ключевых слов
    if (keywords.length > 0) {
      keywords.forEach((keyword: string) => {
        patterns.push(`content:${keyword}`);
      });
    }

    // Добавляем общий паттерн сообщения для универсальности
    patterns.push(`general:${this.normalizeMessage(message)}`);

    return patterns;
  }

  /**
   * Нормализует сообщение для создания паттерна
   */
  private normalizeMessage(message: string): string {
    return message
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 50); // Ограничиваем длину
  }

  /**
   * Находит существующее предпочтение пользователя
   */
  private findExistingPreference(
    userId: string,
    pattern: string,
  ): UserPreference | null {
    const userPrefs = this.userPreferences.get(userId) || [];
    return userPrefs.find((pref) => pref.pattern === pattern) || null;
  }

  /**
   * Создает новое предпочтение пользователя
   */
  private async createPreference(
    userId: string,
    pattern: string,
    choice: UserChoice,
  ): Promise<void> {
    const { selectedMedia, availableOptions, userMessage } = choice;

    // Анализируем предпочтения на основе выбора
    const preference: UserPreference = {
      userId,
      pattern,
      preference: {
        preferredMediaTypes: [selectedMedia.mediaType || 'image'],
        preferredRoles: [selectedMedia.role],
        preferredTimeframes: this.calculateTimeframe(selectedMedia.timestamp),
        keywordWeights: this.extractKeywordWeights(userMessage, selectedMedia),
      },
      usageCount: 1,
      lastUsed: new Date(),
      accuracy: 1.0, // Начальная точность
    };

    // Добавляем предпочтение
    const userPrefs = this.userPreferences.get(userId) || [];
    userPrefs.push(preference);
    this.userPreferences.set(userId, userPrefs);

    // Ограничиваем количество предпочтений
    if (userPrefs.length > this.maxPreferencesPerUser) {
      userPrefs.sort((a, b) => b.usageCount - a.usageCount);
      userPrefs.splice(this.maxPreferencesPerUser);
    }

    console.log(
      `🧠 UserPreferenceLearner: Created new preference for user ${userId}:`,
      {
        pattern,
        preference: preference.preference,
      },
    );
  }

  /**
   * Обновляет существующее предпочтение
   */
  private async updatePreference(
    preference: UserPreference,
    choice: UserChoice,
  ): Promise<void> {
    const { selectedMedia, userMessage } = choice;

    // Обновляем счетчик использования
    preference.usageCount++;
    preference.lastUsed = new Date();

    // Обновляем предпочтения на основе нового выбора
    if (
      !preference.preference.preferredMediaTypes.includes(
        selectedMedia.mediaType || 'image',
      )
    ) {
      preference.preference.preferredMediaTypes.push(
        selectedMedia.mediaType || 'image',
      );
    }

    if (!preference.preference.preferredRoles.includes(selectedMedia.role)) {
      preference.preference.preferredRoles.push(selectedMedia.role);
    }

    // Обновляем веса ключевых слов
    const newWeights = this.extractKeywordWeights(userMessage, selectedMedia);
    Object.entries(newWeights).forEach(([keyword, weight]) => {
      const currentWeight = preference.preference.keywordWeights[keyword] || 0;
      preference.preference.keywordWeights[keyword] =
        (currentWeight + weight) / 2;
    });

    // Пересчитываем точность
    preference.accuracy = this.calculateAccuracy(preference);

    console.log(`🧠 UserPreferenceLearner: Updated preference:`, {
      pattern: preference.pattern,
      usageCount: preference.usageCount,
      accuracy: preference.accuracy,
    });
  }

  /**
   * Вычисляет временной интервал предпочтения
   */
  private calculateTimeframe(timestamp: Date): number[][] {
    const now = new Date();
    const hoursDiff = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);

    // Возвращаем массив диапазонов времени в часах
    return [[Math.max(0, hoursDiff - 1), hoursDiff + 1]];
  }

  /**
   * Извлекает веса ключевых слов из сообщения и выбранного медиа
   */
  private extractKeywordWeights(
    message: string,
    media: ChatMedia,
  ): Record<string, number> {
    const weights: Record<string, number> = {};
    const messageWords = message.toLowerCase().split(/\s+/);

    // Анализируем слова в сообщении
    messageWords.forEach((word) => {
      if (word.length > 2) {
        weights[word] = (weights[word] || 0) + 1;
      }
    });

    // Анализируем промпт медиа-файла
    if (media.prompt) {
      const promptWords = media.prompt.toLowerCase().split(/\s+/);
      promptWords.forEach((word) => {
        if (word.length > 2) {
          weights[word] = (weights[word] || 0) + 0.5;
        }
      });
    }

    return weights;
  }

  /**
   * Вычисляет точность предпочтения
   */
  private calculateAccuracy(preference: UserPreference): number {
    // Упрощенный расчет точности на основе количества использований
    const baseAccuracy = Math.min(preference.usageCount / 10, 1.0);
    const timeDecay = this.calculateTimeDecay(preference.lastUsed);
    return baseAccuracy * timeDecay;
  }

  /**
   * Вычисляет временное затухание точности
   */
  private calculateTimeDecay(lastUsed: Date): number {
    const now = new Date();
    const daysDiff =
      (now.getTime() - lastUsed.getTime()) / (1000 * 60 * 60 * 24);

    // Точность снижается со временем, но не ниже 0.5
    return Math.max(0.5, 1.0 - daysDiff / 30);
  }

  /**
   * Применяет предпочтения пользователя к анализу контекста
   */
  async applyUserPreferences(
    userId: string,
    userMessage: string,
    candidates: ChatMedia[],
    baseContext: MediaContext,
  ): Promise<MediaContext> {
    const userPrefs = this.userPreferences.get(userId) || [];
    if (userPrefs.length === 0) return baseContext;

    // Находим подходящие предпочтения
    const relevantPrefs = userPrefs.filter((pref) => {
      const messagePattern = this.normalizeMessage(userMessage);
      return (
        messagePattern.includes(pref.pattern) ||
        pref.pattern.includes(messagePattern)
      );
    });

    if (relevantPrefs.length === 0) return baseContext;

    // Применяем предпочтения к кандидатам
    const scoredCandidates = candidates.map((candidate) => {
      let score = 0;

      relevantPrefs.forEach((pref) => {
        // Бонус за предпочтительный тип медиа
        if (
          pref.preference.preferredMediaTypes.includes(
            candidate.mediaType || 'image',
          )
        ) {
          score += 0.3 * pref.accuracy;
        }

        // Бонус за предпочтительную роль
        if (pref.preference.preferredRoles.includes(candidate.role)) {
          score += 0.2 * pref.accuracy;
        }

        // Бонус за временной интервал
        const candidateTime = candidate.timestamp.getTime();
        const now = new Date().getTime();
        const hoursDiff = (now - candidateTime) / (1000 * 60 * 60);

        if (
          pref.preference.preferredTimeframes.some(
            (timeframe: number[]) =>
              hoursDiff >= (timeframe[0] || 0) &&
              hoursDiff <= (timeframe[1] || 24),
          )
        ) {
          score += 0.2 * pref.accuracy;
        }

        // Бонус за ключевые слова
        if (candidate.prompt) {
          const promptWords = candidate.prompt.toLowerCase().split(/\s+/);
          Object.entries(pref.preference.keywordWeights).forEach(
            ([keyword, weight]) => {
              if (promptWords.some((word) => word.includes(keyword))) {
                score += weight * pref.accuracy * 0.1;
              }
            },
          );
        }
      });

      return { candidate, score };
    });

    // Сортируем по убыванию скора
    scoredCandidates.sort((a, b) => b.score - a.score);

    if (
      scoredCandidates.length > 0 &&
      scoredCandidates[0]?.score &&
      scoredCandidates[0].score > 0
    ) {
      const bestCandidate = scoredCandidates[0]?.candidate;

      return {
        ...baseContext,
        sourceUrl: bestCandidate.url,
        ...(bestCandidate.id && { sourceId: bestCandidate.id }),
        confidence: 'high' as const,
        reasoning: `${baseContext.reasoning} + пользовательские предпочтения (score: ${Math.round((scoredCandidates[0]?.score || 0) * 100)})`,
      };
    }

    return baseContext;
  }

  /**
   * Получает статистику обучения
   */
  getLearningStats(): LearningStats {
    const totalChoices = this.userChoices.length;
    const accuracyRate = this.calculateOverallAccuracy();

    const topPatterns = Array.from(this.userPreferences.values())
      .flat()
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 10)
      .map((pref) => ({
        pattern: pref.pattern,
        usageCount: pref.usageCount,
        accuracy: pref.accuracy,
      }));

    return {
      totalChoices,
      accuracyRate,
      topPatterns,
      userPreferences: this.userPreferences,
    };
  }

  /**
   * Вычисляет общую точность системы
   */
  private calculateOverallAccuracy(): number {
    if (this.userChoices.length === 0) return 0;

    const totalAccuracy = Array.from(this.userPreferences.values())
      .flat()
      .reduce((sum, pref) => sum + pref.accuracy, 0);

    const totalPreferences = Array.from(this.userPreferences.values()).flat()
      .length;

    return totalPreferences > 0 ? totalAccuracy / totalPreferences : 0;
  }

  /**
   * Очищает старые данные обучения
   */
  cleanup(daysToKeep = 30): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    // Очищаем старые выборы пользователей
    this.userChoices = this.userChoices.filter(
      (choice) => choice.timestamp > cutoffDate,
    );

    // Очищаем старые предпочтения
    for (const [userId, prefs] of this.userPreferences.entries()) {
      const activePrefs = prefs.filter((pref) => pref.lastUsed > cutoffDate);
      if (activePrefs.length === 0) {
        this.userPreferences.delete(userId);
      } else {
        this.userPreferences.set(userId, activePrefs);
      }
    }

    console.log(
      `🧠 UserPreferenceLearner: Cleaned up data older than ${daysToKeep} days`,
    );
  }

  /**
   * Включает/выключает обучение
   */
  setLearningEnabled(enabled: boolean): void {
    this.learningEnabled = enabled;
    console.log(
      `🧠 UserPreferenceLearner: Learning ${enabled ? 'enabled' : 'disabled'}`,
    );
  }
}

/**
 * Глобальный экземпляр системы обучения
 */
export const userPreferenceLearner = new UserPreferenceLearner();
