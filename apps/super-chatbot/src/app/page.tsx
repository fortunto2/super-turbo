import { cookies } from "next/headers";
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";
import { generateUUID } from "@/lib/utils";
import { auth } from "./(auth)/auth";
import { redirect } from "next/navigation";
import { ChatPageWrapper } from "@/components/chat-page-wrapper";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Script from "next/script";

export default async function HomePage() {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/guest");
  }

  const id = generateUUID();

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get("chat-model");
  const isCollapsed = cookieStore.get("sidebar:state")?.value !== "true";

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
      <SidebarProvider defaultOpen={!isCollapsed}>
        <AppSidebar user={session?.user} />
        <SidebarInset>{chatContent}</SidebarInset>
      </SidebarProvider>
    </>
  );
}
