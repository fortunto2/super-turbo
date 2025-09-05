import type { Suggestion } from '@/lib/db/schema';

export interface TextArtifactMetadata {
  suggestions: Array<Suggestion>;
}

export type ImageArtifactMetadata = {}

export type VideoArtifactMetadata = {}

export type SheetArtifactMetadata = {}

export type ScriptArtifactMetadata = {}

export type ArtifactMetadata = 
  | TextArtifactMetadata 
  | ImageArtifactMetadata 
  | VideoArtifactMetadata 
  | SheetArtifactMetadata 
  | ScriptArtifactMetadata; 