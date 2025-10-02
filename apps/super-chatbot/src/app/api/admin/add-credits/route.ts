import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { getUserById, updateUserBalance } from "@/lib/db/admin-queries";
import { requireAdmin } from "@/lib/auth/admin-utils";

export async function POST(request: NextRequest) {
  try {
    // Проверяем авторизацию
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Проверяем права администратора
    const adminError = await requireAdmin();
    if (adminError) {
      return adminError;
    }

    const body = await request.json();
    const { userId, creditsToAdd } = body;

    // Валидация входных данных
    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "User ID is required and must be a string" },
        { status: 400 }
      );
    }

    if (typeof creditsToAdd !== "number" || creditsToAdd <= 0) {
      return NextResponse.json(
        { error: "Credits to add must be a positive number" },
        { status: 400 }
      );
    }

    // Получаем текущего пользователя
    const currentUser = await getUserById(userId);
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Вычисляем новый баланс
    const newBalance = (currentUser.balance || 0) + creditsToAdd;

    // Обновляем баланс пользователя
    const updatedUser = await updateUserBalance(userId, newBalance);

    return NextResponse.json({
      success: true,
      user: updatedUser,
      creditsAdded: creditsToAdd,
      previousBalance: currentUser.balance,
      newBalance,
    });
  } catch (error) {
    console.error("Error adding credits:", error);
    return NextResponse.json(
      { error: "Failed to add credits" },
      { status: 500 }
    );
  }
}
