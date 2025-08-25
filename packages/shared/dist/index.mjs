"use client";

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
import { useEffect, useState } from "react";
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
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
import { useState as useState2 } from "react";
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState2(() => {
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
import { useState as useState3, useEffect as useEffect3 } from "react";
function useMediaQuery(query) {
  const [matches, setMatches] = useState3(false);
  useEffect3(() => {
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
import { useEffect as useEffect4 } from "react";
function useClickOutside(ref, handler) {
  useEffect4(() => {
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
  "blog": {
    "page_title": "Blog"
  },
  "site": {
    "name": "SuperDuperAI"
  },
  "footer": {
    "pages": {
      "about": "About",
      "pricing": "Pricing",
      "terms": "Terms and Conditions",
      "privacy": "Privacy",
      "blog": "Blog",
      "demo": "Book a Demo"
    },
    "company": "SuperDuperAI",
    "corp": "SuperDuperAi, Corp.",
    "address1": "57 Saulsbury Rd, Unit E #1333",
    "address2": "Dover, DE 19904",
    "phone": "+1 818 619 0966",
    "email": "info@superduperai.co",
    "copyright": "\xA9 {year} SuperDuperAi Corp. All rights reserved.",
    "social": {
      "instagram": "Follow SuperDuperAI on Instagram",
      "youtube": "Subscribe to SuperDuperAI on YouTube",
      "telegram": "Join SuperDuperAI on Telegram",
      "tiktok": "Follow SuperDuperAI on TikTok",
      "discord": "Join SuperDuperAI Discord server",
      "linkedin": "Connect with SuperDuperAI on LinkedIn"
    }
  },
  "marketing": {
    "pages": "Pages",
    "tools": "AI Tools",
    "cases": "Use Cases",
    "ai_tool_title": "AI tool by SuperDuperAI",
    "ai_case_title": "Case Study by SuperDuperAI",
    "view_all_tools": "View All Tools \u2192",
    "view_all_cases": "View All Use Cases \u2192"
  },
  "hero": {
    "title": "Turn Vibes into Videos Instantly",
    "description": "Revolutionary AI platform for creating professional videos without skills, equipment, or budget. 10x faster and cheaper.",
    "cta": "Start Creating for Free"
  },
  "features": {
    "section_title": "What Makes SuperDuperAI Super",
    "section_description": "Advanced features and technologies for creating stunning videos",
    "list": [
      {
        "icon": "users",
        "title": "Custom Characters with AI Memory",
        "description": "Your AI actor database using LoRA technology. Create and save unique characters for your videos."
      },
      {
        "icon": "image",
        "title": "Cinematic Camera Controls",
        "description": "Pans, zooms, bullet-time \u2014 without physical cameras. Add professional camera movements with one click."
      },
      {
        "icon": "settings",
        "title": "Multi-Agent AI Workflow",
        "description": "A model where each agent does its job. Specialized AI for scripting, filming, editing, and sound."
      },
      {
        "icon": "speed",
        "title": "Fast & Efficient",
        "description": "Idea \u2192 video in minutes, not hours or days. Speed up your workflow and create more content."
      },
      {
        "icon": "chart",
        "title": "Cost Saving",
        "description": "Cinematography on a budget. Get professional video without spending on crew and equipment."
      },
      {
        "icon": "edit",
        "title": "Easy Editing & Integration",
        "description": "Storyboard, drag-drop, export to TikTok / YouTube. Intuitive interface for quick finalization of your video."
      }
    ]
  },
  "howItWorks": {
    "section_title": "How It Works",
    "section_description": "Direct your video in 3 easy steps \u2013 AI agents handle the rest.",
    "steps": [
      {
        "title": "Define Your Vision",
        "description": "Describe your idea, vibe, or plot \u2014 just a few phrases are enough"
      },
      {
        "title": "AI Generates the Scene",
        "description": "Multi-agent system creates script, frames, and characters"
      },
      {
        "title": "Refine and Finalize",
        "description": "Adjust the style, export your video, and share it with the world"
      }
    ]
  },
  "useCases": {
    "section_title": "Made for Creators, Businesses, Musicians & Teams",
    "section_description": "Find the perfect use case for SuperDuperAI to meet your needs.",
    "categories": {
      "ai-video": "Content Creators",
      "business": "Small Businesses",
      "creative": "Musicians & Artists",
      "teams": "Agencies & Teams",
      "social": "Social Media"
    }
  },
  "cta": {
    "title": "Ready to create your next video sensation?",
    "description": "Join SuperDuperAI and start creating amazing videos right now.",
    "button": "Start Creating for Free",
    "note": "No credit card required"
  },
  "navbar": {
    "home": "Home",
    "about": "About",
    "pricing": "Pricing",
    "terms": "Terms",
    "privacy": "Privacy",
    "blog": "Blog",
    "tools": "Tools",
    "start": "Start For Free",
    "menu": "Menu",
    "close_menu": "Close menu",
    "open_menu": "Open menu"
  },
  "ui": {
    "faq": "FAQ",
    "approved_by": "Approved by",
    "look": "Look!",
    "show_more": "Show more",
    "collapse": "Collapse",
    "no_results": "No results",
    "loading": "Loading...",
    "success": "Success!",
    "error": "Error",
    "try_again": "Try again",
    "empty": "Empty",
    "nothing_found": "Nothing found",
    "get_started": "Get Started"
  },
  "pricing": {
    "banner_title": "Try SuperDuperAI with 100 Free Credits!",
    "banner_desc": "New users get 100 credits completely free - enough to create multiple projects and explore almost all our features. Test the power of AI creativity with no commitment.",
    "banner_cta": "Start Creating Now",
    "without_package": "Without a Package",
    "with_power_package": "With a Power Package",
    "base_name": "BASE - 100 credits",
    "pro_name": "PRO - 1000 credits",
    "base_projects": "5-10 projects",
    "pro_projects": "20-50 projects",
    "save_50": "save 50%",
    "free_features": [
      "100 free credits per month",
      "Access to basic editing tools only",
      "Limited animation and voiceover options",
      "Videos with watermarks"
    ],
    "base_features": [
      "Full access to all editing tools",
      "Unlimited creation",
      "Download finished videos without watermarks",
      "Personal manager to assist with your projects",
      "Exclusive training sessions to boost your skills"
    ],
    "pro_features": [
      "Full access to all editing tools",
      "Unlimited creation",
      "Download finished videos without watermarks",
      "Personal manager to assist with your projects",
      "Exclusive training sessions to boost your skills"
    ],
    "start": "Start Creating",
    "buy": "Buy"
  },
  "creative": {
    "title": "SuperDuperAI Creative Partnership Program",
    "desc": "We're looking for passionate content creators and artists! Join our program and receive 1000+ free credits, 1-on-1 support, and early access to new features. Perfect for creators with socially meaningful projects and innovative ideas.",
    "learn_more": "Learn More",
    "or": "or",
    "apply_email": "Apply via Email"
  },
  "privacy_policy": "Privacy policy",
  "veo3PromptGenerator": {
    "infoBanner": {
      "title": "Master VEO3 Video Generation",
      "description": "Learn professional prompting techniques and best practices for Google's most advanced AI video model."
    },
    "tabs": {
      "builder": "Prompt Builder",
      "enhance": "AI Enhancement",
      "history": "History"
    },
    "promptBuilder": {
      "scene": "Scene",
      "scenePlaceholder": "Describe the setting, environment, or location...",
      "style": "Style",
      "stylePlaceholder": "Artistic, photorealistic, cinematic, etc...",
      "camera": "Camera",
      "cameraPlaceholder": "Camera movement, angle, shot type...",
      "characters": "Characters",
      "addCharacter": "Add Character",
      "characterName": "Name",
      "characterDescription": "Description",
      "characterSpeech": "Speech/Dialogue",
      "removeCharacter": "Remove",
      "action": "Action",
      "actionPlaceholder": "What's happening in the scene...",
      "lighting": "Lighting",
      "lightingPlaceholder": "Natural, dramatic, soft, etc...",
      "mood": "Mood",
      "moodPlaceholder": "Emotional atmosphere, tone...",
      "language": "Language",
      "moodboard": "Moodboard",
      "moodboardEnabled": "Enable moodboard",
      "moodboardDescription": "Upload reference images to guide generation"
    },
    "promptPreview": {
      "title": "Generated Prompt",
      "copyButton": "Copy",
      "copied": "Copied!",
      "randomizeButton": "Randomize",
      "clearButton": "Clear All",
      "enhanceButton": "Enhance with AI"
    },
    "aiEnhancement": {
      "title": "AI Enhancement",
      "description": "Enhance your prompt with advanced AI techniques",
      "focusTypes": {
        "character": "Character Focus",
        "action": "Action Focus",
        "cinematic": "Cinematic Focus",
        "safe": "Safe Content"
      },
      "settings": {
        "title": "Enhancement Settings",
        "characterLimit": "Character Limit",
        "includeAudio": "Include Audio Description",
        "model": "AI Model"
      },
      "enhanceButton": "Enhance Prompt",
      "enhancing": "Enhancing...",
      "enhanceError": "Enhancement failed",
      "enhancementInfo": {
        "model": "Model",
        "length": "Length",
        "actualCharacters": "Actual Characters",
        "targetCharacters": "Target Characters"
      }
    },
    "promptHistory": {
      "title": "Prompt History",
      "empty": "No prompts in history yet",
      "loadButton": "Load",
      "clearButton": "Clear History",
      "columns": {
        "timestamp": "Date",
        "basicPrompt": "Basic Prompt",
        "enhancedPrompt": "Enhanced Prompt",
        "length": "Length",
        "model": "Model"
      }
    },
    "common": {
      "loading": "Loading...",
      "error": "Error",
      "success": "Success",
      "cancel": "Cancel",
      "save": "Save",
      "delete": "Delete",
      "edit": "Edit",
      "close": "Close"
    }
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
  }
};

// src/translation/dictionaries/super-landing/tr.ts
var tr = {
  "blog": {
    "page_title": "Blog"
  },
  "site": {
    "name": "SuperDuperAI"
  },
  "footer": {
    "pages": {
      "about": "Hakk\u0131m\u0131zda",
      "pricing": "Fiyatland\u0131rma",
      "terms": "\u015Eartlar ve Ko\u015Fullar",
      "privacy": "Gizlilik",
      "blog": "Blog",
      "demo": "Demo Rezervasyonu"
    },
    "company": "SuperDuperAI",
    "corp": "SuperDuperAi, Corp.",
    "address1": "57 Saulsbury Rd, Unit E #1333",
    "address2": "Dover, DE 19904",
    "phone": "+1 818 619 0966",
    "email": "info@superduperai.co",
    "copyright": "\xA9 {year} SuperDuperAi Corp. T\xFCm haklar\u0131 sakl\u0131d\u0131r.",
    "social": {
      "instagram": "SuperDuperAI'yi Instagram'da takip edin",
      "youtube": "SuperDuperAI YouTube kanal\u0131na abone olun",
      "telegram": "SuperDuperAI Telegram grubuna kat\u0131l\u0131n",
      "tiktok": "SuperDuperAI'yi TikTok'ta takip edin",
      "discord": "SuperDuperAI Discord sunucusuna kat\u0131l\u0131n",
      "linkedin": "SuperDuperAI ile LinkedIn'de ba\u011Flant\u0131 kurun"
    }
  },
  "marketing": {
    "pages": "Sayfalar",
    "tools": "AI Ara\xE7lar\u0131",
    "cases": "Kullan\u0131m Alanlar\u0131",
    "ai_tool_title": "SuperDuperAI'den AI arac\u0131",
    "ai_case_title": "SuperDuperAI'den Vaka \xC7al\u0131\u015Fmas\u0131",
    "view_all_tools": "T\xFCm Ara\xE7lar\u0131 G\xF6r\xFCnt\xFCle \u2192",
    "view_all_cases": "T\xFCm Kullan\u0131m Alanlar\u0131n\u0131 G\xF6r\xFCnt\xFCle \u2192"
  },
  "hero": {
    "title": "Vibes'lar\u0131 An\u0131nda Videoya D\xF6n\xFC\u015Ft\xFCr\xFCn",
    "description": "Beceri, ekipman veya b\xFCt\xE7e olmadan profesyonel video olu\u015Fturmak i\xE7in devrimci AI platformu. 10x daha h\u0131zl\u0131 ve ucuz.",
    "cta": "\xDCcretsiz Olarak Olu\u015Fturmaya Ba\u015Flay\u0131n"
  },
  "features": {
    "section_title": "SuperDuperAI'yi S\xFCper Yapan Nedir",
    "section_description": "Etkileyici video olu\u015Fturmak i\xE7in geli\u015Fmi\u015F \xF6zellikler ve teknolojiler",
    "list": [
      {
        "icon": "users",
        "title": "AI Haf\u0131zal\u0131 \xD6zel Karakterler",
        "description": "LoRA teknolojisi kullanan AI akt\xF6r veritaban\u0131n\u0131z. Videolar\u0131n\u0131z i\xE7in benzersiz karakterler olu\u015Fturun ve kaydedin."
      },
      {
        "icon": "image",
        "title": "Sinematik Kamera Kontrolleri",
        "description": "Pan, zoom, bullet-time \u2014 fiziksel kamera olmadan. Tek t\u0131kla profesyonel kamera hareketleri ekleyin."
      },
      {
        "icon": "settings",
        "title": "\xC7ok Ajanl\u0131 AI \u0130\u015F Ak\u0131\u015F\u0131",
        "description": "Her ajan\u0131n kendi i\u015Fini yapt\u0131\u011F\u0131 model. Senaryo, \xE7ekim, d\xFCzenleme ve ses i\xE7in uzmanla\u015Fm\u0131\u015F AI."
      },
      {
        "icon": "speed",
        "title": "H\u0131zl\u0131 ve Verimli",
        "description": "Fikir \u2192 video dakikalar i\xE7inde, saatler veya g\xFCnler de\u011Fil. \u0130\u015F ak\u0131\u015F\u0131n\u0131z\u0131 h\u0131zland\u0131r\u0131n ve daha fazla i\xE7erik olu\u015Fturun."
      },
      {
        "icon": "chart",
        "title": "Maliyet Tasarrufu",
        "description": "B\xFCt\xE7e dostu sinematografi. Ekip ve ekipman i\xE7in harcama yapmadan profesyonel video elde edin."
      },
      {
        "icon": "edit",
        "title": "Kolay D\xFCzenleme ve Entegrasyon",
        "description": "Storyboard, s\xFCr\xFCkle-b\u0131rak, TikTok/YouTube'a d\u0131\u015Fa aktarma. Videolar\u0131n\u0131z\u0131 h\u0131zl\u0131ca tamamlamak i\xE7in sezgisel aray\xFCz."
      }
    ]
  },
  "howItWorks": {
    "section_title": "Nas\u0131l \xC7al\u0131\u015F\u0131r",
    "section_description": "Videonuzu 3 kolay ad\u0131mda y\xF6netin \u2013 AI ajanlar\u0131 gerisini halleder.",
    "steps": [
      {
        "title": "Vizyonunuzu Tan\u0131mlay\u0131n",
        "description": "Fikrinizi, vibe'\u0131n\u0131z\u0131 veya plot'unuzu a\xE7\u0131klay\u0131n \u2014 sadece birka\xE7 c\xFCmle yeterli"
      },
      {
        "title": "AI Sahneyi Olu\u015Fturur",
        "description": "\xC7ok ajanl\u0131 sistem senaryo, kareler ve karakterler olu\u015Fturur"
      },
      {
        "title": "\u0130yile\u015Ftirin ve Sonland\u0131r\u0131n",
        "description": "Stili ayarlay\u0131n, videonuzu d\u0131\u015Fa aktar\u0131n ve d\xFCnyayla payla\u015F\u0131n"
      }
    ]
  },
  "useCases": {
    "section_title": "\u0130\xE7erik \xDCreticileri, \u0130\u015Fletmeler, M\xFCzisyenler ve Ekipler \u0130\xE7in Yap\u0131ld\u0131",
    "section_description": "\u0130htiya\xE7lar\u0131n\u0131z\u0131 kar\u015F\u0131lamak i\xE7in SuperDuperAI'nin m\xFCkemmel kullan\u0131m alan\u0131n\u0131 bulun.",
    "categories": {
      "ai-video": "\u0130\xE7erik \xDCreticileri",
      "business": "K\xFC\xE7\xFCk \u0130\u015Fletmeler",
      "creative": "M\xFCzisyenler ve Sanat\xE7\u0131lar",
      "teams": "Ajanslar ve Ekipler",
      "social": "Sosyal Medya"
    }
  },
  "cta": {
    "title": "Bir sonraki video sansasyonunuzu olu\u015Fturmaya haz\u0131r m\u0131s\u0131n\u0131z?",
    "description": "SuperDuperAI'ye kat\u0131l\u0131n ve \u015Fimdi harika videolar olu\u015Fturmaya ba\u015Flay\u0131n.",
    "button": "\xDCcretsiz Olarak Olu\u015Fturmaya Ba\u015Flay\u0131n",
    "note": "Kredi kart\u0131 gerekmez"
  },
  "navbar": {
    "home": "Ana Sayfa",
    "about": "Hakk\u0131m\u0131zda",
    "pricing": "Fiyatland\u0131rma",
    "terms": "\u015Eartlar",
    "privacy": "Gizlilik",
    "blog": "Blog",
    "tools": "Ara\xE7lar",
    "start": "\xDCcretsiz Ba\u015Flay\u0131n",
    "menu": "Men\xFC",
    "close_menu": "Men\xFCy\xFC kapat",
    "open_menu": "Men\xFCy\xFC a\xE7"
  },
  "ui": {
    "faq": "SSS",
    "approved_by": "Onaylayan",
    "look": "Bak\u0131n!",
    "show_more": "Daha fazla g\xF6ster",
    "collapse": "Daralt",
    "no_results": "Sonu\xE7 bulunamad\u0131",
    "loading": "Y\xFCkleniyor...",
    "success": "Ba\u015Far\u0131l\u0131!",
    "error": "Hata",
    "try_again": "Tekrar deneyin",
    "empty": "Bo\u015F",
    "nothing_found": "Hi\xE7bir \u015Fey bulunamad\u0131",
    "get_started": "Ba\u015Flay\u0131n"
  },
  "pricing": {
    "banner_title": "100 \xDCcretsiz Kredi ile SuperDuperAI'yi Deneyin!",
    "banner_desc": "Yeni kullan\u0131c\u0131lar tamamen \xFCcretsiz 100 kredi al\u0131r - birden fazla proje olu\u015Fturmak ve neredeyse t\xFCm \xF6zelliklerimizi ke\u015Ffetmek i\xE7in yeterli. Hi\xE7bir taahh\xFCt olmadan AI yarat\u0131c\u0131l\u0131\u011F\u0131n\u0131n g\xFCc\xFCn\xFC test edin.",
    "banner_cta": "\u015Eimdi Olu\u015Fturmaya Ba\u015Flay\u0131n",
    "without_package": "Paket Olmadan",
    "with_power_package": "Power Paketi ile",
    "base_name": "BASE - 100 kredi",
    "pro_name": "PRO - 1000 kredi",
    "base_projects": "5-10 proje",
    "pro_projects": "20-50 proje",
    "save_50": "%50 tasarruf",
    "free_features": [
      "Ayda 100 \xFCcretsiz kredi",
      "Sadece temel d\xFCzenleme ara\xE7lar\u0131na eri\u015Fim",
      "S\u0131n\u0131rl\u0131 animasyon ve seslendirme se\xE7enekleri",
      "Filigranl\u0131 videolar"
    ],
    "base_features": [
      "T\xFCm d\xFCzenleme ara\xE7lar\u0131na tam eri\u015Fim",
      "S\u0131n\u0131rs\u0131z yarat\u0131m",
      "Filigrans\u0131z bitmi\u015F videolar\u0131 indirin",
      "Projelerinizde size yard\u0131mc\u0131 olacak ki\u015Fisel y\xF6netici",
      "Becerilerinizi art\u0131racak \xF6zel e\u011Fitim seanslar\u0131"
    ],
    "pro_features": [
      "T\xFCm d\xFCzenleme ara\xE7lar\u0131na tam eri\u015Fim",
      "S\u0131n\u0131rs\u0131z yarat\u0131m",
      "Filigrans\u0131z bitmi\u015F videolar\u0131 indirin",
      "Projelerinizde size yard\u0131mc\u0131 olacak ki\u015Fisel y\xF6netici",
      "Becerilerinizi art\u0131racak \xF6zel e\u011Fitim seanslar\u0131"
    ],
    "start": "Olu\u015Fturmaya Ba\u015Flay\u0131n",
    "buy": "Sat\u0131n Al"
  },
  "creative": {
    "title": "SuperDuperAI Yarat\u0131c\u0131 Ortakl\u0131k Program\u0131",
    "desc": "Tutkulu i\xE7erik \xFCreticileri ve sanat\xE7\u0131lar ar\u0131yoruz! Program\u0131m\u0131za kat\u0131l\u0131n ve 1000+ \xFCcretsiz kredi, birebir destek ve yeni \xF6zelliklere erken eri\u015Fim al\u0131n. Sosyal olarak anlaml\u0131 projeler ve yenilik\xE7i fikirleri olan yarat\u0131c\u0131lar i\xE7in m\xFCkemmel.",
    "learn_more": "Daha Fazla Bilgi",
    "or": "veya",
    "apply_email": "E-posta ile Ba\u015Fvurun"
  },
  "privacy_policy": "Gizlilik politikas\u0131",
  "veo3PromptGenerator": {
    "infoBanner": {
      "title": "VEO3 Video \xDCretiminde Uzmanla\u015F\u0131n",
      "description": "Google'\u0131n en geli\u015Fmi\u015F AI video modeli i\xE7in profesyonel prompt tekniklerini ve en iyi uygulamalar\u0131 \xF6\u011Frenin."
    },
    "tabs": {
      "builder": "Prompt Olu\u015Fturucu",
      "enhance": "AI Geli\u015Ftirme",
      "history": "Ge\xE7mi\u015F"
    },
    "promptBuilder": {
      "scene": "Sahne",
      "scenePlaceholder": "Ortam\u0131, \xE7evreyi veya konumu a\xE7\u0131klay\u0131n...",
      "style": "Stil",
      "stylePlaceholder": "Sanatsal, foto-ger\xE7ek\xE7i, sinematik, vb...",
      "camera": "Kamera",
      "cameraPlaceholder": "Kamera hareketi, a\xE7\u0131, \xE7ekim t\xFCr\xFC...",
      "characters": "Karakterler",
      "addCharacter": "Karakter Ekle",
      "characterName": "\u0130sim",
      "characterDescription": "A\xE7\u0131klama",
      "characterSpeech": "Konu\u015Fma/Diyalog",
      "removeCharacter": "Kald\u0131r",
      "action": "Aksiyon",
      "actionPlaceholder": "Sahnede ne oluyor...",
      "lighting": "Ayd\u0131nlatma",
      "lightingPlaceholder": "Do\u011Fal, dramatik, yumu\u015Fak, vb...",
      "mood": "Ruh Hali",
      "moodPlaceholder": "Duygusal atmosfer, ton...",
      "language": "Dil",
      "moodboard": "Moodboard",
      "moodboardEnabled": "Moodboard'\u0131 etkinle\u015Ftir",
      "moodboardDescription": "\xDCretimi y\xF6nlendirmek i\xE7in referans g\xF6rseller y\xFCkleyin"
    },
    "promptPreview": {
      "title": "Olu\u015Fturulan Prompt",
      "copyButton": "Kopyala",
      "copied": "Kopyaland\u0131!",
      "randomizeButton": "Rastgelele\u015Ftir",
      "clearButton": "T\xFCm\xFCn\xFC Temizle",
      "enhanceButton": "AI ile Geli\u015Ftir"
    },
    "aiEnhancement": {
      "title": "AI Geli\u015Ftirme",
      "description": "Prompt'unuzu geli\u015Fmi\u015F AI teknikleriyle geli\u015Ftirin",
      "focusTypes": {
        "character": "Karakter Odakl\u0131",
        "action": "Aksiyon Odakl\u0131",
        "cinematic": "Sinematik Odakl\u0131",
        "safe": "G\xFCvenli \u0130\xE7erik"
      },
      "settings": {
        "title": "Geli\u015Ftirme Ayarlar\u0131",
        "characterLimit": "Karakter Limiti",
        "includeAudio": "Ses A\xE7\u0131klamas\u0131n\u0131 Dahil Et",
        "model": "AI Modeli"
      },
      "enhanceButton": "Prompt'u Geli\u015Ftir",
      "enhancing": "Geli\u015Ftiriliyor...",
      "enhanceError": "Geli\u015Ftirme ba\u015Far\u0131s\u0131z",
      "enhancementInfo": {
        "model": "Model",
        "length": "Uzunluk",
        "actualCharacters": "Ger\xE7ek Karakterler",
        "targetCharacters": "Hedef Karakterler"
      }
    },
    "promptHistory": {
      "title": "Prompt Ge\xE7mi\u015Fi",
      "empty": "Hen\xFCz ge\xE7mi\u015Fte prompt yok",
      "loadButton": "Y\xFCkle",
      "clearButton": "Ge\xE7mi\u015Fi Temizle",
      "columns": {
        "timestamp": "Tarih",
        "basicPrompt": "Temel Prompt",
        "enhancedPrompt": "Geli\u015Ftirilmi\u015F Prompt",
        "length": "Uzunluk",
        "model": "Model"
      }
    },
    "common": {
      "loading": "Y\xFCkleniyor...",
      "error": "Hata",
      "success": "Ba\u015Far\u0131l\u0131",
      "cancel": "\u0130ptal",
      "save": "Kaydet",
      "delete": "Sil",
      "edit": "D\xFCzenle",
      "close": "Kapat"
    }
  }
};

// src/translation/dictionaries/super-landing/es.ts
var es = {
  "blog": {
    "page_title": "Blog"
  },
  "site": {
    "name": "SuperDuperAI"
  },
  "footer": {
    "pages": {
      "about": "Acerca de",
      "pricing": "Precios",
      "terms": "T\xE9rminos y Condiciones",
      "privacy": "Privacidad",
      "blog": "Blog",
      "demo": "Reservar Demo"
    },
    "company": "SuperDuperAI",
    "corp": "SuperDuperAi, Corp.",
    "address1": "57 Saulsbury Rd, Unit E #1333",
    "address2": "Dover, DE 19904",
    "phone": "+1 818 619 0966",
    "email": "info@superduperai.co",
    "copyright": "\xA9 {year} SuperDuperAi Corp. Todos los derechos reservados.",
    "social": {
      "instagram": "Sigue a SuperDuperAI en Instagram",
      "youtube": "Suscr\xEDbete a SuperDuperAI en YouTube",
      "telegram": "\xDAnete a SuperDuperAI en Telegram",
      "tiktok": "Sigue a SuperDuperAI en TikTok",
      "discord": "\xDAnete al servidor Discord de SuperDuperAI",
      "linkedin": "Conecta con SuperDuperAI en LinkedIn"
    }
  },
  "marketing": {
    "pages": "P\xE1ginas",
    "tools": "Herramientas AI",
    "cases": "Casos de Uso",
    "ai_tool_title": "Herramienta AI de SuperDuperAI",
    "ai_case_title": "Estudio de Caso de SuperDuperAI",
    "view_all_tools": "Ver Todas las Herramientas \u2192",
    "view_all_cases": "Ver Todos los Casos de Uso \u2192"
  },
  "hero": {
    "title": "Convierte Vibes en Videos Instant\xE1neamente",
    "description": "Plataforma AI revolucionaria para crear videos profesionales sin habilidades, equipamiento o presupuesto. 10x m\xE1s r\xE1pido y barato.",
    "cta": "Comenzar a Crear Gratis"
  },
  "features": {
    "section_title": "Qu\xE9 Hace que SuperDuperAI sea S\xFAper",
    "section_description": "Caracter\xEDsticas y tecnolog\xEDas avanzadas para crear videos impresionantes",
    "list": [
      {
        "icon": "users",
        "title": "Personajes Personalizados con Memoria AI",
        "description": "Tu base de datos de actores AI usando tecnolog\xEDa LoRA. Crea y guarda personajes \xFAnicos para tus videos."
      },
      {
        "icon": "image",
        "title": "Controles de C\xE1mara Cinematogr\xE1ficos",
        "description": "Panes, zooms, bullet-time \u2014 sin c\xE1maras f\xEDsicas. A\xF1ade movimientos profesionales de c\xE1mara con un clic."
      },
      {
        "icon": "settings",
        "title": "Flujo de Trabajo AI Multi-Agente",
        "description": "Un modelo donde cada agente hace su trabajo. AI especializado para gui\xF3n, filmaci\xF3n, edici\xF3n y sonido."
      },
      {
        "icon": "speed",
        "title": "R\xE1pido y Eficiente",
        "description": "Idea \u2192 video en minutos, no horas o d\xEDas. Acelera tu flujo de trabajo y crea m\xE1s contenido."
      },
      {
        "icon": "chart",
        "title": "Ahorro de Costos",
        "description": "Cinematograf\xEDa con presupuesto. Obt\xE9n video profesional sin gastar en equipo y equipamiento."
      },
      {
        "icon": "edit",
        "title": "Edici\xF3n e Integraci\xF3n F\xE1cil",
        "description": "Storyboard, arrastrar y soltar, exportar a TikTok/YouTube. Interfaz intuitiva para finalizar r\xE1pidamente tu video."
      }
    ]
  },
  "howItWorks": {
    "section_title": "C\xF3mo Funciona",
    "section_description": "Dirige tu video en 3 pasos f\xE1ciles \u2013 los agentes AI se encargan del resto.",
    "steps": [
      {
        "title": "Define tu Visi\xF3n",
        "description": "Describe tu idea, vibe o trama \u2014 solo unas pocas frases son suficientes"
      },
      {
        "title": "AI Genera la Escena",
        "description": "Sistema multi-agente crea gui\xF3n, frames y personajes"
      },
      {
        "title": "Refina y Finaliza",
        "description": "Ajusta el estilo, exporta tu video y comp\xE1rtelo con el mundo"
      }
    ]
  },
  "useCases": {
    "section_title": "Hecho para Creadores, Negocios, M\xFAsicos y Equipos",
    "section_description": "Encuentra el caso de uso perfecto de SuperDuperAI para tus necesidades.",
    "categories": {
      "ai-video": "Creadores de Contenido",
      "business": "Peque\xF1os Negocios",
      "creative": "M\xFAsicos y Artistas",
      "teams": "Agencias y Equipos",
      "social": "Redes Sociales"
    }
  },
  "cta": {
    "title": "\xBFListo para crear tu pr\xF3xima sensaci\xF3n de video?",
    "description": "\xDAnete a SuperDuperAI y comienza a crear videos incre\xEDbles ahora mismo.",
    "button": "Comenzar a Crear Gratis",
    "note": "Sin tarjeta de cr\xE9dito requerida"
  },
  "navbar": {
    "home": "Inicio",
    "about": "Acerca de",
    "pricing": "Precios",
    "terms": "T\xE9rminos",
    "privacy": "Privacidad",
    "blog": "Blog",
    "tools": "Herramientas",
    "start": "Comenzar Gratis",
    "menu": "Men\xFA",
    "close_menu": "Cerrar men\xFA",
    "open_menu": "Abrir men\xFA"
  },
  "ui": {
    "faq": "FAQ",
    "approved_by": "Aprobado por",
    "look": "\xA1Mira!",
    "show_more": "Mostrar m\xE1s",
    "collapse": "Colapsar",
    "no_results": "Sin resultados",
    "loading": "Cargando...",
    "success": "\xA1\xC9xito!",
    "error": "Error",
    "try_again": "Intentar de nuevo",
    "empty": "Vac\xEDo",
    "nothing_found": "Nada encontrado",
    "get_started": "Comenzar"
  },
  "pricing": {
    "banner_title": "\xA1Prueba SuperDuperAI con 100 Cr\xE9ditos Gratis!",
    "banner_desc": "Los nuevos usuarios obtienen 100 cr\xE9ditos completamente gratis - suficientes para crear m\xFAltiples proyectos y explorar casi todas nuestras caracter\xEDsticas. Prueba el poder de la creatividad AI sin compromisos.",
    "banner_cta": "Comenzar a Crear Ahora",
    "without_package": "Sin Paquete",
    "with_power_package": "Con Paquete Power",
    "base_name": "BASE - 100 cr\xE9ditos",
    "pro_name": "PRO - 1000 cr\xE9ditos",
    "base_projects": "5-10 proyectos",
    "pro_projects": "20-50 proyectos",
    "save_50": "ahorrar 50%",
    "free_features": [
      "100 cr\xE9ditos gratis por mes",
      "Acceso solo a herramientas b\xE1sicas de edici\xF3n",
      "Opciones limitadas de animaci\xF3n y doblaje",
      "Videos con marcas de agua"
    ],
    "base_features": [
      "Acceso completo a todas las herramientas de edici\xF3n",
      "Creaci\xF3n ilimitada",
      "Descarga videos terminados sin marcas de agua",
      "Gerente personal para ayudarte con tus proyectos",
      "Sesiones de entrenamiento exclusivas para mejorar tus habilidades"
    ],
    "pro_features": [
      "Acceso completo a todas las herramientas de edici\xF3n",
      "Creaci\xF3n ilimitada",
      "Descarga videos terminados sin marcas de agua",
      "Gerente personal para ayudarte con tus proyectos",
      "Sesiones de entrenamiento exclusivas para mejorar tus habilidades"
    ],
    "start": "Comenzar a Crear",
    "buy": "Comprar"
  },
  "creative": {
    "title": "Programa de Asociaci\xF3n Creativa SuperDuperAI",
    "desc": "\xA1Buscamos creadores de contenido y artistas apasionados! \xDAnete a nuestro programa y recibe 1000+ cr\xE9ditos gratis, apoyo 1-a-1 y acceso temprano a nuevas caracter\xEDsticas. Perfecto para creadores con proyectos socialmente significativos e ideas innovadoras.",
    "learn_more": "Saber M\xE1s",
    "or": "o",
    "apply_email": "Aplicar por Email"
  },
  "privacy_policy": "Pol\xEDtica de privacidad",
  "veo3PromptGenerator": {
    "infoBanner": {
      "title": "Domina la Generaci\xF3n de Video VEO3",
      "description": "Aprende t\xE9cnicas profesionales de prompting y mejores pr\xE1cticas para el modelo de video AI m\xE1s avanzado de Google."
    },
    "tabs": {
      "builder": "Constructor de Prompts",
      "enhance": "Mejora AI",
      "history": "Historial"
    },
    "promptBuilder": {
      "scene": "Escena",
      "scenePlaceholder": "Describe el entorno, ambiente o ubicaci\xF3n...",
      "style": "Estilo",
      "stylePlaceholder": "Art\xEDstico, fotorrealista, cinematogr\xE1fico, etc...",
      "camera": "C\xE1mara",
      "cameraPlaceholder": "Movimiento de c\xE1mara, \xE1ngulo, tipo de toma...",
      "characters": "Personajes",
      "addCharacter": "A\xF1adir Personaje",
      "characterName": "Nombre",
      "characterDescription": "Descripci\xF3n",
      "characterSpeech": "Habla/Di\xE1logo",
      "removeCharacter": "Eliminar",
      "action": "Acci\xF3n",
      "actionPlaceholder": "\xBFQu\xE9 est\xE1 pasando en la escena...",
      "lighting": "Iluminaci\xF3n",
      "lightingPlaceholder": "Natural, dram\xE1tica, suave, etc...",
      "mood": "Estado de \xC1nimo",
      "moodPlaceholder": "Atm\xF3sfera emocional, tono...",
      "language": "Idioma",
      "moodboard": "Moodboard",
      "moodboardEnabled": "Habilitar moodboard",
      "moodboardDescription": "Sube im\xE1genes de referencia para guiar la generaci\xF3n"
    },
    "promptPreview": {
      "title": "Prompt Generado",
      "copyButton": "Copiar",
      "copied": "\xA1Copiado!",
      "randomizeButton": "Aleatorizar",
      "clearButton": "Limpiar Todo",
      "enhanceButton": "Mejorar con AI"
    },
    "aiEnhancement": {
      "title": "Mejora AI",
      "description": "Mejora tu prompt con t\xE9cnicas AI avanzadas",
      "focusTypes": {
        "character": "Enfoque en Personaje",
        "action": "Enfoque en Acci\xF3n",
        "cinematic": "Enfoque Cinematogr\xE1fico",
        "safe": "Contenido Seguro"
      },
      "settings": {
        "title": "Configuraci\xF3n de Mejora",
        "characterLimit": "L\xEDmite de Caracteres",
        "includeAudio": "Incluir Descripci\xF3n de Audio",
        "model": "Modelo AI"
      },
      "enhanceButton": "Mejorar Prompt",
      "enhancing": "Mejorando...",
      "enhanceError": "La mejora fall\xF3",
      "enhancementInfo": {
        "model": "Modelo",
        "length": "Longitud",
        "actualCharacters": "Caracteres Reales",
        "targetCharacters": "Caracteres Objetivo"
      }
    },
    "promptHistory": {
      "title": "Historial de Prompts",
      "empty": "A\xFAn no hay prompts en el historial",
      "loadButton": "Cargar",
      "clearButton": "Limpiar Historial",
      "columns": {
        "timestamp": "Fecha",
        "basicPrompt": "Prompt B\xE1sico",
        "enhancedPrompt": "Prompt Mejorado",
        "length": "Longitud",
        "model": "Modelo"
      }
    },
    "common": {
      "loading": "Cargando...",
      "error": "Error",
      "success": "\xC9xito",
      "cancel": "Cancelar",
      "save": "Guardar",
      "delete": "Eliminar",
      "edit": "Editar",
      "close": "Cerrar"
    }
  }
};

// src/translation/dictionaries/super-landing/hi.ts
var hi = {
  "blog": {
    "page_title": "\u092C\u094D\u0932\u0949\u0917"
  },
  "site": {
    "name": "SuperDuperAI"
  },
  "footer": {
    "pages": {
      "about": "\u0939\u092E\u093E\u0930\u0947 \u092C\u093E\u0930\u0947 \u092E\u0947\u0902",
      "pricing": "\u092E\u0942\u0932\u094D\u092F",
      "terms": "\u0928\u093F\u092F\u092E \u0914\u0930 \u0936\u0930\u094D\u0924\u0947\u0902",
      "privacy": "\u0917\u094B\u092A\u0928\u0940\u092F\u0924\u093E",
      "blog": "\u092C\u094D\u0932\u0949\u0917",
      "demo": "\u0921\u0947\u092E\u094B \u092C\u0941\u0915 \u0915\u0930\u0947\u0902"
    },
    "company": "SuperDuperAI",
    "corp": "SuperDuperAi, Corp.",
    "address1": "57 Saulsbury Rd, Unit E #1333",
    "address2": "Dover, DE 19904",
    "phone": "+1 818 619 0966",
    "email": "info@superduperai.co",
    "copyright": "\xA9 {year} SuperDuperAi Corp. \u0938\u0930\u094D\u0935\u093E\u0927\u093F\u0915\u093E\u0930 \u0938\u0941\u0930\u0915\u094D\u0937\u093F\u0924\u0964",
    "social": {
      "instagram": "Instagram \u092A\u0930 SuperDuperAI \u0915\u094B \u092B\u0949\u0932\u094B \u0915\u0930\u0947\u0902",
      "youtube": "YouTube \u092A\u0930 SuperDuperAI \u0915\u094B \u0938\u092C\u094D\u0938\u0915\u094D\u0930\u093E\u0907\u092C \u0915\u0930\u0947\u0902",
      "telegram": "Telegram \u092A\u0930 SuperDuperAI \u0938\u0947 \u091C\u0941\u0921\u093C\u0947\u0902",
      "tiktok": "TikTok \u092A\u0930 SuperDuperAI \u0915\u094B \u092B\u0949\u0932\u094B \u0915\u0930\u0947\u0902",
      "discord": "SuperDuperAI Discord \u0938\u0930\u094D\u0935\u0930 \u092E\u0947\u0902 \u0936\u093E\u092E\u093F\u0932 \u0939\u094B\u0902",
      "linkedin": "LinkedIn \u092A\u0930 SuperDuperAI \u0938\u0947 \u0915\u0928\u0947\u0915\u094D\u091F \u0915\u0930\u0947\u0902"
    }
  },
  "marketing": {
    "pages": "\u092A\u0947\u091C",
    "tools": "AI \u091F\u0942\u0932\u094D\u0938",
    "cases": "\u0909\u092A\u092F\u094B\u0917 \u0915\u0947 \u092E\u093E\u092E\u0932\u0947",
    "ai_tool_title": "SuperDuperAI \u0938\u0947 AI \u091F\u0942\u0932",
    "ai_case_title": "SuperDuperAI \u0938\u0947 \u0915\u0947\u0938 \u0938\u094D\u091F\u0921\u0940",
    "view_all_tools": "\u0938\u092D\u0940 \u091F\u0942\u0932 \u0926\u0947\u0916\u0947\u0902 \u2192",
    "view_all_cases": "\u0938\u092D\u0940 \u0909\u092A\u092F\u094B\u0917 \u0915\u0947 \u092E\u093E\u092E\u0932\u0947 \u0926\u0947\u0916\u0947\u0902 \u2192"
  },
  "hero": {
    "title": "\u0924\u0941\u0930\u0902\u0924 \u0935\u093E\u0907\u092C\u094D\u0938 \u0915\u094B \u0935\u0940\u0921\u093F\u092F\u094B \u092E\u0947\u0902 \u092C\u0926\u0932\u0947\u0902",
    "description": "\u0915\u094C\u0936\u0932, \u0909\u092A\u0915\u0930\u0923 \u092F\u093E \u092C\u091C\u091F \u0915\u0947 \u092C\u093F\u0928\u093E \u092A\u0947\u0936\u0947\u0935\u0930 \u0935\u0940\u0921\u093F\u092F\u094B \u092C\u0928\u093E\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0915\u094D\u0930\u093E\u0902\u0924\u093F\u0915\u093E\u0930\u0940 AI \u092A\u094D\u0932\u0947\u091F\u092B\u0949\u0930\u094D\u092E\u0964 10x \u0924\u0947\u091C \u0914\u0930 \u0938\u0938\u094D\u0924\u093E\u0964",
    "cta": "\u092E\u0941\u092B\u094D\u0924 \u092E\u0947\u0902 \u092C\u0928\u093E\u0928\u093E \u0936\u0941\u0930\u0942 \u0915\u0930\u0947\u0902"
  },
  "features": {
    "section_title": "\u0915\u094D\u092F\u093E SuperDuperAI \u0915\u094B \u0938\u0941\u092A\u0930 \u092C\u0928\u093E\u0924\u093E \u0939\u0948",
    "section_description": "\u0906\u0915\u0930\u094D\u0937\u0915 \u0935\u0940\u0921\u093F\u092F\u094B \u092C\u0928\u093E\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0909\u0928\u094D\u0928\u0924 \u0938\u0941\u0935\u093F\u0927\u093E\u090F\u0902 \u0914\u0930 \u0924\u0915\u0928\u0940\u0915\u0947\u0902",
    "list": [
      {
        "icon": "users",
        "title": "AI \u092E\u0947\u092E\u094B\u0930\u0940 \u0915\u0947 \u0938\u093E\u0925 \u0915\u0938\u094D\u091F\u092E \u0915\u0948\u0930\u0947\u0915\u094D\u091F\u0930",
        "description": "LoRA \u0924\u0915\u0928\u0940\u0915 \u0915\u093E \u0909\u092A\u092F\u094B\u0917 \u0915\u0930\u0928\u0947 \u0935\u093E\u0932\u093E \u0906\u092A\u0915\u093E AI \u090F\u0915\u094D\u091F\u0930 \u0921\u0947\u091F\u093E\u092C\u0947\u0938\u0964 \u0905\u092A\u0928\u0947 \u0935\u0940\u0921\u093F\u092F\u094B \u0915\u0947 \u0932\u093F\u090F \u0905\u0928\u0942\u0920\u0947 \u0915\u0948\u0930\u0947\u0915\u094D\u091F\u0930 \u092C\u0928\u093E\u090F\u0902 \u0914\u0930 \u0938\u0947\u0935 \u0915\u0930\u0947\u0902\u0964"
      },
      {
        "icon": "image",
        "title": "\u0938\u093F\u0928\u0947\u092E\u0948\u091F\u093F\u0915 \u0915\u0948\u092E\u0930\u093E \u0915\u0902\u091F\u094D\u0930\u094B\u0932",
        "description": "\u092A\u0948\u0928, \u091C\u093C\u0942\u092E, \u092C\u0941\u0932\u0947\u091F-\u091F\u093E\u0907\u092E \u2014 \u092D\u094C\u0924\u093F\u0915 \u0915\u0948\u092E\u0930\u0947 \u0915\u0947 \u092C\u093F\u0928\u093E\u0964 \u090F\u0915 \u0915\u094D\u0932\u093F\u0915 \u0938\u0947 \u092A\u0947\u0936\u0947\u0935\u0930 \u0915\u0948\u092E\u0930\u093E \u092E\u0942\u0935\u092E\u0947\u0902\u091F \u091C\u094B\u0921\u093C\u0947\u0902\u0964"
      },
      {
        "icon": "settings",
        "title": "\u092E\u0932\u094D\u091F\u0940-\u090F\u091C\u0947\u0902\u091F AI \u0935\u0930\u094D\u0915\u092B\u094D\u0932\u094B",
        "description": "\u090F\u0915 \u092E\u0949\u0921\u0932 \u091C\u0939\u093E\u0902 \u0939\u0930 \u090F\u091C\u0947\u0902\u091F \u0905\u092A\u0928\u093E \u0915\u093E\u092E \u0915\u0930\u0924\u093E \u0939\u0948\u0964 \u0938\u094D\u0915\u094D\u0930\u093F\u092A\u094D\u091F\u093F\u0902\u0917, \u092B\u093F\u0932\u094D\u092E\u093F\u0902\u0917, \u090F\u0921\u093F\u091F\u093F\u0902\u0917 \u0914\u0930 \u0938\u093E\u0909\u0902\u0921 \u0915\u0947 \u0932\u093F\u090F \u0935\u093F\u0936\u0947\u0937 AI\u0964"
      },
      {
        "icon": "speed",
        "title": "\u0924\u0947\u091C \u0914\u0930 \u0915\u0941\u0936\u0932",
        "description": "\u0906\u0907\u0921\u093F\u092F\u093E \u2192 \u0935\u0940\u0921\u093F\u092F\u094B \u092E\u093F\u0928\u091F\u094B\u0902 \u092E\u0947\u0902, \u0918\u0902\u091F\u094B\u0902 \u092F\u093E \u0926\u093F\u0928\u094B\u0902 \u092E\u0947\u0902 \u0928\u0939\u0940\u0902\u0964 \u0905\u092A\u0928\u093E \u0935\u0930\u094D\u0915\u092B\u094D\u0932\u094B \u0924\u0947\u091C \u0915\u0930\u0947\u0902 \u0914\u0930 \u0905\u0927\u093F\u0915 \u0915\u0902\u091F\u0947\u0902\u091F \u092C\u0928\u093E\u090F\u0902\u0964"
      },
      {
        "icon": "chart",
        "title": "\u0932\u093E\u0917\u0924 \u092C\u091A\u0924",
        "description": "\u092C\u091C\u091F \u092A\u0930 \u0938\u093F\u0928\u0947\u092E\u0948\u091F\u094B\u0917\u094D\u0930\u093E\u092B\u0940\u0964 \u0915\u094D\u0930\u0942 \u0914\u0930 \u0909\u092A\u0915\u0930\u0923 \u092A\u0930 \u0916\u0930\u094D\u091A \u0915\u093F\u090F \u092C\u093F\u0928\u093E \u092A\u0947\u0936\u0947\u0935\u0930 \u0935\u0940\u0921\u093F\u092F\u094B \u092A\u094D\u0930\u093E\u092A\u094D\u0924 \u0915\u0930\u0947\u0902\u0964"
      },
      {
        "icon": "edit",
        "title": "\u0906\u0938\u093E\u0928 \u090F\u0921\u093F\u091F\u093F\u0902\u0917 \u0914\u0930 \u0907\u0902\u091F\u0940\u0917\u094D\u0930\u0947\u0936\u0928",
        "description": "\u0938\u094D\u091F\u094B\u0930\u0940\u092C\u094B\u0930\u094D\u0921, \u0921\u094D\u0930\u0948\u0917-\u0921\u094D\u0930\u0949\u092A, TikTok/YouTube \u0915\u094B \u090F\u0915\u094D\u0938\u092A\u094B\u0930\u094D\u091F\u0964 \u0905\u092A\u0928\u0947 \u0935\u0940\u0921\u093F\u092F\u094B \u0915\u094B \u091C\u0932\u094D\u0926\u0940 \u0938\u0947 \u092B\u093E\u0907\u0928\u0932\u093E\u0907\u091C\u093C \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0938\u0939\u091C \u0907\u0902\u091F\u0930\u092B\u0947\u0938\u0964"
      }
    ]
  },
  "howItWorks": {
    "section_title": "\u092F\u0939 \u0915\u0948\u0938\u0947 \u0915\u093E\u092E \u0915\u0930\u0924\u093E \u0939\u0948",
    "section_description": "3 \u0906\u0938\u093E\u0928 \u091A\u0930\u0923\u094B\u0902 \u092E\u0947\u0902 \u0905\u092A\u0928\u093E \u0935\u0940\u0921\u093F\u092F\u094B \u0928\u093F\u0930\u094D\u0926\u0947\u0936\u093F\u0924 \u0915\u0930\u0947\u0902 \u2013 AI \u090F\u091C\u0947\u0902\u091F \u092C\u093E\u0915\u0940 \u0915\u093E \u0927\u094D\u092F\u093E\u0928 \u0930\u0916\u0924\u0947 \u0939\u0948\u0902\u0964",
    "steps": [
      {
        "title": "\u0905\u092A\u0928\u0940 \u0926\u0943\u0937\u094D\u091F\u093F \u0915\u094B \u092A\u0930\u093F\u092D\u093E\u0937\u093F\u0924 \u0915\u0930\u0947\u0902",
        "description": "\u0905\u092A\u0928\u0947 \u0906\u0907\u0921\u093F\u092F\u093E, \u0935\u093E\u0907\u092C \u092F\u093E \u092A\u094D\u0932\u0949\u091F \u0915\u093E \u0935\u0930\u094D\u0923\u0928 \u0915\u0930\u0947\u0902 \u2014 \u0915\u0941\u091B \u0935\u093E\u0915\u094D\u092F \u092A\u0930\u094D\u092F\u093E\u092A\u094D\u0924 \u0939\u0948\u0902"
      },
      {
        "title": "AI \u0926\u0943\u0936\u094D\u092F \u0909\u0924\u094D\u092A\u0928\u094D\u0928 \u0915\u0930\u0924\u093E \u0939\u0948",
        "description": "\u092E\u0932\u094D\u091F\u0940-\u090F\u091C\u0947\u0902\u091F \u0938\u093F\u0938\u094D\u091F\u092E \u0938\u094D\u0915\u094D\u0930\u093F\u092A\u094D\u091F, \u092B\u094D\u0930\u0947\u092E \u0914\u0930 \u0915\u0948\u0930\u0947\u0915\u094D\u091F\u0930 \u092C\u0928\u093E\u0924\u093E \u0939\u0948"
      },
      {
        "title": "\u092A\u0930\u093F\u0937\u094D\u0915\u0943\u0924 \u0914\u0930 \u0905\u0902\u0924\u093F\u092E \u0930\u0942\u092A \u0926\u0947\u0902",
        "description": "\u0938\u094D\u091F\u093E\u0907\u0932 \u0915\u094B \u0938\u092E\u093E\u092F\u094B\u091C\u093F\u0924 \u0915\u0930\u0947\u0902, \u0905\u092A\u0928\u093E \u0935\u0940\u0921\u093F\u092F\u094B \u090F\u0915\u094D\u0938\u092A\u094B\u0930\u094D\u091F \u0915\u0930\u0947\u0902 \u0914\u0930 \u0926\u0941\u0928\u093F\u092F\u093E \u0915\u0947 \u0938\u093E\u0925 \u0938\u093E\u091D\u093E \u0915\u0930\u0947\u0902"
      }
    ]
  },
  "useCases": {
    "section_title": "\u0915\u094D\u0930\u093F\u090F\u091F\u0930\u094D\u0938, \u0935\u094D\u092F\u0935\u0938\u093E\u092F\u094B\u0902, \u0938\u0902\u0917\u0940\u0924\u0915\u093E\u0930\u094B\u0902 \u0914\u0930 \u091F\u0940\u092E\u094B\u0902 \u0915\u0947 \u0932\u093F\u090F \u092C\u0928\u093E\u092F\u093E \u0917\u092F\u093E",
    "section_description": "\u0905\u092A\u0928\u0940 \u0906\u0935\u0936\u094D\u092F\u0915\u0924\u093E\u0913\u0902 \u0915\u094B \u092A\u0942\u0930\u093E \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F SuperDuperAI \u0915\u093E \u0938\u0939\u0940 \u0909\u092A\u092F\u094B\u0917 \u0915\u0947\u0938 \u0916\u094B\u091C\u0947\u0902\u0964",
    "categories": {
      "ai-video": "\u0915\u0902\u091F\u0947\u0902\u091F \u0915\u094D\u0930\u093F\u090F\u091F\u0930\u094D\u0938",
      "business": "\u091B\u094B\u091F\u0947 \u0935\u094D\u092F\u0935\u0938\u093E\u092F",
      "creative": "\u0938\u0902\u0917\u0940\u0924\u0915\u093E\u0930 \u0914\u0930 \u0915\u0932\u093E\u0915\u093E\u0930",
      "teams": "\u090F\u091C\u0947\u0902\u0938\u093F\u092F\u093E\u0902 \u0914\u0930 \u091F\u0940\u092E\u0947\u0902",
      "social": "\u0938\u094B\u0936\u0932 \u092E\u0940\u0921\u093F\u092F\u093E"
    }
  },
  "cta": {
    "title": "\u0905\u092A\u0928\u093E \u0905\u0917\u0932\u093E \u0935\u0940\u0921\u093F\u092F\u094B \u0938\u0928\u0938\u0928\u0940 \u092C\u0928\u093E\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0924\u0948\u092F\u093E\u0930 \u0939\u0948\u0902?",
    "description": "SuperDuperAI \u092E\u0947\u0902 \u0936\u093E\u092E\u093F\u0932 \u0939\u094B\u0902 \u0914\u0930 \u0905\u092D\u0940 \u0905\u0926\u094D\u092D\u0941\u0924 \u0935\u0940\u0921\u093F\u092F\u094B \u092C\u0928\u093E\u0928\u093E \u0936\u0941\u0930\u0942 \u0915\u0930\u0947\u0902\u0964",
    "button": "\u092E\u0941\u092B\u094D\u0924 \u092E\u0947\u0902 \u092C\u0928\u093E\u0928\u093E \u0936\u0941\u0930\u0942 \u0915\u0930\u0947\u0902",
    "note": "\u0915\u094D\u0930\u0947\u0921\u093F\u091F \u0915\u093E\u0930\u094D\u0921 \u0915\u0940 \u0906\u0935\u0936\u094D\u092F\u0915\u0924\u093E \u0928\u0939\u0940\u0902"
  },
  "navbar": {
    "home": "\u0939\u094B\u092E",
    "about": "\u0939\u092E\u093E\u0930\u0947 \u092C\u093E\u0930\u0947 \u092E\u0947\u0902",
    "pricing": "\u092E\u0942\u0932\u094D\u092F",
    "terms": "\u0928\u093F\u092F\u092E",
    "privacy": "\u0917\u094B\u092A\u0928\u0940\u092F\u0924\u093E",
    "blog": "\u092C\u094D\u0932\u0949\u0917",
    "tools": "\u091F\u0942\u0932\u094D\u0938",
    "start": "\u092E\u0941\u092B\u094D\u0924 \u092E\u0947\u0902 \u0936\u0941\u0930\u0942 \u0915\u0930\u0947\u0902",
    "menu": "\u092E\u0947\u0928\u0942",
    "close_menu": "\u092E\u0947\u0928\u0942 \u092C\u0902\u0926 \u0915\u0930\u0947\u0902",
    "open_menu": "\u092E\u0947\u0928\u0942 \u0916\u094B\u0932\u0947\u0902"
  },
  "ui": {
    "faq": "FAQ",
    "approved_by": "\u0926\u094D\u0935\u093E\u0930\u093E \u0905\u0928\u0941\u092E\u094B\u0926\u093F\u0924",
    "look": "\u0926\u0947\u0916\u094B!",
    "show_more": "\u0914\u0930 \u0926\u093F\u0916\u093E\u090F\u0902",
    "collapse": "\u0938\u0902\u0915\u0941\u091A\u093F\u0924 \u0915\u0930\u0947\u0902",
    "no_results": "\u0915\u094B\u0908 \u092A\u0930\u093F\u0923\u093E\u092E \u0928\u0939\u0940\u0902",
    "loading": "\u0932\u094B\u0921 \u0939\u094B \u0930\u0939\u093E \u0939\u0948...",
    "success": "\u0938\u092B\u0932!",
    "error": "\u0924\u094D\u0930\u0941\u091F\u093F",
    "try_again": "\u092B\u093F\u0930 \u0938\u0947 \u0915\u094B\u0936\u093F\u0936 \u0915\u0930\u0947\u0902",
    "empty": "\u0916\u093E\u0932\u0940",
    "nothing_found": "\u0915\u0941\u091B \u0928\u0939\u0940\u0902 \u092E\u093F\u0932\u093E",
    "get_started": "\u0936\u0941\u0930\u0942 \u0915\u0930\u0947\u0902"
  },
  "pricing": {
    "banner_title": "100 \u092E\u0941\u092B\u094D\u0924 \u0915\u094D\u0930\u0947\u0921\u093F\u091F \u0915\u0947 \u0938\u093E\u0925 SuperDuperAI \u0906\u091C\u093C\u092E\u093E\u090F\u0902!",
    "banner_desc": "\u0928\u090F \u0909\u092A\u092F\u094B\u0917\u0915\u0930\u094D\u0924\u093E\u0913\u0902 \u0915\u094B \u092A\u0942\u0930\u0940 \u0924\u0930\u0939 \u0938\u0947 \u092E\u0941\u092B\u094D\u0924 100 \u0915\u094D\u0930\u0947\u0921\u093F\u091F \u092E\u093F\u0932\u0924\u0947 \u0939\u0948\u0902 - \u0915\u0908 \u092A\u094D\u0930\u094B\u091C\u0947\u0915\u094D\u091F \u092C\u0928\u093E\u0928\u0947 \u0914\u0930 \u0939\u092E\u093E\u0930\u0940 \u0932\u0917\u092D\u0917 \u0938\u092D\u0940 \u0938\u0941\u0935\u093F\u0927\u093E\u0913\u0902 \u0915\u093E \u092A\u0924\u093E \u0932\u0917\u093E\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u092A\u0930\u094D\u092F\u093E\u092A\u094D\u0924\u0964 \u0915\u093F\u0938\u0940 \u092A\u094D\u0930\u0924\u093F\u092C\u0926\u094D\u0927\u0924\u093E \u0915\u0947 \u092C\u093F\u0928\u093E AI \u0930\u091A\u0928\u093E\u0924\u094D\u092E\u0915\u0924\u093E \u0915\u0940 \u0936\u0915\u094D\u0924\u093F \u0915\u093E \u092A\u0930\u0940\u0915\u094D\u0937\u0923 \u0915\u0930\u0947\u0902\u0964",
    "banner_cta": "\u0905\u092D\u0940 \u092C\u0928\u093E\u0928\u093E \u0936\u0941\u0930\u0942 \u0915\u0930\u0947\u0902",
    "without_package": "\u092A\u0948\u0915\u0947\u091C \u0915\u0947 \u092C\u093F\u0928\u093E",
    "with_power_package": "Power \u092A\u0948\u0915\u0947\u091C \u0915\u0947 \u0938\u093E\u0925",
    "base_name": "BASE - 100 \u0915\u094D\u0930\u0947\u0921\u093F\u091F",
    "pro_name": "PRO - 1000 \u0915\u094D\u0930\u0947\u0921\u093F\u091F",
    "base_projects": "5-10 \u092A\u094D\u0930\u094B\u091C\u0947\u0915\u094D\u091F",
    "pro_projects": "20-50 \u092A\u094D\u0930\u094B\u091C\u0947\u0915\u094D\u091F",
    "save_50": "50% \u092C\u091A\u093E\u090F\u0902",
    "free_features": [
      "\u092A\u094D\u0930\u0924\u093F \u092E\u093E\u0939 100 \u092E\u0941\u092B\u094D\u0924 \u0915\u094D\u0930\u0947\u0921\u093F\u091F",
      "\u0915\u0947\u0935\u0932 \u092C\u0941\u0928\u093F\u092F\u093E\u0926\u0940 \u090F\u0921\u093F\u091F\u093F\u0902\u0917 \u091F\u0942\u0932\u094D\u0938 \u0924\u0915 \u092A\u0939\u0941\u0902\u091A",
      "\u0938\u0940\u092E\u093F\u0924 \u090F\u0928\u0940\u092E\u0947\u0936\u0928 \u0914\u0930 \u0935\u0949\u0907\u0938\u0913\u0935\u0930 \u0935\u093F\u0915\u0932\u094D\u092A",
      "\u0935\u0949\u091F\u0930\u092E\u093E\u0930\u094D\u0915 \u0915\u0947 \u0938\u093E\u0925 \u0935\u0940\u0921\u093F\u092F\u094B"
    ],
    "base_features": [
      "\u0938\u092D\u0940 \u090F\u0921\u093F\u091F\u093F\u0902\u0917 \u091F\u0942\u0932\u094D\u0938 \u0924\u0915 \u092A\u0942\u0930\u0940 \u092A\u0939\u0941\u0902\u091A",
      "\u0905\u0938\u0940\u092E\u093F\u0924 \u0930\u091A\u0928\u093E",
      "\u0935\u0949\u091F\u0930\u092E\u093E\u0930\u094D\u0915 \u0915\u0947 \u092C\u093F\u0928\u093E \u0924\u0948\u092F\u093E\u0930 \u0935\u0940\u0921\u093F\u092F\u094B \u0921\u093E\u0909\u0928\u0932\u094B\u0921 \u0915\u0930\u0947\u0902",
      "\u0906\u092A\u0915\u0947 \u092A\u094D\u0930\u094B\u091C\u0947\u0915\u094D\u091F \u092E\u0947\u0902 \u092E\u0926\u0926 \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0935\u094D\u092F\u0915\u094D\u0924\u093F\u0917\u0924 \u092A\u094D\u0930\u092C\u0902\u0927\u0915",
      "\u0906\u092A\u0915\u0947 \u0915\u094C\u0936\u0932 \u0915\u094B \u092C\u0922\u093C\u093E\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0935\u093F\u0936\u0947\u0937 \u092A\u094D\u0930\u0936\u093F\u0915\u094D\u0937\u0923 \u0938\u0924\u094D\u0930"
    ],
    "pro_features": [
      "\u0938\u092D\u0940 \u090F\u0921\u093F\u091F\u093F\u0902\u0917 \u091F\u0942\u0932\u094D\u0938 \u0924\u0915 \u092A\u0942\u0930\u0940 \u092A\u0939\u0941\u0902\u091A",
      "\u0905\u0938\u0940\u092E\u093F\u0924 \u0930\u091A\u0928\u093E",
      "\u0935\u0949\u091F\u0930\u092E\u093E\u0930\u094D\u0915 \u0915\u0947 \u092C\u093F\u0928\u093E \u0924\u0948\u092F\u093E\u0930 \u0935\u0940\u0921\u093F\u092F\u094B \u0921\u093E\u0909\u0928\u0932\u094B\u0921 \u0915\u0930\u0947\u0902",
      "\u0906\u092A\u0915\u0947 \u092A\u094D\u0930\u094B\u091C\u0947\u0915\u094D\u091F \u092E\u0947\u0902 \u092E\u0926\u0926 \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0935\u094D\u092F\u0915\u094D\u0924\u093F\u0917\u0924 \u092A\u094D\u0930\u092C\u0902\u0927\u0915",
      "\u0906\u092A\u0915\u0947 \u0915\u094C\u0936\u0932 \u0915\u094B \u092C\u0922\u093C\u093E\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0935\u093F\u0936\u0947\u0937 \u092A\u094D\u0930\u0936\u093F\u0915\u094D\u0937\u0923 \u0938\u0924\u094D\u0930"
    ],
    "start": "\u092C\u0928\u093E\u0928\u093E \u0936\u0941\u0930\u0942 \u0915\u0930\u0947\u0902",
    "buy": "\u0916\u0930\u0940\u0926\u0947\u0902"
  },
  "creative": {
    "title": "SuperDuperAI \u0915\u094D\u0930\u093F\u090F\u091F\u093F\u0935 \u092A\u093E\u0930\u094D\u091F\u0928\u0930\u0936\u093F\u092A \u092A\u094D\u0930\u094B\u0917\u094D\u0930\u093E\u092E",
    "desc": "\u0939\u092E \u092D\u093E\u0935\u0941\u0915 \u0915\u0902\u091F\u0947\u0902\u091F \u0915\u094D\u0930\u093F\u090F\u091F\u0930\u094D\u0938 \u0914\u0930 \u0915\u0932\u093E\u0915\u093E\u0930\u094B\u0902 \u0915\u0940 \u0924\u0932\u093E\u0936 \u0915\u0930 \u0930\u0939\u0947 \u0939\u0948\u0902! \u0939\u092E\u093E\u0930\u0947 \u092A\u094D\u0930\u094B\u0917\u094D\u0930\u093E\u092E \u092E\u0947\u0902 \u0936\u093E\u092E\u093F\u0932 \u0939\u094B\u0902 \u0914\u0930 1000+ \u092E\u0941\u092B\u094D\u0924 \u0915\u094D\u0930\u0947\u0921\u093F\u091F, 1-\u0911\u0928-1 \u0938\u0939\u093E\u092F\u0924\u093E \u0914\u0930 \u0928\u0908 \u0938\u0941\u0935\u093F\u0927\u093E\u0913\u0902 \u0924\u0915 \u092A\u0939\u0941\u0902\u091A \u092A\u094D\u0930\u093E\u092A\u094D\u0924 \u0915\u0930\u0947\u0902\u0964 \u0938\u093E\u092E\u093E\u091C\u093F\u0915 \u0930\u0942\u092A \u0938\u0947 \u0938\u093E\u0930\u094D\u0925\u0915 \u092A\u094D\u0930\u094B\u091C\u0947\u0915\u094D\u091F \u0914\u0930 \u0928\u0935\u0940\u0928 \u0935\u093F\u091A\u093E\u0930\u094B\u0902 \u0935\u093E\u0932\u0947 \u0915\u094D\u0930\u093F\u090F\u091F\u0930\u094D\u0938 \u0915\u0947 \u0932\u093F\u090F \u092A\u0930\u092B\u0947\u0915\u094D\u091F\u0964",
    "learn_more": "\u0914\u0930 \u091C\u093E\u0928\u0947\u0902",
    "or": "\u092F\u093E",
    "apply_email": "\u0908\u092E\u0947\u0932 \u0915\u0947 \u092E\u093E\u0927\u094D\u092F\u092E \u0938\u0947 \u0906\u0935\u0947\u0926\u0928 \u0915\u0930\u0947\u0902"
  },
  "privacy_policy": "\u0917\u094B\u092A\u0928\u0940\u092F\u0924\u093E \u0928\u0940\u0924\u093F",
  "veo3PromptGenerator": {
    "infoBanner": {
      "title": "VEO3 \u0935\u0940\u0921\u093F\u092F\u094B \u091C\u0928\u0930\u0947\u0936\u0928 \u092E\u0947\u0902 \u092E\u0939\u093E\u0930\u0924 \u0939\u093E\u0938\u093F\u0932 \u0915\u0930\u0947\u0902",
      "description": "Google \u0915\u0947 \u0938\u092C\u0938\u0947 \u0909\u0928\u094D\u0928\u0924 AI \u0935\u0940\u0921\u093F\u092F\u094B \u092E\u0949\u0921\u0932 \u0915\u0947 \u0932\u093F\u090F \u092A\u0947\u0936\u0947\u0935\u0930 \u092A\u094D\u0930\u0949\u092E\u094D\u092A\u094D\u091F\u093F\u0902\u0917 \u0924\u0915\u0928\u0940\u0915\u094B\u0902 \u0914\u0930 \u0938\u0930\u094D\u0935\u094B\u0924\u094D\u0924\u092E \u092A\u094D\u0930\u0925\u093E\u0913\u0902 \u0915\u094B \u0938\u0940\u0916\u0947\u0902\u0964"
    },
    "tabs": {
      "builder": "\u092A\u094D\u0930\u0949\u092E\u094D\u092A\u094D\u091F \u092C\u093F\u0932\u094D\u0921\u0930",
      "enhance": "AI \u090F\u0928\u094D\u0939\u093E\u0902\u0938\u092E\u0947\u0902\u091F",
      "history": "\u0907\u0924\u093F\u0939\u093E\u0938"
    },
    "promptBuilder": {
      "scene": "\u0926\u0943\u0936\u094D\u092F",
      "scenePlaceholder": "\u0938\u0947\u091F\u093F\u0902\u0917, \u0935\u093E\u0924\u093E\u0935\u0930\u0923 \u092F\u093E \u0938\u094D\u0925\u093E\u0928 \u0915\u093E \u0935\u0930\u094D\u0923\u0928 \u0915\u0930\u0947\u0902...",
      "style": "\u0936\u0948\u0932\u0940",
      "stylePlaceholder": "\u0915\u0932\u093E\u0924\u094D\u092E\u0915, \u092B\u094B\u091F\u094B-\u092F\u0925\u093E\u0930\u094D\u0925\u0935\u093E\u0926\u0940, \u0938\u093F\u0928\u0947\u092E\u0948\u091F\u093F\u0915, \u0906\u0926\u093F...",
      "camera": "\u0915\u0948\u092E\u0930\u093E",
      "cameraPlaceholder": "\u0915\u0948\u092E\u0930\u093E \u092E\u0942\u0935\u092E\u0947\u0902\u091F, \u090F\u0902\u0917\u0932, \u0936\u0949\u091F \u091F\u093E\u0907\u092A...",
      "characters": "\u0915\u0948\u0930\u0947\u0915\u094D\u091F\u0930",
      "addCharacter": "\u0915\u0948\u0930\u0947\u0915\u094D\u091F\u0930 \u091C\u094B\u0921\u093C\u0947\u0902",
      "characterName": "\u0928\u093E\u092E",
      "characterDescription": "\u0935\u093F\u0935\u0930\u0923",
      "characterSpeech": "\u092D\u093E\u0937\u0923/\u0938\u0902\u0935\u093E\u0926",
      "removeCharacter": "\u0939\u091F\u093E\u090F\u0902",
      "action": "\u0915\u093E\u0930\u094D\u0930\u0935\u093E\u0908",
      "actionPlaceholder": "\u0926\u0943\u0936\u094D\u092F \u092E\u0947\u0902 \u0915\u094D\u092F\u093E \u0939\u094B \u0930\u0939\u093E \u0939\u0948...",
      "lighting": "\u092A\u094D\u0930\u0915\u093E\u0936 \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E",
      "lightingPlaceholder": "\u092A\u094D\u0930\u093E\u0915\u0943\u0924\u093F\u0915, \u0928\u093E\u091F\u0915\u0940\u092F, \u0928\u0930\u092E, \u0906\u0926\u093F...",
      "mood": "\u092E\u0942\u0921",
      "moodPlaceholder": "\u092D\u093E\u0935\u0928\u093E\u0924\u094D\u092E\u0915 \u0935\u093E\u0924\u093E\u0935\u0930\u0923, \u0938\u094D\u0935\u0930...",
      "language": "\u092D\u093E\u0937\u093E",
      "moodboard": "\u092E\u0942\u0921\u092C\u094B\u0930\u094D\u0921",
      "moodboardEnabled": "\u092E\u0942\u0921\u092C\u094B\u0930\u094D\u0921 \u0938\u0915\u094D\u0937\u092E \u0915\u0930\u0947\u0902",
      "moodboardDescription": "\u091C\u0928\u0930\u0947\u0936\u0928 \u0915\u094B \u0928\u093F\u0930\u094D\u0926\u0947\u0936\u093F\u0924 \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0938\u0902\u0926\u0930\u094D\u092D \u091B\u0935\u093F\u092F\u093E\u0902 \u0905\u092A\u0932\u094B\u0921 \u0915\u0930\u0947\u0902"
    },
    "promptPreview": {
      "title": "\u0909\u0924\u094D\u092A\u0928\u094D\u0928 \u092A\u094D\u0930\u0949\u092E\u094D\u092A\u094D\u091F",
      "copyButton": "\u0915\u0949\u092A\u0940 \u0915\u0930\u0947\u0902",
      "copied": "\u0915\u0949\u092A\u0940 \u0915\u093F\u092F\u093E \u0917\u092F\u093E!",
      "randomizeButton": "\u0930\u0948\u0902\u0921\u092E\u093E\u0907\u091C\u093C \u0915\u0930\u0947\u0902",
      "clearButton": "\u0938\u092C \u0915\u0941\u091B \u0938\u093E\u092B\u093C \u0915\u0930\u0947\u0902",
      "enhanceButton": "AI \u0915\u0947 \u0938\u093E\u0925 \u092C\u0922\u093C\u093E\u090F\u0902"
    },
    "aiEnhancement": {
      "title": "AI \u090F\u0928\u094D\u0939\u093E\u0902\u0938\u092E\u0947\u0902\u091F",
      "description": "\u0909\u0928\u094D\u0928\u0924 AI \u0924\u0915\u0928\u0940\u0915\u094B\u0902 \u0915\u0947 \u0938\u093E\u0925 \u0905\u092A\u0928\u0947 \u092A\u094D\u0930\u0949\u092E\u094D\u092A\u094D\u091F \u0915\u094B \u092C\u0922\u093C\u093E\u090F\u0902",
      "focusTypes": {
        "character": "\u0915\u0948\u0930\u0947\u0915\u094D\u091F\u0930 \u092B\u094B\u0915\u0938",
        "action": "\u0915\u093E\u0930\u094D\u0930\u0935\u093E\u0908 \u092B\u094B\u0915\u0938",
        "cinematic": "\u0938\u093F\u0928\u0947\u092E\u0948\u091F\u093F\u0915 \u092B\u094B\u0915\u0938",
        "safe": "\u0938\u0941\u0930\u0915\u094D\u0937\u093F\u0924 \u0938\u093E\u092E\u0917\u094D\u0930\u0940"
      },
      "settings": {
        "title": "\u090F\u0928\u094D\u0939\u093E\u0902\u0938\u092E\u0947\u0902\u091F \u0938\u0947\u091F\u093F\u0902\u0917\u094D\u0938",
        "characterLimit": "\u0915\u0948\u0930\u0947\u0915\u094D\u091F\u0930 \u0938\u0940\u092E\u093E",
        "includeAudio": "\u0911\u0921\u093F\u092F\u094B \u0935\u093F\u0935\u0930\u0923 \u0936\u093E\u092E\u093F\u0932 \u0915\u0930\u0947\u0902",
        "model": "AI \u092E\u0949\u0921\u0932"
      },
      "enhanceButton": "\u092A\u094D\u0930\u0949\u092E\u094D\u092A\u094D\u091F \u092C\u0922\u093C\u093E\u090F\u0902",
      "enhancing": "\u092C\u0922\u093C\u093E \u0930\u0939\u093E \u0939\u0948...",
      "enhanceError": "\u090F\u0928\u094D\u0939\u093E\u0902\u0938\u092E\u0947\u0902\u091F \u0935\u093F\u092B\u0932",
      "enhancementInfo": {
        "model": "\u092E\u0949\u0921\u0932",
        "length": "\u0932\u0902\u092C\u093E\u0908",
        "actualCharacters": "\u0935\u093E\u0938\u094D\u0924\u0935\u093F\u0915 \u0915\u0948\u0930\u0947\u0915\u094D\u091F\u0930",
        "targetCharacters": "\u0932\u0915\u094D\u0937\u094D\u092F \u0915\u0948\u0930\u0947\u0915\u094D\u091F\u0930"
      }
    },
    "promptHistory": {
      "title": "\u092A\u094D\u0930\u0949\u092E\u094D\u092A\u094D\u091F \u0907\u0924\u093F\u0939\u093E\u0938",
      "empty": "\u0905\u092D\u0940 \u0924\u0915 \u0907\u0924\u093F\u0939\u093E\u0938 \u092E\u0947\u0902 \u0915\u094B\u0908 \u092A\u094D\u0930\u0949\u092E\u094D\u092A\u094D\u091F \u0928\u0939\u0940\u0902",
      "loadButton": "\u0932\u094B\u0921 \u0915\u0930\u0947\u0902",
      "clearButton": "\u0907\u0924\u093F\u0939\u093E\u0938 \u0938\u093E\u092B\u093C \u0915\u0930\u0947\u0902",
      "columns": {
        "timestamp": "\u0924\u093F\u0925\u093F",
        "basicPrompt": "\u092C\u0941\u0928\u093F\u092F\u093E\u0926\u0940 \u092A\u094D\u0930\u0949\u092E\u094D\u092A\u094D\u091F",
        "enhancedPrompt": "\u092C\u0922\u093C\u093E\u092F\u093E \u0917\u092F\u093E \u092A\u094D\u0930\u0949\u092E\u094D\u092A\u094D\u091F",
        "length": "\u0932\u0902\u092C\u093E\u0908",
        "model": "\u092E\u0949\u0921\u0932"
      }
    },
    "common": {
      "loading": "\u0932\u094B\u0921 \u0939\u094B \u0930\u0939\u093E \u0939\u0948...",
      "error": "\u0924\u094D\u0930\u0941\u091F\u093F",
      "success": "\u0938\u092B\u0932",
      "cancel": "\u0930\u0926\u094D\u0926 \u0915\u0930\u0947\u0902",
      "save": "\u0938\u0939\u0947\u091C\u0947\u0902",
      "delete": "\u0939\u091F\u093E\u090F\u0902",
      "edit": "\u0938\u0902\u092A\u093E\u0926\u093F\u0924 \u0915\u0930\u0947\u0902",
      "close": "\u092C\u0902\u0926 \u0915\u0930\u0947\u0902"
    }
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

// src/translation/hooks.ts
import { useCallback, useMemo } from "react";

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
  const t = useCallback(
    (key, fallback) => {
      return getTranslation(dictionary, key, fallback);
    },
    [dictionary]
  );
  const tWithVars = useCallback(
    (key, variables = {}, fallback) => {
      return getTranslationWithInterpolation(dictionary, key, variables, fallback);
    },
    [dictionary]
  );
  const has = useCallback(
    (key) => {
      return hasTranslation(dictionary, key);
    },
    [dictionary]
  );
  const keys = useMemo(() => {
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
  const getDictionary = useCallback(() => {
    return {};
  }, [app, locale]);
  const dictionary = useMemo(() => getDictionary(), [getDictionary]);
  return useTranslations(dictionary);
}
function useLandingTranslations(locale) {
  return useAppTranslations("super-landing", locale);
}
function useChatbotTranslations(locale) {
  return useAppTranslations("super-chatbot", locale);
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
export {
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
  getCurrentMode,
  getCurrentPrices,
  getNestedValue,
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
};
//# sourceMappingURL=index.mjs.map