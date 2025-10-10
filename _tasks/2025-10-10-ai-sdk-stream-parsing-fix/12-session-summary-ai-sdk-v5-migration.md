# AI SDK v5 Migration Session Summary
**Date**: 2025-10-10
**Status**: ⚠️ INCOMPLETE - Chat still has errors after message send

## Problem Statement

User was attempting to migrate from AI SDK v4 to v5, but chat stopped working:
- When sending a message in chat, no response is received
- Error: "AI SDK 4 only supports models that implement specification version 'v1'. Please upgrade to AI SDK 5"

## Root Cause Analysis

### The Core Issue
1. **Provider Version Mismatch**:
   - Azure OpenAI provider (`@ai-sdk/azure@^2.0.47`) updated to use Language Model Specification **v2**
   - Google provider (`@ai-sdk/google@^2.0.18`) also using v2 spec
   - AI SDK v4 only supports v1 specification
   - This created incompatibility

2. **Where It Fails**:
   - File: `apps/super-chatbot/src/app/(chat)/actions.ts`
   - Function: `generateTitleFromUserMessage()`
   - Line 50-58: Calls `generateText()` with `title-model`
   - `title-model` maps to Azure OpenAI `mainModel` (v2 spec)
   - AI SDK v4 rejects v2 models with error

3. **Impact**:
   - Chat creation fails because title generation fails
   - No messages can be sent or received

## Current State of Files

### Modified Files

#### ✅ `apps/super-chatbot/src/app/(chat)/actions.ts`
**Status**: Temporarily fixed with workaround
**Changes**:
- Lines 50-69: Commented out AI title generation
- Added simple fallback: takes first 8 words from user message
- TODO added to restore AI generation after v5 migration

```typescript
// TEMPORARY FIX: Return simple title based on first words until AI SDK v5 is installed
const words = messageText.trim().split(/\s+/).slice(0, 8).join(' ');
const title = words.length > 50 ? words.substring(0, 50) + '...' : words;
return title || 'New Chat';
```

#### ✅ `apps/super-chatbot/src/lib/ai/models.mock.ts`
**Status**: Fixed for AI SDK v4 compatibility
**Changes**:
- Line 1: Changed `MockLanguageModelV2` → `MockLanguageModelV1`
- Lines 5, 24, 84, 112: Updated all mock model instances to use V1

#### ✅ `apps/super-chatbot/package.json`
**Status**: Version updated but NOT installed
**Current versions in package.json**:
```json
{
  "@ai-sdk/azure": "^2.0.47",
  "@ai-sdk/google": "^2.0.18",
  "@ai-sdk/google-vertex": "^3.0.36",
  "@ai-sdk/react": "^1.2.12",
  "ai": "^5.0.65"  // ⚠️ Updated but NOT installed - still on 4.3.19
}
```

**Actual installed versions** (from previous install):
- `ai@4.3.19`
- `@ai-sdk/react@1.2.12`

#### ✅ `packages/tailwind/dist/config.js`
**Status**: Built successfully
**Action**: Ran `pnpm build` in `packages/tailwind` to fix missing dist file

