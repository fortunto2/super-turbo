/**
 * Анализатор контекста для изображений
 * Расширяет базовую функциональность для работы с изображениями
 */

import {
  BaseContextAnalyzer,
  type MediaType,
  type ChatMedia,
  type ReferencePattern,
} from "./universal-context";

export class ImageContextAnalyzer extends BaseContextAnalyzer {
  mediaType: MediaType = "image";

  getReferencePatterns(): ReferencePattern[] {
    return [
      // Русские паттерны
      {
        pattern: /(это|эта|этот)\s+(изображение|картинка|фото|рисунок)/,
        weight: 0.9,
        description: "Прямая ссылка на изображение",
        targetResolver: (message, media) => media[media.length - 1] || null,
      },
      {
        pattern:
          /(сгенерированн[а-я]+|созданн[а-я]+)\s+(изображение|картинка|фото)/,
        weight: 0.8,
        description: "Ссылка на сгенерированное изображение",
        targetResolver: (message, media) => {
          const generated = media.filter((m) => m.role === "assistant");
          return generated[generated.length - 1] || null;
        },
      },
      {
        pattern: /(последн[а-я]+|предыдущ[а-я]+)\s+(изображение|картинка|фото)/,
        weight: 0.7,
        description: "Ссылка на последнее/предыдущее изображение",
        targetResolver: (message, media) => {
          if (message.includes("предыдущ")) {
            return media[media.length - 2] || null;
          }
          return media[media.length - 1] || null;
        },
      },
      {
        pattern:
          /(перв[а-я]+|втор[а-я]+|треть[а-я]+)\s+(изображение|картинка|фото)/,
        weight: 0.6,
        description: "Ссылка на изображение по порядку",
        targetResolver: (message, media) => {
          if (message.includes("перв")) return media[0] || null;
          if (message.includes("втор")) return media[1] || null;
          if (message.includes("треть")) return media[2] || null;
          return null;
        },
      },
      {
        pattern: /(загруженн[а-я]+|загруж[а-я]+)\s+(изображение|картинка|фото)/,
        weight: 0.7,
        description: "Ссылка на загруженное изображение",
        targetResolver: (message, media) => {
          const uploaded = media.filter((m) => m.role === "user");
          return uploaded[uploaded.length - 1] || null;
        },
      },
      {
        pattern: /(на\s+этом\s+изображении|в\s+этой\s+картинке)/,
        weight: 0.9,
        description: "Ссылка на текущее изображение",
        targetResolver: (message, media) => media[media.length - 1] || null,
      },
      {
        pattern:
          /(измени|исправь|подправь|сделай)\s+(это\s+изображение|эту\s+картинку)/,
        weight: 0.9,
        description: "Команда изменения изображения",
        targetResolver: (message, media) => media[media.length - 1] || null,
      },
      {
        pattern:
          /(сделай\s+глаза\s+голубыми|измени\s+цвет|подправь\s+фон|добавь\s+крылья)/,
        weight: 0.8,
        description: "Конкретные изменения изображения",
        targetResolver: (message, media) => media[media.length - 1] || null,
      },

      // Английские паттерны
      {
        pattern: /(this|that)\s+(image|picture|photo|drawing)/,
        weight: 0.9,
        description: "Direct reference to image",
        targetResolver: (message, media) => media[media.length - 1] || null,
      },
      {
        pattern: /(generated|created)\s+(image|picture|photo)/,
        weight: 0.8,
        description: "Reference to generated image",
        targetResolver: (message, media) => {
          const generated = media.filter((m) => m.role === "assistant");
          return generated[generated.length - 1] || null;
        },
      },
      {
        pattern: /(last|previous|recent)\s+(image|picture|photo)/,
        weight: 0.7,
        description: "Reference to last/previous image",
        targetResolver: (message, media) => {
          if (message.includes("previous")) {
            return media[media.length - 2] || null;
          }
          return media[media.length - 1] || null;
        },
      },
      {
        pattern: /(first|second|third)\s+(image|picture|photo)/,
        weight: 0.6,
        description: "Reference to image by order",
        targetResolver: (message, media) => {
          if (message.includes("first")) return media[0] || null;
          if (message.includes("second")) return media[1] || null;
          if (message.includes("third")) return media[2] || null;
          return null;
        },
      },
      {
        pattern: /(uploaded|upload)\s+(image|picture|photo)/,
        weight: 0.7,
        description: "Reference to uploaded image",
        targetResolver: (message, media) => {
          const uploaded = media.filter((m) => m.role === "user");
          return uploaded[uploaded.length - 1] || null;
        },
      },
      {
        pattern: /(on\s+this\s+image|in\s+this\s+picture)/,
        weight: 0.9,
        description: "Reference to current image",
        targetResolver: (message, media) => media[media.length - 1] || null,
      },
      {
        pattern: /(change|fix|edit|modify)\s+(this\s+image|this\s+picture)/,
        weight: 0.9,
        description: "Command to change image",
        targetResolver: (message, media) => media[media.length - 1] || null,
      },
      {
        pattern:
          /(make\s+eyes\s+blue|change\s+color|fix\s+background|add\s+wings)/,
        weight: 0.8,
        description: "Specific image modifications",
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

    return [
      {
        url: attachment.url,
        id: extractedFileId || attachment.id,
        role: "user", // Будет переопределено в менеджере
        timestamp: new Date(), // Будет переопределено в менеджере
        prompt: displayPrompt,
        messageIndex: 0, // Будет переопределено в менеджере
        mediaType: "image",
        metadata: this.extractMetadata(attachment),
      },
    ];
  }

  protected isValidMediaAttachment(attachment: any): boolean {
    return (
      typeof attachment?.url === "string" &&
      /^https?:\/\//.test(attachment.url) &&
      String(attachment?.contentType || "").startsWith("image/")
    );
  }

  protected extractMetadata(attachment: any): Record<string, any> {
    return {
      contentType: attachment?.contentType,
      name: attachment?.name,
      size: attachment?.size,
      dimensions: attachment?.dimensions,
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
      "измени",
      "переделай",
      "отредактируй",
      "модифицируй",

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
    ];
  }
}
