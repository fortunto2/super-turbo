import { getSuperLandingDictionaryServer } from "@turbo-super/shared";
import type { SuperLandingTranslationKey } from "@/types/translations";
import type { Locale } from "@/config/i18n-config";

// Типизированная функция для получения переводов в серверных компонентах
export function getTranslation(locale: Locale) {
  const dict = getSuperLandingDictionaryServer(locale);

  const t = <T = string>(key: SuperLandingTranslationKey, fallback?: T): T => {
    const keys = key.split(".");
    let value: unknown = dict;

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        if (fallback !== undefined) return fallback;
        return key as unknown as T;
      }
    }

    return value as T;
  };

  return { t, dict };
}
