import { compare } from "bcrypt-ts";
import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Auth0Provider from "next-auth/providers/auth0";

import { authConfig } from "./auth.config";
import { DUMMY_PASSWORD } from "@/lib/constants";
import type { DefaultJWT } from "next-auth/jwt";
import { nanoid } from "nanoid";
import * as Sentry from "@sentry/nextjs";

export type UserType = "guest" | "regular";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      type: UserType;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    email?: string | null;
    type: UserType;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    type: UserType;
  }
}

/**
 * Синхронизирует пользователя Auth0 с БД с надежной обработкой ошибок
 * Повторяет попытку три раза в случае неудачи
 */
async function syncAuth0User(userId: string, email: string | null) {
  const maxRetries = 3;
  let lastError = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      if (email) {
        const { getOrCreateOAuthUser } = await import("@/lib/db/queries");
        const user = await getOrCreateOAuthUser(userId, email);
        return user;
      }
      return null;
    } catch (error) {
      console.error(
        `Failed to sync Auth0 user (attempt ${attempt + 1}):`,
        error
      );
      lastError = error;

      // Ждем перед следующей попыткой (нарастающее время ожидания)
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, 100 * Math.pow(2, attempt))
        );
      }
    }
  }

  // Логируем ошибку в Sentry, если все попытки неудачны
  Sentry.captureException(lastError, {
    tags: { error_type: "auth0_sync_failure" },
    extra: {
      userId,
      email,
      attempts: maxRetries,
    },
  });

  return null;
}

// Enable Auth0 provider only when all required env vars are present
const auth0Enabled = Boolean(
  process.env.AUTH_AUTH0_ID &&
    process.env.AUTH_AUTH0_SECRET &&
    process.env.AUTH_AUTH0_ISSUER
);

