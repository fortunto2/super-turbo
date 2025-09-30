import type { LocaleConfig, LocaleMap, TranslationConfig } from "./types";

const localeCookieName = "NEXT_LOCALE";

export const i18nServer: LocaleConfig = {
  defaultLocale: "en",
  locales: [
    "en",
    "ru",
    "tr",
    "es",
    "hi",
    "fr",
    "de",
    "it",
    "pt",
    "pl",
    "uk",
    "zh",
    "ja",
    "ko",
    "ar",
  ],
  localeDetection: true, // automatic detection by headers
  cookieName: localeCookieName,
  cookieMaxAge: 31536000, // 1 year in seconds
  preserveRouteOnHome: true, // flag for clean URLs on home page
};

// Localized language names map
export const localeMapServer: LocaleMap = {
  en: "English",
  ru: "Russian",
  tr: "Turkish",
  es: "Spanish",
  hi: "Hindi",
  fr: "French",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  pl: "Polish",
  uk: "Ukrainian",
  zh: "Chinese",
  ja: "Japanese",
  ko: "Korean",
  ar: "Arabic",
};

export const translationConfigServer: TranslationConfig = {
  i18n: i18nServer,
  localeMap: localeMapServer,
};

export type { Locale } from "./types";
