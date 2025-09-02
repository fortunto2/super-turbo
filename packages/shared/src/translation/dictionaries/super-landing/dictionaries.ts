import { en } from "./en";
import { ru } from "./ru";
import { tr } from "./tr";
import { es } from "./es";
import { hi } from "./hi";
import type {
  NestedDictionary,
  Locale,
  SuperLandingTranslationKey,
} from "../../types";

export const superLandingDictionaries: Record<Locale, NestedDictionary> = {
  en,
  ru,
  tr,
  es,
  hi,
};

export { en, ru, tr, es, hi };

export function getSuperLandingDictionary(locale: Locale): NestedDictionary {
  return superLandingDictionaries[locale] || en;
}

export function getClientSuperLandingTranslation(locale: Locale) {
  const dict = getSuperLandingDictionary(locale);

  // Перегрузка функции для лучшего автодополнения
  function t<T = string>(key: SuperLandingTranslationKey, fallback?: T): T;
  function t<T = string>(key: string, fallback?: T): T;
  function t<T = string>(
    key: SuperLandingTranslationKey | string,
    fallback?: T
  ): T {
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

  return { t, dict };
}
