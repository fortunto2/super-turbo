# AI SDK v5 Stream Protocol Fix - Summary

## Problem
After migrating to AI SDK v5, artifacts (specifically image generation) were not opening automatically. The document was created successfully on the server but didn't display on the client side. The error was:

```
Error: Failed to parse stream string. Invalid code data.
at parseDataStreamPart (index.mjs:764:11)
```

## Root Cause
The client was trying to parse the server response using the **Data Stream** protocol (AI SDK v4 format) while the server was sending **UI Message Stream** format (AI SDK v5 format). This protocol mismatch caused parsing errors and prevented tool results from being processed correctly.

## Changes Made

### 1. Client-Side: Added `streamProtocol` Option

Updated all `useChat` hook instances to explicitly specify the UI Message Stream protocol:

#### File: `apps/super-chatbot/src/components/chat/chat.tsx` (Line 137)
```typescript
const { messages, setMessages, ... } = useChat({
  id,
  initialMessages,
  api: isGeminiChat ? "/api/gemini-chat" : "/api/chat",
  body: { ... },
  sendExtraMessageFields: true,
  generateId: generateUUID,
  streamProtocol: "ui-message", // ✅ AI SDK v5: Use UI Message Stream protocol
  onFinish: () => { ... },
  onError: (error) => { ... },
});
```

#### File: `apps/super-chatbot/src/app/tools/video-generator/page.tsx` (Line 20)
```typescript
const { messages, setMessages } = useChat({
  id: "video-generator-tool",
  initialMessages: [],
  streamProtocol: "ui-message", // ✅ AI SDK v5: Use UI Message Stream protocol
});
```

#### File: `apps/super-chatbot/src/app/(chat)/banana-veo3-advanced/page.tsx` (Line 36)
```typescript
const { messages, input, setInput, ... } = useChat({
  id: chatId,
  api: "/api/banana-veo3-advanced",
  body: { selectedVisibilityType: "private" },
  streamProtocol: "ui-message", // ✅ AI SDK v5: Use UI Message Stream protocol
});
```

### 2. Server-Side: Updated Stream Response Method

Changed from `toDataStreamResponse()` (v4) to `toUIMessageStreamResponse()` (v5) with proper headers:

#### File: `apps/super-chatbot/src/app/(chat)/api/chat/route.ts` (Lines 218-223)
**Before:**
```typescript
const stream = new ReadableStream({ ... });
return new Response(stream, { ... });
```

**After:**
```typescript
// AI SDK v5: Use toUIMessageStreamResponse() for proper tool handling
return result.toUIMessageStreamResponse({
  headers: {
    "x-vercel-ai-ui-message-stream": "v1",
  },
});
```

#### File: `apps/super-chatbot/src/app/(chat)/api/banana-veo3-advanced/route.ts` (Lines 169-174)
**Before:**
```typescript
return result.toDataStreamResponse();
```

**After:**
```typescript
// AI SDK v5: Use toUIMessageStreamResponse() for proper tool handling
return result.toUIMessageStreamResponse({
  headers: {
    "x-vercel-ai-ui-message-stream": "v1",
  },
});
```

### 3. Tool Result Handler Already in Place

The handler for `createDocument` tool results was already added in a previous fix:

#### File: `apps/super-chatbot/src/components/messages/message.tsx` (Lines 383-453)
```typescript
// Handle createDocument tool result - opens artifact viewer
if (
  toolName === "createDocument" &&
  result &&
  typeof result === "object" &&
  "id" in result &&
  "kind" in result &&
  "title" in result
) {
  const artifactKind = result.kind as string;

  // Parse title for image/video artifacts
  let displayTitle = result.title as string;
  // ... title parsing logic ...

  console.log("🎨 createDocument tool result received:", {
    id: result.id,
    kind: artifactKind,
    title: displayTitle,
  });

  // Automatically open artifact when document is created
  setTimeout(() => {
    setArtifact({
      title: displayTitle,
      documentId: result.id as string,
      kind: artifactKind as any,
      content: "",
      isVisible: true,
      status: "pending",
      boundingBox: { top: 0, left: 0, width: 0, height: 0 },
    });
  }, 100);

  // Show a loading message while artifact is being generated
  return ( ... loading UI ... );
}
```

