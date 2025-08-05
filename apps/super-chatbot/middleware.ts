// Временно отключен middleware для диагностики проблем с турборепозиторием
// import { NextResponse, type NextRequest } from "next/server";

// export async function middleware(request: NextRequest) {
//   // Простая проверка для ping endpoint (для тестов)
//   if (request.nextUrl.pathname.startsWith("/ping")) {
//     return new Response("pong", { status: 200 });
//   }

//   // Пропускаем все остальные запросы без изменений
//   return NextResponse.next();
// }

// Временно отключаем matcher для диагностики проблемы с турборепозиторием
// export const config = {
//   matcher: [
//     // Обрабатываем только API маршруты и основные страницы
//     "/api/:path*",
//     "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.).*)",
//   ],
// };
