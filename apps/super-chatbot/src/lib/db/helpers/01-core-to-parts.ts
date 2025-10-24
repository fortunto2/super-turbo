import postgres from 'postgres';
import {
  chat,
  message,
  type MessageDeprecated,
  messageDeprecated,
  vote,
  voteDeprecated,
} from '../schema';
import { drizzle } from 'drizzle-orm/postgres-js';
import { inArray } from 'drizzle-orm';
import type { UIMessage } from 'ai';
// appendResponseMessages was removed in AI SDK v5 - this migration script may need updates

const databaseUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('Database URL is not set (POSTGRES_URL or DATABASE_URL)');
}

const client = postgres(databaseUrl, { ssl: 'require' });
const db = drizzle(client);

const BATCH_SIZE = 100; // Process 100 chats at a time
const INSERT_BATCH_SIZE = 1000; // Insert 1000 messages at a time

type NewMessageInsert = {
  id: string;
  chatId: string;
  parts: any[];
  role: string;
  attachments: any[];
  createdAt: Date;
};

type NewVoteInsert = {
  messageId: string;
  chatId: string;
  isUpvoted: boolean;
};

interface MessageDeprecatedContentPart {
  type: string;
  content: unknown;
}

function getMessageRank(message: MessageDeprecated): number {
  if (
    message.role === 'assistant' &&
    (message.content as MessageDeprecatedContentPart[]).some(
      (contentPart) => contentPart.type === 'tool-call',
    )
  ) {
    return 0;
  }

  if (
    message.role === 'tool' &&
    (message.content as MessageDeprecatedContentPart[]).some(
      (contentPart) => contentPart.type === 'tool-result',
    )
  ) {
    return 1;
  }

  if (message.role === 'assistant') {
    return 2;
  }

  return 3;
}

function dedupeParts<T extends { type: string; [k: string]: any }>(
  parts: T[],
): T[] {
  const seen = new Set<string>();
  return parts.filter((p) => {
    const key = `${p.type}|${JSON.stringify(p.content ?? p)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sanitizeParts<T extends { type: string; [k: string]: any }>(
  parts: T[],
): T[] {
  return parts.filter(
    (part) => !(part.type === 'reasoning' && part.reasoning === 'undefined'),
  );
}

async function migrateMessages() {
  const chats = await db.select().from(chat);

  let processedCount = 0;

  for (let i = 0; i < chats.length; i += BATCH_SIZE) {
    const chatBatch = chats.slice(i, i + BATCH_SIZE);
    const chatIds = chatBatch.map((chat) => chat.id);

    const allMessages = await db
      .select()
      .from(messageDeprecated)
      .where(inArray(messageDeprecated.chatId, chatIds));

    const allVotes = await db
      .select()
      .from(voteDeprecated)
      .where(inArray(voteDeprecated.chatId, chatIds));

    const newMessagesToInsert: NewMessageInsert[] = [];
    const newVotesToInsert: NewVoteInsert[] = [];

    for (const chat of chatBatch) {
      processedCount++;
      console.info(`Processed ${processedCount}/${chats.length} chats`);

      const messages = allMessages
        .filter((message) => message.chatId === chat.id)
        .sort((a, b) => {
          const differenceInTime =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          if (differenceInTime !== 0) return differenceInTime;

          return getMessageRank(a) - getMessageRank(b);
        });

      const votes = allVotes.filter((v) => v.chatId === chat.id);

      const messageSection: Array<UIMessage> = [];
      const messageSections: Array<Array<UIMessage>> = [];

      for (const message of messages) {
        const { role } = message;

        if (role === 'user' && messageSection.length > 0) {
          messageSections.push([...messageSection]);
          messageSection.length = 0;
        }

        // Database migration script - temporary type conversion
        messageSection.push(message as any);
      }

      if (messageSection.length > 0) {
        messageSections.push([...messageSection]);
      }

      for (const section of messageSections) {
        const [userMessage, ...assistantMessages] = section;

        const [firstAssistantMessage] = assistantMessages;

        try {
          // TODO: appendResponseMessages was removed in AI SDK v5
          // This migration script needs to be updated or removed
          // For now, we'll skip this migration step
          const uiSection = userMessage
            ? [userMessage, ...assistantMessages]
            : assistantMessages;

          const projectedUISection = uiSection
            .map((message: any) => {
              if (message.role === 'user') {
                return {
                  id: message.id,
                  chatId: chat.id,
                  parts: [{ type: 'text', text: message.content || '' }],
                  role: message.role,
                  createdAt: message.createdAt,
                  attachments: [],
                } as NewMessageInsert;
              } else if (message.role === 'assistant') {
                const cleanParts = sanitizeParts(
                  dedupeParts(message.parts || []),
                );

                return {
                  id: message.id,
                  chatId: chat.id,
                  parts: cleanParts,
                  role: message.role,
                  createdAt: message.createdAt,
                  attachments: [],
                } as NewMessageInsert;
              }
              return null;
            })
            .filter((msg): msg is NewMessageInsert => msg !== null);

          for (const msg of projectedUISection) {
            newMessagesToInsert.push(msg);

            if (msg.role === 'assistant') {
              const voteByMessage = votes.find((v) => v.messageId === msg.id);
              if (voteByMessage) {
                newVotesToInsert.push({
                  messageId: msg.id,
                  chatId: msg.chatId,
                  isUpvoted: voteByMessage.isUpvoted,
                });
              }
            }
          }
        } catch (error) {
          console.error(`Error processing chat ${chat.id}: ${error}`);
        }
      }
    }

    for (let j = 0; j < newMessagesToInsert.length; j += INSERT_BATCH_SIZE) {
      const messageBatch = newMessagesToInsert.slice(j, j + INSERT_BATCH_SIZE);
      if (messageBatch.length > 0) {
        const validMessageBatch = messageBatch.map((msg) => ({
          id: msg.id,
          chatId: msg.chatId,
          parts: msg.parts,
          role: msg.role,
          attachments: msg.attachments,
          createdAt: msg.createdAt,
        }));

        await db.insert(message).values(validMessageBatch);
      }
    }

    for (let j = 0; j < newVotesToInsert.length; j += INSERT_BATCH_SIZE) {
      const voteBatch = newVotesToInsert.slice(j, j + INSERT_BATCH_SIZE);
      if (voteBatch.length > 0) {
        await db.insert(vote).values(voteBatch);
      }
    }
  }

  console.info(`Migration completed: ${processedCount} chats processed`);
}

migrateMessages()
  .then(() => {
    console.info('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
