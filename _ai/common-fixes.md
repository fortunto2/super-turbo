# Common Issues & Fixes

## Model Selection Auto-Fallback Bug

### Symptom

- `selectImageToImageModel` returns first available model instead of `null`
- Tests expecting `null` fail with actual model name

### Root Cause

```typescript
// BUGGY CODE (commit 812def1)
if (!pick && candidates.length > 0) pick = candidates[0]; // WRONG!
```

### Fix

- Remove auto-fallback line
- Implement proper 3-tier matching
- Return `null` when no match found
- See `src/lib/generation/model-utils.ts:56-73`

## Browser Globals in Server Code

### Symptom

- Linting errors: `window is not defined`, `fetch is not defined`
- Code fails on server but works in browser

### Root Cause

- Code written for browser but executed on server
- No environment guards

### Fix

```typescript
// BEFORE
const apiUrl = window.location.origin + "/api";
const response = await fetch(apiUrl);

// AFTER
const apiUrl =
  typeof window !== "undefined"
    ? window.location.origin + "/api"
    : process.env.NEXT_PUBLIC_API_URL;
const response = await fetch(apiUrl); // fetch available in Node.js 18+
```

### Prevention

- Use `@ts-check` carefully - can mask real errors
- Run `pnpm typecheck` before committing
- Keep server/client code in separate files

## Test Mock API Mismatches

### Symptom

- Tests fail after refactoring
- Error: `mockFn.execute is not a function`

### Root Cause

- Implementation changed from `fn()` to `obj.execute()`
- Tests still mock old API

### Fix

```typescript
// BEFORE
const mockCreateDocument = vi.fn();

// AFTER
const mockExecute = vi.fn();
const mockCreateDocument = { execute: mockExecute };
```

### Prevention

- Update all tests when refactoring APIs
- Search for test usages: `grep -r "mockFunctionName" src/tests/`
- Add integration tests to catch contract violations

## Temporal Test Expectations

### Symptom

- Tests expect wrong media item
- "first" returns chronologically oldest, test expects array first

### Root Cause

- Ambiguous "first" - implementation uses chronological order
- Tests assumed array order

### Fix

- Update test expectations to match chronological sorting
- Document the business logic in test comments
- See `src/tests/unit/ai-context/temporal-analysis.test.ts:122,147`

## Linting with @ts-nocheck

### Symptom

- `@ts-nocheck` directive at file top
- Masks real type errors

### Root Cause

- Quick fix to silence TypeScript errors
- Creates technical debt

### Fix

- Remove `@ts-nocheck`
- Fix underlying type errors properly
- Use `@ts-expect-error` with comment for unavoidable issues

## External API Timeout Errors in Console

### Symptom

- Console filled with error messages: `Failed to fetch generation models: Error 522`
- Console shows: `Failed to load styles: API Error: 522`
- Application works correctly despite errors

### Root Cause

- External API (`dev-editor.superduperai.co`) timeout (Cloudflare error 522)
- Code has proper fallback values but logs errors with `console.error()`
- Non-critical errors create noise in logs

### Fix

- Replace `console.error()` with comments in error handlers
- Only log when models/styles are actually available
- Keep fallback logic intact (already working correctly)

### Files Modified (2025-10-28)

- `apps/super-chatbot/src/lib/ai/api/get-styles.ts` (lines 52, 84)
- `apps/super-chatbot/src/lib/config/superduperai.ts` (lines 199, 325-335, 362-364)
- `apps/super-chatbot/src/lib/config/media-settings-factory.ts` (lines 149, 187, 377, 411)
- `apps/super-chatbot/src/app/api/config/models/route.ts` (line 30)

### Prevention

- Use `console.warn()` for non-critical issues
- Reserve `console.error()` for actual application errors
- Ensure fallback values exist before suppressing errors

## Code Pointers

- Model selection: `src/lib/generation/model-utils.ts`
- Temporal analysis: `src/lib/ai-context/temporal-analysis.ts`
- AI tools: `src/lib/ai-tools/configure-{image,video}-generation.ts`
- Test patterns: `src/tests/unit/ai-tools/`
- API error handling: `src/lib/ai/api/get-styles.ts`, `src/lib/config/superduperai.ts`
