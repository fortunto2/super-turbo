import { createClient } from "redis";

// Create Redis client
let redis: ReturnType<typeof createClient> | null = null;
let redisConnected = false;

async function getRedisClient() {
  if (!redis) {
    // Use fallback URL if REDIS_URL is not set (for development/production without Redis)
    const redisUrl =
      process.env.REDIS_URL ||
      "redis://default:cmGE7trsPdzSwSUviLJXrwgVukdXnaL7@redis-10317.c256.us-east-1-2.ec2.redns.redis-cloud.com:10317";

    redis = createClient({
      url: redisUrl,
    });

    try {
      await redis.connect();
      redisConnected = true;
      console.log("✅ Connected to Redis");
    } catch (error) {
      console.warn(
        "⚠️ Failed to connect to Redis, using fallback mode:",
        error
      );
      redisConnected = false;
      // Don't throw error, just return null client
    }
  }
  return redis;
}

export interface WebhookStatusData {
  status: "pending" | "processing" | "completed" | "error";
  fileId?: string;
  error?: string;
  timestamp?: string;
  toolSlug?: string;
  toolTitle?: string;
}

// KV Key prefixes for organization
const WEBHOOK_PREFIX = "webhook:";
const SESSION_PREFIX = "session:";
const PROMPT_PREFIX = "prompt:";
const BALANCE_PREFIX = "balance:";

// Helper to create webhook key
const getWebhookKey = (sessionId: string) => `${WEBHOOK_PREFIX}${sessionId}`;

// Helper to create session key
const getSessionKey = (sessionId: string) => `${SESSION_PREFIX}${sessionId}`;

// Helper to create prompt key
const getPromptKey = (sessionId: string) => `${PROMPT_PREFIX}${sessionId}`;

// Helper to create balance key
const getBalanceKey = (userId: string) => `${BALANCE_PREFIX}${userId}`;

// Balance helpers (persistent demo credits)
export async function getUserBalance(userId: string): Promise<number | null> {
  try {
    const client = await getRedisClient();
    if (!client || !redisConnected) {
      console.warn("⚠️ Redis not available, returning null for user balance");
      return null;
    }
    const key = getBalanceKey(userId);
    const value = await client.get(key);
    if (value == null) return 0;
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  } catch (error) {
    console.error("❌ Failed to get user balance from Redis:", error);
    return null;
  }
}

export async function setUserBalance(
  userId: string,
  balance: number
): Promise<void> {
  try {
    const client = await getRedisClient();
    if (!client || !redisConnected) {
      console.warn("⚠️ Redis not available, skipping setting user balance");
      return;
    }
    const key = getBalanceKey(userId);
    await client.set(key, String(Math.max(0, Math.floor(balance))));
  } catch (error) {
    console.error("❌ Failed to set user balance in Redis:", error);
  }
}

export async function incrementUserBalance(
  userId: string,
  amount: number
): Promise<number | null> {
  try {
    const client = await getRedisClient();
    if (!client || !redisConnected) {
      console.warn(
        "⚠️ Redis not available, returning null for increment balance"
      );
      return null;
    }
    const key = getBalanceKey(userId);
    const newValue = await client.incrBy(key, Math.floor(amount));
    return newValue;
  } catch (error) {
    console.error("❌ Failed to increment user balance in Redis:", error);
    return null;
  }
}

// Store webhook status data
export async function storeWebhookStatus(
  sessionId: string,
  data: WebhookStatusData
): Promise<void> {
  try {
    const client = await getRedisClient();
    if (!client || !redisConnected) {
      console.warn("⚠️ Redis not available, skipping webhook status storage");
      return;
    }

    const key = getWebhookKey(sessionId);
    const sessionKey = getSessionKey(sessionId);

    // Store webhook data with expiration (30 days)
    await client.setEx(key, 30 * 24 * 60 * 60, JSON.stringify(data));

    // Also store session mapping for quick lookup
    await client.setEx(
      sessionKey,
      30 * 24 * 60 * 60,
      JSON.stringify({
        fileId: data.fileId,
        timestamp: data.timestamp,
      })
    );

    console.log("💾 Stored webhook status in Redis:", sessionId, data.fileId);
  } catch (error) {
    console.error("❌ Failed to store webhook status in Redis:", error);
    // Don't throw error in production, just log it
  }
}

