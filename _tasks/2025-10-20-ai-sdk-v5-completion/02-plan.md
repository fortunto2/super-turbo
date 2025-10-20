# AI SDK v5 Migration Completion - Technical Plan

**Task**: Complete AI SDK v4 to v5 Migration
**Date**: 2025-10-20
**Branch**: `fix-chat-error-update-aisdkv5`
**Complexity**: High - ~100 TypeScript errors across multiple components

---

## Executive Summary

This plan addresses the **incomplete AI SDK v5 migration** that's blocking the chatbot from building. The main chat API routes are already using v5 correctly, but client components still reference removed v4 APIs.

**Strategy**: Fix errors in priority order (core → supporting → deprecated), using type-first approach.

**Estimated Effort**: 8-12 hours
- Type definitions: 2 hours
- Core components: 3-4 hours
- Supporting components: 2-3 hours
- Deprecated code removal: 1-2 hours
- Testing & validation: 2-3 hours

---

## Problem Analysis

### Root Causes

1. **Breaking API Changes in AI SDK v5**
   - `useChat` no longer provides: `input`, `setInput`, `append`, `handleSubmit`, `reload`, `data`
   - These must be managed manually or use new v5 APIs (`sendMessage`, `regenerate`)

2. **Message Structure Changed**
   - `content` property deprecated (use `parts` array)
   - `experimental_attachments` structure changed
   - Tool invocations moved to `parts` as specific types

3. **Removed v4 APIs**
   - `appendResponseMessages` - no replacement needed
   - `DataStreamWriter` - replaced by different streaming API
   - `Message` type - renamed to `UIMessage`
   - `LanguageModelV1StreamPart` - internal type removed
   - `ToolExecutionOptions` - API changed

4. **Type System Changes**
   - Tool API now uses different property names
   - `Tool` type has different structure
   - Part types are more specific

### Impact Assessment

**CRITICAL (blocks build)**:
- 20+ errors in core chat components
- 10+ errors in message display components
- 5+ errors in type definitions

**HIGH (affects functionality)**:
- 15+ errors in artifact/tool handling
- 5+ errors in hooks

**MEDIUM (legacy code)**:
- 5+ errors in deprecated balance utilities
- 3+ errors in db helpers (migration scripts)

**LOW (can defer)**:
- 40+ errors in test files

---

## Migration Strategy

### Phase 1: Type Foundations (Fix Type Definitions)

**Goal**: Create correct type definitions that components can use

**Files to Fix**:
1. `src/lib/types/ai-sdk-v5.ts` - Fix ExtendedUseChatHelpers interface
2. `src/lib/ai/chat/message-utils.ts` - Update NormalizedUIMessage type
3. `src/lib/types/message-conversion.ts` - Remove Message import, use UIMessage
4. `src/lib/types/attachment.ts` - Verify attachment type compatibility

**Key Changes**:

```typescript
// FILE: src/lib/types/ai-sdk-v5.ts

// ❌ CURRENT (doesn't extend properly)
export interface ExtendedUseChatHelpers extends SDK5UseChatHelpers<any> {
  sendMessage?: (options: { text: string }) => Promise<string | null | undefined>;
  // ... conflicts with base interface
}

// ✅ NEW (proper extension)
import type { UseChatHelpers } from '@ai-sdk/react';

// Don't extend - create wrapper type
export type ChatHelpers = UseChatHelpers & {
  // Manual state management (v5 doesn't provide these)
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (e?: FormEvent) => void;

  // Helper methods that wrap v5 APIs
  append: (message: UIMessage) => Promise<string | null | undefined>;
  reload: () => void;
};

// Helper functions to create these wrappers
export function createChatHelpers(
  chatHelpers: UseChatHelpers,
  input: string,
  setInput: (value: string) => void
): ChatHelpers {
  return {
    ...chatHelpers,
    input,
    setInput,
    handleSubmit: (e?: FormEvent) => {
      e?.preventDefault();
      if (input.trim()) {
        chatHelpers.sendMessage({ text: input });
        setInput('');
      }
    },
    append: async (message: UIMessage) => {
      // Extract text from message
      const text = message.parts
        ?.filter(p => p.type === 'text')
        ?.map(p => (p as any).text)
        ?.join('') || '';
      return chatHelpers.sendMessage({ text });
    },
    reload: () => {
      chatHelpers.regenerate();
    },
  };
}
```

