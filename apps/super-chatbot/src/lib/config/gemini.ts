/**
 * Конфигурация для Google Gemini API
 * Nano Banana использует Gemini-2.5-Flash-Image модель
 */

export const getGeminiConfig = () => {
  // Используем существующий GOOGLE_AI_API_KEY из banana-veo3
  const apiKey = process.env.GOOGLE_AI_API_KEY;

  if (!apiKey) {
    throw new Error(
      'GOOGLE_AI_API_KEY environment variable is required for Nano Banana (Gemini-2.5-Flash-Image)',
    );
  }

  return {
    apiKey,
    model: 'gemini-2.5-flash-lite', // Используем модель, которая работает с API ключами
    baseUrl: 'https://aiplatform.googleapis.com/v1/publishers/google/models',
  };
};

export const getGeminiGenerationConfig = () => {
  return {
    responseModalities: ['Text', 'Image'] as const,
    temperature: 0.7,
    maxOutputTokens: 4096,
    topP: 0.8,
    topK: 40,
  };
};
