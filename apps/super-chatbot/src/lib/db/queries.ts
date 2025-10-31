import "server-only";

import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  inArray,
  lt,
  or,
  sql,
  ilike,
  type SQL,
} from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import {
  user,
  chat,
  type User,
  document,
  type Suggestion,
  suggestion,
  message,
  vote,
  type DBMessage,
  type Chat,
  stream,
} from "./schema";
import type { ArtifactKind } from "@/components/artifacts/artifact";
import { generateUUID } from "../utils";
import { generateHashedPassword } from "./utils";
import type { VisibilityType } from "@/components/shared/visibility-selector";

// Re-export types for external use
export type { User, Chat };

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle

// Lazy DB initialization to avoid import-time env access in RSC
let __db: ReturnType<typeof drizzle> | null = null;
let __client: any | null = null;
function __ensureDb() {
  if (!__db) {
    let url = process.env.POSTGRES_URL || process.env.DATABASE_URL;

    // Fallback для разработки - используем хардкодированный URL если переменные не загружены
    if (!url || url.length === 0) {
      url =
        "postgresql://neondb_owner:npg_u78sbCLzfEoe@ep-green-glade-a49gpc57-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";
      console.warn("Using fallback database URL for development");
    }

    __client = postgres(url, { ssl: "require" });
    __db = drizzle(__client);
  }
  return __db;
}

// Real db accessor function to keep types
const db = () => __ensureDb();

export async function getUser(email: string): Promise<Array<User>> {
  try {
    return await db().select().from(user).where(eq(user.email, email));
  } catch (error) {
    console.error("Failed to get user from database");
    throw error;
  }
}

/**
 * Creates or gets an OAuth user
 * Used to create accounts for users authenticated through Auth0
 */
export async function getOrCreateOAuthUser(
  userId: string,
  email: string
): Promise<User> {
  try {
    // Сначала проверяем, существует ли пользователь с этим ID
    const [existingUserById] = await db()
      .select()
      .from(user)
      .where(eq(user.id, userId));

    if (existingUserById) {
      return existingUserById;
    }

    // Затем проверяем, существует ли пользователь с этим email
    const existingUsers = await getUser(email);
    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      if (!existingUser) {
        throw new Error("User not found in existing users array");
      }

      // Если пользователь найден по email, возвращаем его, даже если ID отличается
      console.log(
        `Found user with email ${email} but different ID (${existingUser.id} vs ${userId}). Using existing user ID.`
      );
      return existingUser;
    }

    // Если пользователь не найден, создаем нового
    console.log(
      `User not found, creating new user with ID: ${userId} and email: ${email}`
    );

    try {
      // Используем отдельное соединение для гарантированного создания
      const createUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
      if (!createUrl) {
        throw new Error(
          "Database URL is not configured. Set POSTGRES_URL or DATABASE_URL in environment."
        );
      }
      const createClient = postgres(createUrl, { max: 1, ssl: "require" });
      const createDb = drizzle(createClient);

      try {
        // Создаем пользователя
        const [newUser] = await createDb
          .insert(user)
          .values({
            id: userId,
            email,
            password: null, // OAuth users don't have a password
          })
          .returning();

        if (!newUser) {
          throw new Error("Failed to create OAuth user: No user returned");
        }

        console.log(
          `Created new OAuth user with ID: ${userId} and email: ${email}`
        );
        return newUser;
      } finally {
        // Закрываем соединение
        await createClient
          .end()
          .catch((e) => console.error("Error closing create client:", e));
      }
    } catch (createError) {
      console.error(`Failed to create user with ID ${userId}:`, createError);

      // Последняя попытка - найти пользователя по ID снова
      // (возможно, он был создан параллельным запросом)
      const [lastChanceUser] = await db()
        .select()
        .from(user)
        .where(eq(user.id, userId));

      if (lastChanceUser) {
        console.log(`Found user with ID ${userId} on second check`);
        return lastChanceUser;
      }

      // Если до сих пор не найден, попробуем найти по email снова и вернуть его
      const [lastChanceUserByEmail] = await db()
        .select()
        .from(user)
        .where(eq(user.email, email));

      if (lastChanceUserByEmail) {
        console.log(
          `Found user by email ${email} with ID ${lastChanceUserByEmail.id}`
        );
        return lastChanceUserByEmail;
      }

      throw createError;
    }
  } catch (error) {
    console.error("Failed to get or create OAuth user:", error);
    throw error;
  }
}

