/**
 * AI-Powered Media Context Analyzer
 * Uses AI SDK to intelligently analyze user messages and find relevant media
 * Replaces regex-based pattern matching with LLM reasoning
 */

import { generateObject, generateText } from "ai";
import { z } from "zod";
import { myProvider } from "@/lib/ai/providers";
import type { ChatMedia, MediaContext, MediaType } from "./universal-context";

/**
 * Analyze user message using AI to find relevant media
 */
export async function analyzeMediaWithAI(
  userMessage: string,
  chatMedia: ChatMedia[],
  mediaType: MediaType,
  currentAttachments?: any[]
): Promise<MediaContext> {
  // 1. Check current message attachments first
  if (currentAttachments?.length) {
    const currentMedia = currentAttachments.find((a) =>
      a.contentType?.startsWith(
        mediaType === "image"
          ? "image/"
          : mediaType === "video"
            ? "video/"
            : "audio/"
      )
    );
    if (currentMedia?.url) {
      return {
        sourceUrl: currentMedia.url,
        sourceId: currentMedia.id,
        mediaType,
        confidence: "high",
        reasoning: "Media found in current user message attachments",
      };
    }
  }

  // 2. If no media in history, return low confidence
  if (chatMedia.length === 0) {
    return {
      mediaType,
      confidence: "low",
      reasoning: "No media files found in chat history",
    };
  }

  // 3. Use AI to analyze which media user is referring to
  // CRITICAL FIX: Don't filter by mediaType - let LLM see ALL media
  // This enables cross-media transformations (e.g., "make video from this image")
  try {
    const result = await analyzeMediaReferenceWithLLM(
      userMessage,
      chatMedia, // Pass ALL media, not filtered
      mediaType
    );

    return result;
  } catch (error) {
    console.error("[AI-Powered Analyzer] LLM analysis failed:", error);

    // Fallback: return most recent media of target type
    const targetTypeMedia = chatMedia.filter((m) => m.mediaType === mediaType);
    const mostRecent =
      targetTypeMedia[targetTypeMedia.length - 1] ||
      chatMedia[chatMedia.length - 1];

    if (mostRecent) {
      return {
        sourceUrl: mostRecent.url,
        ...(mostRecent.id && { sourceId: mostRecent.id }),
        mediaType,
        confidence: "low",
        reasoning: `LLM analysis failed, using most recent ${mostRecent.mediaType} as fallback`,
        ...(mostRecent.mediaType !== mediaType && {
          metadata: { sourceMediaType: mostRecent.mediaType },
        }),
      };
    }

    return {
      mediaType,
      confidence: "low",
      reasoning: "Analysis failed and no media available",
    };
  }
}

/**
 * Use LLM to analyze user message and find relevant media
 */
async function analyzeMediaReferenceWithLLM(
  userMessage: string,
  availableMedia: ChatMedia[],
  mediaType: MediaType
): Promise<MediaContext> {
  // Prepare media list for LLM
  const mediaList = availableMedia
    .map(
      (m, idx) =>
        `${idx + 1}. ID: ${m.id || "unknown"} | Role: ${m.role} | Prompt: "${m.prompt || "N/A"}" | Time: ${m.timestamp.toISOString()}`
    )
    .join("\n");

  console.log("🤖 ai:analyze", {
    mediaType,
    mediaCount: availableMedia.length,
  });

  // Define Zod schema for structured output
  const analysisSchema = z.object({
    isReferencing: z.boolean(),
    mediaNumber: z.number().nullable(),
    confidence: z.enum(["high", "medium", "low"]),
    reasoning: z.string(),
    intent: z.enum(["edit", "transform", "create_new"]),
    intentDescription: z.string(),
  });

  const prompt = `Analyze user's ${mediaType} request.

User message: "${userMessage}"

Available media (${availableMedia.length} files):
${mediaList}

Task: Find which media user refers to.

Rules:
- "last", "latest", "recent" → most recent (number ${availableMedia.length})
- "first" → oldest (number 1)
- Content match → find by prompt keywords
- Editing existing → intent: "edit"
- Creating new → intent: "create_new"
- Transform type (image→video) → intent: "transform"

Response JSON format:
- isReferencing: true if referring to existing media, false if creating new
- mediaNumber: 1-${availableMedia.length} or null
- confidence: "high" / "medium" / "low"
- reasoning: short explanation (max 10 words)
- intent: "edit" / "transform" / "create_new"
- intentDescription: short description (max 10 words)`;

  let analysis: z.infer<typeof analysisSchema>;

  try {
    console.log("🤖 ai:generateObject");
    const { object } = await generateObject({
      model: myProvider.languageModel("chat-model"),
      prompt,
      schema: analysisSchema,
      maxOutputTokens: 500, // Увеличено с 300 до 500
    });

    console.log("🤖 ai:response", {
      isReferencing: object.isReferencing,
      mediaNumber: object.mediaNumber,
      confidence: object.confidence,
    });
    analysis = object;
  } catch (error) {
    console.error(
      "🤖 ai:error",
      error instanceof Error ? error.message : String(error)
    );
    // Fallback
    return {
      mediaType,
      confidence: "low",
      reasoning: "Failed to generate AI analysis response",
    };
  }

  // Convert to MediaContext
  if (!analysis.isReferencing || analysis.mediaNumber === null) {
    return {
      mediaType,
      confidence: "low",
      reasoning: analysis.reasoning || "User is not referencing existing media",
      intent: analysis.intent || "create_new",
      intentDescription: analysis.intentDescription,
    };
  }

  const selectedMedia = availableMedia[analysis.mediaNumber - 1];
  if (!selectedMedia) {
    return {
      mediaType,
      confidence: "low",
      reasoning: `Invalid media number ${analysis.mediaNumber} from LLM`,
    };
  }

  // Check if this is cross-media transformation (e.g., image→video)
  const isCrossMedia = selectedMedia.mediaType !== mediaType;

  return {
    sourceUrl: selectedMedia.url,
    ...(selectedMedia.id && { sourceId: selectedMedia.id }),
    mediaType,
    confidence: analysis.confidence,
    reasoning:
      analysis.reasoning +
      (isCrossMedia
        ? ` (cross-media: ${selectedMedia.mediaType}→${mediaType})`
        : ""),
    intent: analysis.intent,
    intentDescription: analysis.intentDescription,
    metadata: {
      llmAnalysis: true,
      mediaNumber: analysis.mediaNumber,
      prompt: selectedMedia.prompt,
      role: selectedMedia.role,
      // Add source media type for cross-media transformations
      ...(isCrossMedia && { sourceMediaType: selectedMedia.mediaType }),
    },
  };
}
