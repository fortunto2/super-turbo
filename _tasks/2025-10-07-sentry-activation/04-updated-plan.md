# Updated Sentry Activation Implementation Plan

**Date**: 2025-10-07
**Version**: 2.0 (Post-Architecture Review)
**Status**: Ready for Implementation

---

## Executive Summary

This updated plan addresses ALL 6 CRITICAL issues identified by Linus's architecture review. The original plan's "uncomment everything" approach has been replaced with a STRATEGIC, production-ready implementation that prioritizes:

1. Privacy compliance (GDPR/CCPA ready)
2. Cost control (conservative sample rates)
3. Environment flexibility (no hardcoded values)
4. Signal over noise (selective tracking)
5. Production readiness (proper build configuration)
6. Debuggability (activate only what we need)

**Key Changes from Original Plan**:
- Privacy-first: PII capture OFF by default, environment-controlled
- Flexible DSN: Environment variable with safe fallback (undefined)
- Conservative sampling: 1% production, configurable via env vars
- Selective tracking: Errors only, breadcrumbs only where they add value
- Production builds: Source maps upload only in CI/production
- onRequestError: Research first, decide based on evidence

---

## Problem Statement (Refined)

We need production error monitoring with Sentry, but we must balance visibility against privacy, cost, and operational complexity. The codebase has extensive Sentry integration already written, but it's ALL commented out. Our task is to activate the RIGHT parts in the RIGHT way for production deployment.

**What Changed**: Original plan was "uncomment everything". New plan is "uncomment strategically, configure properly".

---

## Critical Issues Addressed

### Issue 1: Privacy Compliance (GDPR/CCPA)
**Original Problem**: `sendDefaultPii: true` hardcoded in both runtimes
**Linus's Verdict**: "Anyone shipping Option A to production with EU users is an idiot"

**DECISION: Option B - Environment Control**

**Implementation**:
```typescript
// instrumentation.ts (both nodejs and edge)
sendDefaultPii: process.env.SENTRY_SEND_PII === 'true'
```

**Rationale**:
- Compliant by default (false)
- Can enable when actively debugging (set env var)
- No redeploy needed to toggle
- Respects user privacy

**Environment Variables**:
- `SENTRY_SEND_PII=false` (default if unset)
- `SENTRY_SEND_PII=true` (only when debugging specific issues)

---

### Issue 2: Hardcoded DSN Configuration
**Original Problem**: DSN hardcoded in both instrumentation files
**Linus's Verdict**: "If you don't have a DSN configured, you WANT Sentry to not initialize"

**DECISION: Option B - Fail Safe**

**Implementation**:
```typescript
// instrumentation.ts and instrumentation-client.ts
dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || undefined
```

**Rationale**:
- No DSN = Sentry doesn't initialize (clean shutdown)
- Different DSNs for dev/staging/prod
- Can disable entirely by unsetting env var
- No mystery "fallback DSN"

**Environment Variables**:
- `NEXT_PUBLIC_SENTRY_DSN=https://...` (from .env.local or deployment config)
- Unset = Sentry disabled (useful for testing)

**Migration**:
- Keep hardcoded DSN in `.env.example` for documentation
- Remove hardcoded DSN from code files
- Update CI/CD to set appropriate DSN per environment

---

### Issue 3: Sample Rate Optimization
**Original Problem**: 10% production sample rate will exhaust quota
**Linus's Verdict**: "Calculate your expected traffic and Sentry costs BEFORE deploying"

**DECISION: Option C - Dynamic Configuration**

**Implementation**:
```typescript
// instrumentation.ts (nodejs)
tracesSampleRate: process.env.SENTRY_TRACES_SAMPLE_RATE
  ? parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE)
  : (process.env.NODE_ENV === "production" ? 0.01 : 1.0)

// instrumentation.ts (edge)
tracesSampleRate: process.env.SENTRY_TRACES_SAMPLE_RATE
  ? parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE)
  : (process.env.NODE_ENV === "production" ? 0.01 : 1.0)

// instrumentation-client.ts
tracesSampleRate: process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE
  ? parseFloat(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE)
  : (process.env.NODE_ENV === "production" ? 0.01 : 1.0)
```

