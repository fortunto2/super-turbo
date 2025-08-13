"use client";
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  AI_MODELS: () => AI_MODELS,
  API_ENDPOINTS: () => API_ENDPOINTS,
  APP_URLS: () => APP_URLS,
  ARTIFACT_TYPES: () => ARTIFACT_TYPES,
  CURRENT_PRICES: () => CURRENT_PRICES,
  ERROR_CODES: () => ERROR_CODES,
  FILE_FORMATS: () => FILE_FORMATS,
  IMAGE_SIZES: () => IMAGE_SIZES,
  LIMITS: () => LIMITS,
  MESSAGE_ROLES: () => MESSAGE_ROLES,
  NOTIFICATION_TYPES: () => NOTIFICATION_TYPES,
  PAGINATION: () => PAGINATION,
  STATUS: () => STATUS,
  STRIPE_PRICES: () => STRIPE_PRICES,
  TIME: () => TIME,
  USER_ROLES: () => USER_ROLES,
  VIDEO_SIZES: () => VIDEO_SIZES,
  capitalizeFirst: () => capitalizeFirst,
  formatCurrency: () => formatCurrency,
  formatDate: () => formatDate,
  formatDateTime: () => formatDateTime,
  formatDuration: () => formatDuration,
  formatFileSize: () => formatFileSize,
  formatNumber: () => formatNumber,
  formatPercentage: () => formatPercentage,
  formatRelativeTime: () => formatRelativeTime,
  getCurrentMode: () => getCurrentMode,
  getCurrentPrices: () => getCurrentPrices,
  getSingleVideoPrice: () => getSingleVideoPrice,
  getStripeConfig: () => getStripeConfig,
  getTripleVideoPrice: () => getTripleVideoPrice,
  guestRegex: () => guestRegex,
  hasErrors: () => hasErrors,
  isStrongPassword: () => isStrongPassword,
  isValidArray: () => isValidArray,
  isValidDate: () => isValidDate,
  isValidEmail: () => isValidEmail,
  isValidFileSize: () => isValidFileSize,
  isValidFileType: () => isValidFileType,
  isValidId: () => isValidId,
  isValidNumberRange: () => isValidNumberRange,
  isValidPassword: () => isValidPassword,
  isValidPhone: () => isValidPhone,
  isValidTextLength: () => isValidTextLength,
  isValidUUID: () => isValidUUID,
  isValidUrl: () => isValidUrl,
  slugify: () => slugify,
  truncateText: () => truncateText,
  useClickOutside: () => useClickOutside,
  useDebounce: () => useDebounce,
  useIsDarkMode: () => useIsDarkMode,
  useIsDesktop: () => useIsDesktop,
  useIsMobile: () => useIsMobile,
  useIsReducedMotion: () => useIsReducedMotion,
  useIsTablet: () => useIsTablet,
  useLocalStorage: () => useLocalStorage,
  useMediaQuery: () => useMediaQuery,
  validateObject: () => validateObject,
  validateRequired: () => validateRequired
});
module.exports = __toCommonJS(src_exports);

// src/utils/format.ts
function formatDate(date, options) {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const defaultOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options
  };
  return dateObj.toLocaleDateString("ru-RU", defaultOptions);
}
function formatDateTime(date) {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleString("ru-RU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function formatRelativeTime(date) {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = /* @__PURE__ */ new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1e3);
  if (diffInSeconds < 60) {
    return "\u0442\u043E\u043B\u044C\u043A\u043E \u0447\u0442\u043E";
  }
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} \u043C\u0438\u043D. \u043D\u0430\u0437\u0430\u0434`;
  }
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} \u0447. \u043D\u0430\u0437\u0430\u0434`;
  }
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} \u0434\u043D. \u043D\u0430\u0437\u0430\u0434`;
  }
  return formatDate(dateObj);
}
function formatNumber(num, options) {
  const defaultOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options
  };
  return num.toLocaleString("ru-RU", defaultOptions);
}
function formatFileSize(bytes) {
  if (bytes === 0) return "0 \u0411";
  const k = 1024;
  const sizes = ["\u0411", "\u041A\u0411", "\u041C\u0411", "\u0413\u0411", "\u0422\u0411"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
function formatDuration(seconds) {
  if (seconds < 60) {
    return `${Math.floor(seconds)}\u0441`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  if (minutes < 60) {
    return `${minutes}\u043C ${remainingSeconds}\u0441`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}\u0447 ${remainingMinutes}\u043C`;
}
function truncateText(text, maxLength, suffix = "...") {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length) + suffix;
}
function capitalizeFirst(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
function slugify(text) {
  return text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
function formatCurrency(amount, currency = "RUB") {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency
  }).format(amount);
}
function formatPercentage(value, decimals = 1) {
  return `${(value * 100).toFixed(decimals)}%`;
}

