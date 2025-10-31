interface GeminiChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

interface GeminiGenerateContentRequest {
  contents: GeminiChatMessage[];
  generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
    topP?: number;
    topK?: number;
  };
}

/**
 * Creates a simple Gemini language model using direct API calls
 * Uses AI Platform API (same as banana-veo3)
 * This works with your VERTEX_AI_API_KEY
 * Note: Streaming is not supported with API key, falls back to non-streaming
 */
export function createGeminiDirectModel(
  modelId = 'gemini-2.5-flash-lite',
): any {
  const apiKey =
    process.env.VERTEX_AI_API_KEY || process.env.GOOGLE_AI_API_KEY || '';

  if (!apiKey) {
    throw new Error('VERTEX_AI_API_KEY or GOOGLE_AI_API_KEY not configured');
  }

  return {
    specificationVersion: 'v2',
    provider: 'google-generative-language',
    modelId: modelId,
    defaultObjectGenerationMode: 'json',

    async doGenerate(options: any) {
      const { prompt, mode } = options;

      // Convert AI SDK messages to Gemini format
      const contents: GeminiChatMessage[] = prompt.map((msg: any) => {
        // Extract text from content or parts
        let text = '';
        if (typeof msg.content === 'string') {
          text = msg.content;
        } else if (msg.parts && Array.isArray(msg.parts)) {
          const textPart = msg.parts.find((p: any) => p.type === 'text');
          text = textPart?.text || '';
        }

        return {
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text }],
        };
      });

      // Use AI Platform API (works with VERTEX_AI_API_KEY)
      const url = `https://aiplatform.googleapis.com/v1/publishers/google/models/${modelId}:generateContent?key=${apiKey}`;

      const requestBody: GeminiGenerateContentRequest = {
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
        },
      };

      console.log('🤖 Gemini Direct API request to:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('❌ Gemini API error:', error);
        throw new Error(`Gemini API error: ${response.status} - ${error}`);
      }

      const data = await response.json();

      console.log(
        '🤖 Gemini API response data:',
        JSON.stringify(data, null, 2),
      );

      if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
        console.error(
          '❌ Invalid Gemini API response structure:',
          JSON.stringify(data, null, 2),
        );
        throw new Error(
          `Invalid response from Gemini API: ${JSON.stringify(data)}`,
        );
      }

      const text = data.candidates[0].content.parts[0].text;

      return {
        text: text,
        usage: {
          promptTokens: data.usageMetadata?.promptTokenCount || 0,
          completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
        },
        finishReason: 'stop',
        response: {
          id: crypto.randomUUID(),
          timestamp: new Date(),
          modelId: modelId,
        },
        rawCall: {
          rawPrompt: contents,
          rawSettings: requestBody.generationConfig,
        },
        rawResponse: { headers: {} },
        warnings: [],
      };
    },

    async doStream(options: any) {
      // AI Platform API doesn't support streaming with API key (requires OAuth2)
      // Fallback to non-streaming mode
      console.log(
        '🤖 Gemini API: Streaming not supported with API key, using doGenerate fallback',
      );

      // Вызываем doGenerate асинхронно
      const generatePromise = this.doGenerate(options);

      // Создаем stream который будет ждать результат
      const stream = new ReadableStream({
        async start(controller) {
          try {
            // Ждем результат
            const result = await generatePromise;

            console.log('🤖 doStream - got result:', {
              hasText: !!result.text,
              textLength: result.text?.length,
            });

            // Отправляем весь текст сразу одним чанком
            if (result.text) {
              controller.enqueue({
                type: 'text-delta',
                textDelta: result.text,
              });
            }

            // Отправляем finish
            controller.enqueue({
              type: 'finish',
              finishReason: result.finishReason,
              usage: result.usage,
            });

            controller.close();
          } catch (error) {
            console.error('🤖 doStream error:', error);
            controller.error(error);
          }
        },
      });

      return {
        stream,
        rawCall: { rawPrompt: options.prompt, rawSettings: {} },
        rawResponse: { headers: {} },
        warnings: [],
      };
    },
  };
}

/**
 * Creates a Nano Banana language model using Gemini 2.5 Flash Lite
 * Optimized for chat with enhanced capabilities
 * Uses AI Platform API (same as banana-veo3)
 * Note: Streaming is simulated (full response at once)
 */
export function createNanoBananaModel(): any {
  return createGeminiDirectModel('gemini-2.5-flash-lite');
}
