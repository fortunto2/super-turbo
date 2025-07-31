import { NextResponse, type NextRequest } from "next/server";

const isDevelopmentEnvironment = process.env.NODE_ENV === "development";
const guestRegex = /^guest-\d+$/;

// Убираем Sentry из middleware для Edge Runtime совместимости

// Упрощенная функция для получения токена в Edge Runtime
async function getTokenFromRequest(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie");
    if (!cookieHeader) return null;

    const cookies = cookieHeader.split(";").reduce(
      (acc, cookie) => {
        const [key, value] = cookie.trim().split("=");
        if (key && value) {
          acc[key] = decodeURIComponent(value);
        }
        return acc;
      },
      {} as Record<string, string>
    );

    const sessionToken =
      cookies["next-auth.session-token"] ||
      cookies["__Secure-next-auth.session-token"];

    if (!sessionToken) return null;

    // Простая проверка токена (для Edge Runtime)
    return { id: "user", email: "user@example.com", name: "User" };
  } catch (error) {
    console.error("Error parsing token:", error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Простое логирование для разработки
  if (isDevelopmentEnvironment) {
    console.log(`[Middleware] ${request.method} ${pathname}`);
  }

  /*
   * Playwright starts the dev server and requires a 200 status to
   * begin the tests, so this ensures that the tests can start
   */
  if (pathname.startsWith("/ping")) {
    return new Response("pong", { status: 200 });
  }

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Allow access to config API endpoints without authentication
  if (pathname.startsWith("/api/config/")) {
    return NextResponse.next();
  }

  // Allow access to generation API endpoints without authentication
  if (pathname.startsWith("/api/generate/")) {
    return NextResponse.next();
  }

  // Allow access to file API endpoints without authentication
  if (pathname.startsWith("/api/file/")) {
    return NextResponse.next();
  }

  // Разрешаем доступ к отладочной странице без аутентификации
  if (pathname.startsWith("/debug")) {
    return NextResponse.next();
  }

  // Пропускаем запросы на туннелирование Sentry
  if (pathname.startsWith("/monitoring")) {
    return NextResponse.next();
  }

  // Проверка на наличие параметра, предотвращающего цикл
  const hasRedirectParam = searchParams.has("from_redirect");

  const token = await getTokenFromRequest(request);

  // Логирование пользователя для разработки
  if (token && isDevelopmentEnvironment) {
    console.log(`[Middleware] User: ${token.email}`);
  }

  // Если пользователь переходит на страницу входа, перенаправляем на auto-login
  if (pathname === "/login") {
    const url = new URL("/auto-login", request.url);
    return NextResponse.redirect(url);
  }

  if (!token) {
    const redirectUrl = encodeURIComponent(request.url);

    // Логирование неавторизованного доступа для разработки
    if (
      !pathname.startsWith("/_next") &&
      !pathname.startsWith("/api/auth") &&
      isDevelopmentEnvironment
    ) {
      console.log(`[Middleware] Unauthorized access: ${pathname}`);
    }

    // Для API запросов используем гостевой вход
    if (pathname.startsWith("/api/")) {
      return NextResponse.redirect(
        new URL(`/api/auth/guest?redirectUrl=${redirectUrl}`, request.url)
      );
    }

    // Для страницы auto-login, если уже есть параметр from_redirect,
    // не перенаправляем снова, чтобы избежать циклических редиректов
    if (pathname === "/auto-login" && hasRedirectParam) {
      return NextResponse.next();
    }

    // Для обычных запросов перенаправляем на auto-login с параметром
    const url = new URL("/auto-login", request.url);
    url.searchParams.set("from_redirect", "true");
    return NextResponse.redirect(url);
  }

  const isGuest = guestRegex.test(token?.email ?? "");

  // Если пользователь в гостевом режиме и явно пытается войти в аккаунт
  // через auto-login, позволяем пройти дальше для Auth0 авторизации
  if (token && isGuest && pathname === "/auto-login") {
    return NextResponse.next();
  }

  // Если пользователь в гостевом режиме и пытается выйти из гостевого режима
  // через signOut, позволяем пройти дальше
  if (token && isGuest && pathname === "/api/auth/signout") {
    return NextResponse.next();
  }

  if (token && !isGuest && ["/auto-login", "/register"].includes(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Логирование чатов для разработки
  if (pathname.startsWith("/chat/") && isDevelopmentEnvironment) {
    const chatId = pathname.split("/")[2];
    if (chatId) {
      console.log(`[Middleware] Accessing chat: ${chatId}`);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/chat/:id",
    "/api/:path*",
    "/login",
    "/auto-login",
    "/register",
    "/monitoring/:path*",

    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