#### ✅ `apps/super-chatbot/src/app/(chat)/api/chat/route.ts`
**Status**: Reverted to working AI SDK v4 code
**Changes**: Restored from commit `bee0e26` (pre-migration state)
**Uses v4 APIs**:
- `createDataStream` (not `createUIMessageStream`)
- `appendClientMessage`, `appendResponseMessages`
- `dataStream.writeData()` (not v5's `writer.write()`)

#### ✅ `apps/super-chatbot/src/app/(chat)/api/gemini-chat/route.ts`
**Status**: Reverted to working AI SDK v4 code
**Changes**: Restored from commit `bee0e26`

## Installation Attempts & Issues

### Problem: pnpm install keeps hanging/timing out

**Attempts made**:
1. ❌ `pnpm install` - Timed out after 3 minutes (resolving 2393 packages)
2. ❌ `npx @ai-sdk/codemod upgrade` - Timed out after 2 minutes
3. ❌ `pnpm install ai@5.0.65` - Timed out after 1 minute
4. ❌ `pnpm install ai@5.0.65 --prefer-offline` - Timed out after 1 minute
5. ❌ `npm install --force ai@5.0.65` - Failed with workspace protocol error

**Why it's hanging**: Likely network issues or pnpm cache problems on Windows

## What Still Doesn't Work

### ⚠️ User Reports: "ошибка все еще осталась после отправки сообщения в чат"
**Translation**: "Error still remains after sending message in chat"

This means:
1. The temporary fix in `actions.ts` may not be enough
2. There might be OTHER errors besides title generation
3. Chat API routes might still have v4/v5 compatibility issues

### Potential Remaining Issues

1. **API Routes Still Using v4 APIs**:
   - `route.ts` uses `createDataStream`, `mergeIntoDataStream`, `writeData()`
   - These are v4 APIs that might need updating for full v5 compatibility
   - But we reverted to v4 code, so they SHOULD work with v4... unless packages are mixed

2. **Mixed Package Versions**:
   - `package.json` says `ai@5.0.65`
   - Actually installed: `ai@4.3.19`
   - Provider packages: `@ai-sdk/azure@2.0.47` (requires v5)
   - This mismatch causes the v1/v2 spec error

3. **TypeScript Errors Remain** (non-blocking for runtime but indicative):
   - 150+ TypeScript errors in tools, providers, tests
   - Many related to `inputSchema` → `parameters` change
   - `LanguageModelV2` vs `LanguageModelV1` issues

## AI SDK v5 Migration Guide (from Context7)

### Key Breaking Changes

#### 1. Stream Protocol: DataStream → UIMessageStream
**v4**:
```typescript
import { createDataStream } from 'ai';

const stream = createDataStream({
  execute: (dataStream) => {
    dataStream.writeData('some data');
  }
});
```

**v5**:
```typescript
import { createUIMessageStream } from 'ai';

const stream = createUIMessageStream({
  execute: ({ writer }) => {
    writer.write({ type: 'data', value: ['some data'] });
  }
});
```

#### 2. Message ID Generation Moved
**v4**: `streamText({ experimental_generateMessageId })`
**v5**: `result.toUIMessageStreamResponse({ generateMessageId })`

#### 3. Message Persistence Changes
**v4**: Used `appendClientMessage`, `appendResponseMessages` helpers
**v5**: Use `toUIMessageStreamResponse({ originalMessages, onFinish })`

#### 4. Chunk Types Changed
**v4**: `text-delta`, single events
**v5**: `text-start`, `text-delta`, `text-end` (three-phase pattern)

#### 5. React Hooks Moved
**v4**: `import { useChat } from 'ai/react'`
**v5**: `import { useChat } from '@ai-sdk/react'`

#### 6. RSC Utilities Extracted
**v4**: `import { createStreamableValue } from 'ai'`
**v5**: `import { createStreamableValue } from '@ai-sdk/rsc'`

## Recommended Next Steps (Priority Order)

### CRITICAL - Must Do First

#### Step 1: Clean Install AI SDK v5
```bash
# Stop dev server (Ctrl+C)
cd apps/super-chatbot
rm -rf node_modules
cd ../..
rm pnpm-lock.yaml
pnpm install
```

**Why**: This will actually install `ai@5.0.65` and resolve package mismatches

**Expected Result**:
- `ai@5.0.65` installed
- `@ai-sdk/react@1.2.12` compatible with v5
- Azure/Google providers work with v5

#### Step 2: Verify Installation
```bash
cd apps/super-chatbot
pnpm list ai @ai-sdk/react
```

Should show:
- `ai@5.0.65`
- `@ai-sdk/react@1.2.12`

#### Step 3: Restore AI Title Generation
File: `apps/super-chatbot/src/app/(chat)/actions.ts`

Uncomment lines 56-68, delete lines 50-54:
```typescript
const { text: title } = await generateText({
  model: myProvider.languageModel('title-model'),
  system: `\n
  - you will generate a short title based on the first message a user begins a conversation with
  - ensure it is not more than 80 characters long
  - the title should be a summary of the user's message
  - do not use quotes or colons`,
  prompt: messageText,
});

return title;
```

### IMPORTANT - Fix API Routes for v5

#### Step 4: Update chat/route.ts for v5
File: `apps/super-chatbot/src/app/(chat)/api/chat/route.ts`

**Current (v4) code at line 703**:
```typescript
const stream = createDataStream({
  execute: async (dataStream) => {
    // ... tool setup ...

    const result = streamText({
      model: myProvider.languageModel(selectedChatModel),
      messages: enhancedMessages,
      // v4 options
      experimental_generateMessageId: generateUUID,
    });

    result.mergeIntoDataStream(dataStream);
  }
});
```

**Should change to (v5)**:
```typescript
import { createUIMessageStream, createUIMessageStreamResponse, convertToModelMessages } from 'ai';

const stream = createUIMessageStream({
  originalMessages: messages,
  execute: async ({ writer }) => {
    // ... tool setup ...

    const result = streamText({
      model: myProvider.languageModel(selectedChatModel),
      messages: convertToModelMessages(enhancedMessages),
      // NO experimental_generateMessageId here
    });

    // Merge result stream
    writer.merge(result.toUIMessageStream());
  },
  onFinish: async ({ messages, responseMessage }) => {
    // Save messages here instead of in streamText onFinish
    await saveMessages([responseMessage]);
  }
});

return createUIMessageStreamResponse({ stream });
```

**Key changes**:
1. `createDataStream` → `createUIMessageStream`
2. `execute: (dataStream)` → `execute: ({ writer })`
3. `dataStream.writeData()` → `writer.write({ type, value })`
4. `result.mergeIntoDataStream()` → `writer.merge(result.toUIMessageStream())`
5. Move message saving to `onFinish` in stream config
6. Return `createUIMessageStreamResponse({ stream })`

#### Step 5: Update gemini-chat/route.ts
Same changes as Step 4

#### Step 6: Update Tool Definitions
All files in `src/lib/ai/tools/` need changes:

**v4 tool format**:
```typescript
export const myTool = tool({
  inputSchema: z.object({ ... }),  // ❌ Renamed in v5
  execute: async (args) => { ... }
});
```

**v5 tool format**:
```typescript
export const myTool = tool({
  parameters: z.object({ ... }),  // ✅ New name
  execute: async (args) => { ... }
});
```

**Files to update** (at minimum):
- `analyze-media-reference.ts`
- `banana-inference.ts`
- `configure-audio-generation.ts`
- `configure-image-generation.ts`
- `configure-script-generation.ts`
- `configure-video-generation.ts`
- `create-document.ts`
- `update-document.ts`
- `request-suggestions.ts`
- (+ ~20 more tool files)

#### Step 7: Update Mock Models for Tests
File: `apps/super-chatbot/src/lib/ai/models.mock.ts`

Change back:
```typescript
import { MockLanguageModelV1 } from 'ai/test'; // Change to V2
// to:
import { MockLanguageModelV2 } from 'ai/test';

export const chatModel = new MockLanguageModelV2({ ... });
// etc for all 4 models
```

### OPTIONAL - Can Do Later

#### Step 8: Update Providers for v5
File: `apps/super-chatbot/src/lib/ai/providers.ts`

If you get errors about `defaultObjectGenerationMode`:
```typescript
import { LanguageModelV2Middleware } from '@ai-sdk/provider';
```

#### Step 9: Update Client Components
Files using `useChat` hook should already work since `@ai-sdk/react@1.2.12` is compatible with both v4 and v5.

But verify imports are from `@ai-sdk/react`, not `ai/react`:
```typescript
import { useChat } from '@ai-sdk/react'; // ✅ Correct
// NOT: import { useChat } from 'ai/react'; // ❌ Removed in v5
```

#### Step 10: Run Codemod (Optional)
If you want automated migration:
```bash
cd apps/super-chatbot
npx @ai-sdk/codemod@latest v5
```

This will auto-fix many issues but may not catch everything.

## Known Working State (Before Migration)

**Git commit**: `bee0e26` - "Removed commented Sentry..."
**Packages at that time**:
- `ai@4.3.16`
- `@ai-sdk/react@1.2.12`
- `@ai-sdk/azure@2.0.47`
- `@ai-sdk/google@2.0.18`

**Status**: Chat worked perfectly

**What changed since then**:
- Commit `4edab30`: WIP AI SDK 5.0 migration (incomplete)
- Azure/Google providers updated their models to v2 spec
- Now incompatible with AI SDK v4

## Error Messages Reference

### Current Error (User Reported)
```
"ошибка все еще осталась после отправки сообщения в чат"
```
**Translation**: "Error still remains after sending message in chat"

### Previous Error (Fixed by temporary patch)
```json
{
  "error": "Error in API",
  "details": "Unsupported model version. AI SDK 4 only supports models that implement specification version \"v1\". Please upgrade to AI SDK 5 to use this model.\n\nAI_UnsupportedModelVersionError: Unsupported model version..."
}
```

**Location**: `at generateText` in `actions.ts:46` → `generateTitleFromUserMessage`

### Build Errors (150+ TypeScript errors)
Main categories:
1. Tool definitions using `inputSchema` instead of `parameters`
2. `MockLanguageModelV2` vs `MockLanguageModelV1`
3. Missing `defaultObjectGenerationMode` on `LanguageModelV2`
4. Artifact server `writer.write()` format issues

## Files Touched This Session

### Modified
1. `apps/super-chatbot/package.json` - Updated ai version to 5.0.65
2. `apps/super-chatbot/src/app/(chat)/actions.ts` - Temporary fix
3. `apps/super-chatbot/src/lib/ai/models.mock.ts` - V2 → V1
4. `packages/tailwind/dist/config.js` - Built from source

### Reverted
1. `apps/super-chatbot/src/app/(chat)/api/chat/route.ts` - Back to v4
2. `apps/super-chatbot/src/app/(chat)/api/gemini-chat/route.ts` - Back to v4

### Read/Analyzed
- `apps/super-chatbot/src/lib/ai/providers.ts`
- `apps/super-chatbot/src/components/chat/chat.tsx`
- `apps/super-chatbot/src/components/chat/multimodal-input.tsx`
- `apps/super-chatbot/src/app/(chat)/banana-veo3-advanced/page.tsx`
- `apps/super-chatbot/src/app/tools/video-generator/page.tsx`

## Commands to Resume Tomorrow

### Option A: Force Clean Install (Recommended)
```bash
# Navigate to root
cd D:\projects\frontend\work\turbo-super

# Kill any running processes
taskkill /F /IM node.exe

# Clean everything
rm -rf node_modules pnpm-lock.yaml
rm -rf apps/super-chatbot/node_modules
rm -rf packages/*/node_modules

# Fresh install
pnpm install

# Verify versions
cd apps/super-chatbot
pnpm list ai @ai-sdk/react

# Should show:
# ai@5.0.65
# @ai-sdk/react@1.2.12
```

### Option B: Force Update Specific Package
```bash
cd apps/super-chatbot
pnpm update ai@5.0.65 --force
pnpm install
```

### Option C: Use npm Instead
```bash
cd apps/super-chatbot
npm install ai@5.0.65 --legacy-peer-deps
```

## Testing Checklist

After migration:
- [ ] `pnpm install` completes successfully
- [ ] `pnpm list ai` shows `ai@5.0.65`
- [ ] `pnpm dev` starts without errors
- [ ] Can open chat at `http://localhost:3003`
- [ ] Can send a message in chat
- [ ] Receive AI response
- [ ] Chat title is AI-generated (not just first words)
- [ ] Image generation works
- [ ] Video generation works
- [ ] No TypeScript errors (or at least significantly reduced)

## Resources

### Documentation Used
- AI SDK v5 Migration Guide: `/vercel/ai/ai_5_0_0` via Context7
- Key topics: "migration from v4 to v5"
- Retrieved 26 code snippets covering all breaking changes

### Relevant Git Commits
- `bee0e26` - Last known working state (AI SDK v4.3.16)
- `4edab30` - WIP incomplete v5 migration (DO NOT USE - broke chat)

### Package Versions
**Target (v5)**:
- `ai@5.0.65`
- `@ai-sdk/react@1.2.12`
- `@ai-sdk/azure@2.0.47`
- `@ai-sdk/google@2.0.18`

**Current (mixed)**:
- `ai@4.3.19` (installed)
- `ai@5.0.65` (in package.json but not installed)
- `@ai-sdk/react@1.2.12`
- `@ai-sdk/azure@2.0.47`
- `@ai-sdk/google@2.0.18`

## Questions to Ask User Tomorrow

1. **What is the exact error message you're seeing now when sending a chat message?**
   - Check browser console (F12)
   - Check dev server terminal output
   - Check Network tab for API response

2. **Did pnpm install eventually complete in the background?**
   - Check `pnpm list ai` to see actual installed version
   - If still 4.3.19, that's why chat fails

3. **Are you willing to do a clean install (delete node_modules)?**
   - This is the most reliable way to fix the package mismatch

4. **What's your preference**:
   - Full migration to v5 (takes time, more work)
   - OR temporary downgrade providers to v1-compatible versions (quick fix but outdated)

## Critical Notes

⚠️ **DO NOT COMMIT** the current state - it's in a broken mixed state:
- package.json says v5
- Actually running v4
- Temporary hacks in place

✅ **AFTER SUCCESSFUL MIGRATION**, create a proper commit:
```bash
git add .
git commit -m "Migrate to AI SDK v5

- Upgrade ai package from 4.3.19 to 5.0.65
- Update API routes to use createUIMessageStream
- Convert tools to use 'parameters' instead of 'inputSchema'
- Update mock models to LanguageModelV2
- Restore AI title generation
- All chat functionality tested and working"
```

## Summary for Tomorrow

**In one sentence**: We tried to migrate AI SDK v4 → v5 because Azure/Google providers updated to v2 spec, but pnpm install kept hanging, so we applied temporary fixes to make chat work without AI-generated titles, but user reports errors still exist when sending messages, meaning the migration is incomplete and needs to finish the install + update API routes.

**What works now**:
- Dev server can start
- Mock models compatible with v4
- Title generation won't crash (uses simple fallback)

**What doesn't work**:
- Chat messages likely still fail (user confirmed)
- AI title generation disabled
- Package versions mismatched (json vs installed)
- API routes use v4 code with v2 providers = conflict

**Blocker**: Cannot install `ai@5.0.65` due to pnpm hanging

**Next action**: Get packages installed properly, then update code
