# Testing Patterns & Gotchas

## Vitest Testing Patterns

### Mocking `.execute()` Pattern
- When testing tools that use `.execute()` method, mock the object with execute property
- See `src/tests/unit/ai-tools/configure-image-generation.test.ts:16-20`
```typescript
const mockExecute = vi.fn();
const mockCreateDocument = { execute: mockExecute };
```

### Test Expectations vs Implementation
- **Always verify implementation behavior first** - don't assume from test names
- Temporal "first" means chronologically oldest, not array index - see `src/lib/ai-context/temporal-analysis.ts:349`
- Temporal "previous" means second-to-last in conversation, not chronological - see `temporal-analysis.ts:369`

### Model Selection Testing
- `selectImageToImageModel` returns `null` when no match found (not auto-fallback)
- See `src/lib/generation/model-utils.ts:56-73` for 3-tier matching strategy
- Tests should verify `null` returns for edge cases (empty name, null, no match)

### Zod Schema Validation in Tests
- Use `safeParse()` for validation tests to avoid throwing
- Check `result.success` boolean, not try/catch blocks
- See `src/tests/unit/security/input-validation.test.ts` patterns

## Common Gotchas

### Browser vs Server Context
- Never use `window` or `fetch` in server-side code without guards
- Fixed in `packages/api/src/superduperai/config.ts:62,74`
- Use `globalThis` or environment checks

### Test Mock Data
- Timestamps must be realistic (ISO 8601 strings or Date objects)
- Array order vs chronological order - be explicit in test setup
- Mock data should represent actual API responses, not idealized data

### API Contract Changes
- When refactoring from `fn()` to `obj.execute()`, update ALL test mocks
- Search codebase for mock usage: `grep -r "mock.*FunctionName" src/tests/`
- Document breaking changes in commit messages

## Performance

### Test Execution Speed
- Unit tests with proper mocking: ~50-100ms each
- Integration tests calling APIs: 500-2000ms each
- Use `vi.fn()` instead of real implementations for unit tests

## Test Organization

### File Structure
- `src/tests/unit/` - Pure logic, fully mocked
- `src/tests/integration/` - API routes, database interactions
- `src/tests/e2e/` - Playwright full user flows

### Naming Conventions
- Test files: `*.test.ts` (not `*.spec.ts`)
- Integration tests: `*.integration.test.ts`
- E2E tests: `*.e2e.test.ts`

