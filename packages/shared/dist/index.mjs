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
export {
  capitalizeFirst,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatDuration,
  formatFileSize,
  formatNumber,
  formatPercentage,
  formatRelativeTime,
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
};
//# sourceMappingURL=index.mjs.map