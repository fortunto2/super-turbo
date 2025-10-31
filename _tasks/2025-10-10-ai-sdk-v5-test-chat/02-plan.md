# Implementation Plan: AI SDK v5 Test Chat Page

**Date**: 2025-10-10
**Task**: Create isolated test chat page using AI SDK v5
**Status**: Ready for implementation

## Executive Summary

Create a minimal, isolated test chat page at `/test-chat` to validate AI SDK v5 functionality. This will serve as a working reference implementation to understand the correct v5 patterns before fixing the main chat.

## Problem Analysis

### Current State (from session summary analysis)
**Mixed package versions:**
- `package.json` declares `ai@5.0.65` but `ai@4.3.19` is actually installed
- Provider packages (`@ai-sdk/azure@2.0.47`, `@ai-sdk/google@2.0.18`) require v5 (spec v2)
- API routes reverted to v4 code but incompatible with v2-spec providers
- Result: Chat breaks when sending messages

**Root cause:**
- AI SDK v4 only supports Language Model Spec v1
- Azure/Google providers updated to Spec v2
- Mismatch causes: "Unsupported model version" errors

### Research Findings

**Existing implementation patterns found:**
- Main chat: `apps/super-chatbot/src/components/chat/chat.tsx`
  - Uses `useChat` from `@ai-sdk/react@1.2.12` (already correct!)
  - Line 4: `import { useChat } from "@ai-sdk/react";` ✅
  - Lines 124-163: Hook usage with proper error handling

- Chat API route: `apps/super-chatbot/src/app/(chat)/api/chat/route.ts`
  - Lines 1-7: Uses v4 APIs (`createDataStream`, `appendClientMessage`, `appendResponseMessages`)
  - Line 703-1033: Complex `createDataStream` with tools, onFinish callback
  - Line 901: `experimental_generateMessageId: generateUUID` (v4 pattern)
  - Line 994: `dataStream.writeData()` (v4 API)

**AI SDK v5 Key Changes (from Context7 docs):**

1. **Stream Protocol Change:**
   - v4: `createDataStream` → v5: `createUIMessageStream`
   - v4: `dataStream.writeData()` → v5: `writer.write({ type, value })`
   - v4: `result.mergeIntoDataStream()` → v5: `writer.merge(result.toUIMessageStream())`

2. **Message ID Generation Moved:**
   - v4: `streamText({ experimental_generateMessageId })`
   - v5: `result.toUIMessageStreamResponse({ generateMessageId })`

3. **Message Persistence:**
   - v4: Manual `appendClientMessage` + `appendResponseMessages` in `onFinish`
   - v5: Automatic via `toUIMessageStreamResponse({ originalMessages, onFinish })`
   - v5 `onFinish`: receives `{ messages, responseMessage }` already in UIMessage format

4. **Client Hook (Already correct!):**
   - v4: `import { useChat } from 'ai/react'`
   - v5: `import { useChat } from '@ai-sdk/react'` ✅ Already using this!

5. **Response Format:**
   - v4: `return new Response(stream)`
   - v5: `return result.toUIMessageStreamResponse()`

## Implementation Strategy

### Phase 1: Install AI SDK v5 Properly
**CRITICAL: Must complete before coding**

The session summary shows pnpm kept timing out. Try these approaches:

```bash
# Approach 1: Clean install (recommended)
cd D:\projects\frontend\work\turbo-super
rm -rf node_modules pnpm-lock.yaml
rm -rf apps/super-chatbot/node_modules
pnpm install

# Approach 2: Force specific package (if approach 1 fails)
cd D:\projects\frontend\work\turbo-super
pnpm update ai@5.0.65 --force --workspace-root

# Verify installation
cd apps/super-chatbot
pnpm list ai @ai-sdk/react
# Should show: ai@5.0.65, @ai-sdk/react@1.2.12
```

**If installation still hangs:**
- Try with npm: `npm install ai@5.0.65 --legacy-peer-deps`
- Check network/firewall settings
- Clear pnpm cache: `pnpm store prune`

### Phase 2: Create Minimal Test Chat (No Tools, No Complexity)

**Goal:** Prove AI SDK v5 streaming works with simplest possible implementation.

## Implementation Plan

### 1. Types & Validation (Foundation)

