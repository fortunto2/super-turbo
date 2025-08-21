// @ts-nocheck
// SuperDuperAI API Configuration

export interface SuperduperAIConfig {
  url: string;
  token: string;
  wsURL: string; // Deprecated - kept for backward compatibility
}

// Cache for models with 1-hour expiration
const modelCache = new Map<string, { data: any[]; timestamp: number }>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

/**
 * Validate Bearer token format
 * Ensures token is properly formatted for API authentication
 */
export function validateBearerToken(token: string): boolean {
  // Remove 'Bearer ' prefix if present
  const cleanToken = token.replace(/^Bearer\s+/i, "");

  // Basic validation: alphanumeric characters, minimum length
  const tokenRegex = /^[a-zA-Z0-9_-]{32,}$/;

  if (!tokenRegex.test(cleanToken)) {
    console.warn("Token validation failed: Invalid format");
    return false;
  }

  // Additional checks can be added here (expiration, JWT validation, etc.)
  return true;
}

/**
 * Get SuperDuperAI configuration
 */

export function getSuperduperAIConfig(): SuperduperAIConfig {
  if (typeof window === "undefined") {
    // Server-side: Real external API
    const url =
      process.env.SUPERDUPERAI_URL || "https://dev-editor.superduperai.co";
    const token = process.env.SUPERDUPERAI_TOKEN || "";
    const wsURL = url.replace("https://", "wss://").replace("http://", "ws://");

    if (!token) {
      throw new Error("SUPERDUPERAI_TOKEN environment variable is required");
    }

    // Token validation for Bearer token format
    if (!validateBearerToken(token)) {
      throw new Error(
        "SUPERDUPERAI_TOKEN must be a valid format. Expected: alphanumeric string, 32+ characters"
      );
    }

    return { url, token, wsURL };
  }

  // Client-side: Use current origin for proxy paths
  const currentOrigin =
    typeof window !== "undefined" ? window.location.origin : "";
  return {
    url: currentOrigin, // Use current origin for proxy paths
    token: "", // Never expose tokens to client
    wsURL: "", // Deprecated
  };
}
/**
 * Client-side function to get config from API
 */
export async function getClientSuperduperAIConfig(): Promise<SuperduperAIConfig> {
  try {
    const response = await fetch("/api/config/superduperai");
    if (!response.ok) {
      throw new Error("Failed to get SuperDuperAI config");
    }
    const data = await response.json();

    return {
      url: data.url,
      token: "", // Token is handled server-side
      wsURL: data.wsURL,
    };
  } catch (error) {
    console.error("Failed to get client config:", error);
    // Fallback to default
    return getSuperduperAIConfig();
  }
}

/**
 * Get cached models or fetch from API
 */
export async function getCachedModels<T>(
  cacheKey: string,
  fetchFunction: () => Promise<T[]>
): Promise<T[]> {
  const now = Date.now();
  const cached = modelCache.get(cacheKey);

  // Return cached data if still valid
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.data as T[];
  }

  try {
    // Fetch fresh data
    const data = await fetchFunction();

    // Cache the new data
    modelCache.set(cacheKey, { data, timestamp: now });

    return data;
  } catch (error) {
    console.error(`Failed to fetch ${cacheKey}:`, error);

    // Return cached data if available, even if expired
    if (cached) {
      return cached.data as T[];
    }

    throw error;
  }
}

/**
 * Clear model cache
 */
export function clearModelCache(): void {
  modelCache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  const now = Date.now();
  const stats = {
    totalEntries: modelCache.size,
    validEntries: 0,
    expiredEntries: 0,
    totalSize: 0,
  };

  for (const [key, value] of modelCache.entries()) {
    if (now - value.timestamp < CACHE_DURATION) {
      stats.validEntries++;
    } else {
      stats.expiredEntries++;
    }
    stats.totalSize += JSON.stringify(value.data).length;
  }

  return stats;
}
