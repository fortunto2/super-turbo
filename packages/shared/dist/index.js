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
  en: () => en,
  es: () => es,
  formatCurrency: () => formatCurrency,
  formatDate: () => formatDate,
  formatDateTime: () => formatDateTime,
  formatDuration: () => formatDuration,
  formatFileSize: () => formatFileSize,
  formatNumber: () => formatNumber,
  formatPercentage: () => formatPercentage,
  formatRelativeTime: () => formatRelativeTime,
  getAllTranslationKeys: () => getAllTranslationKeys,
  getClientSuperLandingTranslation: () => getClientSuperLandingTranslation,
  getCurrentMode: () => getCurrentMode,
  getCurrentPrices: () => getCurrentPrices,
  getNestedValue: () => getNestedValue,
  getServerSuperLandingTranslation: () => getServerSuperLandingTranslation,
  getSingleVideoPrice: () => getSingleVideoPrice,
  getStripeConfig: () => getStripeConfig,
  getSuperLandingDictionary: () => getSuperLandingDictionary,
  getSuperLandingDictionaryServer: () => getSuperLandingDictionaryServer,
  getTranslation: () => getTranslation,
  getTranslationWithInterpolation: () => getTranslationWithInterpolation,
  getTripleVideoPrice: () => getTripleVideoPrice,
  guestRegex: () => guestRegex,
  hasErrors: () => hasErrors,
  hasTranslation: () => hasTranslation,
  hi: () => hi,
  i18n: () => i18n,
  i18nServer: () => i18nServer,
  interpolateTranslation: () => interpolateTranslation,
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
  localeCookieName: () => localeCookieName,
  localeMap: () => localeMap,
  localeMapServer: () => localeMapServer,
  ru: () => ru,
  slugify: () => slugify,
  superLandingDictionaries: () => superLandingDictionaries,
  tr: () => tr,
  translationConfig: () => translationConfig,
  translationConfigServer: () => translationConfigServer,
  truncateText: () => truncateText,
  useAppTranslations: () => useAppTranslations,
  useChatbotTranslations: () => useChatbotTranslations,
  useClickOutside: () => useClickOutside,
  useDebounce: () => useDebounce,
  useIsDarkMode: () => useIsDarkMode,
  useIsDesktop: () => useIsDesktop,
  useIsMobile: () => useIsMobile,
  useIsReducedMotion: () => useIsReducedMotion,
  useIsTablet: () => useIsTablet,
  useLandingTranslations: () => useLandingTranslations,
  useLocalStorage: () => useLocalStorage,
  useMediaQuery: () => useMediaQuery,
  useTranslations: () => useTranslations,
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

// src/translation/config.ts
var localeCookieName = "NEXT_LOCALE";
var i18n = {
  defaultLocale: "en",
  locales: ["en", "ru", "tr", "es", "hi"],
  localeDetection: true,
  // automatic detection by headers
  domains: void 0,
  cookieName: localeCookieName,
  cookieMaxAge: 31536e3,
  // 1 year in seconds
  preserveRouteOnHome: true
  // flag for clean URLs on home page
};
var localeMap = {
  en: "English",
  ru: "Russian",
  tr: "Turkish",
  es: "Spanish",
  hi: "Hindi"
};
var translationConfig = {
  i18n,
  localeMap
};

// src/translation/config-server.ts
var localeCookieName2 = "NEXT_LOCALE";
var i18nServer = {
  defaultLocale: "en",
  locales: ["en", "ru", "tr", "es", "hi"],
  localeDetection: true,
  // automatic detection by headers
  domains: void 0,
  cookieName: localeCookieName2,
  cookieMaxAge: 31536e3,
  // 1 year in seconds
  preserveRouteOnHome: true
  // flag for clean URLs on home page
};
var localeMapServer = {
  en: "English",
  ru: "Russian",
  tr: "Turkish",
  es: "Spanish",
  hi: "Hindi"
};
var translationConfigServer = {
  i18n: i18nServer,
  localeMap: localeMapServer
};

// src/translation/dictionaries/super-landing/en.ts
var en = {
  blog: {
    page_title: "Blog"
  },
  site: {
    name: "SuperDuperAI"
  },
  footer: {
    pages: {
      about: "About",
      pricing: "Pricing",
      terms: "Terms and Conditions",
      privacy: "Privacy",
      blog: "Blog",
      demo: "Book a Demo"
    },
    company: "SuperDuperAI",
    corp: "SuperDuperAi, Corp.",
    address1: "57 Saulsbury Rd, Unit E #1333",
    address2: "Dover, DE 19904",
    phone: "+1 818 619 0966",
    email: "info@superduperai.co",
    copyright: "\xA9 {year} SuperDuperAi Corp. All rights reserved.",
    social: {
      instagram: "Follow SuperDuperAI on Instagram",
      youtube: "Subscribe to SuperDuperAI on YouTube",
      telegram: "Join SuperDuperAI on Telegram",
      tiktok: "Follow SuperDuperAI on TikTok",
      discord: "Join SuperDuperAI Discord server",
      linkedin: "Connect with SuperDuperAI on LinkedIn"
    }
  },
  marketing: {
    pages: "Pages",
    tools: "AI Tools",
    cases: "Use Cases",
    ai_tool_title: "AI tool by SuperDuperAI",
    ai_case_title: "Case Study by SuperDuperAI",
    view_all_tools: "View All Tools \u2192",
    view_all_cases: "View All Use Cases \u2192"
  },
  hero: {
    title: "Turn Vibes into Videos Instantly",
    description: "Revolutionary AI platform for creating professional videos without skills, equipment, or budget. 10x faster and cheaper.",
    cta: "Start Creating for Free"
  },
  features: {
    section_title: "What Makes SuperDuperAI Super",
    section_description: "Advanced features and technologies for creating stunning videos",
    list: [
      {
        icon: "users",
        title: "Custom Characters with AI Memory",
        description: "Your AI actor database using LoRA technology. Create and save unique characters for your videos."
      },
      {
        icon: "image",
        title: "Cinematic Camera Controls",
        description: "Pans, zooms, bullet-time \u2014 without physical cameras. Add professional camera movements with one click."
      },
      {
        icon: "settings",
        title: "Multi-Agent AI Workflow",
        description: "A model where each agent does its job. Specialized AI for scripting, filming, editing, and sound."
      },
      {
        icon: "speed",
        title: "Fast & Efficient",
        description: "Idea \u2192 video in minutes, not hours or days. Speed up your workflow and create more content."
      },
      {
        icon: "chart",
        title: "Cost Saving",
        description: "Cinematography on a budget. Get professional video without spending on crew and equipment."
      },
      {
        icon: "edit",
        title: "Easy Editing & Integration",
        description: "Storyboard, drag-drop, export to TikTok / YouTube. Intuitive interface for quick finalization of your video."
      }
    ]
  },
  howItWorks: {
    section_title: "How It Works",
    section_description: "Direct your video in 3 easy steps \u2013 AI agents handle the rest.",
    steps: [
      {
        title: "Define Your Vision",
        description: "Describe your idea, vibe, or plot \u2014 just a few phrases are enough"
      },
      {
        title: "AI Generates the Scene",
        description: "Multi-agent system creates script, frames, and characters"
      },
      {
        title: "Refine and Finalize",
        description: "Adjust the style, export your video, and share it with the world"
      }
    ]
  },
  useCases: {
    section_title: "Made for Creators, Businesses, Musicians & Teams",
    section_description: "Find the perfect use case for SuperDuperAI to meet your needs.",
    categories: {
      "ai-video": "Content Creators",
      business: "Small Businesses",
      creative: "Musicians & Artists",
      teams: "Agencies & Teams",
      social: "Social Media"
    }
  },
  cta: {
    title: "Ready to create your next video sensation?",
    description: "Join SuperDuperAI and start creating amazing videos right now.",
    button: "Start Creating for Free",
    note: "No credit card required"
  },
  navbar: {
    home: "Home",
    about: "About",
    pricing: "Pricing",
    terms: "Terms",
    privacy: "Privacy",
    blog: "Blog",
    tools: "Tools",
    start: "Start For Free",
    menu: "Menu",
    close_menu: "Close menu",
    open_menu: "Open menu"
  },
  ui: {
    faq: "FAQ",
    approved_by: "Approved by",
    look: "Look!",
    show_more: "Show more",
    collapse: "Collapse",
    no_results: "No results",
    loading: "Loading...",
    success: "Success!",
    error: "Error",
    try_again: "Try again",
    empty: "Empty",
    nothing_found: "Nothing found",
    get_started: "Get Started"
  },
  pricing: {
    banner_title: "Try SuperDuperAI with 100 Free Credits!",
    banner_desc: "New users get 100 credits completely free - enough to create multiple projects and explore almost all our features. Test the power of AI creativity with no commitment.",
    banner_cta: "Start Creating Now",
    without_package: "Without a Package",
    with_power_package: "With a Power Package",
    base_name: "BASE - 100 credits",
    pro_name: "PRO - 1000 credits",
    base_projects: "5-10 projects",
    pro_projects: "20-50 projects",
    save_50: "save 50%",
    free_features: [
      "100 free credits per month",
      "Access to basic editing tools only",
      "Limited animation and voiceover options",
      "Videos with watermarks"
    ],
    base_features: [
      "Full access to all editing tools",
      "Unlimited creation",
      "Download finished videos without watermarks",
      "Personal manager to assist with your projects",
      "Exclusive training sessions to boost your skills"
    ],
    pro_features: [
      "Full access to all editing tools",
      "Unlimited creation",
      "Download finished videos without watermarks",
      "Personal manager to assist with your projects",
      "Exclusive training sessions to boost your skills"
    ],
    start: "Start Creating",
    buy: "Buy"
  },
  creative: {
    title: "SuperDuperAI Creative Partnership Program",
    desc: "We're looking for passionate content creators and artists! Join our program and receive 1000+ free credits, 1-on-1 support, and early access to new features. Perfect for creators with socially meaningful projects and innovative ideas.",
    learn_more: "Learn More",
    or: "or",
    apply_email: "Apply via Email"
  },
  privacy_policy: "Privacy policy",
  veo3PromptGenerator: {
    infoBanner: {
      title: "Master VEO3 Video Generation",
      description: "Learn professional prompting techniques and best practices for Google's most advanced AI video model."
    },
    tabs: {
      builder: "Prompt Builder",
      enhance: "AI Enhancement",
      history: "History"
    },
    promptBuilder: {
      scene: "Scene",
      scenePlaceholder: "Describe the setting, environment, or location...",
      style: "Style",
      stylePlaceholder: "Artistic, photorealistic, cinematic, etc...",
      camera: "Camera",
      cameraPlaceholder: "Camera movement, angle, shot type...",
      characters: "Characters",
      addCharacter: "Add Character",
      characterName: "Name",
      characterDescription: "Description",
      characterSpeech: "Speech/Dialogue",
      removeCharacter: "Remove",
      action: "Action",
      actionPlaceholder: "What's happening in the scene...",
      lighting: "Lighting",
      lightingPlaceholder: "Natural, dramatic, soft, etc...",
      mood: "Mood",
      moodPlaceholder: "Emotional atmosphere, tone...",
      language: "Language",
      moodboard: "Moodboard",
      moodboardEnabled: "Enable moodboard",
      moodboardDescription: "Upload reference images to guide generation"
    },
    promptPreview: {
      title: "Generated Prompt",
      copyButton: "Copy",
      copied: "Copied!",
      randomizeButton: "Randomize",
      clearButton: "Clear All",
      enhanceButton: "Enhance with AI"
    },
    aiEnhancement: {
      title: "AI Enhancement",
      description: "Enhance your prompt with advanced AI techniques",
      focusTypes: {
        character: "Character Focus",
        action: "Action Focus",
        cinematic: "Cinematic Focus",
        safe: "Safe Content"
      },
      settings: {
        title: "Enhancement Settings",
        characterLimit: "Character Limit",
        includeAudio: "Include Audio Description",
        model: "AI Model"
      },
      enhanceButton: "Enhance Prompt",
      enhancing: "Enhancing...",
      enhanceError: "Enhancement failed",
      enhancementInfo: {
        model: "Model",
        length: "Length",
        actualCharacters: "Actual Characters",
        targetCharacters: "Target Characters"
      }
    },
    promptHistory: {
      title: "Prompt History",
      empty: "No prompts in history yet",
      loadButton: "Load",
      clearButton: "Clear History",
      columns: {
        timestamp: "Date",
        basicPrompt: "Basic Prompt",
        enhancedPrompt: "Enhanced Prompt",
        length: "Length",
        model: "Model"
      }
    },
    common: {
      loading: "Loading...",
      error: "Error",
      success: "Success",
      cancel: "Cancel",
      save: "Save",
      delete: "Delete",
      edit: "Edit",
      close: "Close"
    }
  },
  video_generator: {
    title: "Video Generation",
    description: "Describe the video you want to create",
    placeholder: "For example: Beautiful sunset over the ocean with waves, shot from bird's eye view, cinematic quality, smooth camera movements...",
    duration: "Duration",
    aspect_ratio: "Aspect ratio",
    resolution: "Resolution",
    video_count: "Video count",
    generate: "Create video",
    generating: "Generating...",
    status: "Generation status",
    error: "Please enter a video description",
    generation_error: "Error creating generation",
    status_error: "Error checking status",
    download: "Download",
    reset: "Reset",
    seconds: "s",
    with: "with",
    progress: "Progress",
    completed: "Completed",
    error_status: "Error",
    processing: "Processing",
    pending: "Pending",
    ready: "Ready",
    results: "Results",
    video: "Video",
    watch: "Watch",
    create_new: "Create new video",
    generation_type: "Generation Type:",
    upload_image: "Upload Image:",
    image_uploaded: "\u2713 Image uploaded",
    click_to_select: "Click to select image or drag and drop file",
    select_file: "Select File",
    describe_animation: "Describe how to animate the image:",
    animation_placeholder: "For example: slowly sway, smoothly rotate, add cloud movement...",
    upload_image_required: "Please upload an image for image-to-video generation",
    insufficient_balance: "Insufficient credits. Required: {required} credits. Please top up your balance.",
    insufficient_balance_fallback: "Insufficient credits for video generation. Please top up your balance.",
    generate_for: "Generate for {price}",
    payment_error: "Payment failed. Please try again.",
    payment_description: "Pay $1.00 to generate videos with this model",
    back_to: "Back to {model}",
    generate_video_with: "Generate Video with {model}",
    create_amazing_videos: "Create amazing AI-generated videos for just $1.00",
    video_description: "Video Description",
    describe_video_detail: "Describe the video you want to create in detail",
    your_prompt: "Your prompt",
    generate_for_price: "Generate for $1.00",
    model_information: "Model Information",
    what_you_get: "What You Get",
    high_quality_video: "High-quality AI-generated video",
    commercial_rights: "Full commercial usage rights",
    instant_download: "Instant download after generation",
    no_subscription: "No subscription required",
    payment_successful: "Payment successful! Video generation will start soon.",
    advanced_ai_model: "Advanced AI video generation model",
    supports_both_modes: "\u2728 This model supports both text-to-video and image-to-video generation",
    image_to_video: "Image-to-Video",
    upload_source_image: "Upload Source Image (Optional)",
    upload_image_description: "Upload an image for image-to-video generation, or leave empty for text-to-video",
    click_to_upload: "Click to upload",
    or_drag_and_drop: "or drag and drop",
    file_formats: "PNG, JPG, GIF up to 10MB",
    pay_to_generate_video: "Pay $1.00 to Generate Video",
    generate_for_dollar: "Generate for $1.00"
  },
  image_generator: {
    title: "Image Generation",
    description: "Describe the image you want to create",
    placeholder: "For example: Modern cityscape, skyscrapers, sunset lights, high quality, realistic style...",
    width: "Width",
    height: "Height",
    aspect_ratio: "Aspect ratio",
    style: "Style",
    shot_size: "Shot size",
    image_count: "Image count",
    generate: "Create image",
    generating: "Generating...",
    status: "Generation status",
    error: "Please enter an image description",
    generation_error: "Error creating generation",
    status_error: "Error checking status",
    download: "Download",
    reset: "Reset",
    starting: "Starting generation...",
    tracking: "Generation started, tracking progress...",
    processing: "Processing...",
    completed: "Completed",
    error_status: "Error",
    progress: "Progress",
    pending: "Pending",
    ready: "Ready",
    results: "Results",
    image: "Image",
    watch: "Watch",
    create_new: "Create new image",
    image_description: "Image description",
    image_placeholder: "Describe the image you want to create...",
    generation_complete: "Generation complete!",
    generation_error_msg: "Error during generation",
    status_check_error: "Error checking generation status",
    created_images: "Created images:",
    generated_image: "Generated image",
    insufficient_balance: "Insufficient credits. Required: {required} credits. Please top up your balance.",
    insufficient_balance_fallback: "Insufficient credits for image generation. Please top up your balance.",
    generate_for: "Generate for {price}",
    payment_error: "Payment failed. Please try again.",
    payment_description: "Pay $1.00 to generate images with this model"
  },
  model_descriptions: {
    veo2: "Veo2 - transforming static images into dynamic HD videos while preserving original style",
    sora: "Sora - OpenAI's experimental model for generating short horizontal videos",
    veo3: "Veo3 - Google's latest model for text-to-video generation",
    google_imagen_4: "Google Imagen 4 - advanced AI model for creating high-quality images",
    gpt_image_1: "GPT-Image-1 - OpenAI's image generation model",
    flux_kontext: "Flux Kontext - advanced model for creative image generation"
  },
  credit_balance: {
    title: "Credit Balance",
    subtitle: "Current balance for using AI tools",
    current_balance: "Current balance:",
    credits: "credits",
    empty: "Empty",
    low_balance: "Low balance",
    good_balance: "Good balance",
    user_type: "User type:",
    tool_costs: "Tool costs:",
    image_generation: "Image generation: 2-6 credits",
    video_generation: "Video generation: 7.5-90 credits",
    script_generation: "Script generation: 1-2 credits",
    prompt_enhancement: "Prompt enhancement: 1-2 credits",
    loading: "Loading balance...",
    error: "Error loading balance"
  },
  direct_payment: {
    generate_image: "Generate Image with {model}",
    generate_video: "Generate Video with {model}",
    image_description: "Create stunning images with AI",
    video_description: "Create amazing videos with AI",
    your_prompt: "Your prompt",
    image_generation: "Image Generation",
    video_generation: "Video Generation",
    one_time_payment: "One-time payment",
    processing_payment: "Processing payment..."
  },
  stripe_payment: {
    loading_payment_options: "Loading payment options...",
    failed_load_payment: "Failed to load payment options",
    top_up_balance: "Top Up Balance",
    generate_veo3_videos: "Generate VEO3 Videos",
    generate_ai_images: "Generate AI Images",
    top_up_balance_desc: "Top up your balance with {amount} credits for using AI tools",
    generate_video_desc: "Your prompt is ready! Choose a plan to generate professional AI videos with Google VEO3.",
    generate_image_desc: "Your prompt is ready! Choose a plan to generate professional AI images.",
    top_up_credits: "Top up {amount} credits",
    generate_video: "Generate Video",
    generate_image: "Generate Image",
    get_credits_desc: "Get {amount} credits for generating images, videos and scripts",
    generate_video_desc_short: "Generate 1 high-quality AI video with your custom prompt",
    generate_image_desc_short: "Generate 1 high-quality AI image with your custom prompt",
    creating_payment: "Creating Payment...",
    top_up_for: "Top up for ${price}",
    generate_for: "Generate Video for ${price}",
    generate_image_for: "Generate Image for ${price}",
    instant_access: "\u2713 Instant access \u2022 \u2713 No subscription \u2022 \u2713 Secure Stripe payment",
    test_mode: "\u{1F9EA} Test mode - Use test card 4242 4242 4242 4242",
    generate_prompt_first: "Please generate a prompt first",
    prices_not_loaded: "Prices not loaded yet, please try again",
    failed_create_checkout: "Failed to create checkout session"
  }
};

