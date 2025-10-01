import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import {
  callGeminiDirect,
  convertToGeminiMessages,
} from "@/lib/ai/gemini-direct";
import {
  getChatById,
  getMessagesByChatId,
  saveChat,
  saveMessages,
} from "@/lib/db/queries";
import { generateUUID } from "@/lib/utils";
import { generateTitleFromUserMessage } from "../../actions";

export const maxDuration = 60;

// Специальный промпт для Gemini + VEO3 чата
const geminiSystemPrompt = `Ты - специализированный AI ассистент для работы с Gemini 2.5 Flash Lite и VEO3. 

Твои основные возможности:
- Быстрые и точные ответы с помощью Gemini 2.5 Flash Lite
- Генерация видео с помощью VEO3 (Google Cloud)
- Генерация изображений с помощью различных моделей
- Работа с бананой (Banana) для дополнительных AI задач

Особенности работы:
- Всегда используй Gemini 2.5 Flash Lite для текстовых ответов
- Для видео генерации используй VEO3 когда это возможно
- Будь быстрым и эффективным в ответах
- Предлагай создание видео и изображений когда это уместно

Ты работаешь в специальном режиме для Gemini + VEO3, поэтому фокусируйся на этих технологиях.`;

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
    const chat = await getChatById({ id });
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

    // Добавляем системный промпт
    geminiMessages.unshift({
      role: "user",
      parts: [{ text: geminiSystemPrompt }],
    });

    console.log(
      "🔍 Calling Gemini API directly with messages:",
      geminiMessages.length
    );

    // Вызываем Gemini API
    const response = await callGeminiDirect(geminiMessages, apiKey, {
      temperature: 0.7,
      maxOutputTokens: 1000,
    });

    console.log(
      "🔍 Gemini API response received:",
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
    });
  } catch (error) {
    console.error("Gemini simple API error:", error);

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
    });
  } catch (error) {
    console.error("Gemini simple GET error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
