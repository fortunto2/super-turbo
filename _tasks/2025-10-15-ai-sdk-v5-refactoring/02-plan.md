# AI SDK v5 Refactoring Plan

**Created**: 2025-10-15
**Author**: @don (Guillermo)
**Status**: Planning Phase

## Executive Summary

This plan refactors our AI chat implementation to properly use AI SDK v5, eliminating 1000+ lines of duplicated code and fixing 35+ TypeScript errors. We'll centralize AI logic into shared utilities while preserving the working features of both `/api/chat` and `/api/gemini-chat`.

**The Vercel Way**: Make the right thing easy. AI SDK v5 provides better patterns - we just need to use them correctly.

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Root Cause Analysis](#root-cause-analysis)
3. [Proposed Architecture](#proposed-architecture)
4. [Implementation Plan](#implementation-plan)
5. [Migration Strategy](#migration-strategy)
6. [Testing Strategy](#testing-strategy)
7. [Success Criteria](#success-criteria)

---

## Current State Analysis

### File Inventory

#### API Routes
1. **`src/app/(chat)/api/chat/route.ts`** (247 lines)
   - ✅ Uses `toUIMessageStreamResponse()` (correct v5 pattern)
   - ✅ Simple, clean implementation
   - ❌ Duplicates `normalizeMessage` function
   - ❌ Duplicates chat/user creation logic
   - ❌ No error handling utilities

2. **`src/app/(chat)/api/gemini-chat/route.ts`** (1,152 lines)
   - ❌ Uses deprecated `createDataStream` (v4 API)
   - ❌ Uses deprecated `appendResponseMessages` (v4 API)
   - ❌ Uses deprecated `mergeIntoDataStream` (v4 API)
   - ❌ Duplicates `normalizeMessage` function
   - ❌ Duplicates error formatting
   - ❌ Complex manual stream management
   - ❌ 900+ lines of chat/user creation/recovery logic
   - ✅ Has image/video context analysis
   - ✅ Has resumable streams support

3. **`src/app/(chat)/api/test-chat/route.ts`** (56 lines)
   - ✅ Clean v5 pattern with `toTextStreamResponse()`
   - ✅ Simple validation with Zod
   - 🔍 Good reference for minimal implementation

#### Supporting Files
- **`src/lib/types/message-conversion.ts`** (139 lines)
  - ✅ Converts DB messages to UI messages
  - ✅ Type-safe conversions
  - ✅ Already working well

- **`src/components/chat/chat.tsx`** (464 lines)
  - ✅ Uses `useChat` hook correctly
  - ✅ Manual input management (v5 pattern)
  - ✅ Uses `sendMessage()` (v5 API)
  - ✅ Uses `regenerate()` instead of `reload()` (v5 API)

### TypeScript Errors Breakdown

**Total: 35 errors**

#### Category 1: Deprecated AI SDK v4 APIs (12 errors)
```
✗ 'createDataStream' not exported from 'ai'
✗ 'appendResponseMessages' not exported from 'ai'
✗ 'mergeIntoDataStream' does not exist
✗ 'Attachment' type not exported from 'ai'
✗ 'maxSteps' does not exist in streamText options
✗ 'dataStream' does not exist in tool props
✗ useChat properties removed: input, setInput, handleInputChange, handleSubmit, isLoading, reload
```

**Fix**: Replace with v5 equivalents:
- `createDataStream` → `toUIMessageStreamResponse()`
- `appendResponseMessages` → removed (not needed in v5)
- `mergeIntoDataStream` → removed (v5 handles this automatically)
- `Attachment` → use inline type definition
- `maxSteps` → removed (v5 uses different options)
- Tool props no longer get `dataStream` - return values instead

#### Category 2: Message Type Issues (15 errors)
```
✗ Property 'id' does not exist on AssistantModelMessage
✗ Property 'content' does not exist on UIMessage (v5 uses parts)
✗ Property 'parts' does not exist on Message
```

**Fix**: Use proper v5 types:
- Assistant messages always have `id` in v5
- UIMessage uses `parts` not `content`
- Use type guards and proper conversions

#### Category 3: Type Safety (8 errors)
```
✗ Parameter 'dataStream' implicitly has an 'any' type
✗ Parameter 'part' implicitly has an 'any' type
✗ Type 'string | undefined' is not assignable to type 'string'
```

**Fix**: Add proper types, make fields optional where needed

### Code Duplication Analysis

**Duplicated across routes:**

1. **`normalizeMessage` function** - 2 implementations
   ```typescript
   // In chat/route.ts
   function normalizeMessage(message: any) {
     return {
       ...message,
       content: message.content || message.parts?.[0]?.text || "",
       parts: message.parts || [{ type: "text", text: message.content || "" }],
     };
   }

   // In gemini-chat/route.ts (slightly different)
   function normalizeMessage(message: any) {
     return {
       ...message,
       content: message.content || message.parts?.[0]?.text || "",
       parts: message.parts?.map(...) || [],
     };
   }
   ```

2. **Error formatting** - 2 implementations
   ```typescript
   // gemini-chat/route.ts has formatErrorResponse()
   // chat/route.ts has inline error handling
   ```

3. **Chat/User creation logic** - duplicated extensively
   - Creating chat if doesn't exist
   - Ensuring user exists with `getOrCreateOAuthUser`
   - Title generation from user message
   - Foreign key constraint recovery

4. **Message saving logic** - similar patterns
   - Save user messages
   - Save assistant messages in onFinish
   - Generate proper UUIDs

**Total duplicated code: ~800 lines**

---

## Root Cause Analysis

### Why We Have This Problem

1. **Incomplete Migration**: Started migrating to AI SDK v5 but left v4 code in gemini-chat
2. **No Shared Utilities**: Each route implements everything from scratch
3. **Copy-Paste Development**: gemini-chat copied from old patterns, chat route copied from docs
4. **Lack of Abstraction**: No separation between:
   - Chat business logic
   - Stream handling
   - Error handling
   - Database operations

### What Success Looks Like

**Deploy is the new build**: Ship working code fast, iterate based on data.

- ✅ Single source of truth for AI operations
- ✅ API routes are thin controllers (50-100 lines each)
- ✅ Shared utilities handle common patterns
- ✅ Type-safe throughout
- ✅ Easy to add new chat endpoints
- ✅ Clear separation of concerns

---

## Proposed Architecture

### Directory Structure

```
src/
├── lib/
│   ├── ai/
│   │   ├── chat/                           # NEW: Chat utilities
│   │   │   ├── message-utils.ts           # Message normalization, UUID generation
│   │   │   ├── chat-management.ts         # Chat/user creation, recovery
│   │   │   ├── stream-handler.ts          # v5 streaming patterns
│   │   │   ├── error-handler.ts           # Error formatting, logging
│   │   │   └── index.ts                   # Public API
│   │   ├── context/                       # Existing: Context analyzers
│   │   │   ├── image-context-analyzer.ts
│   │   │   └── video-context-analyzer.ts
│   │   ├── tools/                         # Existing: AI SDK tools
│   │   │   ├── create-document.ts
│   │   │   ├── configure-image-generation.ts
│   │   │   └── ...
│   │   ├── providers.ts                   # Existing: Model providers
│   │   └── prompts.ts                     # Existing: System prompts
│   ├── types/
│   │   └── message-conversion.ts          # Existing: Works well
│   └── db/
│       └── queries.ts                     # Existing: DB operations
├── app/
│   └── (chat)/
│       └── api/
│           ├── chat/
│           │   └── route.ts               # REFACTOR: Use shared utilities
│           ├── gemini-chat/
│           │   └── route.ts               # REFACTOR: Use shared utilities
│           └── test-chat/
│               └── route.ts               # KEEP: Already clean
```

### Module Responsibilities

#### 1. `src/lib/ai/chat/message-utils.ts`

**Purpose**: Message normalization and transformation

**Exports**:
```typescript
/**
 * Normalize message for AI SDK v5 compatibility
 * Ensures proper parts structure for both user and assistant messages
 */
export function normalizeMessage(message: any): NormalizedMessage;

/**
 * Generate proper UUID for messages
 * AI SDK v5 generates short IDs - we need full UUIDs for DB
 */
export function ensureMessageId(message: any): string;

/**
 * Prepare messages for streamText
 * Converts DB messages + new messages to proper format
 */
export function prepareMessagesForStream(
  dbMessages: any[],
  newMessages: any[]
): UIMessage[];
```

**Pattern to follow**: `src/lib/types/message-conversion.ts`
- Type-safe conversions
- Handle edge cases (missing fields, wrong types)
- Clear function names

#### 2. `src/lib/ai/chat/chat-management.ts`

**Purpose**: Chat and user lifecycle management

**Exports**:
```typescript
/**
 * Ensure chat exists, create if needed
 * Handles user creation, title generation, foreign key recovery
 */
export async function ensureChatExists(params: {
  chatId: string;
  userId: string;
  userEmail?: string;
  firstMessage?: any;
  visibility?: VisibilityType;
}): Promise<{ chat: Chat; created: boolean }>;

/**
 * Save user message to database
 * Handles chat creation if needed, proper UUID generation
 */
export async function saveUserMessage(params: {
  chatId: string;
  userId: string;
  message: any;
  visibility?: VisibilityType;
}): Promise<void>;

/**
 * Save assistant messages from streamText response
 * For use in onFinish callback
 */
export async function saveAssistantMessages(params: {
  chatId: string;
  responseMessages: any[];
}): Promise<void>;
```

**Pattern to follow**: Current implementation in `gemini-chat/route.ts:320-500`
- Extract the working logic
- Add proper error handling
- Return useful information

#### 3. `src/lib/ai/chat/stream-handler.ts`

**Purpose**: AI SDK v5 streaming patterns

**Exports**:
```typescript
/**
 * Create standard streaming response using v5 pattern
 * Handles tool configuration, context analysis, and streaming
 */
export async function createChatStream(params: {
  session: Session;
  messages: UIMessage[];
  chatId: string;
  model: string;
  systemPrompt: string;
  tools: Record<string, Tool>;
  onFinish?: (response: any) => Promise<void>;
  onError?: (error: Error) => void;
  enableContextAnalysis?: boolean;
}): Promise<Response>;

/**
 * Analyze image/video context before streaming
 * Returns URLs for defaultSourceImageUrl/defaultSourceVideoUrl
 */
export async function analyzeMediaContext(params: {
  message: any;
  chatId: string;
  userId: string;
}): Promise<{
  defaultSourceImageUrl?: string;
  defaultSourceVideoUrl?: string;
}>;

/**
 * Configure tools for chat stream
 * Creates properly configured tool instances
 */
export function configureChatTools(params: {
  session: Session;
  chatId: string;
  userMessage: any;
  defaultSourceImageUrl?: string;
  defaultSourceVideoUrl?: string;
}): Record<string, Tool>;
```

**Pattern to follow**:
- `/api/chat/route.ts:192-236` for simple v5 pattern
- `/api/gemini-chat/route.ts:810-960` for tool configuration
- Use `streamText().toUIMessageStreamResponse()` (v5 recommended pattern)

#### 4. `src/lib/ai/chat/error-handler.ts`

**Purpose**: Consistent error handling and formatting

**Exports**:
```typescript
/**
 * Format error response based on environment
 * Development: detailed error with stack trace
 * Production: generic error message
 */
export function formatErrorResponse(
  error: unknown,
  context?: string
): Response;

/**
 * Handle foreign key constraint errors
 * Attempts to recover by creating missing entities
 */
export async function handleForeignKeyError(
  error: Error,
  params: {
    chatId: string;
    userId: string;
    userEmail?: string;
  }
): Promise<boolean>; // true if recovered

/**
 * Log error with context to monitoring
 * Integrates with Sentry if configured
 */
export function logError(
  error: unknown,
  context: string,
  metadata?: Record<string, any>
): void;
```

**Pattern to follow**: `gemini-chat/route.ts:76-109` for error formatting
- Check `isProductionEnvironment`
- Return detailed errors in dev
- Return generic errors in prod
- Integrate with existing monitoring

---

## Implementation Plan

### Phase 1: Foundation (Create Shared Utilities)

**Goal**: Extract and centralize common patterns without breaking existing routes.

#### Step 1.1: Create `message-utils.ts`

**Files to create**:
- `src/lib/ai/chat/message-utils.ts`

**Tasks**:
1. Extract `normalizeMessage` from both routes
2. Combine best parts of both implementations
3. Add proper TypeScript types
4. Create `ensureMessageId` function
5. Create `prepareMessagesForStream` function
6. Write unit tests

**Reference code**:
- `src/app/(chat)/api/chat/route.ts:28-34` (normalizeMessage)
- `src/app/(chat)/api/gemini-chat/route.ts:58-68` (normalizeMessage with parts mapping)
- `src/lib/types/message-conversion.ts` (type conversion patterns)

**Implementation**:
```typescript
// src/lib/ai/chat/message-utils.ts
import type { UIMessage } from 'ai';
import { generateUUID } from '@/lib/utils';

export interface NormalizedMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  parts: Array<{ type: string; text: string; [key: string]: any }>;
  experimental_attachments?: any[];
  createdAt: Date;
}

/**
 * Normalize message for AI SDK v5 compatibility
 * Combines content and parts, ensures proper structure
 */
export function normalizeMessage(message: any): NormalizedMessage {
  // Ensure we have an ID
  const id = message.id || generateUUID();

  // Extract content from either content field or parts
  const content = message.content || message.parts?.[0]?.text || '';

  // Ensure parts array exists and is properly formatted
  const parts = message.parts?.map((part: any) => ({
    ...part,
    text: part.text || '',
  })) || [{ type: 'text', text: content }];

  return {
    ...message,
    id,
    content,
    parts,
    createdAt: message.createdAt || new Date(),
  };
}

/**
 * Generate proper UUID for message
 * AI SDK v5 generates short IDs - we need full UUIDs for DB
 */
export function ensureMessageId(message: any): string {
  if (message.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(message.id)) {
    return message.id; // Already a proper UUID
  }
  return generateUUID();
}

/**
 * Prepare messages for streamText
 * Converts DB messages + new messages to proper format
 */
export function prepareMessagesForStream(
  dbMessages: any[],
  newMessages: any[]
): UIMessage[] {
  const { convertDBMessagesToUIMessages } = require('@/lib/types/message-conversion');

  const previousMessages = convertDBMessagesToUIMessages(dbMessages);
  const normalizedNewMessages = newMessages.map(normalizeMessage);

  return [...previousMessages, ...normalizedNewMessages];
}
```

**Tests to write**:
```typescript
// src/tests/unit/ai/chat/message-utils.test.ts
describe('normalizeMessage', () => {
  it('should normalize message with content field');
  it('should normalize message with parts field');
  it('should generate UUID if missing');
  it('should preserve existing UUID');
  it('should handle missing fields gracefully');
});

describe('ensureMessageId', () => {
  it('should keep valid UUID');
  it('should generate new UUID for short ID');
  it('should generate UUID when missing');
});

describe('prepareMessagesForStream', () => {
  it('should combine DB and new messages');
  it('should normalize all messages');
  it('should preserve message order');
});
```

#### Step 1.2: Create `error-handler.ts`

**Files to create**:
- `src/lib/ai/chat/error-handler.ts`

**Tasks**:
1. Extract `formatErrorResponse` from gemini-chat
2. Add foreign key error handling
3. Add error logging with Sentry integration
4. Write unit tests

**Reference code**:
- `src/app/(chat)/api/gemini-chat/route.ts:76-109` (formatErrorResponse)
- `src/app/(chat)/api/gemini-chat/route.ts:352-436` (foreign key recovery)

**Implementation**:
```typescript
// src/lib/ai/chat/error-handler.ts
import { isProductionEnvironment } from '@/lib/constants';
import { getOrCreateOAuthUser } from '@/lib/db/queries';

/**
 * Format error response based on environment
 */
export function formatErrorResponse(
  error: unknown,
  context = 'API'
): Response {
  console.error(`Error in ${context}:`, error);

  if (!isProductionEnvironment) {
    const errorMessage = error instanceof Error
      ? `${error.message}\n\n${error.stack}`
      : 'Unknown error';

    return new Response(
      JSON.stringify({
        error: `Error in ${context}`,
        details: errorMessage,
        timestamp: new Date().toISOString(),
      }, null, 2),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  return new Response(
    'An error occurred while processing your request!',
    { status: 500 }
  );
}

/**
 * Check if error is a foreign key constraint error
 */
export function isForeignKeyError(error: Error): boolean {
  return (
    error.message.includes('foreign key constraint') &&
    (error.message.includes('_userId_') ||
     error.message.includes('_chatId_') ||
     error.message.includes('Key (userId)') ||
     error.message.includes('Key (chatId)'))
  );
}

/**
 * Handle foreign key constraint error by creating missing entities
 */
export async function handleForeignKeyError(
  error: Error,
  params: {
    chatId: string;
    userId: string;
    userEmail?: string;
  }
): Promise<boolean> {
  if (!isForeignKeyError(error)) {
    return false;
  }

  try {
    const email = params.userEmail || `user-${params.userId}@example.com`;
    await getOrCreateOAuthUser(params.userId, email);
    console.log(`✅ Auto-created user: ${params.userId}`);
    return true;
  } catch (recoveryError) {
    console.error('❌ Failed to auto-create user:', recoveryError);
    return false;
  }
}

/**
 * Log error with context to monitoring
 */
export function logError(
  error: unknown,
  context: string,
  metadata?: Record<string, any>
): void {
  console.error(`[${context}]`, error, metadata);

  // TODO: Integrate with Sentry when enabled
  // if (Sentry.isEnabled()) {
  //   Sentry.captureException(error, { tags: { context }, extra: metadata });
  // }
}
```

#### Step 1.3: Create `chat-management.ts`

**Files to create**:
- `src/lib/ai/chat/chat-management.ts`

**Tasks**:
1. Extract chat creation/recovery logic
2. Extract user creation logic
3. Extract message saving logic
4. Add proper error handling
5. Write integration tests

**Reference code**:
- `src/app/(chat)/api/chat/route.ts:94-138` (chat creation)
- `src/app/(chat)/api/gemini-chat/route.ts:320-500` (comprehensive recovery)

**Implementation**:
```typescript
// src/lib/ai/chat/chat-management.ts
import {
  getChatById,
  saveChat,
  saveMessages,
  getOrCreateOAuthUser,
  getUser,
} from '@/lib/db/queries';
import { generateTitleFromUserMessage } from '@/app/(chat)/actions';
import type { VisibilityType } from '@/components/shared/visibility-selector';
import type { Session } from 'next-auth';
import { normalizeMessage, ensureMessageId } from './message-utils';
import { handleForeignKeyError, logError } from './error-handler';

/**
 * Ensure chat exists, create if needed
 */
export async function ensureChatExists(params: {
  chatId: string;
  userId: string;
  userEmail?: string;
  firstMessage?: any;
  visibility?: VisibilityType;
}): Promise<{ chat: any; created: boolean }> {
  const { chatId, userId, userEmail, firstMessage, visibility = 'private' } = params;

  // Check if chat exists
  let chat = await getChatById({ id: chatId });

  if (chat) {
    return { chat, created: false };
  }

  // Chat doesn't exist, create it
  try {
    // Ensure user exists
    if (userEmail) {
      await getOrCreateOAuthUser(userId, userEmail);
    }

    // Generate title from first message
    const title = firstMessage
      ? await generateTitleFromUserMessage({ message: normalizeMessage(firstMessage) })
      : 'New Chat';

    // Create chat
    await saveChat({
      id: chatId,
      userId,
      title,
      visibility,
    });

    chat = await getChatById({ id: chatId });

    if (!chat) {
      throw new Error('Failed to create chat');
    }

    return { chat, created: true };
  } catch (error) {
    // Try to recover from foreign key errors
    if (error instanceof Error && await handleForeignKeyError(error, { chatId, userId, userEmail })) {
      // Retry chat creation after user creation
      const title = firstMessage
        ? await generateTitleFromUserMessage({ message: normalizeMessage(firstMessage) })
        : 'New Chat';

      await saveChat({
        id: chatId,
        userId,
        title,
        visibility,
      });

      chat = await getChatById({ id: chatId });

      if (!chat) {
        throw new Error('Failed to create chat after recovery');
      }

      return { chat, created: true };
    }

    logError(error, 'ensureChatExists', { chatId, userId });
    throw error;
  }
}

/**
 * Save user message to database
 */
export async function saveUserMessage(params: {
  chatId: string;
  userId: string;
  userEmail?: string;
  message: any;
  visibility?: VisibilityType;
}): Promise<void> {
  const { chatId, userId, userEmail, message, visibility } = params;

  try {
    await saveMessages({
      messages: [{
        chatId,
        id: ensureMessageId(message),
        role: 'user',
        parts: message.parts || [{ type: 'text', text: message.content }],
        attachments: message.experimental_attachments ?? [],
        createdAt: message.createdAt || new Date(),
      }],
    });
  } catch (error) {
    // Try to recover by ensuring chat exists
    if (error instanceof Error && await handleForeignKeyError(error, { chatId, userId, userEmail })) {
      await ensureChatExists({
        chatId,
        userId,
        userEmail,
        firstMessage: message,
        visibility,
      });

      // Retry saving message
      await saveMessages({
        messages: [{
          chatId,
          id: ensureMessageId(message),
          role: 'user',
          parts: message.parts || [{ type: 'text', text: message.content }],
          attachments: message.experimental_attachments ?? [],
          createdAt: message.createdAt || new Date(),
        }],
      });
    } else {
      logError(error, 'saveUserMessage', { chatId, userId });
      // Don't throw - allow stream to continue even if save fails
    }
  }
}

/**
 * Save assistant messages from streamText response
 */
export async function saveAssistantMessages(params: {
  chatId: string;
  responseMessages: any[];
}): Promise<void> {
  const { chatId, responseMessages } = params;

  try {
    const assistantMessages = responseMessages.filter(
      (msg) => msg.role === 'assistant'
    );

    if (assistantMessages.length === 0) {
      return;
    }

    await saveMessages({
      messages: assistantMessages.map((msg) => ({
        chatId,
        id: ensureMessageId(msg),
        role: msg.role,
        parts: msg.parts || [{ type: 'text', text: msg.content }],
        attachments: msg.experimental_attachments ?? [],
        createdAt: new Date(),
      })),
    });
  } catch (error) {
    logError(error, 'saveAssistantMessages', { chatId });
    // Don't throw - this is called in onFinish callback
  }
}
```

#### Step 1.4: Create `stream-handler.ts`

**Files to create**:
- `src/lib/ai/chat/stream-handler.ts`

**Tasks**:
1. Extract media context analysis
2. Create tool configuration function
3. Create main streaming function using v5 pattern
4. Write integration tests

**Reference code**:
- `src/app/(chat)/api/chat/route.ts:192-236` (simple v5 streaming)
- `src/app/(chat)/api/gemini-chat/route.ts:644-716` (context analysis)
- `src/app/(chat)/api/gemini-chat/route.ts:718-860` (tool configuration)

**Implementation**:
```typescript
// src/lib/ai/chat/stream-handler.ts
import { streamText, type Tool } from 'ai';
import type { Session } from 'next-auth';
import type { UIMessage } from 'ai';
import { myProvider } from '@/lib/ai/providers';
import { createDocument } from '@/lib/ai/tools/create-document';
import { updateDocument } from '@/lib/ai/tools/update-document';
import { requestSuggestions } from '@/lib/ai/tools/request-suggestions';
import { configureImageGeneration } from '@/lib/ai/tools/configure-image-generation';
import { configureVideoGeneration } from '@/lib/ai/tools/configure-video-generation';
import { configureScriptGeneration } from '@/lib/ai/tools/configure-script-generation';
import { saveAssistantMessages } from './chat-management';
import { logError } from './error-handler';

/**
 * Analyze image/video context before streaming
 */
export async function analyzeMediaContext(params: {
  message: any;
  chatId: string;
  userId: string;
}): Promise<{
  defaultSourceImageUrl?: string;
  defaultSourceVideoUrl?: string;
}> {
  const { message, chatId, userId } = params;
  const result: {
    defaultSourceImageUrl?: string;
    defaultSourceVideoUrl?: string;
  } = {};

  // Analyze image context
  try {
    const { analyzeImageContext } = await import('@/lib/ai/context');
    const imageContext = await analyzeImageContext(
      message.parts?.[0]?.text || '',
      chatId,
      message.experimental_attachments,
      userId
    );

    if (imageContext.sourceUrl) {
      result.defaultSourceImageUrl = imageContext.sourceUrl;
      console.log('🔍 Image context found:', imageContext.sourceUrl);
    }
  } catch (error) {
    console.error('🔍 Image context analysis error:', error);
  }

  // Analyze video context
  try {
    const { analyzeVideoContext } = await import('@/lib/ai/context');
    const videoContext = await analyzeVideoContext(
      message.parts?.[0]?.text || '',
      chatId,
      message.experimental_attachments,
      userId
    );

    if (videoContext.sourceUrl) {
      result.defaultSourceVideoUrl = videoContext.sourceUrl;
      console.log('🔍 Video context found:', videoContext.sourceUrl);
    }
  } catch (error) {
    console.error('🔍 Video context analysis error:', error);
  }

  return result;
}

/**
 * Configure tools for chat stream
 */
export function configureChatTools(params: {
  session: Session;
  chatId: string;
  userMessage: any;
  defaultSourceImageUrl?: string;
  defaultSourceVideoUrl?: string;
}): Record<string, Tool> {
  const { session, chatId, userMessage, defaultSourceImageUrl, defaultSourceVideoUrl } = params;

  // Create base document tools
  const createDocumentTool = createDocument({ session });
  const updateDocumentTool = updateDocument({ session });
  const suggestionsTool = requestSuggestions({ session });

  // Create media generation tools with context
  const imageGenerationTool = configureImageGeneration({
    createDocument: createDocumentTool,
    session,
    chatId,
    userMessage: userMessage.content || '',
    currentAttachments: userMessage.experimental_attachments || [],
    defaultSourceImageUrl: defaultSourceImageUrl || '',
  });

  const videoGenerationTool = configureVideoGeneration({
    createDocument: createDocumentTool,
    session,
    chatId,
    userMessage: userMessage.content || '',
    currentAttachments: userMessage.experimental_attachments || [],
    defaultSourceImageUrl: defaultSourceImageUrl || '',
    defaultSourceVideoUrl: defaultSourceVideoUrl || '',
  });

  const scriptGenerationTool = configureScriptGeneration({
    createDocument: createDocumentTool,
    session,
  });

  return {
    createDocument: createDocumentTool,
    updateDocument: updateDocumentTool,
    requestSuggestions: suggestionsTool,
    configureImageGeneration: imageGenerationTool,
    configureVideoGeneration: videoGenerationTool,
    configureScriptGeneration: scriptGenerationTool,
  };
}

/**
 * Create standard streaming response using AI SDK v5 pattern
 */
export async function createChatStream(params: {
  session: Session;
  messages: UIMessage[];
  chatId: string;
  model: string;
  systemPrompt: string;
  tools?: Record<string, Tool>;
  onFinish?: (response: any) => Promise<void>;
  onError?: (error: Error) => void;
  enableContextAnalysis?: boolean;
}): Promise<Response> {
  const {
    session,
    messages,
    chatId,
    model,
    systemPrompt,
    tools,
    onFinish,
    onError,
    enableContextAnalysis = false,
  } = params;

  // Analyze media context if enabled
  let contextUrls = {};
  if (enableContextAnalysis && messages.length > 0) {
    const lastMessage = messages[messages.length - 1];
    contextUrls = await analyzeMediaContext({
      message: lastMessage,
      chatId,
      userId: session.user.id,
    });
  }

  // Configure tools
  const configuredTools = tools || configureChatTools({
    session,
    chatId,
    userMessage: messages[messages.length - 1],
    ...contextUrls,
  });

  // Create stream with v5 API
  const result = streamText({
    model: myProvider.languageModel(model),
    system: systemPrompt,
    messages,
    temperature: 0.7,
    tools: configuredTools,
    onFinish: async ({ response }) => {
      // Save assistant messages
      await saveAssistantMessages({
        chatId,
        responseMessages: response.messages,
      });

      // Call custom onFinish if provided
      if (onFinish) {
        await onFinish(response);
      }
    },
    onError: (error) => {
      logError(error, 'streamText', { chatId, model });

      if (onError) {
        onError(error);
      }
    },
  });

  // AI SDK v5: Use recommended response method
  return result.toUIMessageStreamResponse();
}
```

#### Step 1.5: Create index file

**Files to create**:
- `src/lib/ai/chat/index.ts`

**Tasks**:
1. Export all utilities
2. Create convenience functions

**Implementation**:
```typescript
// src/lib/ai/chat/index.ts
export * from './message-utils';
export * from './chat-management';
export * from './stream-handler';
export * from './error-handler';

// Re-export for convenience
export {
  normalizeMessage,
  ensureMessageId,
  prepareMessagesForStream,
} from './message-utils';

export {
  ensureChatExists,
  saveUserMessage,
  saveAssistantMessages,
} from './chat-management';

export {
  createChatStream,
  analyzeMediaContext,
  configureChatTools,
} from './stream-handler';

export {
  formatErrorResponse,
  handleForeignKeyError,
  logError,
} from './error-handler';
```

### Phase 2: Refactor API Routes

**Goal**: Update both chat routes to use shared utilities, eliminating duplication.

#### Step 2.1: Refactor `/api/chat/route.ts`

**Files to modify**:
- `src/app/(chat)/api/chat/route.ts`

**Current**: 247 lines
**Target**: ~100 lines

**Changes**:
1. Remove `normalizeMessage` function - use from utilities
2. Remove chat creation logic - use `ensureChatExists`
3. Remove message saving logic - use `saveUserMessage`
4. Simplify streaming - use `createChatStream`
5. Update imports

**Before → After**:
```typescript
// BEFORE (247 lines with duplication)
function normalizeMessage(message: any) { ... }

export const POST = async (request: Request) => {
  // ... auth check ...

  // Manual chat creation (50 lines)
  let chat = await getChatById({ id: chatId });
  if (!chat) {
    // Ensure user exists
    if (session.user.email) {
      await getOrCreateOAuthUser(session.user.id, session.user.email);
    }
    // Generate title
    const title = await generateTitleFromUserMessage({ ... });
    // Create chat
    await saveChat({ ... });
    chat = await getChatById({ id: chatId });
  }

  // Manual message handling (30 lines)
  const previousMessages = await getMessagesByChatId({ id: chatId });
  const allMessages = [
    ...convertDBMessagesToUIMessages(previousMessages),
    ...rawMessages.map(normalizeMessage),
  ];

  // Save user messages (20 lines)
  const userMessages = rawMessages.filter((msg: any) => msg.role === "user");
  if (userMessages.length > 0) {
    await saveMessages({ ... });
  }

  // Configure tools manually (50 lines)
  const createDocumentTool = createDocument({ session });
  const imageGenerationTool = configureImageGeneration({ ... });
  // ... more tools ...

  // Stream setup (40 lines)
  const result = streamText({
    model: myProvider.languageModel(chatModel),
    system: systemPrompt({ ... }),
    messages: allMessages,
    temperature: 0.7,
    tools: { ... },
    onFinish: async ({ response }) => {
      // Save assistant messages (20 lines)
      const assistantMessages = response.messages.filter(...);
      if (assistantMessages.length > 0) {
        await saveMessages({ ... });
      }
    },
    onError: (error) => {
      console.error("Stream error:", error);
    },
  });

  return result.toUIMessageStreamResponse();
};

// AFTER (~100 lines, using utilities)
import {
  ensureChatExists,
  saveUserMessage,
  prepareMessagesForStream,
  createChatStream,
  formatErrorResponse,
} from '@/lib/ai/chat';

export const POST = async (request: Request) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = postRequestBodySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request format", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { messages: rawMessages, id: chatId, selectedChatModel, selectedVisibilityType } = validationResult.data;

    // Ensure chat exists (1 line instead of 50!)
    await ensureChatExists({
      chatId,
      userId: session.user.id,
      userEmail: session.user.email,
      firstMessage: rawMessages[0],
      visibility: selectedVisibilityType,
    });

    // Save user messages (1 line instead of 20!)
    for (const message of rawMessages.filter((m: any) => m.role === 'user')) {
      await saveUserMessage({
        chatId,
        userId: session.user.id,
        userEmail: session.user.email,
        message,
        visibility: selectedVisibilityType,
      });
    }

    // Prepare messages (1 line instead of 10!)
    const previousMessages = await getMessagesByChatId({ id: chatId });
    const allMessages = prepareMessagesForStream(previousMessages, rawMessages);

    // Create stream with all tools configured (1 function call instead of 100 lines!)
    return await createChatStream({
      session,
      messages: allMessages,
      chatId,
      model: selectedChatModel || 'chat-model',
      systemPrompt: systemPrompt({
        selectedChatModel: selectedChatModel || 'chat-model',
        requestHints: { latitude: '0', longitude: '0', city: '', country: '' },
      }),
      enableContextAnalysis: false, // Simple chat doesn't need context
    });
  } catch (error) {
    return formatErrorResponse(error, 'POST /api/chat');
  }
};
```

**Reduction: 247 lines → ~100 lines (60% less code)**

#### Step 2.2: Refactor `/api/gemini-chat/route.ts`

**Files to modify**:
- `src/app/(chat)/api/gemini-chat/route.ts`

**Current**: 1,152 lines
**Target**: ~150 lines

**Changes**:
1. Remove `normalizeMessage` function
2. Remove `formatErrorResponse` function
3. Remove all chat/user creation logic
4. Remove manual message saving logic
5. Remove context analysis code (move to utilities)
6. Remove tool configuration code
7. Remove deprecated v4 APIs:
   - ❌ `createDataStream`
   - ❌ `appendResponseMessages`
   - ❌ `mergeIntoDataStream`
   - ✅ Use `createChatStream` utility

**Key differences from simple chat**:
- Enable context analysis for image/video
- Use Gemini model
- Custom system prompt
- Keep resumable streams support (optional)

**Before → After**:
```typescript
// BEFORE (1,152 lines of complex code)
import {
  appendResponseMessages,  // ❌ Deprecated v4 API
  createDataStream,         // ❌ Deprecated v4 API
  smoothStream,
  streamText,
} from "ai";

function normalizeMessage(message: any) { ... }
function formatErrorResponse(error: unknown, context = "API") { ... }
function getStreamContext() { ... }

export async function POST(request: Request) {
  // ... 200 lines of chat/user creation/recovery ...
  // ... 100 lines of message handling ...
  // ... 200 lines of context analysis ...
  // ... 200 lines of tool configuration ...
  // ... 150 lines of streaming setup with deprecated APIs ...

  const stream = createDataStream({  // ❌ Deprecated
    execute: async (dataStream) => {
      // ... complex manual stream management ...
      const result = streamText({ ... });
      result.consumeStream();
      result.mergeIntoDataStream(dataStream, {  // ❌ Deprecated
        sendReasoning: true,
      });
    },
  });

  return new Response(stream);
}

// AFTER (~150 lines with utilities)
import { streamText } from 'ai';
import {
  ensureChatExists,
  saveUserMessage,
  prepareMessagesForStream,
  createChatStream,
  formatErrorResponse,
} from '@/lib/ai/chat';

const geminiSystemPrompt = `Ты - специализированный AI ассистент для работы с Gemini 2.5 Flash Lite и VEO3...`;

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const validationResult = postRequestBodySchema.safeParse(body);

    if (!validationResult.success) {
      return formatErrorResponse(
        new Error('Invalid request body'),
        'POST /api/gemini-chat'
      );
    }

    const { id: chatId, message, messages: requestMessages, selectedVisibilityType } = validationResult.data;
    const messageToProcess = message || requestMessages?.[requestMessages.length - 1];

    if (!messageToProcess) {
      return new Response("No message provided", { status: 400 });
    }

    // Ensure chat exists (replaces 200 lines!)
    await ensureChatExists({
      chatId,
      userId: session.user.id,
      userEmail: session.user.email,
      firstMessage: messageToProcess,
      visibility: selectedVisibilityType,
    });

    // Save user message (replaces 100 lines of recovery logic!)
    await saveUserMessage({
      chatId,
      userId: session.user.id,
      userEmail: session.user.email,
      message: messageToProcess,
      visibility: selectedVisibilityType,
    });

    // Prepare messages
    const previousMessages = await getMessagesByChatId({ id: chatId });
    const allMessages = prepareMessagesForStream(previousMessages, [messageToProcess]);

    // Create stream with Gemini model and context analysis enabled
    return await createChatStream({
      session,
      messages: allMessages,
      chatId,
      model: 'gemini-2.5-flash-lite',
      systemPrompt: geminiSystemPrompt,
      enableContextAnalysis: true, // Enable image/video context
      onFinish: async ({ response }) => {
        // Custom redirect logic for Gemini chat
        console.log('🔍 Redirect to:', `/gemini-chat/${chatId}`);
      },
    });
  } catch (error) {
    return formatErrorResponse(error, 'POST /api/gemini-chat');
  }
}

// Keep GET and DELETE handlers as-is (they're fine)
export async function GET(request: Request) { ... }
export async function DELETE(request: Request) { ... }
```

**Reduction: 1,152 lines → ~150 lines (87% less code)**

**Note**: GET and DELETE handlers can stay mostly as-is - they handle resumable streams which is a special feature.

### Phase 3: Fix TypeScript Errors

**Goal**: Resolve all 35 TypeScript errors by using correct v5 APIs and types.

#### Step 3.1: Fix Deprecated API Imports

**Files affected**: 2 files
- `src/app/(chat)/api/gemini-chat/route.ts`
- `src/app/(chat)/api/banana-veo3-advanced/route.ts`

**Errors**:
```
✗ 'createDataStream' not exported from 'ai'
✗ 'appendResponseMessages' not exported from 'ai'
```

**Fix**: Remove these imports, use utilities instead
```typescript
// BEFORE
import {
  appendResponseMessages,  // ❌ Not in v5
  createDataStream,         // ❌ Not in v5
  streamText,
} from "ai";

// AFTER
import { streamText } from 'ai';
import { createChatStream } from '@/lib/ai/chat';
```

#### Step 3.2: Fix Tool API Changes

**Files affected**: 3 files
- `src/lib/ai/tools/create-document.ts`
- `src/lib/ai/tools/update-document.ts`
- `src/lib/ai/tools/request-suggestions.ts`

**Error**:
```
✗ 'dataStream' does not exist in type 'CreateDocumentProps'
```

**Root cause**: AI SDK v5 removed `dataStream` from tool props. Tools now return values instead of writing to streams.

**Fix**: Tools already fixed! They return values in v5 pattern:
```typescript
// AI SDK v5 pattern (already implemented)
export const createDocument = ({ session }: CreateDocumentProps) =>
  tool({
    execute: async ({ title, kind, content }) => {
      const id = generateUUID();
      const draftContent = await documentHandler.onCreateDocument({ ... });

      // AI SDK v5: Return value instead of writing to dataStream
      return {
        id,
        title,
        kind,
        content: draftContent,
      };
    },
  });
```

**No changes needed** - tools are already v5 compatible!

#### Step 3.3: Fix useChat API Changes

**Files affected**: 2 files
- `src/app/(chat)/banana-veo3-advanced/page.tsx`
- `src/app/(chat)/banana-veo3/[id]/banana-veo3-chat.tsx`

**Errors**:
```
✗ Property 'input' does not exist on type 'UseChatHelpers'
✗ Property 'setInput' does not exist on type 'UseChatHelpers'
✗ Property 'handleInputChange' does not exist on type 'UseChatHelpers'
✗ Property 'handleSubmit' does not exist on type 'UseChatHelpers'
✗ Property 'isLoading' does not exist on type 'UseChatHelpers'
✗ Property 'reload' does not exist on type 'UseChatHelpers'
```

**Fix**: Use v5 pattern from `chat.tsx` (already implemented correctly!)

**Pattern to follow**: `src/components/chat/chat.tsx:114-187`
```typescript
// AI SDK v5: Manual input management
const [input, setInput] = useState("");

const chatHelpers = useChat({
  id,
  messages: initialMessages,
  api: "/api/chat",
  body: { id, selectedChatModel, selectedVisibilityType },
  onFinish: () => { ... },
  onError: (error) => { ... },
});

const { messages, setMessages, status, stop } = chatHelpers;
const sendMessage = (chatHelpers as any).sendMessage;
const regenerate = (chatHelpers as any).regenerate;

// AI SDK v5: reload is now regenerate
const reload = useCallback(() => {
  if (regenerate) {
    return regenerate();
  }
}, [regenerate]);

// AI SDK v5: Manual submit handler
const handleFormSubmit = useCallback((event) => {
  if (event?.preventDefault) {
    event.preventDefault();
  }

  sendMessage({ text: input });
  setInput("");
}, [input, sendMessage]);
```

**Apply this pattern** to banana-veo3 pages.

#### Step 3.4: Fix Message Type Issues

**Files affected**: 3 files
- `src/app/(chat)/banana-veo3/[id]/banana-veo3-chat.tsx`
- `src/app/(chat)/banana-veo3/[id]/page.tsx`
- `src/app/(chat)/test-chat/page.tsx`

**Errors**:
```
✗ Property 'content' does not exist on UIMessage
✗ Property 'parts' does not exist on Message
✗ 'Attachment' type not exported from 'ai'
```

**Fix 1**: Use parts instead of content in v5
```typescript
// BEFORE (v4 pattern)
const content = message.content;

// AFTER (v5 pattern)
const content = message.parts
  ?.filter((p: any) => p.type === 'text')
  ?.map((p: any) => p.text)
  ?.join(' ') || '';
```

**Fix 2**: Define Attachment type inline
```typescript
// BEFORE
import { Attachment } from 'ai';  // ❌ Not exported in v5

// AFTER
type Attachment = {
  url: string;
  name?: string;
  contentType?: string;
};
```

#### Step 3.5: Fix Implicit Any Types

**Files affected**: 2 files
- `src/app/(chat)/api/gemini-chat/route.ts`
- `src/app/(chat)/test-chat/page.tsx`

**Errors**:
```
✗ Parameter 'dataStream' implicitly has an 'any' type
✗ Parameter 'part' implicitly has an 'any' type
```

**Fix**: Add proper types
```typescript
// BEFORE
.map((part) => ...)  // ❌ Implicit any

// AFTER
.map((part: { type: string; text: string }) => ...)
```

#### Step 3.6: Fix Assistant Message ID Issue

**Files affected**: 1 file
- `src/app/(chat)/api/gemini-chat/route.ts`

**Error**:
```
✗ Property 'id' does not exist on AssistantModelMessage
```

**Root cause**: AI SDK v5 changed message typing. Assistant messages from `response.messages` don't have guaranteed `id`.

**Fix**: Use our `ensureMessageId` utility
```typescript
// BEFORE
const assistantMessages = response.messages.filter(m => m.role === 'assistant');
await saveMessages({
  messages: assistantMessages.map((msg) => ({
    id: msg.id,  // ❌ TypeScript error: id might not exist
    ...
  })),
});

// AFTER (using utility)
import { ensureMessageId } from '@/lib/ai/chat';

const assistantMessages = response.messages.filter(m => m.role === 'assistant');
await saveMessages({
  messages: assistantMessages.map((msg) => ({
    id: ensureMessageId(msg),  // ✅ Always returns valid UUID
    ...
  })),
});
```

### Phase 4: Testing

**Goal**: Ensure all changes work correctly without breaking existing functionality.

#### Step 4.1: Unit Tests

**Files to create/update**:
- `src/tests/unit/ai/chat/message-utils.test.ts`
- `src/tests/unit/ai/chat/error-handler.test.ts`
- `src/tests/unit/ai/chat/chat-management.test.ts` (integration)
- `src/tests/unit/ai/chat/stream-handler.test.ts` (integration)

**Test coverage targets**:
- ✅ 100% coverage for message-utils (pure functions)
- ✅ 90% coverage for error-handler (conditional logic)
- ✅ 80% coverage for chat-management (DB interactions)
- ✅ 80% coverage for stream-handler (AI SDK integration)

**Key test scenarios**:

1. **message-utils.test.ts**
```typescript
describe('normalizeMessage', () => {
  it('normalizes message with content field');
  it('normalizes message with parts field');
  it('handles missing content and parts');
  it('generates UUID when missing');
  it('preserves existing UUID');
  it('adds createdAt when missing');
});

describe('ensureMessageId', () => {
  it('keeps valid UUID');
  it('generates UUID for short ID');
  it('generates UUID when undefined');
});

describe('prepareMessagesForStream', () => {
  it('combines DB and new messages');
  it('normalizes all messages');
  it('preserves order');
  it('handles empty arrays');
});
```

2. **error-handler.test.ts**
```typescript
describe('formatErrorResponse', () => {
  it('returns detailed error in development');
  it('returns generic error in production');
  it('includes context in error message');
  it('handles non-Error objects');
});

describe('isForeignKeyError', () => {
  it('detects userId foreign key error');
  it('detects chatId foreign key error');
  it('returns false for other errors');
});

describe('handleForeignKeyError', () => {
  it('creates missing user on foreign key error');
  it('returns false for non-foreign-key errors');
  it('handles user creation failure');
});
```

3. **chat-management.test.ts** (integration test)
```typescript
describe('ensureChatExists', () => {
  it('returns existing chat without creating new one');
  it('creates chat when missing');
  it('creates user when missing');
  it('recovers from foreign key error');
  it('generates title from first message');
  it('uses default title when no message');
});

describe('saveUserMessage', () => {
  it('saves message successfully');
  it('recovers from missing chat');
  it('recovers from missing user');
  it('handles save failure gracefully');
});

describe('saveAssistantMessages', () => {
  it('saves multiple assistant messages');
  it('skips when no assistant messages');
  it('handles save failure gracefully');
});
```

4. **stream-handler.test.ts** (integration test)
```typescript
describe('analyzeMediaContext', () => {
  it('finds image context URL');
  it('finds video context URL');
  it('handles missing context gracefully');
  it('handles analysis errors');
});

describe('configureChatTools', () => {
  it('creates all required tools');
  it('passes context URLs to tools');
  it('configures tools with session');
});

describe('createChatStream', () => {
  it('creates stream with correct model');
  it('includes all tools');
  it('calls onFinish with response');
  it('calls onError on stream error');
  it('saves assistant messages');
  it('analyzes context when enabled');
});
```

#### Step 4.2: Integration Tests

**Files to run**:
- `pnpm test:important` - All critical tests
- `pnpm test:core` - Core functionality tests
- `pnpm test:chat` - E2E chat flow

**Scenarios to verify**:
1. ✅ New chat creation works
2. ✅ Existing chat continues working
3. ✅ Message streaming works
4. ✅ Tool invocations work
5. ✅ Error recovery works
6. ✅ Context analysis works

#### Step 4.3: Manual Testing Checklist

**Test in development mode**:
- [ ] Create new chat via `/api/chat`
- [ ] Create new chat via `/api/gemini-chat`
- [ ] Send message with image attachment
- [ ] Send message requesting video generation
- [ ] Test tool invocations (create document, generate image, etc.)
- [ ] Test error scenarios (invalid input, DB errors)
- [ ] Verify context analysis works
- [ ] Check TypeScript compilation passes
- [ ] Check linting passes
- [ ] Check all tests pass

### Phase 5: Documentation

**Goal**: Document the new architecture and patterns for future reference.

#### Step 5.1: Update Agent Knowledge Base

**Files to update**:
- `_ai/nextjs-patterns.md` - Add AI SDK v5 patterns
- `_ai/common-fixes.md` - Add migration notes

**Content to add**:

**In `nextjs-patterns.md`**:
```markdown
## AI SDK v5 Patterns

### Streaming Response
- Use `toUIMessageStreamResponse()` for UI message format
- Use `toTextStreamResponse()` for simple text streaming
- Don't use deprecated v4 APIs: createDataStream, mergeIntoDataStream

### Tool Definition
- Tools return values, don't write to dataStream
- See `src/lib/ai/tools/create-document.ts` for pattern
- Use `tool()` helper from 'ai' package

### useChat Hook Changes
- No more `input`, `setInput` - manage manually with useState
- No more `reload` - use `regenerate()` instead
- Use `sendMessage()` for sending messages
- See `src/components/chat/chat.tsx` for full pattern

### Message Types
- UIMessage in v5 uses `parts` not `content`
- User messages: `{ role: 'user', content: string }`
- Assistant messages: `{ role: 'assistant', parts: [...] }`
- Use `src/lib/types/message-conversion.ts` for conversions

### Chat Utilities
- Use `src/lib/ai/chat/` for common patterns
- Don't duplicate chat/user creation logic
- Use `createChatStream` for streaming
- Use `formatErrorResponse` for errors
```

**In `common-fixes.md`**:
```markdown
## AI SDK v5 Migration

### Deprecated APIs
- ❌ `createDataStream` → ✅ `toUIMessageStreamResponse()`
- ❌ `appendResponseMessages` → ✅ Not needed in v5
- ❌ `mergeIntoDataStream` → ✅ Handled automatically
- ❌ `Attachment` type → ✅ Define inline

### TypeScript Errors
- `Property 'id' missing on AssistantModelMessage` → Use `ensureMessageId` from utils
- `Property 'content' missing on UIMessage` → v5 uses `parts`, convert appropriately
- `Property 'input' missing from useChat` → Manage manually with useState

### Code Duplication
- Don't copy-paste chat creation logic → Use `ensureChatExists`
- Don't copy-paste message saving → Use `saveUserMessage`
- Don't copy-paste streaming setup → Use `createChatStream`
```

#### Step 5.2: Create Implementation Guide

**File to create**:
- `apps/super-chatbot/docs/development/ai-sdk-v5-guide.md`

**Content outline**:
1. Overview of AI SDK v5 changes
2. Architecture of chat utilities
3. How to create new chat endpoint
4. Common patterns and examples
5. Troubleshooting guide
6. Migration checklist

#### Step 5.3: Update Task Documentation

**Files to create in task directory**:
- `03-implementation-guide.md` - For implementation agents
- `04-testing-checklist.md` - For testing verification
- `05-final-summary.md` - Post-implementation summary

---

## Migration Strategy

### Execution Order

**Week 1: Foundation (Phase 1)**
- Day 1-2: Create message-utils.ts + tests
- Day 2-3: Create error-handler.ts + tests
- Day 3-4: Create chat-management.ts + tests
- Day 4-5: Create stream-handler.ts + tests
- Day 5: Review and integration tests

**Week 2: Refactoring (Phase 2 + 3)**
- Day 1: Refactor /api/chat/route.ts
- Day 2: Refactor /api/gemini-chat/route.ts
- Day 3: Fix TypeScript errors in tools
- Day 4: Fix TypeScript errors in components
- Day 5: Integration testing

**Week 3: Testing & Documentation (Phase 4 + 5)**
- Day 1-2: Run all tests, fix issues
- Day 3: Manual testing in development
- Day 4: Update documentation
- Day 5: Code review and merge

### Risk Mitigation

**Risks**:
1. ⚠️ Breaking existing chat functionality
2. ⚠️ Missing edge cases in utilities
3. ⚠️ Performance regression
4. ⚠️ Context analysis not working

**Mitigation**:
1. ✅ Keep test-chat route as reference
2. ✅ Comprehensive unit + integration tests
3. ✅ Feature flags for gradual rollout
4. ✅ Monitoring and error logging

### Rollback Plan

If issues arise:
1. Create feature flag: `USE_CHAT_UTILITIES=false`
2. Keep old implementations commented out
3. Quick rollback: revert to old code
4. Fix issues in utilities
5. Re-enable when fixed

### Feature Flags (Optional)

```typescript
// src/lib/constants.ts
export const USE_CHAT_UTILITIES = process.env.USE_CHAT_UTILITIES !== 'false';

// In route handlers
if (USE_CHAT_UTILITIES) {
  // New implementation
  return await createChatStream({ ... });
} else {
  // Old implementation (fallback)
  const result = streamText({ ... });
  return result.toUIMessageStreamResponse();
}
```

---

## Success Criteria

### Quantitative Metrics

1. ✅ **Code Reduction**:
   - chat/route.ts: 247 → ~100 lines (60% reduction)
   - gemini-chat/route.ts: 1,152 → ~150 lines (87% reduction)
   - Total: ~1,000 lines eliminated

2. ✅ **Error Resolution**:
   - TypeScript errors: 35 → 0 (100% fixed)
   - ESLint errors: 0 → 0 (maintained)

3. ✅ **Test Coverage**:
   - message-utils: 100%
   - error-handler: 90%
   - chat-management: 80%
   - stream-handler: 80%

4. ✅ **Performance**:
   - No regression in stream latency
   - No regression in response time
   - Maintained or improved error recovery

### Qualitative Criteria

1. ✅ **Maintainability**:
   - Single source of truth for chat logic
   - Easy to add new endpoints
   - Clear separation of concerns
   - Well-documented patterns

2. ✅ **Developer Experience**:
   - Simple to understand
   - Easy to debug
   - Type-safe throughout
   - Good error messages

3. ✅ **Code Quality**:
   - No duplication
   - Follows Next.js best practices
   - Uses AI SDK v5 correctly
   - Consistent patterns

4. ✅ **Reliability**:
   - All tests pass
   - Error recovery works
   - No breaking changes
   - Backward compatible

---

## Next Steps

### Immediate Actions

1. **Review this plan** with team
2. **Get approval** for approach
3. **Assign agents**:
   - @kent - Create utilities + tests (Phase 1)
   - @rob - Refactor routes (Phase 2)
   - @kevlin - Code review (Phase 3)
   - @raymond - Documentation (Phase 5)
   - @linus - Architecture review (throughout)
4. **Create feature branch**: `refactor/ai-sdk-v5`
5. **Start Phase 1**

### Agent Assignments

**@kent** (Test Engineer):
- Create all test files
- Implement TDD approach
- Verify coverage targets

**@rob** (Implementation Engineer):
- Create utility modules (Phase 1)
- Refactor API routes (Phase 2)
- Fix TypeScript errors (Phase 3)

**@kevlin** (Code Reviewer):
- Review for duplication
- Check for proper abstractions
- Verify readability

**@linus** (Architecture):
- Review overall design
- Validate separation of concerns
- Check for strategic issues

**@raymond** (Documentation):
- Update knowledge base
- Create implementation guide
- Document patterns

---

## Conclusion

**The Shipping Mindset**: Deploy is the new build. This refactoring makes our codebase production-ready by:

1. **Eliminating complexity** - 1,000+ lines removed
2. **Using the right tools** - AI SDK v5 the correct way
3. **Making maintenance easy** - Single source of truth
4. **Enabling velocity** - New features are simple to add

We're not just fixing TypeScript errors. We're making the right thing easy.

**Next.js powers millions of sites. Vercel deploys billions of requests. Why? Because we make the right thing easy.**

Let's ship this! 🚀

---

**Created by**: @don (Guillermo)
**Date**: 2025-10-15
**Status**: Ready for implementation
**Estimated effort**: 3 weeks with 2-3 agents
**Risk level**: Medium (comprehensive testing mitigates risk)
