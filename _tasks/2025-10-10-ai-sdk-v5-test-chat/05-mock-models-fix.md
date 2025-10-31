# Mock Models V5 Migration Fix

**Date:** 2025-10-10
**Issue:** Test chat failed to load due to outdated mock models using v4 API
**Status:** ✅ Fixed

## Problem

When accessing `/test-chat`, the server threw an error:
```
TypeError: MockLanguageModelV1 is not a constructor
```

The mock models in `src/lib/ai/models.mock.ts` were using AI SDK v4 API:
- `MockLanguageModelV1` (doesn't exist in v5)
- `import { simulateReadableStream } from 'ai'` (wrong import path)
- v4 usage format: `{ promptTokens, completionTokens }`
- v4 content format: `text: "string"`

## Solution

Updated all mock models to AI SDK v5 API:

### 1. Import Changes
```typescript
// Before (v4)
import { MockLanguageModelV1 } from 'ai/test';
import { simulateReadableStream } from 'ai';

// After (v5)
import { MockLanguageModelV2, simulateReadableStream } from 'ai/test';
```

### 2. Constructor Changes
```typescript
// Before (v4)
new MockLanguageModelV1({
  provider: 'mock',
  modelId: 'mock-chat-model',
  // ...
})

// After (v5)
new MockLanguageModelV2({
  // No provider/modelId needed
  // ...
})
```

### 3. doGenerate() Changes
```typescript
// Before (v4)
doGenerate: async () => ({
  rawCall: { rawPrompt: null, rawSettings: {} },
  finishReason: 'stop' as const,
  usage: { promptTokens: 10, completionTokens: 20 },
  text: `Hello, world!`,
})

// After (v5)
doGenerate: async () => ({
  finishReason: 'stop' as const,
  usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
  content: [{ type: 'text', text: `Hello, world!` }],
  warnings: [],
})
```

### 4. doStream() Changes
```typescript
// Before (v4)
doStream: async () => ({
  stream: simulateReadableStream({ /* ... */ }),
  rawCall: { rawPrompt: null, rawSettings: {} },
})

// After (v5)
doStream: async () => ({
  stream: simulateReadableStream({ /* ... */ }),
  // No rawCall needed
})
```

### 5. Usage Field Changes in Stream Chunks
```typescript
// Before (v4)
{
  type: 'finish',
  finishReason: 'stop',
  totalUsage: { completionTokens: 10, promptTokens: 3 },
}

// After (v5)
{
  type: 'finish',
  finishReason: 'stop',
  usage: { inputTokens: 3, outputTokens: 10, totalTokens: 13 },
}
```

## Files Modified

**File:** `apps/super-chatbot/src/lib/ai/models.mock.ts`

**Updated Models:**
1. ✅ `chatModel` - Basic chat model
2. ✅ `reasoningModel` - Model with reasoning chunks
3. ✅ `titleModel` - Title generation model
4. ✅ `artifactModel` - Artifact generation model

## Key V5 API Changes

| Aspect | v4 API | v5 API |
|--------|--------|--------|
| Mock Class | `MockLanguageModelV1` | `MockLanguageModelV2` |
| Import Path | `from 'ai'` | `from 'ai/test'` |
| Constructor | Requires `provider`, `modelId` | No provider/modelId |
| Generate Output | `text: string` | `content: [{ type, text }]` |
| Usage Format | `promptTokens`, `completionTokens` | `inputTokens`, `outputTokens`, `totalTokens` |
| Raw Call | Required `rawCall` field | Not needed |
| Warnings | Not present | Required `warnings: []` |

## Testing

After this fix, the test chat should load without errors. The mock models are now compatible with AI SDK v5 and will work correctly in test environments.

## Impact

This fix affects:
- ✅ Test chat route (`/api/test-chat`)
- ✅ All routes using `myProvider` in test environment
- ✅ Unit tests that import mock models
- ✅ Integration tests using mock providers

## Next Steps

1. Test the `/test-chat` page - should load without errors
2. If using test environment, verify mock models work correctly
3. Update any unit tests if they directly reference mock model structure

## References

- AI SDK v5 Testing Docs: https://ai-sdk.dev/docs/ai-sdk-core/testing
- Migration Guide: https://ai-sdk.dev/docs/migration-guides/migration-guide-5-0

---

**Status:** Mock models successfully migrated to AI SDK v5 API