**File**: `apps/super-chatbot/src/app/(chat)/api/test-chat/schema.ts`

```typescript
import { z } from "zod";

// Minimal schema for test chat - only essentials
export const testChatRequestSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
});

export type TestChatRequest = z.infer<typeof testChatRequestSchema>;
```

**Why:** Start with minimal validation to isolate v5 streaming issues.

### 2. API Route (v5 Pattern)

**File**: `apps/super-chatbot/src/app/(chat)/api/test-chat/route.ts`

**Pattern to follow:** Context7 docs "AI SDK 5.0 Advanced Message Persistence"

```typescript
import { streamText } from "ai";
import { myProvider } from "@/lib/ai/providers";
import { auth } from "@/app/(auth)/auth";
import { testChatRequestSchema } from "./schema";
import { generateUUID } from "@/lib/utils";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    // 1. Parse and validate request
    const json = await request.json();
    const { message } = testChatRequestSchema.parse(json);

    // 2. Check authentication
    const session = await auth();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // 3. Simple message format (no complex parts/attachments)
    const messages = [
      {
        role: "user" as const,
        content: message,
      },
    ];

    // 4. Stream with AI SDK v5 pattern
    const result = streamText({
      model: myProvider.languageModel("chat-model"), // Use default model
      system: "You are a helpful assistant. Keep responses concise.",
      messages,
      // NO experimental_generateMessageId here (v4 pattern)
    });

    // 5. Return with v5 API (this is where ID generation happens)
    return result.toUIMessageStreamResponse({
      generateMessageId: generateUUID, // v5: moved from streamText
      // onFinish optional for now - just testing streaming
    });
  } catch (error) {
    console.error("Test chat error:", error);
    return new Response(
      JSON.stringify({
        error: "Test chat failed",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
```

**Key v5 changes demonstrated:**
- ✅ No `createDataStream` - use `streamText` directly
- ✅ No `experimental_generateMessageId` in `streamText`
- ✅ Use `result.toUIMessageStreamResponse()`
- ✅ Pass `generateMessageId` to response method

**What we're NOT including (for simplicity):**
- ❌ Database persistence (test only)
- ❌ Tools/function calling
- ❌ Complex message parts
- ❌ Attachments
- ❌ Chat history
- ❌ Resumable streams

### 3. Test Chat Page Component

**File**: `apps/super-chatbot/src/app/(chat)/test-chat/page.tsx`

**Pattern to follow:** Existing `chat.tsx` but simplified

```typescript
"use client";

import { useChat } from "@ai-sdk/react"; // Already correct import!
import { useState } from "react";

export default function TestChatPage() {
  const [input, setInput] = useState("");

  const { messages, sendMessage, status, error } = useChat({
    api: "/api/test-chat",
    // No id, no initialMessages - keep it simple
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status !== "ready") return;

    sendMessage({ text: input });
    setInput("");
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">AI SDK v5 Test Chat</h1>
        <p className="text-sm text-gray-600">
          Status: {status} | Messages: {messages.length}
        </p>
        {error && (
          <div className="p-2 bg-red-100 text-red-800 rounded mt-2">
            Error: {error.message}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-3 rounded ${
              message.role === "user"
                ? "bg-blue-100 ml-auto max-w-[80%]"
                : "bg-gray-100 mr-auto max-w-[80%]"
            }`}
          >
            <div className="font-semibold text-sm mb-1">{message.role}</div>
            <div>{message.content}</div>
          </div>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={status !== "ready"}
          className="flex-1 p-2 border rounded"
        />
        <button
          type="submit"
          disabled={status !== "ready" || !input.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Send
        </button>
      </form>
    </div>
  );
}
```

**Key points:**
- ✅ Already using correct v5 import: `@ai-sdk/react`
- ✅ Simple `useChat` hook usage
- ✅ No complex state management
- ✅ Direct error display for debugging
- ✅ Status indicator to see connection state

### 4. Route Configuration

**File**: `apps/super-chatbot/src/app/(chat)/test-chat/layout.tsx` (if needed)

Likely not needed - can inherit from `(chat)` group layout.

### 5. Testing Strategy

**Manual testing steps:**

1. **Verify package installation:**
   ```bash
   cd apps/super-chatbot
   pnpm list ai
   # Should show: ai@5.0.65
   ```

2. **Start dev server:**
   ```bash
   pnpm dev
   ```

3. **Navigate to test page:**
   - Open: `http://localhost:3003/test-chat`

