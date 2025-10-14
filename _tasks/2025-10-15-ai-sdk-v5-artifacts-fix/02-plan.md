# Implementation Plan: AI SDK v5 Complete Fix

**Date**: 2025-10-15
**Task**: Fix AI SDK v5 migration issues - setInput error, artifacts, and legacy code cleanup
**Status**: Ready for implementation

## Executive Summary

The AI SDK v5 migration is incomplete, causing critical errors and broken features. The main issues are:
1. **CRITICAL**: `setInput is not a function` error breaking chat interface
2. **CRITICAL**: Artifacts not opening automatically after tool completion
3. **LEGACY**: Old AI SDK v4 patterns still present in client code
4. **COMPATIBILITY**: Using v4 `useChat` API with v5 server responses

**Root Cause**: The code mixes AI SDK v4 client patterns (from `@ai-sdk/react@1.2.12`) with AI SDK v5 server patterns. Version `@ai-sdk/react@2.0.71` is installed but the client code still uses v4 APIs.

## Problem Analysis

### Critical Issue 1: `setInput is not a function`

**Location**: `apps/super-chatbot/src/components/chat/multimodal-input.tsx:97`

**Code**:
```typescript
// Line 50: Typed as v4 API
setInput: UseChatHelpers["setInput"];

// Line 97: Called in useEffect
setInput(finalValue); // ERROR: setInput is not a function in v5!
```

**Root Cause**: AI SDK v5 `useChat` **does NOT provide** `setInput`, `handleInputChange`, or `handleSubmit`. These were removed in v5. The code expects v4 helpers but v5 doesn't export them.

**Evidence from Context7 docs**:
- v5 requires **manual state management**: `const [input, setInput] = useState('')`
- v5 uses `sendMessage({ text })` instead of `append()` or `handleSubmit()`
- No built-in input handlers provided

### Critical Issue 2: Artifacts Not Opening

**Current State**: After migrating to v5, tool calls complete but artifacts don't open automatically.

**Investigation Needed**:
- How artifacts are currently detected (via `useArtifact` hook scanning messages)
- How artifact opening is triggered (via `setArtifact` function)
- Whether v5 message structure changes affect detection logic

**Hypothesis**: V5 message parts structure might differ, breaking artifact detection patterns.

### Legacy Issue 3: V4 API Usage Throughout Codebase

**Files using v4 patterns**:
- `multimodal-input.tsx`: Uses `setInput`, `handleSubmit` from props
- `chat.tsx`: Destructures `handleInputChange`, `handleSubmit` from `useChat`
- `artifact.tsx`: Expects `setInput` prop
- `banana-veo3-advanced/page.tsx`: Uses `handleInputChange`

**V4 vs V5 Comparison**:

| Feature | AI SDK v4 | AI SDK v5 (@ai-sdk/react 2.x) |
|---------|-----------|-------------------------------|
| **Input State** | `input, setInput` from hook | Manual `useState` |
| **Input Handler** | `handleInputChange` from hook | Manual `onChange` |
| **Form Submit** | `handleSubmit` from hook | Manual form handler |
| **Send Message** | `append({ role, content })` | `sendMessage({ text })` |
| **Loading** | `isLoading` boolean | `status` enum |
| **Message Content** | `message.content` string | `message.parts[]` array |
| **Stream Protocol** | `streamProtocol: "data"` | `streamProtocol: "ui-message"` |

## Research Findings

### Existing Implementations

**AI SDK v5 Test Chat** (working example):
- File: `apps/super-chatbot/src/app/(chat)/test-chat/page.tsx`
- Uses manual `useState` for input: ✅
- Uses `sendMessage({ text })`: ✅
- Renders `message.parts`: ✅
- **THIS IS THE CORRECT V5 PATTERN**

**Main Chat** (broken with v4 patterns):
- File: `apps/super-chatbot/src/components/chat/chat.tsx`
- Line 118-119: Destructures `setInput`, `handleInputChange` from `useChat` ❌
- Line 126: Uses `useChat` with `streamProtocol: "ui-message"` ✅
- **MIXED V4/V5 CODE**

**Server** (correctly using v5):
- File: `apps/super-chatbot/src/app/(chat)/api/chat/route.ts`
- Line 219: Returns `result.toUIMessageStreamResponse()` ✅
- Line 175-216: Uses `streamText` with tools ✅
- **SERVER IS CORRECT**

