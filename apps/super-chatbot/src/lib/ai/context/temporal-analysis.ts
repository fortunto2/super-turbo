/**
 * Расширенная система анализа временных ссылок
 * Поддерживает сложные временные выражения и контекстные ссылки
 */

import type { ChatMedia } from "./universal-context";

interface TemporalPattern {
  pattern: RegExp;
  weight: number;
  description: string;
  resolver: (
    message: string,
    media: ChatMedia[],
    context: TemporalContext
  ) => ChatMedia | null;
}

interface TemporalContext {
  currentTime: Date;
  chatStartTime?: Date;
  userTimezone?: string;
  language: "ru" | "en";
}

interface TemporalMatch {
  media: ChatMedia;
  confidence: number;
  reasoning: string;
  temporalDistance: number; // в миллисекундах
}

/**
 * Система анализа временных ссылок
 */
export class TemporalAnalyzer {
  private temporalPatterns: TemporalPattern[] = [];
  private context: TemporalContext;

  constructor(context?: Partial<TemporalContext>) {
    this.context = {
      currentTime: new Date(),
      language: "ru",
      ...context,
    };

    this.initializePatterns();
  }

  /**
   * Инициализирует паттерны для распознавания временных ссылок
   */
  private initializePatterns(): void {
    // Русские временные паттерны
    const russianPatterns: TemporalPattern[] = [
      // Точные временные ссылки
      {
        pattern: /(час\s+назад|hour\s+ago|1\s+час\s+назад)/i,
        weight: 0.9,
        description: "Один час назад",
        resolver: (message, media, context) =>
          this.findMediaByTimeOffset(media, 60, context),
      },
      {
        pattern: /(2\s+часа\s+назад|2\s+hours\s+ago)/i,
        weight: 0.9,
        description: "Два часа назад",
        resolver: (message, media, context) =>
          this.findMediaByTimeOffset(media, 120, context),
      },
      {
        pattern: /(полчаса\s+назад|30\s+минут\s+назад|half\s+hour\s+ago)/i,
        weight: 0.9,
        description: "Полчаса назад",
        resolver: (message, media, context) =>
          this.findMediaByTimeOffset(media, 30, context),
      },

      // Относительные временные ссылки
      {
        pattern: /(вчера|yesterday)/i,
        weight: 0.8,
        description: "Вчера",
        resolver: (message, media, context) =>
          this.findMediaByDayOffset(media, -1, context),
      },
      {
        pattern: /(позавчера|day\s+before\s+yesterday)/i,
        weight: 0.8,
        description: "Позавчера",
        resolver: (message, media, context) =>
          this.findMediaByDayOffset(media, -2, context),
      },
      {
        pattern: /(на\s+прошлой\s+неделе|last\s+week)/i,
        weight: 0.7,
        description: "На прошлой неделе",
        resolver: (message, media, context) =>
          this.findMediaByWeekOffset(media, -1, context),
      },

      // Порядковые ссылки
      {
        pattern: /(перв[а-я]+|first)/i,
        weight: 0.8,
        description: "Первое изображение",
        resolver: (message, media, context) => this.findMediaByOrder(media, 0),
      },
      {
        pattern: /(втор[а-я]+|second)/i,
        weight: 0.8,
        description: "Второе изображение",
        resolver: (message, media, context) => this.findMediaByOrder(media, 1),
      },
      {
        pattern: /(треть[а-я]+|third)/i,
        weight: 0.8,
        description: "Третье изображение",
        resolver: (message, media, context) => this.findMediaByOrder(media, 2),
      },
      {
        pattern: /(последн[а-я]+|last|recent)/i,
        weight: 0.9,
        description: "Последнее изображение",
        resolver: (message, media, context) => this.findLastMedia(media),
      },
      {
        pattern: /(предыдущ[а-я]+|previous)/i,
        weight: 0.8,
        description: "Предыдущее изображение",
        resolver: (message, media, context) => this.findPreviousMedia(media),
      },

      // Контекстные временные ссылки
      {
        pattern: /(когда\s+я\s+только\s+что|just\s+now|только\s+что)/i,
        weight: 0.9,
        description: "Только что",
        resolver: (message, media, context) =>
          this.findRecentMedia(media, 5, context),
      },
      {
        pattern: /(недавн[а-я]+|recently)/i,
        weight: 0.7,
        description: "Недавно",
        resolver: (message, media, context) =>
          this.findRecentMedia(media, 60, context),
      },
      {
        pattern: /(давн[а-я]+|long\s+ago|long\s+time\s+ago)/i,
        weight: 0.6,
        description: "Давно",
        resolver: (message, media, context) =>
          this.findOldMedia(media, 24, context),
      },

      // Сезонные и календарные ссылки
      {
        pattern: /(сегодня\s+утром|this\s+morning)/i,
        weight: 0.8,
        description: "Сегодня утром",
        resolver: (message, media, context) =>
          this.findMediaByTimeOfDay(media, "morning", context),
      },
      {
        pattern: /(сегодня\s+днем|this\s+afternoon)/i,
        weight: 0.8,
        description: "Сегодня днем",
        resolver: (message, media, context) =>
          this.findMediaByTimeOfDay(media, "afternoon", context),
      },
      {
        pattern: /(сегодня\s+вечером|this\s+evening)/i,
        weight: 0.8,
        description: "Сегодня вечером",
        resolver: (message, media, context) =>
          this.findMediaByTimeOfDay(media, "evening", context),
      },

      // Контекстные ссылки на события
      {
        pattern: /(перед\s+тем\s+как|before|до\s+того\s+как)/i,
        weight: 0.7,
        description: "Перед тем как",
        resolver: (message, media, context) =>
          this.findMediaBeforeEvent(media, context),
      },
      {
        pattern: /(после\s+того\s+как|after|после\s+этого)/i,
        weight: 0.7,
        description: "После того как",
        resolver: (message, media, context) =>
          this.findMediaAfterEvent(media, context),
      },

      // Ссылки на количество
      {
        pattern: /(два\s+сообщения\s+назад|2\s+messages\s+ago)/i,
        weight: 0.8,
        description: "Два сообщения назад",
        resolver: (message, media, context) =>
          this.findMediaByMessageOffset(media, -2),
      },
      {
        pattern: /(три\s+сообщения\s+назад|3\s+messages\s+ago)/i,
        weight: 0.8,
        description: "Три сообщения назад",
        resolver: (message, media, context) =>
          this.findMediaByMessageOffset(media, -3),
      },
    ];

    this.temporalPatterns = russianPatterns;
  }

