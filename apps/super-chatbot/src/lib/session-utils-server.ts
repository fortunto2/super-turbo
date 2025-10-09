import { cookies } from 'next/headers';

const GUEST_SESSION_COOKIE = 'superduperai_guest_session';

/**
 * Генерирует уникальный sessionId для гостевого пользователя на сервере
 */
export function generateServerGuestSessionId(): string {
  return `guest-session-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Получает sessionId из cookie на сервере
 */
export async function getServerGuestSessionId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(GUEST_SESSION_COOKIE)?.value || null;
}

/**
 * Сохраняет sessionId в cookie на сервере
 */
export async function setServerGuestSessionId(
  sessionId: string,
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(GUEST_SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60, // 30 дней
    path: '/',
  });
}

/**
 * Получает или создает sessionId на сервере
 */
export async function getOrCreateServerGuestSessionId(): Promise<string> {
  let sessionId = await getServerGuestSessionId();

  if (!sessionId) {
    sessionId = generateServerGuestSessionId();
    await setServerGuestSessionId(sessionId);
  }

  return sessionId;
}
