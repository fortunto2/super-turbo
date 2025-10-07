import { signIn } from "@/app/(auth)/auth";
import { isDevelopmentEnvironment } from "@/lib/constants";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const redirectUrl = searchParams.get("redirectUrl") || "/";

    const secret =
      process.env.AUTH_SECRET ||
      process.env.NEXTAUTH_SECRET ||
      (process.env.NODE_ENV !== "production"
        ? "dev-secret-change-me"
        : "fallback-secret");

    // Добавляем проверку на существование secret
    if (!secret || secret === "fallback-secret") {
      console.warn("⚠️ Auth secret is not properly configured");
    }

    const token = await getToken({
      req: request,
      secret,
      secureCookie: !isDevelopmentEnvironment,
    });

    if (token) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Выполняем вход как гость
    return signIn("guest", {
      redirect: true,
      redirectTo: redirectUrl,
    });
  } catch (error) {
    console.error("❌ Error in guest auth route:", error);
    
    // Возвращаем ошибку вместо краша
    return NextResponse.json(
      { error: "Authentication error" },
      { status: 500 }
    );
  }
}