**Rationale**:
- 1% production (down from 10%) = 10x cost reduction
- 100% development = full visibility when debugging
- Environment-controlled = tune without redeploy
- Can increase if needed after monitoring quota

**Quota Math** (example):
- 100K requests/day × 1% = 1K transactions/day = 30K/month
- Sentry free tier: 10K/month → need paid plan
- Can adjust up to 2-3% if paid plan supports it

**Environment Variables**:
- `SENTRY_TRACES_SAMPLE_RATE=0.01` (production default)
- `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0.01` (client-side)
- Can override per environment

**REMOVED from Plan**:
- Session replay configuration (replaysSessionSampleRate, replaysOnErrorSampleRate)
- **Reason**: Privacy concerns, quota explosion, requires user consent
- **Future**: Can add after privacy policy update and higher Sentry plan

---

### Issue 4: Selective Tracking Strategy
**Original Problem**: 50+ Sentry calls, mostly breadcrumb spam
**Linus's Verdict**: "Don't need 9 breadcrumbs in chat route for 'all good'. Need breadcrumbs when something BREAKS"

**DECISION: Option B - Errors Only, Selective Breadcrumbs**

**What to ACTIVATE** (Priority-based):

**HIGH PRIORITY (Must Activate)**:
1. ✅ **Global error handler** (`global-error.tsx`)
   - Catches unhandled exceptions
   - File: `src/app/global-error.tsx`
   - Action: Uncomment `captureException()` call

2. ✅ **Auth errors** (`auth.ts` - 3 out of 5 locations)
   - Location 1 (line 69): Auth0 sync failure after retries → ACTIVATE
   - Location 2 (line 291): Auth0 processing breadcrumb → SKIP (happy path)
   - Location 3 (line 313): Database sync error in JWT → ACTIVATE
   - Location 4 (line 367): Session callback sync error → ACTIVATE
   - Location 5 (line 384): Session user check error → SKIP (can recover)
   - **Reason**: Auth failures are critical, need full context

3. ✅ **API route errors** (chat/gemini routes - exceptions only)
   - `src/app/(chat)/api/chat/route.ts`:
     - Line 377: User check failure → ACTIVATE
     - Line 440: Foreign key constraint errors → ACTIVATE
     - Line 485: Recovery failure → ACTIVATE
     - Line 518: Chat creation errors → ACTIVATE
     - SKIP all breadcrumbs (lines 311, 345, 360, 419, 472)
   - `src/app/(chat)/api/gemini-chat/route.ts`:
     - Similar pattern: exceptions YES, breadcrumbs NO
   - **Reason**: User-facing errors need tracking, breadcrumbs pollute

4. ✅ **Security events** (`security-monitor.ts`)
   - Uncomment `sendToSentry()` method
   - **Reason**: Security incidents need immediate visibility

5. ✅ **Sentry utility functions** (`sentry-utils.ts`)
   - Uncomment `logHttpError()`, `logApiError()`
   - SKIP `createSpan()` for now (performance tracking = quota cost)
   - **Reason**: Reusable error logging utilities

**MEDIUM PRIORITY (Conditional Activation)**:
6. ⚠️ **404 tracking** (`not-found.tsx`)
   - **Decision**: SKIP for initial launch
   - **Reason**: Can be noisy (bots, broken links), not critical errors
   - **Future**: Add after launch if needed to discover broken links

7. ⚠️ **Page component errors** (chat/[id]/page.tsx, banana-veo3/[id]/page.tsx)
   - **Decision**: Activate ONLY critical security errors:
     - Line 76: Access denied to private chat → ACTIVATE
     - Line 84: Unauthorized access attempt → ACTIVATE
     - Line 154: Message retrieval errors → ACTIVATE
   - **SKIP**:
     - UUID validation (line 27) → should be 400 error
     - Breadcrumbs (lines 35, 56, 66) → happy path noise
   - **Reason**: Security violations need tracking, validation errors don't

**LOW PRIORITY (Skip Entirely)**:
8. ❌ **Breadcrumbs in happy paths** (user created, chat created, etc.)
   - These add noise without value
   - Can add selectively during debugging sessions