### AI SDK v5 Key Changes (from Context7)

**What Changed**:
1. **No built-in input management** - Use manual `useState`
2. **New send API** - `sendMessage({ text })` instead of `append()`
3. **Status instead of loading** - `status: "ready" | "submitted" | "streaming"`
4. **Parts-based messages** - Access `message.parts[].text` not `message.content`
5. **Stream protocol** - Must specify `streamProtocol: "ui-message"` on client

**What Stayed the Same**:
- `useChat` hook exists
- `messages` array
- `stop()` function
- `error` object
- Tool invocations work (server-side)

## Implementation Strategy

### Phase 1: Fix Critical setInput Error (Immediate)

**Goal**: Make chat functional again by using correct v5 APIs

**Changes Required**:

1. **Update `chat.tsx`** (main chat component):
   - Remove `setInput`, `handleInputChange`, `handleSubmit` from `useChat` destructure
   - Add manual `useState` for input management
   - Create manual submit handler
   - Pass manual `setInput` to child components

2. **Update `multimodal-input.tsx`** (input component):
   - Keep `setInput` prop (now manual, not from hook)
   - Remove `UseChatHelpers["setInput"]` type (doesn't exist in v5)
   - Update to `Dispatch<SetStateAction<string>>` type
   - Keep using prop `setInput` (works with manual state)

3. **Update `artifact.tsx`** (artifact sidebar):
   - Update `setInput` prop type to manual state setter
   - No other changes needed (receives prop)

**Verification**: Chat loads without errors, can type and send messages

### Phase 2: Fix Artifact Opening (Critical Feature)

**Goal**: Ensure artifacts open automatically when tools complete

**Investigation Steps**:
1. Check how `useArtifact` hook detects tool completions
2. Verify v5 message structure includes tool invocation parts
3. Test if artifact detection logic works with v5 messages

**Potential Issues**:
- V5 tool parts might have different structure
- Artifact detection might look for v4 message format
- Opening trigger might not fire due to state management changes

**Changes Required** (TBD after investigation):
- Update artifact detection to handle v5 message parts
- Ensure `setArtifact` is called when tools complete
- Add logging to track artifact state transitions

### Phase 3: Clean Up Legacy v4 Code

**Goal**: Remove all v4 API usage, use only v5 patterns

**Files to Update**:
1. `apps/super-chatbot/src/app/(chat)/banana-veo3-advanced/page.tsx`
   - Remove `handleInputChange` from `useChat`
   - Add manual input state

2. `apps/super-chatbot/src/app/(chat)/banana-veo3/[id]/banana-veo3-chat.tsx`
   - Already uses manual `useState` ✅
   - Verify no v4 patterns

3. Remove any remaining `experimental_attachments` references if deprecated

**Verification**: No TypeScript errors, all pages work

### Phase 4: Testing & Validation

**Goal**: Ensure all features work end-to-end

**Test Scenarios**:
1. **Basic Chat**: Send message, receive response
2. **Image Generation Tool**: Trigger tool, artifact opens, displays image
3. **Video Generation Tool**: Trigger tool, artifact opens, shows video
4. **Document Creation Tool**: Create doc, artifact opens editor
5. **Multi-turn Conversation**: Multiple messages with context
6. **Error Handling**: Invalid requests show proper errors
7. **Loading States**: Status indicators work correctly

## Detailed Implementation Plan

### 1. Types & Interfaces (Foundation)

**File**: `apps/super-chatbot/src/lib/types/chat-helpers.ts` (NEW)

```typescript
import type { Dispatch, SetStateAction } from 'react';
import type { UseChatHelpers } from '@ai-sdk/react';

// V5-compatible chat helpers that include manual input management
export interface ExtendedChatHelpers extends Pick<UseChatHelpers,
  'messages' |
  'status' |
  'stop' |
  'sendMessage' |
  'reload' |
  'error' |
  'data'
> {
  // Manual input management (not from useChat)
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  handleSubmit: (e?: React.FormEvent) => void;
}

// For components that only need setInput
export type SetInputFunction = Dispatch<SetStateAction<string>>;
```

**Why**: Create clean types that work with v5 API structure.

### 2. Update Main Chat Component

**File**: `apps/super-chatbot/src/components/chat/chat.tsx`

**Current (lines 114-171 - BROKEN)**:
```typescript
const {
  messages,
  setMessages,
  input,  // ❌ Not in v5
  setInput,  // ❌ Not in v5
  handleInputChange,  // ❌ Not in v5
  handleSubmit,  // ❌ Not in v5 with same API
  append,
  status,
  stop,
  reload,
  data,
} = useChat({
  id,
  initialMessages,
  api: isGeminiChat ? "/api/gemini-chat" : "/api/chat",
  body: {
    id,
    selectedChatModel: initialChatModel,
    selectedVisibilityType: visibilityType,
  },
  sendExtraMessageFields: true,
  generateId: generateUUID,
  streamProtocol: "ui-message", // ✅ Correct for v5
  onFinish: () => { ... },
  onError: (error) => { ... },
});
```

**Change to (V5 PATTERN)**:
```typescript
// Manual input state management (V5 requirement)
const [input, setInput] = useState("");

const {
  messages,
  setMessages,
  sendMessage,  // ✅ V5 API
  status,
  stop,
  reload,
  data,
  error,  // ✅ Add error handling
} = useChat({
  id,
  messages: initialMessages,  // ✅ V5: renamed from initialMessages
  body: {
    id,
    selectedChatModel: initialChatModel,
    selectedVisibilityType: visibilityType,
  },
  streamProtocol: "ui-message",  // ✅ Correct for v5
  onFinish: () => {
    console.log("🔍 useChat onFinish called");
    isSubmittingRef.current = false;
    setIsSubmitting(false);
    if (id && typeof window !== "undefined") {
      const newUrl = `/chat/${id}`;
      if (window.location.pathname !== newUrl) {
        window.history.pushState(null, "", newUrl);
      }
    }
    mutate(unstable_serialize(getChatHistoryPaginationKey));
  },
  onError: (error) => {
    console.error("Chat error:", error);
    isSubmittingRef.current = false;
    setIsSubmitting(false);
    if (onError) {
      onError(error);
    }
    toast({
      type: "error",
      description: error.message,
    });
  },
});

// Manual form submit handler (V5 requirement)
const handleFormSubmit = useCallback(
  (event?: { preventDefault?: () => void }) => {
    if (event?.preventDefault) {
      event.preventDefault();
    }

    if (isSubmittingRef.current || status !== "ready" || isSubmitting) {
      console.log("🔍 Submit blocked");
      return;
    }

    if (!input.trim() && attachments.length === 0) {
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    // V5 API: Send message with text
    sendMessage({
      text: input,
      experimental_attachments: attachments  // If still supported
    });

    // Reset state
    setInput("");
    setAttachments([]);
    setLocalStorageInput("");
  },
  [input, attachments, status, isSubmitting, sendMessage]
);
```

**Key Changes**:
- ✅ Add manual `useState` for input
- ✅ Remove `handleInputChange`, `handleSubmit` from destructure
- ✅ Add `sendMessage` to destructure (v5 API)
- ✅ Create manual `handleFormSubmit` function
- ✅ Use `messages` instead of `initialMessages` option
- ✅ Call `sendMessage({ text })` instead of `handleSubmit()`

### 3. Update Multimodal Input Component

**File**: `apps/super-chatbot/src/components/chat/multimodal-input.tsx`

**Current (lines 47-63 - BROKEN)**:
```typescript
function PureMultimodalInput({
  chatId,
  input,
  setInput,
  status,
  stop,
  // ...
}: {
  chatId: string;
  input: UseChatHelpers["input"];  // ❌ Doesn't exist in v5
  setInput: UseChatHelpers["setInput"];  // ❌ Doesn't exist in v5
  status: UseChatHelpers["status"];
  // ...
})
```

**Change to (V5 COMPATIBLE)**:
```typescript
import type { UseChatHelpers } from "@ai-sdk/react";
import type { Dispatch, SetStateAction } from "react";

function PureMultimodalInput({
  chatId,
  input,
  setInput,
  status,
  stop,
  // ...
}: {
  chatId: string;
  input: string;  // ✅ Simple string type
  setInput: Dispatch<SetStateAction<string>>;  // ✅ Manual state setter
  status: UseChatHelpers["status"];  // ✅ This still exists in v5
  stop: () => void;
  isSubmitting?: boolean;
  isSubmittingRef?: React.MutableRefObject<boolean>;
  attachments: Array<Attachment>;
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
  messages: Array<UIMessage>;
  setMessages: UseChatHelpers["setMessages"];  // ✅ Still exists
  append: UseChatHelpers["append"];  // ❌ DEPRECATED - remove if not used
  handleSubmit: (event?: any, options?: any) => void;  // ✅ Manual handler
  className?: string;
  selectedVisibilityType: VisibilityType;
})
```

**No logic changes needed** - Component already uses `setInput` as prop, just fix types.

### 4. Update Artifact Component

**File**: `apps/super-chatbot/src/components/artifacts/artifact.tsx`

**Current (lines 118)**:
```typescript
setInput: UseChatHelpers['setInput'];  // ❌ V4 type
```

**Change to**:
```typescript
import type { Dispatch, SetStateAction } from "react";

setInput: Dispatch<SetStateAction<string>>;  // ✅ V5 compatible
```

### 5. Update Banana Veo3 Advanced Page

**File**: `apps/super-chatbot/src/app/(chat)/banana-veo3-advanced/page.tsx`

**Current (lines 20-28)**:
```typescript
const {
  messages,
  setInput,
  handleInputChange,  // ❌ V4 API
  handleSubmit,  // ❌ V4 API
  append,
  status,
  isLoading,  // ❌ V4 API
  stop,
} = useChat({
  api: '/api/banana-veo3-advanced',
});
```

**Change to**:
```typescript
const [input, setInput] = useState("");  // ✅ Manual state

const {
  messages,
  sendMessage,  // ✅ V5 API
  status,  // ✅ V5 API
  stop,
  error,
} = useChat({
  api: '/api/banana-veo3-advanced',
  streamProtocol: "ui-message",  // ✅ Add if missing
});

// Manual submit handler
const handleSubmit = useCallback(
  (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (input.trim() && status === "ready") {
      sendMessage({ text: input });
      setInput("");
    }
  },
  [input, status, sendMessage]
);

// Manual input change handler
const handleInputChange = useCallback(
  (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  },
  []
);

const isLoading = status === "streaming";  // ✅ Derive from status
```

### 6. Verify Artifact Detection Logic

**File**: `apps/super-chatbot/src/hooks/use-artifact.ts`

**Current Implementation**: Hook uses `useSWR` to manage artifact state, persists to localStorage.

**Investigation Required**:
1. Check if artifact detection scans `message.parts` for tool invocations
2. Verify v5 tool invocation parts have expected structure
3. Test if `setArtifact` is called when tools complete

**Potential Fix** (if needed):
```typescript
// In component that processes messages
useEffect(() => {
  if (!messages || messages.length === 0) return;

  // Look for tool invocation completions in latest messages
  const latestMessage = messages[messages.length - 1];

  if (latestMessage.role === "assistant") {
    latestMessage.parts.forEach((part) => {
      // V5 tool invocation part structure
      if (part.type.startsWith("tool-")) {
        const toolName = part.type.replace("tool-", "");

        // Check if tool has output available
        if (part.state === "output-available") {
          console.log("🔍 Tool completed:", toolName, part.output);

          // Open artifact if it's an artifact-generating tool
          if (["configureImageGeneration", "configureVideoGeneration", "createDocument"].includes(toolName)) {
            setArtifact((prev) => ({
              ...prev,
              isVisible: true,
              status: "completed",
              documentId: part.output.documentId || part.output.id,
              // ...other artifact data
            }));
          }
        }
      }
    });
  }
}, [messages, setArtifact]);
```

### 7. Test Chat Compatibility Verification

**Goal**: Ensure test chat still works as reference

**File**: `apps/super-chatbot/src/app/(chat)/test-chat/page.tsx`

**Current Implementation** (lines 10-50):
```typescript
const [input, setInput] = useState("");  // ✅ Correct

const { messages, sendMessage, status, error } = useChat({  // ✅ Correct
  api: "/api/test-chat",
  onError: (error) => console.error("Chat error:", error),
});
```

**Verification**: No changes needed, this is the correct v5 pattern. Use as reference.

## File Structure Summary

**Files to Modify**:
```
apps/super-chatbot/src/
├── components/
│   ├── chat/
│   │   ├── chat.tsx                     # CRITICAL: Add manual input state
│   │   └── multimodal-input.tsx         # CRITICAL: Fix setInput type
│   └── artifacts/
│       └── artifact.tsx                 # Fix setInput prop type
├── app/(chat)/
│   └── banana-veo3-advanced/
│       └── page.tsx                     # Update to v5 APIs
└── hooks/
    └── use-artifact.ts                  # Verify artifact detection (investigation)
```

**Files to Reference** (working v5 examples):
```
apps/super-chatbot/src/
├── app/(chat)/
│   ├── test-chat/page.tsx               # ✅ Correct v5 pattern
│   └── api/
│       └── chat/route.ts                # ✅ Correct v5 server
└── _tasks/2025-10-10-ai-sdk-v5-test-chat/
    └── 06-final-v5-fixes.md             # V5 migration reference
```

## Dependencies Check

**Current Versions** (from package.json):
- ✅ `ai@5.0.65` - Correct v5 version
- ✅ `@ai-sdk/react@2.0.71` - Correct v5 client package
- ✅ `@ai-sdk/azure@2.0.47` - V2 spec (v5 compatible)
- ✅ `@ai-sdk/google@2.0.18` - V2 spec (v5 compatible)

**No package updates needed** - Just fix code to use v5 APIs correctly.

## Risk Assessment

**Low Risk**:
- ✅ Test chat proves v5 server works
- ✅ Server API route already using v5 correctly
- ✅ Changes are mostly client-side state management
- ✅ Can test incrementally without breaking prod

**Medium Risk**:
- ⚠️ Artifact detection might need updates for v5 message structure
- ⚠️ Multiple files need coordinated changes
- ⚠️ Type errors might surface in other files

**High Risk**:
- ⛔ Breaking change - no backward compatibility with v4
- ⛔ Must update all `useChat` usages at once
- ⛔ Artifact opening is critical UX feature

**Mitigation**:
1. Test each component change in isolation
2. Use test chat as working reference
3. Add extensive logging for artifact detection
4. Keep git history clean for easy rollback

## Success Metrics

**Phase 1 Success** (Critical Fix):
1. ✅ No `setInput is not a function` error
2. ✅ Chat page loads without console errors
3. ✅ Can type in input field
4. ✅ Can send messages successfully
5. ✅ Receive streaming responses

**Phase 2 Success** (Artifacts):
1. ✅ Image generation tool opens artifact with image
2. ✅ Video generation tool opens artifact with video
3. ✅ Document creation tool opens artifact editor
4. ✅ Artifact closes properly when requested
5. ✅ Artifact state persists across page reloads

**Phase 3 Success** (Cleanup):
1. ✅ No TypeScript errors in any file
2. ✅ No v4 API references in codebase
3. ✅ All chat pages work correctly
4. ✅ Lint passes without errors

**Phase 4 Success** (Testing):
1. ✅ All test scenarios pass
2. ✅ No console errors in any flow
3. ✅ Loading states display correctly
4. ✅ Error handling works properly

## Testing Strategy

### Unit Tests (If time permits)

**Focus**: Test manual input management logic

```typescript
// tests/unit/chat-helpers.test.tsx
import { renderHook, act } from '@testing-library/react';
import { useState, useCallback } from 'react';

describe('Manual Input Management (V5)', () => {
  it('should manage input state manually', () => {
    const { result } = renderHook(() => {
      const [input, setInput] = useState('');
      const handleSubmit = useCallback(() => {
        if (input.trim()) {
          // send message
          setInput('');
        }
      }, [input]);

      return { input, setInput, handleSubmit };
    });

    act(() => {
      result.current.setInput('test message');
    });
    expect(result.current.input).toBe('test message');

    act(() => {
      result.current.handleSubmit();
    });
    expect(result.current.input).toBe('');
  });
});
```

### Integration Tests

**Test**: Full chat flow with v5 APIs

1. Load chat page
2. Type message
3. Submit form
4. Verify `sendMessage` called with correct params
5. Verify input cleared after send
6. Verify response streams correctly

### Manual Testing

**Critical Path**:
1. Open `/chat` route
2. Type "Generate an image of a sunset"
3. Send message
4. Verify:
   - ✅ No console errors
   - ✅ Message appears in chat
   - ✅ AI response streams in
   - ✅ Tool invocation triggers
   - ✅ Artifact opens with image
   - ✅ Can close artifact
5. Type follow-up message
6. Verify multi-turn conversation works

**Edge Cases**:
- Empty message submission (should be blocked)
- Submit while streaming (should be blocked)
- Rapid multiple submits (should be blocked)
- Page refresh during artifact view (should restore)

## Rollback Plan

If v5 migration fails:

1. **Revert client code changes**:
   ```bash
   git checkout HEAD -- apps/super-chatbot/src/components/chat/
   git checkout HEAD -- apps/super-chatbot/src/components/artifacts/
   ```

2. **Downgrade packages** (if needed):
   ```bash
   pnpm add @ai-sdk/react@1.2.12 ai@4.3.19
   ```

3. **Revert server API**:
   ```bash
   git checkout HEAD -- apps/super-chatbot/src/app/\\(chat\\)/api/chat/route.ts
   ```

**No data loss risk** - Changes are code-only, no database schema changes.

## Performance Expectations

**No performance degradation expected**:
- Manual state management is lightweight
- v5 streaming uses same underlying protocol
- Artifact detection runs on same message updates

**Potential improvements**:
- Fewer unnecessary re-renders (manual state control)
- Cleaner component logic (explicit dependencies)

## Next Steps After Completion

1. **Document v5 patterns** in `_ai/ai-sdk-v5-patterns.md`:
   - Manual input management example
   - Artifact detection with v5 messages
   - Common pitfalls and solutions

2. **Update team documentation**:
   - Add to `docs/development/ai-sdk-v5-migration.md`
   - Include code examples for future reference

3. **Monitor production**:
   - Watch for any v5-related errors in Sentry
   - Track artifact opening success rate
   - Monitor chat completion rates

4. **Future improvements**:
   - Consider extracting manual input logic into custom hook
   - Add TypeScript strict mode if not enabled
   - Optimize artifact state management

## Questions for User

1. Should we update banana-veo3 pages as part of this fix, or separate task?
2. Are there any other pages using `useChat` that need updating?
3. Priority: Fix critical errors first, or do complete v5 migration in one go?

## References

**Documentation**:
- AI SDK v5 Migration: Context7 `/vercel/ai` library
- Working v5 example: `apps/super-chatbot/src/app/(chat)/test-chat/page.tsx`
- Previous migration: `_tasks/2025-10-10-ai-sdk-v5-test-chat/`

**Code Patterns**:
- Test chat (v5): Lines 10-50 of `test-chat/page.tsx`
- Main chat (v4): Lines 114-171 of `chat.tsx`
- Server API (v5): Lines 175-219 of `api/chat/route.ts`

**Key v5 APIs** (from Context7):
- `useChat()` - Returns `messages`, `sendMessage`, `status`, etc.
- `sendMessage({ text })` - Send user message
- `status` - `"ready" | "submitted" | "streaming"`
- `message.parts[]` - Array of message parts (text, tool calls, etc.)
- No `handleInputChange`, `handleSubmit`, `isLoading` in v5

## Timeline Estimate

**Phase 1** (Critical Fix): 2-3 hours
- Update chat.tsx: 1 hour
- Update multimodal-input.tsx: 30 min
- Update artifact.tsx: 15 min
- Testing: 30-60 min

**Phase 2** (Artifacts): 2-4 hours
- Investigation: 1 hour
- Implementation: 1-2 hours
- Testing: 1 hour

**Phase 3** (Cleanup): 1-2 hours
- Update other pages: 1 hour
- Final verification: 30-60 min

**Phase 4** (Testing): 1-2 hours
- Manual testing: 1 hour
- Edge case testing: 30-60 min

**Total**: 6-11 hours for complete fix

**Minimum viable fix**: 2-3 hours (Phase 1 only)

---

## Implementation Readiness

- ✅ Research complete - Found v5 patterns in test chat
- ✅ Root cause identified - Mixed v4/v5 APIs
- ✅ Migration path clear - Manual state management
- ✅ Test chat proves v5 works
- ✅ Server already correct
- ✅ Types defined for v5
- ✅ Success criteria clear

**Status**: Ready for @rob (implementation)

**Priority**: CRITICAL - Chat is currently broken

**Next Actions**:
1. Implement Phase 1 (critical fix) first
2. Test basic chat functionality
3. Proceed to Phase 2 (artifacts) once chat works
4. Complete cleanup and testing
5. Document findings for future reference
