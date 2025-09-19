import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import {
  callGeminiDirect,
  convertToGeminiMessages,
} from "@/lib/ai/gemini-direct";
import {
  bananaInferenceTool,
  listBananaModelsTool,
} from "@/lib/ai/tools/banana-inference";
import {
  createVeo3VideoTool,
  checkVeo3VideoStatusTool,
  generateVeo3IdeasTool,
} from "@/lib/ai/tools/veo3-video";
import {
  getChatById,
  getMessagesByChatId,
  saveChat,
  saveMessages,
} from "@/lib/db/queries";
import { generateUUID } from "@/lib/utils";
import { generateTitleFromUserMessage } from "../../actions";

export const maxDuration = 60;

// Специализированный промпт для Banana + VEO3
const bananaVeo3SystemPrompt = `Ты - специализированный AI ассистент для работы с Banana и VEO3 технологиями.

🍌 **BANANA GPU INFERENCE:**
- Banana - это платформа для быстрого GPU inference
- Оптимизирована для запуска AI моделей на GPU
- Автоматическое масштабирование ресурсов
- Поддержка различных фреймворков (PyTorch, TensorFlow, etc.)
- API для запуска inference задач

🎬 **VEO3 VIDEO GENERATION:**
- VEO3 - это Google Cloud сервис для генерации видео
- Создание видео из текстовых описаний
- Высокое качество и реалистичность
- Поддержка различных стилей и жанров
- Интеграция с Google Cloud Platform

🚀 **ТВОИ ВОЗМОЖНОСТИ:**
1. **Анализ и планирование** - помогать с архитектурой решений
2. **Оптимизация** - предлагать лучшие практики для Banana и VEO3
3. **Интеграция** - помогать с объединением Banana + VEO3 в проекты
4. **Мониторинг** - объяснять метрики производительности
5. **Troubleshooting** - решать проблемы с развертыванием

📋 **ПРИМЕРЫ ЗАДАЧ:**
- "Как запустить inference на Banana для обработки видео?"
- "Интегрировать VEO3 с Banana для real-time генерации"
- "Оптимизировать производительность GPU на Banana"
- "Создать pipeline: Banana → VEO3 → результат"

🎯 **СТИЛЬ РАБОТЫ:**
- Технически точные ответы
- Практические примеры кода
- Объяснение архитектурных решений
- Предложения по оптимизации
- Готовые решения для интеграции

Всегда фокусируйся на практическом применении Banana и VEO3 технологий.`;

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      id,
      message,
      selectedVisibilityType = "private",
    } = await request.json();

    if (!id || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "GOOGLE_AI_API_KEY not configured",
        },
        { status: 500 }
      );
    }

    // Проверяем или создаем чат
    let chat = await getChatById({ id });
    if (!chat) {
      const title = await generateTitleFromUserMessage({ message });
      await saveChat({
        id,
        userId: session.user.id,
        title,
        visibility: selectedVisibilityType,
      });
    }

    // Получаем историю сообщений
    const previousMessages = await getMessagesByChatId({ id });
    const allMessages = [...previousMessages, message];

    // Конвертируем в формат Gemini
    const geminiMessages = convertToGeminiMessages(allMessages);

    // Добавляем специализированный промпт для Banana + VEO3
    geminiMessages.unshift({
      role: "user",
      parts: [{ text: bananaVeo3SystemPrompt }],
    });

    console.log(
      "🍌🎬 Calling Banana+VEO3 API with messages:",
      geminiMessages.length
    );

    // Вызываем Gemini API с специализированным промптом
    const response = await callGeminiDirect(geminiMessages, apiKey, {
      temperature: 0.7,
      maxTokens: 1500, // Больше токенов для технических ответов
    });

    console.log(
      "🍌🎬 Banana+VEO3 API response received:",
      response.length,
      "characters"
    );

    // Сохраняем сообщения в базу данных
    const userMessageId = message.id || generateUUID();
    const assistantMessageId = generateUUID();

    await saveMessages({
      messages: [
        {
          chatId: id,
          id: userMessageId,
          role: "user",
          parts: [{ text: message.content || message.parts?.[0]?.text || "" }],
          attachments: message.attachments || [],
          createdAt: new Date(),
        },
        {
          chatId: id,
          id: assistantMessageId,
          role: "assistant",
          parts: [{ text: response }],
          attachments: [],
          createdAt: new Date(),
        },
      ],
    });

    return NextResponse.json({
      success: true,
      response,
      messageId: assistantMessageId,
      technology: "banana-veo3",
    });
  } catch (error) {
    console.error("🍌🎬 Banana+VEO3 API error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get("id");

    if (!chatId) {
      return NextResponse.json({ error: "Chat ID required" }, { status: 400 });
    }

    const chat = await getChatById({ id: chatId });
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    if (chat.visibility === "private" && chat.userId !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const messages = await getMessagesByChatId({ id: chatId });

    return NextResponse.json({
      success: true,
      chat,
      messages,
      technology: "banana-veo3",
    });
  } catch (error) {
    console.error("🍌🎬 Banana+VEO3 GET error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
