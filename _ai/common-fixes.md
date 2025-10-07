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
const apiUrl = window.location.origin + '/api';
const response = await fetch(apiUrl);

// AFTER
const apiUrl = typeof window !== 'undefined' 
  ? window.location.origin + '/api'
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

## Code Pointers
- Model selection: `src/lib/generation/model-utils.ts`
- Temporal analysis: `src/lib/ai-context/temporal-analysis.ts`
- AI tools: `src/lib/ai-tools/configure-{image,video}-generation.ts`
- Test patterns: `src/tests/unit/ai-tools/`