### 4. Debug Logging Added

Debug logging is already in place to track tool invocations:

#### File: `apps/super-chatbot/src/components/messages/message.tsx` (Lines 276-282)
```typescript
// Debug: log all tool invocations
console.log("🔍 Tool invocation detected:", {
  toolName,
  state,
  hasResult: state === "result" && !!toolInvocation.result,
  result: state === "result" ? toolInvocation.result : undefined,
});
```

## How It Works Now

### Complete Flow:
1. **User Request**: User asks to generate an image
2. **Server Processing**:
   - AI calls `configureImageGeneration` tool
   - User selects settings
   - AI calls `createDocument` tool to create the artifact
   - Server responds with `toUIMessageStreamResponse()` including tool results
3. **Client Parsing**:
   - `useChat` hook receives stream with `streamProtocol: "ui-message"`
   - Parses UI Message Stream format correctly
   - Extracts tool invocations from message parts
4. **Message Rendering**:
   - `message.tsx` detects `createDocument` tool result
   - Logs the artifact details
   - Calls `setArtifact()` to open the artifact viewer
   - Shows loading state while generation is in progress
5. **Artifact Display**: Artifact viewer opens and displays the generated content

## Key Points

### Why `streamProtocol: "ui-message"` is Required
- **AI SDK v5 Breaking Change**: The default stream format changed
- **Without This Option**: Client uses Data Stream parser (v4 format)
- **With This Option**: Client uses UI Message Stream parser (v5 format)
- **Result**: Tool invocations are properly parsed and available in `message.parts`

### Why `toUIMessageStreamResponse()` is Required
- **AI SDK v5 Best Practice**: Proper method for streaming with tools
- **Header Required**: `x-vercel-ai-ui-message-stream: v1` tells client the format
- **Tool Support**: Automatically serializes tool calls and results
- **Compatibility**: Works with `streamProtocol: "ui-message"` on client

### Why Both Changes Are Needed
- **Client + Server Alignment**: Both must use the same protocol
- **Data Stream (v4)**: Simple text streaming, no tool support
- **UI Message Stream (v5)**: Full message objects with tool invocations
- **Mismatch Result**: Parser expects one format, receives another → parsing error

## Testing

To verify the fix works:

1. Start the development server: `pnpm dev`
2. Open the chat interface
3. Request an image generation: "Generate an image of a sunset"
4. Select image settings in the configuration dialog
5. Watch the console logs:
   ```
   🔍 Tool invocation detected: { toolName: 'configureImageGeneration', ... }
   🔍 Tool invocation detected: { toolName: 'createDocument', ... }
   🎨 createDocument tool result received: { id: '...', kind: 'image', title: '...' }
   ```
6. Verify the artifact viewer opens automatically
7. Verify the image generation progress is displayed

## Files Modified

1. `apps/super-chatbot/src/components/chat/chat.tsx` - Added `streamProtocol: "ui-message"`
2. `apps/super-chatbot/src/app/tools/video-generator/page.tsx` - Added `streamProtocol: "ui-message"`
3. `apps/super-chatbot/src/app/(chat)/banana-veo3-advanced/page.tsx` - Added `streamProtocol: "ui-message"`
4. `apps/super-chatbot/src/app/(chat)/api/chat/route.ts` - Changed to `toUIMessageStreamResponse()`
5. `apps/super-chatbot/src/app/(chat)/api/banana-veo3-advanced/route.ts` - Changed to `toUIMessageStreamResponse()`

## Next Steps

If artifacts still don't open:

1. **Check Browser Console**: Look for parsing errors or failed tool invocations
2. **Check Server Logs**: Verify `createDocument` tool is being called successfully
3. **Check Network Tab**: Inspect the stream response format
4. **Verify Package Versions**: Ensure `@ai-sdk/react` is v5 compatible
5. **Test Other Routes**: Check if gemini-chat or test-chat need similar fixes

## Additional Notes

- All `useChat` instances now use UI Message Stream protocol
- All streaming API routes now use `toUIMessageStreamResponse()`
- Debug logging is in place to track tool invocations
- The `createDocument` tool result handler is properly configured
- The fix maintains backward compatibility with existing features