**Summary**:
- Original plan: 50+ Sentry calls
- Updated plan: ~15-20 critical calls
- Focus: Errors and security, not flow tracking

---

### Issue 5: onRequestError Hook Investigation
**Original Problem**: Commented out, no explanation why
**Linus's Verdict**: "Find out what that reason was before changing it"

**DECISION: Option C - Skip for Now, Investigate Later**

**Rationale**:
- Was commented for a reason (unknown)
- Risk of duplicate error tracking with manual `captureException()` calls
- Manual error handling is already working
- Can activate after launch when we have time to test properly

**Action Items**:
1. Leave commented: `// export const onRequestError = Sentry.captureRequestError;`
2. Add TODO comment explaining decision:
   ```typescript
   // TODO: Investigate onRequestError hook
   // - Test if it duplicates manual captureException calls
   // - Verify it doesn't cause noise from expected errors (404s, validation)
   // - If clean, activate and remove manual captures from route handlers
   // export const onRequestError = Sentry.captureRequestError;
   ```
3. Post-launch: Test in staging, compare with manual captures
4. If no duplicates: Activate and simplify route error handling

**Why Not Option B** (investigate now):
- Delays ship date
- Current manual error handling works
- Low risk to skip (we have error coverage)

---

### Issue 6: Build Configuration Optimization
**Original Problem**: Source map upload on every build (dev + prod)
**Linus's Verdict**: "You DON'T need source maps uploaded from your local dev machine"

**DECISION: Option B - Production Builds Only**

**Implementation**:
```typescript
// next.config.ts
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig = {
  // ... existing config
};

// Only wrap in production or CI environments
export default process.env.NODE_ENV === 'production' || process.env.CI
  ? withSentryConfig(nextConfig, {
      org: "superduperai",
      project: "super-chatbot",
      silent: !process.env.CI,

      // Upload source maps only in production builds
      disableServerWebpackPlugin: false,
      disableClientWebpackPlugin: false,

      // Hide source maps from public access
      hideSourceMaps: true,

      // Upload more client files for better stack traces
      widenClientFileUpload: true,

      // Disable logger to reduce build noise
      disableLogger: true,
    })
  : nextConfig;
```

**Rationale**:
- Fast dev builds (no source map upload)
- Production builds upload to Sentry
- CI builds upload to Sentry (for preview deployments)
- `hideSourceMaps: true` = users can't access source maps
- `widenClientFileUpload: true` = better coverage for stack traces

**Environment Requirements**:
- `SENTRY_AUTH_TOKEN` must be set in CI/CD
- Local dev: No token needed, builds fast
- Production: Token required for source map upload

**Build Time Impact**:
- Dev builds: No change (Sentry wrapper skipped)
- Prod builds: +10-30 seconds (acceptable)

---

## Updated Implementation Plan

### Phase 1: Core Configuration (30 minutes)

**Step 1.1: Update instrumentation.ts**
- **File**: `apps/super-chatbot/instrumentation.ts`
- **Changes**:
  1. Replace hardcoded DSN with `process.env.NEXT_PUBLIC_SENTRY_DSN || undefined`
  2. Change `sendDefaultPii: true` → `sendDefaultPii: process.env.SENTRY_SEND_PII === 'true'`
  3. Update `tracesSampleRate` to dynamic config (see Issue 3)
  4. Apply changes to BOTH nodejs and edge runtime blocks
  5. Add TODO comment for onRequestError (see Issue 5)
- **Testing**: Build should succeed, verify no TypeScript errors

**Step 1.2: Update instrumentation-client.ts**
- **File**: `apps/super-chatbot/instrumentation-client.ts`
- **Changes**:
  1. Replace hardcoded DSN with `process.env.NEXT_PUBLIC_SENTRY_DSN || undefined`
  2. Update `tracesSampleRate` to dynamic config with `NEXT_PUBLIC_` prefix
  3. Remove any replay configuration if present
- **Testing**: Build should succeed, client-side Sentry initializes correctly

**Step 1.3: Add withSentryConfig Wrapper**
- **File**: `apps/super-chatbot/next.config.ts`
- **Changes**:
  1. Import `withSentryConfig` from `@sentry/nextjs`
  2. Wrap config conditionally (production/CI only)
  3. Configure with production-optimized settings
