import { auth } from "@/app/(auth)/auth";
import { NextResponse } from "next/server";

/**
 * Проверяет, является ли текущий пользователь администратором
 */
export async function checkAdminPermissions(): Promise<{
  isAdmin: boolean;
  error?: NextResponse;
}> {
  const session = await auth();

  if (!session?.user) {
    return {
      isAdmin: false,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  // Проверяем, является ли пользователь администратором
  // В реальном приложении это должно проверяться через базу данных
  // или через Auth0 роли
  const isAdmin =
    session.user.email?.endsWith("@superduperai.com") ||
    session.user.email === "admin@example.com" ||
    process.env.NODE_ENV === "development";

  if (!isAdmin) {
    return {
      isAdmin: false,
      error: NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      ),
    };
  }

  return { isAdmin: true };
}

/**
 * Middleware для проверки прав администратора
 * Используется в API routes
 */
export async function requireAdmin() {
  const { isAdmin, error } = await checkAdminPermissions();

  if (!isAdmin) {
    return error!;
  }

  return null;
}