// src/translation/dictionaries/super-landing/ru.ts
var ru = {
  blog: {
    page_title: "\u0411\u043B\u043E\u0433"
  },
  site: {
    name: "SuperDuperAI"
  },
  footer: {
    pages: {
      about: "\u041E \u043D\u0430\u0441",
      pricing: "\u0426\u0435\u043D\u044B",
      terms: "\u0423\u0441\u043B\u043E\u0432\u0438\u044F \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u0438\u044F",
      privacy: "\u041A\u043E\u043D\u0444\u0438\u0434\u0435\u043D\u0446\u0438\u0430\u043B\u044C\u043D\u043E\u0441\u0442\u044C",
      blog: "\u0411\u043B\u043E\u0433",
      demo: "\u0417\u0430\u043F\u0438\u0441\u0430\u0442\u044C\u0441\u044F \u043D\u0430 \u0434\u0435\u043C\u043E"
    },
    company: "SuperDuperAI",
    corp: "SuperDuperAi, Corp.",
    address1: "57 Saulsbury Rd, Unit E #1333",
    address2: "Dover, DE 19904",
    phone: "+1 818 619 0966",
    email: "info@superduperai.co",
    copyright: "\xA9 {year} SuperDuperAi Corp. \u0412\u0441\u0435 \u043F\u0440\u0430\u0432\u0430 \u0437\u0430\u0449\u0438\u0449\u0435\u043D\u044B.",
    social: {
      instagram: "\u041C\u044B \u0432 Instagram",
      youtube: "\u041F\u043E\u0434\u043F\u0438\u0441\u044B\u0432\u0430\u0439\u0442\u0435\u0441\u044C \u043D\u0430 YouTube SuperDuperAI",
      telegram: "\u041F\u0440\u0438\u0441\u043E\u0435\u0434\u0438\u043D\u044F\u0439\u0442\u0435\u0441\u044C \u043A Telegram SuperDuperAI",
      tiktok: "\u041C\u044B \u0432 TikTok",
      discord: "\u0412\u0441\u0442\u0443\u043F\u0430\u0439\u0442\u0435 \u0432 Discord SuperDuperAI",
      linkedin: "\u041C\u044B \u0432 LinkedIn"
    }
  },
  marketing: {
    pages: "\u0421\u0442\u0440\u0430\u043D\u0438\u0446\u044B",
    tools: "AI-\u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442\u044B",
    cases: "\u0421\u0446\u0435\u043D\u0430\u0440\u0438\u0438 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u0438\u044F",
    ai_tool_title: "\u0418\u0418\u2011\u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442 \u043E\u0442 SuperDuperAI",
    ai_case_title: "\u041A\u0435\u0439\u0441 \u043E\u0442 SuperDuperAI",
    view_all_tools: "\u0421\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u0432\u0441\u0435 \u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442\u044B \u2192",
    view_all_cases: "\u0421\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u0432\u0441\u0435 \u043A\u0435\u0439\u0441\u044B \u2192"
  },
  hero: {
    title: "\u041F\u0440\u0435\u0432\u0440\u0430\u0449\u0430\u0439\u0442\u0435 \u0432\u0430\u0439\u0431\u044B \u0432 \u0432\u0438\u0434\u0435\u043E \u043C\u0433\u043D\u043E\u0432\u0435\u043D\u043D\u043E",
    description: "\u0420\u0435\u0432\u043E\u043B\u044E\u0446\u0438\u043E\u043D\u043D\u0430\u044F AI\u2011\u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0430 \u0434\u043B\u044F \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u044F \u043F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0445 \u0432\u0438\u0434\u0435\u043E \u0431\u0435\u0437 \u043D\u0430\u0432\u044B\u043A\u043E\u0432, \u043E\u0431\u043E\u0440\u0443\u0434\u043E\u0432\u0430\u043D\u0438\u044F \u0438 \u0431\u044E\u0434\u0436\u0435\u0442\u0430. \u0412 10 \u0440\u0430\u0437 \u0431\u044B\u0441\u0442\u0440\u0435\u0435 \u0438 \u0434\u0435\u0448\u0435\u0432\u043B\u0435.",
    cta: "\u041D\u0430\u0447\u0430\u0442\u044C \u0441\u043E\u0437\u0434\u0430\u0432\u0430\u0442\u044C \u0431\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u043E"
  },
  features: {
    section_title: "\u041F\u043E\u0447\u0435\u043C\u0443 SuperDuperAI \u2014 \u044D\u0442\u043E \u0441\u0443\u043F\u0435\u0440",
    section_description: "\u041F\u0435\u0440\u0435\u0434\u043E\u0432\u044B\u0435 \u0444\u0443\u043D\u043A\u0446\u0438\u0438 \u0438 \u0442\u0435\u0445\u043D\u043E\u043B\u043E\u0433\u0438\u0438 \u0434\u043B\u044F \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u044F \u043F\u043E\u0442\u0440\u044F\u0441\u0430\u044E\u0449\u0438\u0445 \u0432\u0438\u0434\u0435\u043E",
    list: [
      {
        icon: "users",
        title: "AI\u2011\u043F\u0435\u0440\u0441\u043E\u043D\u0430\u0436\u0438 \u0441 \u043F\u0430\u043C\u044F\u0442\u044C\u044E",
        description: "\u0412\u0430\u0448\u0430 \u0431\u0430\u0437\u0430 AI\u2011\u0430\u043A\u0442\u0435\u0440\u043E\u0432 \u043D\u0430 \u0442\u0435\u0445\u043D\u043E\u043B\u043E\u0433\u0438\u0438 LoRA. \u0421\u043E\u0437\u0434\u0430\u0432\u0430\u0439\u0442\u0435 \u0438 \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u0439\u0442\u0435 \u0443\u043D\u0438\u043A\u0430\u043B\u044C\u043D\u044B\u0445 \u0433\u0435\u0440\u043E\u0435\u0432 \u0434\u043B\u044F \u0441\u0432\u043E\u0438\u0445 \u0432\u0438\u0434\u0435\u043E."
      },
      {
        icon: "image",
        title: "\u041A\u0438\u043D\u0435\u043C\u0430\u0442\u043E\u0433\u0440\u0430\u0444\u0438\u0447\u0435\u0441\u043A\u0438\u0435 \u043A\u0430\u043C\u0435\u0440\u044B",
        description: "\u041F\u0430\u043D\u043E\u0440\u0430\u043C\u044B, \u0437\u0443\u043C\u044B, \u0431\u0443\u043B\u043B\u0435\u0442\u2011\u0442\u0430\u0439\u043C \u2014 \u0431\u0435\u0437 \u0444\u0438\u0437\u0438\u0447\u0435\u0441\u043A\u043E\u0439 \u043A\u0430\u043C\u0435\u0440\u044B. \u041F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0435 \u0434\u0432\u0438\u0436\u0435\u043D\u0438\u044F \u043E\u0434\u043D\u0438\u043C \u043A\u043B\u0438\u043A\u043E\u043C."
      },
      {
        icon: "settings",
        title: "\u041C\u0443\u043B\u044C\u0442\u0438\u0430\u0433\u0435\u043D\u0442\u043D\u044B\u0439 AI\u2011\u0432\u043E\u0440\u043A\u0444\u043B\u043E\u0443",
        description: "\u041A\u0430\u0436\u0434\u044B\u0439 \u0430\u0433\u0435\u043D\u0442 \u043E\u0442\u0432\u0435\u0447\u0430\u0435\u0442 \u0437\u0430 \u0441\u0432\u043E\u044E \u0437\u0430\u0434\u0430\u0447\u0443: \u0441\u0446\u0435\u043D\u0430\u0440\u0438\u0439, \u0441\u044A\u0451\u043C\u043A\u0430, \u043C\u043E\u043D\u0442\u0430\u0436, \u0437\u0432\u0443\u043A."
      },
      {
        icon: "speed",
        title: "\u0411\u044B\u0441\u0442\u0440\u043E \u0438 \u044D\u0444\u0444\u0435\u043A\u0442\u0438\u0432\u043D\u043E",
        description: "\u0418\u0434\u0435\u044F \u2192 \u0432\u0438\u0434\u0435\u043E \u0437\u0430 \u043C\u0438\u043D\u0443\u0442\u044B, \u0430 \u043D\u0435 \u0447\u0430\u0441\u044B \u0438\u043B\u0438 \u0434\u043D\u0438. \u0423\u0441\u043A\u043E\u0440\u044C\u0442\u0435 \u0440\u0430\u0431\u043E\u0442\u0443 \u0438 \u0441\u043E\u0437\u0434\u0430\u0432\u0430\u0439\u0442\u0435 \u0431\u043E\u043B\u044C\u0448\u0435 \u043A\u043E\u043D\u0442\u0435\u043D\u0442\u0430."
      },
      {
        icon: "chart",
        title: "\u042D\u043A\u043E\u043D\u043E\u043C\u0438\u044F \u0431\u044E\u0434\u0436\u0435\u0442\u0430",
        description: "\u041A\u0438\u043D\u0435\u043C\u0430\u0442\u043E\u0433\u0440\u0430\u0444 \u0437\u0430 \u043A\u043E\u043F\u0435\u0439\u043A\u0438. \u041F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u043E\u0435 \u0432\u0438\u0434\u0435\u043E \u0431\u0435\u0437 \u0437\u0430\u0442\u0440\u0430\u0442 \u043D\u0430 \u043A\u043E\u043C\u0430\u043D\u0434\u0443 \u0438 \u043E\u0431\u043E\u0440\u0443\u0434\u043E\u0432\u0430\u043D\u0438\u0435."
      },
      {
        icon: "edit",
        title: "\u041F\u0440\u043E\u0441\u0442\u043E\u0435 \u0440\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u0438 \u044D\u043A\u0441\u043F\u043E\u0440\u0442",
        description: "\u0421\u0442\u043E\u0440\u0438\u0431\u043E\u0440\u0434, drag\u2011drop, \u044D\u043A\u0441\u043F\u043E\u0440\u0442 \u0432 TikTok / YouTube. \u0418\u043D\u0442\u0443\u0438\u0442\u0438\u0432\u043D\u044B\u0439 \u0438\u043D\u0442\u0435\u0440\u0444\u0435\u0439\u0441 \u0434\u043B\u044F \u0431\u044B\u0441\u0442\u0440\u043E\u0439 \u0444\u0438\u043D\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u0438."
      }
    ]
  },
  howItWorks: {
    section_title: "\u041A\u0430\u043A \u044D\u0442\u043E \u0440\u0430\u0431\u043E\u0442\u0430\u0435\u0442",
    section_description: "\u0421\u0440\u0435\u0436\u0438\u0441\u0441\u0438\u0440\u0443\u0439\u0442\u0435 \u0432\u0438\u0434\u0435\u043E \u0432 3 \u0448\u0430\u0433\u0430 \u2014 AI\u2011\u0430\u0433\u0435\u043D\u0442\u044B \u0441\u0434\u0435\u043B\u0430\u044E\u0442 \u043E\u0441\u0442\u0430\u043B\u044C\u043D\u043E\u0435.",
    steps: [
      {
        title: "\u041E\u043F\u0440\u0435\u0434\u0435\u043B\u0438\u0442\u0435 \u0438\u0434\u0435\u044E",
        description: "\u041E\u043F\u0438\u0448\u0438\u0442\u0435 \u0441\u0432\u043E\u044E \u0437\u0430\u0434\u0443\u043C\u043A\u0443, \u0432\u0430\u0439\u0431 \u0438\u043B\u0438 \u0441\u044E\u0436\u0435\u0442 \u2014 \u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u043F\u0430\u0440\u044B \u0444\u0440\u0430\u0437"
      },
      {
        title: "AI \u0433\u0435\u043D\u0435\u0440\u0438\u0440\u0443\u0435\u0442 \u0441\u0446\u0435\u043D\u0443",
        description: "\u041C\u0443\u043B\u044C\u0442\u0438\u0430\u0433\u0435\u043D\u0442\u043D\u0430\u044F \u0441\u0438\u0441\u0442\u0435\u043C\u0430 \u0441\u043E\u0437\u0434\u0430\u0451\u0442 \u0441\u0446\u0435\u043D\u0430\u0440\u0438\u0439, \u043A\u0430\u0434\u0440\u044B \u0438 \u043F\u0435\u0440\u0441\u043E\u043D\u0430\u0436\u0435\u0439"
      },
      {
        title: "\u0414\u043E\u0440\u0430\u0431\u043E\u0442\u0430\u0439\u0442\u0435 \u0438 \u044D\u043A\u0441\u043F\u043E\u0440\u0442\u0438\u0440\u0443\u0439\u0442\u0435",
        description: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u0442\u0435 \u0441\u0442\u0438\u043B\u044C, \u044D\u043A\u0441\u043F\u043E\u0440\u0442\u0438\u0440\u0443\u0439\u0442\u0435 \u0432\u0438\u0434\u0435\u043E \u0438 \u0434\u0435\u043B\u0438\u0442\u0435\u0441\u044C \u0438\u043C \u0441 \u043C\u0438\u0440\u043E\u043C"
      }
    ]
  },
  useCases: {
    section_title: "\u0421\u043E\u0437\u0434\u0430\u043D\u043E \u0434\u043B\u044F \u043A\u0440\u0435\u0430\u0442\u043E\u0440\u043E\u0432, \u0431\u0438\u0437\u043D\u0435\u0441\u0430, \u043C\u0443\u0437\u044B\u043A\u0430\u043D\u0442\u043E\u0432 \u0438 \u043A\u043E\u043C\u0430\u043D\u0434",
    section_description: "\u041D\u0430\u0439\u0434\u0438\u0442\u0435 \u0438\u0434\u0435\u0430\u043B\u044C\u043D\u044B\u0439 \u0441\u0446\u0435\u043D\u0430\u0440\u0438\u0439 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u0438\u044F SuperDuperAI \u0434\u043B\u044F \u0432\u0430\u0448\u0438\u0445 \u0437\u0430\u0434\u0430\u0447.",
    categories: {
      "ai-video": "\u041A\u043E\u043D\u0442\u0435\u043D\u0442-\u043C\u0435\u0439\u043A\u0435\u0440\u044B",
      business: "\u041C\u0430\u043B\u044B\u0439 \u0431\u0438\u0437\u043D\u0435\u0441",
      creative: "\u041C\u0443\u0437\u044B\u043A\u0430\u043D\u0442\u044B \u0438 \u0430\u0440\u0442\u0438\u0441\u0442\u044B",
      teams: "\u0410\u0433\u0435\u043D\u0442\u0441\u0442\u0432\u0430 \u0438 \u043A\u043E\u043C\u0430\u043D\u0434\u044B",
      social: "\u0421\u043E\u0446\u0438\u0430\u043B\u044C\u043D\u044B\u0435 \u0441\u0435\u0442\u0438"
    }
  },
  cta: {
    title: "\u0413\u043E\u0442\u043E\u0432\u044B \u0441\u043E\u0437\u0434\u0430\u0442\u044C \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0443\u044E \u0432\u0438\u0434\u0435\u043E-\u0441\u0435\u043D\u0441\u0430\u0446\u0438\u044E?",
    description: "\u041F\u0440\u0438\u0441\u043E\u0435\u0434\u0438\u043D\u044F\u0439\u0442\u0435\u0441\u044C \u043A SuperDuperAI \u0438 \u043D\u0430\u0447\u043D\u0438\u0442\u0435 \u0441\u043E\u0437\u0434\u0430\u0432\u0430\u0442\u044C \u043F\u043E\u0442\u0440\u044F\u0441\u0430\u044E\u0449\u0438\u0435 \u0432\u0438\u0434\u0435\u043E \u043F\u0440\u044F\u043C\u043E \u0441\u0435\u0439\u0447\u0430\u0441.",
    button: "\u041D\u0430\u0447\u0430\u0442\u044C \u0441\u043E\u0437\u0434\u0430\u0432\u0430\u0442\u044C \u0431\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u043E",
    note: "\u0411\u0435\u0437 \u043A\u0440\u0435\u0434\u0438\u0442\u043D\u043E\u0439 \u043A\u0430\u0440\u0442\u044B"
  },
  navbar: {
    home: "\u0413\u043B\u0430\u0432\u043D\u0430\u044F",
    about: "\u041E \u043D\u0430\u0441",
    pricing: "\u0426\u0435\u043D\u044B",
    terms: "\u0423\u0441\u043B\u043E\u0432\u0438\u044F",
    privacy: "\u041A\u043E\u043D\u0444\u0438\u0434\u0435\u043D\u0446\u0438\u0430\u043B\u044C\u043D\u043E\u0441\u0442\u044C",
    blog: "\u0411\u043B\u043E\u0433",
    tools: "\u0418\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442\u044B",
    start: "\u041D\u0430\u0447\u0430\u0442\u044C \u0431\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u043E",
    menu: "\u041C\u0435\u043D\u044E",
    close_menu: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C \u043C\u0435\u043D\u044E",
    open_menu: "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u043C\u0435\u043D\u044E"
  },
  ui: {
    faq: "FAQ",
    approved_by: "\u041E\u0434\u043E\u0431\u0440\u0435\u043D\u043E",
    look: "\u0421\u043C\u043E\u0442\u0440\u0438\u0442\u0435!",
    show_more: "\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435",
    collapse: "\u0421\u0432\u0435\u0440\u043D\u0443\u0442\u044C",
    no_results: "\u041D\u0435\u0442 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u043E\u0432",
    loading: "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430...",
    success: "\u0423\u0441\u043F\u0435\u0448\u043D\u043E!",
    error: "\u041E\u0448\u0438\u0431\u043A\u0430",
    try_again: "\u041F\u043E\u043F\u0440\u043E\u0431\u043E\u0432\u0430\u0442\u044C \u0441\u043D\u043E\u0432\u0430",
    empty: "\u041F\u0443\u0441\u0442\u043E",
    nothing_found: "\u041D\u0438\u0447\u0435\u0433\u043E \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E",
    get_started: "\u041D\u0430\u0447\u0430\u0442\u044C"
  },
  pricing: {
    banner_title: "\u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 SuperDuperAI \u0441 100 \u0431\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u044B\u043C\u0438 \u043A\u0440\u0435\u0434\u0438\u0442\u0430\u043C\u0438!",
    banner_desc: "\u041D\u043E\u0432\u044B\u0435 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0438 \u043F\u043E\u043B\u0443\u0447\u0430\u044E\u0442 100 \u043A\u0440\u0435\u0434\u0438\u0442\u043E\u0432 \u0441\u043E\u0432\u0435\u0440\u0448\u0435\u043D\u043D\u043E \u0431\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u043E - \u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0434\u043B\u044F \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u044F \u043D\u0435\u0441\u043A\u043E\u043B\u044C\u043A\u0438\u0445 \u043F\u0440\u043E\u0435\u043A\u0442\u043E\u0432 \u0438 \u0438\u0437\u0443\u0447\u0435\u043D\u0438\u044F \u043F\u043E\u0447\u0442\u0438 \u0432\u0441\u0435\u0445 \u043D\u0430\u0448\u0438\u0445 \u0444\u0443\u043D\u043A\u0446\u0438\u0439. \u041F\u0440\u043E\u0442\u0435\u0441\u0442\u0438\u0440\u0443\u0439\u0442\u0435 \u043C\u043E\u0449\u044C AI-\u043A\u0440\u0435\u0430\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u0438 \u0431\u0435\u0437 \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u0441\u0442\u0432.",
    banner_cta: "\u041D\u0430\u0447\u0430\u0442\u044C \u0441\u043E\u0437\u0434\u0430\u0432\u0430\u0442\u044C \u0441\u0435\u0439\u0447\u0430\u0441",
    without_package: "\u0411\u0435\u0437 \u043F\u0430\u043A\u0435\u0442\u0430",
    with_power_package: "\u0421 \u043F\u0430\u043A\u0435\u0442\u043E\u043C Power",
    base_name: "BASE - 100 \u043A\u0440\u0435\u0434\u0438\u0442\u043E\u0432",
    pro_name: "PRO - 1000 \u043A\u0440\u0435\u0434\u0438\u0442\u043E\u0432",
    base_projects: "5-10 \u043F\u0440\u043E\u0435\u043A\u0442\u043E\u0432",
    pro_projects: "20-50 \u043F\u0440\u043E\u0435\u043A\u0442\u043E\u0432",
    save_50: "\u044D\u043A\u043E\u043D\u043E\u043C\u0438\u044F 50%",
    free_features: [
      "100 \u0431\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u044B\u0445 \u043A\u0440\u0435\u0434\u0438\u0442\u043E\u0432 \u0432 \u043C\u0435\u0441\u044F\u0446",
      "\u0414\u043E\u0441\u0442\u0443\u043F \u0442\u043E\u043B\u044C\u043A\u043E \u043A \u0431\u0430\u0437\u043E\u0432\u044B\u043C \u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442\u0430\u043C \u0440\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u044F",
      "\u041E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u043D\u044B\u0435 \u043E\u043F\u0446\u0438\u0438 \u0430\u043D\u0438\u043C\u0430\u0446\u0438\u0438 \u0438 \u043E\u0437\u0432\u0443\u0447\u043A\u0438",
      "\u0412\u0438\u0434\u0435\u043E \u0441 \u0432\u043E\u0434\u044F\u043D\u044B\u043C\u0438 \u0437\u043D\u0430\u043A\u0430\u043C\u0438"
    ],
    base_features: [
      "\u041F\u043E\u043B\u043D\u044B\u0439 \u0434\u043E\u0441\u0442\u0443\u043F \u043A\u043E \u0432\u0441\u0435\u043C \u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442\u0430\u043C \u0440\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u044F",
      "\u041D\u0435\u043E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u043D\u043E\u0435 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u0435",
      "\u0421\u043A\u0430\u0447\u0438\u0432\u0430\u043D\u0438\u0435 \u0433\u043E\u0442\u043E\u0432\u044B\u0445 \u0432\u0438\u0434\u0435\u043E \u0431\u0435\u0437 \u0432\u043E\u0434\u044F\u043D\u044B\u0445 \u0437\u043D\u0430\u043A\u043E\u0432",
      "\u041F\u0435\u0440\u0441\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0439 \u043C\u0435\u043D\u0435\u0434\u0436\u0435\u0440 \u0434\u043B\u044F \u043F\u043E\u043C\u043E\u0449\u0438 \u0441 \u043F\u0440\u043E\u0435\u043A\u0442\u0430\u043C\u0438",
      "\u042D\u043A\u0441\u043A\u043B\u044E\u0437\u0438\u0432\u043D\u044B\u0435 \u043E\u0431\u0443\u0447\u0430\u044E\u0449\u0438\u0435 \u0441\u0435\u0441\u0441\u0438\u0438 \u0434\u043B\u044F \u043F\u043E\u0432\u044B\u0448\u0435\u043D\u0438\u044F \u043D\u0430\u0432\u044B\u043A\u043E\u0432"
    ],
    pro_features: [
      "\u041F\u043E\u043B\u043D\u044B\u0439 \u0434\u043E\u0441\u0442\u0443\u043F \u043A\u043E \u0432\u0441\u0435\u043C \u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442\u0430\u043C \u0440\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u044F",
      "\u041D\u0435\u043E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u043D\u043E\u0435 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u0435",
      "\u0421\u043A\u0430\u0447\u0438\u0432\u0430\u043D\u0438\u0435 \u0433\u043E\u0442\u043E\u0432\u044B\u0445 \u0432\u0438\u0434\u0435\u043E \u0431\u0435\u0437 \u0432\u043E\u0434\u044F\u043D\u044B\u0445 \u0437\u043D\u0430\u043A\u043E\u0432",
      "\u041F\u0435\u0440\u0441\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0439 \u043C\u0435\u043D\u0435\u0434\u0436\u0435\u0440 \u0434\u043B\u044F \u043F\u043E\u043C\u043E\u0449\u0438 \u0441 \u043F\u0440\u043E\u0435\u043A\u0442\u0430\u043C\u0438",
      "\u042D\u043A\u0441\u043A\u043B\u044E\u0437\u0438\u0432\u043D\u044B\u0435 \u043E\u0431\u0443\u0447\u0430\u044E\u0449\u0438\u0435 \u0441\u0435\u0441\u0441\u0438\u0438 \u0434\u043B\u044F \u043F\u043E\u0432\u044B\u0448\u0435\u043D\u0438\u044F \u043D\u0430\u0432\u044B\u043A\u043E\u0432"
    ],
    start: "\u041D\u0430\u0447\u0430\u0442\u044C \u0441\u043E\u0437\u0434\u0430\u0432\u0430\u0442\u044C",
    buy: "\u041A\u0443\u043F\u0438\u0442\u044C"
  },
  creative: {
    title: "\u041F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0430 \u0442\u0432\u043E\u0440\u0447\u0435\u0441\u043A\u043E\u0433\u043E \u043F\u0430\u0440\u0442\u043D\u0435\u0440\u0441\u0442\u0432\u0430 SuperDuperAI",
    desc: "\u041C\u044B \u0438\u0449\u0435\u043C \u0441\u0442\u0440\u0430\u0441\u0442\u043D\u044B\u0445 \u0441\u043E\u0437\u0434\u0430\u0442\u0435\u043B\u0435\u0439 \u043A\u043E\u043D\u0442\u0435\u043D\u0442\u0430 \u0438 \u0430\u0440\u0442\u0438\u0441\u0442\u043E\u0432! \u041F\u0440\u0438\u0441\u043E\u0435\u0434\u0438\u043D\u044F\u0439\u0442\u0435\u0441\u044C \u043A \u043D\u0430\u0448\u0435\u0439 \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0435 \u0438 \u043F\u043E\u043B\u0443\u0447\u0438\u0442\u0435 1000+ \u0431\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u044B\u0445 \u043A\u0440\u0435\u0434\u0438\u0442\u043E\u0432, \u0438\u043D\u0434\u0438\u0432\u0438\u0434\u0443\u0430\u043B\u044C\u043D\u0443\u044E \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u043A\u0443 \u0438 \u0440\u0430\u043D\u043D\u0438\u0439 \u0434\u043E\u0441\u0442\u0443\u043F \u043A \u043D\u043E\u0432\u044B\u043C \u0444\u0443\u043D\u043A\u0446\u0438\u044F\u043C. \u0418\u0434\u0435\u0430\u043B\u044C\u043D\u043E \u0434\u043B\u044F \u0441\u043E\u0437\u0434\u0430\u0442\u0435\u043B\u0435\u0439 \u0441 \u0441\u043E\u0446\u0438\u0430\u043B\u044C\u043D\u043E \u0437\u043D\u0430\u0447\u0438\u043C\u044B\u043C\u0438 \u043F\u0440\u043E\u0435\u043A\u0442\u0430\u043C\u0438 \u0438 \u0438\u043D\u043D\u043E\u0432\u0430\u0446\u0438\u043E\u043D\u043D\u044B\u043C\u0438 \u0438\u0434\u0435\u044F\u043C\u0438.",
    learn_more: "\u0423\u0437\u043D\u0430\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435",
    or: "\u0438\u043B\u0438",
    apply_email: "\u041F\u043E\u0434\u0430\u0442\u044C \u0437\u0430\u044F\u0432\u043A\u0443 \u043F\u043E email"
  },
  privacy_policy: "\u041F\u043E\u043B\u0438\u0442\u0438\u043A\u0430 \u043A\u043E\u043D\u0444\u0438\u0434\u0435\u043D\u0446\u0438\u0430\u043B\u044C\u043D\u043E\u0441\u0442\u0438",
  veo3PromptGenerator: {
    infoBanner: {
      title: "\u041E\u0441\u0432\u043E\u0439\u0442\u0435 \u0433\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u044E \u0432\u0438\u0434\u0435\u043E VEO3",
      description: "\u0418\u0437\u0443\u0447\u0438\u0442\u0435 \u043F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0435 \u0442\u0435\u0445\u043D\u0438\u043A\u0438 \u043F\u0440\u043E\u043C\u043F\u0442\u0438\u043D\u0433\u0430 \u0438 \u043B\u0443\u0447\u0448\u0438\u0435 \u043F\u0440\u0430\u043A\u0442\u0438\u043A\u0438 \u0434\u043B\u044F \u0441\u0430\u043C\u043E\u0439 \u043F\u0440\u043E\u0434\u0432\u0438\u043D\u0443\u0442\u043E\u0439 AI-\u043C\u043E\u0434\u0435\u043B\u0438 \u0432\u0438\u0434\u0435\u043E \u043E\u0442 Google."
    },
    tabs: {
      builder: "\u041A\u043E\u043D\u0441\u0442\u0440\u0443\u043A\u0442\u043E\u0440 \u043F\u0440\u043E\u043C\u043F\u0442\u043E\u0432",
      enhance: "AI-\u0443\u043B\u0443\u0447\u0448\u0435\u043D\u0438\u0435",
      history: "\u0418\u0441\u0442\u043E\u0440\u0438\u044F"
    },
    promptBuilder: {
      scene: "\u0421\u0446\u0435\u043D\u0430",
      scenePlaceholder: "\u041E\u043F\u0438\u0448\u0438\u0442\u0435 \u043E\u0431\u0441\u0442\u0430\u043D\u043E\u0432\u043A\u0443, \u043E\u043A\u0440\u0443\u0436\u0435\u043D\u0438\u0435 \u0438\u043B\u0438 \u043C\u0435\u0441\u0442\u043E...",
      style: "\u0421\u0442\u0438\u043B\u044C",
      stylePlaceholder: "\u0425\u0443\u0434\u043E\u0436\u0435\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0439, \u0444\u043E\u0442\u043E\u0440\u0435\u0430\u043B\u0438\u0441\u0442\u0438\u0447\u043D\u044B\u0439, \u043A\u0438\u043D\u0435\u043C\u0430\u0442\u043E\u0433\u0440\u0430\u0444\u0438\u0447\u043D\u044B\u0439 \u0438 \u0442.\u0434...",
      camera: "\u041A\u0430\u043C\u0435\u0440\u0430",
      cameraPlaceholder: "\u0414\u0432\u0438\u0436\u0435\u043D\u0438\u0435 \u043A\u0430\u043C\u0435\u0440\u044B, \u0443\u0433\u043E\u043B, \u0442\u0438\u043F \u043A\u0430\u0434\u0440\u0430...",
      characters: "\u041F\u0435\u0440\u0441\u043E\u043D\u0430\u0436\u0438",
      addCharacter: "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u043F\u0435\u0440\u0441\u043E\u043D\u0430\u0436\u0430",
      characterName: "\u0418\u043C\u044F",
      characterDescription: "\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435",
      characterSpeech: "\u0420\u0435\u0447\u044C/\u0414\u0438\u0430\u043B\u043E\u0433",
      removeCharacter: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C",
      action: "\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u0435",
      actionPlaceholder: "\u0427\u0442\u043E \u043F\u0440\u043E\u0438\u0441\u0445\u043E\u0434\u0438\u0442 \u0432 \u0441\u0446\u0435\u043D\u0435...",
      lighting: "\u041E\u0441\u0432\u0435\u0449\u0435\u043D\u0438\u0435",
      lightingPlaceholder: "\u0415\u0441\u0442\u0435\u0441\u0442\u0432\u0435\u043D\u043D\u043E\u0435, \u0434\u0440\u0430\u043C\u0430\u0442\u0438\u0447\u043D\u043E\u0435, \u043C\u044F\u0433\u043A\u043E\u0435 \u0438 \u0442.\u0434...",
      mood: "\u041D\u0430\u0441\u0442\u0440\u043E\u0435\u043D\u0438\u0435",
      moodPlaceholder: "\u042D\u043C\u043E\u0446\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u0430\u044F \u0430\u0442\u043C\u043E\u0441\u0444\u0435\u0440\u0430, \u0442\u043E\u043D...",
      language: "\u042F\u0437\u044B\u043A",
      moodboard: "\u041C\u0443\u0434\u0431\u043E\u0440\u0434",
      moodboardEnabled: "\u0412\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u043C\u0443\u0434\u0431\u043E\u0440\u0434",
      moodboardDescription: "\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u0435 \u0440\u0435\u0444\u0435\u0440\u0435\u043D\u0441\u043D\u044B\u0435 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F \u0434\u043B\u044F \u043D\u0430\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u044F \u0433\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u0438"
    },
    promptPreview: {
      title: "\u0421\u0433\u0435\u043D\u0435\u0440\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0439 \u043F\u0440\u043E\u043C\u043F\u0442",
      copyButton: "\u041A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C",
      copied: "\u0421\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u043E!",
      randomizeButton: "\u0420\u0430\u043D\u0434\u043E\u043C\u0438\u0437\u0438\u0440\u043E\u0432\u0430\u0442\u044C",
      clearButton: "\u041E\u0447\u0438\u0441\u0442\u0438\u0442\u044C \u0432\u0441\u0435",
      enhanceButton: "\u0423\u043B\u0443\u0447\u0448\u0438\u0442\u044C \u0441 AI"
    },
    aiEnhancement: {
      title: "AI-\u0443\u043B\u0443\u0447\u0448\u0435\u043D\u0438\u0435",
      description: "\u0423\u043B\u0443\u0447\u0448\u0438\u0442\u0435 \u0432\u0430\u0448 \u043F\u0440\u043E\u043C\u043F\u0442 \u0441 \u043F\u043E\u043C\u043E\u0449\u044C\u044E \u043F\u0440\u043E\u0434\u0432\u0438\u043D\u0443\u0442\u044B\u0445 AI-\u0442\u0435\u0445\u043D\u0438\u043A",
      focusTypes: {
        character: "\u0424\u043E\u043A\u0443\u0441 \u043D\u0430 \u043F\u0435\u0440\u0441\u043E\u043D\u0430\u0436\u0435",
        action: "\u0424\u043E\u043A\u0443\u0441 \u043D\u0430 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0438",
        cinematic: "\u041A\u0438\u043D\u0435\u043C\u0430\u0442\u043E\u0433\u0440\u0430\u0444\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0444\u043E\u043A\u0443\u0441",
        safe: "\u0411\u0435\u0437\u043E\u043F\u0430\u0441\u043D\u044B\u0439 \u043A\u043E\u043D\u0442\u0435\u043D\u0442"
      },
      settings: {
        title: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0443\u043B\u0443\u0447\u0448\u0435\u043D\u0438\u044F",
        characterLimit: "\u041B\u0438\u043C\u0438\u0442 \u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432",
        includeAudio: "\u0412\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u043E\u043F\u0438\u0441\u0430\u043D\u0438\u0435 \u0430\u0443\u0434\u0438\u043E",
        model: "AI-\u043C\u043E\u0434\u0435\u043B\u044C"
      },
      enhanceButton: "\u0423\u043B\u0443\u0447\u0448\u0438\u0442\u044C \u043F\u0440\u043E\u043C\u043F\u0442",
      enhancing: "\u0423\u043B\u0443\u0447\u0448\u0435\u043D\u0438\u0435...",
      enhanceError: "\u0423\u043B\u0443\u0447\u0448\u0435\u043D\u0438\u0435 \u043D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C",
      enhancementInfo: {
        model: "\u041C\u043E\u0434\u0435\u043B\u044C",
        length: "\u0414\u043B\u0438\u043D\u0430",
        actualCharacters: "\u0424\u0430\u043A\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u0435 \u0441\u0438\u043C\u0432\u043E\u043B\u044B",
        targetCharacters: "\u0426\u0435\u043B\u0435\u0432\u044B\u0435 \u0441\u0438\u043C\u0432\u043E\u043B\u044B"
      }
    },
    promptHistory: {
      title: "\u0418\u0441\u0442\u043E\u0440\u0438\u044F \u043F\u0440\u043E\u043C\u043F\u0442\u043E\u0432",
      empty: "\u0412 \u0438\u0441\u0442\u043E\u0440\u0438\u0438 \u043F\u043E\u043A\u0430 \u043D\u0435\u0442 \u043F\u0440\u043E\u043C\u043F\u0442\u043E\u0432",
      loadButton: "\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C",
      clearButton: "\u041E\u0447\u0438\u0441\u0442\u0438\u0442\u044C \u0438\u0441\u0442\u043E\u0440\u0438\u044E",
      columns: {
        timestamp: "\u0414\u0430\u0442\u0430",
        basicPrompt: "\u0411\u0430\u0437\u043E\u0432\u044B\u0439 \u043F\u0440\u043E\u043C\u043F\u0442",
        enhancedPrompt: "\u0423\u043B\u0443\u0447\u0448\u0435\u043D\u043D\u044B\u0439 \u043F\u0440\u043E\u043C\u043F\u0442",
        length: "\u0414\u043B\u0438\u043D\u0430",
        model: "\u041C\u043E\u0434\u0435\u043B\u044C"
      }
    },
    common: {
      loading: "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430...",
      error: "\u041E\u0448\u0438\u0431\u043A\u0430",
      success: "\u0423\u0441\u043F\u0435\u0448\u043D\u043E",
      cancel: "\u041E\u0442\u043C\u0435\u043D\u0430",
      save: "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C",
      delete: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C",
      edit: "\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C",
      close: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C"
    }
  },
  video_generator: {
    title: "\u0413\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u044F \u0432\u0438\u0434\u0435\u043E",
    description: "\u041E\u043F\u0438\u0448\u0438\u0442\u0435 \u0432\u0438\u0434\u0435\u043E, \u043A\u043E\u0442\u043E\u0440\u043E\u0435 \u0445\u043E\u0442\u0438\u0442\u0435 \u0441\u043E\u0437\u0434\u0430\u0442\u044C",
    placeholder: "\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: \u041A\u0440\u0430\u0441\u0438\u0432\u044B\u0439 \u0437\u0430\u043A\u0430\u0442 \u043D\u0430\u0434 \u043E\u043A\u0435\u0430\u043D\u043E\u043C \u0441 \u0432\u043E\u043B\u043D\u0430\u043C\u0438, \u0441\u044A\u0435\u043C\u043A\u0430 \u0441 \u0432\u044B\u0441\u043E\u0442\u044B \u043F\u0442\u0438\u0447\u044C\u0435\u0433\u043E \u043F\u043E\u043B\u0435\u0442\u0430, \u043A\u0438\u043D\u0435\u043C\u0430\u0442\u043E\u0433\u0440\u0430\u0444\u0438\u0447\u0435\u0441\u043A\u043E\u0435 \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u043E, \u043F\u043B\u0430\u0432\u043D\u044B\u0435 \u0434\u0432\u0438\u0436\u0435\u043D\u0438\u044F \u043A\u0430\u043C\u0435\u0440\u044B...",
    duration: "\u0414\u043B\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u044C",
    aspect_ratio: "\u0421\u043E\u043E\u0442\u043D\u043E\u0448\u0435\u043D\u0438\u0435 \u0441\u0442\u043E\u0440\u043E\u043D",
    resolution: "\u0420\u0430\u0437\u0440\u0435\u0448\u0435\u043D\u0438\u0435",
    video_count: "\u041A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E \u0432\u0438\u0434\u0435\u043E",
    generate: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u0432\u0438\u0434\u0435\u043E",
    generating: "\u0421\u043E\u0437\u0434\u0430\u0435\u0442\u0441\u044F...",
    status: "\u0421\u0442\u0430\u0442\u0443\u0441 \u0433\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u0438",
    error: "\u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u0432\u0432\u0435\u0434\u0438\u0442\u0435 \u043E\u043F\u0438\u0441\u0430\u043D\u0438\u0435 \u0432\u0438\u0434\u0435\u043E",
    generation_error: "\u041E\u0448\u0438\u0431\u043A\u0430 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u044F \u0433\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u0438",
    status_error: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0438 \u0441\u0442\u0430\u0442\u0443\u0441\u0430",
    download: "\u0421\u043A\u0430\u0447\u0430\u0442\u044C",
    reset: "\u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C",
    seconds: "\u0441",
    with: "\u0441",
    progress: "\u041F\u0440\u043E\u0433\u0440\u0435\u0441\u0441",
    completed: "\u0417\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u043E",
    error_status: "\u041E\u0448\u0438\u0431\u043A\u0430",
    processing: "\u041E\u0431\u0440\u0430\u0431\u0430\u0442\u044B\u0432\u0430\u0435\u0442\u0441\u044F",
    pending: "\u0412 \u043E\u0436\u0438\u0434\u0430\u043D\u0438\u0438",
    ready: "\u0413\u043E\u0442\u043E\u0432\u043E",
    results: "\u0420\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u044B",
    video: "\u0412\u0438\u0434\u0435\u043E",
    watch: "\u0421\u043C\u043E\u0442\u0440\u0435\u0442\u044C",
    create_new: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u043D\u043E\u0432\u043E\u0435 \u0432\u0438\u0434\u0435\u043E",
    generation_type: "\u0422\u0438\u043F \u0433\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u0438:",
    upload_image: "\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0435:",
    image_uploaded: "\u2713 \u0418\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0435 \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043D\u043E",
    click_to_select: "\u041D\u0430\u0436\u043C\u0438\u0442\u0435 \u0434\u043B\u044F \u0432\u044B\u0431\u043E\u0440\u0430 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F \u0438\u043B\u0438 \u043F\u0435\u0440\u0435\u0442\u0430\u0449\u0438\u0442\u0435 \u0444\u0430\u0439\u043B",
    select_file: "\u0412\u044B\u0431\u0440\u0430\u0442\u044C \u0444\u0430\u0439\u043B",
    describe_animation: "\u041E\u043F\u0438\u0448\u0438\u0442\u0435, \u043A\u0430\u043A \u0430\u043D\u0438\u043C\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0435:",
    animation_placeholder: "\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: \u043C\u0435\u0434\u043B\u0435\u043D\u043D\u043E \u043F\u043E\u043A\u0430\u0447\u0438\u0432\u0430\u0442\u044C, \u043F\u043B\u0430\u0432\u043D\u043E \u0432\u0440\u0430\u0449\u0430\u0442\u044C, \u0434\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0434\u0432\u0438\u0436\u0435\u043D\u0438\u0435 \u043E\u0431\u043B\u0430\u043A\u043E\u0432...",
    upload_image_required: "\u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u0435 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0435 \u0434\u043B\u044F \u0433\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u0438 \u0432\u0438\u0434\u0435\u043E \u0438\u0437 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F",
    insufficient_balance: "\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u043A\u0440\u0435\u0434\u0438\u0442\u043E\u0432. \u0422\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044F: {required} \u043A\u0440\u0435\u0434\u0438\u0442\u043E\u0432. \u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u043F\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435 \u0431\u0430\u043B\u0430\u043D\u0441.",
    insufficient_balance_fallback: "\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u043A\u0440\u0435\u0434\u0438\u0442\u043E\u0432 \u0434\u043B\u044F \u0433\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u0438 \u0432\u0438\u0434\u0435\u043E. \u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u043F\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435 \u0431\u0430\u043B\u0430\u043D\u0441.",
    generate_for: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u0437\u0430 {price}",
    payment_error: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u043B\u0430\u0442\u0435\u0436\u0430. \u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u043F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0441\u043D\u043E\u0432\u0430.",
    payment_description: "\u0417\u0430\u043F\u043B\u0430\u0442\u0438\u0442\u0435 $1.00 \u0434\u043B\u044F \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u044F \u0432\u0438\u0434\u0435\u043E \u0441 \u043F\u043E\u043C\u043E\u0449\u044C\u044E \u044D\u0442\u043E\u0439 \u043C\u043E\u0434\u0435\u043B\u0438",
    back_to: "\u0412\u0435\u0440\u043D\u0443\u0442\u044C\u0441\u044F \u043A {model}",
    generate_video_with: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u0432\u0438\u0434\u0435\u043E \u0441 {model}",
    create_amazing_videos: "\u0421\u043E\u0437\u0434\u0430\u0432\u0430\u0439\u0442\u0435 \u043F\u043E\u0442\u0440\u044F\u0441\u0430\u044E\u0449\u0438\u0435 AI-\u0432\u0438\u0434\u0435\u043E \u0432\u0441\u0435\u0433\u043E \u0437\u0430 $1.00",
    video_description: "\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435 \u0432\u0438\u0434\u0435\u043E",
    describe_video_detail: "\u041F\u043E\u0434\u0440\u043E\u0431\u043D\u043E \u043E\u043F\u0438\u0448\u0438\u0442\u0435 \u0432\u0438\u0434\u0435\u043E, \u043A\u043E\u0442\u043E\u0440\u043E\u0435 \u0445\u043E\u0442\u0438\u0442\u0435 \u0441\u043E\u0437\u0434\u0430\u0442\u044C",
    your_prompt: "\u0412\u0430\u0448 \u043F\u0440\u043E\u043C\u043F\u0442",
    generate_for_price: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u0437\u0430 $1.00",
    model_information: "\u0418\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F \u043E \u043C\u043E\u0434\u0435\u043B\u0438",
    what_you_get: "\u0427\u0442\u043E \u0432\u044B \u043F\u043E\u043B\u0443\u0447\u0430\u0435\u0442\u0435",
    high_quality_video: "\u0412\u044B\u0441\u043E\u043A\u043E\u043A\u0430\u0447\u0435\u0441\u0442\u0432\u0435\u043D\u043D\u043E\u0435 AI-\u0432\u0438\u0434\u0435\u043E",
    commercial_rights: "\u041F\u043E\u043B\u043D\u044B\u0435 \u043A\u043E\u043C\u043C\u0435\u0440\u0447\u0435\u0441\u043A\u0438\u0435 \u043F\u0440\u0430\u0432\u0430 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u0438\u044F",
    instant_download: "\u041C\u0433\u043D\u043E\u0432\u0435\u043D\u043D\u0430\u044F \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u043F\u043E\u0441\u043B\u0435 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u044F",
    no_subscription: "\u041F\u043E\u0434\u043F\u0438\u0441\u043A\u0430 \u043D\u0435 \u0442\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044F",
    payment_successful: "\u041F\u043B\u0430\u0442\u0435\u0436 \u0443\u0441\u043F\u0435\u0448\u0435\u043D! \u0413\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u044F \u0432\u0438\u0434\u0435\u043E \u0441\u043A\u043E\u0440\u043E \u043D\u0430\u0447\u043D\u0435\u0442\u0441\u044F.",
    advanced_ai_model: "\u041F\u0440\u043E\u0434\u0432\u0438\u043D\u0443\u0442\u0430\u044F AI-\u043C\u043E\u0434\u0435\u043B\u044C \u0434\u043B\u044F \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u044F \u0432\u0438\u0434\u0435\u043E",
    supports_both_modes: "\u2728 \u042D\u0442\u0430 \u043C\u043E\u0434\u0435\u043B\u044C \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u0435\u0442 \u043A\u0430\u043A text-to-video, \u0442\u0430\u043A \u0438 image-to-video \u0433\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u044E",
    image_to_video: "\u0418\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0435 \u0432 \u0432\u0438\u0434\u0435\u043E",
    upload_source_image: "\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0438\u0441\u0445\u043E\u0434\u043D\u043E\u0435 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0435 (\u043D\u0435\u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u043E)",
    upload_image_description: "\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u0435 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0435 \u0434\u043B\u044F image-to-video \u0433\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u0438 \u0438\u043B\u0438 \u043E\u0441\u0442\u0430\u0432\u044C\u0442\u0435 \u043F\u0443\u0441\u0442\u044B\u043C \u0434\u043B\u044F text-to-video",
    click_to_upload: "\u041D\u0430\u0436\u043C\u0438\u0442\u0435 \u0434\u043B\u044F \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438",
    or_drag_and_drop: "\u0438\u043B\u0438 \u043F\u0435\u0440\u0435\u0442\u0430\u0449\u0438\u0442\u0435",
    file_formats: "PNG, JPG, GIF \u0434\u043E 10\u041C\u0411",
    pay_to_generate_video: "\u0417\u0430\u043F\u043B\u0430\u0442\u0438\u0442\u044C $1.00 \u0434\u043B\u044F \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u044F \u0432\u0438\u0434\u0435\u043E",
    generate_for_dollar: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u0437\u0430 $1.00"
  },
  image_generator: {
    title: "\u0413\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u044F \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0439",
    description: "\u041E\u043F\u0438\u0448\u0438\u0442\u0435 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0435, \u043A\u043E\u0442\u043E\u0440\u043E\u0435 \u0445\u043E\u0442\u0438\u0442\u0435 \u0441\u043E\u0437\u0434\u0430\u0442\u044C",
    placeholder: "\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: \u0421\u043E\u0432\u0440\u0435\u043C\u0435\u043D\u043D\u044B\u0439 \u0433\u043E\u0440\u043E\u0434\u0441\u043A\u043E\u0439 \u043F\u0435\u0439\u0437\u0430\u0436, \u043D\u0435\u0431\u043E\u0441\u043A\u0440\u0435\u0431\u044B, \u043E\u0433\u043D\u0438 \u0437\u0430\u043A\u0430\u0442\u0430, \u0432\u044B\u0441\u043E\u043A\u043E\u0435 \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u043E, \u0440\u0435\u0430\u043B\u0438\u0441\u0442\u0438\u0447\u043D\u044B\u0439 \u0441\u0442\u0438\u043B\u044C...",
    width: "\u0428\u0438\u0440\u0438\u043D\u0430",
    height: "\u0412\u044B\u0441\u043E\u0442\u0430",
    aspect_ratio: "\u0421\u043E\u043E\u0442\u043D\u043E\u0448\u0435\u043D\u0438\u0435 \u0441\u0442\u043E\u0440\u043E\u043D",
    style: "\u0421\u0442\u0438\u043B\u044C",
    shot_size: "\u0420\u0430\u0437\u043C\u0435\u0440 \u043A\u0430\u0434\u0440\u0430",
    image_count: "\u041A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0439",
    generate: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0435",
    generating: "\u0421\u043E\u0437\u0434\u0430\u0435\u0442\u0441\u044F...",
    status: "\u0421\u0442\u0430\u0442\u0443\u0441 \u0433\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u0438",
    error: "\u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u0432\u0432\u0435\u0434\u0438\u0442\u0435 \u043E\u043F\u0438\u0441\u0430\u043D\u0438\u0435 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F",
    generation_error: "\u041E\u0448\u0438\u0431\u043A\u0430 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u044F \u0433\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u0438",
    status_error: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0438 \u0441\u0442\u0430\u0442\u0443\u0441\u0430",
    download: "\u0421\u043A\u0430\u0447\u0430\u0442\u044C",
    reset: "\u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C",
    starting: "\u0413\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u044F \u043D\u0430\u0447\u0438\u043D\u0430\u0435\u0442\u0441\u044F...",
    tracking: "\u0413\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u044F \u043D\u0430\u0447\u0430\u043B\u0430\u0441\u044C, \u043E\u0442\u0441\u043B\u0435\u0436\u0438\u0432\u0430\u0435\u043C \u043F\u0440\u043E\u0433\u0440\u0435\u0441\u0441...",
    processing: "\u041E\u0431\u0440\u0430\u0431\u0430\u0442\u044B\u0432\u0430\u0435\u0442\u0441\u044F...",
    completed: "\u0417\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u043E",
    error_status: "\u041E\u0448\u0438\u0431\u043A\u0430",
    progress: "\u041F\u0440\u043E\u0433\u0440\u0435\u0441\u0441",
    pending: "\u0412 \u043E\u0436\u0438\u0434\u0430\u043D\u0438\u0438",
    ready: "\u0413\u043E\u0442\u043E\u0432\u043E",
    results: "\u0420\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u044B",
    image: "\u0418\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0435",
    watch: "\u0421\u043C\u043E\u0442\u0440\u0435\u0442\u044C",
    create_new: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u043D\u043E\u0432\u043E\u0435 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0435",
    image_description: "\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F",
    image_placeholder: "\u041E\u043F\u0438\u0448\u0438\u0442\u0435 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0435, \u043A\u043E\u0442\u043E\u0440\u043E\u0435 \u0445\u043E\u0442\u0438\u0442\u0435 \u0441\u043E\u0437\u0434\u0430\u0442\u044C...",
    generation_complete: "\u0413\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u044F \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u0430!",
    generation_error_msg: "\u041E\u0448\u0438\u0431\u043A\u0430 \u0432\u043E \u0432\u0440\u0435\u043C\u044F \u0433\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u0438",
    status_check_error: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0438 \u0441\u0442\u0430\u0442\u0443\u0441\u0430 \u0433\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u0438",
    created_images: "\u0421\u043E\u0437\u0434\u0430\u043D\u043D\u044B\u0435 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F:",
    generated_image: "\u0421\u0433\u0435\u043D\u0435\u0440\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u043E\u0435 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0435",
    insufficient_balance: "\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u043A\u0440\u0435\u0434\u0438\u0442\u043E\u0432. \u0422\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044F: {required} \u043A\u0440\u0435\u0434\u0438\u0442\u043E\u0432. \u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u043F\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435 \u0431\u0430\u043B\u0430\u043D\u0441.",
    insufficient_balance_fallback: "\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u043A\u0440\u0435\u0434\u0438\u0442\u043E\u0432 \u0434\u043B\u044F \u0433\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u0438 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0439. \u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u043F\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435 \u0431\u0430\u043B\u0430\u043D\u0441.",
    generate_for: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u0437\u0430 {price}",
    payment_error: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u043B\u0430\u0442\u0435\u0436\u0430. \u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u043F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0441\u043D\u043E\u0432\u0430.",
    payment_description: "\u0417\u0430\u043F\u043B\u0430\u0442\u0438\u0442\u0435 $1.00 \u0434\u043B\u044F \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u044F \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0439 \u0441 \u043F\u043E\u043C\u043E\u0449\u044C\u044E \u044D\u0442\u043E\u0439 \u043C\u043E\u0434\u0435\u043B\u0438"
  },
  model_descriptions: {
    veo2: "Veo2 - \u043F\u0440\u0435\u043E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u043D\u0438\u0435 \u0441\u0442\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u0445 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0439 \u0432 \u0434\u0438\u043D\u0430\u043C\u0438\u0447\u0435\u0441\u043A\u0438\u0435 HD-\u0432\u0438\u0434\u0435\u043E \u0441 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u0435\u043C \u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B\u044C\u043D\u043E\u0433\u043E \u0441\u0442\u0438\u043B\u044F",
    sora: "Sora - \u044D\u043A\u0441\u043F\u0435\u0440\u0438\u043C\u0435\u043D\u0442\u0430\u043B\u044C\u043D\u0430\u044F \u043C\u043E\u0434\u0435\u043B\u044C OpenAI \u0434\u043B\u044F \u0433\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u0438 \u043A\u043E\u0440\u043E\u0442\u043A\u0438\u0445 \u0433\u043E\u0440\u0438\u0437\u043E\u043D\u0442\u0430\u043B\u044C\u043D\u044B\u0445 \u0432\u0438\u0434\u0435\u043E",
    veo3: "Veo3 - \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u044F\u044F \u043C\u043E\u0434\u0435\u043B\u044C Google \u0434\u043B\u044F text-to-video \u0433\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u0438",
    google_imagen_4: "Google Imagen 4 - \u043F\u0440\u043E\u0434\u0432\u0438\u043D\u0443\u0442\u0430\u044F AI-\u043C\u043E\u0434\u0435\u043B\u044C \u0434\u043B\u044F \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u044F \u0432\u044B\u0441\u043E\u043A\u043E\u043A\u0430\u0447\u0435\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0445 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0439",
    gpt_image_1: "GPT-Image-1 - \u043C\u043E\u0434\u0435\u043B\u044C \u0433\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u0438 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0439 OpenAI",
    flux_kontext: "Flux Kontext - \u043F\u0440\u043E\u0434\u0432\u0438\u043D\u0443\u0442\u0430\u044F \u043C\u043E\u0434\u0435\u043B\u044C \u0434\u043B\u044F \u043A\u0440\u0435\u0430\u0442\u0438\u0432\u043D\u043E\u0439 \u0433\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u0438 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0439"
  },
  credit_balance: {
    title: "\u0411\u0430\u043B\u0430\u043D\u0441 \u043A\u0440\u0435\u0434\u0438\u0442\u043E\u0432",
    subtitle: "\u0422\u0435\u043A\u0443\u0449\u0438\u0439 \u0431\u0430\u043B\u0430\u043D\u0441 \u0434\u043B\u044F \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u0438\u044F AI-\u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442\u043E\u0432",
    current_balance: "\u0422\u0435\u043A\u0443\u0449\u0438\u0439 \u0431\u0430\u043B\u0430\u043D\u0441:",
    credits: "\u043A\u0440\u0435\u0434\u0438\u0442\u043E\u0432",
    empty: "\u041F\u0443\u0441\u0442\u043E",
    low_balance: "\u041D\u0438\u0437\u043A\u0438\u0439 \u0431\u0430\u043B\u0430\u043D\u0441",
    good_balance: "\u0425\u043E\u0440\u043E\u0448\u0438\u0439 \u0431\u0430\u043B\u0430\u043D\u0441",
    user_type: "\u0422\u0438\u043F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F:",
    tool_costs: "\u0421\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C \u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442\u043E\u0432:",
    image_generation: "\u0413\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u044F \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0439: 2-6 \u043A\u0440\u0435\u0434\u0438\u0442\u043E\u0432",
    video_generation: "\u0413\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u044F \u0432\u0438\u0434\u0435\u043E: 7.5-90 \u043A\u0440\u0435\u0434\u0438\u0442\u043E\u0432",
    script_generation: "\u0413\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u044F \u0441\u0446\u0435\u043D\u0430\u0440\u0438\u0435\u0432: 1-2 \u043A\u0440\u0435\u0434\u0438\u0442\u0430",
    prompt_enhancement: "\u0423\u043B\u0443\u0447\u0448\u0435\u043D\u0438\u0435 \u043F\u0440\u043E\u043C\u043F\u0442\u043E\u0432: 1-2 \u043A\u0440\u0435\u0434\u0438\u0442\u0430",
    loading: "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0431\u0430\u043B\u0430\u043D\u0441\u0430...",
    error: "\u041E\u0448\u0438\u0431\u043A\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438 \u0431\u0430\u043B\u0430\u043D\u0441\u0430"
  },
  direct_payment: {
    generate_image: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0435 \u0441 {model}",
    generate_video: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u0432\u0438\u0434\u0435\u043E \u0441 {model}",
    image_description: "\u0421\u043E\u0437\u0434\u0430\u0432\u0430\u0439\u0442\u0435 \u043F\u043E\u0442\u0440\u044F\u0441\u0430\u044E\u0449\u0438\u0435 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F \u0441 \u043F\u043E\u043C\u043E\u0449\u044C\u044E AI",
    video_description: "\u0421\u043E\u0437\u0434\u0430\u0432\u0430\u0439\u0442\u0435 \u043F\u043E\u0442\u0440\u044F\u0441\u0430\u044E\u0449\u0438\u0435 \u0432\u0438\u0434\u0435\u043E \u0441 \u043F\u043E\u043C\u043E\u0449\u044C\u044E AI",
    your_prompt: "\u0412\u0430\u0448 \u043F\u0440\u043E\u043C\u043F\u0442",
    image_generation: "\u0413\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u044F \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0439",
    video_generation: "\u0413\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u044F \u0432\u0438\u0434\u0435\u043E",
    one_time_payment: "\u0415\u0434\u0438\u043D\u043E\u0440\u0430\u0437\u043E\u0432\u044B\u0439 \u043F\u043B\u0430\u0442\u0435\u0436",
    processing_payment: "\u041E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0430 \u043F\u043B\u0430\u0442\u0435\u0436\u0430..."
  },
  stripe_payment: {
    loading_payment_options: "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0432\u0430\u0440\u0438\u0430\u043D\u0442\u043E\u0432 \u043E\u043F\u043B\u0430\u0442\u044B...",
    failed_load_payment: "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0432\u0430\u0440\u0438\u0430\u043D\u0442\u044B \u043E\u043F\u043B\u0430\u0442\u044B",
    top_up_balance: "\u041F\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u044C \u0431\u0430\u043B\u0430\u043D\u0441",
    generate_veo3_videos: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C VEO3 \u0432\u0438\u0434\u0435\u043E",
    generate_ai_images: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C AI \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F",
    top_up_balance_desc: "\u041F\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435 \u0431\u0430\u043B\u0430\u043D\u0441 \u043D\u0430 {amount} \u043A\u0440\u0435\u0434\u0438\u0442\u043E\u0432 \u0434\u043B\u044F \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u0438\u044F AI-\u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442\u043E\u0432",
    generate_video_desc: "\u0412\u0430\u0448 \u043F\u0440\u043E\u043C\u043F\u0442 \u0433\u043E\u0442\u043E\u0432! \u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u043F\u043B\u0430\u043D \u0434\u043B\u044F \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u044F \u043F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0445 AI-\u0432\u0438\u0434\u0435\u043E \u0441 Google VEO3.",
    generate_image_desc: "\u0412\u0430\u0448 \u043F\u0440\u043E\u043C\u043F\u0442 \u0433\u043E\u0442\u043E\u0432! \u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u043F\u043B\u0430\u043D \u0434\u043B\u044F \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u044F \u043F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0445 AI-\u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0439.",
    top_up_credits: "\u041F\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u044C {amount} \u043A\u0440\u0435\u0434\u0438\u0442\u043E\u0432",
    generate_video: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u0432\u0438\u0434\u0435\u043E",
    generate_image: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0435",
    get_credits_desc: "\u041F\u043E\u043B\u0443\u0447\u0438\u0442\u0435 {amount} \u043A\u0440\u0435\u0434\u0438\u0442\u043E\u0432 \u0434\u043B\u044F \u0433\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u0438 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0439, \u0432\u0438\u0434\u0435\u043E \u0438 \u0441\u0446\u0435\u043D\u0430\u0440\u0438\u0435\u0432",
    generate_video_desc_short: "\u0421\u043E\u0437\u0434\u0430\u0439\u0442\u0435 1 \u0432\u044B\u0441\u043E\u043A\u043E\u043A\u0430\u0447\u0435\u0441\u0442\u0432\u0435\u043D\u043D\u043E\u0435 AI-\u0432\u0438\u0434\u0435\u043E \u0441 \u0432\u0430\u0448\u0438\u043C \u043A\u0430\u0441\u0442\u043E\u043C\u043D\u044B\u043C \u043F\u0440\u043E\u043C\u043F\u0442\u043E\u043C",
    generate_image_desc_short: "\u0421\u043E\u0437\u0434\u0430\u0439\u0442\u0435 1 \u0432\u044B\u0441\u043E\u043A\u043E\u043A\u0430\u0447\u0435\u0441\u0442\u0432\u0435\u043D\u043D\u043E\u0435 AI-\u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0435 \u0441 \u0432\u0430\u0448\u0438\u043C \u043A\u0430\u0441\u0442\u043E\u043C\u043D\u044B\u043C \u043F\u0440\u043E\u043C\u043F\u0442\u043E\u043C",
    creating_payment: "\u0421\u043E\u0437\u0434\u0430\u043D\u0438\u0435 \u043F\u043B\u0430\u0442\u0435\u0436\u0430...",
    top_up_for: "\u041F\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u044C \u0437\u0430 ${price}",
    generate_for: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u0432\u0438\u0434\u0435\u043E \u0437\u0430 ${price}",
    generate_image_for: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0435 \u0437\u0430 ${price}",
    instant_access: "\u2713 \u041C\u0433\u043D\u043E\u0432\u0435\u043D\u043D\u044B\u0439 \u0434\u043E\u0441\u0442\u0443\u043F \u2022 \u2713 \u0411\u0435\u0437 \u043F\u043E\u0434\u043F\u0438\u0441\u043A\u0438 \u2022 \u2713 \u0411\u0435\u0437\u043E\u043F\u0430\u0441\u043D\u0430\u044F \u043E\u043F\u043B\u0430\u0442\u0430 Stripe",
    test_mode: "\u{1F9EA} \u0422\u0435\u0441\u0442\u043E\u0432\u044B\u0439 \u0440\u0435\u0436\u0438\u043C - \u0418\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 \u0442\u0435\u0441\u0442\u043E\u0432\u0443\u044E \u043A\u0430\u0440\u0442\u0443 4242 4242 4242 4242",
    generate_prompt_first: "\u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u0441\u043D\u0430\u0447\u0430\u043B\u0430 \u0441\u043E\u0437\u0434\u0430\u0439\u0442\u0435 \u043F\u0440\u043E\u043C\u043F\u0442",
    prices_not_loaded: "\u0426\u0435\u043D\u044B \u0435\u0449\u0435 \u043D\u0435 \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043D\u044B, \u043F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u043F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0441\u043D\u043E\u0432\u0430",
    failed_create_checkout: "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0441\u043E\u0437\u0434\u0430\u0442\u044C \u0441\u0435\u0441\u0441\u0438\u044E \u043E\u043F\u043B\u0430\u0442\u044B"
  }
};

