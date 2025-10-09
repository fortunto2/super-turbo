import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { streamText } from 'ai';
import { myProvider } from '@/lib/ai/providers';
import {
  bananaInferenceTool,
  listBananaModelsTool,
} from '@/lib/ai/tools/banana-inference';
import {
  createVeo3VideoTool,
  checkVeo3VideoStatusTool,
  generateVeo3IdeasTool,
} from '@/lib/ai/tools/veo3-video';
import {
  getChatById,
  getMessagesByChatId,
  saveChat,
  saveMessages,
} from '@/lib/db/queries';
import { generateUUID } from '@/lib/utils';
import { generateTitleFromUserMessage } from '../../actions';
import { convertDBMessagesToUIMessages } from '@/lib/types/message-conversion';

export const maxDuration = 60;

// Продвинутый промпт для Banana + VEO3 с инструментами
const advancedBananaVeo3SystemPrompt = `Ты - эксперт по Banana GPU Inference и VEO3 Video Generation с доступом к реальным API.

🍌 **BANANA GPU INFERENCE:**
- У тебя есть доступ к реальным Banana API через инструменты
- Можешь запускать inference на различных моделях
- Можешь получать список доступных моделей
- Можешь анализировать метрики производительности

🎬 **VEO3 VIDEO GENERATION:**
- У тебя есть доступ к реальным VEO3 API через инструменты
- Можешь создавать видео из текстовых описаний
- Можешь проверять статус создания видео
- Можешь генерировать идеи для видео

🚀 **ДОСТУПНЫЕ ИНСТРУМЕНТЫ:**
1. **bananaInference** - запуск inference на Banana
2. **listBananaModels** - получение списка моделей Banana
3. **createVeo3Video** - создание видео с VEO3
4. **checkVeo3VideoStatus** - проверка статуса видео
5. **generateVeo3Ideas** - генерация идей для видео

📋 **ПРАКТИЧЕСКИЕ ЗАДАЧИ:**
- "Запусти inference на Banana для анализа текста"
- "Создай видео про AI технологии с VEO3"
- "Покажи доступные модели Banana"
- "Проверь статус создания видео"
- "Сгенерируй идеи для видео про роботов"

🎯 **СТИЛЬ РАБОТЫ:**
- Используй инструменты для реальных API вызовов
- Предоставляй конкретные результаты и метрики
- Объясняй каждый шаг процесса
- Показывай практические примеры использования
- Давай рекомендации по оптимизации

Всегда используй доступные инструменты для выполнения реальных задач с Banana и VEO3!`;

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      id,
      message,
      selectedVisibilityType = 'private',
    } = await request.json();

    if (!id || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
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
    const allMessages = convertDBMessagesToUIMessages(previousMessages);

    // Добавляем новое сообщение пользователя
    allMessages.push({
      id: message.id || generateUUID(),
      role: 'user',
      content: message.content || message.parts?.[0]?.text || '',
      parts: [
        {
          text: message.content || message.parts?.[0]?.text || '',
          type: 'text',
        },
      ],
      createdAt: new Date(),
    });

    console.log(
      '🍌🎬 Advanced Banana+VEO3 API with tools:',
      allMessages.length,
      'messages',
    );

    // Используем AI SDK с инструментами
    const result = streamText({
      model: myProvider.languageModel('gemini-2.5-flash-lite'),
      system: advancedBananaVeo3SystemPrompt,
      messages: allMessages,
      tools: {
        bananaInference: bananaInferenceTool,
        listBananaModels: listBananaModelsTool,
        createVeo3Video: createVeo3VideoTool,
        checkVeo3VideoStatus: checkVeo3VideoStatusTool,
        generateVeo3Ideas: generateVeo3IdeasTool,
      },
      experimental_generateMessageId: generateUUID,
      onFinish: async ({ response }) => {
        console.log('🍌🎬 Advanced Banana+VEO3 response finished');

        if (session.user?.id) {
          try {
            const assistantMessages = response.messages.filter(
              (msg) => msg.role === 'assistant',
            );

            for (const assistantMessage of assistantMessages) {
              await saveMessages({
                messages: [
                  {
                    chatId: id,
                    id: assistantMessage.id,
                    role: 'assistant',
                    parts: (assistantMessage as any)?.parts,
                    attachments:
                      (assistantMessage as any)?.experimental_attachments ?? [],
                    createdAt: new Date(),
                  },
                ],
              });
            }

            console.log(
              '🍌🎬 Assistant messages saved:',
              assistantMessages.length,
            );
          } catch (error) {
            console.error('🍌🎬 Failed to save assistant messages:', error);
          }
        }
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('🍌🎬 Advanced Banana+VEO3 API error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('id');

    if (!chatId) {
      return NextResponse.json({ error: 'Chat ID required' }, { status: 400 });
    }

    const chat = await getChatById({ id: chatId });
    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    if (chat.visibility === 'private' && chat.userId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const messages = await getMessagesByChatId({ id: chatId });

    return NextResponse.json({
      success: true,
      chat,
      messages,
      technology: 'banana-veo3-advanced',
    });
  } catch (error) {
    console.error('🍌🎬 Advanced Banana+VEO3 GET error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