// Resolve NextAuth secret with safe dev fallback
const resolvedAuthSecret =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  (process.env.NODE_ENV !== "production" ? "dev-secret-change-me" : undefined);

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
}: {
  handlers: { GET: any; POST: any };
  auth: any;
  signIn: any;
  signOut: any;
} = NextAuth({
  ...authConfig,
  secret: resolvedAuthSecret,
  providers: [
    ...(auth0Enabled
      ? [
          Auth0Provider({
            clientId: process.env.AUTH_AUTH0_ID as string,
            clientSecret: process.env.AUTH_AUTH0_SECRET as string,
            issuer: process.env.AUTH_AUTH0_ISSUER as string,
          }),
        ]
      : []),
    Credentials({
      credentials: {},
      async authorize({ email, password }: any) {
        const { getUser } = await import("@/lib/db/queries");
        const users = await getUser(email);

        if (users.length === 0) {
          await compare(password, DUMMY_PASSWORD);
          return null;
        }

        const [user] = users;

        if (!user.password) {
          await compare(password, DUMMY_PASSWORD);
          return null;
        }

        const passwordsMatch = await compare(password, user.password);

        if (!passwordsMatch) return null;

        return { ...user, type: "regular" };
      },
    }),
    Credentials({
      id: "guest",
      credentials: {},
      async authorize() {
        // Получаем заголовки для генерации fingerprint
        const { headers } = await import("next/headers");
        const headersList = await headers();

        // Генерируем fingerprint на основе самых стабильных заголовков браузера
        const userAgent = headersList.get("user-agent") || "";
        const secChUaPlatform = headersList.get("sec-ch-ua-platform") || "";

        // Получаем IP адрес для стабильности
        const forwardedFor = headersList.get("x-forwarded-for") || "";
        const realIp = headersList.get("x-real-ip") || "";
        const ip = forwardedFor.split(",")[0] || realIp || "unknown";

        // Используем только IP адрес для максимальной стабильности
        const fingerprint = ip;

        // Простая хеш-функция
        let hash = 0;
        for (let i = 0; i < fingerprint.length; i++) {
          const char = fingerprint.charCodeAt(i);
          hash = (hash << 5) - hash + char;
          hash = hash & hash; // Convert to 32-bit integer
        }

        const browserId = `guest-browser-${Math.abs(hash).toString(36)}`;

        console.log(`Generated browser ID: ${browserId} from fingerprint:`, {
          ip,
          userAgent: `${userAgent.substring(0, 50)}...`,
          fingerprint: `${fingerprint.substring(0, 100)}...`,
          hash: Math.abs(hash),
        });

        try {
          // Пытаемся найти существующего гостя по browserId
          const { getGuestUserBySessionId } = await import("@/lib/db/queries");
          const existingGuest = await getGuestUserBySessionId(browserId);
          if (existingGuest) {
            console.log(
              `Found existing guest user with browser ID: ${browserId}`
            );
            return { ...existingGuest, type: "guest" };
          }
        } catch (error) {
          console.warn("Failed to find guest user by browser ID:", error);
        }

        // Если гость не найден — создаем нового с постоянным browserId
        console.log(`Creating new guest user with browser ID: ${browserId}`);

        const { createGuestUser } = await import("@/lib/db/queries");
        const [guestUser] = await createGuestUser(browserId);
        return { ...guestUser, type: "guest" };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id as string;
        token.type = user.type;
        // Preserve superduperaiToken if it exists
        if ((user as any).superduperaiToken) {
          token.superduperaiToken = (user as any).superduperaiToken;
        }
      }

      if (account && account.provider === "auth0") {
        token.type = "regular";

        // DEBUGGING: Log all available tokens from Auth0
        console.log("🔍 AUTH0 DEBUG: Available tokens and account data:", {
          // Account tokens
          access_token: account.access_token
            ? `${account.access_token.substring(0, 20)}...`
            : "none",
          id_token: account.id_token
            ? `${account.id_token.substring(0, 20)}...`
            : "none",
          refresh_token: account.refresh_token
            ? `${account.refresh_token.substring(0, 20)}...`
            : "none",
          scope: account.scope,
          token_type: account.token_type,
          // User info
          userSub: account.providerAccountId,
          userEmail: token.email,
          // Full account keys (without sensitive data)
          accountKeys: Object.keys(account).filter(
            (key) => !key.includes("token") && !key.includes("secret")
          ),
        });

        // Если ID отсутствует, генерируем его
        if (!token.id) {
          token.id = nanoid();
        }

        // Try to use Auth0 access_token for SuperDuperAI
        if (account.access_token) {
          console.log(
            "🔧 AUTH0: Using Auth0 access_token as SuperDuperAI token"
          );
          token.superduperaiToken = account.access_token;
        }

        // Alternative: Extract SuperDuperAI token from JWT claims
        if (account.id_token) {
          try {
            // Decode JWT to extract custom claims (without verification for simplicity)
            const base64Url = account.id_token.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split("")
                .map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
                .join("")
            );

            const payload = JSON.parse(jsonPayload);

            // Check for custom SuperDuperAI claim
            if (
              payload["https://superduperai.co/token"] ||
              payload.superduperai_token
            ) {
              const customToken =
                payload["https://superduperai.co/token"] ||
                payload.superduperai_token;
              console.log("🔧 AUTH0: Found SuperDuperAI token in JWT claims");
              token.superduperaiToken = customToken;
            }
          } catch (error) {
            console.warn("Failed to decode Auth0 id_token:", error);
          }
        }

        // Preserve any existing superduperaiToken from account
        if ((account as any).superduperaiToken) {
          token.superduperaiToken = (account as any).superduperaiToken;
        }

        // Логируем информацию для отладки
        Sentry.addBreadcrumb({
          category: "auth",
          message: "Processing Auth0 account",
          level: "info",
          data: {
            tokenId: token.id,
            tokenEmail: token.email,
            tokenName: token.name,
            provider: account.provider,
          },
        });

        try {
          if (token.email) {
            // Используем улучшенную версию с повторными попытками
            const { getOrCreateOAuthUser } = await import("@/lib/db/queries");
            // keep behavior through sync function wrapper
            await syncAuth0User(token.id, token.email);
          }
        } catch (error) {
          console.error("Error syncing Auth0 user with database:", error);
          // Логируем ошибку в Sentry
          Sentry.captureException(error, {
            tags: {
              error_type: "auth0_db_sync",
              phase: "jwt_callback",
            },
            extra: {
              tokenId: token.id,
              tokenEmail: token.email,
            },
          });
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.type = token.type;
        // Pass superduperaiToken to session
        if (token.superduperaiToken) {
          (session as any).superduperaiToken = token.superduperaiToken;
        }

        // Дополнительная синхронизация пользователя OAuth с каждым запросом сессии
        if (token.email && token.type === "regular") {
          try {
            // Проверяем, существует ли пользователь с этим email
            const { getUser } = await import("@/lib/db/queries");
            const users = await getUser(token.email);

            if (users.length > 0) {
              // Если пользователь найден по email, но имеет другой ID,
              // используем ID из базы данных вместо ID из Auth0
              const existingUser = users[0];
              if (existingUser.id !== token.id) {
                console.log(
                  `Found user with email ${token.email} in database with different ID. Using database ID: ${existingUser.id}`
                );
                session.user.id = existingUser.id;
                // Не меняем token.id, так как это может вызвать проблемы с Auth0
              }
            } else {
              // Если пользователь не найден по email, создаем его
              try {
                // Используем улучшенную версию с повторными попытками
                await syncAuth0User(token.id, token.email);
              } catch (syncError) {
                console.error(
                  "Error syncing Auth0 user during session check:",
                  syncError
                );
                Sentry.captureException(syncError, {
                  tags: {
                    error_type: "auth0_db_sync",
                    phase: "session_callback",
                  },
                  extra: {
                    tokenId: token.id,
                    tokenEmail: token.email,
                  },
                });
              }
            }
          } catch (error) {
            console.error(
              "Error during user check in session callback:",
              error
            );
            Sentry.captureException(error, {
              tags: {
                error_type: "session_user_check",
                phase: "session_callback",
              },
              extra: {
                tokenId: token.id,
                tokenEmail: token.email,
              },
            });
          }
        }
      }

      return session;
    },
  },
});
