import { notFound } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { getChatById, getMessagesByChatId } from "@/lib/db/queries";
import { Chat } from "@/components/chat";
import { convertDBMessagesToUIMessages } from "@/lib/types/message-conversion";
import type { DBMessage } from "@/lib/db/schema";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function GeminiChatPage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user) {
    notFound();
  }

  const chat = await getChatById({ id: params.id });

  if (!chat) {
    notFound();
  }

  if (chat.visibility === "private" && chat.userId !== session.user.id) {
    notFound();
  }

  const messages = await getMessagesByChatId({ id: params.id }) as DBMessage[];

  return (
    <div className="flex h-screen flex-col">
      <div className="flex-1 overflow-hidden">
        <Chat
          id={params.id}
          initialMessages={convertDBMessagesToUIMessages(messages) as any}
          initialChatModel="gemini-2.5-flash-lite"
          initialVisibilityType={chat.visibility}
          isReadonly={false}
          session={session}
          autoResume={false}
          isGeminiChat={true}
        />
      </div>
    </div>
  );
}