- **Testing**: Dev build should be fast (no Sentry), prod build uploads source maps

**Step 1.4: Update Environment Variables Documentation**
- **File**: `apps/super-chatbot/.env.example` (or root .env.example)
- **Add**:
  ```bash
  # Sentry Configuration
  NEXT_PUBLIC_SENTRY_DSN=https://1301771c6b15e81db39cfe8653da9eec@o4508070942474240.ingest.us.sentry.io/4509294960705536

  # Privacy Control (default: false)
  # Set to 'true' only when debugging specific issues
  SENTRY_SEND_PII=false

  # Sample Rates (default: 0.01 in production, 1.0 in development)
  # Server-side sampling
  SENTRY_TRACES_SAMPLE_RATE=0.01
  # Client-side sampling (must use NEXT_PUBLIC_ prefix)
  NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0.01

  # Auth token for source map uploads (required in CI/CD)
  # SENTRY_AUTH_TOKEN=your_token_here
  ```

---

### Phase 2: Utility Functions & Security (15 minutes)

**Step 2.1: Activate Sentry Utilities (Partial)**
- **File**: `apps/super-chatbot/src/lib/sentry-utils.ts`
- **Changes**:
  1. Uncomment import: `import * as Sentry from '@sentry/nextjs';`
  2. Uncomment `logHttpError()` function (lines 13-37)
  3. Uncomment `logApiError()` function (lines 44-51)
  4. KEEP `createSpan()` commented (performance tracking = quota cost)
- **Testing**: Import functions in test file, verify they work

**Step 2.2: Activate Security Monitoring**
- **File**: `apps/super-chatbot/src/lib/security/security-monitor.ts`
- **Changes**:
  1. Uncomment import: `import * as Sentry from "@sentry/nextjs";`
  2. Uncomment `sendToSentry()` method body (lines 401-411)
- **Testing**: Trigger rate limit, verify Sentry receives security event

---

### Phase 3: Error Boundaries (10 minutes)

**Step 3.1: Activate Global Error Handler**
- **File**: `apps/super-chatbot/src/app/global-error.tsx`
- **Changes**:
  1. Uncomment Sentry import
  2. Uncomment useEffect hook with `captureException()`
- **Testing**: Throw error in component, verify Sentry captures

**Step 3.2: SKIP 404 Tracking**
- **File**: `apps/super-chatbot/src/app/not-found.tsx`
- **Action**: KEEP COMMENTED for now
- **Reason**: Can be noisy, not critical for launch
- **Future**: Activate after launch if needed

---

### Phase 4: Authentication Errors (15 minutes)

**Step 4.1: Activate Critical Auth Errors Only**
- **File**: `apps/super-chatbot/src/app/(auth)/auth.ts`
- **Changes**:
  1. Uncomment Sentry import
  2. **ACTIVATE** these locations:
     - Line 69-76: Auth0 sync failure (critical error)
     - Line 313-323: DB sync error in JWT (critical error)
     - Line 367-377: Session callback sync error (critical error)
  3. **SKIP** these locations:
     - Line 291-298: Auth0 processing breadcrumb (happy path)
     - Line 384-394: Session user check error (recoverable)
- **Testing**: Simulate auth failure, verify Sentry receives error with tags

---

### Phase 5: API Route Errors (20 minutes)

**Step 5.1: Activate Chat API Exceptions Only**
- **File**: `apps/super-chatbot/src/app/(chat)/api/chat/route.ts`
- **Changes**:
  1. Uncomment Sentry import
  2. **ACTIVATE** exceptions only:
     - Line 377: User check failure
     - Line 440: Foreign key constraint errors
     - Line 485: Recovery failure
     - Line 518: Chat creation errors
  3. **SKIP** breadcrumbs:
     - Lines 311, 345, 360, 419, 472 (happy path tracking)
- **Testing**: Force API error, verify Sentry captures with context

**Step 5.2: Activate Gemini API Exceptions**
- **File**: `apps/super-chatbot/src/app/(chat)/api/gemini-chat/route.ts`
- **Changes**: Same pattern - exceptions only, skip breadcrumbs
- **Testing**: Force Gemini API error, verify tracking

