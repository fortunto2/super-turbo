/**
 * AI-Powered Universal Media Context System
 * Uses AI SDK for intelligent media analysis instead of regex patterns
 */

import { analyzeMediaWithAI } from "./ai-powered-analyzer";
import { contextCache, generateMessageHash } from "./cache";

export type MediaType = "image" | "video" | "audio" | "document";
export type ConfidenceLevel = "high" | "medium" | "low";
export type UserIntent = "edit" | "transform" | "create_new";

export interface MediaContext {
  sourceUrl?: string;
  sourceId?: string;
  mediaType: MediaType;
  confidence: ConfidenceLevel;
  reasoning: string;
  intent?: UserIntent;
  intentDescription?: string;
  metadata?: Record<string, any>;
}

export interface ChatMedia {
  url: string;
  id?: string;
  role: "user" | "assistant";
  timestamp: Date;
  prompt?: string;
  messageIndex: number;
  mediaType: MediaType;
  metadata?: Record<string, any>;
}

/**
 * AI-Powered Context Analyzer
 * Simplified version that only uses AI for analysis
 */
export class AIContextAnalyzer {
  async analyzeContext(
    mediaType: MediaType,
    userMessage: string,
    chatMedia: ChatMedia[],
    currentAttachments?: any[],
    chatId?: string
  ): Promise<MediaContext> {
    console.log(`🤖 ai:analyze start`, { mediaType });

    // Check cache first (only if chatId is provided)
    if (chatId) {
      const messageHash = generateMessageHash(userMessage, chatMedia);
      const cached = await contextCache.getCachedContext(
        chatId,
        messageHash,
        mediaType
      );
      if (cached) {
        console.log(`✅ ai:cache hit`, { mediaType });
        return cached;
      }
    }

    // Use AI-powered analysis
    const result = await analyzeMediaWithAI(
      userMessage,
      chatMedia,
      mediaType,
      currentAttachments
    );

    // Cache result (only if chatId is provided and confidence is not low)
    if (chatId && result.confidence !== "low") {
      const messageHash = generateMessageHash(userMessage, chatMedia);
      await contextCache.setCachedContext(
        chatId,
        messageHash,
        mediaType,
        result
      );
    }

    console.log(`✅ ai:analyze result`, {
      confidence: result.confidence,
      hasSourceUrl: !!result.sourceUrl,
      sourceUrlType: result.sourceUrl?.startsWith("data:")
        ? "base64"
        : result.sourceUrl
          ? "url"
          : "none",
    });

    return result;
  }
}

/**
 * Universal Context Manager
 * Manages media context across chat history
 */
export class UniversalContextManager {
  private analyzer = new AIContextAnalyzer();

  /**
   * Analyze context for specific media type
   */
  async analyzeContext(
    mediaType: MediaType,
    userMessage: string,
    chatMedia: ChatMedia[],
    currentAttachments?: any[],
    chatId?: string,
    userId?: string
  ): Promise<MediaContext> {
    return this.analyzer.analyzeContext(
      mediaType,
      userMessage,
      chatMedia,
      currentAttachments,
      chatId
    );
  }

  /**
   * Get all media from chat history
   * Fetches media artifacts from database (message parts and attachments)
   */
  async getChatMedia(chatId: string): Promise<ChatMedia[]> {
    console.log(`📋 context:getMedia`, { chatId });

    try {
      // Dynamic import to avoid circular dependencies
      const { getChatMediaArtifacts } = await import("@/lib/db/queries");

      const mediaArtifacts = await getChatMediaArtifacts({ chatId, limit: 50 });

      console.log(`📋 context:found`, { count: mediaArtifacts.length });

      // Convert to ChatMedia format
      return mediaArtifacts.map((artifact) => {
        const chatMedia: ChatMedia = {
          url: artifact.url,
          role: artifact.role,
          timestamp: artifact.timestamp,
          messageIndex: artifact.messageIndex,
          mediaType: artifact.mediaType,
          ...(artifact.id && { id: artifact.id }),
          ...(artifact.prompt && { prompt: artifact.prompt }),
          ...(artifact.metadata && { metadata: artifact.metadata }),
        };
        return chatMedia;
      });
    } catch (error) {
      console.error("[Context Manager] Failed to fetch chat media:", error);
      return [];
    }
  }
}

// Singleton instance
export const contextManager = new UniversalContextManager();