// Get webhook status data
export async function getWebhookStatus(
  sessionId: string
): Promise<WebhookStatusData | null> {
  try {
    const client = await getRedisClient();
    if (!client || !redisConnected) {
      console.warn("⚠️ Redis not available, returning null for webhook status");
      return null;
    }

    const key = getWebhookKey(sessionId);
    const data = await client.get(key);

    if (data) {
      const parsed = JSON.parse(data) as WebhookStatusData;
      console.log(
        "📊 Retrieved webhook status from Redis:",
        sessionId,
        parsed.fileId
      );
      return parsed;
    }

    return null;
  } catch (error) {
    console.error("❌ Failed to get webhook status from Redis:", error);
    return null;
  }
}

// Get file ID by session ID (quick lookup)
export async function getFileIdBySession(
  sessionId: string
): Promise<string | null> {
  try {
    const client = await getRedisClient();
    if (!client || !redisConnected) {
      console.warn("⚠️ Redis not available, returning null for fileId lookup");
      return null;
    }

    const sessionKey = getSessionKey(sessionId);
    const data = await client.get(sessionKey);

    if (data) {
      const parsed = JSON.parse(data) as { fileId: string; timestamp: string };
      if (parsed.fileId) {
        console.log(
          "🔍 Quick lookup found fileId:",
          sessionId,
          "→",
          parsed.fileId
        );
        return parsed.fileId;
      }
    }

    return null;
  } catch (error) {
    console.error("❌ Failed to get fileId by session from Redis:", error);
    return null;
  }
}

// Update webhook status
export async function updateWebhookStatus(
  sessionId: string,
  updates: Partial<WebhookStatusData>
): Promise<void> {
  try {
    const client = await getRedisClient();
    if (!client || !redisConnected) {
      console.warn("⚠️ Redis not available, skipping webhook status update");
      return;
    }

    const key = getWebhookKey(sessionId);
    const existing = await client.get(key);

    if (existing) {
      const parsed = JSON.parse(existing) as WebhookStatusData;
      const updated = {
        ...parsed,
        ...updates,
        timestamp: new Date().toISOString(),
      };
      await client.setEx(key, 30 * 24 * 60 * 60, JSON.stringify(updated));
      console.log("🔄 Updated webhook status in Redis:", sessionId, updates);
    }
  } catch (error) {
    console.error("❌ Failed to update webhook status in Redis:", error);
    // Don't throw error in production, just log it
  }
}

// Delete webhook status (cleanup)
export async function deleteWebhookStatus(sessionId: string): Promise<void> {
  try {
    const client = await getRedisClient();
    if (!client || !redisConnected) {
      console.warn("⚠️ Redis not available, skipping webhook status deletion");
      return;
    }

    const key = getWebhookKey(sessionId);
    const sessionKey = getSessionKey(sessionId);

    await client.del(key);
    await client.del(sessionKey);

    console.log("🗑️ Deleted webhook status from Redis:", sessionId);
  } catch (error) {
    console.error("❌ Failed to delete webhook status from Redis:", error);
  }
}

// Store complete session data
export interface SessionData {
  prompt: string;
  videoCount: number;
  duration: number;
  resolution: string;
  style: string;
  toolSlug: string;
  toolTitle: string;
  cancelUrl?: string;
  userId?: string; // Add userId to track user across sessions
  createdAt: string;
  status: "pending" | "processing" | "completed" | "error";
  fileId?: string;
  error?: string;
  // Новые поля для перенаправления на страницу генерации
  redirectToGeneration?: boolean;
  modelName?: string;
  modelType?: "image" | "video";
  // Новые поля для поддержки image-to-video и image-to-image
  generationType?:
    | "text-to-video"
    | "image-to-video"
    | "text-to-image"
    | "image-to-image";
  // Поля для настройки размеров изображения
  width?: number;
  height?: number;
  imageFile?: {
    name: string;
    size: number;
    type: string;
    lastModified: number;
    content: string; // base64 encoded file content
  };
}