---

### Phase 6: Page Component Errors (15 minutes)

**Step 6.1: Activate Critical Page Errors Only**
- **File**: `apps/super-chatbot/src/app/(chat)/chat/[id]/page.tsx`
- **Changes**:
  1. Uncomment Sentry import
  2. **ACTIVATE** security errors only:
     - Line 76: Access denied to private chat
     - Line 84: Unauthorized access attempt
     - Line 154: Message retrieval errors
  3. **SKIP**:
     - Line 27: UUID validation (should be 400 error)
     - Lines 35, 56, 66: Breadcrumbs (happy path)
- **Testing**: Access unauthorized chat, verify Sentry logs security warning

**Step 6.2: Activate Banana Chat Page (Same Pattern)**
- **File**: `apps/super-chatbot/src/app/(chat)/banana-veo3/[id]/page.tsx`
- **Changes**: Same selective activation as chat page
- **Testing**: Verify security error tracking

---

### Phase 7: Verification & Testing (45 minutes)

**Step 7.1: Build Verification**
- Run `pnpm build` in production mode
- Verify Sentry source maps uploaded successfully
- Verify no TypeScript errors: `pnpm typecheck`
- Verify no lint errors: `pnpm lint`

**Step 7.2: Dev Build Verification**
- Run `pnpm dev`
- Verify build is fast (no Sentry wrapper)
- Verify application starts without errors

**Step 7.3: Runtime Testing (Manual)**
Test each activated feature:
1. Global error: Throw in component → Check Sentry
2. Auth error: Simulate sync failure → Check Sentry
3. API error: Force chat route error → Check Sentry
4. Security event: Trigger rate limit → Check Sentry
5. Page security: Access unauthorized chat → Check Sentry

**Step 7.4: Sentry Dashboard Verification**
- Events appear with correct tags and severity
- Stack traces are readable (source maps working)
- No duplicate errors (verify onRequestError is still commented)
- Check quota usage is reasonable

**Step 7.5: Environment Variable Testing**
Test configuration flexibility:
1. Unset `NEXT_PUBLIC_SENTRY_DSN` → Sentry should not initialize
2. Set `SENTRY_SEND_PII=true` → Verify PII captured
3. Set `SENTRY_TRACES_SAMPLE_RATE=0.5` → Verify sample rate change
4. Verify production env uses 1% sample rate

---

## Files Modified Summary

### Configuration Files (3)
1. ✅ `instrumentation.ts` - DSN, PII, sample rates
2. ✅ `instrumentation-client.ts` - DSN, sample rates
3. ✅ `next.config.ts` - Add conditional withSentryConfig wrapper

### Utility Files (2)
4. ✅ `src/lib/sentry-utils.ts` - Uncomment error logging utilities (not createSpan)
5. ✅ `src/lib/security/security-monitor.ts` - Uncomment sendToSentry

### Error Boundaries (1)
6. ✅ `src/app/global-error.tsx` - Uncomment captureException

### Authentication (1 - Partial)
7. ⚠️ `src/app/(auth)/auth.ts` - Uncomment 3 of 5 locations (critical errors only)

### API Routes (2 - Partial)
8. ⚠️ `src/app/(chat)/api/chat/route.ts` - Uncomment 4 exceptions, skip 5 breadcrumbs
9. ⚠️ `src/app/(chat)/api/gemini-chat/route.ts` - Same pattern

### Page Components (2 - Partial)
10. ⚠️ `src/app/(chat)/chat/[id]/page.tsx` - Uncomment 3 critical errors, skip 6 breadcrumbs
11. ⚠️ `src/app/(chat)/banana-veo3/[id]/page.tsx` - Same pattern

### Documentation (1)
12. ✅ `.env.example` - Add Sentry environment variables

**Total**: 12 files (same as original plan)
**Sentry Calls**: ~18 activations (down from 50+)
**Focus**: Critical errors and security only

---

## Testing Strategy

### Unit Testing
- Mock Sentry in existing tests to avoid real API calls
- Verify error utilities work correctly

### Integration Testing
- Manual testing for each activated feature
- Sentry dashboard is the primary verification tool
- Test both success and error paths

