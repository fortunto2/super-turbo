import { tool } from 'ai';
import { z } from 'zod';
import { contextManager } from '@/lib/ai/context';

export const analyzeMediaReference = tool({
  description: `CRITICAL FIRST STEP: Use this tool BEFORE any image/video generation when user references existing media.

Call this tool when user wants to:
- EDIT existing media: "add a wolf to the bear image", "make it brighter", "change colors"
- TRANSFORM media: "animate this image", "make a video from this picture"
- Use specific media: "use the second image", "the one with a cat"

This tool uses AI to:
1. Find which exact media file user is referring to (by analyzing prompts, time, content)
2. Determine user's INTENT (edit/transform/create_new)
3. Return the media URL and clear instructions on which generation tool to use next

IMPORTANT: The tool's response will tell you whether to use:
- image-to-image mode (sourceImageUrl parameter) for editing
- text-to-image mode (no source) for creating new
- video generation with source image for animation

Examples when to call this:
- "возьми картинку с медведем и добавь волка" → finds bear image, returns intent:"edit"
- "animate the cat picture" → finds cat image, returns intent:"transform"
- "make this brighter" → finds recent image, returns intent:"edit"
- "use first image as reference" → finds first image

DO NOT call this for completely new creations like "create an image of a sunset"`,

  inputSchema: z.object({
    chatId: z.string().describe('Current chat ID'),
    userMessage: z
      .string()
      .describe('User message to analyze for media references'),
    mediaType: z
      .enum(['image', 'video', 'audio'])
      .optional()
      .describe('Expected media type if known'),
  }),

  execute: async ({ chatId, userMessage, mediaType }) => {
    try {
      console.log(
        `🔍 [analyzeMediaReference] Analyzing message: "${userMessage}"`,
        { chatId, mediaType },
      );

      // Get all media from chat
      const chatMedia = await contextManager.getChatMedia(chatId);

      if (chatMedia.length === 0) {
        return {
          success: false,
          confidence: 'low',
          reasoning: 'No media found in chat history',
          media: null,
          suggestion: 'Ask user to upload or generate media first',
        };
      }

      // If mediaType is provided, use it; otherwise AI will analyze all media types
      const targetType = mediaType || 'image'; // Default to image if not specified

      // Use AI-powered context manager to analyze which media user is referring to
      const result = await contextManager.analyzeContext(
        targetType,
        userMessage,
        chatMedia,
        [], // No current attachments for reference analysis
        chatId,
      );

      console.log(`✅ [analyzeMediaReference] Analysis result:`, {
        confidence: result.confidence,
        reasoning: result.reasoning,
        sourceUrl: result.sourceUrl,
      });

      // Build detailed suggestion for main LLM based on intent
      let suggestion = '';
      if (result.confidence === 'low') {
        suggestion =
          'Cannot determine which media user is referring to. Ask user to be more specific or use findMediaInChat to show available options.';
      } else {
        const intentAction =
          result.intent === 'edit'
            ? 'EDIT (image-to-image)'
            : result.intent === 'transform'
              ? 'TRANSFORM (e.g., animate)'
              : 'CREATE NEW';

        suggestion = `User wants to ${intentAction} the ${targetType} at ${result.sourceUrl}.
Intent: ${result.intent}
Description: ${result.intentDescription || 'N/A'}
Original prompt: ${result.metadata?.prompt || 'N/A'}

IMPORTANT for next tool call:
- If intent is "edit": Use configureImageGeneration with sourceImageUrl parameter (image-to-image mode)
- If intent is "transform" and user wants animation: Use configureVideoGeneration with sourceImageUrl
- If intent is "create_new": Use text-to-image/video without source parameter`;
      }

      return {
        success: result.confidence !== 'low',
        confidence: result.confidence,
        reasoning: result.reasoning,
        intent: result.intent,
        intentDescription: result.intentDescription,
        media: result.sourceUrl
          ? {
              url: result.sourceUrl,
              id: result.sourceId || 'unknown',
              type: targetType,
              metadata: result.metadata,
            }
          : null,
        suggestion,
      };
    } catch (error: any) {
      console.error('[analyzeMediaReference] Error:', error);
      return {
        success: false,
        confidence: 'low',
        reasoning: `Analysis failed: ${error.message}`,
        media: null,
        error: error.message || 'Failed to analyze media reference',
      };
    }
  },
});