export async function createUser(email: string, password: string) {
  const hashedPassword = generateHashedPassword(password);

  try {
    return await db().insert(user).values({ email, password: hashedPassword });
  } catch (error) {
    console.error("Failed to create user in database");
    throw error;
  }
}

export async function createGuestUser(sessionId?: string) {
  const email = `guest-${Date.now()}`;
  const password = generateHashedPassword(generateUUID());

  try {
    return await db()
      .insert(user)
      .values({
        email,
        password,
        sessionId: sessionId || null,
      })
      .returning({
        id: user.id,
        email: user.email,
        sessionId: user.sessionId,
      });
  } catch (error) {
    console.error("Failed to create guest user in database");
    throw error;
  }
}

export async function getGuestUserById(userId: string) {
  try {
    const users = await db()
      .select({
        id: user.id,
        email: user.email,
        sessionId: user.sessionId,
      })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (users.length === 0) {
      return null;
    }

    const [userData] = users;
    // Проверяем, что это действительно гость
    if (!userData?.email?.includes("guest")) {
      return null;
    }

    return userData;
  } catch (error) {
    console.error("Failed to get guest user by ID:", error);
    return null;
  }
}

export async function getGuestUserBySessionId(sessionId: string) {
  try {
    const users = await db()
      .select({
        id: user.id,
        email: user.email,
        sessionId: user.sessionId,
      })
      .from(user)
      .where(eq(user.sessionId, sessionId))
      .limit(1);

    if (users.length === 0) {
      return null;
    }

    const [userData] = users;
    // Проверяем, что это действительно гость
    if (!userData?.email?.includes("guest")) {
      return null;
    }

    return userData;
  } catch (error) {
    console.error("Failed to get guest user by session ID:", error);
    return null;
  }
}

export async function saveChat({
  id,
  userId,
  title,
  visibility,
}: {
  id: string;
  userId: string;
  title: string;
  visibility: VisibilityType;
}) {
  try {
    return await db().insert(chat).values({
      id,
      createdAt: new Date(),
      userId,
      title,
      visibility,
    });
  } catch (error) {
    console.error("Failed to save chat in database");
    throw error;
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    await db().delete(vote).where(eq(vote.chatId, id));
    await db().delete(message).where(eq(message.chatId, id));
    await db().delete(stream).where(eq(stream.chatId, id));

    const [chatsDeleted] = await db()
      .delete(chat)
      .where(eq(chat.id, id))
      .returning();
    return chatsDeleted;
  } catch (error) {
    console.error("Failed to delete chat by id from database");
    throw error;
  }
}

export async function getChatsByUserId({
  id,
  limit,
  startingAfter,
  endingBefore,
}: {
  id: string;
  limit: number;
  startingAfter: string | null;
  endingBefore: string | null;
}) {
  try {
    const extendedLimit = limit + 1;

    const query = (whereCondition?: SQL<any>) =>
      db()
        .select()
        .from(chat)
        .where(
          whereCondition
            ? and(whereCondition, eq(chat.userId, id))
            : eq(chat.userId, id)
        )
        .orderBy(desc(chat.createdAt))
        .limit(extendedLimit);

    let filteredChats: Array<Chat> = [];

    if (startingAfter) {
      const [selectedChat] = await db()
        .select()
        .from(chat)
        .where(eq(chat.id, startingAfter))
        .limit(1);

      if (!selectedChat) {
        throw new Error(`Chat with id ${startingAfter} not found`);
      }

      filteredChats = await query(gt(chat.createdAt, selectedChat.createdAt));
    } else if (endingBefore) {
      const [selectedChat] = await db()
        .select()
        .from(chat)
        .where(eq(chat.id, endingBefore))
        .limit(1);

      if (!selectedChat) {
        throw new Error(`Chat with id ${endingBefore} not found`);
      }

      filteredChats = await query(lt(chat.createdAt, selectedChat.createdAt));
    } else {
      filteredChats = await query();
    }

    const hasMore = filteredChats.length > limit;

    return {
      chats: hasMore ? filteredChats.slice(0, limit) : filteredChats,
      hasMore,
    };
  } catch (error) {
    console.error("Failed to get chats by user from database");
    throw error;
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db()
      .select()
      .from(chat)
      .where(eq(chat.id, id));
    return selectedChat;
  } catch (error) {
    console.error("Failed to get chat by id from database");
    throw error;
  }
}

