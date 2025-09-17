/**
 * Анализатор контекста для аудио
 * Расширяет базовую функциональность для работы с аудио файлами
 */

import {
  BaseContextAnalyzer,
  type MediaType,
  type ChatMedia,
  type ReferencePattern,
} from "./universal-context";

export class AudioContextAnalyzer extends BaseContextAnalyzer {
  mediaType: MediaType = "audio";

  getReferencePatterns(): ReferencePattern[] {
    return [
      // Русские паттерны
      {
        pattern:
          /(это|этот|эта)\s+(аудио|звук|музыка|песня|трек|голос|озвучка)/,
        weight: 0.9,
        description: "Прямая ссылка на аудио",
        targetResolver: (message, media) => media[media.length - 1] || null,
      },
      {
        pattern:
          /(сгенерированн[а-я]+|созданн[а-я]+)\s+(аудио|звук|музыка|песня|трек|голос|озвучка)/,
        weight: 0.8,
        description: "Ссылка на сгенерированное аудио",
        targetResolver: (message, media) => {
          const generated = media.filter((m) => m.role === "assistant");
          return generated[generated.length - 1] || null;
        },
      },
      {
        pattern:
          /(последн[а-я]+|предыдущ[а-я]+)\s+(аудио|звук|музыка|песня|трек|голос|озвучка)/,
        weight: 0.7,
        description: "Ссылка на последнее/предыдущее аудио",
        targetResolver: (message, media) => {
          if (message.includes("предыдущ")) {
            return media[media.length - 2] || null;
          }
          return media[media.length - 1] || null;
        },
      },
      {
        pattern:
          /(перв[а-я]+|втор[а-я]+|треть[а-я]+)\s+(аудио|звук|музыка|песня|трек|голос|озвучка)/,
        weight: 0.6,
        description: "Ссылка на аудио по порядку",
        targetResolver: (message, media) => {
          if (message.includes("перв")) return media[0] || null;
          if (message.includes("втор")) return media[1] || null;
          if (message.includes("треть")) return media[2] || null;
          return null;
        },
      },
      {
        pattern:
          /(загруженн[а-я]+|загруж[а-я]+)\s+(аудио|звук|музыка|песня|трек|голос|озвучка)/,
        weight: 0.7,
        description: "Ссылка на загруженное аудио",
        targetResolver: (message, media) => {
          const uploaded = media.filter((m) => m.role === "user");
          return uploaded[uploaded.length - 1] || null;
        },
      },
      {
        pattern:
          /(в\s+этом\s+аудио|в\s+этом\s+звуке|в\s+этой\s+музыке|в\s+этой\s+песне)/,
        weight: 0.9,
        description: "Ссылка на текущее аудио",
        targetResolver: (message, media) => media[media.length - 1] || null,
      },
      {
        pattern:
          /(измени|исправь|подправь|сделай)\s+(это\s+аудио|этот\s+звук|эту\s+музыку|эту\s+песню)/,
        weight: 0.9,
        description: "Команда изменения аудио",
        targetResolver: (message, media) => media[media.length - 1] || null,
      },
      {
        pattern:
          /(добавь\s+эхо|измени\s+тон|подправь\s+громкость|сделай\s+глубже)/,
        weight: 0.8,
        description: "Конкретные изменения аудио",
        targetResolver: (message, media) => media[media.length - 1] || null,
      },
      {
        pattern:
          /(обрежь\s+аудио|увеличь\s+скорость|замедли\s+звук|добавь\s+эффекты)/,
        weight: 0.8,
        description: "Операции с аудио",
        targetResolver: (message, media) => media[media.length - 1] || null,
      },
      {
        pattern: /(озвучь|наложи\s+голос|добавь\s+диктора|сделай\s+voiceover)/,
        weight: 0.8,
        description: "Операции озвучки",
        targetResolver: (message, media) => media[media.length - 1] || null,
      },

      // Английские паттерны
      {
        pattern: /(this|that)\s+(audio|sound|music|song|track|voice|voiceover)/,
        weight: 0.9,
        description: "Direct reference to audio",
        targetResolver: (message, media) => media[media.length - 1] || null,
      },
      {
        pattern:
          /(generated|created)\s+(audio|sound|music|song|track|voice|voiceover)/,
        weight: 0.8,
        description: "Reference to generated audio",
        targetResolver: (message, media) => {
          const generated = media.filter((m) => m.role === "assistant");
          return generated[generated.length - 1] || null;
        },
      },
      {
        pattern:
          /(last|previous|recent)\s+(audio|sound|music|song|track|voice|voiceover)/,
        weight: 0.7,
        description: "Reference to last/previous audio",
        targetResolver: (message, media) => {
          if (message.includes("previous")) {
            return media[media.length - 2] || null;
          }
          return media[media.length - 1] || null;
        },
      },
      {
        pattern:
          /(first|second|third)\s+(audio|sound|music|song|track|voice|voiceover)/,
        weight: 0.6,
        description: "Reference to audio by order",
        targetResolver: (message, media) => {
          if (message.includes("first")) return media[0] || null;
          if (message.includes("second")) return media[1] || null;
          if (message.includes("third")) return media[2] || null;
          return null;
        },
      },
      {
        pattern:
          /(uploaded|upload)\s+(audio|sound|music|song|track|voice|voiceover)/,
        weight: 0.7,
        description: "Reference to uploaded audio",
        targetResolver: (message, media) => {
          const uploaded = media.filter((m) => m.role === "user");
          return uploaded[uploaded.length - 1] || null;
        },
      },
      {
        pattern:
          /(in\s+this\s+audio|in\s+this\s+sound|in\s+this\s+music|in\s+this\s+song)/,
        weight: 0.9,
        description: "Reference to current audio",
        targetResolver: (message, media) => media[media.length - 1] || null,
      },
      {
        pattern:
          /(change|fix|edit|modify)\s+(this\s+audio|this\s+sound|this\s+music|this\s+song)/,
        weight: 0.9,
        description: "Command to change audio",
        targetResolver: (message, media) => media[media.length - 1] || null,
      },
      {
        pattern: /(add\s+echo|change\s+pitch|adjust\s+volume|make\s+deeper)/,
        weight: 0.8,
        description: "Specific audio modifications",
        targetResolver: (message, media) => media[media.length - 1] || null,
      },
      {
        pattern: /(trim\s+audio|speed\s+up|slow\s+down|add\s+effects)/,
        weight: 0.8,
        description: "Audio operations",
        targetResolver: (message, media) => media[media.length - 1] || null,
      },
      {
        pattern: /(voiceover|add\s+voice|narrate|dub)/,
        weight: 0.8,
        description: "Voiceover operations",
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
        mediaType: "audio",
        metadata: this.extractMetadata(attachment),
      },
    ];
  }

  protected isValidMediaAttachment(attachment: any): boolean {
    return (
      typeof attachment?.url === "string" &&
      /^https?:\/\//.test(attachment.url) &&
      String(attachment?.contentType || "").startsWith("audio/")
    );
  }

  protected extractMetadata(attachment: any): Record<string, any> {
    return {
      contentType: attachment?.contentType,
      name: attachment?.name,
      size: attachment?.size,
      duration: attachment?.duration,
      bitrate: attachment?.bitrate,
      sampleRate: attachment?.sampleRate,
      channels: attachment?.channels,
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
      "озвучь",
      "наложи",
      "добавь",
      "сделай",
      "измени",
      "подправь",

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
      "voiceover",
      "narrate",
      "dub",
      "pitch",
      "echo",
      "reverb",
      "equalize",
    ];
  }
}
