import axios from 'axios';
import { API_ENDPOINTS } from '@turbo-super/core';

// src/superduperai/client.ts
var SuperDuperAIClient = class {
  constructor(config) {
    this.client = axios.create({
      baseURL: API_ENDPOINTS.SUPERDUPERAI_BASE_URL,
      timeout: 3e4,
      ...config
    });
    this.client.interceptors.request.use((config2) => {
      return config2;
    });
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        return Promise.reject(error);
      }
    );
  }
  // Generic request method
  async request(config) {
    const response = await this.client.request(config);
    return response.data;
  }
  // Get the underlying axios instance
  getAxiosInstance() {
    return this.client;
  }
};
var superDuperAIClient = new SuperDuperAIClient();

// src/superduperai/types.ts
var GenerationType = /* @__PURE__ */ ((GenerationType2) => {
  GenerationType2["TEXT_TO_IMAGE"] = "text_to_image";
  GenerationType2["IMAGE_TO_IMAGE"] = "image_to_image";
  GenerationType2["TEXT_TO_VIDEO"] = "text_to_video";
  GenerationType2["IMAGE_TO_VIDEO"] = "image_to_video";
  GenerationType2["VIDEO_TO_VIDEO"] = "video_to_video";
  return GenerationType2;
})(GenerationType || {});
var ListOrder = /* @__PURE__ */ ((ListOrder2) => {
  ListOrder2["ASC"] = "asc";
  ListOrder2["DESC"] = "desc";
  return ListOrder2;
})(ListOrder || {});

// src/superduperai/endpoints.ts
var ENDPOINTS = {
  // Base endpoints
  BASE: "/api",
  // Generation endpoints
  GENERATE_IMAGE: "/api/generate/image",
  GENERATE_VIDEO: "/api/generate/video",
  GENERATE_SCRIPT: "/api/generate/script",
  // Configuration endpoints
  CONFIG_MODELS: "/api/config/models",
  CONFIG_SUPERDUPERAI: "/api/config/superduperai",
  CONFIG_GENERATION: "/api/config/generation",
  // File endpoints
  FILE_UPLOAD: "/api/files/upload",
  FILE_DOWNLOAD: "/api/file",
  // Project endpoints
  PROJECT_CREATE: "/api/project",
  PROJECT_VIDEO: "/api/project/video",
  // User endpoints
  USER_BALANCE: "/api/user/balance",
  USER_HISTORY: "/api/history",
  // Enhancement endpoints
  ENHANCE_PROMPT: "/api/enhance-prompt",
  // Event endpoints
  EVENTS_FILE: "/api/events/file",
  // WebSocket endpoints
  WEBSOCKET_BASE: "wss://ws.superduperai.co",
  WEBSOCKET_CHAT: "wss://ws.superduperai.co/chat",
  WEBSOCKET_GENERATION: "wss://ws.superduperai.co/generation"
};
var API_ROUTES = {
  // Next.js API routes
  NEXT: {
    GENERATE_IMAGE: "/api/generate/image",
    GENERATE_VIDEO: "/api/generate/video",
    GENERATE_SCRIPT: "/api/generate/script",
    FILE: (id) => `/api/file/${id}`,
    FILE_UPLOAD: "/api/file/upload",
    PROJECT: (id) => `/api/project/${id}`,
    PROJECT_VIDEO: "/api/project/video",
    ENHANCE_PROMPT: "/api/enhance-prompt",
    MODELS: "/api/config/models",
    SUPERDUPERAI: "/api/config/superduperai",
    EVENTS_FILE: (fileId) => `/api/events/file.${fileId}`
  }
};

