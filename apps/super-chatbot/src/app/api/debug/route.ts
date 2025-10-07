import { auth } from "@/app/(auth)/auth";
import { myProvider } from "@/lib/ai/providers";
import { isProductionEnvironment } from "@/lib/constants";

export async function GET() {
  try {
    console.log("🔍 Debug endpoint called");

    // Проверяем переменные окружения
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      isProduction: isProductionEnvironment,
      hasAzureApiKey: !!process.env.AZURE_OPENAI_API_KEY,
      hasAzureResource: !!process.env.AZURE_OPENAI_RESOURCE_NAME,
      hasGoogleApiKey: !!process.env.GOOGLE_AI_API_KEY,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasRedisUrl: !!process.env.REDIS_URL,
      hasAuthSecret: !!process.env.AUTH_SECRET,
      hasAuthUrl: !!process.env.AUTH_URL,
    };

    // Проверяем провайдер
    const providerCheck = {
      hasProvider: !!myProvider,
      providerType: typeof myProvider,
    };

    // Проверяем сессию
    let sessionCheck = null;
    try {
      const session = await auth();
      sessionCheck = {
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id,
        userType: session?.user?.type,
      };
    } catch (error) {
      sessionCheck = {
        error: error instanceof Error ? error.message : "Unknown session error",
      };
    }

    return Response.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: envCheck,
      provider: providerCheck,
      session: sessionCheck,
    });
  } catch (error) {
    console.error("❌ Debug endpoint error:", error);
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