// src/utils/validation.ts
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
function isStrongPassword(password) {
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
  return passwordRegex.test(password);
}
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}
function isValidPhone(phone) {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
}
function isValidPassword(password) {
  const errors = [];
  if (password.length < 8) {
    errors.push("\u041F\u0430\u0440\u043E\u043B\u044C \u0434\u043E\u043B\u0436\u0435\u043D \u0441\u043E\u0434\u0435\u0440\u0436\u0430\u0442\u044C \u043C\u0438\u043D\u0438\u043C\u0443\u043C 8 \u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("\u041F\u0430\u0440\u043E\u043B\u044C \u0434\u043E\u043B\u0436\u0435\u043D \u0441\u043E\u0434\u0435\u0440\u0436\u0430\u0442\u044C \u0437\u0430\u0433\u043B\u0430\u0432\u043D\u0443\u044E \u0431\u0443\u043A\u0432\u0443");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("\u041F\u0430\u0440\u043E\u043B\u044C \u0434\u043E\u043B\u0436\u0435\u043D \u0441\u043E\u0434\u0435\u0440\u0436\u0430\u0442\u044C \u0441\u0442\u0440\u043E\u0447\u043D\u0443\u044E \u0431\u0443\u043A\u0432\u0443");
  }
  if (!/\d/.test(password)) {
    errors.push("\u041F\u0430\u0440\u043E\u043B\u044C \u0434\u043E\u043B\u0436\u0435\u043D \u0441\u043E\u0434\u0435\u0440\u0436\u0430\u0442\u044C \u0446\u0438\u0444\u0440\u0443");
  }
  return {
    isValid: errors.length === 0,
    errors
  };
}
function isValidFileSize(fileSize, maxSize) {
  return fileSize <= maxSize;
}
function isValidFileType(fileName, allowedTypes) {
  var _a;
  const extension = (_a = fileName.split(".").pop()) == null ? void 0 : _a.toLowerCase();
  return extension ? allowedTypes.includes(extension) : false;
}
function isValidTextLength(text, minLength, maxLength) {
  return text.length >= minLength && text.length <= maxLength;
}
function validateRequired(value, fieldName) {
  if (value === null || value === void 0 || value === "") {
    return `${fieldName} \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u0435\u043D`;
  }
  return null;
}
function validateObject(obj, validators) {
  const errors = {};
  for (const [key, validator] of Object.entries(validators)) {
    errors[key] = validator(obj[key]);
  }
  return errors;
}
function hasErrors(errors) {
  return Object.values(errors).some((error) => error !== null);
}
function isValidId(id) {
  return /^[a-zA-Z0-9-_]+$/.test(id) && id.length > 0;
}
function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
function isValidDate(date) {
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
}
function isValidNumberRange(value, min, max) {
  return value >= min && value <= max;
}
function isValidArray(array, minLength = 0, maxLength) {
  if (!Array.isArray(array)) return false;
  if (array.length < minLength) return false;
  if (maxLength && array.length > maxLength) return false;
  return true;
}

// src/hooks/use-debounce.ts
var import_react = require("react");
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = (0, import_react.useState)(value);
  (0, import_react.useEffect)(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

// src/hooks/use-local-storage.ts
var import_react2 = require("react");
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = (0, import_react2.useState)(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });
  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };
  const removeValue = () => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  };
  return [storedValue, setValue, removeValue];
}

