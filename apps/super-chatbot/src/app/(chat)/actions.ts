'use server';

import type { UIMessage } from 'ai';
import { cookies } from 'next/headers';
import {
  deleteMessagesByChatIdAfterTimestamp,
  getMessageById,
  updateChatVisiblityById,
} from '@/lib/db/queries';
import type { VisibilityType } from '@/components/shared/visibility-selector';

export async function saveChatModelAsCookie(model: string) {
  const cookieStore = await cookies();
  cookieStore.set('chat-model', model);
}

export async function generateTitleFromUserMessage({
  message,
}: {
  message: UIMessage;
}) {
  // Логируем структуру сообщения для отладки
  console.log('🔍 generateTitleFromUserMessage - message structure:', {
    hasMessage: !!message,
    messageKeys: message ? Object.keys(message) : [],
    hasContent: !!(message as any)?.content,
    hasParts: !!(message as any)?.parts,
    partsLength: (message as any)?.parts?.length || 0,
  });

  // Безопасно извлекаем текст сообщения
  const messageText =
    (message as any)?.content || (message as any)?.parts?.[0]?.text || '';

  // Если нет текста, но есть изображения, создаем заголовок на основе этого
  const hasImages = (message as any)?.experimental_attachments?.some(
    (att: any) => att.contentType?.startsWith('image/'),
  );

  if (!messageText && hasImages) {
    return 'Image Chat';
  }

  if (!messageText) {
    console.warn('⚠️ No text found in message for title generation');
    return 'New Chat';
  }

  // TEMPORARY FIX: Return simple title based on first words until AI SDK v5 is installed
  // TODO: Re-enable AI title generation after upgrading to AI SDK v5
  const words = messageText.trim().split(/\s+/).slice(0, 8).join(' ');
  const title = words.length > 50 ? `${words.substring(0, 50)}...` : words;
  return title || 'New Chat';

  /* COMMENTED OUT UNTIL AI SDK v5 IS INSTALLED:
  const { text: title } = await generateText({
    model: myProvider.languageModel('title-model'),
    system: `\n
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`,
    prompt: messageText,
  });

  return title;
  */
}

export async function deleteTrailingMessages({ id }: { id: string }) {
  const [message] = await getMessageById({ id });

  await deleteMessagesByChatIdAfterTimestamp({
    chatId: message?.chatId ?? '',
    timestamp: message?.createdAt ?? new Date(),
  });
}

export async function updateChatVisibility({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: VisibilityType;
}) {
  await updateChatVisiblityById({ chatId, visibility });
}
