# User Request: AI SDK v5 Refactoring and Consolidation

**Date**: 2025-10-15
**Priority**: High
**Complexity**: Complex - Multi-step refactoring

## Problem Statement

After migrating to AI SDK v5, the chat API routes have significant issues:

### 1. Code Duplication
- **Two API routes with different implementations**:
  - `/api/chat/route.ts` - Simple implementation (247 lines)
  - `/api/gemini-chat/route.ts` - Complex implementation (1,152 lines)
- **Duplicated functions**: `normalizeMessage`, error formatting, chat/user creation logic
- **Inconsistent patterns**: Simple `toUIMessageStreamResponse()` vs complex `createDataStream`

### 2. TypeScript Errors (35+ errors)
```
- appendResponseMessages not exported from 'ai' (v5 removed it)
- createDataStream not exported from 'ai' (v5 removed it)
- mergeIntoDataStream does not exist (v5 changed API)
- Property 'id' does not exist on AssistantModelMessage
- Property 'content' does not exist on UIMessage (v5 uses parts)
- Property 'input'/'setInput' removed from useChat in v5
- Property 'reload' is now 'regenerate' in v5
- Attachment type not exported from 'ai' in v5
- maxSteps not recognized in streamText options
```

### 3. AI SDK v5 API Misuse
- **Wrong imports**: Using v4 APIs that don't exist in v5
  - `createDataStream` → should use `createUIMessageStream` or `toUIMessageStreamResponse()`
  - `appendResponseMessages` → removed in v5
  - `mergeIntoDataStream` → API changed
- **Incorrect patterns**: Manual stream management instead of v5 helpers
- **Missing v5 features**: Not using `sendMessage()`, proper error handling, `onError` callback

### 4. Structural Issues
- **No centralized AI logic**: Each route reimplements everything
- **No shared utilities**: Error handling, message normalization duplicated
- **Unclear organization**: Where to put AI-related code?
- **Legacy SSE/WebSocket**: Complex resumable streams may not be needed with v5

## User Requirements

Create a comprehensive refactoring plan that:

1. **Fixes all TypeScript errors** by using correct AI SDK v5 APIs
2. **Eliminates code duplication** through shared utilities and patterns
3. **Simplifies API routes** using recommended v5 patterns
4. **Centralizes AI logic** in proper modules:
   - Common utilities for AI operations
   - Shared error handling
   - Message normalization
   - Tool configuration
5. **Improves project structure**:
   - Clear separation of concerns
   - Consistent patterns across routes
   - Easy to maintain and extend
6. **Documents changes** for future reference

## Context from Recent Tasks

### Related Task: `2025-10-15-ai-sdk-v5-artifacts-fix`
- Fixed `setInput is not a function` by managing input manually
- Addressed artifacts not opening automatically
- Migrated to `toUIMessageStreamResponse()` pattern

### Related Task: `2025-10-10-ai-sdk-v5-test-chat`
- Created test chat to validate v5 functionality
- Identified working patterns for v5

### Related Task: `2025-10-07-ai-sdk-tools-migration`
- Analyzed context analyzers for images/videos
- Plan to convert to AI SDK tools format

## Success Criteria

1. ✅ All TypeScript errors resolved
2. ✅ Zero code duplication between routes
3. ✅ Both `/api/chat` and `/api/gemini-chat` use same underlying utilities
4. ✅ Clear, maintainable structure with proper separation of concerns
5. ✅ All AI SDK v5 APIs used correctly
6. ✅ Comprehensive documentation of patterns and decisions
7. ✅ Tests pass (unit + integration)
8. ✅ Lint passes without errors

## Expected Deliverables

1. **Detailed technical plan** (`02-plan.md`) with:
   - Analysis of current implementation
   - Proposed architecture
   - File-by-file changes
   - Migration strategy
   - Testing approach
2. **Architecture documentation** for future reference
3. **Implementation by agents** following the plan
4. **Updated knowledge base** with AI SDK v5 patterns
