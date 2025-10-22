# Video Generation Tool

This tool provides video generation capabilities using Fal.ai's Veo3 API.

## Overview

The video generation tool allows users to create videos from text prompts using Google's Veo3 model via Fal.ai's infrastructure.

## Architecture

### API Routes

#### `/api/generate/video-fal` (NEW)
- **Provider**: Fal.ai
- **Model**: Veo3
- **Type**: Text-to-video generation
- **Authentication**: Required (NextAuth session)
- **Balance checking**: Integrated with tools-balance system
- **Response**: Returns video URL immediately

#### `/api/generate/video` (OLD - Deprecated)
- **Provider**: Superdupor AI
- **Status**: Deprecated - do not use
- **Note**: This route is kept for backward compatibility but should not be used for new implementations

### Frontend Components

1. **video-generation-api.ts**: Client-side API wrapper
2. **use-video-generation.ts**: React hook managing state and API calls
3. **video-generation-form.tsx**: Form component for user input
4. **video-generation-gallery.tsx**: Gallery displaying generated videos
5. **generation-progress.tsx**: Progress indicator during generation

### Backend Integration

1. **veo3-api.ts**: Server-side Veo3 API integration with Fal.ai
2. **route.ts**: Next.js API route handler

## Configuration

### Environment Variables

Add the following to your `.env.local` file:

```env
# Fal.ai API Key (required for video generation)
FAL_KEY=your_fal_ai_api_key_here
```

### Getting a Fal.ai API Key

1. Visit [fal.ai](https://fal.ai)
2. Sign up or log in
3. Navigate to API Keys section
4. Generate a new API key
5. Copy it to your `.env.local` file

## API Parameters

### Request Parameters

```typescript
{
  prompt: string;           // Required: Text description of the video
  duration: '4s' | '6s' | '8s';  // Optional: Video duration (default: '8s')
  aspectRatio: '16:9' | '9:16' | '1:1';  // Optional: Aspect ratio (default: '16:9')
  resolution: '720p' | '1080p';  // Optional: Video resolution (default: '720p')
  generateAudio: boolean;   // Optional: Generate audio (default: true)
  enhancePrompt: boolean;   // Optional: AI-enhance prompt (default: true)
  negativePrompt?: string;  // Optional: What to avoid in the video
  seed?: number;           // Optional: Random seed for reproducibility
}
```

### Response Format

```typescript
{
  success: true,
  fileId: string,           // Unique file identifier
  videoUrl: string,         // Direct URL to generated video
  data: {
    id: string,
    url: string,
    prompt: string,
    timestamp: number,
    settings: {
      duration: number,
      aspectRatio: string,
      resolution: string,
      generateAudio: boolean
    }
  },
  creditsUsed: number,      // Credits deducted from user balance
  provider: 'fal.ai',
  model: 'veo3'
}
```

## Pricing

Video generation costs are calculated based on:
- Duration (4s, 6s, 8s)
- Resolution (720p, 1080p)
- Audio generation (enabled/disabled)

Fal.ai Pricing:
- $0.20/second (audio off)
- $0.40/second (audio on)

## Usage Example

### Client-Side

```typescript
import { useVideoGeneration } from './hooks/use-video-generation';

function VideoGeneratorComponent() {
  const { generateVideo, isGenerating, currentGeneration } = useVideoGeneration();

  const handleGenerate = async () => {
    await generateVideo({
      prompt: "A sunset over the ocean with waves gently crashing",
      duration: 8,
      aspectRatio: '16:9',
    });
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={isGenerating}>
        Generate Video
      </button>
      {currentGeneration && (
        <video src={currentGeneration.url} controls />
      )}
    </div>
  );
}
```

### Server-Side (API Route)

```typescript
import { createVeo3Video } from '@/lib/ai/veo3-api';

export async function POST(request: Request) {
  const { prompt } = await request.json();

  const result = await createVeo3Video({
    prompt,
    duration: '8s',
    aspectRatio: '16:9',
    resolution: '720p',
  });

  return Response.json(result);
}
```

## Features

- ✅ Text-to-video generation using Veo3
- ✅ Multiple duration options (4s, 6s, 8s)
- ✅ Multiple aspect ratios (16:9, 9:16, 1:1)
- ✅ Resolution options (720p, 1080p)
- ✅ Audio generation
- ✅ Prompt enhancement
- ✅ Negative prompts
- ✅ Seed-based reproducibility
- ✅ User balance checking
- ✅ Credit deduction
- ✅ Video gallery with localStorage persistence

## Testing

To test the video generation:

1. Ensure `FAL_KEY` is set in `.env.local`
2. Navigate to `/tools/video-generation`
3. Enter a text prompt
4. Adjust settings (duration, aspect ratio, resolution)
5. Click "Generate Video"
6. Video will appear in the gallery when ready

## Troubleshooting

### "FAL_KEY not configured" error
- Ensure `FAL_KEY` is set in your `.env.local` file
- Restart your development server after adding the key

### "Insufficient balance" error
- User doesn't have enough credits
- Check user's balance in the database
- Add credits to the user's account

### Video URL not appearing
- Check browser console for errors
- Verify API response includes `videoUrl` or `data.url`
- Check network tab for API response

### Slow generation
- Veo3 typically takes 30s - 2 minutes depending on duration
- Longer videos (8s) take more time than shorter ones (4s)
- Check Fal.ai status page for service issues

## Related Files

- API Route: `src/app/api/generate/video-fal/route.ts`
- Veo3 Integration: `src/lib/ai/veo3-api.ts`
- Frontend API: `src/app/tools/video-generation/api/video-generation-api.ts`
- React Hook: `src/app/tools/video-generation/hooks/use-video-generation.ts`
- Page: `src/app/tools/video-generation/page.tsx`
