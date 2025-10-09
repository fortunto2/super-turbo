'use client';

const GUEST_SESSION_KEY = 'superduperai_guest_session';

/**
 * Генерирует уникальный sessionId для гостевого пользователя
 */
export function generateGuestSessionId(): string {
  return `guest-session-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Получает sessionId из localStorage
 */
export function getGuestSessionId(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    return localStorage.getItem(GUEST_SESSION_KEY);
  } catch (error) {
    console.warn('Failed to get guest session ID from localStorage:', error);
    return null;
  }
}

/**
 * Сохраняет sessionId в localStorage
 */
export function saveGuestSessionId(sessionId: string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(GUEST_SESSION_KEY, sessionId);
  } catch (error) {
    console.warn('Failed to save guest session ID to localStorage:', error);
  }
}

/**
 * Очищает sessionId из localStorage
 */
export function clearGuestSessionId(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(GUEST_SESSION_KEY);
  } catch (error) {
    console.warn('Failed to clear guest session ID from localStorage:', error);
  }
}

/**
 * Проверяет, есть ли сохраненный sessionId
 */
export function hasGuestSessionId(): boolean {
  return getGuestSessionId() !== null;
}
