export async function register() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

  if (!dsn) {
    return;
  }

  // Dynamic import to avoid loading Sentry when not configured
  const Sentry = await import('@sentry/nextjs');

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    Sentry.init({
      dsn,

      sendDefaultPii: process.env.SENTRY_SEND_PII === 'true',

      tracesSampleRate: process.env.SENTRY_TRACES_SAMPLE_RATE
        ? Number.parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE)
        : process.env.NODE_ENV === 'production'
          ? 0.01
          : 1.0,

      environment: process.env.NODE_ENV,
    });
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init({
      dsn,

      sendDefaultPii: process.env.SENTRY_SEND_PII === 'true',

      tracesSampleRate: process.env.SENTRY_TRACES_SAMPLE_RATE
        ? Number.parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE)
        : process.env.NODE_ENV === 'production'
          ? 0.01
          : 1.0,

      environment: process.env.NODE_ENV,
    });
  }
}

// TODO: Investigate onRequestError hook
// - Test if it duplicates manual captureException calls
// - Verify it doesn't cause noise from expected errors (404s, validation)
// - If clean, activate and remove manual captures from route handlers
// export const onRequestError = Sentry.captureRequestError;
