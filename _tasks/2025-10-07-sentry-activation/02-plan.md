# Sentry Activation Implementation Plan

## Date
2025-10-07

## Overview
This plan details the activation of all commented-out Sentry code in the super-chatbot application. The @sentry/nextjs package (v10.18.0) is already installed and two instrumentation files are already uncommented. This task will complete the integration by uncommenting remaining code, adding the withSentryConfig wrapper, optimizing production settings, and ensuring everything works without errors.

## Problem Statement
All Sentry error monitoring and performance tracking code is currently commented out across 12 files in the application. With @sentry/nextjs v10.18.0 installed, Next.js 15.3.1 running, and the infrastructure ready, we need to activate Sentry monitoring to track production errors, performance issues, and security events effectively.

## User Value Proposition
- **Production error tracking**: Catch and diagnose errors before users report them
- **Performance monitoring**: Identify slow API routes and client-side bottlenecks
- **Security monitoring**: Track suspicious activity and security events in real-time
- **Better debugging**: Rich context for errors (user sessions, breadcrumbs, stack traces)
- **Proactive maintenance**: Get alerted to issues immediately, not days later

---

## Research Findings

### Existing Sentry Integration Patterns

**1. Instrumentation Files (ALREADY ACTIVATED)**
- **File**: `instrumentation.ts` (root level)
  - **Pattern**: Sentry.init() for Node.js and Edge runtimes
  - **Status**: ✅ Already uncommented
  - **Current config**: DSN set, tracesSampleRate: 1.0, sendDefaultPii: true
  - **Note**: Has commented line 37 `export const onRequestError = Sentry.captureRequestError;` for Next.js 15+

- **File**: `instrumentation-client.ts` (root level)
  - **Pattern**: Client-side Sentry.init() with router transition tracking
  - **Status**: ✅ Already uncommented
  - **Current config**: DSN set, tracesSampleRate: 1, debug: false
  - **Exports**: `onRouterTransitionStart` for tracking page navigation

**2. Configuration File (NEEDS WRAPPER)**
- **File**: `next.config.ts`
  - **Current**: Standard Next.js config without Sentry wrapper
  - **Needed**: Wrap with `withSentryConfig()` for automatic instrumentation
  - **Location**: Lines 1-140
  - **Pattern to follow**: Sentry official docs for Next.js 15 TypeScript config

**3. Utility Functions (COMMENTED OUT)**
- **File**: `src/lib/sentry-utils.ts`
  - **Functions**:
    - `logHttpError()`: HTTP error logging with request context
    - `logApiError()`: API error logging with custom context
    - `createSpan()`: Performance tracking spans (completely commented)
  - **Pattern**: Uses `Sentry.withScope()` for contextual error reporting
  - **Usage locations**: Should be used in API routes

**4. Security Monitoring (COMMENTED OUT)**
- **File**: `src/lib/security/security-monitor.ts`
  - **Class**: `SecurityMonitor`
  - **Method**: `sendToSentry()` at line 400
  - **Pattern**: Uses `Sentry.withScope()` to tag security events by type and severity
  - **Integration**: Already configured to call Sentry when `enableSentry: true`
  - **Current state**: `enableSentry: true` at line 504, but Sentry calls commented

**5. Error Boundary Components (COMMENTED OUT)**
- **File**: `src/app/global-error.tsx`
  - **Pattern**: Client component with useEffect hook calling `Sentry.captureException(error)`
  - **Usage**: Global error boundary for entire application
  - **Location**: Lines 3-14

- **File**: `src/app/not-found.tsx`
  - **Pattern**: Client component tracking 404s with `Sentry.captureMessage()`
  - **Tags**: `error_type: '404'`, includes page path
  - **Location**: Lines 3-17

**6. Authentication Errors (COMMENTED OUT - 5 LOCATIONS)**
- **File**: `src/app/(auth)/auth.ts`
  - **Location 1** (line 69): `syncAuth0User()` failure after retries
    - Tags: `error_type: "auth0_sync_failure"`
    - Extra: userId, email, attempts

  - **Location 2** (line 291): `Sentry.addBreadcrumb()` for Auth0 processing
    - Category: "auth"
    - Tracks Auth0 account processing flow

  - **Location 3** (line 313): Database sync error in JWT callback
    - Tags: `error_type: "auth0_db_sync"`
    - Extra: profile info, auth method

  - **Location 4** (line 367): Sync error in session callback
    - Tags: `error_type: "auth0_db_sync"`
    - Extra: token and session info

  - **Location 5** (line 384): Session user check error
    - Tags: `error_type: "session_user_check"`
    - Extra: token and session state