4. **Test basic functionality:**
   - [ ] Page loads without errors
   - [ ] Input field is enabled (status: "ready")
   - [ ] Can type message
   - [ ] Send button becomes enabled with text
   - [ ] After send: Status changes to "submitted" → "streaming"
   - [ ] Message appears in UI as user message
   - [ ] Assistant response streams in character by character
   - [ ] Status returns to "ready" after complete
   - [ ] Can send follow-up messages

5. **Test error scenarios:**
   - [ ] Send empty message (should be blocked by disabled button)
   - [ ] Send while streaming (button should be disabled)
   - [ ] Check browser console for errors
   - [ ] Check network tab for API response format

6. **Validate v5 streaming format:**
   - Open DevTools → Network tab
   - Send message
   - Click on `/api/test-chat` request
   - Check Response tab - should see Server-Sent Events format:
     ```
     0:"text-part-content-here"
     1:"more-content"
     ```

**Success criteria:**
- ✅ Message sends successfully
- ✅ Response streams back (visible character-by-character)
- ✅ No console errors
- ✅ Status changes correctly: ready → submitted → streaming → ready
- ✅ Multiple messages work

**Failure investigation:**
- ❌ If "Unsupported model version" error → ai package not actually v5
- ❌ If "Failed to parse stream" → API returning wrong format
- ❌ If no response → Check server logs, auth issues
- ❌ If instant response (no streaming) → Wrong stream protocol

## Comparison with Main Chat

### What's Different (Intentionally Simplified)

**Test Chat** | **Main Chat**
---|---
Simple string messages | Complex UIMessage with parts[]
No database persistence | Saves to DB (Chat, Message_v2 tables)
No tools/function calling | 10+ tools (image gen, video gen, etc.)
No attachments | Supports images, files
No chat history | Loads previous messages
Single model | Model selection dropdown
Direct `streamText` response | Complex `createDataStream` wrapper
No resumable streams | Redis-backed resumable streams
No geolocation hints | Uses Vercel geolocation
No error recovery | Auto-creates users/chats on FK errors

### What's the Same (What We're Testing)

- ✅ Uses `@ai-sdk/react` useChat hook
- ✅ Uses same provider: `myProvider.languageModel()`
- ✅ Authentication check with `auth()`
- ✅ Streaming responses
- ✅ Message/response flow

## Migration Path to Main Chat

**After test chat works, apply these changes to main chat:**

### Step 1: Update `/api/chat/route.ts` (Line 703-1033)

**Current v4 pattern:**
```typescript
const stream = createDataStream({
  execute: async (dataStream) => {
    const result = streamText({
      model: myProvider.languageModel(selectedChatModel),
      messages: enhancedMessages,
      experimental_generateMessageId: generateUUID, // v4
    });

    result.mergeIntoDataStream(dataStream); // v4
  }
});

return new Response(stream); // v4
```

**Change to v5 pattern:**
```typescript
const result = streamText({
  model: myProvider.languageModel(selectedChatModel),
  messages: convertToModelMessages(enhancedMessages), // Note: use converter
  // NO experimental_generateMessageId here
  onFinish: async ({ response }) => {
    // Existing onFinish logic stays (lines 936-1015)
    // Just rename responseMessages -> response.messages
  },
});

return result.toUIMessageStreamResponse({
  generateMessageId: generateUUID, // v5: moved here
  // Note: If need custom data (redirect, etc), use createUIMessageStream
});
```

**If custom data needed (redirect command at line 994):**
```typescript
import { createUIMessageStream, createUIMessageStreamResponse } from "ai";

const stream = createUIMessageStream({
  originalMessages: messages,
  execute: async ({ writer }) => {
    const result = streamText({
      model: myProvider.languageModel(selectedChatModel),
      messages: convertToModelMessages(enhancedMessages),
    });

    writer.merge(result.toUIMessageStream());

    // Custom data parts
    writer.write({
      type: "redirect",
      value: { url: `/chat/${id}` },
    });
  },
  onFinish: async ({ messages, responseMessage }) => {
    // Existing save logic
    await saveMessages([responseMessage]);
  },
});

return createUIMessageStreamResponse({ stream });
```

