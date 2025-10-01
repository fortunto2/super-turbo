import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/app/(auth)/auth";
import { getChatById, getMessagesByChatId } from "@/lib/db/queries";
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";
import type { DBMessage } from "@/lib/db/schema";
import type { UIMessage } from "ai";
import type { Attachment } from "@/lib/types/attachment";
import * as Sentry from "@sentry/nextjs";
import Script from "next/script";
import { BananaVeo3ChatWrapper } from "./banana-veo3-chat-wrapper";

export default async function BananaVeo3ChatPage(props: {
  params: Promise<{ id: string }>;
}) {
  try {
    const params = await props.params;
    const { id } = params;

    // Валидация UUID
    if (
      !id ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id
      )
    ) {
      Sentry.captureMessage(`Invalid banana-veo3 chat ID format: ${id}`, {
        level: "error",
        tags: { error_type: "invalid_uuid", entity: "banana-veo3-chat" },
        extra: { chatId: id },
      });
      notFound();
    }

    Sentry.addBreadcrumb({
      category: "banana-veo3",
      message: `Loading banana-veo3 chat page: ${id}`,
      level: "info",
      data: { chatId: id },
    });

    const session = await auth();

    if (!session) {
      Sentry.addBreadcrumb({
        category: "auth",
        message: `No session found when accessing banana-veo3 chat: ${id}`,
        level: "info",
      });
      redirect("/api/auth/guest");
    }

    // Дополнительная проверка существования пользователя
    if (!session.user || !session.user.id) {
      Sentry.captureMessage(
        `Invalid session user when accessing banana-veo3 chat: ${id}`,
        {
          level: "warning",
          tags: { error_type: "invalid_session", entity: "banana-veo3-chat" },
          extra: { chatId: id, session: session },
        }
      );
      redirect("/api/auth/guest");
    }

    const chat = await getChatById({ id });

    // Если чата нет - это новый чат, покажем пустой интерфейс
    // Чат будет создан автоматически при первом сообщении через API
    if (chat) {
      // Проверяем права доступа только для существующих чатов
      if (chat.visibility === "private") {
        if (!session.user) {
          Sentry.captureMessage(
            `Access denied to private banana-veo3 chat: ${id}`,
            {
              level: "warning",
              tags: { error_type: "access_denied", entity: "banana-veo3-chat" },
            }
          );
          return notFound();
        }

        if (session.user.id !== chat.userId) {
          Sentry.captureMessage(
            `Unauthorized access to private banana-veo3 chat: ${id}`,
            {
              level: "warning",
              tags: { error_type: "unauthorized", entity: "banana-veo3-chat" },
              extra: {
                chatId: id,
                chatOwnerId: chat.userId,
                userId: session.user.id,
              },
            }
          );
          return notFound();
        }
      }
    }

    try {
      const messagesFromDb = await getMessagesByChatId({
        id,
      });

      function convertToUIMessages(
        messages: Array<DBMessage>
      ): Array<UIMessage> {
        console.log("🍌 Converting messages from DB:", messages.length);

        return messages.map((message, index) => {
          const parts = message.parts as UIMessage["parts"];

          // Extract text from parts
          let content = "";
          if (parts && Array.isArray(parts) && parts.length > 0) {
            const firstPart = parts[0] as any;
            content = firstPart?.text || "";
          }

          console.log(`🍌 Message ${index}:`, {
            id: message.id,
            role: message.role,
            partsLength: Array.isArray(parts) ? parts.length : 0,
            content: content.substring(0, 50),
            hasContent: !!content,
          });

          /* FIXME(@ai-sdk-upgrade-v5): The `experimental_attachments` property has been replaced with the parts array. Please manually migrate following https://ai-sdk.dev/docs/migration-guides/migration-guide-5-0#attachments--file-parts */
          return {
            id: message.id,
            parts,
            role: message.role as UIMessage["role"],
            content,
            createdAt: message.createdAt,
            experimental_attachments:
              (message.attachments as Array<Attachment>) ?? [],
          };
        });
      }

      const cookieStore = await cookies();
      const chatModelFromCookie = cookieStore.get("chat-model");

      const chatContent = !chatModelFromCookie ? (
        <BananaVeo3ChatWrapper
          id={id}
          initialMessages={convertToUIMessages(messagesFromDb)}
          initialChatModel={DEFAULT_CHAT_MODEL}
          initialVisibilityType={chat?.visibility ?? "private"}
          isReadonly={chat ? session?.user?.id !== chat.userId : false}
          session={session}
          autoResume={true}
        />
      ) : (
        <BananaVeo3ChatWrapper
          id={id}
          initialMessages={convertToUIMessages(messagesFromDb)}
          initialChatModel={chatModelFromCookie.value}
          initialVisibilityType={chat?.visibility ?? "private"}
          isReadonly={chat ? session?.user?.id !== chat.userId : false}
          session={session}
          autoResume={true}
        />
      );

      return (
        <>
          <Script
            src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
            strategy="beforeInteractive"
          />
          {chatContent}
        </>
      );
    } catch (error) {
      // Логируем ошибку получения сообщений
      Sentry.captureException(error, {
        tags: { source: "banana_veo3_chat_page", chatId: id },
        extra: {
          chatId: id,
          chatUserId: chat?.userId,
          sessionUserId: session?.user?.id,
        },
      });
      throw error;
    }
  } catch (error) {
    // Отлавливаем любые другие ошибки в компоненте
    Sentry.captureException(error);
    throw error;
  }
}
