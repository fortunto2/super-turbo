import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { updateUserBalance } from "@/lib/db/admin-queries";

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { userId, newBalance } = body;

    // Валидация входных данных
    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "User ID is required and must be a string" },
        { status: 400 }
      );
    }

    if (typeof newBalance !== "number" || newBalance < 0) {
      return NextResponse.json(
        { error: "New balance must be a non-negative number" },
        { status: 400 }
      );
    }

    // Обновляем баланс пользователя
    const updatedUser = await updateUserBalance(userId, newBalance);

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user balance:", error);
    return NextResponse.json(
      { error: "Failed to update user balance" },
      { status: 500 }
    );
  }
}
