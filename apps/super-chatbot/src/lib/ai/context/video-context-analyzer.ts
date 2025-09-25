/**
 * Анализатор контекста для видео
 * Расширяет базовую функциональность для работы с видео
 */

import {
  BaseContextAnalyzer,
  type MediaType,
  type ChatMedia,
  type ReferencePattern,
} from "./universal-context";
import { analyzeVideoContext } from "../chat/video-context";

export class VideoContextAnalyzer extends BaseContextAnalyzer {
  mediaType: MediaType = "video";

  getReferencePatterns(): ReferencePattern[] {
    return [
      // Русские паттерны для видео
      {
        pattern: /(это|этот)\s+(видео|ролик|фильм|клип)/,
        weight: 0.9,
        description: "Прямая ссылка на видео",
        targetResolver: (message, media) => media[media.length - 1] || null,
      },
      // Русские паттерны для image-to-video
      {
        pattern:
          /(сделай|создай|сгенерируй)\s+(видео|ролик|фильм|клип)\s+(из|на\s+основе|по)\s+(этого|этого\s+изображения|этой\s+картинки)/,
        weight: 0.9,
        description: "Создание видео из изображения",
        targetResolver: (message, media) => {
          // Ищем последнее изображение в чате
          const images = media.filter((m) => m.mediaType === "image");
          return images[images.length - 1] || null;
        },
      },
      {
        pattern:
          /(это|это\s+изображение|эта\s+картинка)\s+(в\s+видео|как\s+видео|анимируй|оживи)/,
        weight: 0.9,
        description: "Анимация изображения в видео",
        targetResolver: (message, media) => {
          const images = media.filter((m) => m.mediaType === "image");
          return images[images.length - 1] || null;
        },
      },
      {
        pattern:
          /(оживи|анимируй|сделай\s+движущимся)\s+(это|это\s+изображение|эту\s+картинку)/,
        weight: 0.8,
        description: "Анимация изображения",
        targetResolver: (message, media) => {
          const images = media.filter((m) => m.mediaType === "image");
          return images[images.length - 1] || null;
        },
      },
      {
        pattern:
          /(создай\s+видео|сделай\s+ролик)\s+(из|на\s+основе|по)\s+(последнего|предыдущего)\s+(изображения|картинки)/,
        weight: 0.8,
        description: "Создание видео из последнего изображения",
        targetResolver: (message, media) => {
          const images = media.filter((m) => m.mediaType === "image");
          if (message.includes("предыдущ")) {
            return images[images.length - 2] || null;
          }
          return images[images.length - 1] || null;
        },
      },
      {
        pattern:
          /(сгенерированн[а-я]+|созданн[а-я]+)\s+(видео|ролик|фильм|клип)/,
        weight: 0.8,
        description: "Ссылка на сгенерированное видео",
        targetResolver: (message, media) => {
          const generated = media.filter((m) => m.role === "assistant");
          return generated[generated.length - 1] || null;
        },
      },
      {
        pattern: /(последн[а-я]+|предыдущ[а-я]+)\s+(видео|ролик|фильм|клип)/,
        weight: 0.7,
        description: "Ссылка на последнее/предыдущее видео",
        targetResolver: (message, media) => {
          if (message.includes("предыдущ")) {
            return media[media.length - 2] || null;
          }
          return media[media.length - 1] || null;
        },
      },
      {
        pattern:
          /(перв[а-я]+|втор[а-я]+|треть[а-я]+|четверт[а-я]+|пят[а-я]+)\s+(видео|ролик|фильм|клип)/,
        weight: 0.8,
        description: "Ссылка на видео по порядку",
        targetResolver: (message, media) => {
          if (message.includes("перв")) return media[0] || null;
          if (message.includes("втор")) return media[1] || null;
          if (message.includes("треть")) return media[2] || null;
          if (message.includes("четверт")) return media[3] || null;
          if (message.includes("пят")) return media[4] || null;
          return null;
        },
      },
      // Новые паттерны для лучшего распознавания
      {
        pattern:
          /(возьми|используй|работай\s+с)\s+(перв[а-я]+|втор[а-я]+|треть[а-я]+)\s+(видео|ролик|фильм|клип)/,
        weight: 0.9,
        description: "Команда работы с видео по порядку",
        targetResolver: (message, media) => {
          if (message.includes("перв")) return media[0] || null;
          if (message.includes("втор")) return media[1] || null;
          if (message.includes("треть")) return media[2] || null;
          return null;
        },
      },
      // Паттерны для распознавания по типу источника
      {
        pattern:
          /(видео\s+котор[а-я]+\s+(я|пользователь)\s+загрузил|загруженн[а-я]+\s+мною|мо[я-я]+\s+видео)/,
        weight: 0.8,
        description: "Ссылка на загруженное пользователем видео",
        targetResolver: (message, media) => {
          const uploaded = media.filter((m) => m.role === "user");
          return uploaded[uploaded.length - 1] || null;
        },
      },
      {
        pattern:
          /(видео\s+котор[а-я]+\s+создал\s+(бот|ассистент|ии)|сгенерированн[а-я]+\s+ботом|созданн[а-я]+\s+ии)/,
        weight: 0.8,
        description: "Ссылка на сгенерированное ботом видео",
        targetResolver: (message, media) => {
          const generated = media.filter((m) => m.role === "assistant");
          return generated[generated.length - 1] || null;
        },
      },
      // Паттерны для работы с URL видео
      {
        pattern:
          /(видео\s+с\s+ссылк[а-я]+|ролик\s+по\s+адресу|фильм\s+по\s+url)/,
        weight: 0.7,
        description: "Ссылка на видео по URL",
        targetResolver: (message, media) => {
          const urlMedia = media.filter((m) => m.url?.startsWith("http"));
          return urlMedia[urlMedia.length - 1] || null;
        },
      },
      {
        pattern: /(загруженн[а-я]+|загруж[а-я]+)\s+(видео|ролик|фильм|клип)/,
        weight: 0.7,
        description: "Ссылка на загруженное видео",
        targetResolver: (message, media) => {
          const uploaded = media.filter((m) => m.role === "user");
          return uploaded[uploaded.length - 1] || null;
        },
      },
      {
        pattern: /(в\s+этом\s+видео|в\s+этом\s+ролике|в\s+этом\s+фильме)/,
        weight: 0.9,
        description: "Ссылка на текущее видео",
        targetResolver: (message, media) => media[media.length - 1] || null,
      },
      {
        pattern:
          /(измени|исправь|подправь|сделай)\s+(это\s+видео|этот\s+ролик|этот\s+фильм)/,
        weight: 0.9,
        description: "Команда изменения видео",
        targetResolver: (message, media) => media[media.length - 1] || null,
      },
      {
        pattern:
          /(добавь\s+музыку|измени\s+звук|подправь\s+качество|сделай\s+короче)/,
        weight: 0.8,
        description: "Конкретные изменения видео",
        targetResolver: (message, media) => media[media.length - 1] || null,
      },
      {
        pattern:
          /(обрежь\s+видео|увеличь\s+скорость|замедли\s+видео|добавь\s+эффекты)/,
        weight: 0.8,
        description: "Операции с видео",
        targetResolver: (message, media) => media[media.length - 1] || null,
      },

      // Английские паттерны для видео
      {
        pattern: /(this|that)\s+(video|clip|movie|film)/,
        weight: 0.9,
        description: "Direct reference to video",
        targetResolver: (message, media) => media[media.length - 1] || null,
      },
      // Английские паттерны для image-to-video
      {
        pattern:
          /(make|create|generate)\s+(video|clip|movie|film)\s+(from|based\s+on|using)\s+(this|this\s+image|this\s+picture)/,
        weight: 0.9,
        description: "Create video from image",
        targetResolver: (message, media) => {
          const images = media.filter((m) => m.mediaType === "image");
          return images[images.length - 1] || null;
        },
      },
      {
        pattern:
          /(this|this\s+image|this\s+picture)\s+(as\s+video|into\s+video|animate|bring\s+to\s+life)/,
        weight: 0.9,
        description: "Animate image into video",
        targetResolver: (message, media) => {
          const images = media.filter((m) => m.mediaType === "image");
          return images[images.length - 1] || null;
        },
      },
      {
        pattern:
          /(animate|bring\s+to\s+life|make\s+move)\s+(this|this\s+image|this\s+picture)/,
        weight: 0.8,
        description: "Animate image",
        targetResolver: (message, media) => {
          const images = media.filter((m) => m.mediaType === "image");
          return images[images.length - 1] || null;
        },
      },
      {
        pattern:
          /(create\s+video|make\s+clip)\s+(from|based\s+on|using)\s+(last|previous)\s+(image|picture)/,
        weight: 0.8,
        description: "Create video from last image",
        targetResolver: (message, media) => {
          const images = media.filter((m) => m.mediaType === "image");
          if (message.includes("previous")) {
            return images[images.length - 2] || null;
          }
          return images[images.length - 1] || null;
        },
      },
      {
        pattern: /(generated|created)\s+(video|clip|movie|film)/,
        weight: 0.8,
        description: "Reference to generated video",
        targetResolver: (message, media) => {
          const generated = media.filter((m) => m.role === "assistant");
          return generated[generated.length - 1] || null;
        },
      },
      {
        pattern: /(last|previous|recent)\s+(video|clip|movie|film)/,
        weight: 0.7,
        description: "Reference to last/previous video",
        targetResolver: (message, media) => {
          if (message.includes("previous")) {
            return media[media.length - 2] || null;
          }
          return media[media.length - 1] || null;
        },
      },
      {
        pattern: /(first|second|third|fourth|fifth)\s+(video|clip|movie|film)/,
        weight: 0.8,
        description: "Reference to video by order",
        targetResolver: (message, media) => {
          if (message.includes("first")) return media[0] || null;
          if (message.includes("second")) return media[1] || null;
          if (message.includes("third")) return media[2] || null;
          if (message.includes("fourth")) return media[3] || null;
          if (message.includes("fifth")) return media[4] || null;
          return null;
        },
      },
      // Новые паттерны для лучшего распознавания (английские)
      {
        pattern:
          /(take|use|work\s+with)\s+(the\s+)?(first|second|third)\s+(video|clip|movie|film)/,
        weight: 0.9,
        description: "Command to work with video by order",
        targetResolver: (message, media) => {
          if (message.includes("first")) return media[0] || null;
          if (message.includes("second")) return media[1] || null;
          if (message.includes("third")) return media[2] || null;
          return null;
        },
      },
      // Паттерны для распознавания по типу источника (английские)
      {
        pattern:
          /(video\s+(that\s+)?(i|user)\s+uploaded|uploaded\s+by\s+me|my\s+uploaded\s+video|video\s+that\s+i\s+uploaded)/,
        weight: 0.8,
        description: "Reference to uploaded video",
        targetResolver: (message, media) => {
          const uploaded = media.filter((m) => m.role === "user");
          return uploaded[uploaded.length - 1] || null;
        },
      },
      {
        pattern:
          /(video\s+(that\s+)?(bot|assistant|ai)\s+created|generated\s+by\s+bot|created\s+by\s+ai)/,
        weight: 0.8,
        description: "Reference to generated video",
        targetResolver: (message, media) => {
          const generated = media.filter((m) => m.role === "assistant");
          return generated[generated.length - 1] || null;
        },
      },
      // Паттерны для работы с URL видео (английские)
      {
        pattern: /(video\s+from\s+url|clip\s+with\s+link|movie\s+by\s+address)/,
        weight: 0.7,
        description: "Reference to video from URL",
        targetResolver: (message, media) => {
          const urlMedia = media.filter((m) => m.url?.startsWith("http"));
          return urlMedia[urlMedia.length - 1] || null;
        },
      },
      {
        pattern: /(uploaded|upload)\s+(video|clip|movie|film)/,
        weight: 0.7,
        description: "Reference to uploaded video",
        targetResolver: (message, media) => {
          const uploaded = media.filter((m) => m.role === "user");
          return uploaded[uploaded.length - 1] || null;
        },
      },
      {
        pattern: /(in\s+this\s+video|in\s+this\s+clip|in\s+this\s+movie)/,
        weight: 0.9,
        description: "Reference to current video",
        targetResolver: (message, media) => media[media.length - 1] || null,
      },
      {
        pattern:
          /(change|fix|edit|modify)\s+(this\s+video|this\s+clip|this\s+movie)/,
        weight: 0.9,
        description: "Command to change video",
        targetResolver: (message, media) => media[media.length - 1] || null,
      },
      {
        pattern: /(add\s+music|change\s+audio|fix\s+quality|make\s+shorter)/,
        weight: 0.8,
        description: "Specific video modifications",
        targetResolver: (message, media) => media[media.length - 1] || null,
      },
      {
        pattern: /(trim\s+video|speed\s+up|slow\s+down|add\s+effects)/,
        weight: 0.8,
        description: "Video operations",
        targetResolver: (message, media) => media[media.length - 1] || null,
      },
    ];
  }

