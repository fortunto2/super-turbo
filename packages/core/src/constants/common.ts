// Common constants used across both super-chatbot and super-landing

export const APP_NAME = "SuperDuperAI";
export const APP_VERSION = "3.0.0";

// Environment
export const ENV = {
  DEVELOPMENT: "development",
  PRODUCTION: "production",
  TEST: "test",
} as const;

// API endpoints
export const API_ENDPOINTS = {
  // Internal API endpoints
  AUTH: "/api/auth",
  UPLOAD: "/api/files/upload",
  GENERATE: "/api/generate",
  BALANCE: "/api/user/balance",

  // External API base URLs
  SUPERDUPERAI_BASE_URL:
    process.env.SUPERDUPERAI_API_URL || "https://api.superduperai.co",
  STRIPE_BASE_URL: process.env.STRIPE_API_URL || "https://api.stripe.com",
  UPLOAD_BASE_URL: process.env.UPLOAD_API_URL || "/api/files",
  WEBSOCKET_BASE_URL:
    process.env.WEBSOCKET_API_URL || "wss://ws.superduperai.co",
} as const;

// File types
export const FILE_TYPES = {
  IMAGE: "image",
  VIDEO: "video",
  AUDIO: "audio",
  DOCUMENT: "document",
} as const;

// Content types
export const CONTENT_TYPES = {
  IMAGE_PNG: "image/png",
  IMAGE_JPEG: "image/jpeg",
  IMAGE_WEBP: "image/webp",
  VIDEO_MP4: "video/mp4",
} as const;

// Status codes
export const STATUS = {
  SUCCESS: "success",
  ERROR: "error",
  PENDING: "pending",
  FAILED: "failed",
} as const;
