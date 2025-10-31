// Image Generation Feature - Main Export File
// This file exports all components, hooks, stores, and utilities for image generation

// Components
export { ImageEditor } from './components/image-editor';
export { ImageArtifactWrapper } from './components/image-artefact-wrapper';
export { ImageEditing } from './components/editing';

// Hooks
export { useImageGeneration } from './hooks/use-image-generation';
export { useImageEffects } from './hooks/use-image-effects';
export { useImageSSE } from './hooks/use-image-sse';
export { useImageEventHandler } from './hooks/use-image-event-handler';

// Stores
export { imageSSEStore } from './stores/image-sse-store';
export { imageWebsocketStore } from './stores/image-websocket-store';

// Utils
export {
  copyImageUrlToClipboard,
  isGenerating,
  shouldShowSkeleton,
  shouldShowImage,
  getDisplayImageUrl,
  getDisplayPrompt,
  type ImageState,
} from './utils/image-utils';

export {
  imageMonitor,
  validateImageAssignment,
  getImageDebugInfo,
  type ImageGenerationDebugInfo,
} from './utils/image-debug';

// Types
export type {
  UseImageGenerationState,
  UseImageGenerationActions,
  UseImageGenerationReturn,
} from './hooks/use-image-generation';

export type {
  ImageEventHandler,
  ConnectionStateHandler,
} from './stores/image-sse-store';
