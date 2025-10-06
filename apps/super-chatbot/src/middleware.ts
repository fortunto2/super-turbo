import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Простой мониторинг для критичных API
const apiMetrics = {
  requests: new Map<string, number>(),
  errors: new Map<string, number>(),
  lastReset: Date.now(),
};

function trackApiRequest(pathname: string, status: number) {
  const key = pathname;
  const current = apiMetrics.requests.get(key) || 0;
  apiMetrics.requests.set(key, current + 1);

  if (status >= 400) {
    const errorCount = apiMetrics.errors.get(key) || 0;
    apiMetrics.errors.set(key, errorCount + 1);
  }

  // Сбрасываем метрики каждый час
  if (Date.now() - apiMetrics.lastReset > 3600000) {
    apiMetrics.requests.clear();
    apiMetrics.errors.clear();
    apiMetrics.lastReset = Date.now();
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const startTime = Date.now();

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

  // Мониторим критичные API endpoints
  if (pathname.startsWith("/api/")) {
    const response = NextResponse.next();

    // Добавляем заголовки для отслеживания
    response.headers.set("X-Request-ID", crypto.randomUUID());
    response.headers.set("X-Start-Time", startTime.toString());

    // Отслеживаем запрос (будет завершено в response)
    response.headers.set("X-Track-Request", "true");

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/chat/:path*", "/api/:path*"],
};