```typescript
// FILE: src/lib/ai/chat/message-utils.ts

// ❌ CURRENT (doesn't match UIMessage)
export interface NormalizedUIMessage {
  parts?: Array<{ type: string; text: string }>; // Too loose
  // ...
}

// ✅ NEW (compatible with UIMessage)
import type { UIMessage, UIMessagePart } from 'ai';

export interface NormalizedUIMessage extends Omit<UIMessage, 'parts'> {
  id: string;
  role: 'user' | 'assistant' | 'system';
  parts: UIMessagePart[]; // Use proper AI SDK type
  createdAt: Date;

  // V4 compatibility (optional)
  content?: string;
  experimental_attachments?: Array<{
    url: string;
    name?: string;
    contentType?: string;
    documentId?: string;
  }>;
}
```

```typescript
// FILE: src/lib/types/message-conversion.ts

// ❌ CURRENT
import type { Message } from 'ai'; // Doesn't exist in v5

// ✅ NEW
import type { UIMessage } from 'ai';

// Update all type references from Message to UIMessage
export function convertToUIMessage(msg: any): UIMessage {
  // ...
}
```

**Success Criteria**:
- ✅ No TypeScript errors in type files themselves
- ✅ Types accurately reflect AI SDK v5 structure
- ✅ Helper functions bridge v4/v5 gap

---

### Phase 2: Core Chat Components

**Goal**: Fix the main chat interface that users interact with

**Files to Fix (in order)**:

#### 1. `src/components/chat/chat.tsx` (Main chat component)

**Current Issues**:
- Manually manages `input`/`setInput` ✅ (already correct)
- Uses `useChat` correctly ✅ (already correct)
- Passes props to MultimodalInput that expect v4 APIs ❌

**Changes Needed**:
```typescript
// In ChatContent component
const [input, setInput] = useState('');

const chatHelpers = useChat({
  // ... existing config
});

// Create wrapper with helper methods
const extendedHelpers = createChatHelpers(chatHelpers, input, setInput);

// Pass to MultimodalInput
<MultimodalInput
  input={input}
  setInput={setInput}
  handleSubmit={extendedHelpers.handleSubmit}
  sendMessage={extendedHelpers.sendMessage} // Add this
  // ... other props
/>
```

#### 2. `src/components/chat/multimodal-input.tsx` (Input component)

