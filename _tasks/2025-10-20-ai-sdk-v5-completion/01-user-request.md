# User Request: Complete AI SDK v4 to v5 Migration

**Date**: 2025-10-20
**Priority**: Critical
**Complexity**: High - TypeScript error resolution + Component refactoring

## Problem Statement

The migration from AI SDK v4 to v5 is incomplete, resulting in **~100 TypeScript errors** across the chatbot application. The main chat API routes have been updated to use v5 patterns, but many components still reference v4 APIs that no longer exist.

### Context from Recent Work

**Previous Task**: `2025-10-15-ai-sdk-v5-refactoring`
- Created excellent utility modules (message-utils, error-handler, chat-management)
- Refactored `gemini-chat/route.ts` successfully
- Partially refactored `chat/route.ts`
- Utilities are working and well-tested

**Current Branch**: `fix-chat-error-update-aisdkv5`

**Recent Commits**:
- 9c574dc: Refactor imports and enhance chat API functionality
- a2e2270: Refactor chat API and enhance functionality for AI SDK v5 compatibility
- af768b2: Updated

### Key TypeScript Errors (from typecheck)

#### 1. UseChatHelpers Properties Missing (AI SDK v5 Breaking Change)

**Files Affected**:
- `src/components/artifacts/create-artifact.tsx` - `append` doesn't exist
- `src/components/chat/multimodal-input.tsx` - `input`, `setInput`, `append`, `handleSubmit` don't exist
- `src/components/layout/toolbar.tsx` - `append` doesn't exist (4 occurrences)
- `src/components/messages/message.tsx` - `reload`, `append` don't exist

**Root Cause**: In AI SDK v5, `useChat` no longer provides:
- `input` / `setInput` - must be managed manually
- `append` - replaced by `sendMessage`
- `handleSubmit` - must be implemented manually
- `reload` - replaced by `regenerate`

**Current Workaround**: `src/lib/types/ai-sdk-v5.ts` defines `ExtendedUseChatHelpers` interface, but components aren't using it correctly.

#### 2. Message Property Errors

**Files Affected**:
- `src/components/messages/message.tsx` - `experimental_attachments` doesn't exist on UIMessage
- `src/components/messages/message-editor.tsx` - `content` property doesn't exist
- `src/hooks/use-artifact.ts` - `toolName`, `toolCallId`, `output` don't exist on parts
- `src/lib/db/helpers/01-core-to-parts.ts` - `createdAt` doesn't exist on UIMessage

**Root Cause**: AI SDK v5 changed message structure:
- No more `content` property (use `parts` array)
- `experimental_attachments` structure changed
- Tool invocations are now in `parts` as tool-specific types

#### 3. Deprecated API Imports

**Files Affected**:
- `src/lib/db/helpers/01-core-to-parts.ts` - `appendResponseMessages` doesn't exist
- `src/lib/utils/balance-error-handler.ts` - `DataStreamWriter` doesn't exist
- `src/lib/utils/balance-middleware.ts` - `DataStreamWriter` doesn't exist
- `src/lib/types/message-conversion.ts` - `Message` type doesn't exist (renamed to `UIMessage`)
- `src/hooks/use-auto-resume.ts` - `data` property doesn't exist

**Root Cause**: These v4 APIs were removed in v5.

#### 4. Type Mismatches

**Files Affected**:
- `src/lib/ai/chat/chat-management.ts` - `NormalizedUIMessage` not assignable to `UIMessage`
- `src/lib/types/ai-sdk-v5.ts` - `ExtendedUseChatHelpers` incorrectly extends `UseChatHelpers`
- Multiple test files - `parameters`, `execute` property issues on Tool type

**Root Cause**: Custom types not properly aligned with v5 type definitions.

#### 5. Tool API Changes

**Files Affected**:
- `src/tests/prompts/basic.ts` - `result` property doesn't exist on `ToolResultPart`
- Multiple tool test files - `tool.execute` and `tool.parameters` possibly undefined
- `src/tests/unit/ai-tools/find-media-in-chat.test.ts` - `ToolExecutionOptions` doesn't exist

**Root Cause**: Tool API changed in v5 - different property names and execution patterns.

## User Requirements

Create a comprehensive refactoring plan that:

1. **Focuses on main chat components** - The core chat functionality that users interact with
2. **Fixes TypeScript errors systematically** - Group by category, fix in order
3. **Uses proper AI SDK v5 patterns** - Follow official v5 documentation
4. **Removes unused v4 references** - Clean up deprecated code
5. **Maintains existing functionality** - Don't break working features
6. **Provides clear migration path** - Document what changed and why

### Specific Focus Areas

