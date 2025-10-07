import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,

    tracesSampleRate: process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE
      ? Number.parseFloat(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE)
      : (process.env.NODE_ENV === "production" ? 0.01 : 1.0),

    environment: process.env.NODE_ENV,

    debug: false,
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