**7. Chat API Route (COMMENTED OUT - 9 LOCATIONS)**
- **File**: `src/app/(chat)/api/chat/route.ts`
  - **Line 311**: Breadcrumb for session user info
  - **Line 345**: Breadcrumb for successful user creation
  - **Line 360**: Breadcrumb for using existing user ID
  - **Line 377**: Exception for user check failure
  - **Line 419**: Breadcrumb for chat creation success
  - **Line 440**: Exception for foreign key constraint errors
  - **Line 472**: Breadcrumb for chat created after user recovery
  - **Line 485**: Exception for recovery failure
  - **Line 518**: Exception for chat creation errors
  - **Pattern**: Mix of breadcrumbs (tracking flow) and exceptions (errors)
  - **Context**: Rich tags and extra data for debugging

**8. Gemini Chat API Route (COMMENTED OUT)**
- **File**: `src/app/(chat)/api/gemini-chat/route.ts`
  - **Count**: 8 locations (similar patterns to chat route)
  - **Pattern**: Breadcrumbs for tracking, exceptions for errors

**9. Chat Page Component (COMMENTED OUT - 9 LOCATIONS)**
- **File**: `src/app/(chat)/chat/[id]/page.tsx`
  - **Line 27**: Invalid UUID format
  - **Line 35**: Breadcrumb for loading chat
  - **Line 45**: Chat not found (404)
  - **Line 56**: No session found
  - **Line 66**: Invalid session user
  - **Line 76**: Access denied to private chat
  - **Line 84**: Unauthorized access attempt
  - **Line 154**: Exception for message retrieval errors
  - **Line 166**: General exception catch
  - **Pattern**: Security + error tracking, rich tags

**10. Banana Chat Page (COMMENTED OUT)**
- **File**: `src/app/(chat)/banana-veo3/[id]/page.tsx`
  - **Count**: 8 locations (similar to chat page)

### Next.js 15 Compatibility Research

**From WebSearch Results:**

1. **@sentry/nextjs v10.18.0 Status**
   - ✅ Fully compatible with Next.js 15.3.1
   - ✅ Supports Turbopack production builds (since v10.13.0)
   - ✅ Instrumentation API is stable (no experimental flag needed)
   - ✅ New `onRequestError` hook available for server errors
   - ✅ Client-side instrumentation file supported

2. **Instrumentation Features**
   - `instrumentation.ts`: Server-side (Node.js + Edge) - **ALREADY ACTIVE**
   - `instrumentation-client.ts`: Client-side early initialization - **ALREADY ACTIVE**
   - `onRequestError` export: Next.js 15+ hook for server errors - **CURRENTLY COMMENTED**

3. **withSentryConfig Requirements**
   - Required for automatic code injection during build
   - Enables source map uploads for better stack traces
   - Configuration options:
     - `org`: Organization slug (from DSN: "superduperai")
     - `project`: Project name
     - `silent`: Suppress Sentry CLI output (recommended: `!process.env.CI`)
     - `disableLogger`: Disable build-time logging

4. **Production Sample Rates Best Practices**
   - **Development**: `tracesSampleRate: 1.0` (100%) - good for testing
   - **Production recommendations**:
     - `tracesSampleRate: 0.1` to `0.2` (10-20% of transactions)
     - `replaysSessionSampleRate: 0.1` (10% of normal sessions)
     - `replaysOnErrorSampleRate: 1.0` (100% of error sessions)
   - **Current state**: All set to 1.0 (100%) - needs adjustment for production

### Environment Variables Found

**From .env and .env.local:**
- `SENTRY_AUTH_TOKEN`: Already set (needed for source map uploads)
- DSN hardcoded in instrumentation files: `https://1301771c6b15e81db39cfe8653da9eec@o4508070942474240.ingest.us.sentry.io/4509294960705536`
- Organization: `superduperai` (extracted from DSN)

### Potential Issues Identified

