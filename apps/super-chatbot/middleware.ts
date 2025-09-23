import { NextResponse, type NextRequest } from "next/server";
import { monitoringMiddleware } from "@/lib/monitoring/monitoring-middleware";

export async function middleware(request: NextRequest) {
  // Простая проверка для ping endpoint (для тестов)
  if (request.nextUrl.pathname.startsWith("/ping")) {
    return new Response("pong", { status: 200 });
  }

  // Обрабатываем запрос через middleware мониторинга
  return monitoringMiddleware.handleRequest(request, async () => {
    // Пропускаем все остальные запросы без изменений
    return NextResponse.next();
  });
}

export const config = {
  matcher: [
    // Обрабатываем только API маршруты и основные страницы
    "/api/:path*",
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.).*)",
  ],
};
