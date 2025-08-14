"use client";

const GUEST_SESSION_KEY = "superduperai_guest_session_id";

export function getGuestSessionId(): string | null {
  if (typeof window === "undefined") return null;

  try {
    return localStorage.getItem(GUEST_SESSION_KEY);
  } catch (error) {
    console.warn("Failed to get guest session ID from localStorage:", error);
    return null;
  }
}

export function setGuestSessionId(sessionId: string): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(GUEST_SESSION_KEY, sessionId);
  } catch (error) {
    console.warn("Failed to set guest session ID in localStorage:", error);
  }
}

export function generateGuestSessionId(): string {
  return `guest-session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function clearGuestSessionId(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(GUEST_SESSION_KEY);
  } catch (error) {
    console.warn("Failed to clear guest session ID from localStorage:", error);
  }
}