export async function saveMessages({
  messages,
}: {
  messages: Array<DBMessage>;
}) {
  if (messages.length === 0) {
    return;
  }

  try {
    // Make the insert idempotent. If a message with the same ID already exists, do nothing.
    // This resolves a race condition where both the client and server might try to save the same message.
    return await db().insert(message).values(messages).onConflictDoNothing();
  } catch (error) {
    console.error("Failed to save messages in database", error);
    throw error;
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await db()
      .select()
      .from(message)
      .where(eq(message.chatId, id))
      .orderBy(asc(message.createdAt));
  } catch (error) {
    console.error("Failed to get messages by chat id from database", error);
    throw error;
  }
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: "up" | "down";
}) {
  try {
    const [existingVote] = await db()
      .select()
      .from(vote)
      .where(and(eq(vote.messageId, messageId)));

    if (existingVote) {
      return await db()
        .update(vote)
        .set({ isUpvoted: type === "up" })
        .where(and(eq(vote.messageId, messageId), eq(vote.chatId, chatId)));
    }
    return await db()
      .insert(vote)
      .values({
        chatId,
        messageId,
        isUpvoted: type === "up",
      });
  } catch (error) {
    console.error("Failed to upvote message in database", error);
    throw error;
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  try {
    return await db().select().from(vote).where(eq(vote.chatId, id));
  } catch (error) {
    console.error("Failed to get votes by chat id from database", error);
    throw error;
  }
}

export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
  thumbnailUrl,
  visibility,
}: {
  id: string;
  title: string;
  kind: ArtifactKind;
  content: string;
  userId: string;
  thumbnailUrl?: string | null;
  visibility?: "public" | "private";
}) {
  try {
    // Set default visibility based on kind
    const defaultVisibility =
      visibility || (kind === "script" ? "public" : "private");

    // Check if document with this ID already exists
    const existingDocs = await db()
      .select()
      .from(document)
      .where(eq(document.id, id))
      .limit(1);

    if (existingDocs.length > 0) {
      // Update existing document
      console.log("📄 Document already exists, updating:", id);
      return await db()
        .update(document)
        .set({
          title,
          content,
          thumbnailUrl: thumbnailUrl ?? null,
          visibility: defaultVisibility,
        })
        .where(eq(document.id, id))
        .returning();
    } else {
      // Insert new document
      console.log("📄 Creating new document:", id);
      return await db()
        .insert(document)
        .values({
          id,
          title,
          kind,
          content,
          userId,
          thumbnailUrl: thumbnailUrl ?? null,
          visibility: defaultVisibility,
          createdAt: new Date(),
        })
        .returning();
    }
  } catch (error) {
    console.error("Failed to save document in database");
    throw error;
  }
}

export async function getDocumentsById({ id }: { id: string }) {
  try {
    const documents = await db()
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(asc(document.createdAt));

    return documents;
  } catch (error) {
    console.error("Failed to get document by id from database");
    throw error;
  }
}

export async function getDocumentById({ id }: { id: string }) {
  try {
    const [selectedDocument] = await db()
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(desc(document.createdAt));

    return selectedDocument;
  } catch (error) {
    console.error("Failed to get document by id from database");
    throw error;
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  try {
    await db()
      .delete(suggestion)
      .where(
        and(
          eq(suggestion.documentId, id),
          gt(suggestion.documentCreatedAt, timestamp)
        )
      );

    return await db()
      .delete(document)
      .where(and(eq(document.id, id), gt(document.createdAt, timestamp)))
      .returning();
  } catch (error) {
    console.error(
      "Failed to delete documents by id after timestamp from database"
    );
    throw error;
  }
}

export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Array<Suggestion>;
}) {
  try {
    return await db().insert(suggestion).values(suggestions);
  } catch (error) {
    console.error("Failed to save suggestions in database");
    throw error;
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  try {
    return await db()
      .select()
      .from(suggestion)
      .where(and(eq(suggestion.documentId, documentId)));
  } catch (error) {
    console.error(
      "Failed to get suggestions by document version from database"
    );
    throw error;
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    return await db().select().from(message).where(eq(message.id, id));
  } catch (error) {
    console.error("Failed to get message by id from database");
    throw error;
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    const messagesToDelete = await db()
      .select({ id: message.id })
      .from(message)
      .where(
        and(eq(message.chatId, chatId), gte(message.createdAt, timestamp))
      );

    const messageIds = messagesToDelete.map((message) => message.id);

    if (messageIds.length > 0) {
      await db()
        .delete(vote)
        .where(
          and(eq(vote.chatId, chatId), inArray(vote.messageId, messageIds))
        );

      return await db()
        .delete(message)
        .where(
          and(eq(message.chatId, chatId), inArray(message.id, messageIds))
        );
    }

    return messageIds.length;
  } catch (error) {
    console.error(
      "Failed to delete messages by id after timestamp from database"
    );
    throw error;
  }
}

export async function updateChatVisiblityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: "private" | "public";
}) {
  try {
    return await db()
      .update(chat)
      .set({ visibility })
      .where(eq(chat.id, chatId));
  } catch (error) {
    console.error("Failed to update chat visibility in database");
    throw error;
  }
}