// src/superduperai/config.ts
var modelCache = /* @__PURE__ */ new Map();
var CACHE_DURATION = 60 * 60 * 1e3;
function validateBearerToken(token) {
  const cleanToken = token.replace(/^Bearer\s+/i, "");
  const tokenRegex = /^[a-zA-Z0-9_-]{32,}$/;
  if (!tokenRegex.test(cleanToken)) {
    console.warn("Token validation failed: Invalid format");
    return false;
  }
  return true;
}
function getSuperduperAIConfig() {
  if (typeof window === "undefined") {
    const url = "https://dev-editor.superduperai.co";
    url.replace("https://", "wss://").replace("http://", "ws://");
    {
      throw new Error("SUPERDUPERAI_TOKEN environment variable is required");
    }
  }
  const currentOrigin = typeof window !== "undefined" ? window.location.origin : "";
  return {
    url: currentOrigin,
    // Use current origin for proxy paths
    token: "",
    // Never expose tokens to client
    wsURL: ""
    // Deprecated
  };
}
async function getClientSuperduperAIConfig() {
  try {
    const response = await fetch("/api/config/superduperai");
    if (!response.ok) {
      throw new Error("Failed to get SuperDuperAI config");
    }
    const data = await response.json();
    return {
      url: data.url,
      token: "",
      // Token is handled server-side
      wsURL: data.wsURL
    };
  } catch (error) {
    console.error("Failed to get client config:", error);
    return getSuperduperAIConfig();
  }
}
async function getCachedModels(cacheKey, fetchFunction) {
  const now = Date.now();
  const cached = modelCache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  try {
    const data = await fetchFunction();
    modelCache.set(cacheKey, { data, timestamp: now });
    return data;
  } catch (error) {
    console.error(`Failed to fetch ${cacheKey}:`, error);
    if (cached) {
      return cached.data;
    }
    throw error;
  }
}
function clearModelCache() {
  modelCache.clear();
}
function getCacheStats() {
  const now = Date.now();
  const stats = {
    totalEntries: modelCache.size,
    validEntries: 0,
    expiredEntries: 0,
    totalSize: 0
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
var StripeClient = class {
  constructor(config) {
    this.client = axios.create({
      baseURL: API_ENDPOINTS.STRIPE_BASE_URL,
      timeout: 3e4,
      ...config
    });
    this.client.interceptors.request.use((config2) => {
      return config2;
    });
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        return Promise.reject(error);
      }
    );
  }
  // Generic request method
  async request(config) {
    const response = await this.client.request(config);
    return response.data;
  }
  // Get the underlying axios instance
  getAxiosInstance() {
    return this.client;
  }
};
var stripeClient = new StripeClient();

// src/stripe/endpoints.ts
var STRIPE_ENDPOINTS = {
  // Customers
  CUSTOMERS: {
    CREATE: "/customers",
    GET: "/customers/:id",
    UPDATE: "/customers/:id",
    DELETE: "/customers/:id"
  },
  // Subscriptions
  SUBSCRIPTIONS: {
    CREATE: "/subscriptions",
    GET: "/subscriptions/:id",
    UPDATE: "/subscriptions/:id",
    CANCEL: "/subscriptions/:id/cancel"
  },
  // Prices
  PRICES: {
    LIST: "/prices",
    GET: "/prices/:id"
  },
  // Checkout
  CHECKOUT: {
    SESSIONS: "/checkout/sessions",
    SESSION: "/checkout/sessions/:id"
  }
};
var UploadClient = class {
  constructor(config) {
    this.client = axios.create({
      baseURL: API_ENDPOINTS.UPLOAD_BASE_URL,
      timeout: 6e4,
      // Longer timeout for file uploads
      ...config
    });
    this.client.interceptors.request.use((config2) => {
      return config2;
    });
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        return Promise.reject(error);
      }
    );
  }
  // Generic request method
  async request(config) {
    const response = await this.client.request(config);
    return response.data;
  }
  // Get the underlying axios instance
  getAxiosInstance() {
    return this.client;
  }
};
var uploadClient = new UploadClient();
var WebSocketClient = class {
  constructor(url = API_ENDPOINTS.WEBSOCKET_BASE_URL, options = {}) {
    this.url = url;
    this.options = options;
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1e3;
  }
  connect() {
    return new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(this.url);
        this.socket.onopen = () => {
          this.reconnectAttempts = 0;
          this.options.onOpen?.();
          resolve();
        };
        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.options.onMessage?.(data);
          } catch (error) {
            console.error("Failed to parse WebSocket message:", error);
          }
        };
        this.socket.onclose = () => {
          this.options.onClose?.();
          this.attemptReconnect();
        };
        this.socket.onerror = (error) => {
          this.options.onError?.(error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }
  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.connect().catch(console.error);
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }
  send(data) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    }
  }
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
  isConnected() {
    return this.socket?.readyState === WebSocket.OPEN;
  }
};
var webSocketClient = new WebSocketClient();

export { API_ROUTES, ENDPOINTS, GenerationType, ListOrder, STRIPE_ENDPOINTS, StripeClient, SuperDuperAIClient, UploadClient, WebSocketClient, clearModelCache, getCacheStats, getCachedModels, getClientSuperduperAIConfig, getSuperduperAIConfig, stripeClient, superDuperAIClient, uploadClient, validateBearerToken, webSocketClient };
//# sourceMappingURL=index.mjs.map
//# sourceMappingURL=index.mjs.map