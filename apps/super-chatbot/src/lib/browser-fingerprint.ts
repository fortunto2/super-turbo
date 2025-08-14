"use client";

// Генерирует уникальный fingerprint браузера
export function generateBrowserFingerprint(): string {
  if (typeof window === "undefined") return "server-side";
  
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + "x" + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || "unknown",
    navigator.deviceMemory || "unknown",
    navigator.platform,
    navigator.cookieEnabled ? "cookies-on" : "cookies-off",
    navigator.doNotTrack || "unknown",
    window.innerWidth + "x" + window.innerHeight,
    navigator.maxTouchPoints || "0",
    navigator.vendor,
    navigator.product,
  ];

  // Создаем хеш из компонентов
  const fingerprint = components.join("|");
  
  // Простая хеш-функция
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return `guest-browser-${Math.abs(hash).toString(36)}`;
}

// Получает или создает постоянный ID гостевого пользователя
export function getOrCreateGuestId(): string {
  if (typeof window === "undefined") return "server-side";
  
  const STORAGE_KEY = "superduperai_guest_browser_id";
  
  try {
    // Пытаемся получить существующий ID
    let guestId = localStorage.getItem(STORAGE_KEY);
    
    if (!guestId) {
      // Если ID нет, создаем новый на основе fingerprint
      guestId = generateBrowserFingerprint();
      localStorage.setItem(STORAGE_KEY, guestId);
    }
    
    return guestId;
  } catch (error) {
    console.warn("Failed to get/create guest ID:", error);
    // Fallback к fingerprint без сохранения
    return generateBrowserFingerprint();
  }
}

// Получает существующий ID гостевого пользователя
export function getGuestId(): string | null {
  if (typeof window === "undefined") return null;
  
  const STORAGE_KEY = "superduperai_guest_browser_id";
  
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    console.warn("Failed to get guest ID:", error);
    return null;
  }
}
