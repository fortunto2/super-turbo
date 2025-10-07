# User Request: Sentry Activation

## Date
2025-10-07

## Request
Uncomment all entries related to @sentry/nextjs, find all entries via search, fix if necessary, ensure everything works correctly without errors.

## Context
- Package @sentry/nextjs@^10.18.0 is already installed
- All Sentry code is currently commented out
- Found commented code in 12 files:
  1. `instrumentation.ts` - Server-side init (nodejs + edge) - **ALREADY UNCOMMENTED**
  2. `instrumentation-client.ts` - Client-side init - **ALREADY UNCOMMENTED**
  3. `next.config.ts` - Missing withSentryConfig wrapper
  4. `src/lib/sentry-utils.ts` - Error logging utilities
  5. `src/lib/security/security-monitor.ts` - Security monitoring
  6. `src/app/global-error.tsx` - Global error handler
  7. `src/app/not-found.tsx` - 404 tracking
  8. `src/app/(auth)/auth.ts` - Auth errors (5 locations)
  9. `src/app/(chat)/api/chat/route.ts` - Chat API errors (9 locations)
  10. `src/app/(chat)/api/gemini-chat/route.ts` - Gemini API errors (8 locations)
  11. `src/app/(chat)/chat/[id]/page.tsx` - Chat page tracking (9 locations)
  12. `src/app/(chat)/banana-veo3/[id]/page.tsx` - Banana chat tracking (8 locations)

## Existing Configuration
- **DSN**: `https://1301771c6b15e81db39cfe8653da9eec@o4508070942474240.ingest.us.sentry.io/4509294960705536`
- **Auth Token**: Available in `.env` and `.env.local`
- **Organization**: superduperai

## Already Partially Done
- `instrumentation.ts` has been uncommented (server-side + edge runtime init)
- `instrumentation-client.ts` has been uncommented (client-side init)

## Goals
1. Uncomment all Sentry-related code in all files
2. Add withSentryConfig wrapper to next.config.ts
3. Verify Next.js 15 compatibility
4. Adjust sample rates for production (currently all set to 1.0 / 100%)
5. Test that everything works without errors
6. Ensure proper error tracking in production

## Success Criteria
- All Sentry code uncommented and functional
- No build errors or runtime errors
- Sentry receives error reports correctly
- Production sample rates are appropriate
- All commented imports are activated