export async function getMessageCountByUserId({
  id,
  differenceInHours,
}: {
  id: string;
  differenceInHours: number;
}) {
  try {
    const twentyFourHoursAgo = new Date(
      Date.now() - differenceInHours * 60 * 60 * 1000
    );

    const [stats] = await db()
      .select({ count: count(message.id) })
      .from(message)
      .innerJoin(chat, eq(message.chatId, chat.id))
      .where(
        and(
          eq(chat.userId, id),
          gte(message.createdAt, twentyFourHoursAgo),
          eq(message.role, "user")
        )
      )
      .execute();

    return stats?.count ?? 0;
  } catch (error) {
    console.error(
      "Failed to get message count by user id for the last 24 hours from database"
    );
    throw error;
  }
}

export async function createStreamId({
  streamId,
  chatId,
}: {
  streamId: string;
  chatId: string;
}) {
  try {
    await db()
      .insert(stream)
      .values({ id: streamId, chatId, createdAt: new Date() });
  } catch (error) {
    console.error("Failed to create stream id in database");
    throw error;
  }
}

export async function getStreamIdsByChatId({ chatId }: { chatId: string }) {
  try {
    const streamIds = await db()
      .select({ id: stream.id })
      .from(stream)
      .where(eq(stream.chatId, chatId))
      .orderBy(asc(stream.createdAt))
      .execute();

    return streamIds.map(({ id }) => id);
  } catch (error) {
    console.error("Failed to get stream ids by chat id from database");
    throw error;
  }
}

export async function getChatImageArtifacts({
  chatId,
  limit = 5,
}: {
  chatId: string;
  limit?: number;
}) {
  try {
    // AICODE-NOTE: Find recent image artifacts from chat messages for image-to-video
    const recentMessages = await db()
      .select({
        id: message.id,
        parts: message.parts,
        createdAt: message.createdAt,
      })
      .from(message)
      .where(eq(message.chatId, chatId))
      .orderBy(desc(message.createdAt))
      .limit(50); // Look at more messages to find artifacts

    // Extract image artifacts from message parts
    const imageArtifacts: Array<{
      id: string;
      url: string;
      prompt: string;
      createdAt: Date;
      projectId?: string;
    }> = [];

    for (const msg of recentMessages) {
      if (msg.parts && Array.isArray(msg.parts)) {
        for (const part of msg.parts) {
          // Check if part contains image artifact
          if (part && typeof part === "object" && "text" in part) {
            const text = part.text as string;

            // Look for image artifacts in the text
            if (
              text &&
              (text.includes('"kind":"image"') ||
                text.includes("'kind':'image'") ||
                text.includes("ImageArtifact"))
            ) {
              try {
                let artifactContent = null;

                // Try to parse JSON content
                if (text.includes("```json")) {
                  const jsonMatch = text.match(/```json\s*({[\s\S]*?})\s*```/);
                  if (jsonMatch) {
                    artifactContent = JSON.parse(jsonMatch[1] || "");
                  }
                } else if (text.startsWith("{") && text.endsWith("}")) {
                  artifactContent = JSON.parse(text);
                }

                if (
                  artifactContent &&
                  artifactContent.status === "completed" &&
                  artifactContent.imageUrl
                ) {
                  imageArtifacts.push({
                    id:
                      artifactContent.requestId ||
                      artifactContent.projectId ||
                      msg.id,
                    url: artifactContent.imageUrl,
                    prompt: artifactContent.prompt || "Generated image",
                    createdAt: msg.createdAt,
                    projectId: artifactContent.projectId,
                  });

                  // Stop at limit
                  if (imageArtifacts.length >= limit) {
                    break;
                  }
                }
              } catch (parseError) {
                // Skip invalid JSON artifacts
                continue;
              }
            }
          }
        }

        if (imageArtifacts.length >= limit) {
          break;
        }
      }
    }

    return imageArtifacts;
  } catch (error) {
    console.error("Failed to get chat image artifacts from database");
    throw error;
  }
}

