"use client";

// src/data/constants.ts
var AI_MODELS = {
  TEXT: {
    GPT_4: "gpt-4",
    GPT_3_5_TURBO: "gpt-3.5-turbo",
    CLAUDE_3_OPUS: "claude-3-opus-20240229",
    CLAUDE_3_SONNET: "claude-3-sonnet-20240229",
    CLAUDE_3_HAIKU: "claude-3-haiku-20240307"
  },
  IMAGE: {
    DALL_E_3: "dall-e-3",
    DALL_E_2: "dall-e-2",
    MIDJOURNEY: "midjourney",
    STABLE_DIFFUSION: "stable-diffusion"
  },
  VIDEO: {
    SORA: "sora",
    VEOLABS: "veolabs",
    RUNWAY: "runway",
    PIKA: "pika"
  }
};
var STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled"
};
var ARTIFACT_TYPES = {
  IMAGE: "image",
  VIDEO: "video",
  TEXT: "text",
  SHEET: "sheet",
  SCRIPT: "script"
};
var USER_ROLES = {
  USER: "user",
  ADMIN: "admin"
};
var MESSAGE_ROLES = {
  USER: "user",
  ASSISTANT: "assistant",
  SYSTEM: "system"
};
var API_ENDPOINTS = {
  ARTIFACTS: "/api/artifacts",
  CHATS: "/api/chats",
  USERS: "/api/users",
  AUTH: "/api/auth"
};
var IMAGE_SIZES = {
  THUMBNAIL: { width: 150, height: 150 },
  SMALL: { width: 512, height: 512 },
  MEDIUM: { width: 1024, height: 1024 },
  LARGE: { width: 1792, height: 1024 }
};
var VIDEO_SIZES = {
  SMALL: { width: 512, height: 512 },
  MEDIUM: { width: 1024, height: 1024 },
  LARGE: { width: 1792, height: 1024 }
};
var FILE_FORMATS = {
  IMAGE: ["jpg", "jpeg", "png", "webp", "gif"],
  VIDEO: ["mp4", "webm", "mov", "avi"],
  DOCUMENT: ["pdf", "doc", "docx", "txt"],
  SPREADSHEET: ["csv", "xlsx", "xls"]
};
var LIMITS = {
  MAX_FILE_SIZE: 100 * 1024 * 1024,
  // 100MB
  MAX_MESSAGE_LENGTH: 1e4,
  MAX_TITLE_LENGTH: 200,
  MAX_DESCRIPTION_LENGTH: 1e3,
  MAX_CHAT_MESSAGES: 1e3
};
var PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
};
var TIME = {
  SECOND: 1e3,
  MINUTE: 60 * 1e3,
  HOUR: 60 * 60 * 1e3,
  DAY: 24 * 60 * 60 * 1e3,
  SESSION_TIMEOUT: 24 * 60 * 60 * 1e3,
  // 24 часа
  TOKEN_EXPIRY: 7 * 24 * 60 * 60 * 1e3,
  // 7 дней
  CACHE_TTL: 5 * 60 * 1e3
  // 5 минут
};
var ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  AUTHENTICATION_ERROR: "AUTHENTICATION_ERROR",
  AUTHORIZATION_ERROR: "AUTHORIZATION_ERROR",
  NOT_FOUND_ERROR: "NOT_FOUND_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR"
};
var NOTIFICATION_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info"
};
var APP_URLS = {
  ABOUT_URL: "/about",
  PRICING_URL: "/pricing",
  TERMS_URL: "/terms",
  PRIVACY_URL: "/privacy",
  EDITOR_URL: "/editor",
  CALENDLY_URL: "https://calendly.com/superduperai",
  INSTAGRAM_URL: "https://instagram.com/superduperai",
  TELEGRAM_URL: "https://t.me/superduperai",
  DISCORD_URL: "https://discord.gg/superduperai",
  YOUTUBE_URL: "https://youtube.com/@superduperai",
  TIKTOK_URL: "https://tiktok.com/@superduperai",
  LINKEDIN_URL: "https://linkedin.com/company/superduperai"
};
var guestRegex = /^guest-\d+@superduperai\.com$/;
export {
  AI_MODELS,
  API_ENDPOINTS,
  APP_URLS,
  ARTIFACT_TYPES,
  ERROR_CODES,
  FILE_FORMATS,
  IMAGE_SIZES,
  LIMITS,
  MESSAGE_ROLES,
  NOTIFICATION_TYPES,
  PAGINATION,
  STATUS,
  TIME,
  USER_ROLES,
  VIDEO_SIZES,
  guestRegex
};
//# sourceMappingURL=index.mjs.map