  extractMediaFromMessage(attachment: any): ChatMedia[] {
    if (!this.isValidMediaAttachment(attachment)) {
      return [];
    }

    // Извлекаем fileId и prompt из имени вложения
    let extractedFileId: string | undefined;
    let displayPrompt = attachment.name || "";

    const fileIdRegex = /\[FILE_ID:([a-f0-9-]+)\]\s*(.*)/;
    const match = attachment.name?.match(fileIdRegex);

    if (match) {
      extractedFileId = match[1];
      displayPrompt = match[2].trim();
    }

    // Определяем тип медиа - может быть как видео, так и изображение для image-to-video
    const mediaType = this.determineMediaType(attachment);

    return [
      {
        url: attachment.url,
        id: extractedFileId || attachment.id,
        role: "user", // Будет переопределено в менеджере
        timestamp: new Date(), // Будет переопределено в менеджере
        prompt: displayPrompt,
        messageIndex: 0, // Будет переопределено в менеджере
        mediaType: mediaType,
        metadata: this.extractMetadata(attachment),
      },
    ];
  }

  protected isValidMediaAttachment(attachment: any): boolean {
    return (
      typeof attachment?.url === "string" &&
      /^https?:\/\//.test(attachment.url) &&
      (String(attachment?.contentType || "").startsWith("video/") ||
        String(attachment?.contentType || "").startsWith("image/"))
    );
  }

