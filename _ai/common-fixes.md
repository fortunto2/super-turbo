# Common Issues & Fixes

## Image-to-Image Generation with Smart Reference System

### Problem

AI model needs to edit existing images from chat history, but doesn't know which image URL to use.

### Solution (Implemented 2025-10-28)

The system now uses `referenceImageDescription` parameter in `nanoBananaImageGeneration` tool:

**How it works (Full Flow):**

```
User Message: "измени последнюю картинку - добавь луну"
      ↓
AI Model receives and analyzes request
      ↓
AI calls nanoBananaImageGeneration tool with:
{
  prompt: "add moon to the image",
  referenceImageDescription: "последнюю картинку"
}
      ↓
Tool execution (nano-banana-chat-image-generation.ts):
  1. Creates enhanced message:
     "измени последнюю картинку - добавь луну\n\nReference: последнюю картинку"
  2. Calls analyzeImageContext() with enhanced message
      ↓
  Context Analyzer (ai-powered-analyzer.ts):
    → Fetches chat media via getChatMediaArtifacts()
    → Uses LLM to analyze which image user means
    → Returns sourceUrl with confidence level
      ↓
  3. Tool receives normalizedSourceUrl (e.g., "https://...")
  4. Prepares nanoBananaParams with sourceImageUrl
  5. Calls nanoBananaProvider.generateImage(params)
      ↓
Nano Banana Provider (nano-banana.ts):
  1. Detects image-to-image mode (sourceImageUrl present)
  2. Fetches source image as base64
  3. Builds Gemini API request:
     parts: [
       { text: "add moon to the image..." },
       { inlineData: { mimeType: "image/png", data: "base64..." } }
     ]
  4. Calls Gemini 2.5 Flash Image API
  5. Returns generated image
      ↓
Result returned to user: Edited image with moon added
```

**Key Components:**

1. **AI Tool** (`nanoBananaImageGeneration`): Accepts natural language reference
2. **Context Analyzer** (`analyzeImageContext`): AI-powered image finder
3. **History Fetcher** (`getChatMediaArtifacts`): Gets all media from DB
4. **Provider** (`nanoBananaProvider`): Handles both text-to-image and image-to-image

**Supported reference types:**

- Position: "last image", "first picture", "second photo", "latest", "recent"
- Content: "with cat", "with dragon", "sunset photo", "portrait image"
- Source: "I uploaded", "you generated", "from me", "your creation"
- Combined: "last image you generated", "first photo I uploaded"
- Russian: "последняя картинка", "та что с драконом", "первое изображение"

**Implementation files:**

- Tool: `src/lib/ai/tools/nano-banana-chat-image-generation.ts`
- Provider: `src/lib/ai/providers/nano-banana.ts`
- System prompt: `src/lib/ai/prompts.ts`
- Context analyzer: `src/lib/ai/context/ai-powered-analyzer.ts`
- History fetcher: `src/lib/db/queries.ts` (getChatMediaArtifacts)

**CRITICAL FIX (2025-10-28):** `getChatMediaArtifacts` was only checking TEXT parts, missing TOOL-RESULT parts!  
✅ **Fixed:** Now checks both text artifacts AND tool-result parts from Nano Banana and other tools

**Code Example (Provider):**

```typescript
// In nano-banana.ts
async generateImage(params: GeminiImageParams) {
  const isImageToImage = !!params.sourceImageUrl;

  // Build request parts
  const parts: any[] = [{ text: enhancedPrompt }];

  // If image-to-image, add source image
  if (isImageToImage && params.sourceImageUrl) {
    const imageBase64 = await this.fetchImageAsBase64(params.sourceImageUrl);
    parts.push({
      inlineData: {
        mimeType: 'image/png',
        data: imageBase64,
      },
    });
  }

  // Call Gemini API with parts
  const response = await fetch(geminiApiUrl, {
    method: 'POST',
    body: JSON.stringify({
      contents: [{ role: 'user', parts }],
      generationConfig: { responseModalities: ['Image'] }
    })
  });
}
```

**Benefits:**

- ✅ AI model doesn't need to know exact URLs
- ✅ Works with natural language references
- ✅ Supports both Russian and English
- ✅ Automatically handles ambiguous references
- ✅ Backward compatible (current attachments still work)
- ✅ Unified API for text-to-image and image-to-image
- ✅ Direct integration with Gemini 2.5 Flash Image

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

## AI Analyzer LLM Response Parsing Failures

### Symptom (2025-10-28)

- Logs show: `[AI Analyzer] Failed to parse LLM response:`
- Context analyzer finds media but returns `sourceUrl: undefined`
- Image-to-image operations fail with "Reference image description provided but no image found"

### Root Cause

- `analyzeMediaReferenceWithLLM` **exceeded token limit** ❌
- Long prompt (300+ words) + complex response requirements
- `maxOutputTokens: 300` too small - JSON truncated mid-string
- Error: `finishReason: 'length'` → `Unterminated string in JSON`
- Truncated JSON cannot be parsed

### Fix (2025-10-28)

**1. Increase token limit and simplify prompt:**

```typescript
// BEFORE: Token limit exceeded
const longPrompt = `You are an AI context analyzer... [300+ words]`;
const { object } = await generateObject({
  model: myProvider.languageModel("chat-model"),
  prompt: longPrompt,
  schema: analysisSchema,
  maxOutputTokens: 300, // ❌ Too small - JSON truncated!
});
// Error: finishReason: 'length', JSON parse error

// AFTER: Concise prompt + larger limit
const prompt = `Analyze user's ${mediaType} request.
User message: "${userMessage}"
Available media: ${mediaList}

Rules:
- "last" → most recent
- Editing existing → intent: "edit"
- Keep reasoning under 10 words`;

const { object } = await generateObject({
  model: myProvider.languageModel("chat-model"),
  prompt,
  schema: analysisSchema,
  maxOutputTokens: 500, // ✅ Enough for full response
});
```

### Files Modified (2025-10-28)

- `apps/super-chatbot/src/lib/ai/context/ai-powered-analyzer.ts`
  - Simplified prompt from 300+ to ~100 words
  - Increased `maxOutputTokens` from 300 to 500
  - Added "max 10 words" constraints for string fields
  - Added comprehensive debug logging

### Prevention

- **Check `finishReason` in errors**: `'length'` = token limit exceeded
- **Start with large token limits** (500-1000) and optimize down
- **Keep prompts concise**: Use bullet points, not paragraphs
- **Add length constraints**: "max N words" in prompt instructions
- **Use `generateObject`** for structured outputs (not `generateText`)
- **Monitor response sizes** in logs before deploying

## Code Pointers

- Model selection: `src/lib/generation/model-utils.ts`
- Temporal analysis: `src/lib/ai-context/temporal-analysis.ts`
- AI tools: `src/lib/ai-tools/configure-{image,video}-generation.ts`
- Test patterns: `src/tests/unit/ai-tools/`
- API error handling: `src/lib/ai/api/get-styles.ts`, `src/lib/config/superduperai.ts`
- **AI context analysis:** `src/lib/ai/context/ai-powered-analyzer.ts`
- **Structured LLM output:** Use `generateObject` with Zod schemas
