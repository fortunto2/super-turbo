import { auth } from "@/app/(auth)/auth";
import { myProvider } from "@/lib/ai/providers";
import { entitlementsByUserType } from "@/lib/ai/entitlements";
import { getUser, getOrCreateOAuthUser } from "@/lib/db/queries";
import type { UserType } from "@/app/(auth)/auth";

export async function GET() {
  try {
    console.log("🔍 Test chat flow started");

    // 1. Проверяем сессию
    console.log("🔍 Getting session...");
    const session = await auth();
    console.log("🔍 Session result:", {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      userType: session?.user?.type,
    });

    if (!session?.user) {
      return Response.json(
        { error: "No session or user found" },
        { status: 401 }
      );
    }

    // 2. Проверяем entitlements
    console.log("🔍 Getting entitlements...");
    const entitlements = entitlementsByUserType[session.user.type as UserType];
    console.log("🔍 Entitlements result:", {
      hasEntitlements: !!entitlements,
      maxMessagesPerDay: entitlements?.maxMessagesPerDay,
      availableModels: entitlements?.availableChatModelIds?.length || 0,
    });

    // 3. Проверяем пользователя в БД
    console.log("🔍 Checking user existence in database...");
    const users = await getUser(session.user.email || "");
    console.log("🔍 Database user lookup result:", {
      email: session.user.email,
      usersFound: users.length,
    });

    // 4. Создаем пользователя если нужно
    if (users.length === 0) {
      console.log("🔍 User not found, creating...");
      await getOrCreateOAuthUser(
        session.user.id,
        session.user.email || `user-${session.user.id}@example.com`
      );
      console.log("✅ User created successfully");
    }

    // 5. Тестируем провайдер
    console.log("🔍 Testing provider...");
    const testProvider = myProvider.languageModel("chat-model");
    console.log("🔍 Provider test result:", {
      hasModel: !!testProvider,
      modelType: typeof testProvider,
    });

    return Response.json({
      status: "success",
      message: "All checks passed",
      results: {
        session: !!session?.user,
        entitlements: !!entitlements,
        userInDb: users.length > 0,
        provider: !!testProvider,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Test chat flow error:", error);
    return Response.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
