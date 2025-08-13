// Application specific constants

export const APP_CONFIG = {
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_VIDEO_SIZE: 500 * 1024 * 1024, // 500MB
  SUPPORTED_IMAGE_FORMATS: ['png', 'jpg', 'jpeg', 'webp'],
  SUPPORTED_VIDEO_FORMATS: ['mp4', 'mov', 'avi'],
} as const;

export const UI_CONFIG = {
  ANIMATION_DURATION: 300, // ms
  DEBOUNCE_DELAY: 300, // ms
  TOAST_DURATION: 5000, // ms
  PAGINATION_DEFAULT_SIZE: 20,
} as const;

export const FEATURE_FLAGS = {
  ENABLE_VIDEO_GENERATION: true,
  ENABLE_IMAGE_EDITING: true,
  ENABLE_AI_CHAT: true,
  ENABLE_PAYMENTS: true,
} as const;

