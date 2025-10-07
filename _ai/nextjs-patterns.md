# Next.js 15 & React 19 Patterns

## Server vs Client Context

### Server-Only Code
- API routes run in Node.js context - NO `window`, NO browser globals
- Use server actions for mutations - see `src/app/api/` patterns
- Database queries only in server components or API routes

### Client Components
- Mark with `"use client"` directive at top
- Can use browser APIs (window, localStorage, fetch)
- Cannot import server-only modules

### Gotcha: Shared Code
- Code in `src/lib/` may run on both server AND client
- Always guard browser-specific code:
```typescript
// WRONG
const config = window.ENV_CONFIG;

// RIGHT
const config = typeof window !== 'undefined' ? window.ENV_CONFIG : null;
```

## Model Selection Logic

### 3-Tier Matching Strategy
- See `src/lib/generation/model-utils.ts:41-73`
1. **Exact match**: name or label equals requested model
2. **Contains match**: name/label includes requested string
3. **Base token match**: fallback to model family (e.g., "flux" for "flux-inpaint")

### Return `null` for No Match
- NEVER auto-fallback to first available model
- Let caller handle the error appropriately
- Tests verify this behavior

## AI Tool Configuration

### Tool Execution Pattern
```typescript
// Tools use .execute() method, not direct function calls
interface Tool {
  execute: (params: unknown) => Promise<Result>;
}

// Usage in implementation
const result = await params.createDocument.execute({
  kind: "image",
  title: JSON.stringify(imageParams),
});
```

### Document Creation
- `createDocument.execute()` takes `{kind, title}` - see `src/lib/ai-tools/`
- `kind` values: "image", "video", "text", "sheet"
- `title` often serialized params as JSON string

## Temporal References

### "First" means Chronologically Oldest
- Implementation: `src/lib/ai-context/temporal-analysis.ts:349`
- Sorts by timestamp ascending, returns index 0
- User says "первое изображение" = oldest image in timeline

### "Previous" means Conversation Order
- Implementation: `temporal-analysis.ts:369`
- Returns second-to-last item in array
- Array represents conversation flow, not chronological time

## Performance

### Turbo Cache Optimization
- Build tasks cached when inputs unchanged
- 6/11 tasks cached in typical builds
- See `turbo.json` for cache configuration

## Type Safety

### Strict Mode Enabled
- All function params and returns typed
- No `any` unless justified with AICODE-NOTE
- Use Zod schemas for runtime validation

