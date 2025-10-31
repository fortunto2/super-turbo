# Test Report: message-utils.ts

**Created**: 2025-10-15
**Author**: @kent (TDD Test Engineer)
**Status**: ✅ Tests Created and Passing
**Test File**: `src/tests/unit/lib/ai/chat/message-utils.test.ts`
**Implementation**: `src/lib/ai/chat/message-utils.ts`
**Related Schemas**: `src/lib/ai/chat/message-schemas.ts`

---

## Executive Summary

Successfully created TDD tests and implementation for the first utility module in the AI SDK v5 refactoring plan. All 28 tests pass, providing comprehensive coverage for message normalization, UUID generation, and DB-to-UI message conversion.

**Test Results**: ✅ 28/28 tests passing (100%)

---

## Schema Research (Step 0 - MANDATORY)

### Existing Schemas Found

1. **`src/lib/types/message-conversion.ts`**
   - ✅ `DBMessage` interface - Database message structure
   - ✅ `convertDBMessagesToUIMessages()` - Working conversion utility
   - ✅ Type-safe conversions with proper handling of `parts` and `content`

2. **`src/lib/security/input-validation.ts`**
   - ✅ `ChatMessageSchema` - Zod validation for chat messages
   - ✅ Pattern: `safeParse()` for validation
   - ✅ Custom error messages in Russian

3. **AI SDK v5 Types**
   - ✅ `Message as UIMessage` from 'ai' package
   - ✅ Uses `parts` array instead of `content` field
   - ✅ Different structure for user vs assistant messages

### New Schemas Created

**File**: `src/lib/ai/chat/message-schemas.ts`

```typescript
export const MessagePartSchema = z.object({
  type: z.string(),
  text: z.string().optional(),
}).passthrough();

export const UIMessageSchema = z.object({
  id: z.string().optional(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().optional(),
  parts: z.array(MessagePartSchema).optional(),
  experimental_attachments: z.array(z.any()).optional(),
  createdAt: z.date().optional(),
}).passthrough();
```

**Rationale**: Created schemas for message validation following existing patterns from `input-validation.ts`. Used `passthrough()` to allow AI SDK v5 to add additional fields dynamically.

---

## Test Coverage

### Module: `normalizeUIMessage(message: any): NormalizedUIMessage`

**Purpose**: Normalize any message format to AI SDK v5 compatible structure.

**Test Cases** (10 tests):
1. ✅ Normalize message with `content` field
2. ✅ Normalize message with `parts` field
3. ✅ Generate UUID when missing
4. ✅ Preserve existing UUID
5. ✅ Handle missing content and parts gracefully
6. ✅ Add `createdAt` when missing
7. ✅ Preserve `experimental_attachments`
8. ✅ Handle empty parts array
9. ✅ Preserve parts with missing text property

**Edge Cases Covered**:
- Null/undefined message input
- Messages with only role field
- Parts without text properties

### Module: `ensureMessageHasUUID(message: any): NormalizedUIMessage`

**Purpose**: Guarantee proper UUID for database storage.

**Test Cases** (6 tests):
1. ✅ Keep valid UUID
2. ✅ Generate UUID for short ID from AI SDK
3. ✅ Generate UUID when ID is missing
4. ✅ Generate UUID when ID is undefined
5. ✅ Generate UUID when ID is null
6. ✅ Not modify message except for ID

**Implementation Note**: AI SDK v5 generates short IDs like `msg_abc123`. We need full UUIDs for PostgreSQL database constraints.

### Module: `convertDBMessagesToUIMessages(dbMessages: DBMessage[]): UIMessage[]`

**Purpose**: Re-export existing utility from `message-conversion.ts`.

**Test Cases** (6 tests):
1. ✅ Convert single DB message to UI message
2. ✅ Convert multiple DB messages
3. ✅ Handle empty array
4. ✅ Preserve message order
5. ✅ Use existing conversion logic
6. ✅ Handle DB messages with complex parts

**Design Decision**: Reused existing working implementation from `message-conversion.ts` instead of duplicating code. This follows DRY principle.

### Edge Cases & Type Safety (6 tests)

1. ✅ Handle null message in `normalizeUIMessage`
2. ✅ Handle undefined message in `normalizeUIMessage`
3. ✅ Handle message with only role
4. ✅ Handle DB message with null parts
5. ✅ Handle DB message with undefined parts
6. ✅ Return properly typed UIMessage

---

## Implementation Details

### Key Design Decisions

1. **Schema-First Approach**
   - Created Zod schemas before writing tests
   - Followed existing patterns from `input-validation.ts`
   - Used `passthrough()` for AI SDK v5 flexibility

2. **Helper-First Methodology**
   - Created helper functions for repeated operations:
     * `extractContentFromParts()` - Extract text from parts array
     * `ensurePartsArray()` - Guarantee proper parts structure
     * `isValidUUID()` - Validate UUID format
   - Tests read like prose using descriptive helper names

3. **Reuse Over Duplication**
   - Re-exported `convertDBMessagesToUIMessages` from existing module
   - Leveraged `generateUUID()` from `@/lib/utils`
   - Used existing `DBMessage` type from `message-conversion.ts`

4. **AI SDK v5 Compatibility**
   - Messages use `parts` array (v5 pattern)
   - Maintain backward compatibility with `content` field
   - Handle both user messages (content-based) and assistant messages (parts-based)

### Type Safety

```typescript
export interface NormalizedUIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  parts?: Array<{ type: string; text: string; [key: string]: any }>;
  experimental_attachments?: any[];
  createdAt: Date;
  [key: string]: any; // Allow AI SDK v5 extensions
}
```

**Rationale**: Strong typing for known fields, flexible for AI SDK extensions.

