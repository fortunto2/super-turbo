import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import {
  callGeminiDirect,
  convertToGeminiMessages,
} from '@/lib/ai/gemini-direct';
import {
  getChatById,
  getMessagesByChatId,
  saveChat,
  saveMessages,
} from '@/lib/db/queries';
import { generateUUID } from '@/lib/utils';
import { generateTitleFromUserMessage } from '../../actions';

export const maxDuration = 60;

// Specialized prompt for Banana + VEO3
const bananaVeo3SystemPrompt = `You are a specialized AI assistant for working with Banana and VEO3 technologies.

🍌 **BANANA :**
- Optimized for running AI models on GPU
- Automatic resource scaling
- Support for various frameworks (PyTorch, TensorFlow, etc.)
- API for running inference tasks

🎬 **VEO3 VIDEO GENERATION:**
- VEO3 is a Google Cloud service for video generation
- Creating videos from text descriptions
- High quality and realism
- Support for various styles and genres
- Integration with Google Cloud Platform

🚀 **YOUR CAPABILITIES:**
1. **Analysis and Planning** - help with solution architecture
2. **Optimization** - suggest best practices for Banana and VEO3
3. **Integration** - help with combining Banana + VEO3 in projects
4. **Monitoring** - explain performance metrics
5. **Troubleshooting** - solve deployment issues

📋 **EXAMPLE TASKS:**
- "How to run inference on Banana for video processing?"
- "Integrate VEO3 with Banana for real-time generation"
- "Optimize GPU performance on Banana"
- "Create pipeline: Banana → VEO3 → result"

🎯 **WORKING STYLE:**
- Technically accurate answers
- Practical code examples
- Explanation of architectural solutions
- Optimization suggestions
- Ready-to-use integration solutions

Always focus on practical application of Banana and VEO3 technologies.`;

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

    const apiKey = process.env.VERTEX_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'GOOGLE_AI_API_KEY not configured',
        },
        { status: 500 },
      );
    }

    // Проверяем или создаем чат
    const chat = await getChatById({ id });
    if (!chat) {
      const baseTitle = await generateTitleFromUserMessage({ message });
      const title = `🍌 Banana VEO3: ${baseTitle}`;
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
      role: 'user',
      parts: [{ text: bananaVeo3SystemPrompt }],
    });

    console.log(
      '🍌🎬 Calling Banana+VEO3 API with messages:',
      geminiMessages.length,
    );

    // Вызываем Gemini API с специализированным промптом
    const response = await callGeminiDirect(geminiMessages, apiKey, {
      temperature: 0.7,
      maxTokens: 1500, // Больше токенов для технических ответов
    });

    console.log(
      '🍌🎬 Banana+VEO3 API response received:',
      response.length,
      'characters',
    );

    // Сохраняем сообщения в базу данных
    const userMessageId = message.id || generateUUID();
    const assistantMessageId = generateUUID();

    await saveMessages({
      messages: [
        {
          chatId: id,
          id: userMessageId,
          role: 'user',
          parts: [{ text: message.content || message.parts?.[0]?.text || '' }],
          attachments: message.attachments || [],
          createdAt: new Date(),
        },
        {
          chatId: id,
          id: assistantMessageId,
          role: 'assistant',
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
      technology: 'banana-veo3',
    });
  } catch (error) {
    console.error('🍌🎬 Banana+VEO3 API error:', error);

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
      technology: 'banana-veo3',
    });
  } catch (error) {
    console.error('🍌🎬 Banana+VEO3 GET error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