**Current Issues**:
- Props expect `UseChatHelpers["input"]` etc. (don't exist in v5)
- Uses `append` which doesn't exist in v5
- Uses `handleSubmit` which doesn't exist in v5

**Changes Needed**:
```typescript
// Update prop types
interface MultimodalInputProps {
  chatId: string;
  input: string; // ✅ Simple string, not UseChatHelpers["input"]
  setInput: (value: string) => void; // ✅ Simple function
  status: UseChatHelpers["status"]; // ✅ This exists in v5
  stop: () => void;
  sendMessage: (options: { text: string }) => Promise<any>; // ✅ v5 API
  // Remove: handleSubmit, append
  // ... other props
}

function PureMultimodalInput({
  input,
  setInput,
  sendMessage,
  // ...
}: MultimodalInputProps) {
  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() && attachments.length === 0) {
      // Direct v5 API call
      sendMessage({ text: input });
      setInput('');
    } else if (input.trim() && attachments.length > 0) {
      // With attachments - need different approach
      sendMessage({
        text: input,
        files: attachments.map(a => ({
          type: 'file',
          url: a.url,
          name: a.name,
          contentType: a.contentType,
        })),
      });
      setInput('');
      setAttachments([]);
    }
  };

  return (
    <form onSubmit={handleFormSubmit}>
      {/* ... */}
    </form>
  );
}
```

#### 3. `src/components/messages/message.tsx` (Message display)

**Current Issues**:
- Uses `reload` (should be `regenerate`)
- Uses `append` (should be `sendMessage`)
- Accesses `experimental_attachments` (structure changed)
- Accesses `part.reasoning` (property name might be different)
- Accesses `part.toolInvocation` (doesn't exist, moved to part itself)

**Changes Needed**:
```typescript
interface MessageProps {
  message: UIMessage;
  reload?: () => void; // Keep for compatibility
  regenerate?: () => void; // v5 API
  sendMessage?: (options: { text: string }) => Promise<any>; // v5 API
  // ...
}

function PurePreviewMessage({
  message,
  reload,
  regenerate,
  sendMessage,
  // ...
}: MessageProps) {
  // Support both v4 and v5 APIs
  const handleReload = () => {
    if (regenerate) {
      regenerate();
    } else if (reload) {
      reload();
    }
  };

  const handleFollowUp = (text: string) => {
    if (sendMessage) {
      sendMessage({ text });
    }
  };

  // AI SDK v5: Access attachments safely
  const attachments = (message as any).experimental_attachments || [];

  // AI SDK v5: Tool parts are in message.parts
  message.parts?.forEach((part: any) => {
    if (part.type?.startsWith('tool-')) {
      const toolName = part.type.replace('tool-', '');
      const toolState = part.state; // 'input-streaming' | 'output-available' | 'result'
      const toolOutput = part.output;
      // ... handle tool display
    }

    if (part.type === 'reasoning') {
      const reasoningText = part.text; // Not part.reasoning
      // ... display reasoning
    }
  });

  // ...
}
```

---

### Phase 3: Supporting Components

**Goal**: Fix components that depend on core chat

**Files to Fix**:

#### 1. `src/components/artifacts/create-artifact.tsx`

**Current Issues**:
- Uses `append` from UseChatHelpers

**Changes Needed**:
```typescript
interface CreateArtifactProps {
  sendMessage?: (options: { text: string }) => Promise<any>; // v5 API
  // Remove: append
}

function CreateArtifact({ sendMessage, ... }: CreateArtifactProps) {
  const handleCreate = async () => {
    if (sendMessage) {
      await sendMessage({ text: prompt });
    }
  };
}
```

#### 2. `src/components/layout/toolbar.tsx`

**Current Issues**:
- Multiple uses of `append` (4 occurrences)

**Changes Needed**:
```typescript
interface ToolbarProps {
  sendMessage?: (options: { text: string }) => Promise<any>; // v5 API
}

function Toolbar({ sendMessage, ... }: ToolbarProps) {
  const handleQuickAction = (prompt: string) => {
    if (sendMessage) {
      sendMessage({ text: prompt });
    }
  };
}
```

#### 3. `src/components/messages/message-editor.tsx`

**Current Issues**:
- Accesses `message.content` (doesn't exist, use parts)

**Changes Needed**:
```typescript
function MessageEditor({ message, ... }: MessageEditorProps) {
  // AI SDK v5: Extract text from parts
  const messageText = message.parts
    ?.filter((p: any) => p.type === 'text')
    ?.map((p: any) => p.text)
    ?.join('') || '';

  const [draftText, setDraftText] = useState(messageText);

  // ...
}
```

#### 4. `src/hooks/use-artifact.ts`

**Current Issues**:
- Accesses `part.toolName`, `part.toolCallId`, `part.output` (structure changed)

**Changes Needed**:
```typescript
export function useArtifact(chatId?: string, initialMessages?: UIMessage[]) {
  const detectArtifacts = useCallback((messages: UIMessage[]) => {
    for (const message of messages) {
      if (message.role === 'assistant' && message.parts) {
        for (const part of message.parts) {
          // AI SDK v5: Tool parts have different structure
          if (part.type?.startsWith('tool-')) {
            const toolName = part.type.replace('tool-', '');
            const toolState = (part as any).state;
            const toolOutput = (part as any).output;
            const toolCallId = (part as any).toolCallId;

            // Check for artifact tools
            if (
              toolName === 'configureScriptGeneration' &&
              toolState === 'result' &&
              toolOutput
            ) {
              // Extract artifact data
              const artifact = {
                documentId: toolOutput.id,
                title: toolOutput.title,
                kind: 'script',
                // ...
              };
              setArtifact(artifact);
            }
          }
        }
      }
    }
  }, [setArtifact]);

  // ...
}
```

#### 5. `src/hooks/use-auto-resume.ts`

**Current Issues**:
- Accesses `data` property (doesn't exist in v5)

**Changes Needed**:
```typescript
// AI SDK v5: data property removed
// If we need to track custom data, manage it separately

export function useAutoResume(chatHelpers: UseChatHelpers, autoResume: boolean) {
  // Remove reference to chatHelpers.data
  // Use chatHelpers.messages instead to check for stream data

  useEffect(() => {
    if (!autoResume) return;

    // Check if last message is incomplete (streaming was interrupted)
    const lastMessage = chatHelpers.messages[chatHelpers.messages.length - 1];
    if (lastMessage?.role === 'assistant') {
      // Check if any part is in streaming state
      const hasIncompleteStream = lastMessage.parts?.some((part: any) =>
        part.state === 'input-streaming' || part.state === 'streaming'
      );

      if (hasIncompleteStream) {
        chatHelpers.resumeStream();
      }
    }
  }, [chatHelpers, autoResume]);
}
```

---

### Phase 4: Remove Deprecated Code

**Goal**: Clean up v4 code that's no longer needed

**Files to Fix**:

#### 1. `src/lib/utils/balance-error-handler.ts`

**Current Issues**:
- Imports `DataStreamWriter` from 'ai' (doesn't exist in v5)
- Uses it in function signature

**Changes Needed**:
```typescript
// ❌ REMOVE
import type { DataStreamWriter } from 'ai';

export function handleBalanceError(
  error: BalanceError,
  dataStream: DataStreamWriter, // ❌ Remove this parameter
  operationType = 'operation',
): string {
  // This function is likely unused in v5 - verify with grep
  // If unused, mark as deprecated or remove entirely
  // If used, refactor to not need dataStream
}

// ✅ NEW (if still needed)
export function handleBalanceError(
  error: BalanceError,
  operationType = 'operation',
): BalanceError {
  const errorMessage = formatBalanceErrorMessage(error, operationType);
  console.error(`💳 Balance error for ${operationType}:`, error);

  // Return structured error instead of writing to stream
  return {
    ...error,
    message: errorMessage,
  };
}
```

**Investigation Needed**:
- Grep for usages: `grep -r "handleBalanceError" apps/super-chatbot/src/`
- If unused, remove file entirely
- If used in tools, refactor to return error object instead of streaming

#### 2. `src/lib/utils/balance-middleware.ts`

**Current Issues**:
- Same as balance-error-handler.ts

**Changes Needed**:
- Same approach - remove DataStreamWriter dependency
- Or remove file if unused

#### 3. `src/lib/db/helpers/01-core-to-parts.ts`

**Current Issues**:
- Imports `appendResponseMessages` (doesn't exist in v5)
- This is a migration helper script, likely one-time use

**Changes Needed**:
```typescript
// ❌ REMOVE
import { appendResponseMessages } from 'ai';

// This file appears to be a one-time migration script
// Check if it's still actively used
// If not, move to a separate migrations/ directory or delete

// If still needed, the appendResponseMessages logic was:
// - Takes messages and appends them to existing array
// - Can be replaced with simple array concatenation

// ✅ NEW (if needed)
function appendMessages(
  existingMessages: UIMessage[],
  newMessages: UIMessage[]
): UIMessage[] {
  return [...existingMessages, ...newMessages];
}
```

**Investigation Needed**:
- Check if this migration script is still run
- Check git history - when was it last modified?
- If it's a completed migration, remove it

#### 4. `src/lib/types/message-conversion.ts`

**Current Issues**:
- Imports `Message` type (renamed to `UIMessage` in v5)

**Changes Needed**:
```typescript
// ❌ OLD
import type { Message } from 'ai';

export function convertMessage(msg: Message): SomeType {
  // ...
}

// ✅ NEW
import type { UIMessage } from 'ai';

export function convertMessage(msg: UIMessage): SomeType {
  // ...
}
```

---

### Phase 5: Test File Fixes (DEFERRED - LOW PRIORITY)

**Rationale**: Test files don't block production build. Can be fixed in separate task.

**Files with Errors**:
- `src/tests/unit/ai-tools/*.test.ts` - Tool API changes
- `src/tests/prompts/*.ts` - Message structure changes
- `src/tests/helpers/helpers.ts` - Type signature changes

**When to Fix**:
- After main application is working
- As separate task: "Fix AI SDK v5 Test Suite"
- Can be done incrementally as tests are needed

---

## Implementation Order

### Step 1: Type Foundations (2 hours)

```bash
# Create new type utilities
1. Update src/lib/types/ai-sdk-v5.ts
   - Remove ExtendedUseChatHelpers interface
   - Add ChatHelpers type
   - Add createChatHelpers() function

2. Update src/lib/ai/chat/message-utils.ts
   - Fix NormalizedUIMessage to use UIMessagePart[]
   - Ensure compatibility with UIMessage

3. Update src/lib/types/message-conversion.ts
   - Replace Message with UIMessage
   - Update all function signatures

4. Run typecheck to verify type errors reduced
   pnpm typecheck 2>&1 | grep "error TS" | wc -l
```

### Step 2: Core Chat (3-4 hours)

```bash
# Fix main chat flow
1. Update src/components/chat/chat.tsx
   - Import createChatHelpers
   - Create wrapped helpers
   - Pass correct props to MultimodalInput

2. Update src/components/chat/multimodal-input.tsx
   - Update prop types (remove UseChatHelpers references)
   - Add sendMessage prop
   - Implement handleFormSubmit locally
   - Remove append usage

3. Update src/components/messages/message.tsx
   - Add regenerate and sendMessage props
   - Support both reload (v4) and regenerate (v5)
   - Fix experimental_attachments access
   - Fix part.reasoning access
   - Fix tool part access

4. Run typecheck after each file
5. Test manually: can send message, can view response
```

### Step 3: Supporting Components (2-3 hours)

```bash
# Fix dependent components
1. Update src/components/artifacts/create-artifact.tsx
   - Replace append with sendMessage

2. Update src/components/layout/toolbar.tsx
   - Replace all append calls with sendMessage

3. Update src/components/messages/message-editor.tsx
   - Extract text from parts instead of content

4. Update src/hooks/use-artifact.ts
   - Fix tool part access (toolName, output, etc.)

5. Update src/hooks/use-auto-resume.ts
   - Remove data property access
   - Check message parts for streaming state

6. Run typecheck after each file
```

### Step 4: Remove Deprecated Code (1-2 hours)

```bash
# Clean up v4 artifacts
1. Investigate balance utilities usage
   grep -r "handleBalanceError" apps/super-chatbot/src/
   grep -r "balance-error-handler" apps/super-chatbot/src/

2. Either remove or refactor:
   - src/lib/utils/balance-error-handler.ts
   - src/lib/utils/balance-middleware.ts

3. Check if migration script still needed:
   git log --follow -- apps/super-chatbot/src/lib/db/helpers/01-core-to-parts.ts

4. Either remove or update:
   - src/lib/db/helpers/01-core-to-parts.ts

5. Run final typecheck
   pnpm typecheck
```

### Step 5: Testing & Validation (2-3 hours)

```bash
# Ensure everything works
1. Build the application
   cd apps/super-chatbot
   pnpm build

2. Run linter
   pnpm lint

3. Manual testing checklist:
   - ✅ Can send text message
   - ✅ Can receive response
   - ✅ Can attach files
   - ✅ Can view message attachments
   - ✅ Can regenerate message
   - ✅ Can view tool invocations (image/video gen)
   - ✅ Can view script artifacts
   - ✅ Can edit messages
   - ✅ Toolbar quick actions work
   - ✅ Auto-resume works

4. Run relevant unit tests (if any passing)
   pnpm test:unit

5. Commit changes with clear message
   git add .
   git commit -m "Complete AI SDK v5 migration

   - Fix type definitions (ChatHelpers, NormalizedUIMessage)
   - Update core chat components (chat.tsx, multimodal-input.tsx, message.tsx)
   - Update supporting components (artifacts, toolbar, hooks)
   - Remove deprecated v4 code (DataStreamWriter, appendResponseMessages)
   - All TypeScript errors resolved
   - Build passes successfully

   Breaking changes:
   - Components now use sendMessage instead of append
   - Components now use regenerate instead of reload
   - Input state managed manually (not from useChat)

   Migration notes in _tasks/2025-10-20-ai-sdk-v5-completion/"
```

---

## File-by-File Changes Summary

### Type Files (3 files)

| File | Lines Changed | Complexity | Risk |
|------|---------------|------------|------|
| `src/lib/types/ai-sdk-v5.ts` | ~50 | Medium | Low |
| `src/lib/ai/chat/message-utils.ts` | ~10 | Low | Low |
| `src/lib/types/message-conversion.ts` | ~5 | Low | Low |

### Core Components (3 files)

| File | Lines Changed | Complexity | Risk |
|------|---------------|------------|------|
| `src/components/chat/chat.tsx` | ~20 | Medium | Medium |
| `src/components/chat/multimodal-input.tsx` | ~30 | High | Medium |
| `src/components/messages/message.tsx` | ~40 | High | High |

### Supporting Components (5 files)

| File | Lines Changed | Complexity | Risk |
|------|---------------|------------|------|
| `src/components/artifacts/create-artifact.tsx` | ~10 | Low | Low |
| `src/components/layout/toolbar.tsx` | ~15 | Low | Low |
| `src/components/messages/message-editor.tsx` | ~10 | Low | Low |
| `src/hooks/use-artifact.ts` | ~25 | Medium | Medium |
| `src/hooks/use-auto-resume.ts` | ~15 | Medium | Low |

### Deprecated Code (3 files - might delete)

| File | Action | Complexity | Risk |
|------|--------|------------|------|
| `src/lib/utils/balance-error-handler.ts` | Remove or refactor | Low | Low |
| `src/lib/utils/balance-middleware.ts` | Remove or refactor | Low | Low |
| `src/lib/db/helpers/01-core-to-parts.ts` | Investigate, likely remove | Low | Low |

**Total**: 14 files, ~230 lines changed

---

## Testing Strategy

### Manual Testing Checklist

#### Core Chat Flow
- [ ] Open chat page
- [ ] Type message and send
- [ ] Verify message appears in UI
- [ ] Verify response streams in
- [ ] Verify response saved to database
- [ ] Reload page, messages still there

#### Attachments
- [ ] Attach image file
- [ ] Send message with attachment
- [ ] Verify attachment displays
- [ ] Verify attachment accessible on reload

#### Tool Invocations
- [ ] Request image generation
- [ ] Verify progress shown
- [ ] Verify result displays
- [ ] Request video generation
- [ ] Verify progress shown
- [ ] Verify result displays

#### Script Artifacts
- [ ] Request script generation
- [ ] Verify artifact opens automatically
- [ ] Verify script content correct
- [ ] Verify script saved to message
- [ ] Reload page, artifact still accessible

#### Message Actions
- [ ] Click regenerate on message
- [ ] Verify new response generated
- [ ] Edit user message
- [ ] Verify edit saved

#### Toolbar
- [ ] Click toolbar quick action
- [ ] Verify message sent
- [ ] Verify response received

### Automated Testing (Deferred)

Test files need separate refactoring:
- `src/tests/unit/ai-tools/*.test.ts`
- `src/tests/prompts/*.ts`
- `src/tests/helpers/helpers.ts`

Create follow-up task: "Refactor AI SDK v5 Test Suite"

---

## Risk Mitigation

### High-Risk Changes

1. **multimodal-input.tsx** - Core user input
   - **Risk**: Users can't send messages
   - **Mitigation**: Test thoroughly before committing
   - **Rollback**: Keep old version in git, easy to revert

2. **message.tsx** - Message display
   - **Risk**: Messages don't render, attachments broken
   - **Mitigation**: Maintain backward compatibility with content field
   - **Rollback**: Easy to revert single file

3. **use-artifact.ts** - Artifact detection
   - **Risk**: Script artifacts don't open
   - **Mitigation**: Extensive logging, test with multiple artifact types
   - **Rollback**: Easy to revert single file

### Medium-Risk Changes

- **chat.tsx**: Well-tested pattern, low risk
- **toolbar.tsx**: Simple change, low risk
- **use-auto-resume.ts**: Feature, not core functionality

### Low-Risk Changes

- Type definitions: Compilation will catch errors
- Deprecated code removal: Already not used
- Message editor: Simple text extraction

---

## Success Criteria

### Must Have (Blockers)

- ✅ Zero TypeScript compilation errors (Priority 1-4 files)
- ✅ `pnpm build` succeeds
- ✅ `pnpm lint` passes
- ✅ Can send and receive messages
- ✅ Can view message history
- ✅ Attachments display correctly

### Should Have (Important)

- ✅ Tool invocations work (image/video generation)
- ✅ Script artifacts open automatically
- ✅ Message regeneration works
- ✅ Message editing works
- ✅ Toolbar quick actions work

### Nice to Have (Can defer)

- ⚠️ Auto-resume works (low usage feature)
- ⚠️ All test files pass (separate task)
- ⚠️ Perfect type safety (can improve iteratively)

---

## Rollback Plan

If issues are found:

1. **Individual File Rollback**
   ```bash
   git checkout HEAD -- <file>
   ```

2. **Full Rollback**
   ```bash
   git reset --hard HEAD~1
   ```

3. **Partial Rollback** (keep types, revert components)
   ```bash
   git checkout HEAD~1 -- src/components/
   ```

The changes are incremental and each file is independent, making rollback straightforward.

---

## Documentation Updates

### After Completion

1. **Update `_ai/ai-sdk-v5-patterns.md`** (create if doesn't exist)
   ```markdown
   # AI SDK v5 Patterns

   ## Manual Input Management
   [Example code]

   ## Using sendMessage
   [Example code]

   ## Accessing Message Parts
   [Example code]

   ## Tool Part Detection
   [Example code]
   ```

2. **Update `apps/super-chatbot/docs/development/AI_SDK_MIGRATION.md`**
   - Document breaking changes
   - Provide migration examples
   - Link to v5 official docs

3. **Update `_tasks/2025-10-20-ai-sdk-v5-completion/XX-final-summary.md`**
   - What was changed
   - Decisions made
   - Lessons learned
   - Remaining work (test files)

---

## Dependencies & Prerequisites

### Required

- ✅ AI SDK v5 packages installed (already done)
- ✅ Chat API routes using v5 (already done)
- ✅ Utility modules from previous refactoring (already done)

### Nice to Have

- 📚 AI SDK v5 documentation open
- 🔍 VSCode with TypeScript errors visible
- 🧪 Local development environment running

---

## Estimated Timeline

**Total**: 8-12 hours over 2-3 days

### Day 1 (4-5 hours)
- Morning: Type foundations (2 hours)
- Afternoon: Core chat components (2-3 hours)
- End of day: TypeCheck shows significant reduction in errors

### Day 2 (3-4 hours)
- Morning: Supporting components (2-3 hours)
- Afternoon: Deprecated code removal (1-2 hours)
- End of day: TypeCheck shows zero errors (Priority 1-4)

### Day 3 (1-3 hours)
- Morning: Build & lint (30 min)
- Afternoon: Manual testing (1-2 hours)
- Commit & documentation (30 min)

---

## Key Decision Points

### Decision 1: Extend or Wrap UseChatHelpers?

**Options**:
- A) Extend the interface (current approach)
- B) Create wrapper type (recommended)

**Recommendation**: **B - Create wrapper type**

**Rationale**:
- Extending causes type conflicts (sendMessage signature mismatch)
- Wrapper provides clear separation
- Helper function bridges v4/v5 gap cleanly

### Decision 2: Keep content field?

**Options**:
- A) Remove entirely, force parts usage
- B) Keep for backward compatibility

**Recommendation**: **B - Keep for backward compatibility**

**Rationale**:
- Some components may still use it
- Gradual migration is safer
- Can deprecate later

### Decision 3: Remove balance utilities?

**Options**:
- A) Remove immediately
- B) Refactor to work without DataStreamWriter
- C) Mark as deprecated, remove later