  protected determineMediaType(attachment: any): "video" | "image" {
    const contentType = String(attachment?.contentType || "");
    if (contentType.startsWith("video/")) {
      return "video";
    } else if (contentType.startsWith("image/")) {
      return "image";
    }
    // Fallback - пытаемся определить по URL
    const url = attachment?.url || "";
    if (/\.(mp4|avi|mov|wmv|flv|webm|mkv)$/i.test(url)) {
      return "video";
    } else if (/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(url)) {
      return "image";
    }
    // По умолчанию считаем видео
    return "video";
  }

  protected extractMetadata(attachment: any): Record<string, any> {
    return {
      contentType: attachment?.contentType,
      name: attachment?.name,
      size: attachment?.size,
      duration: attachment?.duration,
      resolution: attachment?.resolution,
      fps: attachment?.fps,
    };
  }

  protected getEditWords(): string[] {
    return [
      // Русские слова
      "измени",
      "исправь",
      "подправь",
      "сделай",
      "замени",
      "улучши",
      "добавь",
      "убери",
      "переделай",
      "отредактируй",
      "модифицируй",
      "обрежь",
      "увеличь",
      "замедли",
      "ускори",
      "добавь",
      "удали",
      "наложи",
      "синхронизируй",

      // Английские слова
      "change",
      "fix",
      "edit",
      "modify",
      "replace",
      "improve",
      "add",
      "remove",
      "redesign",
      "update",
      "adjust",
      "enhance",
      "trim",
      "speed",
      "slow",
      "sync",
      "overlay",
      "merge",
      "split",
      "compress",
    ];
  }

  /**
   * Улучшенный анализ видео-контекста с фокусом на загруженные пользователем изображения
   */
  async analyzeVideoImageContext(
    userMessage: string,
    chatMedia: ChatMedia[],
    currentAttachments?: any[],
    chatId?: string
  ): Promise<any> {
    console.log(
      "🎬 VideoContextAnalyzer: Starting enhanced video image context analysis"
    );

    // Фильтруем только изображения из медиа
    const chatImages = chatMedia
      .filter((media) => media.mediaType === "image")
      .map((media) => ({
        url: media.url,
        id: media.id,
        role: media.role as "user" | "assistant",
        timestamp: media.timestamp,
        prompt: media.prompt,
        messageIndex: media.messageIndex,
        mediaType: "image" as const,
        chatId: chatId || "", // Используем переданный chatId или пустую строку
        createdAt: media.timestamp,
        parts: [],
        attachments: [],
      }));

    // Используем нашу улучшенную функцию анализа видео-контекста
    const result = await analyzeVideoContext(
      userMessage,
      chatImages,
      currentAttachments
    );

    console.log("🎬 VideoContextAnalyzer: Enhanced analysis result:", result);
    return result;
  }
}