/**
 * Media artifact structure returned from chat messages
 */
export interface MediaArtifact {
  id: string;
  url: string;
  role: "user" | "assistant";
  timestamp: Date;
  prompt?: string;
  messageIndex: number;
  mediaType: "image" | "video" | "audio";
  metadata?: Record<string, any>;
}

/**
 * Get all media artifacts from chat messages
 * Extracts images, videos, and audio from message parts
 * Used by context system for AI-powered media reference detection
 */
export async function getChatMediaArtifacts({
  chatId,
  limit = 50,
}: {
  chatId: string;
  limit?: number;
}): Promise<MediaArtifact[]> {
  try {
    // Fetch recent messages from chat
    const recentMessages = await db()
      .select({
        id: message.id,
        role: message.role,
        parts: message.parts,
        attachments: message.attachments,
        createdAt: message.createdAt,
      })
      .from(message)
      .where(eq(message.chatId, chatId))
      .orderBy(desc(message.createdAt))
      .limit(100); // Look at more messages to find artifacts

    const mediaArtifacts: MediaArtifact[] = [];
    let messageIndex = recentMessages.length - 1;

    for (const msg of recentMessages) {
      // 1. Extract artifacts from message parts (AI-generated content)
      if (msg.parts && Array.isArray(msg.parts)) {
        for (const part of msg.parts) {
          // Check TEXT parts for JSON artifacts
          if (part && typeof part === "object" && "text" in part) {
            const text = part.text as string;

            // Check for image artifacts
            if (
              text &&
              (text.includes('"kind":"image"') ||
                text.includes("'kind':'image'") ||
                text.includes("ImageArtifact"))
            ) {
              try {
                let artifactContent = null;

                if (text.includes("```json")) {
                  const jsonMatch = text.match(/```json\s*({[\s\S]*?})\s*```/);
                  if (jsonMatch) {
                    artifactContent = JSON.parse(jsonMatch[1] || "");
                  }
                } else if (text.startsWith("{") && text.endsWith("}")) {
                  artifactContent = JSON.parse(text);
                }

                if (
                  artifactContent &&
                  artifactContent.status === "completed" &&
                  artifactContent.imageUrl
                ) {
                  mediaArtifacts.push({
                    id:
                      artifactContent.requestId ||
                      artifactContent.projectId ||
                      msg.id,
                    url: artifactContent.imageUrl,
                    role: msg.role as "user" | "assistant",
                    timestamp: msg.createdAt,
                    prompt: artifactContent.prompt || "Generated image",
                    messageIndex,
                    mediaType: "image",
                    metadata: {
                      projectId: artifactContent.projectId,
                      requestId: artifactContent.requestId,
                    },
                  });
                }
              } catch (parseError) {
                continue;
              }
            }

            // Check for video artifacts
            if (
              text &&
              (text.includes('"kind":"video"') ||
                text.includes("'kind':'video'") ||
                text.includes("VideoArtifact"))
            ) {
              try {
                let artifactContent = null;

                if (text.includes("```json")) {
                  const jsonMatch = text.match(/```json\s*({[\s\S]*?})\s*```/);
                  if (jsonMatch) {
                    artifactContent = JSON.parse(jsonMatch[1] || "");
                  }
                } else if (text.startsWith("{") && text.endsWith("}")) {
                  artifactContent = JSON.parse(text);
                }

                if (
                  artifactContent &&
                  artifactContent.status === "completed" &&
                  artifactContent.videoUrl
                ) {
                  mediaArtifacts.push({
                    id:
                      artifactContent.requestId ||
                      artifactContent.projectId ||
                      msg.id,
                    url: artifactContent.videoUrl,
                    role: msg.role as "user" | "assistant",
                    timestamp: msg.createdAt,
                    prompt: artifactContent.prompt || "Generated video",
                    messageIndex,
                    mediaType: "video",
                    metadata: {
                      projectId: artifactContent.projectId,
                      requestId: artifactContent.requestId,
                    },
                  });
                }
              } catch (parseError) {
                continue;
              }
            }

            // Check for audio artifacts (script/audio generation)
            if (
              text &&
              (text.includes('"kind":"script"') ||
                text.includes("'kind':'script'") ||
                text.includes("ScriptArtifact"))
            ) {
              try {
                let artifactContent = null;

                if (text.includes("```json")) {
                  const jsonMatch = text.match(/```json\s*({[\s\S]*?})\s*```/);
                  if (jsonMatch) {
                    artifactContent = JSON.parse(jsonMatch[1] || "");
                  }
                } else if (text.startsWith("{") && text.endsWith("}")) {
                  artifactContent = JSON.parse(text);
                }

                if (
                  artifactContent &&
                  artifactContent.status === "completed" &&
                  artifactContent.audioUrl
                ) {
                  mediaArtifacts.push({
                    id:
                      artifactContent.requestId ||
                      artifactContent.projectId ||
                      msg.id,
                    url: artifactContent.audioUrl,
                    role: msg.role as "user" | "assistant",
                    timestamp: msg.createdAt,
                    prompt: artifactContent.scriptText || "Generated audio",
                    messageIndex,
                    mediaType: "audio",
                    metadata: {
                      projectId: artifactContent.projectId,
                      requestId: artifactContent.requestId,
                      scriptText: artifactContent.scriptText,
                    },
                  });
                }
              } catch (parseError) {
                continue;
              }
            }
          }

          // CRITICAL: Check TOOL-RESULT parts for Nano Banana and other tool outputs
          // Tool parts have type like 'tool-call-nanoBananaImageGeneration' with output field
          if (
            part &&
            typeof part === "object" &&
            "type" in part &&
            "output" in part
          ) {
            const partType = (part as any).type;
            const partOutput = (part as any).output;

            // Check if this is an image generation tool
            if (
              partType &&
              typeof partType === "string" &&
              (partType.includes("ImageGeneration") ||
                partType.includes("nanoBananaImageGeneration") ||
                partType.includes("configureImageGeneration"))
            ) {
              try {
                // Tool output can be direct object or JSON string in content field
                let toolResult = partOutput;

                // If output has content field with JSON string, parse it
                if (
                  toolResult &&
                  typeof toolResult === "object" &&
                  "content" in toolResult &&
                  typeof toolResult.content === "string"
                ) {
                  try {
                    toolResult = {
                      ...toolResult,
                      ...JSON.parse(toolResult.content),
                    };
                  } catch {
                    // Content is not JSON, use as is
                  }
                }

                // Extract image URL from tool result
                const imageUrl =
                  toolResult?.url ||
                  toolResult?.imageUrl ||
                  toolResult?.data?.imageUrl;

                if (imageUrl && typeof imageUrl === "string") {
                  mediaArtifacts.push({
                    id: toolResult?.id || msg.id,
                    url: imageUrl,
                    role: msg.role as "user" | "assistant",
                    timestamp: msg.createdAt,
                    prompt: toolResult?.prompt || "Generated image",
                    messageIndex,
                    mediaType: "image",
                    metadata: {
                      toolType: partType,
                      projectId: toolResult?.projectId,
                      requestId: toolResult?.requestId,
                    },
                  });
                  console.log(
                    `✅ [getChatMediaArtifacts] Found image in tool part: ${partType}`
                  );
                }
              } catch (error) {
                console.warn(
                  "[getChatMediaArtifacts] Failed to parse tool output:",
                  error
                );
                continue;
              }
            }

            // Check if this is a video generation tool
            if (
              partType &&
              typeof partType === "string" &&
              (partType.includes("VideoGeneration") ||
                partType.includes("falVideoGeneration") ||
                partType.includes("configureVideoGeneration"))
            ) {
              try {
                let toolResult = partOutput;

                if (
                  toolResult &&
                  typeof toolResult === "object" &&
                  "content" in toolResult &&
                  typeof toolResult.content === "string"
                ) {
                  try {
                    toolResult = {
                      ...toolResult,
                      ...JSON.parse(toolResult.content),
                    };
                  } catch {
                    // Content is not JSON, use as is
                  }
                }

                const videoUrl =
                  toolResult?.url ||
                  toolResult?.videoUrl ||
                  toolResult?.data?.videoUrl;

                if (videoUrl && typeof videoUrl === "string") {
                  mediaArtifacts.push({
                    id: toolResult?.id || msg.id,
                    url: videoUrl,
                    role: msg.role as "user" | "assistant",
                    timestamp: msg.createdAt,
                    prompt: toolResult?.prompt || "Generated video",
                    messageIndex,
                    mediaType: "video",
                    metadata: {
                      toolType: partType,
                      projectId: toolResult?.projectId,
                      requestId: toolResult?.requestId,
                    },
                  });
                  console.log(
                    `✅ [getChatMediaArtifacts] Found video in tool part: ${partType}`
                  );
                }
              } catch (error) {
                console.warn(
                  "[getChatMediaArtifacts] Failed to parse tool output:",
                  error
                );
                continue;
              }
            }
          }
        }
      }

      // 2. Extract media from message attachments (user-uploaded content)
      if (msg.attachments && Array.isArray(msg.attachments)) {
        for (const attachment of msg.attachments) {
          if (
            attachment &&
            typeof attachment === "object" &&
            "contentType" in attachment &&
            "url" in attachment
          ) {
            const contentType = attachment.contentType as string;
            const url = attachment.url as string;
            const name = (attachment as any).name as string | undefined;

            if (contentType?.startsWith("image/")) {
              mediaArtifacts.push({
                id: (attachment as any).id || `${msg.id}-attachment`,
                url,
                role: msg.role as "user" | "assistant",
                timestamp: msg.createdAt,
                prompt: name || "Uploaded image",
                messageIndex,
                mediaType: "image",
                metadata: {
                  contentType,
                  name,
                  isAttachment: true,
                },
              });
            } else if (contentType?.startsWith("video/")) {
              mediaArtifacts.push({
                id: (attachment as any).id || `${msg.id}-attachment`,
                url,
                role: msg.role as "user" | "assistant",
                timestamp: msg.createdAt,
                prompt: name || "Uploaded video",
                messageIndex,
                mediaType: "video",
                metadata: {
                  contentType,
                  name,
                  isAttachment: true,
                },
              });
            } else if (contentType?.startsWith("audio/")) {
              mediaArtifacts.push({
                id: (attachment as any).id || `${msg.id}-attachment`,
                url,
                role: msg.role as "user" | "assistant",
                timestamp: msg.createdAt,
                prompt: name || "Uploaded audio",
                messageIndex,
                mediaType: "audio",
                metadata: {
                  contentType,
                  name,
                  isAttachment: true,
                },
              });
            }
          }
        }
      }

      messageIndex--;

      if (mediaArtifacts.length >= limit) {
        break;
      }
    }

    return mediaArtifacts;
  } catch (error) {
    console.error("Failed to get chat media artifacts from database", error);
    throw error;
  }
}