---

## Test Patterns Used

### Real Project Patterns (from existing tests)

1. **Helper Functions for Test Data**
   ```typescript
   function createUserMessage(overrides = {}): any {
     return {
       role: 'user',
       content: 'Hello, world!',
       createdAt: new Date(),
       ...overrides,
     };
   }
   ```

2. **Validation Helper**
   ```typescript
   function isValidUUID(uuid: string): boolean {
     const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
     return uuidRegex.test(uuid);
   }
   ```

3. **Vitest Patterns**
   ```typescript
   import { describe, it, expect } from 'vitest';

   describe('message-utils', () => {
     describe('normalizeUIMessage', () => {
       it('should normalize message with content field', () => {
         const message = createUserMessage({ content: 'Hello AI' });
         const normalized = normalizeUIMessage(message);

         expect(normalized.content).toBe('Hello AI');
         expect(normalized.parts).toBeDefined();
       });
     });
   });
   ```

---

## Integration Points

### Dependencies

1. **`@/lib/utils`**
   - `generateUUID()` - UUID generation (crypto.randomUUID with fallback)

2. **`@/lib/types/message-conversion`**
   - `convertDBMessagesToUIMessages()` - Existing DB conversion
   - `DBMessage` type - Database message structure

3. **AI SDK v5 (`ai` package)**
   - `Message as UIMessage` - UI message type from AI SDK

### Used By (Future)

Based on plan from `02-plan.md`:

1. **`src/lib/ai/chat/chat-management.ts`**
   - Will use `normalizeUIMessage()` for title generation
   - Will use `ensureMessageHasUUID()` for saving messages

2. **`src/lib/ai/chat/stream-handler.ts`**
   - Will use message utilities for stream preparation

3. **API Routes**
   - `/api/chat/route.ts` - Refactored to use utilities
   - `/api/gemini-chat/route.ts` - Refactored to use utilities

---

## Next Steps (from 02-plan.md)

### Immediate Next Module: `error-handler.ts`

**Tasks**:
1. Extract `formatErrorResponse` from gemini-chat
2. Add foreign key error handling
3. Add error logging with Sentry integration
4. Write unit tests

**Reference Code**:
- `src/app/(chat)/api/gemini-chat/route.ts:76-109` (formatErrorResponse)
- `src/app/(chat)/api/gemini-chat/route.ts:352-436` (foreign key recovery)

### Future Modules

1. **`chat-management.ts`** - Chat/user lifecycle
2. **`stream-handler.ts`** - AI SDK v5 streaming patterns
3. **`index.ts`** - Public API exports

---

## Success Metrics

### Quantitative

- ✅ **Test Coverage**: 28/28 tests passing (100%)
- ✅ **Code Quality**: No TypeScript errors
- ✅ **Performance**: Tests run in 11ms
- ✅ **Type Safety**: Fully typed with proper interfaces

### Qualitative

- ✅ **Self-Documenting**: No comments needed, descriptive names
- ✅ **Helper-First**: All patterns extracted into helpers
- ✅ **Real Patterns**: Follows existing test conventions
- ✅ **Zod Schema-First**: Created schemas before implementation
- ✅ **TDD Process**: Tests written first, implementation second

---

## Issues Encountered

### None

Implementation went smoothly following TDD process:

1. ✅ Created Zod schemas (Step 0)
2. ✅ Wrote failing tests (confirmed they fail correctly)
3. ✅ Implemented functions to make tests pass
4. ✅ All tests green on first implementation attempt

---

## Recommendations

### For `error-handler.ts` (Next Module)

1. **Follow same TDD process**:
   - Create Zod schemas for error types
   - Write tests first (expect failures)
   - Implement to pass tests

2. **Test foreign key recovery**:
   - Mock `getOrCreateOAuthUser`
   - Test retry logic after user creation
   - Edge cases: double foreign key errors

3. **Test environment-specific behavior**:
   - Development: detailed errors with stack traces
   - Production: generic error messages
   - Use `isProductionEnvironment` constant

### For Future Refactoring

1. **Migrate routes incrementally**:
   - Start with `/api/chat/route.ts` (simpler)
   - Then `/api/gemini-chat/route.ts` (complex)
   - Keep feature flags for rollback

2. **Maintain backward compatibility**:
   - Old message format → new format conversion
   - Gradual migration of existing data

---

## Conclusion

Successfully completed Phase 1, Step 1.1 of the AI SDK v5 refactoring plan. The `message-utils.ts` module provides:

- ✅ **Type-safe** message normalization
- ✅ **UUID generation** for database storage
- ✅ **DB-to-UI conversion** (reusing existing code)
- ✅ **AI SDK v5 compatible** structure
- ✅ **Comprehensive test coverage** (28 tests)

**Ready for next step**: Create `error-handler.ts` module following same TDD approach.

---

**Test Command**:
```bash
pnpm exec vitest run src/tests/unit/lib/ai/chat/message-utils.test.ts
```

**Files Created**:
1. `src/lib/ai/chat/message-schemas.ts` - Zod validation schemas
2. `src/lib/ai/chat/message-utils.ts` - Implementation
3. `src/tests/unit/lib/ai/chat/message-utils.test.ts` - Tests (28 passing)
4. `_tasks/2025-10-15-ai-sdk-v5-refactoring/03-test-report-message-utils.md` - This report

**Lines of Code**:
- Tests: ~280 lines (helper-first, self-documenting)
- Implementation: ~85 lines (pure functions, type-safe)
- Schemas: ~25 lines (Zod validation)

**Test Execution Time**: 11ms

---

**Status**: ✅ COMPLETE - Ready for implementation engineer (@rob) to use in next phase
