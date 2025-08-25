import type { NestedDictionary, Locale } from "./types";

/**
 * Get nested value from dictionary using dot notation
 * @param dictionary - The dictionary to search in
 * @param key - The dot notation key (e.g., "hero.title")
 * @returns The value or undefined if not found
 */
export function getNestedValue(
  dictionary: NestedDictionary,
  key: string
): any {
  const keys = key.split(".");
  let current: any = dictionary;

  for (const k of keys) {
    if (current && typeof current === "object" && k in current) {
      current = current[k];
    } else {
      return undefined;
    }
  }

  return current;
}

/**
 * Get translation value with fallback support
 * @param dictionary - The dictionary to search in
 * @param key - The dot notation key
 * @param fallback - Fallback value if key not found
 * @returns The translation value or fallback
 */
export function getTranslation(
  dictionary: NestedDictionary,
  key: string,
  fallback?: string
): string {
  const value = getNestedValue(dictionary, key);
  
  if (typeof value === "string") {
    return value;
  }
  
  return fallback || key;
}

/**
 * Interpolate variables in translation string
 * @param text - The translation text with placeholders
 * @param variables - Object with variables to interpolate
 * @returns The interpolated string
 */
export function interpolateTranslation(
  text: string,
  variables: Record<string, any>
): string {
  return text.replace(/\{(\w+)\}/g, (match, key) => {
    return variables[key] !== undefined ? String(variables[key]) : match;
  });
}

/**
 * Get translation with interpolation
 * @param dictionary - The dictionary to search in
 * @param key - The dot notation key
 * @param variables - Variables to interpolate
 * @param fallback - Fallback value if key not found
 * @returns The interpolated translation
 */
export function getTranslationWithInterpolation(
  dictionary: NestedDictionary,
  key: string,
  variables: Record<string, any> = {},
  fallback?: string
): string {
  const translation = getTranslation(dictionary, key, fallback);
  return interpolateTranslation(translation, variables);
}

/**
 * Check if a key exists in the dictionary
 * @param dictionary - The dictionary to check
 * @param key - The dot notation key
 * @returns True if key exists, false otherwise
 */
export function hasTranslation(
  dictionary: NestedDictionary,
  key: string
): boolean {
  return getNestedValue(dictionary, key) !== undefined;
}

/**
 * Get all available keys from a dictionary
 * @param dictionary - The dictionary to extract keys from
 * @returns Array of all available keys
 */
export function getAllTranslationKeys(
  dictionary: NestedDictionary,
  prefix = ""
): string[] {
  const keys: string[] = [];

  for (const [key, value] of Object.entries(dictionary)) {
    const currentKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      keys.push(...getAllTranslationKeys(value, currentKey));
    } else {
      keys.push(currentKey);
    }
  }

  return keys;
}