### Environment Testing
- Test with DSN unset (Sentry should not initialize)
- Test with different sample rates
- Test PII control (on/off)

### Production Testing (Staged)
- Deploy to staging first
- Monitor Sentry quota usage for 24 hours
- Adjust sample rates if needed
- Deploy to production only after staging verification

---

## Edge Cases & Risk Mitigation

### 1. Quota Exhaustion
- **Risk**: 1% sample rate still too high for traffic volume
- **Mitigation**: Start at 1%, monitor quota, can lower to 0.5% if needed
- **Monitoring**: Set Sentry quota alert at 80%

### 2. PII Leakage
- **Risk**: `sendDefaultPii` accidentally enabled in production
- **Mitigation**: Default to false, requires explicit env var to enable
- **Verification**: Check Sentry events don't contain user IPs in production

### 3. Build Failures
- **Risk**: SENTRY_AUTH_TOKEN missing in CI
- **Mitigation**: Conditional wrapper only runs in CI/production
- **Fallback**: Build succeeds even if source map upload fails (warning only)

### 4. Duplicate Error Tracking
- **Risk**: Same error reported multiple times
- **Mitigation**: onRequestError kept commented to avoid duplication
- **Future**: Investigate and refactor if we activate onRequestError

### 5. Sensitive Data in Errors
- **Risk**: Auth tokens, passwords in error messages
- **Mitigation**: sentry-utils.ts already filters authorization headers
- **Future**: Add `beforeSend` hook for additional scrubbing

### 6. Client-Side Bot Errors
- **Risk**: Bot traffic pollutes error tracking
- **Mitigation**: 1% sample rate reduces noise
- **Future**: Add `beforeSend` filter for known bot user agents

### 7. Dev Environment Pollution
- **Risk**: Dev errors pollute production Sentry
- **Mitigation**: Use different DSNs per environment
- **Recommendation**: Create separate Sentry projects for dev/staging/prod

---

## Performance Implications

### Build Time
- **Dev builds**: No change (Sentry wrapper skipped)
- **Prod builds**: +10-30 seconds for source map upload
- **Acceptable**: One-time cost, builds fast locally

### Runtime Performance
- **Client bundle**: +~50KB gzipped (standard Sentry SDK)
- **Server overhead**: Minimal, only on 1% of requests
- **Network**: Extra requests only on errors (not every request)
- **Acceptable**: Industry standard, worth the visibility

### Sentry Quota Usage (Estimated)
- **Assumptions**: 100K requests/day
- **1% sample rate**: 1K transactions/day = 30K/month
- **Error events**: ~100-500/month (depends on code quality)
- **Required plan**: Paid plan with at least 50K transactions/month
- **Monthly cost**: ~$26-$80/month (Team plan)

**Action Required**: Verify current Sentry plan supports expected quota

---

## Rollback Plan

### If Build Fails
1. Revert next.config.ts changes (remove withSentryConfig wrapper)
2. Build should succeed without Sentry integration
3. Fix issues offline, redeploy

### If Runtime Errors Occur
1. All Sentry code is in try/catch or fail-safe
2. Application continues working even if Sentry fails
3. Emergency disable: Unset `NEXT_PUBLIC_SENTRY_DSN` env var
4. Redeploy with Sentry disabled

### If Quota Exceeded
1. Lower sample rate to 0.5% or 0.1%
2. Redeploy with new sample rate
3. Monitor quota for 24 hours
4. Upgrade Sentry plan if needed

### If Privacy Complaint
1. Verify `sendDefaultPii` is false in production
2. Check Sentry events for PII leakage
3. Add `beforeSend` scrubbing for additional protection
4. Update privacy policy if needed

---

## Success Criteria

### Build Success
- ✅ `pnpm build` completes without errors
- ✅ Source maps uploaded in production/CI builds
- ✅ Dev builds remain fast (no Sentry overhead)
- ✅ `pnpm typecheck` passes
- ✅ `pnpm lint` passes

### Configuration Success
- ✅ Sentry initializes with env var DSN
- ✅ Sentry doesn't initialize when DSN unset
- ✅ PII capture is OFF by default
- ✅ Sample rates are environment-controlled
- ✅ Different DSNs work for dev/staging/prod

