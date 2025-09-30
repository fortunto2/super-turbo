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

    const chats = result.chats.map((chat) => ({
      id: chat.id,
      title: chat.title,
      createdAt: chat.createdAt,
    }));

    console.log("🍌🎬 Loaded banana-veo3 chat history:", chats.length, "chats");

    return NextResponse.json(chats);
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