// src/translation/dictionaries/super-landing/tr.ts
var tr = {
  blog: {
    page_title: "Blog"
  },
  site: {
    name: "SuperDuperAI"
  },
  footer: {
    pages: {
      about: "Hakk\u0131m\u0131zda",
      pricing: "Fiyatland\u0131rma",
      terms: "\u015Eartlar ve Ko\u015Fullar",
      privacy: "Gizlilik",
      blog: "Blog",
      demo: "Demo Rezervasyonu"
    },
    company: "SuperDuperAI",
    corp: "SuperDuperAi, Corp.",
    address1: "57 Saulsbury Rd, Unit E #1333",
    address2: "Dover, DE 19904",
    phone: "+1 818 619 0966",
    email: "info@superduperai.co",
    copyright: "\xA9 {year} SuperDuperAi Corp. T\xFCm haklar\u0131 sakl\u0131d\u0131r.",
    social: {
      instagram: "SuperDuperAI'yi Instagram'da takip edin",
      youtube: "SuperDuperAI YouTube kanal\u0131na abone olun",
      telegram: "SuperDuperAI Telegram grubuna kat\u0131l\u0131n",
      tiktok: "SuperDuperAI'yi TikTok'ta takip edin",
      discord: "SuperDuperAI Discord sunucusuna kat\u0131l\u0131n",
      linkedin: "SuperDuperAI ile LinkedIn'de ba\u011Flant\u0131 kurun"
    }
  },
  marketing: {
    pages: "Sayfalar",
    tools: "AI Ara\xE7lar\u0131",
    cases: "Kullan\u0131m Alanlar\u0131",
    ai_tool_title: "SuperDuperAI'den AI arac\u0131",
    ai_case_title: "SuperDuperAI'den Vaka \xC7al\u0131\u015Fmas\u0131",
    view_all_tools: "T\xFCm Ara\xE7lar\u0131 G\xF6r\xFCnt\xFCle \u2192",
    view_all_cases: "T\xFCm Kullan\u0131m Alanlar\u0131n\u0131 G\xF6r\xFCnt\xFCle \u2192"
  },
  hero: {
    title: "Vibes'lar\u0131 An\u0131nda Videoya D\xF6n\xFC\u015Ft\xFCr\xFCn",
    description: "Beceri, ekipman veya b\xFCt\xE7e olmadan profesyonel video olu\u015Fturmak i\xE7in devrimci AI platformu. 10x daha h\u0131zl\u0131 ve ucuz.",
    cta: "\xDCcretsiz Olarak Olu\u015Fturmaya Ba\u015Flay\u0131n"
  },
  features: {
    section_title: "SuperDuperAI'yi S\xFCper Yapan Nedir",
    section_description: "Etkileyici video olu\u015Fturmak i\xE7in geli\u015Fmi\u015F \xF6zellikler ve teknolojiler",
    list: [
      {
        icon: "users",
        title: "AI Haf\u0131zal\u0131 \xD6zel Karakterler",
        description: "LoRA teknolojisi kullanan AI akt\xF6r veritaban\u0131n\u0131z. Videolar\u0131n\u0131z i\xE7in benzersiz karakterler olu\u015Fturun ve kaydedin."
      },
      {
        icon: "image",
        title: "Sinematik Kamera Kontrolleri",
        description: "Pan, zoom, bullet-time \u2014 fiziksel kamera olmadan. Tek t\u0131kla profesyonel kamera hareketleri ekleyin."
      },
      {
        icon: "settings",
        title: "\xC7ok Ajanl\u0131 AI \u0130\u015F Ak\u0131\u015F\u0131",
        description: "Her ajan\u0131n kendi i\u015Fini yapt\u0131\u011F\u0131 model. Senaryo, \xE7ekim, d\xFCzenleme ve ses i\xE7in uzmanla\u015Fm\u0131\u015F AI."
      },
      {
        icon: "speed",
        title: "H\u0131zl\u0131 ve Verimli",
        description: "Fikir \u2192 video dakikalar i\xE7inde, saatler veya g\xFCnler de\u011Fil. \u0130\u015F ak\u0131\u015F\u0131n\u0131z\u0131 h\u0131zland\u0131r\u0131n ve daha fazla i\xE7erik olu\u015Fturun."
      },
      {
        icon: "chart",
        title: "Maliyet Tasarrufu",
        description: "B\xFCt\xE7e dostu sinematografi. Ekip ve ekipman i\xE7in harcama yapmadan profesyonel video elde edin."
      },
      {
        icon: "edit",
        title: "Kolay D\xFCzenleme ve Entegrasyon",
        description: "Storyboard, s\xFCr\xFCkle-b\u0131rak, TikTok/YouTube'a d\u0131\u015Fa aktarma. Videolar\u0131n\u0131z\u0131 h\u0131zl\u0131ca tamamlamak i\xE7in sezgisel aray\xFCz."
      }
    ]
  },
  howItWorks: {
    section_title: "Nas\u0131l \xC7al\u0131\u015F\u0131r",
    section_description: "Videonuzu 3 kolay ad\u0131mda y\xF6netin \u2013 AI ajanlar\u0131 gerisini halleder.",
    steps: [
      {
        title: "Vizyonunuzu Tan\u0131mlay\u0131n",
        description: "Fikrinizi, vibe'\u0131n\u0131z\u0131 veya plot'unuzu a\xE7\u0131klay\u0131n \u2014 sadece birka\xE7 c\xFCmle yeterli"
      },
      {
        title: "AI Sahneyi Olu\u015Fturur",
        description: "\xC7ok ajanl\u0131 sistem senaryo, kareler ve karakterler olu\u015Fturur"
      },
      {
        title: "\u0130yile\u015Ftirin ve Sonland\u0131r\u0131n",
        description: "Stili ayarlay\u0131n, videonuzu d\u0131\u015Fa aktar\u0131n ve d\xFCnyayla payla\u015F\u0131n"
      }
    ]
  },
  useCases: {
    section_title: "\u0130\xE7erik \xDCreticileri, \u0130\u015Fletmeler, M\xFCzisyenler ve Ekipler \u0130\xE7in Yap\u0131ld\u0131",
    section_description: "\u0130htiya\xE7lar\u0131n\u0131z\u0131 kar\u015F\u0131lamak i\xE7in SuperDuperAI'nin m\xFCkemmel kullan\u0131m alan\u0131n\u0131 bulun.",
    categories: {
      "ai-video": "\u0130\xE7erik \xDCreticileri",
      business: "K\xFC\xE7\xFCk \u0130\u015Fletmeler",
      creative: "M\xFCzisyenler ve Sanat\xE7\u0131lar",
      teams: "Ajanslar ve Ekipler",
      social: "Sosyal Medya"
    }
  },
  cta: {
    title: "Bir sonraki video sansasyonunuzu olu\u015Fturmaya haz\u0131r m\u0131s\u0131n\u0131z?",
    description: "SuperDuperAI'ye kat\u0131l\u0131n ve \u015Fimdi harika videolar olu\u015Fturmaya ba\u015Flay\u0131n.",
    button: "\xDCcretsiz Olarak Olu\u015Fturmaya Ba\u015Flay\u0131n",
    note: "Kredi kart\u0131 gerekmez"
  },
  navbar: {
    home: "Ana Sayfa",
    about: "Hakk\u0131m\u0131zda",
    pricing: "Fiyatland\u0131rma",
    terms: "\u015Eartlar",
    privacy: "Gizlilik",
    blog: "Blog",
    tools: "Ara\xE7lar",
    start: "\xDCcretsiz Ba\u015Flay\u0131n",
    menu: "Men\xFC",
    close_menu: "Men\xFCy\xFC kapat",
    open_menu: "Men\xFCy\xFC a\xE7"
  },
  ui: {
    faq: "SSS",
    approved_by: "Onaylayan",
    look: "Bak\u0131n!",
    show_more: "Daha fazla g\xF6ster",
    collapse: "Daralt",
    no_results: "Sonu\xE7 bulunamad\u0131",
    loading: "Y\xFCkleniyor...",
    success: "Ba\u015Far\u0131l\u0131!",
    error: "Hata",
    try_again: "Tekrar deneyin",
    empty: "Bo\u015F",
    nothing_found: "Hi\xE7bir \u015Fey bulunamad\u0131",
    get_started: "Ba\u015Flay\u0131n"
  },
  pricing: {
    banner_title: "100 \xDCcretsiz Kredi ile SuperDuperAI'yi Deneyin!",
    banner_desc: "Yeni kullan\u0131c\u0131lar tamamen \xFCcretsiz 100 kredi al\u0131r - birden fazla proje olu\u015Fturmak ve neredeyse t\xFCm \xF6zelliklerimizi ke\u015Ffetmek i\xE7in yeterli. Hi\xE7bir taahh\xFCt olmadan AI yarat\u0131c\u0131l\u0131\u011F\u0131n\u0131n g\xFCc\xFCn\xFC test edin.",
    banner_cta: "\u015Eimdi Olu\u015Fturmaya Ba\u015Flay\u0131n",
    without_package: "Paket Olmadan",
    with_power_package: "Power Paketi ile",
    base_name: "BASE - 100 kredi",
    pro_name: "PRO - 1000 kredi",
    base_projects: "5-10 proje",
    pro_projects: "20-50 proje",
    save_50: "%50 tasarruf",
    free_features: [
      "Ayda 100 \xFCcretsiz kredi",
      "Sadece temel d\xFCzenleme ara\xE7lar\u0131na eri\u015Fim",
      "S\u0131n\u0131rl\u0131 animasyon ve seslendirme se\xE7enekleri",
      "Filigranl\u0131 videolar"
    ],
    base_features: [
      "T\xFCm d\xFCzenleme ara\xE7lar\u0131na tam eri\u015Fim",
      "S\u0131n\u0131rs\u0131z yarat\u0131m",
      "Filigrans\u0131z bitmi\u015F videolar\u0131 indirin",
      "Projelerinizde size yard\u0131mc\u0131 olacak ki\u015Fisel y\xF6netici",
      "Becerilerinizi art\u0131racak \xF6zel e\u011Fitim seanslar\u0131"
    ],
    pro_features: [
      "T\xFCm d\xFCzenleme ara\xE7lar\u0131na tam eri\u015Fim",
      "S\u0131n\u0131rs\u0131z yarat\u0131m",
      "Filigrans\u0131z bitmi\u015F videolar\u0131 indirin",
      "Projelerinizde size yard\u0131mc\u0131 olacak ki\u015Fisel y\xF6netici",
      "Becerilerinizi art\u0131racak \xF6zel e\u011Fitim seanslar\u0131"
    ],
    start: "Olu\u015Fturmaya Ba\u015Flay\u0131n",
    buy: "Sat\u0131n Al"
  },
  creative: {
    title: "SuperDuperAI Yarat\u0131c\u0131 Ortakl\u0131k Program\u0131",
    desc: "Tutkulu i\xE7erik \xFCreticileri ve sanat\xE7\u0131lar ar\u0131yoruz! Program\u0131m\u0131za kat\u0131l\u0131n ve 1000+ \xFCcretsiz kredi, birebir destek ve yeni \xF6zelliklere erken eri\u015Fim al\u0131n. Sosyal olarak anlaml\u0131 projeler ve yenilik\xE7i fikirleri olan yarat\u0131c\u0131lar i\xE7in m\xFCkemmel.",
    learn_more: "Daha Fazla Bilgi",
    or: "veya",
    apply_email: "E-posta ile Ba\u015Fvurun"
  },
  privacy_policy: "Gizlilik politikas\u0131",
  veo3PromptGenerator: {
    infoBanner: {
      title: "VEO3 Video \xDCretiminde Uzmanla\u015F\u0131n",
      description: "Google'\u0131n en geli\u015Fmi\u015F AI video modeli i\xE7in profesyonel prompt tekniklerini ve en iyi uygulamalar\u0131 \xF6\u011Frenin."
    },
    tabs: {
      builder: "Prompt Olu\u015Fturucu",
      enhance: "AI Geli\u015Ftirme",
      history: "Ge\xE7mi\u015F"
    },
    promptBuilder: {
      scene: "Sahne",
      scenePlaceholder: "Ortam\u0131, \xE7evreyi veya konumu a\xE7\u0131klay\u0131n...",
      style: "Stil",
      stylePlaceholder: "Sanatsal, foto-ger\xE7ek\xE7i, sinematik, vb...",
      camera: "Kamera",
      cameraPlaceholder: "Kamera hareketi, a\xE7\u0131, \xE7ekim t\xFCr\xFC...",
      characters: "Karakterler",
      addCharacter: "Karakter Ekle",
      characterName: "\u0130sim",
      characterDescription: "A\xE7\u0131klama",
      characterSpeech: "Konu\u015Fma/Diyalog",
      removeCharacter: "Kald\u0131r",
      action: "Aksiyon",
      actionPlaceholder: "Sahnede ne oluyor...",
      lighting: "Ayd\u0131nlatma",
      lightingPlaceholder: "Do\u011Fal, dramatik, yumu\u015Fak, vb...",
      mood: "Ruh Hali",
      moodPlaceholder: "Duygusal atmosfer, ton...",
      language: "Dil",
      moodboard: "Moodboard",
      moodboardEnabled: "Moodboard'\u0131 etkinle\u015Ftir",
      moodboardDescription: "\xDCretimi y\xF6nlendirmek i\xE7in referans g\xF6rseller y\xFCkleyin"
    },
    promptPreview: {
      title: "Olu\u015Fturulan Prompt",
      copyButton: "Kopyala",
      copied: "Kopyaland\u0131!",
      randomizeButton: "Rastgelele\u015Ftir",
      clearButton: "T\xFCm\xFCn\xFC Temizle",
      enhanceButton: "AI ile Geli\u015Ftir"
    },
    aiEnhancement: {
      title: "AI Geli\u015Ftirme",
      description: "Prompt'unuzu geli\u015Fmi\u015F AI teknikleriyle geli\u015Ftirin",
      focusTypes: {
        character: "Karakter Odakl\u0131",
        action: "Aksiyon Odakl\u0131",
        cinematic: "Sinematik Odakl\u0131",
        safe: "G\xFCvenli \u0130\xE7erik"
      },
      settings: {
        title: "Geli\u015Ftirme Ayarlar\u0131",
        characterLimit: "Karakter Limiti",
        includeAudio: "Ses A\xE7\u0131klamas\u0131n\u0131 Dahil Et",
        model: "AI Modeli"
      },
      enhanceButton: "Prompt'u Geli\u015Ftir",
      enhancing: "Geli\u015Ftiriliyor...",
      enhanceError: "Geli\u015Ftirme ba\u015Far\u0131s\u0131z",
      enhancementInfo: {
        model: "Model",
        length: "Uzunluk",
        actualCharacters: "Ger\xE7ek Karakterler",
        targetCharacters: "Hedef Karakterler"
      }
    },
    promptHistory: {
      title: "Prompt Ge\xE7mi\u015Fi",
      empty: "Hen\xFCz ge\xE7mi\u015Fte prompt yok",
      loadButton: "Y\xFCkle",
      clearButton: "Ge\xE7mi\u015Fi Temizle",
      columns: {
        timestamp: "Tarih",
        basicPrompt: "Temel Prompt",
        enhancedPrompt: "Geli\u015Ftirilmi\u015F Prompt",
        length: "Uzunluk",
        model: "Model"
      }
    },
    common: {
      loading: "Y\xFCkleniyor...",
      error: "Hata",
      success: "Ba\u015Far\u0131l\u0131",
      cancel: "\u0130ptal",
      save: "Kaydet",
      delete: "Sil",
      edit: "D\xFCzenle",
      close: "Kapat"
    }
  },
  video_generator: {
    title: "Video \xDCretimi",
    description: "Olu\u015Fturmak istedi\u011Finiz videoyu a\xE7\u0131klay\u0131n",
    placeholder: "\xD6rne\u011Fin: Dalgalarla birlikte okyanus \xFCzerinde g\xFCzel bir g\xFCn bat\u0131m\u0131, ku\u015F bak\u0131\u015F\u0131 a\xE7\u0131dan \xE7ekim, sinematik kalite, yumu\u015Fak kamera hareketleri...",
    duration: "S\xFCre",
    aspect_ratio: "En boy oran\u0131",
    resolution: "\xC7\xF6z\xFCn\xFCrl\xFCk",
    video_count: "Video say\u0131s\u0131",
    generate: "Video olu\u015Ftur",
    generating: "Olu\u015Fturuluyor...",
    status: "\xDCretim durumu",
    error: "L\xFCtfen video a\xE7\u0131klamas\u0131 girin",
    generation_error: "\xDCretim olu\u015Fturulurken hata",
    status_error: "Durum kontrol edilirken hata",
    download: "\u0130ndir",
    reset: "S\u0131f\u0131rla",
    seconds: "s",
    with: "ile",
    progress: "\u0130lerleme",
    completed: "Tamamland\u0131",
    error_status: "Hata",
    processing: "\u0130\u015Fleniyor",
    pending: "Bekliyor",
    ready: "Haz\u0131r",
    results: "Sonu\xE7lar",
    video: "Video",
    watch: "\u0130zle",
    create_new: "Yeni video olu\u015Ftur",
    generation_type: "\xDCretim T\xFCr\xFC:",
    upload_image: "G\xF6r\xFCnt\xFC Y\xFCkle:",
    image_uploaded: "\u2713 G\xF6r\xFCnt\xFC y\xFCklendi",
    click_to_select: "G\xF6r\xFCnt\xFC se\xE7mek i\xE7in t\u0131klay\u0131n veya dosyay\u0131 s\xFCr\xFCkleyip b\u0131rak\u0131n",
    select_file: "Dosya Se\xE7",
    describe_animation: "G\xF6r\xFCnt\xFCn\xFCn nas\u0131l canland\u0131r\u0131laca\u011F\u0131n\u0131 a\xE7\u0131klay\u0131n:",
    animation_placeholder: "\xD6rne\u011Fin: yava\u015F\xE7a sallan, yumu\u015Fak\xE7a d\xF6nd\xFCr, bulut hareketi ekle...",
    upload_image_required: "L\xFCtfen g\xF6r\xFCnt\xFC-video \xFCretimi i\xE7in bir g\xF6r\xFCnt\xFC y\xFCkleyin",
    insufficient_balance: "Yetersiz kredi. Gerekli: {required} kredi. L\xFCtfen bakiyenizi yenileyin.",
    insufficient_balance_fallback: "Video \xFCretimi i\xE7in yeterli kredi yok. L\xFCtfen bakiyenizi yenileyin.",
    generate_for: "{price} i\xE7in olu\u015Ftur",
    payment_error: "\xD6deme ba\u015Far\u0131s\u0131z. L\xFCtfen tekrar deneyin.",
    payment_description: "Bu model ile video olu\u015Fturmak i\xE7in $1.00 \xF6deyin",
    back_to: "{model} sayfas\u0131na geri d\xF6n",
    generate_video_with: "{model} ile Video Olu\u015Ftur",
    create_amazing_videos: "Sadece $1.00'a harika AI videolar\u0131 olu\u015Fturun",
    video_description: "Video A\xE7\u0131klamas\u0131",
    describe_video_detail: "Olu\u015Fturmak istedi\u011Finiz videoyu detayl\u0131 olarak a\xE7\u0131klay\u0131n",
    your_prompt: "Sizin prompt'unuz",
    generate_for_price: "$1.00 i\xE7in olu\u015Ftur",
    model_information: "Model Bilgisi",
    what_you_get: "Ne Al\u0131rs\u0131n\u0131z",
    high_quality_video: "Y\xFCksek kaliteli AI video",
    commercial_rights: "Tam ticari kullan\u0131m haklar\u0131",
    instant_download: "Olu\u015Fturma sonras\u0131 an\u0131nda indirme",
    no_subscription: "Abonelik gerekmez",
    payment_successful: "\xD6deme ba\u015Far\u0131l\u0131! Video olu\u015Fturma yak\u0131nda ba\u015Flayacak.",
    advanced_ai_model: "Geli\u015Fmi\u015F AI video olu\u015Fturma modeli",
    supports_both_modes: "\u2728 Bu model hem text-to-video hem de image-to-video olu\u015Fturmay\u0131 destekler",
    image_to_video: "G\xF6r\xFCnt\xFC-Video",
    upload_source_image: "Kaynak G\xF6r\xFCnt\xFC Y\xFCkle (\u0130ste\u011Fe ba\u011Fl\u0131)",
    upload_image_description: "Image-to-video olu\u015Fturma i\xE7in g\xF6r\xFCnt\xFC y\xFCkleyin veya text-to-video i\xE7in bo\u015F b\u0131rak\u0131n",
    click_to_upload: "Y\xFCklemek i\xE7in t\u0131klay\u0131n",
    or_drag_and_drop: "veya s\xFCr\xFCkleyip b\u0131rak\u0131n",
    file_formats: "PNG, JPG, GIF maksimum 10MB",
    pay_to_generate_video: "$1.00 \xF6deyerek Video Olu\u015Ftur",
    generate_for_dollar: "$1.00 i\xE7in olu\u015Ftur"
  },
  image_generator: {
    title: "G\xF6r\xFCnt\xFC \xDCretimi",
    description: "Olu\u015Fturmak istedi\u011Finiz g\xF6r\xFCnt\xFCy\xFC a\xE7\u0131klay\u0131n",
    placeholder: "\xD6rne\u011Fin: Modern \u015Fehir manzaras\u0131, g\xF6kdelenler, g\xFCn bat\u0131m\u0131 \u0131\u015F\u0131klar\u0131, y\xFCksek kalite, ger\xE7ek\xE7i stil...",
    width: "Geni\u015Flik",
    height: "Y\xFCkseklik",
    aspect_ratio: "En boy oran\u0131",
    style: "Stil",
    shot_size: "\xC7ekim boyutu",
    image_count: "G\xF6r\xFCnt\xFC say\u0131s\u0131",
    generate: "G\xF6r\xFCnt\xFC olu\u015Ftur",
    generating: "Olu\u015Fturuluyor...",
    status: "\xDCretim durumu",
    error: "L\xFCtfen g\xF6r\xFCnt\xFC a\xE7\u0131klamas\u0131 girin",
    generation_error: "\xDCretim olu\u015Fturulurken hata",
    status_error: "Durum kontrol edilirken hata",
    download: "\u0130ndir",
    reset: "S\u0131f\u0131rla",
    starting: "\xDCretim ba\u015Fl\u0131yor...",
    tracking: "\xDCretim ba\u015Flad\u0131, ilerlemeyi takip ediyoruz...",
    processing: "\u0130\u015Fleniyor...",
    completed: "Tamamland\u0131",
    error_status: "Hata",
    progress: "\u0130lerleme",
    pending: "Bekliyor",
    ready: "Haz\u0131r",
    results: "Sonu\xE7lar",
    image: "G\xF6r\xFCnt\xFC",
    watch: "\u0130zle",
    create_new: "Yeni g\xF6r\xFCnt\xFC olu\u015Ftur",
    image_description: "G\xF6r\xFCnt\xFC a\xE7\u0131klamas\u0131",
    image_placeholder: "Olu\u015Fturmak istedi\u011Finiz g\xF6r\xFCnt\xFCy\xFC a\xE7\u0131klay\u0131n...",
    generation_complete: "\xDCretim tamamland\u0131!",
    generation_error_msg: "\xDCretim s\u0131ras\u0131nda hata",
    status_check_error: "\xDCretim durumu kontrol edilirken hata",
    created_images: "Olu\u015Fturulan g\xF6r\xFCnt\xFCler:",
    generated_image: "Olu\u015Fturulan g\xF6r\xFCnt\xFC",
    insufficient_balance: "Yetersiz kredi. Gerekli: {required} kredi. L\xFCtfen bakiyenizi yenileyin.",
    insufficient_balance_fallback: "G\xF6r\xFCnt\xFC \xFCretimi i\xE7in yeterli kredi yok. L\xFCtfen bakiyenizi yenileyin.",
    generate_for: "{price} i\xE7in olu\u015Ftur",
    payment_error: "\xD6deme ba\u015Far\u0131s\u0131z. L\xFCtfen tekrar deneyin.",
    payment_description: "Bu model ile g\xF6r\xFCnt\xFC olu\u015Fturmak i\xE7in $1.00 \xF6deyin"
  },
  model_descriptions: {
    veo2: "Veo2 - statik g\xF6r\xFCnt\xFCleri orijinal stili koruyarak dinamik HD videolara d\xF6n\xFC\u015Ft\xFCr\xFCr",
    sora: "Sora - k\u0131sa yatay videolar olu\u015Fturmak i\xE7in OpenAI'\u0131n deneysel modeli",
    veo3: "Veo3 - text-to-video \xFCretimi i\xE7in Google'\u0131n son modeli",
    google_imagen_4: "Google Imagen 4 - y\xFCksek kaliteli g\xF6r\xFCnt\xFCler olu\u015Fturmak i\xE7in geli\u015Fmi\u015F AI modeli",
    gpt_image_1: "GPT-Image-1 - OpenAI'\u0131n g\xF6r\xFCnt\xFC \xFCretim modeli",
    flux_kontext: "Flux Kontext - yarat\u0131c\u0131 g\xF6r\xFCnt\xFC \xFCretimi i\xE7in geli\u015Fmi\u015F model"
  },
  credit_balance: {
    title: "Kredi Bakiyesi",
    subtitle: "AI ara\xE7lar\u0131n\u0131 kullanmak i\xE7in mevcut bakiye",
    current_balance: "Mevcut bakiye:",
    credits: "kredi",
    empty: "Bo\u015F",
    low_balance: "D\xFC\u015F\xFCk bakiye",
    good_balance: "\u0130yi bakiye",
    user_type: "Kullan\u0131c\u0131 t\xFCr\xFC:",
    tool_costs: "Ara\xE7 maliyetleri:",
    image_generation: "G\xF6r\xFCnt\xFC \xFCretimi: 2-6 kredi",
    video_generation: "Video \xFCretimi: 7.5-90 kredi",
    script_generation: "Senaryo \xFCretimi: 1-2 kredi",
    prompt_enhancement: "Prompt geli\u015Ftirme: 1-2 kredi",
    loading: "Bakiye y\xFCkleniyor...",
    error: "Bakiye y\xFCklenirken hata"
  },
  direct_payment: {
    generate_image: "{model} ile G\xF6r\xFCnt\xFC \xDCret",
    generate_video: "{model} ile Video \xDCret",
    image_description: "AI ile etkileyici g\xF6rseller olu\u015Fturun",
    video_description: "AI ile harika videolar olu\u015Fturun",
    your_prompt: "Sizin prompt'unuz",
    image_generation: "G\xF6r\xFCnt\xFC \xDCretimi",
    video_generation: "Video \xDCretimi",
    one_time_payment: "Tek seferlik \xF6deme",
    processing_payment: "\xD6deme i\u015Fleniyor..."
  },
  stripe_payment: {
    loading_payment_options: "\xD6deme se\xE7enekleri y\xFCkleniyor...",
    failed_load_payment: "\xD6deme se\xE7enekleri y\xFCklenemedi",
    top_up_balance: "Bakiyeyi Yenile",
    generate_veo3_videos: "VEO3 Videolar\u0131 \xDCret",
    generate_ai_images: "AI G\xF6r\xFCnt\xFCleri \xDCret",
    top_up_balance_desc: "AI ara\xE7lar\u0131n\u0131 kullanmak i\xE7in bakiyenizi {amount} kredi ile yenileyin",
    generate_video_desc: "Prompt'unuz haz\u0131r! Google VEO3 ile profesyonel AI videolar\u0131 olu\u015Fturmak i\xE7in bir plan se\xE7in.",
    generate_image_desc: "Prompt'unuz haz\u0131r! Profesyonel AI g\xF6r\xFCnt\xFCleri olu\u015Fturmak i\xE7in bir plan se\xE7in.",
    top_up_credits: "{amount} kredi yenile",
    generate_video: "Video \xDCret",
    generate_image: "G\xF6r\xFCnt\xFC \xDCret",
    get_credits_desc: "G\xF6r\xFCnt\xFC, video ve senaryo \xFCretimi i\xE7in {amount} kredi al\u0131n",
    generate_video_desc_short: "\xD6zel prompt'unuzla 1 y\xFCksek kaliteli AI video olu\u015Fturun",
    generate_image_desc_short: "\xD6zel prompt'unuzla 1 y\xFCksek kaliteli AI g\xF6r\xFCnt\xFC olu\u015Fturun",
    creating_payment: "\xD6deme Olu\u015Fturuluyor...",
    top_up_for: "${price} i\xE7in yenile",
    generate_for: "${price} i\xE7in Video \xDCret",
    generate_image_for: "${price} i\xE7in G\xF6r\xFCnt\xFC \xDCret",
    instant_access: "\u2713 An\u0131nda eri\u015Fim \u2022 \u2713 Abonelik yok \u2022 \u2713 G\xFCvenli Stripe \xF6deme",
    test_mode: "\u{1F9EA} Test modu - Test kart\u0131 4242 4242 4242 4242 kullan\u0131n",
    generate_prompt_first: "L\xFCtfen \xF6nce bir prompt olu\u015Fturun",
    prices_not_loaded: "Fiyatlar hen\xFCz y\xFCklenmedi, l\xFCtfen tekrar deneyin",
    failed_create_checkout: "\xD6deme oturumu olu\u015Fturulamad\u0131"
  }
};

