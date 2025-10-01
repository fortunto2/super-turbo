import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { getChatsByUserId } from "@/lib/db/queries";

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId || userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Загружаем чаты пользователя (последние 50)
    const result = await getChatsByUserId({
      id: userId,
      limit: 50,
      startingAfter: null,
      endingBefore: null,
    });

    // Фильтруем только Banana VEO3 чаты по префиксу в названии
    const bananaVeo3Chats = result.chats
      .filter(
        (chat) =>
          chat.title.includes("🍌 Banana VEO3:") ||
          chat.title.toLowerCase().includes("banana") ||
          chat.title.toLowerCase().includes("veo3") ||
          chat.title.toLowerCase().includes("gpu") ||
          chat.title.toLowerCase().includes("video")
      )
      .map((chat) => ({
        id: chat.id,
        title: chat.title,
        createdAt: chat.createdAt,
      }));

    console.log(
      "🍌🎬 Loaded banana-veo3 chat history:",
      bananaVeo3Chats.length,
      "chats"
    );

    return NextResponse.json(bananaVeo3Chats);
  } catch (error) {
    console.error("🍌🎬 Banana+VEO3 history error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
