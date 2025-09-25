/**
 * Middleware для интеграции всех систем безопасности
 * Объединяет валидацию, rate limiting и мониторинг
 */

import { type NextRequest, NextResponse } from "next/server";
import { RateLimiterFactory } from "./rate-limiting";
import { securityMonitor } from "./security-monitor";

// Конфигурация безопасности для разных типов запросов
const SECURITY_CONFIGS = {
  "/api/chat": {
    rateLimit: RateLimiterFactory.createAPI(),
    validation: {
      body: "ChatMessageSchema",
      maxBodySize: 10000,
    },
    sanitization: ["content"],
  },
  "/api/generate/image": {
    rateLimit: RateLimiterFactory.createGeneration(),
    validation: {
      body: "ImageGenerationSchema",
      maxBodySize: 5000,
    },
    sanitization: ["prompt", "negativePrompt"],
  },
  "/api/generate/video": {
    rateLimit: RateLimiterFactory.createGeneration(),
    validation: {
      body: "VideoGenerationSchema",
      maxBodySize: 5000,
    },
    sanitization: ["prompt", "negativePrompt"],
  },
  "/api/enhance-prompt": {
    rateLimit: RateLimiterFactory.createAPI(),
    validation: {
      body: "PromptEnhancementSchema",
      maxBodySize: 2000,
    },
    sanitization: ["prompt"],
  },
  "/api/admin": {
    rateLimit: RateLimiterFactory.createAdmin(),
    validation: {
      body: "AdminActionSchema",
      maxBodySize: 10000,
    },
    sanitization: [],
    requireAuth: true,
  } as const,
  "/api/auth": {
    rateLimit: RateLimiterFactory.createAuth(),
    validation: {
      body: "UserInputSchema",
      maxBodySize: 1000,
    },
    sanitization: ["email", "name"],
  },
  "/api/upload": {
    rateLimit: RateLimiterFactory.createUpload(),
    validation: {
      body: "FileUploadSchema",
      maxBodySize: 50 * 1024 * 1024, // 50MB
    },
    sanitization: ["fileName"],
  },
} as const;

// Схемы валидации (импортируем из input-validation.ts)
import {
  UserInputSchema,
  ChatMessageSchema,
  ImageGenerationSchema,
  VideoGenerationSchema,
  AdminActionSchema,
  InputValidator,
  InputSanitizer,
} from "./input-validation";

const VALIDATION_SCHEMAS = {
  UserInputSchema,
  ChatMessageSchema,
  ImageGenerationSchema,
  VideoGenerationSchema,
  AdminActionSchema,
  PromptEnhancementSchema: ChatMessageSchema, // Используем ту же схему
  FileUploadSchema: UserInputSchema, // Временная схема
};