// AICODE-NOTE: New document gallery query functions
export async function getDocuments({
  userId,
  kind,
  model,
  visibility = "all",
  search,
  dateFrom,
  dateTo,
  sortBy = "newest",
  page = 1,
  limit = 20,
}: {
  userId?: string;
  kind?: ArtifactKind;
  model?: string;
  visibility?: "mine" | "public" | "all";
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: "newest" | "oldest" | "popular";
  page?: number;
  limit?: number;
}) {
  try {
    const offset = (page - 1) * limit;
    const conditions: SQL[] = [];

    // Visibility filter
    if (visibility === "mine" && userId) {
      conditions.push(eq(document.userId, userId));
    } else if (visibility === "public") {
      conditions.push(eq(document.visibility, "public"));
    } else if (visibility === "all" && userId) {
      const visibilityCondition = or(
        eq(document.userId, userId),
        eq(document.visibility, "public")
      );
      if (visibilityCondition) {
        conditions.push(visibilityCondition);
      }
    }

    // Kind filter
    if (kind) {
      conditions.push(eq(document.kind, kind));
    }

    // Model filter
    if (model) {
      conditions.push(eq(document.model, model));
    }

    // Date range filters
    if (dateFrom) {
      conditions.push(gte(document.createdAt, dateFrom));
    }
    if (dateTo) {
      conditions.push(lt(document.createdAt, dateTo));
    }

    // Search filter - search in title and tags
    if (search && typeof search === "string" && search.length > 0) {
      const searchCondition = or(
        ilike(document.title, `%${search}%`),
        sql`${document.tags}::text LIKE ${`%${search}%`}` // <-- исправлено
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    // Build query
    const baseQuery = db()
      .select({
        id: document.id,
        title: document.title,
        kind: document.kind,
        thumbnailUrl: document.thumbnailUrl,
        createdAt: document.createdAt,
        userId: document.userId,
        model: document.model,
        tags: document.tags,
        viewCount: document.viewCount,
        visibility: document.visibility,
        metadata: document.metadata,
        username: user.email,
      })
      .from(document)
      .leftJoin(user, eq(document.userId, user.id));

    const queryWithWhere =
      conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;

    // Apply sorting
    const queryWithSort =
      sortBy === "newest"
        ? queryWithWhere.orderBy(desc(document.createdAt))
        : sortBy === "oldest"
          ? queryWithWhere.orderBy(asc(document.createdAt))
          : sortBy === "popular"
            ? queryWithWhere.orderBy(desc(document.viewCount))
            : queryWithWhere.orderBy(desc(document.createdAt));

    // Get total count for pagination
    const countQuery = db().select({ count: count() }).from(document);

    if (conditions.length > 0) {
      countQuery.where(and(...conditions));
    }

    const countResult = await countQuery;
    const total = countResult[0]?.count || 0;

    // Get documents with pagination
    const documents = await queryWithSort.limit(limit).offset(offset);

    return {
      documents,
      pagination: {
        page,
        limit,
        total,
        hasMore: offset + documents.length < total,
      },
    };
  } catch (error) {
    console.error("Failed to get documents from database");
    throw error;
  }
}

export async function getPublicDocuments({
  kind,
  model,
  search,
  dateFrom,
  dateTo,
  sortBy = "newest",
  page = 1,
  limit = 20,
}: {
  kind?: ArtifactKind;
  model?: string;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: "newest" | "oldest" | "popular";
  page?: number;
  limit?: number;
}) {
  return getDocuments({
    visibility: "public",
    ...(kind && { kind }),
    ...(model && { model }),
    ...(search && { search }),
    ...(dateFrom && { dateFrom }),
    ...(dateTo && { dateTo }),
    ...(sortBy && { sortBy }),
    ...(page !== undefined && { page }),
    ...(limit !== undefined && { limit }),
  });
}

export async function incrementDocumentViewCount({ id }: { id: string }) {
  try {
    return await db()
      .update(document)
      .set({ viewCount: sql`${document.viewCount} + 1` })
      .where(eq(document.id, id));
  } catch (error) {
    console.error("Failed to increment document view count");
    throw error;
  }
}

export async function updateDocumentVisibility({
  id,
  visibility,
  userId,
}: {
  id: string;
  visibility: "public" | "private";
  userId: string;
}) {
  try {
    return await db()
      .update(document)
      .set({ visibility })
      .where(and(eq(document.id, id), eq(document.userId, userId)));
  } catch (error) {
    console.error("Failed to update document visibility");
    throw error;
  }
}

export async function updateDocumentMetadata({
  id,
  metadata,
  userId,
}: {
  id: string;
  metadata: Record<string, any>;
  userId: string;
}) {
  try {
    return await db()
      .update(document)
      .set({ metadata })
      .where(and(eq(document.id, id), eq(document.userId, userId)));
  } catch (error) {
    console.error("Failed to update document metadata");
    throw error;
  }
}

export async function updateDocumentThumbnail({
  id,
  userId,
  thumbnailUrl,
  model,
  metadata,
  tags,
}: {
  id: string;
  userId: string;
  thumbnailUrl?: string;
  model?: string;
  metadata?: Record<string, any>;
  tags?: string[];
}) {
  try {
    const updateData: any = {};
    if (thumbnailUrl !== undefined) updateData.thumbnailUrl = thumbnailUrl;
    if (model !== undefined) updateData.model = model;
    if (metadata !== undefined) updateData.metadata = metadata;
    if (tags !== undefined) updateData.tags = tags;

    return await db()
      .update(document)
      .set(updateData)
      .where(and(eq(document.id, id), eq(document.userId, userId)));
  } catch (error) {
    console.error("Failed to update document thumbnail");
    throw error;
  }
}
