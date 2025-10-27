/**
 * AI-Powered Media Context Analyzer
 * Uses AI SDK to intelligently analyze user messages and find relevant media
 * Replaces regex-based pattern matching with LLM reasoning
 */

import { generateText } from 'ai';
import { myProvider } from '@/lib/ai/providers';
import type { ChatMedia, MediaContext, MediaType } from './universal-context';

/**
 * Analyze user message using AI to find relevant media
 */
export async function analyzeMediaWithAI(
  userMessage: string,
  chatMedia: ChatMedia[],
  mediaType: MediaType,
  currentAttachments?: any[],
): Promise<MediaContext> {
  // 1. Check current message attachments first
  if (currentAttachments?.length) {
    const currentMedia = currentAttachments.find((a) =>
      a.contentType?.startsWith(
        mediaType === 'image'
          ? 'image/'
          : mediaType === 'video'
            ? 'video/'
            : 'audio/',
      ),
    );
    if (currentMedia?.url) {
      return {
        sourceUrl: currentMedia.url,
        sourceId: currentMedia.id,
        mediaType,
        confidence: 'high',
        reasoning: 'Media found in current user message attachments',
      };
    }
  }

  // 2. If no media in history, return low confidence
  if (chatMedia.length === 0) {
    return {
      mediaType,
      confidence: 'low',
      reasoning: 'No media files found in chat history',
    };
  }

  // 3. Use AI to analyze which media user is referring to
  // CRITICAL FIX: Don't filter by mediaType - let LLM see ALL media
  // This enables cross-media transformations (e.g., "make video from this image")
  try {
    const result = await analyzeMediaReferenceWithLLM(
      userMessage,
      chatMedia, // Pass ALL media, not filtered
      mediaType,
    );

    return result;
  } catch (error) {
    console.error('[AI-Powered Analyzer] LLM analysis failed:', error);

    // Fallback: return most recent media of target type
    const targetTypeMedia = chatMedia.filter((m) => m.mediaType === mediaType);
    const mostRecent = targetTypeMedia[targetTypeMedia.length - 1] || chatMedia[chatMedia.length - 1];

    if (mostRecent) {
      return {
        sourceUrl: mostRecent.url,
        ...(mostRecent.id && { sourceId: mostRecent.id }),
        mediaType,
        confidence: 'low',
        reasoning: `LLM analysis failed, using most recent ${mostRecent.mediaType} as fallback`,
        ...(mostRecent.mediaType !== mediaType && {
          metadata: { sourceMediaType: mostRecent.mediaType },
        }),
      };
    }

    return {
      mediaType,
      confidence: 'low',
      reasoning: 'Analysis failed and no media available',
    };
  }
}

/**
 * Use LLM to analyze user message and find relevant media
 */
async function analyzeMediaReferenceWithLLM(
  userMessage: string,
  availableMedia: ChatMedia[],
  mediaType: MediaType,
): Promise<MediaContext> {
  // Prepare media list for LLM
  const mediaList = availableMedia
    .map(
      (m, idx) =>
        `${idx + 1}. ID: ${m.id || 'unknown'} | Role: ${m.role} | Prompt: "${m.prompt || 'N/A'}" | Time: ${m.timestamp.toISOString()}`,
    )
    .join('\n');

  const prompt = `You are an AI context analyzer. User wants to work with ${mediaType} content. Help find what media they're referring to.

User message: "${userMessage}"

Available media files in chat history (ALL TYPES - images, videos, audio):
${mediaList}

Analyze the user's message and determine:
1. Are they referring to specific existing media from the list above?
2. If yes, which one (by number)? Consider:
   - Direct references: "this", "that", "the one", "first", "last", "second"
   - Content-based: "with a bear", "the cat picture", "the sunset video"
   - Time-based: "latest", "recent", "the one you just made"
   - Author-based: "the one I uploaded", "the one you generated"
3. What is the user's INTENT? Are they:
   - EDITING existing media (e.g., "add a wolf to this image", "make it brighter")
   - TRANSFORMING media (e.g., "animate this image", "make video from this picture", "extract frame from video")
   - CREATING something new (e.g., "create a new image", "generate a picture")
4. Confidence level: high/medium/low

CRITICAL: User may want to use one media type to create another (cross-media):
- "make video from this image" → use IMAGE to create video (intent: transform)
- "animate the cat picture" → use IMAGE to create video (intent: transform)
- "extract frame from that video" → use VIDEO to create image (intent: transform)

Respond in JSON format:
{
  "isReferencing": true/false,
  "mediaNumber": number (1-${availableMedia.length}) or null,
  "confidence": "high" | "medium" | "low",
  "reasoning": "explain your decision",
  "intent": "edit" | "transform" | "create_new",
  "intentDescription": "what the user wants to do"
}

Examples:
- "make video from this image" → find recent image, intent: "transform", intentDescription: "animate image to video"
- "animate the cat picture" → find image with "cat", intent: "transform", intentDescription: "create video from cat image"
- "возьми картинку с медведем и сделай видео" → find image with "bear", intent: "transform"
- "edit this image" → find recent image, intent: "edit"
- "сделай это изображение ярче" → isReferencing: true, mediaNumber: ${availableMedia.length}, intent: "edit"
- "create a new video about space" → isReferencing: false, intent: "create_new"

IMPORTANT:
- If user mentions editing/adding/changing existing media → intent is "edit"
- If user wants to animate/convert/transform media type → intent is "transform"
- If user wants to create something completely new → intent is "create_new"`;

  const { text } = await generateText({
    model: myProvider.languageModel('chat-model'),
    prompt,
    maxOutputTokens: 200,
  });

  // Parse LLM response
  let analysis: {
    isReferencing: boolean;
    mediaNumber: number | null;
    confidence: 'high' | 'medium' | 'low';
    reasoning: string;
    intent: 'edit' | 'transform' | 'create_new';
    intentDescription: string;
  };

  try {
    // Try to extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in LLM response');
    }
    analysis = JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('[AI Analyzer] Failed to parse LLM response:', text);
    // Fallback
    return {
      mediaType,
      confidence: 'low',
      reasoning: 'Failed to parse LLM analysis response',
    };
  }

  // Convert to MediaContext
  if (!analysis.isReferencing || analysis.mediaNumber === null) {
    return {
      mediaType,
      confidence: 'low',
      reasoning: analysis.reasoning || 'User is not referencing existing media',
      intent: analysis.intent || 'create_new',
      intentDescription: analysis.intentDescription,
    };
  }

  const selectedMedia = availableMedia[analysis.mediaNumber - 1];
  if (!selectedMedia) {
    return {
      mediaType,
      confidence: 'low',
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
    reasoning: analysis.reasoning + (isCrossMedia ? ` (cross-media: ${selectedMedia.mediaType}→${mediaType})` : ''),
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
