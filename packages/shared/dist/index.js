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
var index_exports = {};
__export(index_exports, {
  CURRENT_PRICES: () => CURRENT_PRICES,
  STRIPE_PRICES: () => STRIPE_PRICES,
  StripePaymentButton: () => StripePaymentButton,
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
  useStripeConfig: () => useStripeConfig,
  useStripePrices: () => useStripePrices,
  validateObject: () => validateObject,
  validateRequired: () => validateRequired
});
module.exports = __toCommonJS(index_exports);

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

// src/payment/use-stripe-prices.ts
var import_react5 = require("react");
function useStripePrices(apiEndpoint = "/api/stripe-prices") {
  const [prices, setPrices] = (0, import_react5.useState)(null);
  const [mode, setMode] = (0, import_react5.useState)("test");
  const [loading, setLoading] = (0, import_react5.useState)(true);
  const [error, setError] = (0, import_react5.useState)(null);
  (0, import_react5.useEffect)(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch(apiEndpoint);
        const data = await response.json();
        if (data.success) {
          setPrices(data.prices);
          setMode(data.mode);
        } else {
          setError("Failed to fetch prices");
        }
      } catch (err) {
        setError("Network error");
        console.error("Error fetching Stripe prices:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrices();
  }, [apiEndpoint]);
  return { prices, mode, loading, error };
}
function useStripeConfig(apiEndpoint = "/api/stripe-prices") {
  const { prices, mode, loading, error } = useStripePrices(apiEndpoint);
  if (loading || error || !prices) {
    return null;
  }
  return { prices, mode };
}

