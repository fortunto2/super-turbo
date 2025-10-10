# AI SDK 5.0 Stream Parsing Fix - Current Status

**Date**: 2025-10-10
**Branch**: fix-sentry-bug
**Last Commit**: 4edab30 - "WIP: AI SDK 5.0 migration - convert writeData() to write() API"

## Problem Summary

Client-side stream parsing error when using AI SDK 5.0:
```
Error: Failed to parse stream string. Invalid code data.
    at parseDataStreamPart (index.mjs:764:11)
```

**User Impact**:
- Chat sends "привет" → redirects to main page
- No AI response visible
- Server returns 200 OK but client can't parse the stream

## Work Completed Today

### ✅ Fixed Files

1. **text/server.ts** - Converted 2 writeData() calls to write()
2. **sheet/server.ts** - Converted 3 writeData() calls to write()
3. **artifacts/server.ts** - Converted 2 writeData() calls to write()
4. **create-document.ts** - Removed custom metadata events (kind, id, title, clear, finish)
5. **update-document.ts** - Removed custom metadata events (clear, finish)
6. **route.ts** - Fixed `await writer.merge()` → `writer.merge()`, removed data-status event
7. **request-suggestions.ts** - Removed custom 'suggestion' event
8. **balance-error-handler.ts** - Removed custom 'error' event

### 📝 Key Discoveries

1. **API Change**: AI SDK 5.0 uses `write()` NOT `writeData()`
2. **Format Change**:
   ```typescript
   // WRONG (old):
   writeData({ type: 'text-delta', content: 'text' })

   // CORRECT (new):
   write({ type: 'text', value: 'text' })
   ```
3. **No Custom Events**: AI SDK 5.0 doesn't support custom stream event types
4. **Merge is Sync**: `writer.merge()` is synchronous, don't await it

## Current Issue

❌ **Error persists** - Despite fixing all writeData() calls, client still gets parsing error

## Next Steps for Tomorrow

### 1. Investigate Valid Stream Codes
- Check AI SDK 5.0 documentation for valid stream event types
- The error mentions "Invalid code" - need to understand what codes are valid
- May need to check what the `parseDataStreamPart` function expects

### 2. Verify Stream Format
- Check if the data being written matches expected format
- May need to inspect actual stream content being sent
- Check if artifacts (image/video) need different handling

### 3. Debug Strategy
- Add logging to see exact stream data being sent
- Compare with AI SDK 5.0 examples
- Check if there are other writeData() calls we missed

### 4. Possible Alternative Approaches
- Consider if artifacts should NOT use write() at all
- Check if tool responses should handle content differently
- May need to restructure how document content is streamed

## Files to Check Tomorrow

1. Search for any remaining `writeData` usage:
   ```bash
   grep -r "writeData" apps/super-chatbot/src/
   ```

2. Check image/video artifact handlers:
   - `apps/super-chatbot/src/artifacts/image/server.ts`
   - `apps/super-chatbot/src/artifacts/video/server.ts`

3. Review AI SDK 5.0 stream protocol documentation

## Command to Continue

```bash
cd D:\projects\frontend\work\turbo-super
git checkout fix-sentry-bug
pnpm dev
```

Then test by sending "привет" in chat and check browser console + server logs.

## Reference: Previous Session Summary

Full conversation context is in previous session summary. Key point: we've been progressively fixing stream writing issues across multiple sessions.
