import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
    newUser: '/',
  },
  providers: [
    // added later in auth.ts since it requires bcrypt which is only compatible with Node.js
    // while this file is also used in non-Node.js environments
  ],
  callbacks: {},
  // Добавляем конфигурацию для правильной работы в продакшене
  trustHost: true,
  // Добавляем секрет NextAuth - используем AUTH_AUTH0_SECRET если NEXTAUTH_SECRET не установлен
  secret:
    process.env.NEXTAUTH_SECRET ||
    process.env.AUTH_AUTH0_SECRET ||
    'fallback-secret',
  // Настройки для сохранения сессий
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 дней
  },
  // Настройки для cookie
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30 дней
      },
    },
  },
} satisfies NextAuthConfig;
