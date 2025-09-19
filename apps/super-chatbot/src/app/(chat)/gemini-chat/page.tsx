import { auth } from "@/app/(auth)/auth";
import { Chat } from "@/components/chat";
import { generateUUID } from "@/lib/utils";

export default async function GeminiChatPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gemini + VEO3 Chat
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Please sign in to access the Gemini chat
          </p>
        </div>
      </div>
    );
  }

  const chatId = generateUUID();

  return (
    <div className="flex h-screen flex-col">
      <div className="flex-1 overflow-hidden">
        <Chat
          id={chatId}
          initialMessages={[]}
          initialChatModel="gemini-2.5-flash-lite"
          initialVisibilityType="private"
          isReadonly={false}
          session={session}
          autoResume={false}
          isGeminiChat={true}
        />
      </div>
    </div>
  );
}