**Recommendation**: **Investigate first, then A or C**

**Rationale**:
- Need to check if actively used
- If unused, remove immediately (option A)
- If used but low priority, deprecate (option C)

### Decision 4: Fix test files now or later?

**Options**:
- A) Fix all tests as part of this task
- B) Create separate task for tests

**Recommendation**: **B - Separate task**

**Rationale**:
- Tests don't block production build
- 40+ test errors would double the work
- Can fix incrementally as tests are needed

---

## Appendix A: AI SDK v5 Key Changes

### Removed from useChat

```typescript
// ❌ v4 (removed)
const {
  input,        // ❌ Removed
  setInput,     // ❌ Removed
  handleSubmit, // ❌ Removed
  append,       // ❌ Removed
  reload,       // ❌ Removed
  data,         // ❌ Removed
} = useChat();

// ✅ v5 (available)
const {
  messages,       // ✅ Still available
  setMessages,    // ✅ Still available
  status,         // ✅ Still available
  stop,           // ✅ Still available
  sendMessage,    // ✅ NEW - replaces append
  regenerate,     // ✅ NEW - replaces reload
  resumeStream,   // ✅ Available
  addToolResult,  // ✅ Available
} = useChat();
```

### Message Structure Changes

```typescript
// ❌ v4
interface Message {
  id: string;
  role: string;
  content: string; // ❌ Deprecated
  toolInvocations?: ToolInvocation[]; // ❌ Removed
}

// ✅ v5
interface UIMessage {
  id: string;
  role: string;
  parts: UIMessagePart[]; // ✅ NEW - replaces content
  // content deprecated but may still be present for compatibility
}

type UIMessagePart =
  | TextUIPart
  | ToolCallUIPart
  | ToolResultUIPart
  | ReasoningUIPart
  | FileUIPart;
```

