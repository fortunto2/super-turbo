# AICODE Comment System

## Purpose
Preserve critical knowledge and context directly in code for AI assistants and human developers.

## Three Comment Types

### AICODE-NOTE
**Purpose**: Persist critical knowledge

**When to use**:
- Complex logic that isn't obvious from code
- Integration quirks with external services
- Performance considerations
- Security implications
- Business logic rationale

**Examples**:
```typescript
// AICODE-NOTE: SuperDuperAI API requires 2-second delay between requests
// to avoid rate limiting. This is enforced at provider level.
await sleep(2000);

// AICODE-NOTE: We use temporal "first" to mean chronologically oldest,
// not array position. This matches user mental model ("первое изображение").
const sorted = media.sort((a, b) => a.timestamp - b.timestamp);

// AICODE-NOTE: Browser window check required because this code runs on 
// server during SSR but needs browser APIs for client hydration.
const config = typeof window !== 'undefined' ? window.ENV : serverConfig;
```

### AICODE-TODO
**Purpose**: Actionable follow-ups scoped to code location

**When to use**:
- Known refactoring opportunities
- Performance optimizations to implement
- Missing error handling
- Incomplete features

**Examples**:
```typescript
// AICODE-TODO: Add retry logic with exponential backoff
// Current implementation fails immediately on network error
const response = await fetch(url);

// AICODE-TODO: Extract to shared utility in @turbo-super/shared
// This pattern is duplicated in 3+ files
function formatBytes(bytes: number): string { ... }

// AICODE-TODO: Validate with Zod schema instead of manual checks
// See src/lib/security/ for patterns
if (!email || !email.includes('@')) { ... }
```

### AICODE-ASK
**Purpose**: Questions needing human decisions

**When to use**:
- Ambiguous requirements
- Multiple valid approaches
- Business logic clarification needed
- Security/privacy decisions

**Examples**:
```typescript
// AICODE-ASK: Should "previous image" mean:
// - Previous in conversation order (current implementation)
// - Previous chronologically?
// - Second-to-last in sorted array?
const previous = media[media.length - 2];

// AICODE-ASK: Rate limit should be per-user or per-IP?
// Current: per-user. Consider per-IP for anonymous users?
const limit = await getRateLimit(session.userId);

// AICODE-ASK: Should we cache model list or fetch fresh each time?
// Trade-off: staleness vs API cost
const models = await fetchModels();
```

**Important**: Convert ASK → NOTE once resolved!

## Workflow Integration

### Before Editing
```bash
# Search for existing AICODE comments in target files
grep -r "AICODE" src/lib/generation/

# Check for unresolved ASKs
grep -r "AICODE-ASK" src/
```

### During Development
1. Add AICODE-NOTE for non-obvious decisions
2. Add AICODE-TODO for known follow-ups
3. Add AICODE-ASK for questions
4. Keep comments concise and colocated

### After Resolution
```typescript
// BEFORE (unresolved)
// AICODE-ASK: Should we return null or throw error when model not found?
if (!model) return candidates[0]; // Auto-fallback

// AFTER (resolved to NOTE)
// AICODE-NOTE: Return null when model not found. Caller handles error.
// This prevents silent failures and allows proper error messages.
if (!model) return null;
```

## Best Practices

### DO ✅
```typescript
// ✅ Specific and actionable
// AICODE-NOTE: Stripe webhook signature verification requires raw body.
// Don't use bodyParser middleware before this route.

// ✅ Explains WHY, not WHAT
// AICODE-NOTE: Manual JSON parsing prevents prototype pollution attack
// via __proto__ key injection in user input.
const data = JSON.parse(body);

// ✅ Points to related code
// AICODE-TODO: Consolidate with similar logic in src/lib/auth/session.ts
// Both check admin permissions but use different email patterns.
```

### DON'T ❌
```typescript
// ❌ Obvious from code
// AICODE-NOTE: This function adds two numbers
function add(a: number, b: number) { return a + b; }

// ❌ Too vague
// AICODE-TODO: Improve this

// ❌ Should be in external docs
// AICODE-NOTE: TypeScript is a typed superset of JavaScript developed by Microsoft...

// ❌ Outdated/stale
// AICODE-TODO: Switch from Webpack to Vite
// (Project already uses Vite)
```

## Comment Density Guidelines

### High Density (Many AICODE comments)
- Security-critical code (auth, payment, validation)
- External API integrations
- Complex business logic
- Performance-sensitive paths

### Low Density (Few AICODE comments)
- Self-documenting CRUD operations
- Standard React components
- Simple utilities
- Generated code (migrations, types)

## Search Patterns

### Find All AICODE Comments
```bash
grep -r "AICODE" src/ --include="*.ts" --include="*.tsx"
```

### Find Unresolved Questions
```bash
grep -r "AICODE-ASK" src/
```

### Find TODOs by Category
```bash
grep -r "AICODE-TODO.*performance" src/
grep -r "AICODE-TODO.*refactor" src/
grep -r "AICODE-TODO.*security" src/
```

### Count Comments by Type
```bash
grep -r "AICODE-NOTE" src/ | wc -l
grep -r "AICODE-TODO" src/ | wc -l
grep -r "AICODE-ASK" src/ | wc -l
```

## Integration with AI Workflow

### Phase 1: Planning
- Review existing AICODE comments in related files
- Identify patterns and gotchas
- Add new ASKs for unclear requirements

### Phase 2: Implementation
- Add NOTEs for non-obvious decisions
- Add TODOs for known follow-ups
- Convert ASKs to NOTEs when resolved

### Phase 3: Review
- Check for stale comments
- Ensure ASKs are resolved or escalated
- Verify TODOs are tracked

## Real Examples from Codebase

### Model Selection Bug
```typescript
// AICODE-NOTE: Do NOT auto-fallback to first model when no match found.
// Commit 812def1 introduced this bug. Return null to let caller handle error.
// Tests verify this behavior in model-utils.test.ts
if (!pick) return null;
```

### Browser vs Server Context
```typescript
// AICODE-NOTE: This code runs on both server (SSR) and client (hydration).
// Guard all browser APIs with typeof window check.
// See packages/api/src/superduperai/config.ts:62 for previous bug.
if (typeof window !== 'undefined') {
  // Browser-only code
}
```

### Temporal Analysis Semantics
```typescript
// AICODE-NOTE: "First" means chronologically oldest, not array index.
// User expectation: "первое изображение" = first image in timeline.
// See temporal-analysis.test.ts:122 for test validation.
const sorted = media.sort((a, b) => a.timestamp - b.timestamp);
return sorted[0];
```

## Statistics (as of 2025-10-04)
- **148 AICODE comments** across 54 files
- Primary locations:
  - `src/lib/` - Core logic and utilities
  - `src/app/api/` - API routes
  - `src/artifacts/` - Artifact rendering

## Code Pointers
- Search AICODE: `grep -r "AICODE" src/`
- Examples: `src/lib/generation/model-utils.ts`
- Examples: `src/lib/ai-context/temporal-analysis.ts`
- Examples: `packages/api/src/superduperai/config.ts`