export async function storeSessionData(
  sessionId: string,
  data: SessionData
): Promise<void> {
  try {
    const client = await getRedisClient();
    if (!client || !redisConnected) {
      console.warn("⚠️ Redis not available, skipping session data storage");
      return;
    }

    const sessionKey = getSessionKey(sessionId);

    // Store complete session data with expiration (30 days)
    await client.setEx(
      sessionKey,
      30 * 24 * 60 * 60,
      JSON.stringify({
        ...data,
        timestamp: new Date().toISOString(),
      })
    );

    console.log(
      "💾 Stored session data in Redis:",
      sessionId,
      `(${data.prompt.length} chars prompt)`
    );
  } catch (error) {
    console.error("❌ Failed to store session data in Redis:", error);
    // Don't throw error in production, just log it
  }
}

export async function getSessionData(
  sessionId: string
): Promise<SessionData | null> {
  try {
    const client = await getRedisClient();
    if (!client || !redisConnected) {
      console.warn("⚠️ Redis not available, returning null for session data");
      return null;
    }

    const sessionKey = getSessionKey(sessionId);
    const data = await client.get(sessionKey);

    if (data) {
      const parsed = JSON.parse(data) as SessionData;
      console.log(
        "📊 Retrieved session data from Redis:",
        sessionId,
        parsed.status
      );
      return parsed;
    }

    return null;
  } catch (error) {
    console.error("❌ Failed to get session data from Redis:", error);
    return null;
  }
}

export async function updateSessionData(
  sessionId: string,
  updates: Partial<SessionData>
): Promise<void> {
  try {
    const client = await getRedisClient();
    if (!client || !redisConnected) {
      console.warn("⚠️ Redis not available, skipping session data update");
      return;
    }

    const sessionKey = getSessionKey(sessionId);
    const existing = await client.get(sessionKey);

    if (existing) {
      const parsed = JSON.parse(existing) as SessionData;
      const updated = {
        ...parsed,
        ...updates,
        timestamp: new Date().toISOString(),
      };
      await client.setEx(
        sessionKey,
        30 * 24 * 60 * 60,
        JSON.stringify(updated)
      );
      console.log("🔄 Updated session data in Redis:", sessionId, updates);
    }
  } catch (error) {
    console.error("❌ Failed to update session data in Redis:", error);
    // Don't throw error in production, just log it
  }
}

// Store prompt data (for long prompts that exceed Stripe metadata limits)
export async function storePrompt(
  sessionId: string,
  prompt: string
): Promise<void> {
  try {
    const client = await getRedisClient();
    if (!client || !redisConnected) {
      console.warn("⚠️ Redis not available, skipping prompt storage");
      return;
    }

    const key = getPromptKey(sessionId);

    // Store prompt with expiration (30 days)
    await client.setEx(
      key,
      30 * 24 * 60 * 60,
      JSON.stringify({
        prompt,
        timestamp: new Date().toISOString(),
      })
    );

    console.log(
      "💾 Stored prompt in Redis:",
      sessionId,
      `(${prompt.length} chars)`
    );
  } catch (error) {
    console.error("❌ Failed to store prompt in Redis:", error);
    // Don't throw error in production, just log it
  }
}

// Get prompt data
export async function getPrompt(sessionId: string): Promise<string | null> {
  try {
    const client = await getRedisClient();
    if (!client || !redisConnected) {
      console.warn("⚠️ Redis not available, returning null for prompt");
      return null;
    }

    const key = getPromptKey(sessionId);
    const data = await client.get(key);

    if (data) {
      const parsed = JSON.parse(data) as { prompt: string; timestamp: string };
      if (parsed.prompt) {
        console.log(
          "📝 Retrieved prompt from Redis:",
          sessionId,
          `(${parsed.prompt.length} chars)`
        );
        return parsed.prompt;
      }
    }

    return null;
  } catch (error) {
    console.error("❌ Failed to get prompt from Redis:", error);
    return null;
  }
}

// Health check for Redis connection
export async function checkKVHealth(): Promise<boolean> {
  try {
    const client = await getRedisClient();
    if (!client || !redisConnected) {
      console.warn("⚠️ Redis not available, health check failed");
      return false;
    }

    await client.ping();
    console.log("✅ Redis connection healthy");
    return true;
  } catch (error) {
    console.error("❌ Redis connection failed:", error);
    return false;
  }
}
