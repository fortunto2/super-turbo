import { z } from 'zod';

export const MediaTypeSchema = z.enum(['image', 'video']);

export const ImageSettingsSchema = z.object({
  model: z.string(),
  style: z.string(),
  resolution: z.string(),
  shotSize: z.string(),
  seed: z.number().optional(),
  batchSize: z.number().optional(),
});

export const VideoSettingsSchema = z.object({
  model: z.string(),
  style: z.string(),
  resolution: z.string(),
  shotSize: z.string(),
  duration: z.number(),
  frameRate: z.number(),
  seed: z.number().optional(),
});

export const SaveMediaRequestSchema = z.object({
  type: MediaTypeSchema,
  url: z.string().min(1), // Allow both full URLs and relative paths
  prompt: z.string().min(1).max(10000),
  model: z.string().min(1).max(128),
  settings: z.union([ImageSettingsSchema, VideoSettingsSchema]),
  projectId: z.string().optional(),
  requestId: z.string().optional(),
  fileId: z.string().optional(),
  thumbnailUrl: z.string().optional(), // Allow relative paths for thumbnails too
});

export const ListMediaRequestSchema = z.object({
  type: MediaTypeSchema.optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

export const DeleteMediaRequestSchema = z.object({
  id: z.string().uuid(),
});

export type MediaType = z.infer<typeof MediaTypeSchema>;
export type ImageSettings = z.infer<typeof ImageSettingsSchema>;
export type VideoSettings = z.infer<typeof VideoSettingsSchema>;
export type SaveMediaRequest = z.infer<typeof SaveMediaRequestSchema>;
export type ListMediaRequest = z.infer<typeof ListMediaRequestSchema>;
export type DeleteMediaRequest = z.infer<typeof DeleteMediaRequestSchema>;