// src/payment/stripe-payment-button.tsx
var import_react6 = require("react");
var import_ui = require("@turbo-super/ui");
var import_lucide_react = require("lucide-react");
var import_sonner = require("sonner");
var import_jsx_runtime = require("react/jsx-runtime");
function StripePaymentButton({
  prompt,
  onPaymentClick,
  toolSlug,
  toolTitle,
  variant = "video",
  creditAmount = 100,
  price = 1,
  apiEndpoint = "/api/stripe-prices",
  checkoutEndpoint = "/api/create-checkout",
  className,
  locale = "en",
  t
}) {
  const [isCreatingCheckout, setIsCreatingCheckout] = (0, import_react6.useState)(false);
  const { prices, mode, loading, error } = useStripePrices(apiEndpoint);
  const getTranslation = (key, params) => {
    if (!t) {
      const fallbackTranslations = {
        "stripe_payment.loading_payment_options": "Loading payment options...",
        "stripe_payment.failed_load_payment": "Failed to load payment options",
        "stripe_payment.top_up_balance": "Top Up Balance",
        "stripe_payment.generate_veo3_videos": "Generate VEO3 Videos",
        "stripe_payment.top_up_balance_desc": `Top up your balance with ${creditAmount} credits for using AI tools`,
        "stripe_payment.generate_video_desc": "Your prompt is ready! Choose a plan to generate professional AI videos with Google VEO3.",
        "stripe_payment.top_up_credits": `Top up ${creditAmount} credits`,
        "stripe_payment.generate_video": "Generate Video",
        "stripe_payment.get_credits_desc": `Get ${creditAmount} credits for generating images, videos and scripts`,
        "stripe_payment.generate_video_desc_short": "Generate 1 high-quality AI video with your custom prompt",
        "stripe_payment.creating_payment": "Creating Payment...",
        "stripe_payment.top_up_for": `Top up for $${price.toFixed(2)}`,
        "stripe_payment.generate_for": `Generate Video for $${price.toFixed(2)}`,
        "stripe_payment.instant_access": "\u2713 Instant access \u2022 \u2713 No subscription \u2022 \u2713 Secure Stripe payment",
        "stripe_payment.test_mode": "\u{1F9EA} Test mode - Use test card 4242 4242 4242 4242",
        "stripe_payment.generate_prompt_first": "Please generate a prompt first",
        "stripe_payment.prices_not_loaded": "Prices not loaded yet, please try again",
        "stripe_payment.failed_create_checkout": "Failed to create checkout session"
      };
      return fallbackTranslations[key] || key;
    }
    let translation = t(key);
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(`{${param}}`, String(value));
      });
    }
    return translation;
  };
  const handlePayment = async () => {
    if (variant === "video" && !(prompt == null ? void 0 : prompt.trim())) {
      import_sonner.toast.error(getTranslation("stripe_payment.generate_prompt_first"));
      return;
    }
    if (!prices) {
      import_sonner.toast.error(getTranslation("stripe_payment.prices_not_loaded"));
      return;
    }
    setIsCreatingCheckout(true);
    onPaymentClick == null ? void 0 : onPaymentClick();
    try {
      const response = await fetch(checkoutEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          priceId: prices.single,
          quantity: 1,
          prompt: prompt == null ? void 0 : prompt.trim(),
          toolSlug,
          toolTitle,
          creditAmount: variant === "credits" ? creditAmount : void 0
        })
      });
      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }
      const { url } = await response.json();
      window.location.href = url;
    } catch (error2) {
      console.error("\u274C Checkout creation failed:", error2);
      import_sonner.toast.error(getTranslation("stripe_payment.failed_create_checkout"));
    } finally {
      setIsCreatingCheckout(false);
    }
  };
  if (variant === "video" && !(prompt == null ? void 0 : prompt.trim())) {
    return null;
  }
  if (loading) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_ui.Card,
      {
        className: `border-2 border-purple-500/50 bg-gradient-to-r from-purple-50/80 to-blue-50/80 dark:from-purple-950/30 dark:to-blue-950/30 dark:border-purple-400/30 ${className}`,
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_ui.CardContent, { className: "flex items-center justify-center py-8", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Loader2, { className: "size-6 animate-spin mr-2" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: getTranslation("stripe_payment.loading_payment_options") })
        ] })
      }
    );
  }
  if (error || !prices) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_ui.Card,
      {
        className: `border-2 border-red-500/50 bg-gradient-to-r from-red-50/80 to-orange-50/80 dark:from-red-950/30 dark:to-orange-950/30 dark:border-red-400/30 ${className}`,
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ui.CardContent, { className: "flex items-center justify-center py-8", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-red-600 dark:text-red-400", children: error || getTranslation("stripe_payment.failed_load_payment") }) })
      }
    );
  }
  const isCreditsVariant = variant === "credits";
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    import_ui.Card,
    {
      className: `border-2 border-purple-500/50 bg-gradient-to-r from-purple-50/80 to-blue-50/80 dark:from-purple-950/30 dark:to-blue-950/30 dark:border-purple-400/30 ${className}`,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_ui.CardHeader, { className: "pb-3", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_ui.CardTitle, { className: "flex items-center gap-2 text-lg", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Zap, { className: "size-5 text-yellow-500 dark:text-yellow-400" }),
            isCreditsVariant ? getTranslation("stripe_payment.top_up_balance") : getTranslation("stripe_payment.generate_veo3_videos")
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-sm text-muted-foreground", children: isCreditsVariant ? getTranslation("stripe_payment.top_up_balance_desc", {
            amount: creditAmount
          }) : getTranslation("stripe_payment.generate_video_desc") })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_ui.CardContent, { className: "space-y-3", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "max-w-md mx-auto", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "p-6 border-2 border-blue-200 dark:border-blue-700/50 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors text-center", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center justify-center gap-2 mb-3", children: [
              isCreditsVariant ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.CreditCard, { className: "size-5 text-blue-500 dark:text-blue-400" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Video, { className: "size-5 text-blue-500 dark:text-blue-400" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "font-semibold text-lg", children: isCreditsVariant ? getTranslation("stripe_payment.top_up_credits", {
                amount: creditAmount
              }) : getTranslation("stripe_payment.generate_video") })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mb-4", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
              import_ui.Badge,
              {
                variant: "outline",
                className: "bg-blue-600 dark:bg-blue-500 text-white text-lg px-4 py-1",
                children: [
                  "$",
                  price.toFixed(2)
                ]
              }
            ) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-sm text-muted-foreground mb-4", children: isCreditsVariant ? getTranslation("stripe_payment.get_credits_desc", {
              amount: creditAmount
            }) : getTranslation("stripe_payment.generate_video_desc_short") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_ui.Button,
              {
                onClick: handlePayment,
                className: "w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white",
                size: "lg",
                disabled: isCreatingCheckout,
                children: isCreatingCheckout ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Loader2, { className: "size-5 mr-2 animate-spin" }),
                  getTranslation("stripe_payment.creating_payment")
                ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.ExternalLink, { className: "size-5 mr-2" }),
                  isCreditsVariant ? getTranslation("stripe_payment.top_up_for", {
                    price: price.toFixed(2)
                  }) : getTranslation("stripe_payment.generate_for", {
                    price: price.toFixed(2)
                  })
                ] })
              }
            )
          ] }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "text-xs text-muted-foreground text-center pt-2 border-t", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: getTranslation("stripe_payment.instant_access") }),
            mode === "test" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-yellow-600 dark:text-yellow-400 mt-1", children: getTranslation("stripe_payment.test_mode") })
          ] })
        ] })
      ]
    }
  );
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CURRENT_PRICES,
  STRIPE_PRICES,
  StripePaymentButton,
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
  useStripeConfig,
  useStripePrices,
  validateObject,
  validateRequired
});
//# sourceMappingURL=index.js.map