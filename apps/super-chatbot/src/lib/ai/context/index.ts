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

// Инициализация анализаторов
import { contextManager } from "./universal-context";
import { ImageContextAnalyzer } from "./image-context-analyzer";
import { VideoContextAnalyzer } from "./video-context-analyzer";
import { AudioContextAnalyzer } from "./audio-context-analyzer";

// Регистрируем анализаторы
contextManager.registerAnalyzer(new ImageContextAnalyzer());
contextManager.registerAnalyzer(new VideoContextAnalyzer());
contextManager.registerAnalyzer(new AudioContextAnalyzer());

// Удобные функции для быстрого доступа
export async function analyzeImageContext(
  userMessage: string,
  chatId: string,
  currentAttachments?: any[]
) {
  const chatMedia = await contextManager.getChatMedia(chatId);
  return contextManager.analyzeContext(
    "image",
    userMessage,
    chatMedia,
    currentAttachments,
    chatId
  );
}

export async function analyzeVideoContext(
  userMessage: string,
  chatId: string,
  currentAttachments?: any[]
) {
  const chatMedia = await contextManager.getChatMedia(chatId);
  return contextManager.analyzeContext(
    "video",
    userMessage,
    chatMedia,
    currentAttachments,
    chatId
  );
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
export { contextCache, generateMessageHash, CacheUtils } from "./cache";

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