1. **Sample Rate Too High**: All files set to 1.0 (100%) - expensive in production
2. **onRequestError Commented**: Next.js 15+ feature not activated
3. **No withSentryConfig**: Missing automatic instrumentation in next.config.ts
4. **Hardcoded DSN**: Should use environment variable for flexibility
5. **Mixed Comments**: Some files partially uncommented, others fully commented

---

## Implementation Plan

### Phase 1: Configuration & Core Setup

**Step 1.1: Add withSentryConfig to next.config.ts**
- **File**: `apps/super-chatbot/next.config.ts`
- **Action**:
  1. Import `withSentryConfig` from `@sentry/nextjs`
  2. Wrap existing `nextConfig` with `withSentryConfig()`
  3. Add Sentry build options:
     ```typescript
     {
       org: "superduperai",
       project: "super-chatbot",
       silent: !process.env.CI,
       disableLogger: true,
       widenClientFileUpload: true,
       hideSourceMaps: true,
       disableServerWebpackPlugin: false,
       disableClientWebpackPlugin: false,
     }
     ```
- **Reason**: Required for automatic instrumentation and source map uploads
- **Testing**: Build should complete without errors, source maps uploaded to Sentry

**Step 1.2: Activate onRequestError Hook**
- **File**: `apps/super-chatbot/instrumentation.ts`
- **Action**: Uncomment line 37: `export const onRequestError = Sentry.captureRequestError;`
- **Reason**: Next.js 15+ hook for capturing server-side request errors
- **Testing**: Server errors should appear in Sentry

**Step 1.3: Environment Variable for DSN**
- **Files**:
  - `instrumentation.ts`
  - `instrumentation-client.ts`
- **Action**: Replace hardcoded DSN with `process.env.NEXT_PUBLIC_SENTRY_DSN || "fallback-dsn"`
- **Reason**: Better security and flexibility across environments
- **Add to .env.example**: `NEXT_PUBLIC_SENTRY_DSN=https://...`
- **Testing**: Verify Sentry still receives events

**Step 1.4: Optimize Production Sample Rates**
- **Files**:
  - `instrumentation.ts` (lines 16, 31)
  - `instrumentation-client.ts` (line 11)
- **Action**: Change `tracesSampleRate` based on environment:
  ```typescript
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  ```
- **Add replay sampling** to `instrumentation-client.ts`:
  ```typescript
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  ```
- **Reason**: Reduce Sentry quota usage in production while maintaining full dev visibility
- **Testing**: Verify events still captured in dev, reduced in production

### Phase 2: Utility Functions & Security Monitoring

**Step 2.1: Activate Sentry Utility Functions**
- **File**: `apps/super-chatbot/src/lib/sentry-utils.ts`
- **Action**:
  1. Uncomment line 1: `import * as Sentry from '@sentry/nextjs';`
  2. Uncomment `logHttpError()` function body (lines 13-37)
  3. Uncomment `logApiError()` function body (lines 44-51)
  4. Uncomment `createSpan()` function (lines 57-69)
- **Reason**: Provides reusable error logging utilities for API routes
- **Testing**: Import and call in test API route, verify Sentry receives error with context

**Step 2.2: Activate Security Monitoring Integration**
- **File**: `apps/super-chatbot/src/lib/security/security-monitor.ts`
- **Action**:
  1. Uncomment line 7: `import * as Sentry from "@sentry/nextjs";`
  2. Uncomment `sendToSentry()` method body (lines 401-411)
- **Reason**: Enables security event tracking in Sentry
- **Note**: Config already has `enableSentry: true` at line 504
- **Testing**: Trigger rate limit, verify Sentry receives security event

### Phase 3: Error Boundaries & Global Handlers

**Step 3.1: Activate Global Error Handler**
- **File**: `apps/super-chatbot/src/app/global-error.tsx`
- **Action**:
  1. Uncomment line 3: `import * as Sentry from "@sentry/nextjs";`
  2. Uncomment line 4: `import { useEffect } from "react";`
  3. Uncomment useEffect hook (lines 11-14)
- **Reason**: Catches unhandled errors globally
- **Testing**: Throw error in component, verify Sentry captures it

