import { getSuperLandingDictionaryServer } from "@turbo-super/shared";
import { Locale } from "@/config/i18n-client";

export function useTranslationServer(locale: Locale) {
  const dict = getSuperLandingDictionaryServer(locale);

  function t<T = string>(key: string, fallback?: T): T {
    // Ищем в словаре по ключу
    const keys = key.split(".");
    let value: unknown = dict;

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        // Если ключ не найден, возвращаем fallback или сам ключ
        if (fallback !== undefined) return fallback;
        return key as unknown as T;
      }
    }

    return value as T;
  }

  return { t };
}