### Functional Success
- ✅ Global errors captured in Sentry
- ✅ Auth errors tracked with proper tags (3 locations)
- ✅ API errors include request context (4 per route)
- ✅ Security events appear in Sentry
- ✅ Page security errors tracked (access violations)
- ✅ Stack traces are readable (source maps working)

### Privacy Success
- ✅ No user IPs in Sentry events (PII off by default)
- ✅ No auth tokens in error context
- ✅ Can enable PII via env var for debugging

### Performance Success
- ✅ Client bundle size increase < 100KB
- ✅ No noticeable runtime performance impact
- ✅ Sentry quota usage within plan limits
- ✅ Sample rate reduces noise effectively

---

## Post-Implementation Actions

### Immediate (Week 1)
1. Monitor Sentry dashboard daily for unexpected errors
2. Verify quota usage is within limits
3. Check for any PII leakage
4. Verify stack traces are readable

### Short-term (Week 2-4)
1. Adjust sample rates based on actual quota usage
2. Add error filtering (`beforeSend` hook) for known noise
3. Configure Slack/email alerts for critical errors
4. Review error patterns, add missing tracking if needed

### Medium-term (Month 2-3)
1. Investigate onRequestError hook activation
2. Consider adding selective breadcrumbs if debugging is difficult
3. Evaluate if 404 tracking is needed
4. Consider session replay (if privacy policy updated and quota allows)

### Long-term (Quarter 2)
1. Create error budget (acceptable error rates)
2. Team training on Sentry usage
3. Add automated error triage workflow
4. Evaluate upgrade to Business plan if needed

---

## Documentation Updates

### After Implementation
1. **Create**: `apps/super-chatbot/docs/monitoring/sentry-setup.md`
   - Environment variables configuration
   - How to enable/disable Sentry
   - Sample rate tuning guide
   - Privacy controls

2. **Update**: `apps/super-chatbot/docs/development/README.md`
   - Add Sentry section
   - Explain when errors are tracked
   - How to test Sentry locally

3. **Update**: `.env.example`
   - Document all Sentry env vars
   - Explain default values
   - Privacy implications

4. **Create**: `_ai/sentry-patterns.md` (for Ward)
   - Selective error tracking pattern
   - Environment-based configuration pattern
   - Privacy-first defaults

---

## Cost Analysis

### Sentry Pricing (2025)
- **Developer plan**: $0/month (10K events, 10K transactions)
- **Team plan**: $26/month (50K events, 50K transactions)
- **Business plan**: $80/month (100K events, 100K transactions)

### Expected Usage (100K req/day)
- **1% sample rate**: 30K transactions/month
- **Error events**: ~500/month (estimate)
- **Required plan**: Team ($26/month) minimum

