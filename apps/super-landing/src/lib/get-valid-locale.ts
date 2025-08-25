import { Locale, i18nServer } from "@/config/i18n-server";

export function getValidLocale(input: unknown): Locale {
  const value =
    typeof input === "string"
      ? input
      : Array.isArray(input)
        ? input[0]
        : i18nServer.defaultLocale;

  const locales = i18nServer.locales;
  return locales.includes(value as Locale)
    ? (value as Locale)
    : i18nServer.defaultLocale;
}
