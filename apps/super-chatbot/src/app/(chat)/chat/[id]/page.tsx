import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/app/(auth)/auth";
import { getChatById, getMessagesByChatId } from "@/lib/db/queries";
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";
import type { DBMessage } from "@/lib/db/schema";
import type { UIMessage } from "ai";
import type { Attachment } from "@/lib/types/attachment";
import * as Sentry from "@sentry/nextjs";
import { ChatPageWrapper } from "@/components/chat/chat-page-wrapper";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import Script from "next/script";

export default async function Page(props: { params: Promise<{ id: string }> }) {
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
      Sentry.captureMessage(`Invalid chat ID format: ${id}`, {
        level: "error",
        tags: { error_type: "invalid_uuid", entity: "chat" },
        extra: { chatId: id },
      });
      notFound();
    }

    Sentry.addBreadcrumb({
      category: "chat",
      message: `Loading chat page: ${id}`,
      level: "info",
      data: { chatId: id },
    });

    const chat = await getChatById({ id });

    if (!chat) {
      Sentry.captureMessage(`Chat not found: ${id}`, {
        level: "error",
        tags: { error_type: "404", entity: "chat" },
        extra: { chatId: id },
      });
      notFound();
    }

    const session = await auth();

    if (!session) {
      Sentry.addBreadcrumb({
        category: "auth",
        message: `No session found when accessing chat: ${id}`,
        level: "info",
      });
      redirect("/api/auth/guest");
    }

    // Дополнительная проверка существования пользователя
    if (!session.user || !session.user.id) {
      Sentry.captureMessage(`Invalid session user when accessing chat: ${id}`, {
        level: "warning",
        tags: { error_type: "invalid_session", entity: "chat" },
        extra: { chatId: id, session: session },
      });
      redirect("/api/auth/guest");
    }

    if (chat.visibility === "private") {
      if (!session.user) {
        Sentry.captureMessage(`Access denied to private chat: ${id}`, {
          level: "warning",
          tags: { error_type: "access_denied", entity: "chat" },
        });
        return notFound();
      }

      if (session.user.id !== chat.userId) {
        Sentry.captureMessage(`Unauthorized access to private chat: ${id}`, {
          level: "warning",
          tags: { error_type: "unauthorized", entity: "chat" },
          extra: {
            chatId: id,
            chatOwnerId: chat.userId,
            userId: session.user.id,
          },
        });
        return notFound();
      }
    }

    try {
      const messagesFromDb = await getMessagesByChatId({
        id,
      });

      function convertToUIMessages(
        messages: Array<DBMessage>
      ): Array<UIMessage> {
        /* FIXME(@ai-sdk-upgrade-v5): The `experimental_attachments` property has been replaced with the parts array. Please manually migrate following https://ai-sdk.dev/docs/migration-guides/migration-guide-5-0#attachments--file-parts */
        return messages.map((message) => ({
          id: message.id,
          parts: message.parts as UIMessage["parts"],
          role: message.role as UIMessage["role"],
          // Note: content will soon be deprecated in @ai-sdk/react
          content: "",
          createdAt: message.createdAt,
          experimental_attachments:
            (message.attachments as Array<Attachment>) ?? [],
        }));
      }

      const cookieStore = await cookies();
      const chatModelFromCookie = cookieStore.get("chat-model");

      const chatContent = !chatModelFromCookie ? (
        <ChatPageWrapper
          id={chat.id}
          initialMessages={convertToUIMessages(messagesFromDb)}
          initialChatModel={DEFAULT_CHAT_MODEL}
          initialVisibilityType={chat.visibility}
          isReadonly={session?.user?.id !== chat.userId}
          session={session}
          autoResume={true}
        />
      ) : (
        <ChatPageWrapper
          id={chat.id}
          initialMessages={convertToUIMessages(messagesFromDb)}
          initialChatModel={chatModelFromCookie.value}
          initialVisibilityType={chat.visibility}
          isReadonly={session?.user?.id !== chat.userId}
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
          <AppSidebar user={session?.user} />
          <SidebarInset>{chatContent}</SidebarInset>
        </>
      );
    } catch (error) {
      // Логируем ошибку получения сообщений
      Sentry.captureException(error, {
        tags: { source: "chat_page", chatId: id },
        extra: {
          chatId: id,
          chatUserId: chat.userId,
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