// src/hooks/use-media-query.ts
var import_react3 = require("react");
function useMediaQuery(query) {
  const [matches, setMatches] = (0, import_react3.useState)(false);
  (0, import_react3.useEffect)(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia(query);
    setMatches(media.matches);
    const listener = (event) => {
      setMatches(event.matches);
    };
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);
  return matches;
}
var useIsMobile = () => useMediaQuery("(max-width: 768px)");
var useIsTablet = () => useMediaQuery("(min-width: 769px) and (max-width: 1024px)");
var useIsDesktop = () => useMediaQuery("(min-width: 1025px)");
var useIsDarkMode = () => useMediaQuery("(prefers-color-scheme: dark)");
var useIsReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)");

// src/hooks/use-click-outside.ts
var import_react4 = require("react");
function useClickOutside(ref, handler) {
  (0, import_react4.useEffect)(() => {
    const listener = (event) => {
      const el = ref == null ? void 0 : ref.current;
      if (!el || el.contains((event == null ? void 0 : event.target) || null)) {
        return;
      }
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

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

// src/payment/stripe-config.ts
var STRIPE_PRICES = {
  // Production prices (live mode)
  production: {
    single: "price_1Rkse5K9tHMoWhKiQ0tg0b2N",
    // $1.00 for 1 video
    triple: "price_1Rkse7K9tHMoWhKise2iYOXL"
    // $2.00 for 3 videos
  },
  // Test prices (test mode)
  test: {
    single: "price_1RktnoK9tHMoWhKim5uqXiAe",
    // $1.00 for 1 video (TEST)
    triple: "price_1Rkto1K9tHMoWhKinvpEwntH"
    // $2.00 for 3 videos (TEST)
  }
};
var getCurrentPrices = () => {
  var _a;
  const isLiveMode = (_a = process.env.STRIPE_SECRET_KEY) == null ? void 0 : _a.startsWith("sk_live_");
  if (isLiveMode) {
    return STRIPE_PRICES.production;
  }
  return STRIPE_PRICES.test;
};
var getSingleVideoPrice = () => getCurrentPrices().single;
var getTripleVideoPrice = () => getCurrentPrices().triple;
var CURRENT_PRICES = getCurrentPrices();
var getCurrentMode = () => {
  var _a;
  const isLiveMode = (_a = process.env.STRIPE_SECRET_KEY) == null ? void 0 : _a.startsWith("sk_live_");
  return isLiveMode ? "live" : "test";
};
var getStripeConfig = () => ({
  prices: getCurrentPrices(),
  mode: getCurrentMode()
});
if (process.env.NODE_ENV === "development") {
  console.log("\u{1F3EA} Stripe Configuration:", {
    isLiveMode: getCurrentMode() === "live",
    currentPrices: CURRENT_PRICES,
    mode: getCurrentMode()
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AI_MODELS,
  API_ENDPOINTS,
  APP_URLS,
  ARTIFACT_TYPES,
  CURRENT_PRICES,
  ERROR_CODES,
  FILE_FORMATS,
  IMAGE_SIZES,
  LIMITS,
  MESSAGE_ROLES,
  NOTIFICATION_TYPES,
  PAGINATION,
  STATUS,
  STRIPE_PRICES,
  TIME,
  USER_ROLES,
  VIDEO_SIZES,
  capitalizeFirst,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatDuration,
  formatFileSize,
  formatNumber,
  formatPercentage,
  formatRelativeTime,
  getCurrentMode,
  getCurrentPrices,
  getSingleVideoPrice,
  getStripeConfig,
  getTripleVideoPrice,
  guestRegex,
  hasErrors,
  isStrongPassword,
  isValidArray,
  isValidDate,
  isValidEmail,
  isValidFileSize,
  isValidFileType,
  isValidId,
  isValidNumberRange,
  isValidPassword,
  isValidPhone,
  isValidTextLength,
  isValidUUID,
  isValidUrl,
  slugify,
  truncateText,
  useClickOutside,
  useDebounce,
  useIsDarkMode,
  useIsDesktop,
  useIsMobile,
  useIsReducedMotion,
  useIsTablet,
  useLocalStorage,
  useMediaQuery,
  validateObject,
  validateRequired
});
//# sourceMappingURL=index.js.map