### Step 2: Update Tool Definitions (If needed)

**From session summary - 20+ tool files need:**
```typescript
// v4
export const myTool = tool({
  inputSchema: z.object({ ... }), // OLD
  execute: async (args) => { ... }
});

// v5
export const myTool = tool({
  parameters: z.object({ ... }), // NEW
  execute: async (args) => { ... }
});
```

**Files to update (from session summary):**
- `analyze-media-reference.ts`
- `configure-image-generation.ts`
- `configure-video-generation.ts`
- `configure-audio-generation.ts`
- `configure-script-generation.ts`
- `create-document.ts`
- `update-document.ts`
- `request-suggestions.ts`
- `list-video-models.ts`
- `find-best-video-model.ts`
- `enhance-prompt-unified.ts`
- (Plus ~10 more in `src/lib/ai/tools/`)

**Note:** This can be automated with codemod:
```bash
npx @ai-sdk/codemod@latest v5
```

### Step 3: Update Mock Models for Tests

**File**: `apps/super-chatbot/src/lib/ai/models.mock.ts`

**Current (temporarily set to v1 for v4 compatibility):**
```typescript
import { MockLanguageModelV1 } from 'ai/test';
export const chatModel = new MockLanguageModelV1({ ... });
```

**Change to v5:**
```typescript
import { MockLanguageModelV2 } from 'ai/test';
export const chatModel = new MockLanguageModelV2({ ... });
```

### Step 4: Test Each Change Incrementally

1. Update API route only → Test with existing client
2. If breaks, revert and debug
3. Update tools (or run codemod)
4. Update mock models
5. Run test suite: `pnpm test`
6. Run specific chat tests: `pnpm test:chat`

## File Structure Summary

**New files to create:**
```
apps/super-chatbot/src/
├── app/(chat)/
│   ├── api/
│   │   └── test-chat/
│   │       ├── route.ts           # NEW - v5 API route
│   │       └── schema.ts          # NEW - Zod validation
│   └── test-chat/
│       └── page.tsx               # NEW - Test UI
```

**Files to reference (existing patterns):**
```
apps/super-chatbot/src/
├── components/chat/
│   └── chat.tsx                   # Lines 4, 124-163 (useChat usage)
├── app/(chat)/api/
│   └── chat/route.ts              # Lines 703-1033 (what to migrate)
├── lib/ai/
│   ├── providers.ts               # myProvider.languageModel()
│   └── models.mock.ts             # Mock models to update later
└── lib/utils/
    └── index.ts                   # generateUUID function
```

## Dependencies Check

**Required packages (from package.json):**
- ✅ `ai@5.0.65` - MUST be installed correctly
- ✅ `@ai-sdk/react@1.2.12` - Already installed
- ✅ `@ai-sdk/azure@2.0.47` - Already installed (v2 spec)
- ✅ `@ai-sdk/google@2.0.18` - Already installed (v2 spec)
- ✅ `zod@3.25.67` - Already installed
- ✅ `next@15.3.1` - Already installed
- ✅ `react@19.1.0` - Already installed

**No new dependencies needed!** Just ensure `ai@5.0.65` is actually installed.

## Risk Assessment

**Low Risk:**
- ✅ Test chat is isolated - won't affect main chat
- ✅ No database changes
- ✅ No tool integrations
- ✅ Client hook already uses correct v5 import
- ✅ Can delete test route if it doesn't help

**Medium Risk:**
- ⚠️ Package installation might hang again (workaround: try npm)
- ⚠️ Provider compatibility issues (but should work with v5)

**High Risk (for main chat migration later):**
- ⛔ Main chat has complex `createDataStream` with custom data
- ⛔ 20+ tool definitions need `inputSchema` → `parameters` change
- ⛔ Database persistence logic needs careful migration
- ⛔ Resumable streams might need updates

## Success Metrics

**Test Chat Success:**
1. Package `ai@5.0.65` confirmed installed
2. `/test-chat` page loads without errors
3. Can send message and receive streaming response
4. Status indicators work correctly
5. Console has no v5 compatibility errors

