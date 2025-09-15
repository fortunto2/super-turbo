import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { getUserById, updateUserBalance } from "@/lib/db/admin-queries";
import { eq } from "drizzle-orm";
import { user } from "@/lib/db/schema";
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

    // Удаляем пользователя
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