**Step 3.2: Activate 404 Tracking**
- **File**: `apps/super-chatbot/src/app/not-found.tsx`
- **Action**:
  1. Uncomment line 3: `import * as Sentry from '@sentry/nextjs';`
  2. Uncomment useEffect hook (lines 8-17)
- **Reason**: Track which pages users are trying to access that don't exist
- **Testing**: Navigate to non-existent page, verify Sentry logs 404

### Phase 4: Authentication Error Tracking

**Step 4.1: Activate Auth Error Logging (5 locations)**
- **File**: `apps/super-chatbot/src/app/(auth)/auth.ts`
- **Action**:
  1. Uncomment line 10: `import * as Sentry from "@sentry/nextjs";`
  2. Uncomment all 5 Sentry calls:
     - Line 69-76: Auth0 sync failure exception
     - Line 291-298: Auth0 processing breadcrumb
     - Line 313-323: DB sync error exception
     - Line 367-377: Session callback sync error
     - Line 384-394: Session user check error
- **Reason**: Critical auth errors need tracking for security and debugging
- **Testing**: Simulate auth failure, verify Sentry receives error with tags

### Phase 5: API Route Error Tracking

**Step 5.1: Activate Chat API Route Tracking (9 locations)**
- **File**: `apps/super-chatbot/src/app/(chat)/api/chat/route.ts`
- **Action**:
  1. Uncomment line 40: `import * as Sentry from "@sentry/nextjs";`
  2. Uncomment all Sentry breadcrumbs and exceptions (9 locations)
  3. Keep existing `withMonitoring()` wrapper (line 10) - it's separate
- **Reason**: Track chat creation flow and errors
- **Testing**: Create chat, verify breadcrumbs in Sentry; force error, verify exception

**Step 5.2: Activate Gemini Chat API Route Tracking**
- **File**: `apps/super-chatbot/src/app/(chat)/api/gemini-chat/route.ts`
- **Action**:
  1. Uncomment Sentry import
  2. Uncomment all Sentry calls (8 locations)
- **Pattern**: Same as chat route
- **Testing**: Use Gemini chat, verify Sentry tracking

### Phase 6: Page Component Error Tracking

**Step 6.1: Activate Chat Page Tracking (9 locations)**
- **File**: `apps/super-chatbot/src/app/(chat)/chat/[id]/page.tsx`
- **Action**:
  1. Uncomment line 9: `import * as Sentry from "@sentry/nextjs";`
  2. Uncomment all Sentry calls (9 locations)
- **Reason**: Track page load errors, unauthorized access, and data retrieval failures
- **Testing**: Access chat page, verify breadcrumbs; access unauthorized chat, verify warning

**Step 6.2: Activate Banana Chat Page Tracking**
- **File**: `apps/super-chatbot/src/app/(chat)/banana-veo3/[id]/page.tsx`
- **Action**:
  1. Uncomment Sentry import
  2. Uncomment all Sentry calls (8 locations)
- **Pattern**: Same as chat page
- **Testing**: Access banana chat, verify tracking

### Phase 7: Verification & Testing

**Step 7.1: Build Verification**
- Run `pnpm build` to ensure no build errors
- Verify Sentry source maps uploaded successfully
- Check build output for Sentry plugin messages

**Step 7.2: Runtime Testing**
- Start dev server with `pnpm dev`
- Test each activated feature:
  1. Global error (throw in component)
  2. 404 page (navigate to /non-existent)
  3. Auth error (simulate)
  4. API error (force in chat route)
  5. Security event (trigger rate limit)
  6. Page error (access unauthorized chat)

**Step 7.3: Sentry Dashboard Verification**
- Check Sentry dashboard for:
  - Events appearing with correct tags
  - Breadcrumbs showing user flow
  - Source maps working (readable stack traces)
  - Performance transactions (if enabled)
  - Security events (if triggered)

**Step 7.4: Production Sample Rate Verification**
- Set `NODE_ENV=production` locally
- Verify events still captured but at reduced rate
- Check Sentry quota usage is reasonable

---

## File Modification Summary

### Files to Modify (12 total)