**Ready for Main Chat Migration:**
1. Test chat demonstrates v5 streaming works
2. Understand `result.toUIMessageStreamResponse()` pattern
3. Understand `generateMessageId` moved to response method
4. Understand `convertToModelMessages()` for message format
5. Have working reference to copy patterns from

## Next Steps After Test Chat Works

1. **Document working patterns** in `_ai/ai-sdk-v5-patterns.md`
2. **Create migration plan** for main chat (separate task)
3. **Run codemod** for tool definitions: `npx @ai-sdk/codemod@latest v5`
4. **Update main chat** API route using patterns from test chat
5. **Test incrementally** - one change at a time
6. **Update mock models** for test suite
7. **Run full test suite** to catch regressions

## Questions to Answer Through Testing

1. ✅ Does v5 streaming work with our provider setup?
2. ✅ Do we need `convertToModelMessages()` for simple strings?
3. ✅ How does `toUIMessageStreamResponse()` format messages?
4. ✅ What's the exact SSE format in network tab?
5. ⚠️ Do we need `createUIMessageStream` for custom data? (Test redirect later)

## References

**Documentation:**
- AI SDK v5 Migration Guide: Context7 `/vercel/ai` library
- Session summary: `_tasks/2025-10-10-ai-sdk-stream-parsing-fix/12-session-summary-ai-sdk-v5-migration.md`

**Code patterns:**
- useChat hook: `apps/super-chatbot/src/components/chat/chat.tsx:4,124-163`
- Current API route: `apps/super-chatbot/src/app/(chat)/api/chat/route.ts:703-1033`
- Provider: `apps/super-chatbot/src/lib/ai/providers.ts`
- Utils: `apps/super-chatbot/src/lib/utils/index.ts` (generateUUID)

**Key v5 APIs:**
- `streamText()` - Generate text stream
- `result.toUIMessageStreamResponse()` - Convert to HTTP response
- `createUIMessageStream()` - For custom data parts
- `createUIMessageStreamResponse()` - Wrap custom stream
- `convertToModelMessages()` - Format messages for model
- `useChat()` from `@ai-sdk/react` - Client hook (already correct!)

## Timeline Estimate

**Phase 1 - Package Installation:** 30 min - 2 hours
- Depends on whether pnpm hangs again
- Fallback to npm if needed

**Phase 2 - Test Chat Implementation:** 1-2 hours
- Schema + API route: 30 min
- Page component: 30 min
- Testing + debugging: 30-60 min

**Total:** 2-4 hours for working test chat

**Main chat migration (future task):** 4-8 hours
- API route updates: 2-3 hours
- Tool updates (codemod + manual): 1-2 hours
- Testing: 1-2 hours
- Bug fixes: 1-2 hours

## Approval Gate

**Before proceeding to implementation:**
1. ✅ User approves minimal approach (no tools, no DB)
2. ✅ User confirms package installation can be attempted
3. ✅ User agrees test chat at `/test-chat` is acceptable

**After test chat works:**
1. User reviews working test chat
2. Decide if main chat migration should proceed
3. Create separate task for main chat migration if needed

---

## Implementation Readiness

- ✅ Research complete - found existing patterns
- ✅ AI SDK v5 documentation reviewed
- ✅ Session summary analyzed for root cause
- ✅ Migration path identified
- ✅ File structure planned
- ✅ Testing strategy defined
- ✅ Success criteria clear

**Status:** Ready for @rob (implementation) after Phase 1 (package installation) completes.

**Next Actions:**
1. Install `ai@5.0.65` properly (critical blocker)
2. Verify installation: `pnpm list ai`
3. Create test chat files
4. Test and validate
5. Document findings

## Performance Expectations

**Test Chat:**
- Initial response: < 500ms
- Streaming: Real-time character-by-character
- Message send: < 100ms (client-side)

**No performance concerns expected** - simpler than main chat, no DB operations.

## Rollback Plan

If test chat doesn't work:
1. Delete test route: `apps/super-chatbot/src/app/(chat)/api/test-chat/`
2. Delete test page: `apps/super-chatbot/src/app/(chat)/test-chat/`
3. Keep research in task directory for future attempts
4. Consider alternative approaches (full v4 revert, or different v5 pattern)

**No risk to existing functionality** - test chat is completely isolated.
