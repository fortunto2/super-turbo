# Test Report: Error Handler Utility

**Date**: 2025-10-15
**Author**: Kent (TDD Test Engineer)
**Status**: ✅ All Tests Passing (41/41)

## Overview

Created comprehensive test suite for centralized error handling utility following TDD principles. The `error-handler.ts` module provides reusable error formatting, foreign key error detection, and context creation for AI SDK v5 chat routes.

## Test File Location

**Test Code**: `apps/super-chatbot/src/tests/unit/lib/ai/chat/error-handler.test.ts`
**Implementation**: `apps/super-chatbot/src/lib/ai/chat/error-handler.ts`

## Functions Tested

### 1. `formatErrorResponse(error: unknown, context?: string): Response`

Formats errors for API routes based on environment:
- **Development Mode**: Returns detailed JSON with error message, stack trace, and timestamp
- **Production Mode**: Returns generic text message to avoid leaking sensitive information

**Tests** (13 tests):
- ✅ Returns 500 status code
- ✅ Includes Content-Type header in development
- ✅ Includes error details in development mode
- ✅ Includes stack trace in development mode
- ✅ Uses default context when not provided ("API")
- ✅ Uses custom context when provided
- ✅ Returns generic message in production mode
- ✅ Does not include error details in production mode
- ✅ Handles unknown error types (non-Error objects)
- ✅ Handles null error
- ✅ Handles undefined error
- ✅ Formats timestamp as ISO string
- ✅ Handles very long error messages

### 2. `handleForeignKeyError(error: Error, entityType: ForeignKeyErrorType): boolean`

Detects foreign key constraint violations for specific entity types:
- **Chat**: `Chat_userId_User_id_fk`, `Key (userId)`
- **Message**: `Message_v2_chatId_Chat_id_fk`, `Key (chatId)`
- **Stream**: `Stream_chatId_Chat_id_fk`, `Key (chatId)`

**Tests** (10 tests):
- ✅ Detects Chat foreign key error
- ✅ Detects Message foreign key error
- ✅ Detects Stream foreign key error
- ✅ Detects foreign key error with Key syntax
- ✅ Returns false for non-foreign-key errors
- ✅ Returns false for wrong entity type
- ✅ Returns false for non-Error objects
- ✅ Handles error without message property
- ✅ Case-sensitive constraint name matching
- ✅ Handles multiple Key patterns in error message

### 3. `createErrorContext(context: string, metadata?: Record<string, any>): ErrorContext`

Creates formatted error context string for logging:
- Formats context with optional metadata
- Handles nested objects, arrays, null/undefined values
- Handles circular references gracefully

**Tests** (9 tests):
- ✅ Creates context with string
- ✅ Creates context with metadata
- ✅ Handles empty metadata object
- ✅ Formats nested metadata objects
- ✅ Handles metadata with null values
- ✅ Handles metadata with undefined values
- ✅ Handles metadata with arrays
- ✅ Handles metadata with numbers
- ✅ Creates readable context for logging

## Schema Validation

### Types Defined

```typescript
export type ErrorContext = string;
export type ForeignKeyErrorType = 'Chat' | 'Message' | 'Stream';

interface ForeignKeyConstraintMap {
  Chat: string[];
  Message: string[];
  Stream: string[];
}
```

**No Zod schemas required** - This utility uses TypeScript type definitions for simple type safety. Zod validation would be overkill for internal utility functions.

## Integration Scenarios (3 tests)

- ✅ Complete foreign key error recovery flow
- ✅ Formats different error types consistently
- ✅ Creates context for different entity types

## Edge Cases (4 tests)

- ✅ Handles circular references in metadata
- ✅ Handles very long error messages
- ✅ Handles special characters in context
- ✅ Handles Error subclasses (TypeError, RangeError)

## Type Safety (3 tests)

- ✅ Accepts all valid foreign key error types
- ✅ Creates ErrorContext with proper typing
- ✅ Returns Response type from formatErrorResponse

## Implementation Notes

### Key Patterns Followed

1. **Environment Detection**: Uses `process.env.NODE_ENV` directly instead of imported constant to support Vitest's `vi.stubEnv()`
2. **Helper-First TDD**: Created comprehensive test helpers before writing tests
3. **Self-Documenting Tests**: No comments needed - helper names tell the story
4. **Real Project Patterns**: Followed existing patterns from `message-utils.test.ts`

### Helper Functions

```typescript
function createStandardError(message: string): Error
function createForeignKeyError(constraintName: string, keyName?: string): Error
function createProductionEnvironment()
function createDevelopmentEnvironment()
async function parseJSONResponse(response: Response): Promise<any>
async function parseTextResponse(response: Response): Promise<string>
```

