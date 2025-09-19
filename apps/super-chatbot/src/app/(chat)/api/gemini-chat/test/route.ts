import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Проверяем, что API ключ установлен
    const apiKey = process.env.GOOGLE_AI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          status: "error",
          message: "GOOGLE_AI_API_KEY not configured",
          details:
            "Please set GOOGLE_AI_API_KEY in your environment variables. Use Google AI Studio API key, NOT Vertex AI key.",
        },
        { status: 500 }
      );
    }

    // Проверяем, что модель доступна через прямой API вызов
    const { callGeminiDirect } = await import("@/lib/ai/gemini-direct");

    // Тестовый вызов к Gemini API
    const testMessages = [
      {
        role: "user" as const,
        parts: [{ text: "Привет! Это тест Gemini 2.5 Flash Lite." }],
      },
    ];

    const testResponse = await callGeminiDirect(testMessages, apiKey, {
      temperature: 0.7,
      maxTokens: 100,
    });

    return NextResponse.json({
      status: "success",
      message: "Gemini 2.5 Flash Lite integration is working",
      details: {
        apiKeyConfigured: !!apiKey,
        modelName: "gemini-2.5-flash-lite",
        testResponse: testResponse.substring(0, 100) + "...",
        responseLength: testResponse.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Gemini test error:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "Gemini integration test failed",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
