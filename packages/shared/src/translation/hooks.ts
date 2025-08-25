import { useCallback, useMemo } from "react";
import type { NestedDictionary, Locale } from "./types";
import {
  getTranslation,
  getTranslationWithInterpolation,
  hasTranslation,
  getAllTranslationKeys,
} from "./utils";

/**
 * Hook for using translations in React components
 * @param dictionary - The dictionary to use for translations
 * @returns Object with translation functions and utilities
 */
export function useTranslations(dictionary: NestedDictionary) {
  const t = useCallback(
    (key: string, fallback?: string): string => {
      return getTranslation(dictionary, key, fallback);
    },
    [dictionary]
  );

  const tWithVars = useCallback(
    (key: string, variables: Record<string, any> = {}, fallback?: string): string => {
      return getTranslationWithInterpolation(dictionary, key, variables, fallback);
    },
    [dictionary]
  );

  const has = useCallback(
    (key: string): boolean => {
      return hasTranslation(dictionary, key);
    },
    [dictionary]
  );

  const keys = useMemo(() => {
    return getAllTranslationKeys(dictionary);
  }, [dictionary]);

  return {
    t,
    tWithVars,
    has,
    keys,
    dictionary,
  };
}

/**
 * Hook for using specific app translations
 * @param app - The app name (e.g., "super-landing", "super-chatbot")
 * @param locale - The locale to use
 * @returns Object with translation functions and utilities
 */
export function useAppTranslations(app: string, locale: Locale) {
  // This would need to be implemented based on how dictionaries are imported
  // For now, we'll return a basic structure
  const getDictionary = useCallback(() => {
    // This would dynamically import the correct dictionary
    // Implementation depends on how dictionaries are structured
    return {} as NestedDictionary;
  }, [app, locale]);

  const dictionary = useMemo(() => getDictionary(), [getDictionary]);

  return useTranslations(dictionary);
}

/**
 * Hook for using landing page translations
 * @param locale - The locale to use
 * @returns Object with translation functions and utilities
 */
export function useLandingTranslations(locale: Locale) {
  return useAppTranslations("super-landing", locale);
}

/**
 * Hook for using chatbot translations
 * @param locale - The locale to use
 * @returns Object with translation functions and utilities
 */
export function useChatbotTranslations(locale: Locale) {
  return useAppTranslations("super-chatbot", locale);
}