// src/translation/dictionaries/super-landing/es.ts
var es = {
  blog: {
    page_title: "Blog"
  },
  site: {
    name: "SuperDuperAI"
  },
  footer: {
    pages: {
      about: "Acerca de",
      pricing: "Precios",
      terms: "T\xE9rminos y Condiciones",
      privacy: "Privacidad",
      blog: "Blog",
      demo: "Reservar Demo"
    },
    company: "SuperDuperAI",
    corp: "SuperDuperAi, Corp.",
    address1: "57 Saulsbury Rd, Unit E #1333",
    address2: "Dover, DE 19904",
    phone: "+1 818 619 0966",
    email: "info@superduperai.co",
    copyright: "\xA9 {year} SuperDuperAi Corp. Todos los derechos reservados.",
    social: {
      instagram: "Sigue a SuperDuperAI en Instagram",
      youtube: "Suscr\xEDbete a SuperDuperAI en YouTube",
      telegram: "\xDAnete a SuperDuperAI en Telegram",
      tiktok: "Sigue a SuperDuperAI en TikTok",
      discord: "\xDAnete al servidor Discord de SuperDuperAI",
      linkedin: "Conecta con SuperDuperAI en LinkedIn"
    }
  },
  marketing: {
    pages: "P\xE1ginas",
    tools: "Herramientas AI",
    cases: "Casos de Uso",
    ai_tool_title: "Herramienta AI de SuperDuperAI",
    ai_case_title: "Estudio de Caso de SuperDuperAI",
    view_all_tools: "Ver Todas las Herramientas \u2192",
    view_all_cases: "Ver Todos los Casos de Uso \u2192"
  },
  hero: {
    title: "Convierte Vibes en Videos Instant\xE1neamente",
    description: "Plataforma AI revolucionaria para crear videos profesionales sin habilidades, equipamiento o presupuesto. 10x m\xE1s r\xE1pido y barato.",
    cta: "Comenzar a Crear Gratis"
  },
  features: {
    section_title: "Qu\xE9 Hace que SuperDuperAI sea S\xFAper",
    section_description: "Caracter\xEDsticas y tecnolog\xEDas avanzadas para crear videos impresionantes",
    list: [
      {
        icon: "users",
        title: "Personajes Personalizados con Memoria AI",
        description: "Tu base de datos de actores AI usando tecnolog\xEDa LoRA. Crea y guarda personajes \xFAnicos para tus videos."
      },
      {
        icon: "image",
        title: "Controles de C\xE1mara Cinematogr\xE1ficos",
        description: "Panes, zooms, bullet-time \u2014 sin c\xE1maras f\xEDsicas. A\xF1ade movimientos profesionales de c\xE1mara con un clic."
      },
      {
        icon: "settings",
        title: "Flujo de Trabajo AI Multi-Agente",
        description: "Un modelo donde cada agente hace su trabajo. AI especializado para gui\xF3n, filmaci\xF3n, edici\xF3n y sonido."
      },
      {
        icon: "speed",
        title: "R\xE1pido y Eficiente",
        description: "Idea \u2192 video en minutos, no horas o d\xEDas. Acelera tu flujo de trabajo y crea m\xE1s contenido."
      },
      {
        icon: "chart",
        title: "Ahorro de Costos",
        description: "Cinematograf\xEDa con presupuesto. Obt\xE9n video profesional sin gastar en equipo y equipamiento."
      },
      {
        icon: "edit",
        title: "Edici\xF3n e Integraci\xF3n F\xE1cil",
        description: "Storyboard, arrastrar y soltar, exportar a TikTok/YouTube. Interfaz intuitiva para finalizar r\xE1pidamente tu video."
      }
    ]
  },
  howItWorks: {
    section_title: "C\xF3mo Funciona",
    section_description: "Dirige tu video en 3 pasos f\xE1ciles \u2013 los agentes AI se encargan del resto.",
    steps: [
      {
        title: "Define tu Visi\xF3n",
        description: "Describe tu idea, vibe o trama \u2014 solo unas pocas frases son suficientes"
      },
      {
        title: "AI Genera la Escena",
        description: "Sistema multi-agente crea gui\xF3n, frames y personajes"
      },
      {
        title: "Refina y Finaliza",
        description: "Ajusta el estilo, exporta tu video y comp\xE1rtelo con el mundo"
      }
    ]
  },
  useCases: {
    section_title: "Hecho para Creadores, Negocios, M\xFAsicos y Equipos",
    section_description: "Encuentra el caso de uso perfecto de SuperDuperAI para tus necesidades.",
    categories: {
      "ai-video": "Creadores de Contenido",
      business: "Peque\xF1os Negocios",
      creative: "M\xFAsicos y Artistas",
      teams: "Agencias y Equipos",
      social: "Redes Sociales"
    }
  },
  cta: {
    title: "\xBFListo para crear tu pr\xF3xima sensaci\xF3n de video?",
    description: "\xDAnete a SuperDuperAI y comienza a crear videos incre\xEDbles ahora mismo.",
    button: "Comenzar a Crear Gratis",
    note: "Sin tarjeta de cr\xE9dito requerida"
  },
  navbar: {
    home: "Inicio",
    about: "Acerca de",
    pricing: "Precios",
    terms: "T\xE9rminos",
    privacy: "Privacidad",
    blog: "Blog",
    tools: "Herramientas",
    start: "Comenzar Gratis",
    menu: "Men\xFA",
    close_menu: "Cerrar men\xFA",
    open_menu: "Abrir men\xFA"
  },
  ui: {
    faq: "FAQ",
    approved_by: "Aprobado por",
    look: "\xA1Mira!",
    show_more: "Mostrar m\xE1s",
    collapse: "Colapsar",
    no_results: "Sin resultados",
    loading: "Cargando...",
    success: "\xA1\xC9xito!",
    error: "Error",
    try_again: "Intentar de nuevo",
    empty: "Vac\xEDo",
    nothing_found: "Nada encontrado",
    get_started: "Comenzar"
  },
  pricing: {
    banner_title: "\xA1Prueba SuperDuperAI con 100 Cr\xE9ditos Gratis!",
    banner_desc: "Los nuevos usuarios obtienen 100 cr\xE9ditos completamente gratis - suficientes para crear m\xFAltiples proyectos y explorar casi todas nuestras caracter\xEDsticas. Prueba el poder de la creatividad AI sin compromisos.",
    banner_cta: "Comenzar a Crear Ahora",
    without_package: "Sin Paquete",
    with_power_package: "Con Paquete Power",
    base_name: "BASE - 100 cr\xE9ditos",
    pro_name: "PRO - 1000 cr\xE9ditos",
    base_projects: "5-10 proyectos",
    pro_projects: "20-50 proyectos",
    save_50: "ahorrar 50%",
    free_features: [
      "100 cr\xE9ditos gratis por mes",
      "Acceso solo a herramientas b\xE1sicas de edici\xF3n",
      "Opciones limitadas de animaci\xF3n y doblaje",
      "Videos con marcas de agua"
    ],
    base_features: [
      "Acceso completo a todas las herramientas de edici\xF3n",
      "Creaci\xF3n ilimitada",
      "Descarga videos terminados sin marcas de agua",
      "Gerente personal para ayudarte con tus proyectos",
      "Sesiones de entrenamiento exclusivas para mejorar tus habilidades"
    ],
    pro_features: [
      "Acceso completo a todas las herramientas de edici\xF3n",
      "Creaci\xF3n ilimitada",
      "Descarga videos terminados sin marcas de agua",
      "Gerente personal para ayudarte con tus proyectos",
      "Sesiones de entrenamiento exclusivas para mejorar tus habilidades"
    ],
    start: "Comenzar a Crear",
    buy: "Comprar"
  },
  creative: {
    title: "Programa de Asociaci\xF3n Creativa SuperDuperAI",
    desc: "\xA1Buscamos creadores de contenido y artistas apasionados! \xDAnete a nuestro programa y recibe 1000+ cr\xE9ditos gratis, apoyo 1-a-1 y acceso temprano a nuevas caracter\xEDsticas. Perfecto para creadores con proyectos socialmente significativos e ideas innovadoras.",
    learn_more: "Saber M\xE1s",
    or: "o",
    apply_email: "Aplicar por Email"
  },
  privacy_policy: "Pol\xEDtica de privacidad",
  veo3PromptGenerator: {
    infoBanner: {
      title: "Domina la Generaci\xF3n de Video VEO3",
      description: "Aprende t\xE9cnicas profesionales de prompting y mejores pr\xE1cticas para el modelo de video AI m\xE1s avanzado de Google."
    },
    tabs: {
      builder: "Constructor de Prompts",
      enhance: "Mejora AI",
      history: "Historial"
    },
    promptBuilder: {
      scene: "Escena",
      scenePlaceholder: "Describe el entorno, ambiente o ubicaci\xF3n...",
      style: "Estilo",
      stylePlaceholder: "Art\xEDstico, fotorrealista, cinematogr\xE1fico, etc...",
      camera: "C\xE1mara",
      cameraPlaceholder: "Movimiento de c\xE1mara, \xE1ngulo, tipo de toma...",
      characters: "Personajes",
      addCharacter: "A\xF1adir Personaje",
      characterName: "Nombre",
      characterDescription: "Descripci\xF3n",
      characterSpeech: "Habla/Di\xE1logo",
      removeCharacter: "Eliminar",
      action: "Acci\xF3n",
      actionPlaceholder: "\xBFQu\xE9 est\xE1 pasando en la escena...",
      lighting: "Iluminaci\xF3n",
      lightingPlaceholder: "Natural, dram\xE1tica, suave, etc...",
      mood: "Estado de \xC1nimo",
      moodPlaceholder: "Atm\xF3sfera emocional, tono...",
      language: "Idioma",
      moodboard: "Moodboard",
      moodboardEnabled: "Habilitar moodboard",
      moodboardDescription: "Sube im\xE1genes de referencia para guiar la generaci\xF3n"
    },
    promptPreview: {
      title: "Prompt Generado",
      copyButton: "Copiar",
      copied: "\xA1Copiado!",
      randomizeButton: "Aleatorizar",
      clearButton: "Limpiar Todo",
      enhanceButton: "Mejorar con AI"
    },
    aiEnhancement: {
      title: "Mejora AI",
      description: "Mejora tu prompt con t\xE9cnicas AI avanzadas",
      focusTypes: {
        character: "Enfoque en Personaje",
        action: "Enfoque en Acci\xF3n",
        cinematic: "Enfoque Cinematogr\xE1fico",
        safe: "Contenido Seguro"
      },
      settings: {
        title: "Configuraci\xF3n de Mejora",
        characterLimit: "L\xEDmite de Caracteres",
        includeAudio: "Incluir Descripci\xF3n de Audio",
        model: "Modelo AI"
      },
      enhanceButton: "Mejorar Prompt",
      enhancing: "Mejorando...",
      enhanceError: "La mejora fall\xF3",
      enhancementInfo: {
        model: "Modelo",
        length: "Longitud",
        actualCharacters: "Caracteres Reales",
        targetCharacters: "Caracteres Objetivo"
      }
    },
    promptHistory: {
      title: "Historial de Prompts",
      empty: "A\xFAn no hay prompts en el historial",
      loadButton: "Cargar",
      clearButton: "Limpiar Historial",
      columns: {
        timestamp: "Fecha",
        basicPrompt: "Prompt B\xE1sico",
        enhancedPrompt: "Prompt Mejorado",
        length: "Longitud",
        model: "Modelo"
      }
    },
    common: {
      loading: "Cargando...",
      error: "Error",
      success: "\xC9xito",
      cancel: "Cancelar",
      save: "Guardar",
      delete: "Eliminar",
      edit: "Editar",
      close: "Cerrar"
    }
  },
  video_generator: {
    title: "Generaci\xF3n de Video",
    description: "Describe el video que quieres crear",
    placeholder: "Por ejemplo: Hermoso atardecer sobre el oc\xE9ano con olas, filmado desde vista de p\xE1jaro, calidad cinematogr\xE1fica, movimientos suaves de c\xE1mara...",
    duration: "Duraci\xF3n",
    aspect_ratio: "Relaci\xF3n de aspecto",
    resolution: "Resoluci\xF3n",
    video_count: "Cantidad de videos",
    generate: "Crear video",
    generating: "Generando...",
    status: "Estado de generaci\xF3n",
    error: "Por favor ingresa una descripci\xF3n del video",
    generation_error: "Error al crear generaci\xF3n",
    status_error: "Error al verificar estado",
    download: "Descargar",
    reset: "Reiniciar",
    seconds: "s",
    with: "con",
    progress: "Progreso",
    completed: "Completado",
    error_status: "Error",
    processing: "Procesando",
    pending: "Pendiente",
    ready: "Listo",
    results: "Resultados",
    video: "Video",
    watch: "Ver",
    create_new: "Crear nuevo video",
    generation_type: "Tipo de Generaci\xF3n:",
    upload_image: "Subir Imagen:",
    image_uploaded: "\u2713 Imagen subida",
    click_to_select: "Haz clic para seleccionar imagen o arrastra y suelta archivo",
    select_file: "Seleccionar Archivo",
    describe_animation: "Describe c\xF3mo animar la imagen:",
    animation_placeholder: "Por ejemplo: balancear lentamente, rotar suavemente, agregar movimiento de nubes...",
    upload_image_required: "Por favor sube una imagen para generaci\xF3n de imagen a video",
    insufficient_balance: "Cr\xE9ditos insuficientes. Requerido: {required} cr\xE9ditos. Por favor recarga tu saldo.",
    insufficient_balance_fallback: "Cr\xE9ditos insuficientes para generaci\xF3n de video. Por favor recarga tu saldo.",
    generate_for: "Generar por {price}",
    payment_error: "Pago fallido. Por favor intenta de nuevo.",
    payment_description: "Paga $1.00 para generar videos con este modelo",
    back_to: "Volver a {model}",
    generate_video_with: "Generar Video con {model}",
    create_amazing_videos: "Crea incre\xEDbles videos generados por AI por solo $1.00",
    video_description: "Descripci\xF3n del Video",
    describe_video_detail: "Describe el video que quieres crear en detalle",
    your_prompt: "Tu prompt",
    generate_for_price: "Generar por $1.00",
    model_information: "Informaci\xF3n del Modelo",
    what_you_get: "Lo que Obtienes",
    high_quality_video: "Video de alta calidad generado por AI",
    commercial_rights: "Derechos completos de uso comercial",
    instant_download: "Descarga instant\xE1nea despu\xE9s de la generaci\xF3n",
    no_subscription: "No se requiere suscripci\xF3n",
    payment_successful: "\xA1Pago exitoso! La generaci\xF3n de video comenzar\xE1 pronto.",
    advanced_ai_model: "Modelo avanzado de generaci\xF3n de video AI",
    supports_both_modes: "\u2728 Este modelo soporta tanto generaci\xF3n text-to-video como image-to-video",
    image_to_video: "Imagen a Video",
    upload_source_image: "Subir Imagen Fuente (Opcional)",
    upload_image_description: "Sube una imagen para generaci\xF3n de imagen a video, o d\xE9jala vac\xEDa para text-to-video",
    click_to_upload: "Haz clic para subir",
    or_drag_and_drop: "o arrastra y suelta",
    file_formats: "PNG, JPG, GIF hasta 10MB",
    pay_to_generate_video: "Paga $1.00 para Generar Video",
    generate_for_dollar: "Generar por $1.00"
  },
  image_generator: {
    title: "Generaci\xF3n de Im\xE1genes",
    description: "Describe la imagen que quieres crear",
    placeholder: "Por ejemplo: Paisaje urbano moderno, rascacielos, luces del atardecer, alta calidad, estilo realista...",
    width: "Ancho",
    height: "Alto",
    aspect_ratio: "Relaci\xF3n de aspecto",
    style: "Estilo",
    shot_size: "Tama\xF1o de toma",
    image_count: "Cantidad de im\xE1genes",
    generate: "Crear imagen",
    generating: "Generando...",
    status: "Estado de generaci\xF3n",
    error: "Por favor ingresa una descripci\xF3n de la imagen",
    generation_error: "Error al crear generaci\xF3n",
    status_error: "Error al verificar estado",
    download: "Descargar",
    reset: "Reiniciar",
    starting: "Iniciando generaci\xF3n...",
    tracking: "Generaci\xF3n iniciada, rastreando progreso...",
    processing: "Procesando...",
    completed: "Completado",
    error_status: "Error",
    progress: "Progreso",
    pending: "Pendiente",
    ready: "Listo",
    results: "Resultados",
    image: "Imagen",
    watch: "Ver",
    create_new: "Crear nueva imagen",
    image_description: "Descripci\xF3n de la imagen",
    image_placeholder: "Describe la imagen que quieres crear...",
    generation_complete: "\xA1Generaci\xF3n completa!",
    generation_error_msg: "Error durante la generaci\xF3n",
    status_check_error: "Error al verificar estado de generaci\xF3n",
    created_images: "Im\xE1genes creadas:",
    generated_image: "Imagen generada",
    insufficient_balance: "Cr\xE9ditos insuficientes. Requerido: {required} cr\xE9ditos. Por favor recarga tu saldo.",
    insufficient_balance_fallback: "Cr\xE9ditos insuficientes para generaci\xF3n de im\xE1genes. Por favor recarga tu saldo.",
    generate_for: "Generar por {price}",
    payment_error: "Pago fallido. Por favor intenta de nuevo.",
    payment_description: "Paga $1.00 para generar im\xE1genes con este modelo"
  },
  model_descriptions: {
    veo2: "Veo2 - transformando im\xE1genes est\xE1ticas en videos HD din\xE1micos preservando el estilo original",
    sora: "Sora - modelo experimental de OpenAI para generar videos horizontales cortos",
    veo3: "Veo3 - \xFAltimo modelo de Google para generaci\xF3n de text-to-video",
    google_imagen_4: "Google Imagen 4 - modelo AI avanzado para crear im\xE1genes de alta calidad",
    gpt_image_1: "GPT-Image-1 - modelo de generaci\xF3n de im\xE1genes de OpenAI",
    flux_kontext: "Flux Kontext - modelo avanzado para generaci\xF3n creativa de im\xE1genes"
  },
  credit_balance: {
    title: "Saldo de Cr\xE9ditos",
    subtitle: "Saldo actual para usar herramientas AI",
    current_balance: "Saldo actual:",
    credits: "cr\xE9ditos",
    empty: "Vac\xEDo",
    low_balance: "Saldo bajo",
    good_balance: "Buen saldo",
    user_type: "Tipo de usuario:",
    tool_costs: "Costos de herramientas:",
    image_generation: "Generaci\xF3n de im\xE1genes: 2-6 cr\xE9ditos",
    video_generation: "Generaci\xF3n de video: 7.5-90 cr\xE9ditos",
    script_generation: "Generaci\xF3n de guiones: 1-2 cr\xE9ditos",
    prompt_enhancement: "Mejora de prompts: 1-2 cr\xE9ditos",
    loading: "Cargando saldo...",
    error: "Error al cargar saldo"
  },
  direct_payment: {
    generate_image: "Generar Imagen con {model}",
    generate_video: "Generar Video con {model}",
    image_description: "Crea im\xE1genes impresionantes con AI",
    video_description: "Crea videos incre\xEDbles con AI",
    your_prompt: "Tu prompt",
    image_generation: "Generaci\xF3n de Im\xE1genes",
    video_generation: "Generaci\xF3n de Video",
    one_time_payment: "Pago \xFAnico",
    processing_payment: "Procesando pago..."
  },
  stripe_payment: {
    loading_payment_options: "Cargando opciones de pago...",
    failed_load_payment: "Error al cargar opciones de pago",
    top_up_balance: "Recargar Saldo",
    generate_veo3_videos: "Generar Videos VEO3",
    generate_ai_images: "Generar Im\xE1genes AI",
    top_up_balance_desc: "Recarga tu saldo con {amount} cr\xE9ditos para usar herramientas AI",
    generate_video_desc: "\xA1Tu prompt est\xE1 listo! Elige un plan para generar videos AI profesionales con Google VEO3.",
    generate_image_desc: "\xA1Tu prompt est\xE1 listo! Elige un plan para generar im\xE1genes AI profesionales.",
    top_up_credits: "Recargar {amount} cr\xE9ditos",
    generate_video: "Generar Video",
    generate_image: "Generar Imagen",
    get_credits_desc: "Obt\xE9n {amount} cr\xE9ditos para generar im\xE1genes, videos y guiones",
    generate_video_desc_short: "Genera 1 video AI de alta calidad con tu prompt personalizado",
    generate_image_desc_short: "Genera 1 imagen AI de alta calidad con tu prompt personalizado",
    creating_payment: "Creando Pago...",
    top_up_for: "Recargar por ${price}",
    generate_for: "Generar Video por ${price}",
    generate_image_for: "Generar Imagen por ${price}",
    instant_access: "\u2713 Acceso instant\xE1neo \u2022 \u2713 Sin suscripci\xF3n \u2022 \u2713 Pago seguro Stripe",
    test_mode: "\u{1F9EA} Modo de prueba - Usa tarjeta de prueba 4242 4242 4242 4242",
    generate_prompt_first: "Por favor genera un prompt primero",
    prices_not_loaded: "Precios a\xFAn no cargados, por favor intenta de nuevo",
    failed_create_checkout: "Error al crear sesi\xF3n de pago"
  }
};

