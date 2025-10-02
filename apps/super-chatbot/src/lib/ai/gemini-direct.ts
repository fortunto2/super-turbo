/**
 * Прямая интеграция с Google AI Platform API для Gemini 2.5 Flash Lite
 * Использует прямой HTTP запрос без дополнительных SDK
 */

export interface GeminiMessage {
  role: "user" | "model";
  parts: Array<{
    text: string;
  }>;
}

export interface GeminiRequest {
  contents: GeminiMessage[];
  generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
    topP?: number;
    topK?: number;
  };
}

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
    finishReason: string;
  }>;
}

/**
 * Отправляет запрос к Gemini 2.5 Flash Lite через Google AI Platform API
 */
export async function callGeminiDirect(
  messages: GeminiMessage[],
  apiKey: string,
  options: {
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<string> {
  const url = `https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;

  const requestBody: GeminiRequest = {
    contents: messages,
    generationConfig: {
      temperature: options.temperature || 0.7,
      maxOutputTokens: options.maxTokens || 1000,
      topP: 0.8,
      topK: 40,
    },
  };

  try {
    console.log("🔍 Gemini API request:", {
      url,
      body: JSON.stringify(requestBody, null, 2),
    });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data: GeminiResponse = await response.json();

    // Добавляем отладочную информацию
    console.log("🔍 Gemini API response:", JSON.stringify(data, null, 2));

    if (!data.candidates || data.candidates.length === 0) {
      console.error("🔍 No candidates in response:", data);
      throw new Error("No response from Gemini API");
    }

    const candidate = data.candidates?.[0];
    if (
      !candidate?.content ||
      !candidate.content.parts ||
      candidate.content.parts.length === 0
    ) {
      throw new Error("Empty response from Gemini API");
    }

    return candidate.content.parts[0]?.text || "";
  } catch (error) {
    console.error("Gemini direct API error:", error);
    throw error;
  }
}

/**
 * Конвертирует сообщения чата в формат Gemini API
 */
export function convertToGeminiMessages(chatMessages: any[]): GeminiMessage[] {
  return chatMessages
    .filter((msg) => msg.role === "user" || msg.role === "assistant")
    .map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [
        {
          text: msg.content || msg.parts?.[0]?.text || "",
        },
      ],
    }));
}
