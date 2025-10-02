/**
 * Экспорт всех компонентов системы контекста
 */

// Основные типы и интерфейсы
export type {
  MediaType,
  ConfidenceLevel,
  MediaContext,
  ChatMedia,
  ContextAnalyzer,
  ReferencePattern,
} from "./universal-context";

// Базовый класс
export { BaseContextAnalyzer } from "./universal-context";

// Менеджер контекста
export { UniversalContextManager, contextManager } from "./universal-context";

// Конкретные анализаторы
export { ImageContextAnalyzer } from "./image-context-analyzer";
export { VideoContextAnalyzer } from "./video-context-analyzer";
export { AudioContextAnalyzer } from "./audio-context-analyzer";

// Улучшенные функции анализа контекста
import { analyzeVideoContext as analyzeVideoContextDirect } from "../chat/video-context";

// Инициализация анализаторов
import { contextManager } from "./universal-context";
import { ImageContextAnalyzer } from "./image-context-analyzer";
import { VideoContextAnalyzer } from "./video-context-analyzer";
import { AudioContextAnalyzer } from "./audio-context-analyzer";
import type { ChatImage } from "../chat/image-context";

// Регистрируем анализаторы
contextManager.registerAnalyzer(new ImageContextAnalyzer());
contextManager.registerAnalyzer(new VideoContextAnalyzer());
contextManager.registerAnalyzer(new AudioContextAnalyzer());

// Удобные функции для быстрого доступа
export async function analyzeImageContext(
  userMessage: string,
  chatId: string,
  currentAttachments?: any[],
  userId?: string
) {
  const chatMedia = await contextManager.getChatMedia(chatId);
  return contextManager.analyzeContext(
    "image",
    userMessage,
    chatMedia,
    currentAttachments,
    chatId,
    userId
  );
}

export async function analyzeVideoContext(
  userMessage: string,
  chatId: string,
  currentAttachments?: any[],
  userId?: string
) {
  console.log(
    "🎬 analyzeVideoContext: Using enhanced video context analysis with all 4 systems"
  );

  const chatMedia = await contextManager.getChatMedia(chatId);

  // Фильтруем только изображения и конвертируем в ChatImage формат
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
      chatId: chatId, // Используем chatId из параметра функции
      createdAt: media.timestamp,
      parts: [],
      attachments: [],
    }));

  // Используем нашу улучшенную функцию анализа видео-контекста с полной интеграцией всех 4 систем
  const videoResult = await analyzeVideoContextDirect(
    userMessage,
    chatImages.filter((img) => img?.url && img?.id) as ChatImage[], // Фильтруем валидные изображения
    currentAttachments,
    chatId,
    userId
  );

  // Конвертируем VideoContext в MediaContext для совместимости
  return {
    sourceUrl: videoResult.sourceImageUrl,
    sourceId: videoResult.sourceImageId,
    mediaType: "video" as const,
    confidence: videoResult.confidence,
    reasoning: videoResult.reasoning,
    metadata: videoResult.metadata,
  };
}

export async function analyzeAudioContext(
  userMessage: string,
  chatId: string,
  currentAttachments?: any[]
) {
  const chatMedia = await contextManager.getChatMedia(chatId);
  return contextManager.analyzeContext(
    "audio",
    userMessage,
    chatMedia,
    currentAttachments,
    chatId
  );
}

// Универсальная функция для любого типа медиа
export async function analyzeMediaContext(
  mediaType: "image" | "video" | "audio",
  userMessage: string,
  chatId: string,
  currentAttachments?: any[]
) {
  const chatMedia = await contextManager.getChatMedia(chatId);
  return contextManager.analyzeContext(
    mediaType,
    userMessage,
    chatMedia,
    currentAttachments,
    chatId
  );
}

// Экспорт системы кэширования
export { contextCache, generateMessageHash } from "./cache";

// Экспорт семантического поиска
export { semanticAnalyzer, SemanticContextAnalyzer } from "./semantic-search";
export {
  semanticIndex,
  SemanticIndex,
  type SemanticIndexEntry,
  type SearchResult,
} from "./semantic-index";

// Экспорт системы обучения пользовательским предпочтениям
export {
  userPreferenceLearner,
  UserPreferenceLearner,
} from "./user-preferences";

// Экспорт временного анализа
export { temporalAnalyzer, TemporalAnalyzer } from "./temporal-analysis";

// Экспорт мониторинга производительности
export {
  contextPerformanceMonitor,
  ContextPerformanceMonitor,
} from "./performance-monitor";