// Основной middleware безопасности
export function createSecurityMiddleware() {
  return async (req: NextRequest) => {
    const path = req.nextUrl.pathname;
    const method = req.method;

    try {
      // 1. Проверяем, есть ли конфигурация для этого пути
      const config = findSecurityConfig(path);
      if (!config) {
        return NextResponse.next();
      }

      // 2. Проверяем IP на блокировку
      const clientIP = getClientIP(req);
      if (securityMonitor.isIPBlocked(clientIP)) {
        securityMonitor.logUnauthorizedAccess(req, path, "IP blocked");
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }

      // 3. Применяем rate limiting
      const rateLimitResult = config.rateLimit.check(req);
      if (!rateLimitResult.allowed) {
        securityMonitor.logRateLimitExceeded(
          req,
          rateLimitResult.remaining + 1,
          rateLimitResult.remaining
        );
        return NextResponse.json(
          {
            error: "Too Many Requests",
            message: "Превышен лимит запросов. Попробуйте позже.",
            retryAfter: rateLimitResult.retryAfter,
          },
          {
            status: 429,
            headers: {
              "Retry-After": rateLimitResult.retryAfter?.toString() || "60",
            },
          }
        );
      }

      // 4. Проверяем аутентификацию для защищенных маршрутов
      if ("requireAuth" in config && config.requireAuth) {
        const authResult = await checkAuthentication(req);
        if (!authResult.authenticated) {
          securityMonitor.logUnauthorizedAccess(
            req,
            path,
            authResult.reason || "Authentication failed"
          );
          return NextResponse.json(
            { error: "Unauthorized", message: authResult.reason },
            { status: 401 }
          );
        }
      }

      // 5. Валидируем и санитизируем тело запроса
      if (method === "POST" || method === "PUT" || method === "PATCH") {
        const bodyResult = await validateAndSanitizeBody(req, config);
        if (!bodyResult.valid) {
          securityMonitor.logMaliciousInput(
            req,
            bodyResult.input || "",
            bodyResult.pattern || ""
          );
          return NextResponse.json(
            { error: "Invalid input", message: bodyResult.message },
            { status: 400 }
          );
        }
      }

      // 6. Проверяем заголовки на подозрительную активность
      const headerCheck = checkSuspiciousHeaders(req);
      if (!headerCheck.safe) {
        securityMonitor.logSuspiciousActivity(
          req,
          "Suspicious headers",
          headerCheck.details
        );
      }

      // 7. Логируем успешный запрос
      securityMonitor.logEvent({
        type: "SUSPICIOUS_ACTIVITY",
        severity: "LOW",
        source: "security_middleware",
        details: {
          path,
          method,
          userAgent: req.headers.get("user-agent"),
        },
        ip: clientIP,
      });

      // 8. Добавляем заголовки безопасности
      const response = NextResponse.next();
      addSecurityHeaders(response);

      return response;
    } catch (error) {
      console.error("Security middleware error:", error);
      securityMonitor.logEvent({
        type: "API_ABUSE",
        severity: "HIGH",
        source: "security_middleware",
        details: {
          error: error instanceof Error ? error.message : "Unknown error",
          path,
          method,
        },
        ip: getClientIP(req),
      });

      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  };
}

// Вспомогательные функции
function findSecurityConfig(path: string) {
  for (const [pattern, config] of Object.entries(SECURITY_CONFIGS)) {
    if (path.startsWith(pattern)) {
      return config;
    }
  }
  return null;
}

function getClientIP(req: NextRequest): string {
  return (
    (req as any).ip ||
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

async function checkAuthentication(req: NextRequest): Promise<{
  authenticated: boolean;
  reason?: string;
}> {
  // Проверяем наличие токена аутентификации
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      authenticated: false,
      reason: "Missing or invalid authorization header",
    };
  }

  // В реальном приложении здесь была бы проверка JWT токена
  const token = authHeader.substring(7);
  if (!token || token.length < 10) {
    return { authenticated: false, reason: "Invalid token format" };
  }

  // Проверяем, не истек ли токен (упрощенная проверка)
  try {
    // Здесь была бы проверка JWT
    return { authenticated: true };
  } catch {
    return { authenticated: false, reason: "Token expired or invalid" };
  }
}

async function validateAndSanitizeBody(
  req: NextRequest,
  config: any
): Promise<{
  valid: boolean;
  message?: string;
  input?: string;
  pattern?: string;
}> {
  try {
    // Читаем тело запроса
    const body = await req.json();
    const bodyString = JSON.stringify(body);

    // Проверяем размер тела
    if (bodyString.length > config.validation.maxBodySize) {
      return {
        valid: false,
        message: "Request body too large",
        input: bodyString.substring(0, 100),
      };
    }

    // Проверяем на вредоносные паттерны
    if (InputValidator.containsMaliciousPatterns(bodyString)) {
      return {
        valid: false,
        message: "Malicious patterns detected",
        input: bodyString.substring(0, 100),
        pattern: "malicious_patterns",
      };
    }

    // Валидируем по схеме
    const schemaName = config.validation.body;
    const schema =
      VALIDATION_SCHEMAS[schemaName as keyof typeof VALIDATION_SCHEMAS];
    if (schema) {
      const validationResult = InputValidator.validate(schema as any, body);
      if (!validationResult.success) {
        return {
          valid: false,
          message: validationResult.errors?.join(", ") || "Validation failed",
          input: bodyString.substring(0, 100),
        };
      }
    }

    // Санитизируем поля
    if (config.sanitization && config.sanitization.length > 0) {
      for (const field of config.sanitization) {
        if (body[field] && typeof body[field] === "string") {
          body[field] = InputSanitizer.sanitizeText(body[field]);
        }
      }
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      message: "Invalid JSON in request body",
      input: "invalid_json",
    };
  }
}

function checkSuspiciousHeaders(req: NextRequest): {
  safe: boolean;
  details: Record<string, any>;
} {
  const suspiciousHeaders: Record<string, any> = {};
  let isSafe = true;

  // Проверяем User-Agent
  const userAgent = req.headers.get("user-agent");
  if (userAgent) {
    const suspiciousUAPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python/i,
      /java/i,
    ];

    if (suspiciousUAPatterns.some((pattern) => pattern.test(userAgent))) {
      suspiciousHeaders.userAgent = userAgent;
      isSafe = false;
    }
  }

  // Проверяем Referer
  const referer = req.headers.get("referer");
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      if (refererUrl.hostname !== req.nextUrl.hostname) {
        suspiciousHeaders.referer = referer;
        isSafe = false;
      }
    } catch {
      suspiciousHeaders.referer = referer;
      isSafe = false;
    }
  }

  // Проверяем X-Forwarded-For на множественные IP
  const xForwardedFor = req.headers.get("x-forwarded-for");
  if (xForwardedFor && xForwardedFor.split(",").length > 3) {
    suspiciousHeaders.xForwardedFor = xForwardedFor;
    isSafe = false;
  }

  return {
    safe: isSafe,
    details: suspiciousHeaders,
  };
}

function addSecurityHeaders(response: NextResponse): void {
  // Заголовки безопасности
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  // CSP заголовок
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' wss: https:;"
  );
}

// Экспорт готового middleware
export const securityMiddleware = createSecurityMiddleware();
