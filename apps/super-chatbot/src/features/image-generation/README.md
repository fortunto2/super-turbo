# Image Generation Feature

This feature contains all components, hooks, stores, and utilities related to image generation in the SuperDuperAI chatbot.

## Structure

```
features/image-generation/
├── components/           # React components
│   ├── image-editor.tsx         # Main image editor component
│   ├── image-artefact-wrapper.tsx # Wrapper for image artifacts
│   └── editing.tsx              # Image editing component
├── hooks/               # React hooks
│   ├── use-image-generation.ts  # Main generation hook
│   ├── use-image-effects.ts     # Side effects hook
│   ├── use-image-sse.ts         # SSE connection hook
│   └── use-image-event-handler.ts # Event handling hook
├── stores/              # State management
│   ├── image-sse-store.ts       # SSE store
│   └── image-websocket-store.ts # WebSocket store
├── utils/               # Utilities
│   ├── image-utils.ts           # Image utility functions
│   └── image-debug.ts           # Debug utilities
├── types/               # TypeScript types (future)
├── index.ts             # Main export file
└── README.md            # This file
```

## Components

### ImageEditor

Main component for image generation interface. Handles:

- Image generation state
- Connection status
- Error handling
- Force checking results

### ImageArtifactWrapper

Wrapper component for image artifacts in chat. Handles:

- SSE connections for real-time updates
- Polling for completion
- Saving to chat history
- Thumbnail generation

### ImageEditing

Component for editing generated images. Handles:

- Inpainting functionality
- Image manipulation
- Save/cancel operations

## Hooks

### useImageGeneration

Main hook for image generation logic. Provides:

- Generation state management
- API calls
- Connection management
- Error handling

### useImageEffects

Hook for side effects during image generation. Handles:

- Auto-saving to chat
- State synchronization
- Artifact updates

### useImageSSE

Hook for Server-Sent Events connection. Manages:

- SSE connection lifecycle
- Event handling
- Connection state

### useImageEventHandler

Hook for handling WebSocket/SSE events. Processes:

- File completion events
- Progress updates
- Error events

## Stores

### imageSSEStore

Store for managing SSE connections. Features:

- Project-specific handlers
- Connection state management
- Automatic cleanup
- Debug information

### imageWebsocketStore

Store for managing WebSocket connections. Features:

- Reconnection logic
- Message routing
- Handler management
- Connection pooling

## Utils

### image-utils.ts

Utility functions for image operations:

- URL copying
- State validation
- Display logic
- Helper functions

### image-debug.ts

Debug utilities for troubleshooting:

- Request monitoring
- Duplicate detection
- Mix-up detection
- Debug reporting

## Usage

```typescript
import { ImageEditor, useImageGeneration } from "@/features/image-generation";

// Use the main component
<ImageEditor
  chatId={chatId}
  append={append}
  setMessages={setMessages}
/>

// Or use hooks directly
const { generateImageAsync, isGenerating, imageUrl } = useImageGeneration(chatId);
```

## Key Features

- **Real-time Updates**: SSE and WebSocket support for live progress
- **Error Handling**: Comprehensive error handling and recovery
- **Debug Tools**: Built-in debugging and monitoring
- **Type Safety**: Full TypeScript support
- **Modular Design**: Clean separation of concerns
- **Performance**: Optimized for React Strict Mode and re-renders

## FileId Management

This feature properly handles `fileId` throughout the generation process:

- Extracts `fileId` from API responses
- Embeds `fileId` in attachment names
- Uses `fileId` for SSE connections
- Prevents mix-ups between `chatId` and `fileId`
