import { en, ru, tr, es, hi, type Locale } from "../translations";

const dictionaries: Record<Locale, Record<string, any>> = {
  en,
  ru,
  tr,
  es,
  hi,
};

function getNested(obj: unknown, path: string | string[]) {
  const keys = Array.isArray(path) ? path : path.split(".");
  return keys.reduce((acc, key) => {
    if (acc && typeof acc === "object" && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

export function useTranslation(locale: Locale) {
  const dict = dictionaries[locale] || dictionaries.en;

  function t<T = string>(key: string, fallback?: T): T {
    const value = getNested(dict, key);
    if (value !== undefined) return value as T;

    if (fallback !== undefined) return fallback;
    return key as unknown as T;
  }

  return { t };
}
