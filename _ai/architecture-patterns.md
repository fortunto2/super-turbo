# Architecture Patterns

## Typed Proxy Architecture

### Core Principle
- **Frontend NEVER calls external APIs directly**
- All external requests go through internal Next.js API routes
- Server-only configuration for tokens and credentials

### Implementation
```typescript
// ❌ WRONG - Direct external API call
const response = await fetch('https://external-api.com/generate', {
  headers: { 'Authorization': `Bearer ${token}` } // Exposed!
});

// ✅ RIGHT - Through internal proxy
const response = await fetch('/api/generate/image', {
  method: 'POST',
  body: JSON.stringify(params)
});
```

### Benefits
- Type enforcement at API boundaries
- Centralized auth and rate limiting
- Normalized error shapes
- No client-side secrets

## Internal API Routes Pattern

### Location
- `apps/super-chatbot/src/app/api/**`

### Structure
```typescript
// Validate inputs with Zod
const bodySchema = z.object({
  prompt: z.string(),
  model: z.string().optional()
});

// Enforce auth
const session = await auth();
if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

// Normalize errors
try {
  const result = await externalAPI.generate(params);
  return NextResponse.json({ success: true, data: result });
} catch (error) {
  // Don't leak provider internals
  return NextResponse.json({ 
    success: false, 
    error: 'Generation failed' 
  }, { status: 500 });
}
```

### Key Routes
- `/api/generate/image` - Image generation
- `/api/generate/video` - Video generation
- `/api/config/models` - Model configuration
- `/api/events` - SSE events
- `/api/files` - File operations

## Real-time Architecture

### Server-Sent Events (SSE)
- **Preferred** for progress updates and streaming
- See `src/hooks/use-artifact-sse.ts`
- Event stores: `src/artifacts/{type}/stores/*-sse-store.ts`

### Pattern
```typescript
// Server (API route)
const stream = new ReadableStream({
  start(controller) {
    controller.enqueue(`data: ${JSON.stringify({ progress: 10 })}\n\n`);
  }
});
return new Response(stream, {
  headers: { 'Content-Type': 'text/event-stream' }
});

// Client (hook)
const eventSource = new EventSource('/api/events');
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  updateProgress(data.progress);
};
```

### WebSocket
- Located at `src/lib/websocket/`
- Use only when bidirectional communication required
- SSE preferred for unidirectional streams

## Artifacts Architecture

### Types
- **Text**: Markdown documents, scripts
- **Image**: Generated images, inpainting
- **Video**: Generated videos, video-to-video
- **Sheet**: Data tables, spreadsheets

### File-Centric Storage
- Artifacts stored as files (not in DB)
- Metadata in database (user, balance, history)
- Rendering logic in `src/artifacts/{type}/`

### Lifecycle
1. Generation request → Internal API
2. External provider call (server-only)
3. Progress updates via SSE
4. File storage + DB metadata
5. Client render via artifact components

## Monorepo Package Structure

### Shared Packages (`packages/`)
- `@turbo-super/ui` - UI components (Radix + Tailwind)
- `@turbo-super/shared` - Utilities, hooks, formatters
- `@turbo-super/data` - TypeScript types, constants
- `@turbo-super/api` - API clients
- `@turbo-super/features` - Business logic
- `@turbo-super/core` - Base types, validation
- `@turbo-super/payment` - Payment components

### Usage
```typescript
// Use workspace packages instead of duplication
import { Button, Card } from '@turbo-super/ui';
import { formatDate, useLocalStorage } from '@turbo-super/shared';
import { Artifact, User } from '@turbo-super/data';
```

### Build Order
1. `shared` - Base utilities
2. `ui` - Components
3. `core` - Types
4. `api` - Clients
5. `features` - Business logic
6. `payment` - Payments

## Security Patterns

### Server-Only Secrets
```typescript
// ✅ RIGHT - Server component/action
import { env } from '@/lib/config/env';
const apiKey = env.SUPERDUPERAI_API_KEY; // Safe

// ❌ WRONG - Client component
'use client';
const apiKey = process.env.NEXT_PUBLIC_API_KEY; // Exposed!
```

### Auth Patterns
- NextAuth v5 at `src/app/(auth)/auth`
- Admin check: `src/lib/auth/admin-utils.ts`
- Session validation in API routes

```typescript
import { auth } from '@/app/(auth)/auth';

const session = await auth();
if (!session?.user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### Rate Limiting
- Enforce at internal API boundaries
- Check user balance before operations
- Log attempts for monitoring

## Error Handling Patterns

### Normalized Error Shapes
```typescript
// ✅ Consistent shape
type ApiResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

// Don't leak provider errors
try {
  const result = await provider.generate();
  return { success: true, data: result };
} catch (err) {
  // Generic error, log details server-side
  logger.error('Provider error', { err });
  return { success: false, error: 'Generation failed' };
}
```

### Validation
- Use Zod schemas for runtime validation
- Validate at API boundaries
- See `src/lib/security/` for patterns

## Code Pointers
- Typed proxy: `src/app/api/generate/`
- SSE hooks: `src/hooks/use-artifact-sse.ts`
- Event stores: `src/artifacts/{type}/stores/`
- Auth utils: `src/lib/auth/admin-utils.ts`
- Config: `src/lib/config/`
- WebSocket: `src/lib/websocket/`

