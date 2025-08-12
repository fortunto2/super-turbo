import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Проверяем, является ли это запросом к чату с ID
  if (pathname.startsWith("/chat/")) {
    const chatId = pathname.split("/chat/")[1];

    // Валидируем UUID формат
    if (
      chatId &&
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        chatId
      )
    ) {
      // Если UUID невалиден, перенаправляем на главную страницу
      console.warn(`Invalid chat ID format: ${chatId}, redirecting to home`);
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/chat/:path*"],
};