// src/translation/dictionaries/super-landing/hi.ts
var hi = {
  blog: {
    page_title: "\u092C\u094D\u0932\u0949\u0917"
  },
  site: {
    name: "SuperDuperAI"
  },
  footer: {
    pages: {
      about: "\u0939\u092E\u093E\u0930\u0947 \u092C\u093E\u0930\u0947 \u092E\u0947\u0902",
      pricing: "\u092E\u0942\u0932\u094D\u092F",
      terms: "\u0928\u093F\u092F\u092E \u0914\u0930 \u0936\u0930\u094D\u0924\u0947\u0902",
      privacy: "\u0917\u094B\u092A\u0928\u0940\u092F\u0924\u093E",
      blog: "\u092C\u094D\u0932\u0949\u0917",
      demo: "\u0921\u0947\u092E\u094B \u092C\u0941\u0915 \u0915\u0930\u0947\u0902"
    },
    company: "SuperDuperAI",
    corp: "SuperDuperAi, Corp.",
    address1: "57 Saulsbury Rd, Unit E #1333",
    address2: "Dover, DE 19904",
    phone: "+1 818 619 0966",
    email: "info@superduperai.co",
    copyright: "\xA9 {year} SuperDuperAi Corp. \u0938\u0930\u094D\u0935\u093E\u0927\u093F\u0915\u093E\u0930 \u0938\u0941\u0930\u0915\u094D\u0937\u093F\u0924\u0964",
    social: {
      instagram: "Instagram \u092A\u0930 SuperDuperAI \u0915\u094B \u092B\u0949\u0932\u094B \u0915\u0930\u0947\u0902",
      youtube: "YouTube \u092A\u0930 SuperDuperAI \u0915\u094B \u0938\u092C\u094D\u0938\u0915\u094D\u0930\u093E\u0907\u092C \u0915\u0930\u0947\u0902",
      telegram: "Telegram \u092A\u0930 SuperDuperAI \u0938\u0947 \u091C\u0941\u0921\u093C\u0947\u0902",
      tiktok: "TikTok \u092A\u0930 SuperDuperAI \u0915\u094B \u092B\u0949\u0932\u094B \u0915\u0930\u0947\u0902",
      discord: "SuperDuperAI Discord \u0938\u0930\u094D\u0935\u0930 \u092E\u0947\u0902 \u0936\u093E\u092E\u093F\u0932 \u0939\u094B\u0902",
      linkedin: "LinkedIn \u092A\u0930 SuperDuperAI \u0938\u0947 \u0915\u0928\u0947\u0915\u094D\u091F \u0915\u0930\u0947\u0902"
    }
  },
  marketing: {
    pages: "\u092A\u0947\u091C",
    tools: "AI \u091F\u0942\u0932\u094D\u0938",
    cases: "\u0909\u092A\u092F\u094B\u0917 \u0915\u0947 \u092E\u093E\u092E\u0932\u0947",
    ai_tool_title: "SuperDuperAI \u0938\u0947 AI \u091F\u0942\u0932",
    ai_case_title: "SuperDuperAI \u0938\u0947 \u0915\u0947\u0938 \u0938\u094D\u091F\u0921\u0940",
    view_all_tools: "\u0938\u092D\u0940 \u091F\u0942\u0932 \u0926\u0947\u0916\u0947\u0902 \u2192",
    view_all_cases: "\u0938\u092D\u0940 \u0909\u092A\u092F\u094B\u0917 \u0915\u0947 \u092E\u093E\u092E\u0932\u0947 \u0926\u0947\u0916\u0947\u0902 \u2192"
  },
  hero: {
    title: "\u0924\u0941\u0930\u0902\u0924 \u0935\u093E\u0907\u092C\u094D\u0938 \u0915\u094B \u0935\u0940\u0921\u093F\u092F\u094B \u092E\u0947\u0902 \u092C\u0926\u0932\u0947\u0902",
    description: "\u0915\u094C\u0936\u0932, \u0909\u092A\u0915\u0930\u0923 \u092F\u093E \u092C\u091C\u091F \u0915\u0947 \u092C\u093F\u0928\u093E \u092A\u0947\u0936\u0947\u0935\u0930 \u0935\u0940\u0921\u093F\u092F\u094B \u092C\u0928\u093E\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0915\u094D\u0930\u093E\u0902\u0924\u093F\u0915\u093E\u0930\u0940 AI \u092A\u094D\u0932\u0947\u091F\u092B\u0949\u0930\u094D\u092E\u0964 10x \u0924\u0947\u091C \u0914\u0930 \u0938\u0938\u094D\u0924\u093E\u0964",
    cta: "\u092E\u0941\u092B\u094D\u0924 \u092E\u0947\u0902 \u092C\u0928\u093E\u0928\u093E \u0936\u0941\u0930\u0942 \u0915\u0930\u0947\u0902"
  },
  features: {
    section_title: "\u0915\u094D\u092F\u093E SuperDuperAI \u0915\u094B \u0938\u0941\u092A\u0930 \u092C\u0928\u093E\u0924\u093E \u0939\u0948",
    section_description: "\u0906\u0915\u0930\u094D\u0937\u0915 \u0935\u0940\u0921\u093F\u092F\u094B \u092C\u0928\u093E\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0909\u0928\u094D\u0928\u0924 \u0938\u0941\u0935\u093F\u0927\u093E\u090F\u0902 \u0914\u0930 \u0924\u0915\u0928\u0940\u0915\u0947\u0902",
    list: [
      {
        icon: "users",
        title: "AI \u092E\u0947\u092E\u094B\u0930\u0940 \u0915\u0947 \u0938\u093E\u0925 \u0915\u0938\u094D\u091F\u092E \u0915\u0948\u0930\u0947\u0915\u094D\u091F\u0930",
        description: "LoRA \u0924\u0915\u0928\u0940\u0915 \u0915\u093E \u0909\u092A\u092F\u094B\u0917 \u0915\u0930\u0928\u0947 \u0935\u093E\u0932\u093E \u0906\u092A\u0915\u093E AI \u090F\u0915\u094D\u091F\u0930 \u0921\u0947\u091F\u093E\u092C\u0947\u0938\u0964 \u0905\u092A\u0928\u0947 \u0935\u0940\u0921\u093F\u092F\u094B \u0915\u0947 \u0932\u093F\u090F \u0905\u0928\u0942\u0920\u0947 \u0915\u0948\u0930\u0947\u0915\u094D\u091F\u0930 \u092C\u0928\u093E\u090F\u0902 \u0914\u0930 \u0938\u0947\u0935 \u0915\u0930\u0947\u0902\u0964"
      },
      {
        icon: "image",
        title: "\u0938\u093F\u0928\u0947\u092E\u0948\u091F\u093F\u0915 \u0915\u0948\u092E\u0930\u093E \u0915\u0902\u091F\u094D\u0930\u094B\u0932",
        description: "\u092A\u0948\u0928, \u091C\u093C\u0942\u092E, \u092C\u0941\u0932\u0947\u091F-\u091F\u093E\u0907\u092E \u2014 \u092D\u094C\u0924\u093F\u0915 \u0915\u0948\u092E\u0930\u0947 \u0915\u0947 \u092C\u093F\u0928\u093E\u0964 \u090F\u0915 \u0915\u094D\u0932\u093F\u0915 \u0938\u0947 \u092A\u0947\u0936\u0947\u0935\u0930 \u0915\u0948\u092E\u0930\u093E \u092E\u0942\u0935\u092E\u0947\u0902\u091F \u091C\u094B\u0921\u093C\u0947\u0902\u0964"
      },
      {
        icon: "settings",
        title: "\u092E\u0932\u094D\u091F\u0940-\u090F\u091C\u0947\u0902\u091F AI \u0935\u0930\u094D\u0915\u092B\u094D\u0932\u094B",
        description: "\u090F\u0915 \u092E\u0949\u0921\u0932 \u091C\u0939\u093E\u0902 \u0939\u0930 \u090F\u091C\u0947\u0902\u091F \u0905\u092A\u0928\u093E \u0915\u093E\u092E \u0915\u0930\u0924\u093E \u0939\u0948\u0964 \u0938\u094D\u0915\u094D\u0930\u093F\u092A\u094D\u091F\u093F\u0902\u0917, \u092B\u093F\u0932\u094D\u092E\u093F\u0902\u0917, \u090F\u0921\u093F\u091F\u093F\u0902\u0917 \u0914\u0930 \u0938\u093E\u0909\u0902\u0921 \u0915\u0947 \u0932\u093F\u090F \u0935\u093F\u0936\u0947\u0937 AI\u0964"
      },
      {
        icon: "speed",
        title: "\u0924\u0947\u091C \u0914\u0930 \u0915\u0941\u0936\u0932",
        description: "\u0906\u0907\u0921\u093F\u092F\u093E \u2192 \u0935\u0940\u0921\u093F\u092F\u094B \u092E\u093F\u0928\u091F\u094B\u0902 \u092E\u0947\u0902, \u0918\u0902\u091F\u094B\u0902 \u092F\u093E \u0926\u093F\u0928\u094B\u0902 \u092E\u0947\u0902 \u0928\u0939\u0940\u0902\u0964 \u0905\u092A\u0928\u093E \u0935\u0930\u094D\u0915\u092B\u094D\u0932\u094B \u0924\u0947\u091C \u0915\u0930\u0947\u0902 \u0914\u0930 \u0905\u0927\u093F\u0915 \u0915\u0902\u091F\u0947\u0902\u091F \u092C\u0928\u093E\u090F\u0902\u0964"
      },
      {
        icon: "chart",
        title: "\u0932\u093E\u0917\u0924 \u092C\u091A\u0924",
        description: "\u092C\u091C\u091F \u092A\u0930 \u0938\u093F\u0928\u0947\u092E\u0948\u091F\u094B\u0917\u094D\u0930\u093E\u092B\u0940\u0964 \u0915\u094D\u0930\u0942 \u0914\u0930 \u0909\u092A\u0915\u0930\u0923 \u092A\u0930 \u0916\u0930\u094D\u091A \u0915\u093F\u090F \u092C\u093F\u0928\u093E \u092A\u0947\u0936\u0947\u0935\u0930 \u0935\u0940\u0921\u093F\u092F\u094B \u092A\u094D\u0930\u093E\u092A\u094D\u0924 \u0915\u0930\u0947\u0902\u0964"
      },
      {
        icon: "edit",
        title: "\u0906\u0938\u093E\u0928 \u090F\u0921\u093F\u091F\u093F\u0902\u0917 \u0914\u0930 \u0907\u0902\u091F\u0940\u0917\u094D\u0930\u0947\u0936\u0928",
        description: "\u0938\u094D\u091F\u094B\u0930\u0940\u092C\u094B\u0930\u094D\u0921, \u0921\u094D\u0930\u0948\u0917-\u0921\u094D\u0930\u0949\u092A, TikTok/YouTube \u0915\u094B \u090F\u0915\u094D\u0938\u092A\u094B\u0930\u094D\u091F\u0964 \u0905\u092A\u0928\u0947 \u0935\u0940\u0921\u093F\u092F\u094B \u0915\u094B \u091C\u0932\u094D\u0926\u0940 \u0938\u0947 \u092B\u093E\u0907\u0928\u0932\u093E\u0907\u091C\u093C \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0938\u0939\u091C \u0907\u0902\u091F\u0930\u092B\u0947\u0938\u0964"
      }
    ]
  },
  howItWorks: {
    section_title: "\u092F\u0939 \u0915\u0948\u0938\u0947 \u0915\u093E\u092E \u0915\u0930\u0924\u093E \u0939\u0948",
    section_description: "3 \u0906\u0938\u093E\u0928 \u091A\u0930\u0923\u094B\u0902 \u092E\u0947\u0902 \u0905\u092A\u0928\u093E \u0935\u0940\u0921\u093F\u092F\u094B \u0928\u093F\u0930\u094D\u0926\u0947\u0936\u093F\u0924 \u0915\u0930\u0947\u0902 \u2013 AI \u090F\u091C\u0947\u0902\u091F \u092C\u093E\u0915\u0940 \u0915\u093E \u0927\u094D\u092F\u093E\u0928 \u0930\u0916\u0924\u0947 \u0939\u0948\u0902\u0964",
    steps: [
      {
        title: "\u0905\u092A\u0928\u0940 \u0926\u0943\u0937\u094D\u091F\u093F \u0915\u094B \u092A\u0930\u093F\u092D\u093E\u0937\u093F\u0924 \u0915\u0930\u0947\u0902",
        description: "\u0905\u092A\u0928\u0947 \u0906\u0907\u0921\u093F\u092F\u093E, \u0935\u093E\u0907\u092C \u092F\u093E \u092A\u094D\u0932\u0949\u091F \u0915\u093E \u0935\u0930\u094D\u0923\u0928 \u0915\u0930\u0947\u0902 \u2014 \u0915\u0941\u091B \u0935\u093E\u0915\u094D\u092F \u092A\u0930\u094D\u092F\u093E\u092A\u094D\u0924 \u0939\u0948\u0902"
      },
      {
        title: "AI \u0926\u0943\u0936\u094D\u092F \u0909\u0924\u094D\u092A\u0928\u094D\u0928 \u0915\u0930\u0924\u093E \u0939\u0948",
        description: "\u092E\u0932\u094D\u091F\u0940-\u090F\u091C\u0947\u0902\u091F \u0938\u093F\u0938\u094D\u091F\u092E \u0938\u094D\u0915\u094D\u0930\u093F\u092A\u094D\u091F, \u092B\u094D\u0930\u0947\u092E \u0914\u0930 \u0915\u0948\u0930\u0947\u0915\u094D\u091F\u0930 \u092C\u0928\u093E\u0924\u093E \u0939\u0948"
      },
      {
        title: "\u092A\u0930\u093F\u0937\u094D\u0915\u0943\u0924 \u0914\u0930 \u0905\u0902\u0924\u093F\u092E \u0930\u0942\u092A \u0926\u0947\u0902",
        description: "\u0938\u094D\u091F\u093E\u0907\u0932 \u0915\u094B \u0938\u092E\u093E\u092F\u094B\u091C\u093F\u0924 \u0915\u0930\u0947\u0902, \u0905\u092A\u0928\u093E \u0935\u0940\u0921\u093F\u092F\u094B \u090F\u0915\u094D\u0938\u092A\u094B\u0930\u094D\u091F \u0915\u0930\u0947\u0902 \u0914\u0930 \u0926\u0941\u0928\u093F\u092F\u093E \u0915\u0947 \u0938\u093E\u0925 \u0938\u093E\u091D\u093E \u0915\u0930\u0947\u0902"
      }
    ]
  },
  useCases: {
    section_title: "\u0915\u094D\u0930\u093F\u090F\u091F\u0930\u094D\u0938, \u0935\u094D\u092F\u0935\u0938\u093E\u092F\u094B\u0902, \u0938\u0902\u0917\u0940\u0924\u0915\u093E\u0930\u094B\u0902 \u0914\u0930 \u091F\u0940\u092E\u094B\u0902 \u0915\u0947 \u0932\u093F\u090F \u092C\u0928\u093E\u092F\u093E \u0917\u092F\u093E",
    section_description: "\u0905\u092A\u0928\u0940 \u0906\u0935\u0936\u094D\u092F\u0915\u0924\u093E\u0913\u0902 \u0915\u094B \u092A\u0942\u0930\u093E \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F SuperDuperAI \u0915\u093E \u0938\u0939\u0940 \u0909\u092A\u092F\u094B\u0917 \u0915\u0947\u0938 \u0916\u094B\u091C\u0947\u0902\u0964",
    categories: {
      "ai-video": "\u0915\u0902\u091F\u0947\u0902\u091F \u0915\u094D\u0930\u093F\u090F\u091F\u0930\u094D\u0938",
      business: "\u091B\u094B\u091F\u0947 \u0935\u094D\u092F\u0935\u0938\u093E\u092F",
      creative: "\u0938\u0902\u0917\u0940\u0924\u0915\u093E\u0930 \u0914\u0930 \u0915\u0932\u093E\u0915\u093E\u0930",
      teams: "\u090F\u091C\u0947\u0902\u0938\u093F\u092F\u093E\u0902 \u0914\u0930 \u091F\u0940\u092E\u0947\u0902",
      social: "\u0938\u094B\u0936\u0932 \u092E\u0940\u0921\u093F\u092F\u093E"
    }
  },
  cta: {
    title: "\u0905\u092A\u0928\u093E \u0905\u0917\u0932\u093E \u0935\u0940\u0921\u093F\u092F\u094B \u0938\u0928\u0938\u0928\u0940 \u092C\u0928\u093E\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0924\u0948\u092F\u093E\u0930 \u0939\u0948\u0902?",
    description: "SuperDuperAI \u092E\u0947\u0902 \u0936\u093E\u092E\u093F\u0932 \u0939\u094B\u0902 \u0914\u0930 \u0905\u092D\u0940 \u0905\u0926\u094D\u092D\u0941\u0924 \u0935\u0940\u0921\u093F\u092F\u094B \u092C\u0928\u093E\u0928\u093E \u0936\u0941\u0930\u0942 \u0915\u0930\u0947\u0902\u0964",
    button: "\u092E\u0941\u092B\u094D\u0924 \u092E\u0947\u0902 \u092C\u0928\u093E\u0928\u093E \u0936\u0941\u0930\u0942 \u0915\u0930\u0947\u0902",
    note: "\u0915\u094D\u0930\u0947\u0921\u093F\u091F \u0915\u093E\u0930\u094D\u0921 \u0915\u0940 \u0906\u0935\u0936\u094D\u092F\u0915\u0924\u093E \u0928\u0939\u0940\u0902"
  },
  navbar: {
    home: "\u0939\u094B\u092E",
    about: "\u0939\u092E\u093E\u0930\u0947 \u092C\u093E\u0930\u0947 \u092E\u0947\u0902",
    pricing: "\u092E\u0942\u0932\u094D\u092F",
    terms: "\u0928\u093F\u092F\u092E",
    privacy: "\u0917\u094B\u092A\u0928\u0940\u092F\u0924\u093E",
    blog: "\u092C\u094D\u0932\u0949\u0917",
    tools: "\u091F\u0942\u0932\u094D\u0938",
    start: "\u092E\u0941\u092B\u094D\u0924 \u092E\u0947\u0902 \u0936\u0941\u0930\u0942 \u0915\u0930\u0947\u0902",
    menu: "\u092E\u0947\u0928\u0942",
    close_menu: "\u092E\u0947\u0928\u0942 \u092C\u0902\u0926 \u0915\u0930\u0947\u0902",
    open_menu: "\u092E\u0947\u0928\u0942 \u0916\u094B\u0932\u0947\u0902"
  },
  ui: {
    faq: "FAQ",
    approved_by: "\u0926\u094D\u0935\u093E\u0930\u093E \u0905\u0928\u0941\u092E\u094B\u0926\u093F\u0924",
    look: "\u0926\u0947\u0916\u094B!",
    show_more: "\u0914\u0930 \u0926\u093F\u0916\u093E\u090F\u0902",
    collapse: "\u0938\u0902\u0915\u0941\u091A\u093F\u0924 \u0915\u0930\u0947\u0902",
    no_results: "\u0915\u094B\u0908 \u092A\u0930\u093F\u0923\u093E\u092E \u0928\u0939\u0940\u0902",
    loading: "\u0932\u094B\u0921 \u0939\u094B \u0930\u0939\u093E \u0939\u0948...",
    success: "\u0938\u092B\u0932!",
    error: "\u0924\u094D\u0930\u0941\u091F\u093F",
    try_again: "\u092B\u093F\u0930 \u0938\u0947 \u0915\u094B\u0936\u093F\u0936 \u0915\u0930\u0947\u0902",
    empty: "\u0916\u093E\u0932\u0940",
    nothing_found: "\u0915\u0941\u091B \u0928\u0939\u0940\u0902 \u092E\u093F\u0932\u093E",
    get_started: "\u0936\u0941\u0930\u0942 \u0915\u0930\u0947\u0902"
  },
  pricing: {
    banner_title: "100 \u092E\u0941\u092B\u094D\u0924 \u0915\u094D\u0930\u0947\u0921\u093F\u091F \u0915\u0947 \u0938\u093E\u0925 SuperDuperAI \u0906\u091C\u093C\u092E\u093E\u090F\u0902!",
    banner_desc: "\u0928\u090F \u0909\u092A\u092F\u094B\u0917\u0915\u0930\u094D\u0924\u093E\u0913\u0902 \u0915\u094B \u092A\u0942\u0930\u0940 \u0924\u0930\u0939 \u0938\u0947 \u092E\u0941\u092B\u094D\u0924 100 \u0915\u094D\u0930\u0947\u0921\u093F\u091F \u092E\u093F\u0932\u0924\u0947 \u0939\u0948\u0902 - \u0915\u0908 \u092A\u094D\u0930\u094B\u091C\u0947\u0915\u094D\u091F \u092C\u0928\u093E\u0928\u0947 \u0914\u0930 \u0939\u092E\u093E\u0930\u0940 \u0932\u0917\u092D\u0917 \u0938\u092D\u0940 \u0938\u0941\u0935\u093F\u0927\u093E\u0913\u0902 \u0915\u093E \u092A\u0924\u093E \u0932\u0917\u093E\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u092A\u0930\u094D\u092F\u093E\u092A\u094D\u0924\u0964 \u0915\u093F\u0938\u0940 \u092A\u094D\u0930\u0924\u093F\u092C\u0926\u094D\u0927\u0924\u093E \u0915\u0947 \u092C\u093F\u0928\u093E AI \u0930\u091A\u0928\u093E\u0924\u094D\u092E\u0915\u0924\u093E \u0915\u0940 \u0936\u0915\u094D\u0924\u093F \u0915\u093E \u092A\u0930\u0940\u0915\u094D\u0937\u0923 \u0915\u0930\u0947\u0902\u0964",
    banner_cta: "\u0905\u092D\u0940 \u092C\u0928\u093E\u0928\u093E \u0936\u0941\u0930\u0942 \u0915\u0930\u0947\u0902",
    without_package: "\u092A\u0948\u0915\u0947\u091C \u0915\u0947 \u092C\u093F\u0928\u093E",
    with_power_package: "Power \u092A\u0948\u0915\u0947\u091C \u0915\u0947 \u0938\u093E\u0925",
    base_name: "BASE - 100 \u0915\u094D\u0930\u0947\u0921\u093F\u091F",
    pro_name: "PRO - 1000 \u0915\u094D\u0930\u0947\u0921\u093F\u091F",
    base_projects: "5-10 \u092A\u094D\u0930\u094B\u091C\u0947\u0915\u094D\u091F",
    pro_projects: "20-50 \u092A\u094D\u0930\u094B\u091C\u0947\u0915\u094D\u091F",
    save_50: "50% \u092C\u091A\u093E\u090F\u0902",
    free_features: [
      "\u092A\u094D\u0930\u0924\u093F \u092E\u093E\u0939 100 \u092E\u0941\u092B\u094D\u0924 \u0915\u094D\u0930\u0947\u0921\u093F\u091F",
      "\u0915\u0947\u0935\u0932 \u092C\u0941\u0928\u093F\u092F\u093E\u0926\u0940 \u090F\u0921\u093F\u091F\u093F\u0902\u0917 \u091F\u0942\u0932\u094D\u0938 \u0924\u0915 \u092A\u0939\u0941\u0902\u091A",
      "\u0938\u0940\u092E\u093F\u0924 \u090F\u0928\u0940\u092E\u0947\u0936\u0928 \u0914\u0930 \u0935\u0949\u0907\u0938\u0913\u0935\u0930 \u0935\u093F\u0915\u0932\u094D\u092A",
      "\u0935\u0949\u091F\u0930\u092E\u093E\u0930\u094D\u0915 \u0915\u0947 \u0938\u093E\u0925 \u0935\u0940\u0921\u093F\u092F\u094B"
    ],
    base_features: [
      "\u0938\u092D\u0940 \u090F\u0921\u093F\u091F\u093F\u0902\u0917 \u091F\u0942\u0932\u094D\u0938 \u0924\u0915 \u092A\u0942\u0930\u0940 \u092A\u0939\u0941\u0902\u091A",
      "\u0905\u0938\u0940\u092E\u093F\u0924 \u0930\u091A\u0928\u093E",
      "\u0935\u0949\u091F\u0930\u092E\u093E\u0930\u094D\u0915 \u0915\u0947 \u092C\u093F\u0928\u093E \u0924\u0948\u092F\u093E\u0930 \u0935\u0940\u0921\u093F\u092F\u094B \u0921\u093E\u0909\u0928\u0932\u094B\u0921 \u0915\u0930\u0947\u0902",
      "\u0906\u092A\u0915\u0947 \u092A\u094D\u0930\u094B\u091C\u0947\u0915\u094D\u091F \u092E\u0947\u0902 \u092E\u0926\u0926 \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0935\u094D\u092F\u0915\u094D\u0924\u093F\u0917\u0924 \u092A\u094D\u0930\u092C\u0902\u0927\u0915",
      "\u0906\u092A\u0915\u0947 \u0915\u094C\u0936\u0932 \u0915\u094B \u092C\u0922\u093C\u093E\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0935\u093F\u0936\u0947\u0937 \u092A\u094D\u0930\u0936\u093F\u0915\u094D\u0937\u0923 \u0938\u0924\u094D\u0930"
    ],
    pro_features: [
      "\u0938\u092D\u0940 \u090F\u0921\u093F\u091F\u093F\u0902\u0917 \u091F\u0942\u0932\u094D\u0938 \u0924\u0915 \u092A\u0942\u0930\u0940 \u092A\u0939\u0941\u0902\u091A",
      "\u0905\u0938\u0940\u092E\u093F\u0924 \u0930\u091A\u0928\u093E",
      "\u0935\u0949\u091F\u0930\u092E\u093E\u0930\u094D\u0915 \u0915\u0947 \u092C\u093F\u0928\u093E \u0924\u0948\u092F\u093E\u0930 \u0935\u0940\u0921\u093F\u092F\u094B \u0921\u093E\u0909\u0928\u0932\u094B\u0921 \u0915\u0930\u0947\u0902",
      "\u0906\u092A\u0915\u0947 \u092A\u094D\u0930\u094B\u091C\u0947\u0915\u094D\u091F \u092E\u0947\u0902 \u092E\u0926\u0926 \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0935\u094D\u092F\u0915\u094D\u0924\u093F\u0917\u0924 \u092A\u094D\u0930\u092C\u0902\u0927\u0915",
      "\u0906\u092A\u0915\u0947 \u0915\u094C\u0936\u0932 \u0915\u094B \u092C\u0922\u093C\u093E\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0935\u093F\u0936\u0947\u0937 \u092A\u094D\u0930\u0936\u093F\u0915\u094D\u0937\u0923 \u0938\u0924\u094D\u0930"
    ],
    start: "\u092C\u0928\u093E\u0928\u093E \u0936\u0941\u0930\u0942 \u0915\u0930\u0947\u0902",
    buy: "\u0916\u0930\u0940\u0926\u0947\u0902"
  },
  creative: {
    title: "SuperDuperAI \u0915\u094D\u0930\u093F\u090F\u091F\u093F\u0935 \u092A\u093E\u0930\u094D\u091F\u0928\u0930\u0936\u093F\u092A \u092A\u094D\u0930\u094B\u0917\u094D\u0930\u093E\u092E",
    desc: "\u0939\u092E \u092D\u093E\u0935\u0941\u0915 \u0915\u0902\u091F\u0947\u0902\u091F \u0915\u094D\u0930\u093F\u090F\u091F\u0930\u094D\u0938 \u0914\u0930 \u0915\u0932\u093E\u0915\u093E\u0930\u094B\u0902 \u0915\u0940 \u0924\u0932\u093E\u0936 \u0915\u0930 \u0930\u0939\u0947 \u0939\u0948\u0902! \u0939\u092E\u093E\u0930\u0947 \u092A\u094D\u0930\u094B\u0917\u094D\u0930\u093E\u092E \u092E\u0947\u0902 \u0936\u093E\u092E\u093F\u0932 \u0939\u094B\u0902 \u0914\u0930 1000+ \u092E\u0941\u092B\u094D\u0924 \u0915\u094D\u0930\u0947\u0921\u093F\u091F, 1-\u0911\u0928-1 \u0938\u0939\u093E\u092F\u0924\u093E \u0914\u0930 \u0928\u0908 \u0938\u0941\u0935\u093F\u0927\u093E\u0913\u0902 \u0924\u0915 \u092A\u0939\u0941\u0902\u091A \u092A\u094D\u0930\u093E\u092A\u094D\u0924 \u0915\u0930\u0947\u0902\u0964 \u0938\u093E\u092E\u093E\u091C\u093F\u0915 \u0930\u0942\u092A \u0938\u0947 \u0938\u093E\u0930\u094D\u0925\u0915 \u092A\u094D\u0930\u094B\u091C\u0947\u0915\u094D\u091F \u0914\u0930 \u0928\u0935\u0940\u0928 \u0935\u093F\u091A\u093E\u0930\u094B\u0902 \u0935\u093E\u0932\u0947 \u0915\u094D\u0930\u093F\u090F\u091F\u0930\u094D\u0938 \u0915\u0947 \u0932\u093F\u090F \u092A\u0930\u092B\u0947\u0915\u094D\u091F\u0964",
    learn_more: "\u0914\u0930 \u091C\u093E\u0928\u0947\u0902",
    or: "\u092F\u093E",
    apply_email: "\u0908\u092E\u0947\u0932 \u0915\u0947 \u092E\u093E\u0927\u094D\u092F\u092E \u0938\u0947 \u0906\u0935\u0947\u0926\u0928 \u0915\u0930\u0947\u0902"
  },
  privacy_policy: "\u0917\u094B\u092A\u0928\u0940\u092F\u0924\u093E \u0928\u0940\u0924\u093F",
  veo3PromptGenerator: {
    infoBanner: {
      title: "VEO3 \u0935\u0940\u0921\u093F\u092F\u094B \u091C\u0928\u0930\u0947\u0936\u0928 \u092E\u0947\u0902 \u092E\u0939\u093E\u0930\u0924 \u0939\u093E\u0938\u093F\u0932 \u0915\u0930\u0947\u0902",
      description: "Google \u0915\u0947 \u0938\u092C\u0938\u0947 \u0909\u0928\u094D\u0928\u0924 AI \u0935\u0940\u0921\u093F\u092F\u094B \u092E\u0949\u0921\u0932 \u0915\u0947 \u0932\u093F\u090F \u092A\u0947\u0936\u0947\u0935\u0930 \u092A\u094D\u0930\u0949\u092E\u094D\u092A\u094D\u091F\u093F\u0902\u0917 \u0924\u0915\u0928\u0940\u0915\u094B\u0902 \u0914\u0930 \u0938\u0930\u094D\u0935\u094B\u0924\u094D\u0924\u092E \u092A\u094D\u0930\u0925\u093E\u0913\u0902 \u0915\u094B \u0938\u0940\u0916\u0947\u0902\u0964"
    },
    tabs: {
      builder: "\u092A\u094D\u0930\u0949\u092E\u094D\u092A\u094D\u091F \u092C\u093F\u0932\u094D\u0921\u0930",
      enhance: "AI \u090F\u0928\u094D\u0939\u093E\u0902\u0938\u092E\u0947\u0902\u091F",
      history: "\u0907\u0924\u093F\u0939\u093E\u0938"
    },
    promptBuilder: {
      scene: "\u0926\u0943\u0936\u094D\u092F",
      scenePlaceholder: "\u0938\u0947\u091F\u093F\u0902\u0917, \u0935\u093E\u0924\u093E\u0935\u0930\u0923 \u092F\u093E \u0938\u094D\u0925\u093E\u0928 \u0915\u093E \u0935\u0930\u094D\u0923\u0928 \u0915\u0930\u0947\u0902...",
      style: "\u0936\u0948\u0932\u0940",
      stylePlaceholder: "\u0915\u0932\u093E\u0924\u094D\u092E\u0915, \u092B\u094B\u091F\u094B-\u092F\u0925\u093E\u0930\u094D\u0925\u0935\u093E\u0926\u0940, \u0938\u093F\u0928\u0947\u092E\u0948\u091F\u093F\u0915, \u0906\u0926\u093F...",
      camera: "\u0915\u0948\u092E\u0930\u093E",
      cameraPlaceholder: "\u0915\u0948\u092E\u0930\u093E \u092E\u0942\u0935\u092E\u0947\u0902\u091F, \u090F\u0902\u0917\u0932, \u0936\u0949\u091F \u091F\u093E\u0907\u092A...",
      characters: "\u0915\u0948\u0930\u0947\u0915\u094D\u091F\u0930",
      addCharacter: "\u0915\u0948\u0930\u0947\u0915\u094D\u091F\u0930 \u091C\u094B\u0921\u093C\u0947\u0902",
      characterName: "\u0928\u093E\u092E",
      characterDescription: "\u0935\u093F\u0935\u0930\u0923",
      characterSpeech: "\u092D\u093E\u0937\u0923/\u0938\u0902\u0935\u093E\u0926",
      removeCharacter: "\u0939\u091F\u093E\u090F\u0902",
      action: "\u0915\u093E\u0930\u094D\u0930\u0935\u093E\u0908",
      actionPlaceholder: "\u0926\u0943\u0936\u094D\u092F \u092E\u0947\u0902 \u0915\u094D\u092F\u093E \u0939\u094B \u0930\u0939\u093E \u0939\u0948...",
      lighting: "\u092A\u094D\u0930\u0915\u093E\u0936 \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E",
      lightingPlaceholder: "\u092A\u094D\u0930\u093E\u0915\u0943\u0924\u093F\u0915, \u0928\u093E\u091F\u0915\u0940\u092F, \u0928\u0930\u092E, \u0906\u0926\u093F...",
      mood: "\u092E\u0942\u0921",
      moodPlaceholder: "\u092D\u093E\u0935\u0928\u093E\u0924\u094D\u092E\u0915 \u0935\u093E\u0924\u093E\u0935\u0930\u0923, \u0938\u094D\u0935\u0930...",
      language: "\u092D\u093E\u0937\u093E",
      moodboard: "\u092E\u0942\u0921\u092C\u094B\u0930\u094D\u0921",
      moodboardEnabled: "\u092E\u0942\u0921\u092C\u094B\u0930\u094D\u0921 \u0938\u0915\u094D\u0937\u092E \u0915\u0930\u0947\u0902",
      moodboardDescription: "\u091C\u0928\u0930\u0947\u0936\u0928 \u0915\u094B \u0928\u093F\u0930\u094D\u0926\u0947\u0936\u093F\u0924 \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0938\u0902\u0926\u0930\u094D\u092D \u091B\u0935\u093F\u092F\u093E\u0902 \u0905\u092A\u0932\u094B\u0921 \u0915\u0930\u0947\u0902"
    },
    promptPreview: {
      title: "\u0909\u0924\u094D\u092A\u0928\u094D\u0928 \u092A\u094D\u0930\u0949\u092E\u094D\u092A\u094D\u091F",
      copyButton: "\u0915\u0949\u092A\u0940 \u0915\u0930\u0947\u0902",
      copied: "\u0915\u0949\u092A\u0940 \u0915\u093F\u092F\u093E \u0917\u092F\u093E!",
      randomizeButton: "\u0930\u0948\u0902\u0921\u092E\u093E\u0907\u091C\u093C \u0915\u0930\u0947\u0902",
      clearButton: "\u0938\u092C \u0915\u0941\u091B \u0938\u093E\u092B\u093C \u0915\u0930\u0947\u0902",
      enhanceButton: "AI \u0915\u0947 \u0938\u093E\u0925 \u092C\u0922\u093C\u093E\u090F\u0902"
    },
    aiEnhancement: {
      title: "AI \u090F\u0928\u094D\u0939\u093E\u0902\u0938\u092E\u0947\u0902\u091F",
      description: "\u0909\u0928\u094D\u0928\u0924 AI \u0924\u0915\u0928\u0940\u0915\u094B\u0902 \u0915\u0947 \u0938\u093E\u0925 \u0905\u092A\u0928\u0947 \u092A\u094D\u0930\u0949\u092E\u094D\u092A\u094D\u091F \u0915\u094B \u092C\u0922\u093C\u093E\u090F\u0902",
      focusTypes: {
        character: "\u0915\u0948\u0930\u0947\u0915\u094D\u091F\u0930 \u092B\u094B\u0915\u0938",
        action: "\u0915\u093E\u0930\u094D\u0930\u0935\u093E\u0908 \u092B\u094B\u0915\u0938",
        cinematic: "\u0938\u093F\u0928\u0947\u092E\u0948\u091F\u093F\u0915 \u092B\u094B\u0915\u0938",
        safe: "\u0938\u0941\u0930\u0915\u094D\u0937\u093F\u0924 \u0938\u093E\u092E\u0917\u094D\u0930\u0940"
      },
      settings: {
        title: "\u090F\u0928\u094D\u0939\u093E\u0902\u0938\u092E\u0947\u0902\u091F \u0938\u0947\u091F\u093F\u0902\u0917\u094D\u0938",
        characterLimit: "\u0915\u0948\u0930\u0947\u0915\u094D\u091F\u0930 \u0938\u0940\u092E\u093E",
        includeAudio: "\u0911\u0921\u093F\u092F\u094B \u0935\u093F\u0935\u0930\u0923 \u0936\u093E\u092E\u093F\u0932 \u0915\u0930\u0947\u0902",
        model: "AI \u092E\u0949\u0921\u0932"
      },
      enhanceButton: "\u092A\u094D\u0930\u0949\u092E\u094D\u092A\u094D\u091F \u092C\u0922\u093C\u093E\u090F\u0902",
      enhancing: "\u092C\u0922\u093C\u093E \u0930\u0939\u093E \u0939\u0948...",
      enhanceError: "\u090F\u0928\u094D\u0939\u093E\u0902\u0938\u092E\u0947\u0902\u091F \u0935\u093F\u092B\u0932",
      enhancementInfo: {
        model: "\u092E\u0949\u0921\u0932",
        length: "\u0932\u0902\u092C\u093E\u0908",
        actualCharacters: "\u0935\u093E\u0938\u094D\u0924\u0935\u093F\u0915 \u0915\u0948\u0930\u0947\u0915\u094D\u091F\u0930",
        targetCharacters: "\u0932\u0915\u094D\u0937\u094D\u092F \u0915\u0948\u0930\u0947\u0915\u094D\u091F\u0930"
      }
    },
    promptHistory: {
      title: "\u092A\u094D\u0930\u0949\u092E\u094D\u092A\u094D\u091F \u0907\u0924\u093F\u0939\u093E\u0938",
      empty: "\u0905\u092D\u0940 \u0924\u0915 \u0907\u0924\u093F\u0939\u093E\u0938 \u092E\u0947\u0902 \u0915\u094B\u0908 \u092A\u094D\u0930\u0949\u092E\u094D\u092A\u094D\u091F \u0928\u0939\u0940\u0902",
      loadButton: "\u0932\u094B\u0921 \u0915\u0930\u0947\u0902",
      clearButton: "\u0907\u0924\u093F\u0939\u093E\u0938 \u0938\u093E\u092B\u093C \u0915\u0930\u0947\u0902",
      columns: {
        timestamp: "\u0924\u093F\u0925\u093F",
        basicPrompt: "\u092C\u0941\u0928\u093F\u092F\u093E\u0926\u0940 \u092A\u094D\u0930\u0949\u092E\u094D\u092A\u094D\u091F",
        enhancedPrompt: "\u092C\u0922\u093C\u093E\u092F\u093E \u0917\u092F\u093E \u092A\u094D\u0930\u0949\u092E\u094D\u092A\u094D\u091F",
        length: "\u0932\u0902\u092C\u093E\u0908",
        model: "\u092E\u0949\u0921\u0932"
      }
    },
    common: {
      loading: "\u0932\u094B\u0921 \u0939\u094B \u0930\u0939\u093E \u0939\u0948...",
      error: "\u0924\u094D\u0930\u0941\u091F\u093F",
      success: "\u0938\u092B\u0932",
      cancel: "\u0930\u0926\u094D\u0926 \u0915\u0930\u0947\u0902",
      save: "\u0938\u0939\u0947\u091C\u0947\u0902",
      delete: "\u0939\u091F\u093E\u090F\u0902",
      edit: "\u0938\u0902\u092A\u093E\u0926\u093F\u0924 \u0915\u0930\u0947\u0902",
      close: "\u092C\u0902\u0926 \u0915\u0930\u0947\u0902"
    }
  },
  video_generator: {
    title: "\u0935\u0940\u0921\u093F\u092F\u094B \u091C\u0928\u0930\u0947\u0936\u0928",
    description: "\u0906\u092A \u091C\u094B \u0935\u0940\u0921\u093F\u092F\u094B \u092C\u0928\u093E\u0928\u093E \u091A\u093E\u0939\u0924\u0947 \u0939\u0948\u0902 \u0909\u0938\u0915\u093E \u0935\u0930\u094D\u0923\u0928 \u0915\u0930\u0947\u0902",
    placeholder: "\u0909\u0926\u093E\u0939\u0930\u0923 \u0915\u0947 \u0932\u093F\u090F: \u0932\u0939\u0930\u094B\u0902 \u0915\u0947 \u0938\u093E\u0925 \u0938\u092E\u0941\u0926\u094D\u0930 \u0915\u0947 \u090A\u092A\u0930 \u0938\u0941\u0902\u0926\u0930 \u0938\u0942\u0930\u094D\u092F\u093E\u0938\u094D\u0924, \u092A\u0915\u094D\u0937\u0940 \u0915\u0940 \u0926\u0943\u0937\u094D\u091F\u093F \u0938\u0947 \u0936\u0942\u091F, \u0938\u093F\u0928\u0947\u092E\u0948\u091F\u093F\u0915 \u0917\u0941\u0923\u0935\u0924\u094D\u0924\u093E, \u0938\u0939\u091C \u0915\u0948\u092E\u0930\u093E \u0906\u0902\u0926\u094B\u0932\u0928...",
    duration: "\u0905\u0935\u0927\u093F",
    aspect_ratio: "\u0906\u0915\u093E\u0930 \u0905\u0928\u0941\u092A\u093E\u0924",
    resolution: "\u0930\u093F\u091C\u093C\u0949\u0932\u094D\u092F\u0942\u0936\u0928",
    video_count: "\u0935\u0940\u0921\u093F\u092F\u094B \u0915\u0940 \u0938\u0902\u0916\u094D\u092F\u093E",
    generate: "\u0935\u0940\u0921\u093F\u092F\u094B \u092C\u0928\u093E\u090F\u0902",
    generating: "\u091C\u0928\u0930\u0947\u091F \u0939\u094B \u0930\u0939\u093E \u0939\u0948...",
    status: "\u091C\u0928\u0930\u0947\u0936\u0928 \u0938\u094D\u0925\u093F\u0924\u093F",
    error: "\u0915\u0943\u092A\u092F\u093E \u0935\u0940\u0921\u093F\u092F\u094B \u0915\u093E \u0935\u093F\u0935\u0930\u0923 \u0926\u0930\u094D\u091C \u0915\u0930\u0947\u0902",
    generation_error: "\u091C\u0928\u0930\u0947\u0936\u0928 \u092C\u0928\u093E\u0924\u0947 \u0938\u092E\u092F \u0924\u094D\u0930\u0941\u091F\u093F",
    status_error: "\u0938\u094D\u0925\u093F\u0924\u093F \u091C\u093E\u0902\u091A\u0924\u0947 \u0938\u092E\u092F \u0924\u094D\u0930\u0941\u091F\u093F",
    download: "\u0921\u093E\u0909\u0928\u0932\u094B\u0921 \u0915\u0930\u0947\u0902",
    reset: "\u0930\u0940\u0938\u0947\u091F \u0915\u0930\u0947\u0902",
    seconds: "s",
    with: "\u0915\u0947 \u0938\u093E\u0925",
    progress: "\u092A\u094D\u0930\u0917\u0924\u093F",
    completed: "\u092A\u0942\u0930\u094D\u0923",
    error_status: "\u0924\u094D\u0930\u0941\u091F\u093F",
    processing: "\u092A\u094D\u0930\u094B\u0938\u0947\u0938\u093F\u0902\u0917",
    pending: "\u0932\u0902\u092C\u093F\u0924",
    ready: "\u0924\u0948\u092F\u093E\u0930",
    results: "\u092A\u0930\u093F\u0923\u093E\u092E",
    video: "\u0935\u0940\u0921\u093F\u092F\u094B",
    watch: "\u0926\u0947\u0916\u0947\u0902",
    create_new: "\u0928\u092F\u093E \u0935\u0940\u0921\u093F\u092F\u094B \u092C\u0928\u093E\u090F\u0902",
    generation_type: "\u091C\u0928\u0930\u0947\u0936\u0928 \u092A\u094D\u0930\u0915\u093E\u0930:",
    upload_image: "\u091B\u0935\u093F \u0905\u092A\u0932\u094B\u0921 \u0915\u0930\u0947\u0902:",
    image_uploaded: "\u2713 \u091B\u0935\u093F \u0905\u092A\u0932\u094B\u0921 \u0939\u094B \u0917\u0908",
    click_to_select: "\u091B\u0935\u093F \u091A\u0941\u0928\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0915\u094D\u0932\u093F\u0915 \u0915\u0930\u0947\u0902 \u092F\u093E \u092B\u093C\u093E\u0907\u0932 \u0915\u094B \u0916\u0940\u0902\u091A\u0947\u0902 \u0914\u0930 \u091B\u094B\u0921\u093C\u0947\u0902",
    select_file: "\u092B\u093C\u093E\u0907\u0932 \u091A\u0941\u0928\u0947\u0902",
    describe_animation: "\u091B\u0935\u093F \u0915\u094B \u0915\u0948\u0938\u0947 \u090F\u0928\u093F\u092E\u0947\u091F \u0915\u0930\u0928\u093E \u0939\u0948 \u0907\u0938\u0915\u093E \u0935\u0930\u094D\u0923\u0928 \u0915\u0930\u0947\u0902:",
    animation_placeholder: "\u0909\u0926\u093E\u0939\u0930\u0923 \u0915\u0947 \u0932\u093F\u090F: \u0927\u0940\u0930\u0947 \u0938\u0947 \u091D\u0942\u0932\u0947\u0902, \u0938\u0939\u091C\u0924\u093E \u0938\u0947 \u0918\u0941\u092E\u093E\u090F\u0902, \u092C\u093E\u0926\u0932 \u0906\u0902\u0926\u094B\u0932\u0928 \u091C\u094B\u0921\u093C\u0947\u0902...",
    upload_image_required: "\u0915\u0943\u092A\u092F\u093E \u0907\u092E\u0947\u091C-\u091F\u0942-\u0935\u0940\u0921\u093F\u092F\u094B \u091C\u0928\u0930\u0947\u0936\u0928 \u0915\u0947 \u0932\u093F\u090F \u090F\u0915 \u091B\u0935\u093F \u0905\u092A\u0932\u094B\u0921 \u0915\u0930\u0947\u0902",
    insufficient_balance: "\u0905\u092A\u0930\u094D\u092F\u093E\u092A\u094D\u0924 \u0915\u094D\u0930\u0947\u0921\u093F\u091F\u0964 \u0906\u0935\u0936\u094D\u092F\u0915: {required} \u0915\u094D\u0930\u0947\u0921\u093F\u091F\u0964 \u0915\u0943\u092A\u092F\u093E \u0905\u092A\u0928\u093E \u092C\u0948\u0932\u0947\u0902\u0938 \u091F\u0949\u092A \u0905\u092A \u0915\u0930\u0947\u0902\u0964",
    insufficient_balance_fallback: "\u0935\u0940\u0921\u093F\u092F\u094B \u091C\u0928\u0930\u0947\u0936\u0928 \u0915\u0947 \u0932\u093F\u090F \u0905\u092A\u0930\u094D\u092F\u093E\u092A\u094D\u0924 \u0915\u094D\u0930\u0947\u0921\u093F\u091F\u0964 \u0915\u0943\u092A\u092F\u093E \u0905\u092A\u0928\u093E \u092C\u0948\u0932\u0947\u0902\u0938 \u091F\u0949\u092A \u0905\u092A \u0915\u0930\u0947\u0902\u0964",
    generate_for: "{price} \u0915\u0947 \u0932\u093F\u090F \u091C\u0928\u0930\u0947\u091F \u0915\u0930\u0947\u0902",
    payment_error: "\u092D\u0941\u0917\u0924\u093E\u0928 \u0935\u093F\u092B\u0932\u0964 \u0915\u0943\u092A\u092F\u093E \u092A\u0941\u0928\u0903 \u092A\u094D\u0930\u092F\u093E\u0938 \u0915\u0930\u0947\u0902\u0964",
    payment_description: "\u0907\u0938 \u092E\u0949\u0921\u0932 \u0915\u0947 \u0938\u093E\u0925 \u0935\u0940\u0921\u093F\u092F\u094B \u091C\u0928\u0930\u0947\u091F \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F $1.00 \u092D\u0941\u0917\u0924\u093E\u0928 \u0915\u0930\u0947\u0902",
    back_to: "{model} \u092A\u0930 \u0935\u093E\u092A\u0938 \u091C\u093E\u090F\u0902",
    generate_video_with: "{model} \u0915\u0947 \u0938\u093E\u0925 \u0935\u0940\u0921\u093F\u092F\u094B \u091C\u0928\u0930\u0947\u091F \u0915\u0930\u0947\u0902",
    create_amazing_videos: "\u0915\u0947\u0935\u0932 $1.00 \u092E\u0947\u0902 \u0905\u0926\u094D\u092D\u0941\u0924 AI-\u091C\u0928\u0930\u0947\u091F\u0947\u0921 \u0935\u0940\u0921\u093F\u092F\u094B \u092C\u0928\u093E\u090F\u0902",
    video_description: "\u0935\u0940\u0921\u093F\u092F\u094B \u0935\u093F\u0935\u0930\u0923",
    describe_video_detail: "\u0906\u092A \u091C\u094B \u0935\u0940\u0921\u093F\u092F\u094B \u092C\u0928\u093E\u0928\u093E \u091A\u093E\u0939\u0924\u0947 \u0939\u0948\u0902 \u0909\u0938\u0915\u093E \u0935\u093F\u0938\u094D\u0924\u0943\u0924 \u0935\u0930\u094D\u0923\u0928 \u0915\u0930\u0947\u0902",
    your_prompt: "\u0906\u092A\u0915\u093E \u092A\u094D\u0930\u0949\u092E\u094D\u092A\u094D\u091F",
    generate_for_price: "$1.00 \u0915\u0947 \u0932\u093F\u090F \u091C\u0928\u0930\u0947\u091F \u0915\u0930\u0947\u0902",
    model_information: "\u092E\u0949\u0921\u0932 \u091C\u093E\u0928\u0915\u093E\u0930\u0940",
    what_you_get: "\u0906\u092A\u0915\u094B \u0915\u094D\u092F\u093E \u092E\u093F\u0932\u0924\u093E \u0939\u0948",
    high_quality_video: "\u0909\u091A\u094D\u091A-\u0917\u0941\u0923\u0935\u0924\u094D\u0924\u093E \u0935\u093E\u0932\u093E AI-\u091C\u0928\u0930\u0947\u091F\u0947\u0921 \u0935\u0940\u0921\u093F\u092F\u094B",
    commercial_rights: "\u092A\u0942\u0930\u094D\u0923 \u0935\u093E\u0923\u093F\u091C\u094D\u092F\u093F\u0915 \u0909\u092A\u092F\u094B\u0917 \u0905\u0927\u093F\u0915\u093E\u0930",
    instant_download: "\u091C\u0928\u0930\u0947\u0936\u0928 \u0915\u0947 \u092C\u093E\u0926 \u0924\u0924\u094D\u0915\u093E\u0932 \u0921\u093E\u0909\u0928\u0932\u094B\u0921",
    no_subscription: "\u0938\u0926\u0938\u094D\u092F\u0924\u093E \u0915\u0940 \u0906\u0935\u0936\u094D\u092F\u0915\u0924\u093E \u0928\u0939\u0940\u0902",
    payment_successful: "\u092D\u0941\u0917\u0924\u093E\u0928 \u0938\u092B\u0932! \u0935\u0940\u0921\u093F\u092F\u094B \u091C\u0928\u0930\u0947\u0936\u0928 \u091C\u0932\u094D\u0926 \u0939\u0940 \u0936\u0941\u0930\u0942 \u0939\u094B\u0917\u093E\u0964",
    advanced_ai_model: "\u0909\u0928\u094D\u0928\u0924 AI \u0935\u0940\u0921\u093F\u092F\u094B \u091C\u0928\u0930\u0947\u0936\u0928 \u092E\u0949\u0921\u0932",
    supports_both_modes: "\u2728 \u092F\u0939 \u092E\u0949\u0921\u0932 text-to-video \u0914\u0930 image-to-video \u0926\u094B\u0928\u094B\u0902 \u091C\u0928\u0930\u0947\u0936\u0928 \u0915\u093E \u0938\u092E\u0930\u094D\u0925\u0928 \u0915\u0930\u0924\u093E \u0939\u0948",
    image_to_video: "\u0907\u092E\u0947\u091C-\u091F\u0942-\u0935\u0940\u0921\u093F\u092F\u094B",
    upload_source_image: "\u0938\u094D\u0930\u094B\u0924 \u091B\u0935\u093F \u0905\u092A\u0932\u094B\u0921 \u0915\u0930\u0947\u0902 (\u0935\u0948\u0915\u0932\u094D\u092A\u093F\u0915)",
    upload_image_description: "\u0907\u092E\u0947\u091C-\u091F\u0942-\u0935\u0940\u0921\u093F\u092F\u094B \u091C\u0928\u0930\u0947\u0936\u0928 \u0915\u0947 \u0932\u093F\u090F \u091B\u0935\u093F \u0905\u092A\u0932\u094B\u0921 \u0915\u0930\u0947\u0902, \u092F\u093E text-to-video \u0915\u0947 \u0932\u093F\u090F \u0916\u093E\u0932\u0940 \u091B\u094B\u0921\u093C\u0947\u0902",
    click_to_upload: "\u0905\u092A\u0932\u094B\u0921 \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0915\u094D\u0932\u093F\u0915 \u0915\u0930\u0947\u0902",
    or_drag_and_drop: "\u092F\u093E \u0916\u0940\u0902\u091A\u0947\u0902 \u0914\u0930 \u091B\u094B\u0921\u093C\u0947\u0902",
    file_formats: "PNG, JPG, GIF 10MB \u0924\u0915",
    pay_to_generate_video: "\u0935\u0940\u0921\u093F\u092F\u094B \u091C\u0928\u0930\u0947\u091F \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F $1.00 \u092D\u0941\u0917\u0924\u093E\u0928 \u0915\u0930\u0947\u0902",
    generate_for_dollar: "$1.00 \u0915\u0947 \u0932\u093F\u090F \u091C\u0928\u0930\u0947\u091F \u0915\u0930\u0947\u0902"
  },
  image_generator: {
    title: "\u091B\u0935\u093F \u091C\u0928\u0930\u0947\u0936\u0928",
    description: "\u0906\u092A \u091C\u094B \u091B\u0935\u093F \u092C\u0928\u093E\u0928\u093E \u091A\u093E\u0939\u0924\u0947 \u0939\u0948\u0902 \u0909\u0938\u0915\u093E \u0935\u0930\u094D\u0923\u0928 \u0915\u0930\u0947\u0902",
    placeholder: "\u0909\u0926\u093E\u0939\u0930\u0923 \u0915\u0947 \u0932\u093F\u090F: \u0906\u0927\u0941\u0928\u093F\u0915 \u0936\u0939\u0930\u0940 \u092A\u0930\u093F\u0926\u0943\u0936\u094D\u092F, \u0917\u0917\u0928\u091A\u0941\u0902\u092C\u0940 \u0907\u092E\u093E\u0930\u0924\u0947\u0902, \u0938\u0942\u0930\u094D\u092F\u093E\u0938\u094D\u0924 \u0915\u0940 \u0930\u094B\u0936\u0928\u0940, \u0909\u091A\u094D\u091A \u0917\u0941\u0923\u0935\u0924\u094D\u0924\u093E, \u092F\u0925\u093E\u0930\u094D\u0925\u0935\u093E\u0926\u0940 \u0936\u0948\u0932\u0940...",
    width: "\u091A\u094C\u0921\u093C\u093E\u0908",
    height: "\u090A\u0902\u091A\u093E\u0908",
    aspect_ratio: "\u0906\u0915\u093E\u0930 \u0905\u0928\u0941\u092A\u093E\u0924",
    style: "\u0936\u0948\u0932\u0940",
    shot_size: "\u0936\u0949\u091F \u0906\u0915\u093E\u0930",
    image_count: "\u091B\u0935\u093F \u0915\u0940 \u0938\u0902\u0916\u094D\u092F\u093E",
    generate: "\u091B\u0935\u093F \u092C\u0928\u093E\u090F\u0902",
    generating: "\u091C\u0928\u0930\u0947\u091F \u0939\u094B \u0930\u0939\u093E \u0939\u0948...",
    status: "\u091C\u0928\u0930\u0947\u0936\u0928 \u0938\u094D\u0925\u093F\u0924\u093F",
    error: "\u0915\u0943\u092A\u092F\u093E \u091B\u0935\u093F \u0915\u093E \u0935\u093F\u0935\u0930\u0923 \u0926\u0930\u094D\u091C \u0915\u0930\u0947\u0902",
    generation_error: "\u091C\u0928\u0930\u0947\u0936\u0928 \u092C\u0928\u093E\u0924\u0947 \u0938\u092E\u092F \u0924\u094D\u0930\u0941\u091F\u093F",
    status_error: "\u0938\u094D\u0925\u093F\u0924\u093F \u091C\u093E\u0902\u091A\u0924\u0947 \u0938\u092E\u092F \u0924\u094D\u0930\u0941\u091F\u093F",
    download: "\u0921\u093E\u0909\u0928\u0932\u094B\u0921 \u0915\u0930\u0947\u0902",
    reset: "\u0930\u0940\u0938\u0947\u091F \u0915\u0930\u0947\u0902",
    starting: "\u091C\u0928\u0930\u0947\u0936\u0928 \u0936\u0941\u0930\u0942 \u0939\u094B \u0930\u0939\u093E \u0939\u0948...",
    tracking: "\u091C\u0928\u0930\u0947\u0936\u0928 \u0936\u0941\u0930\u0942 \u0939\u094B \u0917\u092F\u093E, \u092A\u094D\u0930\u0917\u0924\u093F \u091F\u094D\u0930\u0948\u0915 \u0915\u0930 \u0930\u0939\u0947 \u0939\u0948\u0902...",
    processing: "\u092A\u094D\u0930\u094B\u0938\u0947\u0938\u093F\u0902\u0917...",
    completed: "\u092A\u0942\u0930\u094D\u0923",
    error_status: "\u0924\u094D\u0930\u0941\u091F\u093F",
    progress: "\u092A\u094D\u0930\u0917\u0924\u093F",
    pending: "\u0932\u0902\u092C\u093F\u0924",
    ready: "\u0924\u0948\u092F\u093E\u0930",
    results: "\u092A\u0930\u093F\u0923\u093E\u092E",
    image: "\u091B\u0935\u093F",
    watch: "\u0926\u0947\u0916\u0947\u0902",
    create_new: "\u0928\u0908 \u091B\u0935\u093F \u092C\u0928\u093E\u090F\u0902",
    image_description: "\u091B\u0935\u093F \u0935\u093F\u0935\u0930\u0923",
    image_placeholder: "\u0906\u092A \u091C\u094B \u091B\u0935\u093F \u092C\u0928\u093E\u0928\u093E \u091A\u093E\u0939\u0924\u0947 \u0939\u0948\u0902 \u0909\u0938\u0915\u093E \u0935\u0930\u094D\u0923\u0928 \u0915\u0930\u0947\u0902...",
    generation_complete: "\u091C\u0928\u0930\u0947\u0936\u0928 \u092A\u0942\u0930\u094D\u0923!",
    generation_error_msg: "\u091C\u0928\u0930\u0947\u0936\u0928 \u0915\u0947 \u0926\u094C\u0930\u093E\u0928 \u0924\u094D\u0930\u0941\u091F\u093F",
    status_check_error: "\u091C\u0928\u0930\u0947\u0936\u0928 \u0938\u094D\u0925\u093F\u0924\u093F \u091C\u093E\u0902\u091A\u0924\u0947 \u0938\u092E\u092F \u0924\u094D\u0930\u0941\u091F\u093F",
    created_images: "\u092C\u0928\u093E\u0908 \u0917\u0908 \u091B\u0935\u093F\u092F\u093E\u0902:",
    generated_image: "\u091C\u0928\u0930\u0947\u091F\u0947\u0921 \u091B\u0935\u093F",
    insufficient_balance: "\u0905\u092A\u0930\u094D\u092F\u093E\u092A\u094D\u0924 \u0915\u094D\u0930\u0947\u0921\u093F\u091F\u0964 \u0906\u0935\u0936\u094D\u092F\u0915: {required} \u0915\u094D\u0930\u0947\u0921\u093F\u091F\u0964 \u0915\u0943\u092A\u092F\u093E \u0905\u092A\u0928\u093E \u092C\u0948\u0932\u0947\u0902\u0938 \u091F\u0949\u092A \u0905\u092A \u0915\u0930\u0947\u0902\u0964",
    insufficient_balance_fallback: "\u091B\u0935\u093F \u091C\u0928\u0930\u0947\u0936\u0928 \u0915\u0947 \u0932\u093F\u090F \u0905\u092A\u0930\u094D\u092F\u093E\u092A\u094D\u0924 \u0915\u094D\u0930\u0947\u0921\u093F\u091F\u0964 \u0915\u0943\u092A\u092F\u093E \u0905\u092A\u0928\u093E \u092C\u0948\u0932\u0947\u0902\u0938 \u091F\u0949\u092A \u0905\u092A \u0915\u0930\u0947\u0902\u0964",
    generate_for: "{price} \u0915\u0947 \u0932\u093F\u090F \u091C\u0928\u0930\u0947\u091F \u0915\u0930\u0947\u0902",
    payment_error: "\u092D\u0941\u0917\u0924\u093E\u0928 \u0935\u093F\u092B\u0932\u0964 \u0915\u0943\u092A\u092F\u093E \u092A\u0941\u0928\u0903 \u092A\u094D\u0930\u092F\u093E\u0938 \u0915\u0930\u0947\u0902\u0964",
    payment_description: "\u0907\u0938 \u092E\u0949\u0921\u0932 \u0915\u0947 \u0938\u093E\u0925 \u091B\u0935\u093F\u092F\u093E\u0902 \u091C\u0928\u0930\u0947\u091F \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F $1.00 \u092D\u0941\u0917\u0924\u093E\u0928 \u0915\u0930\u0947\u0902"
  },
  model_descriptions: {
    veo2: "Veo2 - \u0938\u094D\u0925\u093F\u0930 \u091B\u0935\u093F\u092F\u094B\u0902 \u0915\u094B \u092E\u0942\u0932 \u0936\u0948\u0932\u0940 \u0915\u094B \u0938\u0902\u0930\u0915\u094D\u0937\u093F\u0924 \u0915\u0930\u0924\u0947 \u0939\u0941\u090F \u0917\u0924\u093F\u0936\u0940\u0932 HD \u0935\u0940\u0921\u093F\u092F\u094B \u092E\u0947\u0902 \u092C\u0926\u0932\u0924\u093E \u0939\u0948",
    sora: "Sora - \u091B\u094B\u091F\u0947 \u0915\u094D\u0937\u0948\u0924\u093F\u091C \u0935\u0940\u0921\u093F\u092F\u094B \u091C\u0928\u0930\u0947\u091F \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F OpenAI \u0915\u093E \u092A\u094D\u0930\u093E\u092F\u094B\u0917\u093F\u0915 \u092E\u0949\u0921\u0932",
    veo3: "Veo3 - text-to-video \u091C\u0928\u0930\u0947\u0936\u0928 \u0915\u0947 \u0932\u093F\u090F Google \u0915\u093E \u0928\u0935\u0940\u0928\u0924\u092E \u092E\u0949\u0921\u0932",
    google_imagen_4: "Google Imagen 4 - \u0909\u091A\u094D\u091A-\u0917\u0941\u0923\u0935\u0924\u094D\u0924\u093E \u0935\u093E\u0932\u0940 \u091B\u0935\u093F\u092F\u093E\u0902 \u092C\u0928\u093E\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0909\u0928\u094D\u0928\u0924 AI \u092E\u0949\u0921\u0932",
    gpt_image_1: "GPT-Image-1 - OpenAI \u0915\u093E \u091B\u0935\u093F \u091C\u0928\u0930\u0947\u0936\u0928 \u092E\u0949\u0921\u0932",
    flux_kontext: "Flux Kontext - \u0930\u091A\u0928\u093E\u0924\u094D\u092E\u0915 \u091B\u0935\u093F \u091C\u0928\u0930\u0947\u0936\u0928 \u0915\u0947 \u0932\u093F\u090F \u0909\u0928\u094D\u0928\u0924 \u092E\u0949\u0921\u0932"
  },
  credit_balance: {
    title: "\u0915\u094D\u0930\u0947\u0921\u093F\u091F \u092C\u0948\u0932\u0947\u0902\u0938",
    subtitle: "AI \u091F\u0942\u0932\u094D\u0938 \u0915\u093E \u0909\u092A\u092F\u094B\u0917 \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0935\u0930\u094D\u0924\u092E\u093E\u0928 \u092C\u0948\u0932\u0947\u0902\u0938",
    current_balance: "\u0935\u0930\u094D\u0924\u092E\u093E\u0928 \u092C\u0948\u0932\u0947\u0902\u0938:",
    credits: "\u0915\u094D\u0930\u0947\u0921\u093F\u091F",
    empty: "\u0916\u093E\u0932\u0940",
    low_balance: "\u0915\u092E \u092C\u0948\u0932\u0947\u0902\u0938",
    good_balance: "\u0905\u091A\u094D\u091B\u093E \u092C\u0948\u0932\u0947\u0902\u0938",
    user_type: "\u0909\u092A\u092F\u094B\u0917\u0915\u0930\u094D\u0924\u093E \u092A\u094D\u0930\u0915\u093E\u0930:",
    tool_costs: "\u091F\u0942\u0932 \u0932\u093E\u0917\u0924:",
    image_generation: "\u091B\u0935\u093F \u091C\u0928\u0930\u0947\u0936\u0928: 2-6 \u0915\u094D\u0930\u0947\u0921\u093F\u091F",
    video_generation: "\u0935\u0940\u0921\u093F\u092F\u094B \u091C\u0928\u0930\u0947\u0936\u0928: 7.5-90 \u0915\u094D\u0930\u0947\u0921\u093F\u091F",
    script_generation: "\u0938\u094D\u0915\u094D\u0930\u093F\u092A\u094D\u091F \u091C\u0928\u0930\u0947\u0936\u0928: 1-2 \u0915\u094D\u0930\u0947\u0921\u093F\u091F",
    prompt_enhancement: "\u092A\u094D\u0930\u0949\u092E\u094D\u092A\u094D\u091F \u090F\u0928\u094D\u0939\u093E\u0902\u0938\u092E\u0947\u0902\u091F: 1-2 \u0915\u094D\u0930\u0947\u0921\u093F\u091F",
    loading: "\u092C\u0948\u0932\u0947\u0902\u0938 \u0932\u094B\u0921 \u0939\u094B \u0930\u0939\u093E \u0939\u0948...",
    error: "\u092C\u0948\u0932\u0947\u0902\u0938 \u0932\u094B\u0921 \u0915\u0930\u0928\u0947 \u092E\u0947\u0902 \u0924\u094D\u0930\u0941\u091F\u093F"
  },
  direct_payment: {
    generate_image: "{model} \u0915\u0947 \u0938\u093E\u0925 \u091B\u0935\u093F \u091C\u0928\u0930\u0947\u091F \u0915\u0930\u0947\u0902",
    generate_video: "{model} \u0915\u0947 \u0938\u093E\u0925 \u0935\u0940\u0921\u093F\u092F\u094B \u091C\u0928\u0930\u0947\u091F \u0915\u0930\u0947\u0902",
    image_description: "AI \u0915\u0947 \u0938\u093E\u0925 \u0906\u0915\u0930\u094D\u0937\u0915 \u091B\u0935\u093F\u092F\u093E\u0902 \u092C\u0928\u093E\u090F\u0902",
    video_description: "AI \u0915\u0947 \u0938\u093E\u0925 \u0905\u0926\u094D\u092D\u0941\u0924 \u0935\u0940\u0921\u093F\u092F\u094B \u092C\u0928\u093E\u090F\u0902",
    your_prompt: "\u0906\u092A\u0915\u093E \u092A\u094D\u0930\u0949\u092E\u094D\u092A\u094D\u091F",
    image_generation: "\u091B\u0935\u093F \u091C\u0928\u0930\u0947\u0936\u0928",
    video_generation: "\u0935\u0940\u0921\u093F\u092F\u094B \u091C\u0928\u0930\u0947\u0936\u0928",
    one_time_payment: "\u090F\u0915 \u092C\u093E\u0930 \u0915\u093E \u092D\u0941\u0917\u0924\u093E\u0928",
    processing_payment: "\u092D\u0941\u0917\u0924\u093E\u0928 \u092A\u094D\u0930\u094B\u0938\u0947\u0938 \u0939\u094B \u0930\u0939\u093E \u0939\u0948..."
  },
  stripe_payment: {
    loading_payment_options: "\u092D\u0941\u0917\u0924\u093E\u0928 \u0935\u093F\u0915\u0932\u094D\u092A \u0932\u094B\u0921 \u0939\u094B \u0930\u0939\u0947 \u0939\u0948\u0902...",
    failed_load_payment: "\u092D\u0941\u0917\u0924\u093E\u0928 \u0935\u093F\u0915\u0932\u094D\u092A \u0932\u094B\u0921 \u0915\u0930\u0928\u0947 \u092E\u0947\u0902 \u0935\u093F\u092B\u0932",
    top_up_balance: "\u092C\u0948\u0932\u0947\u0902\u0938 \u091F\u0949\u092A \u0905\u092A \u0915\u0930\u0947\u0902",
    generate_veo3_videos: "VEO3 \u0935\u0940\u0921\u093F\u092F\u094B \u091C\u0928\u0930\u0947\u091F \u0915\u0930\u0947\u0902",
    generate_ai_images: "AI \u091B\u0935\u093F\u092F\u093E\u0902 \u091C\u0928\u0930\u0947\u091F \u0915\u0930\u0947\u0902",
    top_up_balance_desc: "AI \u091F\u0942\u0932\u094D\u0938 \u0915\u093E \u0909\u092A\u092F\u094B\u0917 \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0905\u092A\u0928\u093E \u092C\u0948\u0932\u0947\u0902\u0938 {amount} \u0915\u094D\u0930\u0947\u0921\u093F\u091F \u0938\u0947 \u091F\u0949\u092A \u0905\u092A \u0915\u0930\u0947\u0902",
    generate_video_desc: "\u0906\u092A\u0915\u093E \u092A\u094D\u0930\u0949\u092E\u094D\u092A\u094D\u091F \u0924\u0948\u092F\u093E\u0930 \u0939\u0948! Google VEO3 \u0915\u0947 \u0938\u093E\u0925 \u092A\u0947\u0936\u0947\u0935\u0930 AI \u0935\u0940\u0921\u093F\u092F\u094B \u091C\u0928\u0930\u0947\u091F \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u090F\u0915 \u092F\u094B\u091C\u0928\u093E \u091A\u0941\u0928\u0947\u0902\u0964",
    generate_image_desc: "\u0906\u092A\u0915\u093E \u092A\u094D\u0930\u0949\u092E\u094D\u092A\u094D\u091F \u0924\u0948\u092F\u093E\u0930 \u0939\u0948! \u092A\u0947\u0936\u0947\u0935\u0930 AI \u091B\u0935\u093F\u092F\u093E\u0902 \u091C\u0928\u0930\u0947\u091F \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u090F\u0915 \u092F\u094B\u091C\u0928\u093E \u091A\u0941\u0928\u0947\u0902\u0964",
    top_up_credits: "{amount} \u0915\u094D\u0930\u0947\u0921\u093F\u091F \u091F\u0949\u092A \u0905\u092A \u0915\u0930\u0947\u0902",
    generate_video: "\u0935\u0940\u0921\u093F\u092F\u094B \u091C\u0928\u0930\u0947\u091F \u0915\u0930\u0947\u0902",
    generate_image: "\u091B\u0935\u093F \u091C\u0928\u0930\u0947\u091F \u0915\u0930\u0947\u0902",
    get_credits_desc: "\u091B\u0935\u093F\u092F\u093E\u0902, \u0935\u0940\u0921\u093F\u092F\u094B \u0914\u0930 \u0938\u094D\u0915\u094D\u0930\u093F\u092A\u094D\u091F \u091C\u0928\u0930\u0947\u091F \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F {amount} \u0915\u094D\u0930\u0947\u0921\u093F\u091F \u092A\u094D\u0930\u093E\u092A\u094D\u0924 \u0915\u0930\u0947\u0902",
    generate_video_desc_short: "\u0905\u092A\u0928\u0947 \u0915\u0938\u094D\u091F\u092E \u092A\u094D\u0930\u0949\u092E\u094D\u092A\u094D\u091F \u0915\u0947 \u0938\u093E\u0925 1 \u0909\u091A\u094D\u091A-\u0917\u0941\u0923\u0935\u0924\u094D\u0924\u093E \u0935\u093E\u0932\u093E AI \u0935\u0940\u0921\u093F\u092F\u094B \u091C\u0928\u0930\u0947\u091F \u0915\u0930\u0947\u0902",
    generate_image_desc_short: "\u0905\u092A\u0928\u0947 \u0915\u0938\u094D\u091F\u092E \u092A\u094D\u0930\u0949\u092E\u094D\u092A\u094D\u091F \u0915\u0947 \u0938\u093E\u0925 1 \u0909\u091A\u094D\u091A-\u0917\u0941\u0923\u0935\u0924\u094D\u0924\u093E \u0935\u093E\u0932\u0940 AI \u091B\u0935\u093F \u091C\u0928\u0930\u0947\u091F \u0915\u0930\u0947\u0902",
    creating_payment: "\u092D\u0941\u0917\u0924\u093E\u0928 \u092C\u0928\u093E\u092F\u093E \u091C\u093E \u0930\u0939\u093E \u0939\u0948...",
    top_up_for: "${price} \u0915\u0947 \u0932\u093F\u090F \u091F\u0949\u092A \u0905\u092A \u0915\u0930\u0947\u0902",
    generate_for: "${price} \u0915\u0947 \u0932\u093F\u090F \u0935\u0940\u0921\u093F\u092F\u094B \u091C\u0928\u0930\u0947\u091F \u0915\u0930\u0947\u0902",
    generate_image_for: "${price} \u0915\u0947 \u0932\u093F\u090F \u091B\u0935\u093F \u091C\u0928\u0930\u0947\u091F \u0915\u0930\u0947\u0902",
    instant_access: "\u2713 \u0924\u0924\u094D\u0915\u093E\u0932 \u092A\u0939\u0941\u0902\u091A \u2022 \u2713 \u0915\u094B\u0908 \u0938\u0926\u0938\u094D\u092F\u0924\u093E \u0928\u0939\u0940\u0902 \u2022 \u2713 \u0938\u0941\u0930\u0915\u094D\u0937\u093F\u0924 Stripe \u092D\u0941\u0917\u0924\u093E\u0928",
    test_mode: "\u{1F9EA} \u091F\u0947\u0938\u094D\u091F \u092E\u094B\u0921 - \u091F\u0947\u0938\u094D\u091F \u0915\u093E\u0930\u094D\u0921 4242 4242 4242 4242 \u0915\u093E \u0909\u092A\u092F\u094B\u0917 \u0915\u0930\u0947\u0902",
    generate_prompt_first: "\u0915\u0943\u092A\u092F\u093E \u092A\u0939\u0932\u0947 \u090F\u0915 \u092A\u094D\u0930\u0949\u092E\u094D\u092A\u094D\u091F \u091C\u0928\u0930\u0947\u091F \u0915\u0930\u0947\u0902",
    prices_not_loaded: "\u0915\u0940\u092E\u0924\u0947\u0902 \u0905\u092D\u0940 \u0924\u0915 \u0932\u094B\u0921 \u0928\u0939\u0940\u0902 \u0939\u0941\u0908 \u0939\u0948\u0902, \u0915\u0943\u092A\u092F\u093E \u092A\u0941\u0928\u0903 \u092A\u094D\u0930\u092F\u093E\u0938 \u0915\u0930\u0947\u0902",
    failed_create_checkout: "\u091A\u0947\u0915\u0906\u0909\u091F \u0938\u0947\u0936\u0928 \u092C\u0928\u093E\u0928\u0947 \u092E\u0947\u0902 \u0935\u093F\u092B\u0932"
  }
};

