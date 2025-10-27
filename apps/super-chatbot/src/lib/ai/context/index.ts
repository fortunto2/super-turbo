/**
 * AI-Powered Context System Exports
 * Simplified version using only AI for analysis
 */

// Core types and interfaces
export type {
  MediaType,
  ConfidenceLevel,
  MediaContext,
  ChatMedia,
} from './universal-context';

// AI-Powered Analyzer
export { AIContextAnalyzer } from './universal-context';

// Context Manager
export { UniversalContextManager, contextManager } from './universal-context';

// AI-Powered analyzer function
export { analyzeMediaWithAI } from './ai-powered-analyzer';

// Utility functions for context analysis
export async function analyzeImageContext(
  userMessage: string,
  chatId: string,
  currentAttachments?: any[],
  userId?: string,
) {
  const { contextManager } = await import('./universal-context');
  const chatMedia = await contextManager.getChatMedia(chatId);
  return contextManager.analyzeContext(
    'image',
    userMessage,
    chatMedia,
    currentAttachments,
    chatId,
    userId,
  );
}

export async function analyzeVideoContext(
  userMessage: string,
  chatId: string,
  currentAttachments?: any[],
  userId?: string,
) {
  const { contextManager } = await import('./universal-context');
  const chatMedia = await contextManager.getChatMedia(chatId);
  return contextManager.analyzeContext(
    'video',
    userMessage,
    chatMedia,
    currentAttachments,
    chatId,
    userId,
  );
}

export async function analyzeAudioContext(
  userMessage: string,
  chatId: string,
  currentAttachments?: any[],
) {
  const { contextManager } = await import('./universal-context');
  const chatMedia = await contextManager.getChatMedia(chatId);
  return contextManager.analyzeContext(
    'audio',
    userMessage,
    chatMedia,
    currentAttachments,
    chatId,
  );
}

// Universal function for any media type
export async function analyzeMediaContext(
  mediaType: 'image' | 'video' | 'audio',
  userMessage: string,
  chatId: string,
  currentAttachments?: any[],
) {
  const { contextManager } = await import('./universal-context');
  const chatMedia = await contextManager.getChatMedia(chatId);
  return contextManager.analyzeContext(
    mediaType,
    userMessage,
    chatMedia,
    currentAttachments,
    chatId,
  );
}

// Cache system
export { contextCache, generateMessageHash } from './cache';

// Performance monitoring (keep for metrics)
export {
  contextPerformanceMonitor,
  ContextPerformanceMonitor,
} from './performance-monitor';
