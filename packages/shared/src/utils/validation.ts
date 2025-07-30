/**
 * Проверяет, является ли строка валидным email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Проверяет силу пароля
 */
export function isStrongPassword(password: string): boolean {
  // Минимум 8 символов, содержит буквы и цифры
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
  return passwordRegex.test(password);
}

/**
 * Проверяет, является ли строка валидным URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Валидация телефона
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
}

// Валидация пароля
export function isValidPassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Пароль должен содержать минимум 8 символов");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Пароль должен содержать заглавную букву");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Пароль должен содержать строчную букву");
  }

  if (!/\d/.test(password)) {
    errors.push("Пароль должен содержать цифру");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Валидация размера файла
export function isValidFileSize(fileSize: number, maxSize: number): boolean {
  return fileSize <= maxSize;
}

// Валидация типа файла
export function isValidFileType(
  fileName: string,
  allowedTypes: string[]
): boolean {
  const extension = fileName.split(".").pop()?.toLowerCase();
  return extension ? allowedTypes.includes(extension) : false;
}

// Валидация длины текста
export function isValidTextLength(
  text: string,
  minLength: number,
  maxLength: number
): boolean {
  return text.length >= minLength && text.length <= maxLength;
}

// Валидация обязательных полей
export function validateRequired(value: any, fieldName: string): string | null {
  if (value === null || value === undefined || value === "") {
    return `${fieldName} обязателен`;
  }
  return null;
}

// Валидация объекта
export function validateObject<T extends Record<string, any>>(
  obj: T,
  validators: Record<keyof T, (value: any) => string | null>
): Record<keyof T, string | null> {
  const errors: Record<keyof T, string | null> = {} as Record<
    keyof T,
    string | null
  >;

  for (const [key, validator] of Object.entries(validators)) {
    errors[key as keyof T] = validator(obj[key as keyof T]);
  }

  return errors;
}

// Проверка наличия ошибок
export function hasErrors(errors: Record<string, string | null>): boolean {
  return Object.values(errors).some((error) => error !== null);
}

// Валидация ID
export function isValidId(id: string): boolean {
  return /^[a-zA-Z0-9-_]+$/.test(id) && id.length > 0;
}

// Валидация UUID
export function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Валидация даты
export function isValidDate(date: string): boolean {
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
}

// Валидация числа в диапазоне
export function isValidNumberRange(
  value: number,
  min: number,
  max: number
): boolean {
  return value >= min && value <= max;
}

// Валидация массива
export function isValidArray<T>(
  array: T[],
  minLength = 0,
  maxLength?: number
): boolean {
  if (!Array.isArray(array)) return false;
  if (array.length < minLength) return false;
  if (maxLength && array.length > maxLength) return false;
  return true;
}
