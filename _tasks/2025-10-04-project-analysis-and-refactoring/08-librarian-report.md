# Knowledge Extraction Report

**Date**: 2025-10-04
**Librarian**: Ward Cunningham
**Task**: Extract learnings from project analysis and refactoring

## Summary

Extracted key patterns, gotchas, and fixes from comprehensive project analysis into `_ai/` knowledge base. Created 3 new files documenting critical learnings for future development.

## Files Created/Updated

### 1. `_ai/testing.md` - Testing Patterns & Gotchas

**Key Content**:
- Vitest `.execute()` mocking pattern for tool testing
- Test expectations vs implementation verification methodology
- Model selection testing patterns (null returns, no auto-fallback)
- Zod schema validation in tests using `safeParse()`
- Browser vs server context testing gotchas
- Test organization and file structure conventions

**Code Pointers Added**:
- `src/tests/unit/ai-tools/configure-image-generation.test.ts:16-20`
- `src/lib/ai-context/temporal-analysis.ts:349,369`
- `src/lib/generation/model-utils.ts:56-73`
- `src/tests/unit/security/input-validation.test.ts`

### 2. `_ai/nextjs-patterns.md` - Next.js 15 & React 19 Patterns

**Key Content**:
- Server vs client context separation
- Server-only code restrictions (no `window`, browser globals)
- 3-tier model selection matching strategy
- Tool execution pattern with `.execute()` method
- Temporal reference interpretation (chronological vs conversation order)
- Document creation API patterns
- Turbo cache optimization insights

**Code Pointers Added**:
- `src/lib/generation/model-utils.ts:41-73`
- `src/lib/ai-context/temporal-analysis.ts:349,369`
- `src/lib/ai-tools/`
- `turbo.json`

### 3. `_ai/common-fixes.md` - Common Issues & Fixes

**Key Content**:
- Model selection auto-fallback bug (commit 812def1)
- Browser globals in server code issues
- Test mock API mismatches after refactoring
- Temporal test expectations corrections
- `@ts-nocheck` directive problems

**Specific Fixes Documented**:
- Remove auto-fallback: `if (!pick && candidates.length > 0) pick = candidates[0];`
- Environment guards: `typeof window !== 'undefined'`
- Mock pattern: `{ execute: vi.fn() }`
- Linting cleanup patterns

**Code Pointers Added**:
- `src/lib/generation/model-utils.ts`
- `src/lib/ai-context/temporal-analysis.ts`
- `src/lib/ai-tools/configure-{image,video}-generation.ts`
- `src/tests/unit/ai-tools/`

## Key Learnings Extracted

### 1. Testing Anti-Patterns Discovered
- **Auto-fallback masks errors**: Model selection should return `null`, not fallback to first available
- **Test names ≠ implementation**: Always verify actual behavior before fixing tests
- **Mock API drift**: Tests break when implementation refactored but mocks not updated

### 2. Architecture Insights
- **3-tier matching strategy**: Exact → Contains → Base token (prevents over-eager matches)
- **Tool execution pattern**: `.execute()` method for consistent async tool invocation
- **Temporal semantics**: "first" = chronologically oldest, "previous" = conversation order

### 3. Next.js 15 Gotchas
- **Server context**: No browser globals in API routes or server components
- **Type guards required**: Shared lib code needs `typeof window !== 'undefined'`
- **Fetch available**: Node.js 18+ has native fetch, no need for polyfills

### 4. Quality Practices
- **Remove `@ts-nocheck`**: Masks real type errors, creates technical debt
- **Integration test coverage**: Catches API contract violations that unit tests miss
- **Zod schemas first**: Runtime validation prevents type mismatches in production

## Impact on Future Development

### Immediate Benefits
1. **Faster debugging**: Common issues now documented with fixes
2. **Test quality**: Clear patterns for Vitest mocking and expectations
3. **Architecture clarity**: 3-tier matching strategy documented for reuse

### Long-term Value
1. **Onboarding**: New developers can reference `_ai/` for project patterns
2. **Consistency**: Documented patterns ensure uniform implementation
3. **Technical debt reduction**: Known anti-patterns can be avoided

## Metrics

- **Files created**: 3
- **Code pointers**: 15+
- **Patterns documented**: 12
- **Gotchas captured**: 8
- **Fixes documented**: 5

## Next Steps

1. ✅ Knowledge extracted to `_ai/`
2. ✅ Code pointers validated
3. ✅ Patterns categorized by topic
4. 📝 Consider adding `_ai/zod-patterns.md` for validation best practices
5. 📝 Monitor if developers reference these docs in future work

---

**Knowledge base now contains tactical, actionable patterns extracted from real project work.**

