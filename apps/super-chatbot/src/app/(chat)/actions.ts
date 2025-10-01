"use server";

import { generateText, type UIMessage } from "ai";
import { cookies } from "next/headers";
import {
  deleteMessagesByChatIdAfterTimestamp,
  getMessageById,
  updateChatVisiblityById,
} from "@/lib/db/queries";
import type { VisibilityType } from "@/components/shared/visibility-selector";
import { myProvider } from "@/lib/ai/providers";

export async function saveChatModelAsCookie(model: string) {
  const cookieStore = await cookies();
  cookieStore.set("chat-model", model);
}

export async function generateTitleFromUserMessage({
  message,
}: {
  message: UIMessage;
}) {
  // Логируем структуру сообщения для отладки
  console.log("🔍 generateTitleFromUserMessage - message structure:", {
    hasMessage: !!message,
    messageKeys: message ? Object.keys(message) : [],
    hasContent: !!(message as any)?.content,
    hasParts: !!(message as any)?.parts,
    partsLength: (message as any)?.parts?.length || 0,
  });

  // Безопасно извлекаем текст сообщения
  const messageText =
    (message as any)?.content || (message as any)?.parts?.[0]?.text || "";

  // Если нет текста, но есть изображения, создаем заголовок на основе этого
  /* FIXME(@ai-sdk-upgrade-v5): The `experimental_attachments` property has been replaced with the parts array. Please manually migrate following https://ai-sdk.dev/docs/migration-guides/migration-guide-5-0#attachments--file-parts */
  const hasImages = (message as any)?.experimental_attachments?.some(
    (att: any) => att.contentType?.startsWith("image/")
  );

  if (!messageText && hasImages) {
    return "Image Chat";
  }

  if (!messageText) {
    console.warn("⚠️ No text found in message for title generation");
    return "New Chat";
  }

  // ВРЕМЕННО ОТКЛЮЧАЕМ ГЕНЕРАЦИЮ ЗАГОЛОВКА ДЛЯ ТЕСТИРОВАНИЯ ОСНОВНОГО ЧАТА
  console.log(
    "🔧 TEMPORARILY DISABLED title generation - testing main chat functionality"
  );
  return "New Chat";

  console.log("🔧 About to call generateText with title-model");
  console.log(
    "🔧 Azure API Version from env:",
    process.env.AZURE_OPENAI_API_VERSION
  );

  const { text: title } = await generateText({
    model: myProvider.languageModel("title-model"),
    system: `\n
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`,
    prompt: messageText,
  });

  return title;
}

export async function deleteTrailingMessages({ id }: { id: string }) {
  const [message] = await getMessageById({ id });

  await deleteMessagesByChatIdAfterTimestamp({
    chatId: message?.chatId ?? "",
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
