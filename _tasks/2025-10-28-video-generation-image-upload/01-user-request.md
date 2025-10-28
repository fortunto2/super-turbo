# User Request: Add Image-to-Video Functionality to video-generation Tool

**Date**: 2025-10-28

## Context

User wants to add image-to-video functionality to the new video-generation tool at:
`apps/super-chatbot/src/app/tools/video-generation`

## Current State

- video-generation currently only supports text-to-video via Fal.ai and Vertex AI
- There's an older video-generator tool that already has image-to-video working
- Vertex AI Veo 2 and Veo 3 both support image-to-video with base64 or GCS URI

## Requirements

1. Add image upload functionality to video-generation tool
2. Support both text-to-video and image-to-video modes
3. Use Vertex AI API (already integrated) for image-to-video
4. Maintain existing text-to-video functionality
5. Follow the patterns from the working image-generation tool which already has file upload

## Key Files to Study

- Current implementation: `apps/super-chatbot/src/app/tools/video-generation/`
- Working reference: `apps/super-chatbot/src/app/tools/video-generator/` (has image-to-video)
- Image generation reference: `apps/super-chatbot/src/app/tools/image-generation/` (has file upload)
- API route: `apps/super-chatbot/src/app/api/generate/video/route.ts`

## API Capabilities (from Vertex AI docs)

- Supports image parameter with bytesBase64Encoded or gcsUri
- Image formats: JPEG, PNG
- Same duration, aspect ratio, resolution options as text-to-video
- Veo 3 supports: 4, 6, or 8 seconds, 720p or 1080p

## Deliverables Expected

1. Type definitions updates
2. API integration changes
3. UI components for image upload
4. Form updates to support both modes
5. Testing strategy

## User Value Proposition

Enable users to transform their images into videos using AI, providing creative flexibility beyond text-only video generation. This unlocks new use cases like animating still photos, creating video content from artwork, and enhancing static visual content with motion.