// src/translation/dictionaries/super-landing/dictionaries.ts
var superLandingDictionaries = {
  en,
  ru,
  tr,
  es,
  hi
};
function getSuperLandingDictionary(locale) {
  return superLandingDictionaries[locale] || en;
}
function getClientSuperLandingTranslation(locale) {
  const dict = getSuperLandingDictionary(locale);
  function t(key, fallback) {
    const keys = key.split(".");
    let value = dict;
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        if (fallback !== void 0) return fallback;
        return key;
      }
    }
    return value;
  }
  return { t, dict };
}

// src/translation/dictionaries/super-landing/dictionaries-server.ts
var superLandingDictionaries2 = {
  en,
  ru,
  tr,
  es,
  hi
};
function getSuperLandingDictionaryServer(locale) {
  return superLandingDictionaries2[locale] || en;
}
function getServerSuperLandingTranslation(locale) {
  const dict = getSuperLandingDictionaryServer(locale);
  const t = (key, fallback) => {
    const keys = key.split(".");
    let value = dict;
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        if (fallback !== void 0) return fallback;
        return key;
      }
    }
    return value;
  };
  return { t, dict };
}

// src/translation/hooks.ts
var import_react5 = require("react");

// src/translation/utils.ts
function getNestedValue(dictionary, key) {
  const keys = key.split(".");
  let current = dictionary;
  for (const k of keys) {
    if (current && typeof current === "object" && k in current) {
      current = current[k];
    } else {
      return void 0;
    }
  }
  return current;
}
function getTranslation(dictionary, key, fallback) {
  const value = getNestedValue(dictionary, key);
  if (typeof value === "string") {
    return value;
  }
  return fallback || key;
}
function interpolateTranslation(text, variables) {
  return text.replace(/\{(\w+)\}/g, (match, key) => {
    return variables[key] !== void 0 ? String(variables[key]) : match;
  });
}
function getTranslationWithInterpolation(dictionary, key, variables = {}, fallback) {
  const translation = getTranslation(dictionary, key, fallback);
  return interpolateTranslation(translation, variables);
}
function hasTranslation(dictionary, key) {
  return getNestedValue(dictionary, key) !== void 0;
}
function getAllTranslationKeys(dictionary, prefix = "") {
  const keys = [];
  for (const [key, value] of Object.entries(dictionary)) {
    const currentKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      keys.push(...getAllTranslationKeys(value, currentKey));
    } else {
      keys.push(currentKey);
    }
  }
  return keys;
}

