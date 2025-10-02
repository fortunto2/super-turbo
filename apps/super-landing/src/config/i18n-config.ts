// Re-export from shared package
export {
  i18n,
  localeMap,
  localeCookieName,
} from "@turbo-super/shared/translation";

// Define Locale type locally since it's not exported from shared package
export type Locale =
  | "en"
  | "ru"
  | "tr"
  | "es"
  | "hi"
  | "fr"
  | "de"
  | "it"
  | "pt"
  | "pl"
  | "uk"
  | "zh"
  | "ja"
  | "ko"
  | "ar";