### Environment Mocking

Used Vitest's `vi.stubEnv()` to test different NODE_ENV values:
- `beforeEach`: Store original `process.env.NODE_ENV`
- `afterEach`: Restore original value and cleanup with `vi.unstubAllEnvs()`

## Test Execution

```bash
cd apps/super-chatbot
pnpm exec vitest --run src/tests/unit/lib/ai/chat/error-handler.test.ts
```

**Results**:
- ✅ 41 tests passed
- ❌ 0 tests failed
- ⏱️ Duration: ~1.4s

## Implementation Requirements

### Function Signatures

```typescript
export function formatErrorResponse(
  error: unknown,
  context: string = 'API',
): Response

export function handleForeignKeyError(
  error: Error,
  entityType: ForeignKeyErrorType,
): boolean

export function createErrorContext(
  context: string,
  metadata?: Record<string, any>,
): ErrorContext
```

### Constraint Mapping

```typescript
const FOREIGN_KEY_CONSTRAINTS: ForeignKeyConstraintMap = {
  Chat: ['Chat_userId_User_id_fk', 'Key (userId)'],
  Message: ['Message_v2_chatId_Chat_id_fk', 'Key (chatId)'],
  Stream: ['Stream_chatId_Chat_id_fk', 'Key (chatId)'],
};
```

### Error Response Format

**Development Mode**:
```json
{
  "error": "Error in [context]",
  "details": "[error message]\n\n[stack trace]",
  "timestamp": "2025-10-15T11:06:23.000Z"
}
```

**Production Mode**:
```
An error occurred while processing your request!
```

## Code Extraction from gemini-chat/route.ts

### Extracted Code Locations

1. **formatErrorResponse**: Lines 76-109 in original file
2. **Foreign Key Error Logic**: Lines 351-435 in original file

### Improvements Made

1. ✅ **Centralized**: Single utility instead of duplicated code
2. ✅ **Type-Safe**: Proper TypeScript types with ForeignKeyErrorType enum
3. ✅ **Extensible**: Easy to add new entity types to constraint map
4. ✅ **Testable**: Pure functions with no side effects (except logging)
5. ✅ **Documented**: Clear TSDoc comments for all functions

## Usage Examples

### Basic Error Formatting

```typescript
import { formatErrorResponse } from '@/lib/ai/chat/error-handler';

try {
  // ... some operation
} catch (error) {
  return formatErrorResponse(error, 'Chat API');
}
```

### Foreign Key Error Detection

```typescript
import { handleForeignKeyError } from '@/lib/ai/chat/error-handler';

try {
  await saveChat({ id, userId, title });
} catch (error) {
  if (handleForeignKeyError(error as Error, 'Chat')) {
    // Attempt user creation and retry
    await getOrCreateOAuthUser(userId, email);
    await saveChat({ id, userId, title });
  } else {
    throw error;
  }
}
```

### Error Context Creation

```typescript
import { createErrorContext } from '@/lib/ai/chat/error-handler';

const context = createErrorContext('Message Save', {
  chatId: 'chat-123',
  userId: 'user-456',
  messageId: 'msg-789',
});

console.log(context);
// [Message Save] {
//   "chatId": "chat-123",
//   "userId": "user-456",
//   "messageId": "msg-789"
// }
```

## Next Steps

1. ✅ **Tests Created**: Comprehensive test suite with 41 tests
2. ✅ **Implementation Complete**: All tests passing
3. 🔄 **Refactor gemini-chat/route.ts**: Replace inline error handling with utility functions
4. 🔄 **Update other chat routes**: Apply same pattern to anthropic-chat, deepseek-chat, etc.
5. 🔄 **Add to documentation**: Update `_ai/error-handling.md` with patterns

## Success Criteria

- ✅ All tests pass (41/41)
- ✅ Functions follow existing project patterns
- ✅ Self-documenting code (no redundant comments)
- ✅ Environment-aware error responses
- ✅ Type-safe foreign key detection
- ✅ Handles all edge cases (circular refs, null, undefined, Error subclasses)

## Files Modified

1. **Created**: `apps/super-chatbot/src/lib/ai/chat/error-handler.ts`
2. **Created**: `apps/super-chatbot/src/tests/unit/lib/ai/chat/error-handler.test.ts`
3. **Created**: `_tasks/2025-10-15-ai-sdk-v5-refactoring/04-test-report-error-handler.md`

---

**TDD Methodology Followed**:
1. ✅ Research existing patterns
2. ✅ Create helper functions first
3. ✅ Write comprehensive tests
4. ✅ Run tests (expected failures)
5. ✅ Implement utility functions
6. ✅ Run tests again (all pass)
7. ✅ Document implementation
