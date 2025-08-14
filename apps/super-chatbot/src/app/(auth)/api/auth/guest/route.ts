import { signIn } from "@/app/(auth)/auth";
import { isDevelopmentEnvironment } from "@/lib/constants";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import { getOrCreateServerGuestSessionId } from "@/lib/session-utils-server";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const redirectUrl = searchParams.get("redirectUrl") || "/";

  const token = await getToken({
    req: request,
    secret:
      process.env.AUTH_SECRET ||
      process.env.NEXTAUTH_SECRET ||
      (process.env.NODE_ENV !== "production"
        ? "dev-secret-change-me"
        : undefined),
    secureCookie: !isDevelopmentEnvironment,
  });

  if (token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Обеспечиваем наличие cookie с sessionId ДО вызова signIn
  let sessionId =
    (await cookies()).get("superduperai_guest_session")?.value || null;
  if (!sessionId) {
    sessionId = `guest-session-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}`;
    (await cookies()).set("superduperai_guest_session", sessionId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60,
    });
  }

  // Выполняем вход с sessionId
  return signIn("guest", {
    redirect: true,
    redirectTo: redirectUrl,
  });
}