// src/translation/hooks.ts
function useTranslations(dictionary) {
  const t = (0, import_react5.useCallback)(
    (key, fallback) => {
      return getTranslation(dictionary, key, fallback);
    },
    [dictionary]
  );
  const tWithVars = (0, import_react5.useCallback)(
    (key, variables = {}, fallback) => {
      return getTranslationWithInterpolation(dictionary, key, variables, fallback);
    },
    [dictionary]
  );
  const has = (0, import_react5.useCallback)(
    (key) => {
      return hasTranslation(dictionary, key);
    },
    [dictionary]
  );
  const keys = (0, import_react5.useMemo)(() => {
    return getAllTranslationKeys(dictionary);
  }, [dictionary]);
  return {
    t,
    tWithVars,
    has,
    keys,
    dictionary
  };
}
function useAppTranslations(app, locale) {
  const getDictionary = (0, import_react5.useCallback)(() => {
    return {};
  }, [app, locale]);
  const dictionary = (0, import_react5.useMemo)(() => getDictionary(), [getDictionary]);
  return useTranslations(dictionary);
}
function useLandingTranslations(locale) {
  return useAppTranslations("super-landing", locale);
}
function useChatbotTranslations(locale) {
  return useAppTranslations("super-chatbot", locale);
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
  en,
  es,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatDuration,
  formatFileSize,
  formatNumber,
  formatPercentage,
  formatRelativeTime,
  getAllTranslationKeys,
  getClientSuperLandingTranslation,
  getCurrentMode,
  getCurrentPrices,
  getNestedValue,
  getServerSuperLandingTranslation,
  getSingleVideoPrice,
  getStripeConfig,
  getSuperLandingDictionary,
  getSuperLandingDictionaryServer,
  getTranslation,
  getTranslationWithInterpolation,
  getTripleVideoPrice,
  guestRegex,
  hasErrors,
  hasTranslation,
  hi,
  i18n,
  i18nServer,
  interpolateTranslation,
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
  localeCookieName,
  localeMap,
  localeMapServer,
  ru,
  slugify,
  superLandingDictionaries,
  tr,
  translationConfig,
  translationConfigServer,
  truncateText,
  useAppTranslations,
  useChatbotTranslations,
  useClickOutside,
  useDebounce,
  useIsDarkMode,
  useIsDesktop,
  useIsMobile,
  useIsReducedMotion,
  useIsTablet,
  useLandingTranslations,
  useLocalStorage,
  useMediaQuery,
  useTranslations,
  validateObject,
  validateRequired
});
//# sourceMappingURL=index.js.map