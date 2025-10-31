# Final AI SDK v5 Compatibility Fixes

**Date:** 2025-10-10
**Status:** ✅ Complete
**Issue:** Stream parsing errors and client/server API mismatch

## Problems Solved

### 1. Stream Parsing Error
```
Error: Failed to parse stream string. Invalid code data.
```

**Root Cause:** Using v4 `useChat` API with v5 stream format

### 2. Client API Incompatibility
- Using `input`, `handleInputChange`, `handleSubmit` (v4 API)
- Accessing `message.content` instead of `message.parts` (v4 structure)
- Using `isLoading` instead of `status` (v4 API)

## Complete AI SDK v5 Integration

### Server Side (API Route)

**File:** `apps/super-chatbot/src/app/(chat)/api/test-chat/route.ts`

✅ **Correct v5 Implementation:**
```typescript
import { streamText } from "ai";
import { myProvider } from "@/lib/ai/providers";

const result = streamText({
  model: myProvider.languageModel("chat-model"),
  messages: messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
  })),
  temperature: 0.7,
  maxTokens: 2000,
});

return result.toUIMessageStreamResponse();
```

**Key Points:**
- Use `toUIMessageStreamResponse()` (not `toDataStreamResponse()`, not `toTextStreamResponse()`)
- This returns a UI Message Stream compatible with v5 `useChat`
- No need for error handlers or options - defaults work fine

### Client Side (React Component)

**File:** `apps/super-chatbot/src/app/(chat)/test-chat/page.tsx`

✅ **Correct v5 Implementation:**

```typescript
import { useChat } from "@ai-sdk/react";
import { useState } from "react";

export default function TestChatPage() {
  const [input, setInput] = useState("");

  const { messages, sendMessage, status, error } = useChat({
    api: "/api/test-chat",
    onError: (error) => console.error("Chat error:", error),
  });

  const isLoading = status === "streaming";

  // Form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage({ text: input });
      setInput("");
    }
  };

  // Message rendering
  {messages.map((message) => (
    <div key={message.id}>
      {message.parts.map((part, index) => {
        if (part.type === "text") {
          return <span key={index}>{part.text}</span>;
        }
        return null;
      })}
    </div>
  ))}
}
```

**Key Changes from v4:**

| Aspect | v4 API | v5 API |
|--------|--------|--------|
| Send Message | `append({ role, content })` | `sendMessage({ text })` |
| Input State | `input, handleInputChange` | Manual `useState` |
| Submit Handler | `handleSubmit` | Manual form handler |
| Loading State | `isLoading` boolean | `status` enum: "ready" \| "streaming" |
| Message Content | `message.content` | `message.parts[].text` |

### Mock Models

**File:** `apps/super-chatbot/src/lib/ai/models.mock.ts`

✅ **Correct v5 Implementation:**

```typescript
import { MockLanguageModelV2, simulateReadableStream } from 'ai/test';

export const chatModel = new MockLanguageModelV2({
  doGenerate: async () => ({
    finishReason: 'stop' as const,
    usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
    content: [{ type: 'text', text: `Hello, world!` }],
    warnings: [],
  }),
  doStream: async ({ prompt }) => ({
    stream: simulateReadableStream({
      chunks: getResponseChunksByPrompt(prompt),
    }),
  }),
});
```

**Key Changes:**
- `MockLanguageModelV1` → `MockLanguageModelV2`
- Import from `'ai/test'` (not `'ai'`)
- Usage: `promptTokens/completionTokens` → `inputTokens/outputTokens/totalTokens`
- Content: `text: string` → `content: [{ type: 'text', text: string }]`
- No `provider`, `modelId`, or `rawCall` fields

## Stream Protocol Format

The v5 UI Message Stream uses this format:

```
data: {"type":"start","messageId":"..."}
data: {"type":"text-start","id":"..."}
data: {"type":"text-delta","id":"...","delta":"Hello"}
data: {"type":"text-delta","id":"...","delta":" world"}
data: {"type":"text-end","id":"..."}
data: [DONE]
```

## Complete File Changes Summary

### Modified Files

1. **`apps/super-chatbot/src/app/(chat)/api/test-chat/route.ts`**
   - ✅ Uses `toUIMessageStreamResponse()`
   - ✅ Proper authentication
   - ✅ Validation with Zod

2. **`apps/super-chatbot/src/app/(chat)/test-chat/page.tsx`**
   - ✅ Manual input state management
   - ✅ Uses `sendMessage({ text })`
   - ✅ Renders `message.parts` array
   - ✅ Uses `status` enum

3. **`apps/super-chatbot/src/lib/ai/models.mock.ts`**
   - ✅ All models use `MockLanguageModelV2`
   - ✅ Correct v5 usage format
   - ✅ Proper content structure

### Created Files

1. `apps/super-chatbot/src/app/(chat)/api/test-chat/schema.ts` - Validation
2. `apps/super-chatbot/src/app/(chat)/api/test-chat/route.ts` - API route
3. `apps/super-chatbot/src/app/(chat)/test-chat/page.tsx` - UI page

## Testing

Access the test chat at: `http://localhost:3000/test-chat`

**Expected Behavior:**
- ✅ Page loads without errors
- ✅ Can send messages
- ✅ AI responses stream in real-time (word by word)
- ✅ Messages display correctly
- ✅ Loading states work
- ✅ Error handling works

## Next Steps for Main Chat Migration

Now that v5 is working in test chat, apply these patterns to main chat:

### 1. Update API Routes

**Files to update:**
- `apps/super-chatbot/src/app/(chat)/api/chat/route.ts`
- `apps/super-chatbot/src/app/(chat)/api/gemini-chat/route.ts`

**Changes needed:**
```typescript
// Remove v4 imports
- import { createDataStream, appendResponseMessages } from 'ai'

// Remove v4 stream creation
- const stream = createDataStream({ ... })
- result.mergeIntoDataStream(dataStream)

// Add v5 response
+ return result.toUIMessageStreamResponse()
```

### 2. Update Client Components

**Files to check:**
- `apps/super-chatbot/src/components/chat/chat.tsx`
- Any components using `useChat` hook

**Changes needed:**
- Manual input state management
- Use `sendMessage({ text })` instead of `append()`
- Use `status` instead of `isLoading`
- Render `message.parts` instead of `message.content`

### 3. Test Thoroughly

- ✅ Basic chat functionality
- ✅ Tool calls (image/video generation)
- ✅ Database persistence
- ✅ Resumable streams
- ✅ Error handling
- ✅ Loading states

## Key Learnings

1. **v5 is not backward compatible** - Client and server must both use v5 APIs
2. **`toUIMessageStreamResponse()` is the correct method** for React `useChat`
3. **Messages are now part-based** - More flexible for tools, files, etc.
4. **Manual state management required** - No more built-in input/submit handlers
5. **Mock models completely changed** - v2 API is different from v1

## References

- AI SDK v5 Release: https://vercel.com/blog/ai-sdk-5
- Migration Guide: https://ai-sdk.dev/docs/migration-guides/migration-guide-5-0
- `useChat` Documentation: https://ai-sdk.dev/docs/ai-sdk-ui/chatbot
- Stream Protocol: https://ai-sdk.dev/docs/ai-sdk-ui/stream-protocol
- Testing Documentation: https://ai-sdk.dev/docs/ai-sdk-core/testing

---

**Status:** Test chat fully functional with AI SDK v5! 🎉