  /**
   * Анализирует сообщение на предмет временных ссылок
   */
  async analyzeTemporalReferences(
    message: string,
    chatMedia: ChatMedia[]
  ): Promise<TemporalMatch[]> {
    console.log(`🕒 TemporalAnalyzer: Analyzing message: "${message}"`);

    const matches: TemporalMatch[] = [];
    const lowerMessage = message.toLowerCase();

    for (const pattern of this.temporalPatterns) {
      if (pattern.pattern.test(lowerMessage)) {
        console.log(
          `🕒 TemporalAnalyzer: Found pattern: ${pattern.description}`
        );

        const media = pattern.resolver(message, chatMedia, this.context);
        if (media) {
          const temporalDistance = this.calculateTemporalDistance(
            media.timestamp
          );
          const confidence = this.calculateConfidence(
            pattern.weight,
            temporalDistance
          );

          matches.push({
            media,
            confidence,
            reasoning: `Временная ссылка: ${pattern.description}`,
            temporalDistance,
          });

          console.log(`🕒 TemporalAnalyzer: Found match:`, {
            url: media.url,
            confidence: Math.round(confidence * 100) + "%",
            temporalDistance:
              Math.round(temporalDistance / (1000 * 60)) + " minutes ago",
          });
        }
      }
    }

    // Сортируем по убыванию уверенности
    matches.sort((a, b) => b.confidence - a.confidence);

    console.log(
      `🕒 TemporalAnalyzer: Found ${matches.length} temporal matches`
    );
    return matches;
  }

  /**
   * Находит медиа-файл по временному смещению в минутах
   */
  private findMediaByTimeOffset(
    media: ChatMedia[],
    minutesOffset: number,
    context: TemporalContext
  ): ChatMedia | null {
    const targetTime = new Date(
      context.currentTime.getTime() - minutesOffset * 60 * 1000
    );

    return media.reduce(
      (closest, current) => {
        const currentDistance = Math.abs(
          current.timestamp.getTime() - targetTime.getTime()
        );
        const closestDistance = closest
          ? Math.abs(closest.timestamp.getTime() - targetTime.getTime())
          : Infinity;

        return currentDistance < closestDistance ? current : closest;
      },
      null as ChatMedia | null
    );
  }

  /**
   * Находит медиа-файл по смещению в днях
   */
  private findMediaByDayOffset(
    media: ChatMedia[],
    daysOffset: number,
    context: TemporalContext
  ): ChatMedia | null {
    const targetDate = new Date(context.currentTime);
    targetDate.setDate(targetDate.getDate() + daysOffset);
    targetDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const dayMedia = media.filter(
      (m) => m.timestamp >= targetDate && m.timestamp < nextDay
    );

    return dayMedia.length > 0 ? dayMedia[dayMedia.length - 1] : null;
  }

  /**
   * Находит медиа-файл по смещению в неделях
   */
  private findMediaByWeekOffset(
    media: ChatMedia[],
    weeksOffset: number,
    context: TemporalContext
  ): ChatMedia | null {
    const targetDate = new Date(context.currentTime);
    targetDate.setDate(targetDate.getDate() + weeksOffset * 7);

    const weekMedia = media.filter((m) => {
      const mediaDate = new Date(m.timestamp);
      const weekStart = new Date(targetDate);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      return mediaDate >= weekStart && mediaDate < weekEnd;
    });

    return weekMedia.length > 0 ? weekMedia[weekMedia.length - 1] : null;
  }

