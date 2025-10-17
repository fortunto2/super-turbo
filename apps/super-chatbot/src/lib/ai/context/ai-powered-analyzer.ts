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
  const filteredMedia = chatMedia.filter((m) => m.mediaType === mediaType);
  if (filteredMedia.length === 0) {
    return {
      mediaType,
      confidence: 'low',
      reasoning: `No ${mediaType} files found in chat history`,
    };
  }

  // 3. Use AI to analyze which media user is referring to
  try {
    const result = await analyzeMediaReferenceWithLLM(
      userMessage,
      filteredMedia,
      mediaType,
    );

    return result;
  } catch (error) {
    console.error('[AI-Powered Analyzer] LLM analysis failed:', error);

    // Fallback: return most recent media
    const mostRecent = filteredMedia[filteredMedia.length - 1];
    if (mostRecent) {
      return {
        sourceUrl: mostRecent.url,
        ...(mostRecent.id && { sourceId: mostRecent.id }),
        mediaType,
        confidence: 'low',
        reasoning: 'LLM analysis failed, using most recent media as fallback',
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

  const prompt = `You are an AI context analyzer helping to understand which ${mediaType} file the user is referring to and what they want to do with it.

User message: "${userMessage}"

Available ${mediaType} files in chat history:
${mediaList}

Analyze the user's message and determine:
1. Are they referring to a specific existing ${mediaType} file from the list above?
2. If yes, which one (by number)? Consider:
   - Direct references: "this", "that", "the one", "first", "last", "second"
   - Content-based: "with a bear", "the cat picture", "the sunset video"
   - Time-based: "latest", "recent", "the one you just made"
   - Author-based: "the one I uploaded", "the one you generated"
3. What is the user's INTENT? Are they:
   - EDITING existing media (e.g., "add a wolf to this image", "make it brighter", "change colors")
   - TRANSFORMING media (e.g., "animate this image", "make a video from this")
   - CREATING something new (e.g., "create a new image", "generate a picture")
4. Confidence level: high/medium/low

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
- "edit this image" → isReferencing: true, mediaNumber: ${availableMedia.length}, confidence: high, intent: "edit"
- "возьми картинку с медведем и добавь волка" → find image with "bear"/"медведь" in prompt, intent: "edit", intentDescription: "add wolf to bear image"
- "animate the cat picture" → find image with "cat", intent: "transform", intentDescription: "animate cat image to video"
- "use first image" → mediaNumber: 1, confidence: high, intent: "edit"
- "the one you generated" → find assistant-generated ${mediaType}, confidence: medium
- "create a new video about space" → isReferencing: false, intent: "create_new", intentDescription: "create new space video"
- "сделай это изображение ярче" → isReferencing: true, mediaNumber: ${availableMedia.length}, intent: "edit", intentDescription: "make image brighter"

IMPORTANT:
- If user mentions editing/adding/changing something in an existing image → intent is "edit"
- If user wants to animate/convert existing media → intent is "transform"
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

  return {
    sourceUrl: selectedMedia.url,
    ...(selectedMedia.id && { sourceId: selectedMedia.id }),
    mediaType,
    confidence: analysis.confidence,
    reasoning: analysis.reasoning,
    intent: analysis.intent,
    intentDescription: analysis.intentDescription,
    metadata: {
      llmAnalysis: true,
      mediaNumber: analysis.mediaNumber,
      prompt: selectedMedia.prompt,
      role: selectedMedia.role,
    },
  };
}