1. ✅ **instrumentation.ts** - Uncomment onRequestError, optimize sample rates, add env var
2. ✅ **instrumentation-client.ts** - Optimize sample rates, add env var, add replay config
3. **next.config.ts** - Add withSentryConfig wrapper
4. **src/lib/sentry-utils.ts** - Uncomment all functions
5. **src/lib/security/security-monitor.ts** - Uncomment sendToSentry method
6. **src/app/global-error.tsx** - Uncomment Sentry integration
7. **src/app/not-found.tsx** - Uncomment 404 tracking
8. **src/app/(auth)/auth.ts** - Uncomment 5 Sentry calls
9. **src/app/(chat)/api/chat/route.ts** - Uncomment 9 Sentry calls
10. **src/app/(chat)/api/gemini-chat/route.ts** - Uncomment 8 Sentry calls
11. **src/app/(chat)/chat/[id]/page.tsx** - Uncomment 9 Sentry calls
12. **src/app/(chat)/banana-veo3/[id]/page.tsx** - Uncomment 8 Sentry calls

### New Files to Create

1. **.env.example** - Add NEXT_PUBLIC_SENTRY_DSN documentation

---

## Testing Strategy

### Unit Testing
- Not applicable (Sentry integration is infrastructure)
- Mock Sentry in existing tests to avoid real calls

### Integration Testing
- **Manual testing required** for each feature
- **Sentry dashboard** is the verification tool
- Test both success and error paths

### E2E Testing
- Existing Playwright tests should pass unchanged
- Add optional Sentry verification step if needed

---

## Edge Cases & Considerations

### 1. Build Performance
- **Issue**: Sentry webpack plugin may slow builds
- **Solution**: `silent: !process.env.CI` to reduce noise, monitor build times
- **Mitigation**: Can disable client plugin in dev if needed

### 2. Source Map Upload Failures
- **Issue**: SENTRY_AUTH_TOKEN might be invalid or expired
- **Solution**: Verify token works, regenerate if needed
- **Fallback**: Build succeeds even if upload fails (warning only)

### 3. Quota Limits
- **Issue**: 100% sampling exhausts Sentry quota quickly
- **Solution**: Implemented environment-based sampling (10% in production)
- **Monitoring**: Track quota usage in Sentry dashboard

### 4. Sensitive Data Leakage
- **Issue**: User data in error context
- **Solution**:
  - `sendDefaultPii: true` is intentional for debugging
  - Sentry utils already filter sensitive headers (authorization, cookie)
  - Review before production deployment
- **Action**: Add data scrubbing rules in Sentry dashboard if needed

### 5. Client-Side Errors in Production
- **Issue**: Too many client errors from old browsers, ad blockers
- **Solution**:
  - Sample rate of 10% reduces noise
  - Add filters in Sentry for known browser extensions
- **Monitoring**: Review error patterns weekly

### 6. Breadcrumb Overload
- **Issue**: Too many breadcrumbs make debugging harder
- **Solution**: Each breadcrumb provides unique value, keep all
- **Alternative**: Can disable specific breadcrumbs if overwhelming

### 7. TypeScript Errors
- **Issue**: Sentry types might not match Next.js 15
- **Solution**: @sentry/nextjs v10.18.0 has correct types
- **Verification**: Run `pnpm typecheck` after changes

### 8. Middleware Instrumentation
- **Issue**: Middleware errors might not be caught
- **Solution**: onRequestError hook covers this (Step 1.2)
- **Testing**: Throw error in middleware, verify capture

---

## Performance Implications

### Build Time
- **Impact**: +10-30 seconds for source map upload
- **Mitigation**: Only in CI/production builds
- **Acceptable**: One-time cost for better debugging

### Runtime Performance
- **Client bundle**: +~50KB gzipped for Sentry SDK
- **Server**: Minimal overhead for error tracking
- **Network**: Extra requests to Sentry only on errors
- **Acceptable**: Industry standard, worth the visibility

### Sentry Quota Usage
- **Before**: 0 events (all commented)
- **After (dev)**: 100% of events (small volume)
- **After (production)**: 10-20% of events (controlled)
- **Acceptable**: Within free tier or paid plan limits

---

## Rollback Plan

### If Build Fails
1. Comment out withSentryConfig wrapper in next.config.ts
2. Revert to previous build config
3. Fix issues offline, redeploy

### If Runtime Errors Occur
1. All Sentry code is wrapped in try/catch or optional
2. Application will continue working even if Sentry fails
3. Can disable Sentry by commenting import in instrumentation files