### Tool Part Structure

```typescript
// ❌ v4
const toolInvocation = message.toolInvocations?.[0];
if (toolInvocation) {
  const { toolName, state, result } = toolInvocation;
}

// ✅ v5
const toolPart = message.parts?.find(p => p.type?.startsWith('tool-'));
if (toolPart) {
  const toolName = toolPart.type.replace('tool-', '');
  const state = (toolPart as any).state;
  const output = (toolPart as any).output;
}
```

---

## Appendix B: Reference Links

- [AI SDK v5 Documentation](https://sdk.vercel.ai/)
- [Migration Guide](https://sdk.vercel.ai/docs/migration)
- [useChat Hook](https://sdk.vercel.ai/docs/reference/ai-sdk-ui/use-chat)
- [Message Types](https://sdk.vercel.ai/docs/reference/ai-sdk-core/message-types)
- [Tool Calling](https://sdk.vercel.ai/docs/foundations/tool-calling)

---

## Appendix C: Grep Commands for Investigation

```bash
# Find all UseChatHelpers usage
grep -r "UseChatHelpers" apps/super-chatbot/src/ --include="*.tsx" --include="*.ts"

# Find all append usage
grep -r "\.append\(" apps/super-chatbot/src/ --include="*.tsx" --include="*.ts"

# Find all reload usage
grep -r "\.reload\(" apps/super-chatbot/src/ --include="*.tsx" --include="*.ts"

# Find balance utilities usage
grep -r "handleBalanceError" apps/super-chatbot/src/
grep -r "DataStreamWriter" apps/super-chatbot/src/

# Find migration script usage
grep -r "01-core-to-parts" apps/super-chatbot/src/
grep -r "appendResponseMessages" apps/super-chatbot/src/

# Find content property access
grep -r "message\.content" apps/super-chatbot/src/ --include="*.tsx" --include="*.ts"

# Find experimental_attachments access
grep -r "experimental_attachments" apps/super-chatbot/src/ --include="*.tsx" --include="*.ts"
```

---

**Created by**: @don (Guillermo - Tech Lead & Process Manager)
**Date**: 2025-10-20
**Branch**: `fix-chat-error-update-aisdkv5`
**Next Step**: Begin Phase 1 - Type Foundations

---

**The Vercel Way**: "Make the right thing easy." We're making the v5 migration the right thing by creating clean helpers that bridge the gap. Future developers will thank us.
