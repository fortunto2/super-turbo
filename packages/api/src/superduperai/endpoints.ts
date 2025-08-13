// SuperDuperAI API endpoints

export const ENDPOINTS = {
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
} as const;

export const API_ROUTES = {
  // Next.js API routes
  NEXT: {
    GENERATE_IMAGE: "/api/generate/image",
    GENERATE_VIDEO: "/api/generate/video",
    GENERATE_SCRIPT: "/api/generate/script",
    FILE: (id: string) => `/api/file/${id}`,
    FILE_UPLOAD: "/api/file/upload",
    PROJECT: (id: string) => `/api/project/${id}`,
    PROJECT_VIDEO: "/api/project/video",
    ENHANCE_PROMPT: "/api/enhance-prompt",
    MODELS: "/api/config/models",
    SUPERDUPERAI: "/api/config/superduperai",
    EVENTS_FILE: (fileId: string) => `/api/events/file.${fileId}`,
  }
} as const;
