export { default as en } from "./en.json";
export { default as ru } from "./ru.json";
export { default as tr } from "./tr.json";
export { default as es } from "./es.json";
export { default as hi } from "./hi.json";

export type Locale = "en" | "ru" | "tr" | "es" | "hi";

export const locales: Locale[] = ["en", "ru", "tr", "es", "hi"];
export const defaultLocale: Locale = "en";
