import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { i18n, Locale } from "./config/i18n-config";
import { match as matchLocale } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";

// Stable anonymous user cookie name
const USER_ID_COOKIE = "superduperai_uid";

function ensureUserIdCookie(request: NextRequest, response?: NextResponse) {
  const uid = request.cookies.get(USER_ID_COOKIE)?.value;
  if (uid) return response ?? NextResponse.next();

  // Generate a UUID compatible with middleware runtime
  const newUid =
    globalThis.crypto && "randomUUID" in globalThis.crypto
      ? (globalThis.crypto as Crypto).randomUUID()
      : `${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 10)}-${Math.random()
          .toString(16)
          .slice(2, 10)}`;

  const res = response ?? NextResponse.next();
  // 2 years
  const twoYears = 60 * 60 * 24 * 365 * 2;
  res.cookies.set(USER_ID_COOKIE, newUid, {
    path: "/",
    maxAge: twoYears,
    sameSite: "lax",
  });
  return res;
}

// Список специальных файлов и путей, которые должны быть доступны без локали
const PUBLIC_FILES = ["/llms.txt", "/favicon.ico", "/robots.txt"];

// Регулярное выражение для обнаружения Markdown-расширения в конце URL
const MD_EXTENSION_REGEX = /\.md$/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Пропускаем API маршруты без изменений
  if (pathname.startsWith("/api/")) {
    // Убедимся, что у пользователя есть стабильный анонимный идентификатор
    return ensureUserIdCookie(request);
  }

  // Специальная обработка для sitemap.xml - полностью пропускаем через middleware
  if (pathname === "/sitemap.xml") {
    return ensureUserIdCookie(request);
  }

  // Пропускаем специальные файлы без изменений
  if (PUBLIC_FILES.some((file) => pathname === file)) {
    return ensureUserIdCookie(request);
  }

  // Проверяем, содержит ли URL .md в конце
  if (MD_EXTENSION_REGEX.test(pathname)) {
    // Извлекаем путь без расширения .md
    const pathWithoutExtension = pathname.replace(MD_EXTENSION_REGEX, "");

    // Получаем сегменты пути для правильного маппинга
    const pathSegments = pathWithoutExtension.split("/").filter(Boolean);

    // Определяем, есть ли локаль в URL
    let locale: string = i18n.defaultLocale;
    let contentType: string = "";
    let slug: string = "";

    if (pathSegments.length > 0) {
      // Проверяем, является ли первый сегмент локалью
      if (i18n.locales.includes(pathSegments[0] as Locale)) {
        locale = pathSegments[0];

        // Если после локали есть тип и слаг
        if (pathSegments.length >= 3) {
          contentType = pathSegments[1];
          slug = pathSegments[2];
        }
        // Если после локали только один сегмент - это слаг для pages
        else if (pathSegments.length === 2) {
          contentType = "pages";
          slug = pathSegments[1];
        }
      }
      // Если первый сегмент не локаль
      else {
        // Для путей вида /tool/slug.md или /about.md
        if (pathSegments.length >= 2) {
          contentType = pathSegments[0];
          slug = pathSegments[1];
        } else {
          contentType = "pages";
          slug = pathSegments[0];
        }
      }
    }

    // Проверяем, имеем ли мы все необходимые данные
    if (contentType && slug) {
      // Преобразуем contentType для правильного маппинга на структуру файлов
      if (
        contentType === "about" ||
        contentType === "pricing" ||
        contentType === "privacy" ||
        contentType === "terms" ||
        contentType === "creators"
      ) {
        slug = contentType;
        contentType = "pages";
      }

      // Обработка возможных несоответствий слагов между языками
      if (contentType === "case" && slug.startsWith("ai-")) {
        const baseSlug = slug.replace(/^ai-/, "").replace(/-generator$/, "");

        // Пробуем более простой вариант слага, если baseSlug не пустой
        if (baseSlug) {
          slug = baseSlug;
        }
      }

      // Формируем URL для API маршрута
      const apiUrl = new URL(
        `/api/markdown/${contentType}/${locale}/${slug}.md`,
        request.url
      );

      // Перенаправляем запрос на API маршрут
      return ensureUserIdCookie(request, NextResponse.rewrite(apiUrl));
    }
  }

  const isRscRequest = request.nextUrl.searchParams.has("_rsc");
  if (isRscRequest) {
    const headers = new Headers(request.headers);
    headers.set("x-nextjs-data", "1");
    return ensureUserIdCookie(
      request,
      NextResponse.next({ request: { headers } })
    );
  }

  // Проверяем, является ли текущий путь корневым путем с локалью (например, /en, /ru)
  const isLocaleRoot = i18n.locales.some((locale) => pathname === `/${locale}`);
  if (isLocaleRoot) {
    // Редиректим с /locale на корень /
    return NextResponse.redirect(new URL("/", request.url));
  }

  const pathnameHasLocale = i18n.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    const locale = getLocale(request) || i18n.defaultLocale;

    // Используем rewrite для корневого пути, сохраняя чистый URL
    if (pathname === "/" && i18n.preserveRouteOnHome) {
      const url = new URL(`/${locale}${pathname}`, request.url);
      return ensureUserIdCookie(request, NextResponse.rewrite(url));
    }

    // Для остальных путей используем обычный redirect
    const url = new URL(`/${locale}${pathname}`, request.url);
    return ensureUserIdCookie(request, NextResponse.redirect(url));
  } else {
    // Если в URL есть локаль, обновляем cookie для синхронизации
    const pathSegments = pathname.split("/").filter(Boolean);
    if (
      pathSegments.length > 0 &&
      i18n.locales.includes(pathSegments[0] as Locale)
    ) {
      const urlLocale = pathSegments[0];
      const cookieLocale = request.cookies.get(i18n.cookieName)?.value;

      // Обновляем cookie только если она отличается от локали в URL
      if (cookieLocale !== urlLocale) {
        const response = ensureUserIdCookie(request, NextResponse.next());
        response.cookies.set(i18n.cookieName, urlLocale, {
          path: "/",
          maxAge: i18n.cookieMaxAge,
        });
        return response;
      }
    }
  }

  return ensureUserIdCookie(request, NextResponse.next());
}

function getLocale(request: NextRequest): string | undefined {
  const { pathname } = request.nextUrl;
  const availableLocales = [...i18n.locales] as string[];

  // 1. Сначала проверяем, есть ли локаль в URL
  const pathSegments = pathname.split("/").filter(Boolean);
  if (
    pathSegments.length > 0 &&
    i18n.locales.includes(pathSegments[0] as Locale)
  ) {
    // Если в URL есть локаль, используем её
    return pathSegments[0];
  }

  // 2. Если в URL нет локали, пробуем достать из куки
  const cookieLocale = request.cookies.get(i18n.cookieName)?.value;
  if (
    cookieLocale &&
    (i18n.locales as readonly string[]).includes(cookieLocale)
  ) {
    return cookieLocale;
  }

  // 3. Если куки нет, смотрим Accept-Language
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    negotiatorHeaders[key] = value;
  });

  const languages = new Negotiator({ headers: negotiatorHeaders }).languages(
    availableLocales
  );

  return matchLocale(languages, i18n.locales, i18n.defaultLocale);
}

// Обновляем matcher, чтобы корректно обрабатывать все пути, кроме статических ресурсов
export const config = {
  matcher: [
    // Исключаем статические пути
    "/((?!_next|static|images|fonts).*)",
    // Но включаем sitemap.xml и llms.txt явно, так как они генерируются Next.js
    "/sitemap.xml",
    "/llms.txt",
    "/robots.txt",
  ],
};
