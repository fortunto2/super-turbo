import {
  getChatById,
  saveChat,
  saveMessages,
  getOrCreateOAuthUser,
  type User,
  type Chat,
} from '@/lib/db/queries';
import { generateTitleFromUserMessage } from '@/app/(chat)/actions';
import type { VisibilityType } from '@/components/shared/visibility-selector';
import { normalizeUIMessage, ensureMessageHasUUID } from './message-utils';

export interface EnsureChatParams {
  chatId: string;
  userId: string;
  userEmail: string;
  firstMessage: any;
  visibility: VisibilityType;
}

export interface SaveMessageParams {
  chatId: string;
  message: any;
  attachments?: Array<{
    url: string;
    contentType?: string;
    name?: string;
  }>;
}

function isForeignKeyError(error: Error): boolean {
  return (
    error.message.includes('foreign key constraint') &&
    (error.message.includes('_userId_') ||
      error.message.includes('_chatId_') ||
      error.message.includes('Key (userId)') ||
      error.message.includes('Key (chatId)'))
  );
}

async function handleForeignKeyRecovery(params: {
  userId: string;
  userEmail: string;
}): Promise<void> {
  try {
    await getOrCreateOAuthUser(params.userId, params.userEmail);
    console.log(`✅ Auto-created user during FK recovery: ${params.userId}`);
  } catch (recoveryError) {
    console.error('❌ Failed to auto-create user during recovery:', recoveryError);
    throw recoveryError;
  }
}

export async function ensureUserExists(
  userId: string,
  email: string
): Promise<User> {
  try {
    const user = await getOrCreateOAuthUser(userId, email);
    return user;
  } catch (error) {
    console.error('Failed to ensure user exists:', error);
    throw error;
  }
}

export async function ensureChatExists(
  params: EnsureChatParams
): Promise<Chat> {
  const { chatId, userId, userEmail, firstMessage, visibility } = params;

  const existingChat = await getChatById({ id: chatId });

  if (existingChat) {
    return existingChat;
  }

  try {
    await getOrCreateOAuthUser(userId, userEmail);

    const normalizedMessage = firstMessage
      ? normalizeUIMessage(firstMessage)
      : undefined;

    const title = normalizedMessage
      ? await generateTitleFromUserMessage({ message: normalizedMessage })
      : 'New Chat';

    await saveChat({
      id: chatId,
      userId,
      title,
      visibility,
    });

    const newChat = await getChatById({ id: chatId });

    if (!newChat) {
      throw new Error('Failed to create chat');
    }

    return newChat;
  } catch (error) {
    if (error instanceof Error && isForeignKeyError(error)) {
      console.log(
        `🔄 FK error detected, attempting recovery for user: ${userId}`
      );

      await handleForeignKeyRecovery({ userId, userEmail });

      const normalizedMessage = firstMessage
        ? normalizeUIMessage(firstMessage)
        : undefined;

      const title = normalizedMessage
        ? await generateTitleFromUserMessage({ message: normalizedMessage })
        : 'New Chat';

      await saveChat({
        id: chatId,
        userId,
        title,
        visibility,
      });

      const recoveredChat = await getChatById({ id: chatId });

      if (!recoveredChat) {
        throw new Error('Failed to create chat after FK recovery');
      }

      console.log(`✅ Chat created successfully after FK recovery: ${chatId}`);
      return recoveredChat;
    }

    console.error('Failed to ensure chat exists:', error);
    throw error;
  }
}

export async function saveUserMessage(
  params: SaveMessageParams
): Promise<void> {
  const { chatId, message, attachments } = params;

  const normalizedMessage = normalizeUIMessage(message);
  const messageWithUUID = ensureMessageHasUUID(normalizedMessage);

  const parts = normalizedMessage.parts || [
    { type: 'text', text: normalizedMessage.content },
  ];

  const messageAttachments =
    attachments || normalizedMessage.experimental_attachments || [];

  try {
    await saveMessages({
      messages: [
        {
          chatId,
          id: messageWithUUID.id,
          role: 'user',
          parts,
          attachments: messageAttachments,
          createdAt: normalizedMessage.createdAt || new Date(),
        },
      ],
    });
  } catch (error) {
    if (error instanceof Error && isForeignKeyError(error)) {
      console.log(
        `🔄 FK error while saving message, ensuring chat exists: ${chatId}`
      );

      try {
        const existingChat = await getChatById({ id: chatId });

        if (!existingChat) {
          console.log('Chat not found, cannot recover from FK error');
        }

        await saveMessages({
          messages: [
            {
              chatId,
              id: messageWithUUID.id,
              role: 'user',
              parts,
              attachments: messageAttachments,
              createdAt: normalizedMessage.createdAt || new Date(),
            },
          ],
        });

        console.log(`✅ Message saved after FK recovery`);
      } catch (recoveryError) {
        console.error('Failed to save message after recovery:', recoveryError);
      }
    } else {
      console.error('Failed to save user message:', error);
    }
  }
}
