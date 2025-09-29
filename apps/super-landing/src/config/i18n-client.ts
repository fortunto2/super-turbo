// Client-side i18n configuration for client components
export const i18nClient = {
  defaultLocale: "en" as const,
  locales: ["en", "ru", "tr", "es", "hi"] as const,
  localeDetection: true,
  domains: undefined,
  cookieName: "NEXT_LOCALE" as const,
  cookieMaxAge: 31536000, // 1 year in seconds
  preserveRouteOnHome: true,
};

export type Locale = (typeof i18nClient.locales)[number];
