// Translation system exports
export * from "./types";
export * from "./config";
export * from "./config-server";
export * from "./dictionaries";
export * from "./hooks";
export * from "./utils";

// Server-side dictionary functions
export { getSuperLandingDictionaryServer } from "./dictionaries/super-landing/dictionaries-server";

// Client-side dictionary functions
export { getSuperLandingDictionary } from "./dictionaries/super-landing/dictionaries";
