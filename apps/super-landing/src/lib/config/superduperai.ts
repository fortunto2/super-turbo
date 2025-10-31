/**
 * SuperDuperAI API Configuration for Landing Page
 * Simplified version for video generation
 */

interface SuperduperAIConfig {
  url: string;
  token: string;
}

/**
 * Validate Bearer token format
 */
function validateBearerToken(token: string): boolean {
  const cleanToken = token.replace(/^Bearer\s+/i, "");
  const tokenRegex = /^[a-zA-Z0-9_-]{32,}$/;

  if (!tokenRegex.test(cleanToken)) {
    console.warn("Token validation failed: Invalid format");
    return false;
  }

  return true;
}

export function getSuperduperAIConfig(): SuperduperAIConfig {
  const url =
    process.env.SUPERDUPERAI_URL ?? "https://dev-editor.superduperai.co";
  const token = process.env.SUPERDUPERAI_TOKEN ?? "";

  // В режиме сборки или если токен не установлен, возвращаем конфигурацию с placeholder
  if (
    !token ||
    token === "placeholder-token" ||
    (process.env.NODE_ENV === "production" && !process.env.SUPERDUPERAI_TOKEN)
  ) {
    console.warn(
      "⚠️ SUPERDUPERAI_TOKEN not set, using placeholder configuration"
    );
    return { url, token: "placeholder-token" };
  }

  if (!validateBearerToken(token)) {
    throw new Error("SUPERDUPERAI_TOKEN must be a valid format");
  }

  return { url, token };
}

export function configureSuperduperAI(): SuperduperAIConfig {
  return getSuperduperAIConfig();
}

/**
 * API endpoints for SuperDuperAI
 */
export const API_ENDPOINTS = {
  GENERATE_VIDEO: "/api/v1/file/generate-video",
  GET_FILE: "/api/v1/file",
} as const;

/**
 * Create authenticated headers for API requests
 */
export function createAuthHeaders(
  config?: SuperduperAIConfig
): Record<string, string> {
  const apiConfig = config ?? getSuperduperAIConfig();

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiConfig.token}`,
    "User-Agent": "SuperDuperAI-Landing/1.0",
  };
}
