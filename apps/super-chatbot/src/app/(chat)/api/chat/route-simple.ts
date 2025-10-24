import { streamText } from 'ai';
import { NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { myProvider } from '@/lib/ai/providers';
import { systemPrompt } from '@/lib/ai/prompts';
import { withMonitoring } from '@/lib/monitoring/simple-monitor';
import {
  getChatById,
  getMessagesByChatId,
  saveMessages,
} from '@/lib/db/queries';
import { convertDBMessagesToUIMessages } from '@/lib/types/message-conversion';

// Normalize message function from the original code
function normalizeMessage(message: any) {
  return {
    ...message,
    content: message.content || message.parts?.[0]?.text || '',
    parts: message.parts || [{ type: 'text', text: message.content || '' }],
  };
}

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

export const POST = withMonitoring(async (request: Request) => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { messages: rawMessages, id: chatId } = body;

    if (!rawMessages || !Array.isArray(rawMessages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 },
      );
    }

    // Get chat info

    const chat = await getChatById({ id: chatId });

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    // Get previous messages from database
    const previousMessages = await getMessagesByChatId({ id: chatId });

    // Convert to UI format and add new messages
    const allMessages = [
      ...convertDBMessagesToUIMessages(previousMessages),
      ...rawMessages.map(normalizeMessage),
    ];

    // Save user messages to database
    const userMessages = rawMessages.filter((msg: any) => msg.role === 'user');
    if (userMessages.length > 0) {
      await saveMessages({
        messages: userMessages.map((msg: any) => ({
          chatId,
          id: msg.id || Date.now().toString(),
          role: msg.role,
          parts: msg.parts || [{ type: 'text', text: msg.content }],
          attachments: msg.experimental_attachments || [],
          createdAt: new Date(),
        })),
      });
    }

    // Generate response using AI SDK v5
    const result = streamText({
      model: myProvider.languageModel('chat-model'),
      system: systemPrompt({
        selectedChatModel: 'chat-model',
        requestHints: { latitude: '0', longitude: '0', city: '', country: '' },
      }),
      messages: allMessages,
      temperature: 0.7,
      onFinish: async ({ response }) => {
        try {
          // Save assistant messages to database
          const assistantMessages = response.messages.filter(
            (msg: any) => msg.role === 'assistant',
          );
          if (assistantMessages.length > 0) {
            await saveMessages({
              messages: assistantMessages.map((msg: any) => ({
                chatId,
                id: msg.id || Date.now().toString(),
                role: msg.role,
                parts: msg.parts || [{ type: 'text', text: msg.content }],
                attachments: msg.experimental_attachments || [],
                createdAt: new Date(),
              })),
            });
          }
        } catch (error) {
          console.error('Error saving assistant messages:', error);
        }
      },
      onError: (error) => {
        console.error('Stream error:', error);
      },
    });

    // Return the stream response
    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
});
