/**
 * Система валидации и санитизации входных данных
 * Защищает от XSS, SQL injection, path traversal и других атак
 */

import { z } from "zod";
// Простая функция санитизации HTML без внешних зависимостей
const sanitizeHTML = (html: string): string => {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .replace(/<[^>]*>/g, "");
};

// Схемы валидации для различных типов данных
export const UserInputSchema = z.object({
  email: z.string().email("Некорректный email адрес"),
  name: z
    .string()
    .min(1, "Имя не может быть пустым")
    .max(100, "Имя слишком длинное"),
  password: z.string().min(8, "Пароль должен содержать минимум 8 символов"),
});

export const ChatMessageSchema = z.object({
  content: z
    .string()
    .min(1, "Сообщение не может быть пустым")
    .max(10000, "Сообщение слишком длинное"),
  role: z.enum(["user", "assistant", "system"]),
  attachments: z.array(z.string().url("Некорректный URL вложения")).optional(),
});

export const ImageGenerationSchema = z.object({
  prompt: z
    .string()
    .min(1, "Промпт не может быть пустым")
    .max(1000, "Промпт слишком длинный"),
  style: z.enum(["photorealistic", "artistic", "cinematic", "anime"]),
  size: z.enum(["1024x1024", "1024x1792", "1792x1024"]),
  quality: z.enum(["standard", "hd"]).optional(),
  negativePrompt: z
    .string()
    .max(500, "Негативный промпт слишком длинный")
    .optional(),
});

export const VideoGenerationSchema = z.object({
  prompt: z
    .string()
    .min(1, "Промпт не может быть пустым")
    .max(1000, "Промпт слишком длинный"),
  model: z.enum(["veo-3", "runway", "pika"]),
  style: z.enum(["cinematic", "documentary", "anime", "realistic"]),
  resolution: z.enum(["1920x1080", "1280x720", "1024x1024"]),
  duration: z
    .number()
    .min(1)
    .max(60, "Длительность видео не может превышать 60 секунд"),
  frameRate: z
    .number()
    .min(1)
    .max(60, "Частота кадров не может превышать 60 FPS"),
  negativePrompt: z
    .string()
    .max(500, "Негативный промпт слишком длинный")
    .optional(),
});

export const AdminActionSchema = z.object({
  action: z.enum([
    "update_user",
    "delete_user",
    "update_balance",
    "add_credits",
  ]),
  userId: z.string().uuid("Некорректный ID пользователя"),
  data: z.record(z.any()).optional(),
});

// Утилиты для санитизации
/**
 * Санитизирует HTML контент от XSS атак
 */
export function sanitizeHTMLContent(input: string): string {
  if (typeof input !== "string") return "";
  return sanitizeHTML(input);
}

/**
 * Санитизирует текст от потенциально опасных символов
 */
export function sanitizeText(input: string): string {
  if (typeof input !== "string") return "";

  return input
    .replace(/[<>]/g, "") // Удаляем угловые скобки
    .replace(/javascript:/gi, "") // Удаляем javascript: ссылки
    .replace(/on\w+\s*=/gi, "") // Удаляем event handlers
    .replace(/script/gi, "scriipt") // Заменяем script на scriipt
    .trim();
}

/**
 * Санитизирует URL от потенциально опасных схем
 */
export function sanitizeURL(input: string): string {
  if (typeof input !== "string") return "";

  try {
    const url = new URL(input);

    // Разрешаем только безопасные схемы
    const allowedSchemes = ["http", "https", "data"];
    if (!allowedSchemes.includes(url.protocol.slice(0, -1))) {
      throw new Error("Недопустимая схема URL");
    }

    return url.toString();
  } catch {
    return "";
  }
}

/**
 * Санитизирует путь файла от path traversal атак
 */
export function sanitizeFilePath(input: string): string {
  if (typeof input !== "string") return "";

  return input
    .replace(/\.\./g, "") // Удаляем ..
    .replace(/\/+/g, "/") // Удаляем множественные слеши
    .replace(/^\/+/, "") // Удаляем ведущие слеши
    .replace(/[^a-zA-Z0-9._/-]/g, ""); // Оставляем только безопасные символы
}

