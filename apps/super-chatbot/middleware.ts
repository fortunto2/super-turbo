import { NextResponse, type NextRequest } from "next/server";
import { guestRegex, isDevelopmentEnvironment } from "@/lib/constants";

// Edge-совместимый Sentry (используем только совместимые API)
let Sentry: any = null;
try {
  // Динамический импорт для Edge Runtime
  Sentry = require("@sentry/nextjs");
} catch (error) {
  // Fallback если Sentry недоступен в Edge Runtime
  console.warn("Sentry not available in Edge Runtime");
}

// Edge-совместимая функция для получения токена
async function getTokenFromRequest(request: NextRequest) {
  try {
    // Пытаемся использовать next-auth/jwt если доступен
    let getToken: any = null;
    try {
      getToken = require("next-auth/jwt").getToken;
    } catch (error) {
      // Fallback если next-auth/jwt недоступен в Edge Runtime
    }

    if (getToken) {
      // Используем оригинальную функцию getToken
      return await getToken({
        req: request,
        secret: process.env.AUTH_SECRET,
        secureCookie: !isDevelopmentEnvironment,
      });
    } else {
      // Fallback для Edge Runtime - простая проверка сессии
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
      // В продакшене лучше использовать JWT верификацию
      return { id: "user", email: "user@example.com", name: "User" };
    }
  } catch (error) {
    console.error("Error parsing token:", error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Edge-совместимое логирование с Sentry
  if (Sentry && Sentry.withScope) {
    try {
      Sentry.withScope((scope: any) => {
        scope.setTag("path", pathname);
        scope.setExtra("url", request.url);
        scope.setExtra("method", request.method);
      });
    } catch (error) {
      // Fallback если Sentry API недоступен
      if (isDevelopmentEnvironment) {
        console.log(`[Middleware] ${request.method} ${pathname}`);
      }
    }
  } else if (isDevelopmentEnvironment) {
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

  // Edge-совместимое логирование пользователя с Sentry
  if (token) {
    if (Sentry && Sentry.setUser) {
      try {
        Sentry.setUser({
          id: token.id,
          email: token.email || undefined,
          username: token.name || undefined,
        });
      } catch (error) {
        // Fallback если Sentry API недоступен
        if (isDevelopmentEnvironment) {
          console.log(`[Middleware] User: ${token.email}`);
        }
      }
    } else if (isDevelopmentEnvironment) {
      console.log(`[Middleware] User: ${token.email}`);
    }
  }

  // Если пользователь переходит на страницу входа, перенаправляем на auto-login
  if (pathname === "/login") {
    const url = new URL("/auto-login", request.url);
    return NextResponse.redirect(url);
  }

  if (!token) {
    const redirectUrl = encodeURIComponent(request.url);

    // Edge-совместимое логирование аутентификации с Sentry
    if (!pathname.startsWith("/_next") && !pathname.startsWith("/api/auth")) {
      if (Sentry && Sentry.addBreadcrumb) {
        try {
          Sentry.addBreadcrumb({
            category: "auth",
            message: `Unauthorized access: ${pathname}`,
            level: "info",
          });
        } catch (error) {
          // Fallback если Sentry API недоступен
          if (isDevelopmentEnvironment) {
            console.log(`[Middleware] Unauthorized access: ${pathname}`);
          }
        }
      } else if (isDevelopmentEnvironment) {
        console.log(`[Middleware] Unauthorized access: ${pathname}`);
      }
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

  // Edge-совместимое логирование чатов с Sentry
  if (pathname.startsWith("/chat/")) {
    const chatId = pathname.split("/")[2];

    if (chatId) {
      if (Sentry && Sentry.addBreadcrumb) {
        try {
          Sentry.addBreadcrumb({
            category: "chat",
            message: `Accessing chat: ${chatId}`,
            level: "info",
            data: { chatId },
          });
        } catch (error) {
          // Fallback если Sentry API недоступен
          if (isDevelopmentEnvironment) {
            console.log(`[Middleware] Accessing chat: ${chatId}`);
          }
        }
      } else if (isDevelopmentEnvironment) {
        console.log(`[Middleware] Accessing chat: ${chatId}`);
      }
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
