// Server-side i18n configuration for middleware
export const i18nServer = {
  defaultLocale: "en" as const,
  locales: ["en", "ru", "tr", "es", "hi"] as const,
  localeDetection: true,
  domains: undefined,
  cookieName: "NEXT_LOCALE" as const,
  cookieMaxAge: 31536000, // 1 year in seconds
  preserveRouteOnHome: true,
};

export type Locale = (typeof i18nServer.locales)[number];