### Cost Optimization Strategies
1. Start at 1% sample rate
2. Monitor quota closely
3. Add error filtering to reduce noise
4. Use different projects for dev/staging (don't waste quota)
5. Increase sample rate only if needed for debugging

**Recommendation**: Budget for Team plan ($26/month) minimum

---

## Agent Assignment

### Implementation Phase
- **@rob** (Implementation Engineer): Execute all 6 phases, make code changes
- **@kent** (Test Engineer): Execute Phase 7 testing, verify functionality

### Review Phase
- **@kevlin** (Code Reviewer): Review for duplication, simplicity, organization
- **@linus** (Architecture Reviewer): Verify all 6 critical issues are resolved

### Documentation Phase
- **@raymond** (Documentation): Create sentry-setup.md, update dev docs
- **@ward** (Knowledge Librarian): Extract patterns to _ai/sentry-patterns.md

### Final Phase
- **@don** (Tech Lead): Verify implementation matches updated plan, create final summary

---

## Estimated Effort

### Implementation
- **Phase 1 (Configuration)**: 30 minutes
- **Phase 2 (Utilities)**: 15 minutes
- **Phase 3 (Error Boundaries)**: 10 minutes (skipping 404)
- **Phase 4 (Auth)**: 15 minutes (selective activation)
- **Phase 5 (API)**: 20 minutes (exceptions only)
- **Phase 6 (Pages)**: 15 minutes (selective activation)

### Testing
- **Phase 7 (Testing)**: 45 minutes (comprehensive testing)

### Documentation
- **Docs update**: 30 minutes

**Total**: ~3 hours (same as original, but better quality)

---

## Risk Assessment

### CRITICAL RISKS (Mitigated)
1. ✅ **Privacy violation**: Fixed with environment-controlled PII
2. ✅ **Hardcoded config**: Fixed with env var DSN
3. ✅ **Quota exhaustion**: Fixed with 1% sample rate + monitoring

### HIGH PRIORITY RISKS (Mitigated)
1. ✅ **Build complexity**: Fixed with conditional wrapper
2. ✅ **Breadcrumb spam**: Fixed with selective activation
3. ✅ **Duplicate tracking**: Fixed by keeping onRequestError commented

### MEDIUM PRIORITY RISKS (Acceptable)
1. ⚠️ **Performance impact**: +50KB client, acceptable
2. ⚠️ **Cost**: ~$26/month, budgeted

### LOW PRIORITY RISKS (Monitored)
1. ℹ️ **Missing context**: Can add breadcrumbs later if needed
2. ℹ️ **Rare errors**: 1% sample rate might miss some, can increase

---

## Key Decisions Summary

| Issue | Decision | Rationale |
|-------|----------|-----------|
| PII Capture | Environment-controlled, default OFF | Privacy compliance, GDPR/CCPA ready |
| DSN Config | Env var, fallback to undefined | Flexibility, can disable per environment |
| Sample Rate | 1% production, env-configurable | Cost control, can tune without redeploy |
| Tracking Scope | ~18 critical calls (not 50+) | Signal over noise, errors only |
| onRequestError | Keep commented, investigate later | Avoid risk of duplicates |
| Build Config | Conditional wrapper (CI/prod only) | Fast dev builds, upload only when needed |
| Session Replay | Removed entirely | Privacy concerns, quota cost |
| 404 Tracking | Skip for now | Can add later if needed |

---

## Differences from Original Plan

### What Changed
1. **Privacy**: Added environment-controlled PII capture
2. **Configuration**: All settings use env vars, no hardcoding
3. **Sample rates**: 1% (not 10%), fully configurable
4. **Tracking scope**: 18 calls (not 50+), errors only
5. **Build config**: Conditional wrapper, dev builds unaffected
6. **Session replay**: Removed entirely

### What Stayed the Same
1. File count: 12 files
2. Implementation phases: Still 7 phases
3. Testing strategy: Manual + Sentry dashboard
4. Time estimate: ~3 hours

### Why This is Better
- ✅ **Production-ready**: Won't violate GDPR or blow quota
- ✅ **Flexible**: Can tune without redeploy
- ✅ **Cost-effective**: 10x lower sample rate = 10x lower cost
- ✅ **Maintainable**: Less noise, easier to find real issues
- ✅ **Debuggable**: Still captures critical errors with full context

---

## References

- **Sentry Next.js Docs**: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **Next.js 15 Instrumentation**: https://nextjs.org/docs/app/guides/instrumentation
- **Sentry Sampling**: https://docs.sentry.io/platforms/javascript/configuration/sampling/
- **Sentry Privacy**: https://docs.sentry.io/product/data-management-settings/scrubbing/
- **Linus's Architecture Review**: `_tasks/2025-10-07-sentry-activation/03-architecture-review.md`

---

## Conclusion

This updated plan addresses ALL 6 critical issues identified in Linus's review. We've replaced the "uncomment everything" approach with a strategic, production-ready implementation that prioritizes privacy, cost control, and signal quality.

**The Vercel Way Applied**:
- **Ship fast**: Still ~3 hours implementation
- **Ship right**: Privacy-compliant, cost-controlled, production-ready
- **Ship measurable**: Can tune sample rates, monitor quota, iterate based on data

We're not just activating Sentry. We're building a production monitoring system that will scale with the product and respect user privacy.

**Next step**: @rob to implement Phase 1-6, @kent to verify Phase 7.

---

**Don (Guillermo)**
*Tech Lead - Sentry Activation Task*
*2025-10-07*