#### Priority 1: Core Chat Components (CRITICAL)
- `src/components/chat/chat.tsx` - Main chat component using useChat
- `src/components/chat/multimodal-input.tsx` - Input component needing manual state
- `src/components/messages/message.tsx` - Message display with attachments
- `src/components/artifacts/create-artifact.tsx` - Artifact creation using append

#### Priority 2: Supporting Components (HIGH)
- `src/components/layout/toolbar.tsx` - Toolbar using append
- `src/components/messages/message-editor.tsx` - Message editing
- `src/hooks/use-artifact.ts` - Artifact detection from parts
- `src/hooks/use-auto-resume.ts` - Stream resumption

#### Priority 3: Type Definitions (HIGH)
- `src/lib/types/ai-sdk-v5.ts` - Fix ExtendedUseChatHelpers interface
- `src/lib/ai/chat/chat-management.ts` - Fix NormalizedUIMessage type
- `src/lib/types/message-conversion.ts` - Update to use UIMessage

#### Priority 4: Deprecated Code (MEDIUM)
- `src/lib/db/helpers/01-core-to-parts.ts` - Remove appendResponseMessages
- `src/lib/utils/balance-error-handler.ts` - Remove DataStreamWriter
- `src/lib/utils/balance-middleware.ts` - Remove DataStreamWriter

#### Priority 5: Tests (LOW - can be addressed separately)
- Tool test files
- Prompt test files

## Success Criteria

1. ✅ **Zero TypeScript compilation errors** in Priority 1-4 files
2. ✅ **Main chat works** - Users can send messages, view responses
3. ✅ **Attachments work** - experimental_attachments properly accessed
4. ✅ **Tools work** - Image/video generation, documents, suggestions
5. ✅ **Artifacts work** - Script artifacts open automatically
6. ✅ **No v4 APIs used** - All deprecated imports removed
7. ✅ **Code builds successfully** - `pnpm build` passes
8. ✅ **Lint passes** - `pnpm lint` no errors

## Key Migration Patterns Needed

### Pattern 1: Manual Input Management
```typescript
// ❌ v4 (doesn't work in v5)
const { input, setInput, handleSubmit } = useChat();

// ✅ v5 (correct)
const [input, setInput] = useState("");
const chatHelpers = useChat({ ... });
const handleSubmit = (e) => {
  e.preventDefault();
  chatHelpers.sendMessage({ text: input });
  setInput("");
};
```

### Pattern 2: sendMessage instead of append
```typescript
// ❌ v4
await append({ role: "user", content: "..." });

// ✅ v5
await sendMessage({ text: "..." });
```

### Pattern 3: regenerate instead of reload
```typescript
// ❌ v4
reload();

// ✅ v5
regenerate();
```

### Pattern 4: Access parts instead of content
```typescript
// ❌ v4
const text = message.content;

// ✅ v5
const text = message.parts
  ?.filter(p => p.type === 'text')
  ?.map(p => p.text)
  ?.join(' ') || '';
```

### Pattern 5: Tool parts detection
```typescript
// ❌ v4
const toolInvocation = message.toolInvocations?.find(...);

// ✅ v5
const toolPart = message.parts?.find(p =>
  p.type.startsWith('tool-') && p.toolName === 'configureImageGeneration'
);
```

## Expected Deliverables

1. **Comprehensive technical plan** (this file + `02-plan.md`)
   - File-by-file changes
   - Migration order
   - Testing strategy
   - Rollback plan if needed

2. **Implementation** following TDD principles
   - Update types first
   - Fix components one by one
   - Test after each change
   - Commit working increments

3. **Documentation**
   - Update `_ai/` knowledge base with v5 patterns
   - Create migration guide for future reference
   - Document breaking changes

4. **Quality checks**
   - TypeScript compilation passes
   - Build succeeds
   - Lint passes
   - Manual testing of core flows

## Files to Analyze

Before creating the plan, must analyze:
- [x] `src/components/chat/chat.tsx` - How useChat is currently used
- [x] `src/components/chat/multimodal-input.tsx` - How input is managed
- [ ] `src/components/messages/message.tsx` - How messages are displayed
- [ ] `src/hooks/use-artifact.ts` - How artifacts are detected
- [ ] `src/lib/types/ai-sdk-v5.ts` - Current type definitions
- [ ] All files with TypeScript errors

## Out of Scope

- Test files refactoring (can be separate task)
- Performance optimization
- New features
- Code style improvements beyond what's needed for v5 migration
- Other API routes beyond `/api/chat` and `/api/gemini-chat`

## Notes

- The main chat API route (`/api/chat/route.ts`) is already using v5 patterns correctly
- Utilities from previous refactoring are working well
- Focus is on client-side components that consume the chat API
- Must maintain backward compatibility where possible (e.g., content field for gradual migration)
