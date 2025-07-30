import type { Suggestion } from '@/lib/db/schema';

export interface TextArtifactMetadata {
  suggestions: Array<Suggestion>;
}

export interface ImageArtifactMetadata {
  // Add image-specific metadata here
}

export interface VideoArtifactMetadata {
  // Add video-specific metadata here
}

export interface SheetArtifactMetadata {
  // Add sheet-specific metadata here
}

export interface ScriptArtifactMetadata {
  // Add script-specific metadata here
}

export type ArtifactMetadata = 
  | TextArtifactMetadata 
  | ImageArtifactMetadata 
  | VideoArtifactMetadata 
  | SheetArtifactMetadata 
  | ScriptArtifactMetadata; 