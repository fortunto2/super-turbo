// Video Generation Feature - Main Export File
// This file serves as the entry point for all video generation related functionality

// Components
export { VideoEditor } from "./components/video-editor";
export { VideoArtifactWrapper } from "./components/video-artefact-wrapper";

// Hooks
export { useVideoEffects } from "./hooks/use-video-effects";
export { useVideoSSE } from "./hooks/use-video-sse";

// Stores
export { videoSSEStore } from "./stores/video-sse-store";
export type { VideoSSEMessage, VideoEventHandler } from "./stores/video-sse-store";

// Re-export types for convenience
export type { UseVideoEffectsProps } from "./hooks/use-video-effects";

