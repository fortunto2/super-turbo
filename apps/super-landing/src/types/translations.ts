// Типизация для переводов super-landing
// Импортируем автоматически сгенерированные типы из packages/shared

import { SuperLandingTranslationKey } from "@turbo-super/shared";

export type {
  SuperLandingTranslationKey,
  Locale,
  LocaleConfig,
  LocaleMap,
  Dictionary,
  TranslationConfig,
  NestedDictionary,
} from "@turbo-super/shared";

// Тип для параметров в переводах (например, {amount}, {price})
export type TranslationParams = Record<string, string | number>;

// Тип для функции перевода
export type TranslationFunction = <T = string>(
  key: SuperLandingTranslationKey,
  fallback?: T
) => T;

// Тип для функции перевода с поддержкой строковых ключей (для обратной совместимости)
export type FlexibleTranslationFunction = <T = string>(
  key: SuperLandingTranslationKey | string,
  fallback?: T
) => T;
