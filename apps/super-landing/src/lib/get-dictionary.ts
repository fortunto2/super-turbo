import { getSuperLandingDictionaryServer } from "@turbo-super/shared";
import type { Locale } from "@/config/i18n-server";

export function getDictionary(locale: Locale) {
  return getSuperLandingDictionaryServer(locale);
}