### If Quota Exceeded
1. Reduce sample rates further (0.05 = 5%)
2. Add error filtering rules in Sentry dashboard
3. Upgrade Sentry plan if needed

---

## Success Criteria

### Build Success
- ✅ `pnpm build` completes without errors
- ✅ Sentry source maps uploaded successfully
- ✅ `pnpm typecheck` passes
- ✅ `pnpm lint` passes

### Runtime Success
- ✅ Application starts without Sentry-related errors
- ✅ All pages load correctly
- ✅ No console errors related to Sentry

### Functional Success
- ✅ Global errors captured in Sentry
- ✅ 404 pages logged in Sentry
- ✅ Auth errors tracked with proper tags
- ✅ API errors include request context
- ✅ Security events appear in Sentry
- ✅ Breadcrumbs show user flow
- ✅ Stack traces are readable (source maps working)

### Performance Success
- ✅ Build time increase < 1 minute
- ✅ Client bundle size increase < 100KB
- ✅ No noticeable runtime performance impact
- ✅ Sentry quota usage within limits

---

## Documentation Updates

### After Completion
1. **Update DEVELOPMENT.md**: Add section on Sentry integration
2. **Update .env.example**: Add NEXT_PUBLIC_SENTRY_DSN
3. **Create docs/monitoring/sentry-setup.md**: Detail Sentry configuration
4. **Update ARCHITECTURE.md**: Add Sentry to monitoring section

### For Future Developers
- Document sample rate reasoning
- List all Sentry-integrated files
- Explain when to use breadcrumbs vs exceptions
- Provide Sentry dashboard access instructions

---

## Next Steps After Implementation

1. **Monitor Sentry Dashboard**: Check for unexpected errors
2. **Adjust Sample Rates**: Optimize based on actual usage
3. **Configure Alerts**: Set up Slack/email notifications for critical errors
4. **Add Data Scrubbing**: Remove any sensitive data from errors
5. **Create Error Budget**: Define acceptable error rates
6. **Team Training**: Ensure team knows how to use Sentry for debugging

---

## References

- **Sentry Next.js Docs**: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **Next.js 15 Instrumentation**: https://nextjs.org/docs/app/guides/instrumentation
- **Sentry Manual Setup**: https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
- **Sample Rate Configuration**: https://docs.sentry.io/platforms/javascript/guides/nextjs/tracing/

---

## Agent Assignment

- **@rob** (Implementation Engineer): Execute Steps 1-6, make all code changes
- **@kent** (Test Engineer): Execute Step 7, verify all functionality
- **@kevlin** (Code Reviewer): Review for code quality, duplication, organization
- **@linus** (Architecture Reviewer): Verify architectural decisions, security implications
- **@raymond** (Documentation): Update docs after implementation
- **@ward** (Knowledge Librarian): Extract patterns for future Sentry integrations

---

## Estimated Effort

- **Phase 1 (Configuration)**: 30 minutes
- **Phase 2 (Utilities)**: 15 minutes
- **Phase 3 (Error Boundaries)**: 15 minutes
- **Phase 4 (Auth Tracking)**: 20 minutes
- **Phase 5 (API Tracking)**: 30 minutes
- **Phase 6 (Page Tracking)**: 20 minutes
- **Phase 7 (Testing)**: 45 minutes

**Total**: ~3 hours (implementation + testing)

---

## Risk Assessment

### High Priority Risks
1. **Build failures** - Mitigated by testing in dev first
2. **Runtime errors** - Mitigated by Sentry SDK stability
3. **Quota exhaustion** - Mitigated by sample rate controls

### Medium Priority Risks
1. **Performance impact** - Acceptable for monitoring benefits
2. **Source map upload failures** - Non-blocking, can fix later

### Low Priority Risks
1. **TypeScript errors** - SDK has proper types
2. **Integration conflicts** - Sentry is widely used with Next.js

---

## Conclusion

This plan provides a comprehensive, step-by-step approach to activating all commented Sentry code in the super-chatbot application. By following the Vercel way of "make the right thing easy," we'll enable production-grade error monitoring without compromising performance or developer experience. The phased approach allows for incremental testing and rollback if needed, while the detailed research ensures we're following Next.js 15 and Sentry best practices.

**Ship it fast, monitor everything, iterate based on real data.** That's the Next.js way.
