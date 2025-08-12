import { cookies } from "next/headers";
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";
import { generateUUID } from "@/lib/utils";
import { auth } from "./(auth)/auth";
import { redirect } from "next/navigation";
import { ChatPageWrapper } from "@/components/chat-page-wrapper";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import Script from "next/script";

export default async function HomePage() {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/guest");
  }

  // Проверяем, что у нас есть валидная сессия
  if (!session.user || !session.user.id) {
    console.error("Invalid session user:", session);
    redirect("/api/auth/guest");
  }

  const id = generateUUID();

  // Валидация сгенерированного UUID
  if (
    !id ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  ) {
    console.error("Failed to generate valid UUID:", id);
    // В случае ошибки генерации, используем fallback
    const fallbackId = `fallback-${Date.now()}-${Math.random().toString(36).substring(2)}`;
    console.warn("Using fallback ID:", fallbackId);
  }

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get("chat-model");

  const chatContent = !modelIdFromCookie ? (
    <ChatPageWrapper
      key={id}
      id={id}
      initialMessages={[]}
      initialChatModel={DEFAULT_CHAT_MODEL}
      initialVisibilityType="private"
      isReadonly={false}
      session={session}
      autoResume={false}
    />
  ) : (
    <ChatPageWrapper
      id={id}
      key={id}
      initialMessages={[]}
      initialChatModel={modelIdFromCookie.value}
      initialVisibilityType="private"
      isReadonly={false}
      session={session}
      autoResume={false}
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
}