  /**
   * Находит медиа-файл по порядковому номеру
   */
  private findMediaByOrder(
    media: ChatMedia[],
    index: number
  ): ChatMedia | null {
    const sortedMedia = [...media].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );
    return sortedMedia[index] || null;
  }

  /**
   * Находит последний медиа-файл
   */
  private findLastMedia(media: ChatMedia[]): ChatMedia | null {
    return media.length > 0 ? media[media.length - 1] : null;
  }

  /**
   * Находит предыдущий медиа-файл
   */
  private findPreviousMedia(media: ChatMedia[]): ChatMedia | null {
    return media.length > 1 ? media[media.length - 2] : null;
  }

  /**
   * Находит недавние медиа-файлы
   */
  private findRecentMedia(
    media: ChatMedia[],
    maxMinutes: number,
    context: TemporalContext
  ): ChatMedia | null {
    const cutoffTime = new Date(
      context.currentTime.getTime() - maxMinutes * 60 * 1000
    );
    const recentMedia = media.filter((m) => m.timestamp >= cutoffTime);
    return recentMedia.length > 0 ? recentMedia[recentMedia.length - 1] : null;
  }

  /**
   * Находит старые медиа-файлы
   */
  private findOldMedia(
    media: ChatMedia[],
    minHours: number,
    context: TemporalContext
  ): ChatMedia | null {
    const cutoffTime = new Date(
      context.currentTime.getTime() - minHours * 60 * 60 * 1000
    );
    const oldMedia = media.filter((m) => m.timestamp <= cutoffTime);
    return oldMedia.length > 0 ? oldMedia[0] : null;
  }

  /**
   * Находит медиа-файл по времени дня
   */
  private findMediaByTimeOfDay(
    media: ChatMedia[],
    timeOfDay: "morning" | "afternoon" | "evening",
    context: TemporalContext
  ): ChatMedia | null {
    const today = new Date(context.currentTime);
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayMedia = media.filter(
      (m) => m.timestamp >= today && m.timestamp < tomorrow
    );

    if (todayMedia.length === 0) return null;

    // Фильтруем по времени дня
    const timeFilteredMedia = todayMedia.filter((m) => {
      const hour = m.timestamp.getHours();
      switch (timeOfDay) {
        case "morning":
          return hour >= 6 && hour < 12;
        case "afternoon":
          return hour >= 12 && hour < 18;
        case "evening":
          return hour >= 18 && hour < 24;
        default:
          return true;
      }
    });

    return timeFilteredMedia.length > 0
      ? timeFilteredMedia[timeFilteredMedia.length - 1]
      : todayMedia[todayMedia.length - 1];
  }

  /**
   * Находит медиа-файл до события (упрощенная версия)
   */
  private findMediaBeforeEvent(
    media: ChatMedia[],
    context: TemporalContext
  ): ChatMedia | null {
    // Ищем медиа-файл в первой половине временного диапазона
    const sortedMedia = [...media].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );
    const midIndex = Math.floor(sortedMedia.length / 2);
    return sortedMedia[midIndex] || null;
  }

  /**
   * Находит медиа-файл после события (упрощенная версия)
   */
  private findMediaAfterEvent(
    media: ChatMedia[],
    context: TemporalContext
  ): ChatMedia | null {
    // Ищем медиа-файл во второй половине временного диапазона
    const sortedMedia = [...media].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );
    const midIndex = Math.floor(sortedMedia.length / 2);
    return (
      sortedMedia[midIndex + 1] || sortedMedia[sortedMedia.length - 1] || null
    );
  }

  /**
   * Находит медиа-файл по смещению сообщений
   */
  private findMediaByMessageOffset(
    media: ChatMedia[],
    offset: number
  ): ChatMedia | null {
    const sortedMedia = [...media].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );
    const index = sortedMedia.length + offset - 1;
    return sortedMedia[index] || null;
  }

  /**
   * Вычисляет временное расстояние в миллисекундах
   */
  private calculateTemporalDistance(timestamp: Date): number {
    return Math.abs(this.context.currentTime.getTime() - timestamp.getTime());
  }

  /**
   * Вычисляет уверенность на основе веса паттерна и временного расстояния
   */
  private calculateConfidence(
    patternWeight: number,
    temporalDistance: number
  ): number {
    const hoursDistance = temporalDistance / (1000 * 60 * 60);

    // Снижаем уверенность для очень старых медиа-файлов
    const timeDecay = Math.max(0.3, 1.0 - hoursDistance / 168); // 168 часов = 1 неделя

    return patternWeight * timeDecay;
  }

  /**
   * Обновляет контекст времени
   */
  updateContext(newContext: Partial<TemporalContext>): void {
    this.context = { ...this.context, ...newContext };
  }

  /**
   * Получает статистику временного анализа
   */
  getStats(): {
    totalPatterns: number;
    supportedLanguages: string[];
    contextInfo: TemporalContext;
  } {
    return {
      totalPatterns: this.temporalPatterns.length,
      supportedLanguages: ["ru", "en"],
      contextInfo: this.context,
    };
  }
}

/**
 * Глобальный экземпляр анализатора временных ссылок
 */
export const temporalAnalyzer = new TemporalAnalyzer();
