/**
 * Утилиты для проверки типов (type guards)
 * Улучшают безопасность типов и помогают избежать runtime ошибок
 */

// Базовые проверки типов
export function isString(value: unknown): value is string {
  return typeof value === "string";
}

export function isNumber(value: unknown): value is number {
  return typeof value === "number" && !Number.isNaN(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

export function isFunction(value: unknown): value is Function {
  return typeof value === "function";
}

// Проверки для специфичных типов
export function isNonEmptyString(value: unknown): value is string {
  return isString(value) && value.length > 0;
}

export function isPositiveNumber(value: unknown): value is number {
  return isNumber(value) && value > 0;
}

export function isNonNegativeNumber(value: unknown): value is number {
  return isNumber(value) && value >= 0;
}

export function isInteger(value: unknown): value is number {
  return isNumber(value) && Number.isInteger(value);
}

export function isPositiveInteger(value: unknown): value is number {
  return isInteger(value) && value > 0;
}

// Проверки для объектов
export function hasProperty<K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, unknown> {
  return isObject(obj) && key in obj;
}

export function hasStringProperty<K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, string> {
  return hasProperty(obj, key) && isString(obj[key]);
}

export function hasNumberProperty<K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, number> {
  return hasProperty(obj, key) && isNumber(obj[key]);
}

export function hasBooleanProperty<K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, boolean> {
  return hasProperty(obj, key) && isBoolean(obj[key]);
}

// Проверки для массивов
export function isStringArray(value: unknown): value is string[] {
  return isArray(value) && value.every(isString);
}

export function isNumberArray(value: unknown): value is number[] {
  return isArray(value) && value.every(isNumber);
}

export function isObjectArray(
  value: unknown
): value is Record<string, unknown>[] {
  return isArray(value) && value.every(isObject);
}

// Проверки для URL
export function isValidUrl(value: unknown): value is string {
  if (!isString(value)) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function isValidEmail(value: unknown): value is string {
  if (!isString(value)) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

// Проверки для UUID
export function isValidUUID(value: unknown): value is string {
  if (!isString(value)) return false;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

// Проверки для дат
export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

export function isValidDateString(value: unknown): value is string {
  if (!isString(value)) return false;
  const date = new Date(value);
  return isValidDate(date);
}

// Проверки для JSON
export function isValidJSON(value: unknown): value is string {
  if (!isString(value)) return false;
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}

// Проверки для специфичных типов проекта
export function isVideoGenerationStatus(
  value: unknown
): value is
  | "idle"
  | "preparing"
  | "generating"
  | "processing"
  | "completed"
  | "error" {
  return (
    isString(value) &&
    [
      "idle",
      "preparing",
      "generating",
      "processing",
      "completed",
      "error",
    ].includes(value)
  );
}

export function isConnectionStatus(
  value: unknown
): value is "disconnected" | "connecting" | "connected" {
  return (
    isString(value) &&
    ["disconnected", "connecting", "connected"].includes(value)
  );
}

export function isImageFormat(
  value: unknown
): value is "jpg" | "jpeg" | "png" | "webp" | "gif" {
  return (
    isString(value) &&
    ["jpg", "jpeg", "png", "webp", "gif"].includes(value.toLowerCase())
  );
}

export function isVideoFormat(
  value: unknown
): value is "mp4" | "webm" | "avi" | "mov" {
  return (
    isString(value) &&
    ["mp4", "webm", "avi", "mov"].includes(value.toLowerCase())
  );
}

// Утилиты для безопасного доступа к свойствам
export function safeGet<T>(obj: unknown, path: string, defaultValue: T): T {
  if (!isObject(obj)) return defaultValue;

  const keys = path.split(".");
  let current: unknown = obj;

  for (const key of keys) {
    if (isObject(current) && key in current) {
      current = current[key];
    } else {
      return defaultValue;
    }
  }

  return current as T;
}

export function safeString(
  obj: unknown,
  path: string,
  defaultValue = ""
): string {
  const value = safeGet(obj, path, defaultValue);
  return isString(value) ? value : defaultValue;
}

export function safeNumber(
  obj: unknown,
  path: string,
  defaultValue = 0
): number {
  const value = safeGet(obj, path, defaultValue);
  return isNumber(value) ? value : defaultValue;
}

export function safeBoolean(
  obj: unknown,
  path: string,
  defaultValue = false
): boolean {
  const value = safeGet(obj, path, defaultValue);
  return isBoolean(value) ? value : defaultValue;
}

export function safeArray<T>(
  obj: unknown,
  path: string,
  defaultValue: T[] = []
): T[] {
  const value = safeGet(obj, path, defaultValue);
  return isArray(value) ? (value as T[]) : defaultValue;
}
