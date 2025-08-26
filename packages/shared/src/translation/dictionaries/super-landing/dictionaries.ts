import { en } from "./en";
import { ru } from "./ru";
import { tr } from "./tr";
import { es } from "./es";
import { hi } from "./hi";
import type { NestedDictionary, Locale } from "../../types";

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