/**
 * Санитизирует SQL запрос от injection атак
 */
export function sanitizeSQL(input: string): string {
  if (typeof input !== "string") return "";

  return input
    .replace(/['"]/g, "") // Удаляем кавычки
    .replace(/;/g, "") // Удаляем точки с запятой
    .replace(/--/g, "") // Удаляем SQL комментарии
    .replace(/\/\*/g, "") // Удаляем начало блочных комментариев
    .replace(/\*\//g, "") // Удаляем конец блочных комментариев
    .replace(
      /\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b/gi,
      ""
    ); // Удаляем SQL ключевые слова
}

/**
 * Санитизирует JSON от потенциально опасных данных
 */
export function sanitizeJSON(input: any): any {
  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input);
      return sanitizeJSON(parsed);
    } catch {
      return null;
    }
  }

  if (Array.isArray(input)) {
    return input.map((item) => sanitizeJSON(item));
  }

  if (input && typeof input === "object") {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      // Санитизируем ключи
      const cleanKey = sanitizeText(key);
      if (cleanKey) {
        sanitized[cleanKey] = sanitizeJSON(value);
      }
    }
    return sanitized;
  }

  return input;
}

// Утилиты для валидации
/**
 * Валидирует данные по схеме Zod
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): {
  success: boolean;
  data?: T;
  errors?: string[];
} {
  try {
    const result = schema.safeParse(data);

    if (result.success) {
      return { success: true, data: result.data };
    } else {
      return {
        success: false,
        errors: result.error.errors.map((err) => err.message),
      };
    }
  } catch (error) {
    return {
      success: false,
      errors: ["Ошибка валидации данных"],
    };
  }
}

/**
 * Валидирует email адрес
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Валидирует URL
 */
export function validateURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Валидирует UUID
 */
export function validateUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Валидирует пароль на соответствие требованиям безопасности
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Пароль должен содержать минимум 8 символов");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Пароль должен содержать заглавные буквы");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Пароль должен содержать строчные буквы");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Пароль должен содержать цифры");
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Пароль должен содержать специальные символы");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Проверяет, содержит ли строка потенциально опасные паттерны
 */
export function containsMaliciousPatterns(input: string): boolean {
  const maliciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /union\s+select/i,
    /drop\s+table/i,
    /\.\.\//,
    /\.\.\\/,
    /eval\s*\(/i,
    /exec\s*\(/i,
    /system\s*\(/i,
  ];

  return maliciousPatterns.some((pattern) => pattern.test(input));
}

// Middleware для валидации API запросов
export function createValidationMiddleware<T>(schema: z.ZodSchema<T>) {
  return (req: Request) => {
    return new Promise<{ success: boolean; data?: T; error?: string }>(
      (resolve) => {
        req
          .json()
          .then((body) => {
            const result = validateInput(schema, body);

            if (result.success) {
              resolve({ success: true, data: result.data as T });
            } else {
              resolve({
                success: false,
                error: result.errors?.join(", ") || "Ошибка валидации",
              });
            }
          })
          .catch(() => {
            resolve({
              success: false,
              error: "Ошибка парсинга JSON",
            });
          });
      }
    );
  };
}

// Утилиты для безопасной обработки файлов
/**
 * Проверяет, является ли файл безопасным для загрузки
 */
export function isSafeFile(file: File): boolean {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "video/mp4",
    "video/webm",
    "audio/mpeg",
    "audio/wav",
  ];

  const allowedExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".mp4",
    ".webm",
    ".mp3",
    ".wav",
  ];

  const hasValidType = allowedTypes.includes(file.type);
  const hasValidExtension = allowedExtensions.some((ext) =>
    file.name.toLowerCase().endsWith(ext)
  );

  return hasValidType && hasValidExtension;
}

/**
 * Генерирует безопасное имя файла
 */
export function generateSafeFileName(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split(".").pop()?.toLowerCase() || "";

  return `${timestamp}_${random}.${extension}`;
}

/**
 * Проверяет размер файла
 */
export function validateFileSize(file: File, maxSizeMB: number): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}
