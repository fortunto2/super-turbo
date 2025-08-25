"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { Button } from "@turbo-super/ui";
import { default as Link } from "@/components/ui/optimized-link";
import { ChevronDown, Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Dropdown } from "../ui/dropdown-menu";
import { i18nClient, type Locale } from "@/config/i18n-client";
import { cn } from "@turbo-super/ui";
import { useTranslation } from "@/hooks/use-translation";
import { getValidLocale } from "@/lib/get-valid-locale";
import { APP_URLS } from "@/lib/constants";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [currentLocale, setCurrentLocale] = useState<Locale>("en");

  const params = useParams();
  const pathname = usePathname();

  // Функция для получения локали из URL
  const getLocaleFromPathname = useCallback((path: string): string => {
    const segments = path.split("/").filter(Boolean);
    if (
      segments.length > 0 &&
      i18nClient.locales.includes(segments[0] as Locale)
    ) {
      return segments[0];
    }
    return i18nClient.defaultLocale;
  }, []);

  // Получаем локаль с приоритетом URL
  const getLocale = useCallback(async () => {
    try {
      let localeValue: Locale = i18nClient.defaultLocale as Locale;

      // 1. Проверяем URL (pathname)
      const urlLocale = getLocaleFromPathname(pathname);
      if (urlLocale && urlLocale !== i18nClient.defaultLocale) {
        localeValue = urlLocale as Locale;
      }

      // 2. Если в URL нет локали, проверяем params
      if (
        localeValue === i18nClient.defaultLocale &&
        params &&
        "locale" in params
      ) {
        const localeParam = params.locale;
        if (
          localeParam &&
          typeof localeParam === "object" &&
          "then" in localeParam
        ) {
          const resolvedLocale = await localeParam;
          if (
            typeof resolvedLocale === "string" &&
            i18nClient.locales.includes(resolvedLocale as Locale)
          ) {
            localeValue = resolvedLocale as Locale;
          }
        } else if (
          typeof localeParam === "string" &&
          i18nClient.locales.includes(localeParam as Locale)
        ) {
          localeValue = localeParam as Locale;
        } else if (
          Array.isArray(localeParam) &&
          localeParam[0] &&
          i18nClient.locales.includes(localeParam[0] as Locale)
        ) {
          localeValue = localeParam[0] as Locale;
        }
      }

      // 3. Если все еще default, проверяем cookie (только на клиенте)
      if (
        localeValue === i18nClient.defaultLocale &&
        typeof window !== "undefined"
      ) {
        const cookies = document.cookie.split(";");
        const localeCookie = cookies.find((cookie) =>
          cookie.trim().startsWith(`${i18nClient.cookieName}=`)
        );
        if (localeCookie) {
          const cookieValue = localeCookie.split("=")[1];
          if (i18nClient.locales.includes(cookieValue as Locale)) {
            localeValue = cookieValue as Locale;
          }
        }
      }

      setCurrentLocale(localeValue);
    } catch (error) {
      console.error("Error getting locale:", error);
      setCurrentLocale(i18nClient.defaultLocale as Locale);
    }
  }, [params, pathname, getLocaleFromPathname]);

  useEffect(() => {
    setIsClient(true);
    getLocale();
  }, [getLocale]);

  useEffect(() => {
    if (isClient) {
      getLocale();
    }
  }, [pathname, isClient, getLocale]);

  const locale = currentLocale || getValidLocale(params.locale);
  const { t } = useTranslation(locale);

  useEffect(() => {
    setIsClient(true);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={`sticky top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 shadow-sm backdrop-blur-md py-2 border-b border-accent/10"
          : "bg-transparent py-4"
      }`}
    >
      <div className="container flex items-center justify-between">
        {/* Логотип */}
        <Link
          href="/"
          className="font-bold text-xl md:text-2xl flex items-center"
          title={t("navbar.home") + " - SuperDuperAI"}
        >
          <Logo className="" />
          <span className="text-accent">Super</span>DuperAI
        </Link>

        {/* Основная навигация - скрыта на мобильных */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-muted-foreground hover:text-accent transition-colors"
            title={t("navbar.home") + " - SuperDuperAI"}
          >
            {t("navbar.home")}
          </Link>
          <Link
            href="/about"
            className="text-muted-foreground hover:text-accent transition-colors"
            title={t("navbar.about") + " - SuperDuperAI"}
          >
            {t("navbar.about")}
          </Link>
          <Link
            href="/pricing"
            className="text-muted-foreground hover:text-accent transition-colors"
            title={t("navbar.pricing") + " - SuperDuperAI"}
          >
            {t("navbar.pricing")}
          </Link>
          <Link
            href="/blog"
            className="text-muted-foreground hover:text-accent transition-colors"
            title={t("navbar.blog") + " - SuperDuperAI"}
          >
            {t("navbar.blog")}
          </Link>
          <Link
            href="/tool"
            className="text-muted-foreground hover:text-accent transition-colors"
            title={t("navbar.tools") + " - SuperDuperAI"}
          >
            {t("navbar.tools")}
          </Link>
        </nav>

        {/* Кнопки действий - скрыты на мобильных */}
        <div className="hidden md:flex items-center gap-4">
          <LanguageSwitcher />
          <Button
            variant="outline"
            size="sm"
            className="border-accent/50 hover:border-accent/80 hover:text-accent"
            asChild
          >
            <a
              href={APP_URLS.DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer nofollow"
              title="discord"
            >
              Discord
            </a>
          </Button>
          <Button
            size="sm"
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
            asChild
          >
            <a
              href={APP_URLS.EDITOR_URL}
              target="_blank"
              rel="noopener noreferrer nofollow"
              title={t("navbar.start")}
            >
              {t("navbar.start")}
            </a>
          </Button>
        </div>

        {/* Мобильное меню */}
        <button
          className="block md:hidden text-foreground hover:text-accent transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={
            isMobileMenuOpen ? t("navbar.close_menu") : t("navbar.open_menu")
          }
        >
          {isClient && (
            <>
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </>
          )}
        </button>
      </div>

      {/* Мобильная навигация */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-background/95 backdrop-blur-md border-b border-accent/10 shadow-md md:hidden">
          <div className="container py-4 flex flex-col gap-4">
            <nav className="flex flex-col gap-4">
              <Link
                href="/"
                className="text-muted-foreground hover:text-accent transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
                title={t("navbar.home") + " - SuperDuperAI"}
              >
                {t("navbar.home")}
              </Link>
              <Link
                href="/about"
                className="text-muted-foreground hover:text-accent transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
                title={t("navbar.about") + " - SuperDuperAI"}
              >
                {t("navbar.about")}
              </Link>
              <Link
                href="/pricing"
                className="text-muted-foreground hover:text-accent transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
                title={t("navbar.pricing") + " - SuperDuperAI"}
              >
                {t("navbar.pricing")}
              </Link>
              <Link
                href="/blog"
                className="text-muted-foreground hover:text-accent transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
                title={t("navbar.blog") + " - SuperDuperAI"}
              >
                {t("navbar.blog")}
              </Link>
              <Link
                href="/tool"
                className="text-muted-foreground hover:text-accent transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
                title={t("navbar.tools") + " - SuperDuperAI"}
              >
                {t("navbar.tools")}
              </Link>
              <Link
                href="/terms"
                className="text-muted-foreground hover:text-accent transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
                title={t("navbar.terms") + " - SuperDuperAI"}
              >
                {t("navbar.terms")}
              </Link>
              <Link
                href="/privacy"
                className="text-muted-foreground hover:text-accent transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
                title={t("navbar.privacy") + " - SuperDuperAI"}
              >
                {t("navbar.privacy")}
              </Link>
            </nav>
            <div className="flex flex-col gap-3 mt-2">
              <LanguageSwitcher />
              <Button
                variant="outline"
                size="sm"
                className="w-full border-accent/50 hover:border-accent/80 hover:text-accent"
                asChild
              >
                <a
                  href="https://discord.gg/superduperai"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  title="Discord"
                >
                  Discord
                </a>
              </Button>
              <Button
                size="sm"
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                asChild
              >
                <a
                  href={APP_URLS.EDITOR_URL}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  title={t("navbar.start")}
                >
                  {t("navbar.start")}
                </a>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "ru", label: "Русский" },
  { value: "tr", label: "Türkçe" },
  { value: "es", label: "Español" },
  { value: "hi", label: "हिन्दी" },
];

export const LanguageSwitcher = () => {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();

  const [currentLocale, setCurrentLocale] = useState<Locale>("en");
  const [selected, setSelected] = useState<Locale>("en");
  const [isClient, setIsClient] = useState(false);

  // Функция для получения локали из URL
  const getLocaleFromPathname = useCallback((path: string): string => {
    const segments = path.split("/").filter(Boolean);
    if (
      segments.length > 0 &&
      i18nClient.locales.includes(segments[0] as Locale)
    ) {
      return segments[0];
    }
    return i18nClient.defaultLocale;
  }, []);

  // Используем useCallback для получения локали
  const getLocale = useCallback(async () => {
    try {
      // Приоритет: сначала URL, потом params, потом cookie, потом default
      let localeValue: Locale = i18nClient.defaultLocale as Locale;

      // 1. Проверяем URL (pathname)
      const urlLocale = getLocaleFromPathname(pathname);
      if (urlLocale && urlLocale !== i18nClient.defaultLocale) {
        localeValue = urlLocale as Locale;
      }

      // 2. Если в URL нет локали, проверяем params
      if (
        localeValue === i18nClient.defaultLocale &&
        params &&
        "locale" in params
      ) {
        const localeParam = params.locale;

        if (
          localeParam &&
          typeof localeParam === "object" &&
          "then" in localeParam
        ) {
          const resolvedLocale = await localeParam;
          if (
            typeof resolvedLocale === "string" &&
            i18nClient.locales.includes(resolvedLocale as Locale)
          ) {
            localeValue = resolvedLocale as Locale;
          }
        } else if (
          typeof localeParam === "string" &&
          i18nClient.locales.includes(localeParam as Locale)
        ) {
          localeValue = localeParam as Locale;
        } else if (
          Array.isArray(localeParam) &&
          localeParam[0] &&
          i18nClient.locales.includes(localeParam[0] as Locale)
        ) {
          localeValue = localeParam[0] as Locale;
        }
      }

      // 3. Если все еще default, проверяем cookie (только на клиенте)
      if (
        localeValue === i18nClient.defaultLocale &&
        typeof window !== "undefined"
      ) {
        const cookies = document.cookie.split(";");
        const localeCookie = cookies.find((cookie) =>
          cookie.trim().startsWith(`${i18nClient.cookieName}=`)
        );
        if (localeCookie) {
          const cookieValue = localeCookie.split("=")[1];
          if (i18nClient.locales.includes(cookieValue as Locale)) {
            localeValue = cookieValue as Locale;
          }
        }
      }

      setCurrentLocale(localeValue);
      setSelected(localeValue);
    } catch (error) {
      console.error("Error getting locale:", error);
      setCurrentLocale(i18nClient.defaultLocale as Locale);
      setSelected(i18nClient.defaultLocale as Locale);
    }
  }, [params, pathname, getLocaleFromPathname]);

  useEffect(() => {
    setIsClient(true);
    getLocale();
  }, [getLocale]);

  // Дополнительный useEffect для обновления при изменении pathname
  useEffect(() => {
    if (isClient) {
      getLocale();
    }
  }, [pathname, isClient, getLocale]);

  const handleChange = (language: string) => {
    if (language === currentLocale) return;

    setSelected(language as Locale);

    // Устанавливаем cookie для сохранения выбранного языка
    document.cookie = `${i18nClient.cookieName}=${language}; path=/; max-age=${i18nClient.cookieMaxAge}`;

    // Получаем текущую локаль из URL
    const currentUrlLocale = getLocaleFromPathname(pathname);

    // Для главной страницы, если мы используем чистые URL
    if (
      i18nClient.preserveRouteOnHome &&
      (pathname === "/" ||
        pathname === `/${currentUrlLocale}` ||
        pathname === `/${currentUrlLocale}/`)
    ) {
      // Используем простое перенаправление на корневой URL для сохранения чистого URL
      window.location.href = "/";
      return;
    }

    // Для остальных страниц обновляем локаль в пути
    if (pathname) {
      const segments = pathname.split("/").filter(Boolean);

      // Если первый сегмент - это локаль, заменяем её
      if (segments.length > 0 && i18nClient.locales.includes(segments[0] as Locale)) {
        segments[0] = language;
      } else {
        // Если локали нет в URL, добавляем её в начало
        segments.unshift(language);
      }

      const newPath = "/" + segments.join("/");
      router.push(newPath);
    }
  };

  // Отображаем дропдаун только когда параметры получены
  if (!currentLocale) return null;

  const label = LANGUAGES.find((o) => o.value === selected)?.label;

  return (
    <Dropdown
      value={selected}
      options={LANGUAGES}
      onChange={handleChange}
      trigger={
        <button
          className={cn(
            "inline-flex items-center gap-2 px-3 py-1 text-sm border rounded-md bg-background hover:bg-muted transition"
          )}
        >
          {label}
          {isClient && <ChevronDown className="w-4 h-4" />}
        </button>
      }
    />
  );
};
