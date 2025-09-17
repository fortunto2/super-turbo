import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { getUserById, updateUserBalance } from "@/lib/db/admin-queries";
import { eq, inArray } from "drizzle-orm";
import {
  user,
  chat,
  document,
  userProject,
  suggestion,
  message,
  messageDeprecated,
  vote,
  voteDeprecated,
  stream,
} from "@/lib/db/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Создаем подключение к базе данных
const databaseUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL || "";
const client = postgres(databaseUrl, { ssl: "require" });
const db = drizzle(client);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Проверяем авторизацию
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Добавить проверку прав администратора
    // if (!session.user.isAdmin) {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Skip processing if this is a special route like "enhanced"
    if (id === "enhanced") {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const userData = await getUserById(id);

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(userData);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Проверяем авторизацию
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Добавить проверку прав администратора
    // if (!session.user.isAdmin) {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }

    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Skip processing if this is a special route like "enhanced"
    if (id === "enhanced") {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Валидация входных данных
    const { email, balance } = body;

    if (email && typeof email !== "string") {
      return NextResponse.json(
        { error: "Email must be a string" },
        { status: 400 }
      );
    }

    if (balance !== undefined && (typeof balance !== "number" || balance < 0)) {
      return NextResponse.json(
        { error: "Balance must be a non-negative number" },
        { status: 400 }
      );
    }

    // Проверяем, существует ли пользователь
    const existingUser = await getUserById(id);
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Обновляем пользователя
    const updateData: any = {};
    if (email !== undefined) updateData.email = email;
    if (balance !== undefined) updateData.balance = balance;

    await db.update(user).set(updateData).where(eq(user.id, id));

    // Возвращаем обновленные данные
    const updatedUser = await getUserById(id);

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Проверяем авторизацию
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Добавить проверку прав администратора
    // if (!session.user.isAdmin) {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Skip processing if this is a special route like "enhanced"
    if (id === "enhanced") {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Проверяем, существует ли пользователь
    const existingUser = await getUserById(id);
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Удаляем связанные данные в правильном порядке (каскадное удаление)

    // 1. Сначала удаляем сообщения (они ссылаются на чаты)
    const userChats = await db
      .select({ id: chat.id })
      .from(chat)
      .where(eq(chat.userId, id));
    const chatIds = userChats.map((c) => c.id);

    if (chatIds.length > 0) {
      // Удаляем сообщения из всех чатов пользователя
      await db.delete(message).where(inArray(message.chatId, chatIds));
      await db
        .delete(messageDeprecated)
        .where(inArray(messageDeprecated.chatId, chatIds));

      // Получаем ID сообщений для удаления голосов
      const messageIds = await db
        .select({ id: message.id })
        .from(message)
        .where(inArray(message.chatId, chatIds));
      const messageDeprecatedIds = await db
        .select({ id: messageDeprecated.id })
        .from(messageDeprecated)
        .where(inArray(messageDeprecated.chatId, chatIds));

      const allMessageIds = [
        ...messageIds.map((m) => m.id),
        ...messageDeprecatedIds.map((m) => m.id),
      ];

      if (allMessageIds.length > 0) {
        // Удаляем голоса (они ссылаются на сообщения)
        await db.delete(vote).where(inArray(vote.messageId, allMessageIds));
        await db
          .delete(voteDeprecated)
          .where(inArray(voteDeprecated.messageId, allMessageIds));
      }
    }

    // 2. Удаляем потоки (streams) пользователя (они ссылаются на чаты)
    if (chatIds.length > 0) {
      await db.delete(stream).where(inArray(stream.chatId, chatIds));
    }

    // 3. Удаляем чаты пользователя
    await db.delete(chat).where(eq(chat.userId, id));

    // 4. Удаляем документы пользователя
    await db.delete(document).where(eq(document.userId, id));

    // 5. Удаляем проекты пользователя
    await db.delete(userProject).where(eq(userProject.userId, id));

    // 6. Удаляем предложения пользователя
    await db.delete(suggestion).where(eq(suggestion.userId, id));

    // 7. Наконец, удаляем самого пользователя
    await db.delete(user).where(eq(user.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
