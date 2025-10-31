import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type {
  VideoGenerationRequest,
} from '@/app/tools/video-generation/api/video-generation-api';

function createValidBase64DataUrl(): string {
  return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA';
}

function createMockFetchResponse(data: any, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
    headers: new Headers(),
  } as Response;
}

function createSuccessfulVertexResponse(fileId: string) {
  return {
    success: true,
    fileId,
    operationName: `projects/test-project/locations/us-central1/operations/${fileId}`,
    status: 'processing',
    message: 'Видео генерируется через Vertex AI',
    data: {
      id: fileId,
      operationName: `projects/test-project/locations/us-central1/operations/${fileId}`,
      prompt: 'Test prompt',
      timestamp: Date.now(),
      settings: {
        duration: 8,
        aspectRatio: '16:9',
        resolution: '720p',
      },
    },
    provider: 'vertex-ai',
    model: 'veo-3.1',
  };
}

function createCompletedVideoResponse(videoUrl: string) {
  return {
    status: 'completed',
    videoUrl,
    success: true,
  };
}

function createValidImageToVideoRequest(): VideoGenerationRequest {
  return {
    prompt: 'Pan camera left slowly',
    sourceImageUrl: createValidBase64DataUrl(),
    model: 'vertex-veo3',
    duration: 8,
    aspectRatio: '16:9',
    resolution: '720p',
  };
}

function createValidTextToVideoRequest(): VideoGenerationRequest {
  return {
    prompt: 'A beautiful sunset over the ocean',
    model: 'fal-veo3',
    duration: 8,
    aspectRatio: '16:9',
    resolution: '720p',
  };
}

describe('Video Generation API - Image-to-Video', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Text-to-Video (existing functionality)', () => {
    it('should generate video without sourceImageUrl using Fal.ai', async () => {
      const request = createValidTextToVideoRequest();
      const mockResponse = {
        success: true,
        videoUrl: 'https://fal.ai/videos/test-video.mp4',
        fileId: 'fal-123',
        provider: 'fal-ai',
        model: 'veo3',
      };

      vi.mocked(global.fetch).mockResolvedValueOnce(
        createMockFetchResponse(mockResponse),
      );

      const { generateVideo } = await import(
        '@/app/tools/video-generation/api/video-generation-api'
      );
      const result = await generateVideo(request);

      expect(result.success).toBe(true);
      expect(result.videoUrl).toBeDefined();
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/video/generate',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const fetchCall = vi.mocked(global.fetch).mock.calls[0];
      const requestBody = JSON.parse(fetchCall?.[1]?.body as string);
      expect(requestBody.sourceImageUrl).toBeUndefined();
    });

    it('should use correct endpoint for Vertex AI text-to-video', async () => {
      const request = {
        ...createValidTextToVideoRequest(),
        model: 'vertex-veo3' as const,
      };

      const fileId = 'vertex-text-123';
      vi.mocked(global.fetch)
        .mockResolvedValueOnce(
          createMockFetchResponse(createSuccessfulVertexResponse(fileId)),
        )
        .mockResolvedValueOnce(
          createMockFetchResponse(
            createCompletedVideoResponse('https://vertex.ai/video.mp4'),
          ),
        );

      const { generateVideo } = await import(
        '@/app/tools/video-generation/api/video-generation-api'
      );
      const result = await generateVideo(request);

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/video/generate-vertex',
        expect.any(Object),
      );
    });
  });

  describe('Image-to-Video with Vertex AI', () => {
    it('should send sourceImageUrl to Vertex AI endpoint', async () => {
      const request = createValidImageToVideoRequest();
      const fileId = 'vertex-img2vid-123';

      vi.mocked(global.fetch)
        .mockResolvedValueOnce(
          createMockFetchResponse(createSuccessfulVertexResponse(fileId)),
        )
        .mockResolvedValueOnce(
          createMockFetchResponse(
            createCompletedVideoResponse('https://vertex.ai/animated.mp4'),
          ),
        );

      const { generateVideo } = await import(
        '@/app/tools/video-generation/api/video-generation-api'
      );
      const result = await generateVideo(request);

      expect(result.success).toBe(true);

      const fetchCall = vi.mocked(global.fetch).mock.calls[0];
      expect(fetchCall?.[0]).toBe('/api/video/generate-vertex');

      const requestBody = JSON.parse(fetchCall?.[1]?.body as string);
      expect(requestBody.sourceImageUrl).toBeDefined();
      expect(requestBody.sourceImageUrl).toContain('data:image/jpeg;base64,');
    });

    it('should include sourceImageUrl in request payload', async () => {
      const request = createValidImageToVideoRequest();
      const fileId = 'vertex-123';

      vi.mocked(global.fetch).mockResolvedValueOnce(
        createMockFetchResponse(createSuccessfulVertexResponse(fileId)),
      );

      const { generateVideo } = await import(
        '@/app/tools/video-generation/api/video-generation-api'
      );
      await generateVideo(request);

      const fetchCall = vi.mocked(global.fetch).mock.calls[0];
      const requestBody = JSON.parse(fetchCall?.[1]?.body as string);

      expect(requestBody).toMatchObject({
        prompt: request.prompt,
        sourceImageUrl: request.sourceImageUrl,
        duration: '8',
        aspectRatio: '16:9',
        resolution: '720p',
      });
    });

    it('should handle both base64 and URL sourceImageUrl formats', async () => {
      const requests = [
        {
          ...createValidImageToVideoRequest(),
          sourceImageUrl: createValidBase64DataUrl(),
        },
        {
          ...createValidImageToVideoRequest(),
          sourceImageUrl: 'https://example.com/image.jpg',
        },
      ];

      for (const request of requests) {
        const fileId = `vertex-${Date.now()}`;
        vi.mocked(global.fetch).mockResolvedValueOnce(
          createMockFetchResponse(createSuccessfulVertexResponse(fileId)),
        );

        const { generateVideo } = await import(
          '@/app/tools/video-generation/api/video-generation-api'
        );
        const result = await generateVideo(request);

        expect(result.success).toBe(true);
        const fetchCall = vi.mocked(global.fetch).mock.calls[
          vi.mocked(global.fetch).mock.calls.length - 1
        ];
        const requestBody = JSON.parse(fetchCall?.[1]?.body as string);
        expect(requestBody.sourceImageUrl).toBe(request.sourceImageUrl);
      }
    });

    it('should work with Vertex Veo 2 model', async () => {
      const request = {
        ...createValidImageToVideoRequest(),
        model: 'vertex-veo2' as const,
      };

      const fileId = 'vertex-veo2-123';
      vi.mocked(global.fetch)
        .mockResolvedValueOnce(
          createMockFetchResponse(createSuccessfulVertexResponse(fileId)),
        )
        .mockResolvedValueOnce(
          createMockFetchResponse(
            createCompletedVideoResponse('https://vertex.ai/veo2-video.mp4'),
          ),
        );

      const { generateVideo } = await import(
        '@/app/tools/video-generation/api/video-generation-api'
      );
      const result = await generateVideo(request);

      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/video/generate-vertex',
        expect.any(Object),
      );
    });

    it('should work with Vertex Veo 3 model', async () => {
      const request = createValidImageToVideoRequest();
      const fileId = 'vertex-veo3-123';

      vi.mocked(global.fetch)
        .mockResolvedValueOnce(
          createMockFetchResponse(createSuccessfulVertexResponse(fileId)),
        )
        .mockResolvedValueOnce(
          createMockFetchResponse(
            createCompletedVideoResponse('https://vertex.ai/veo3-video.mp4'),
          ),
        );

      const { generateVideo } = await import(
        '@/app/tools/video-generation/api/video-generation-api'
      );
      const result = await generateVideo(request);

      expect(result.success).toBe(true);
    });
  });

  describe('Model Compatibility', () => {
    it('should ignore sourceImageUrl for Fal.ai model', async () => {
      const request = {
        ...createValidImageToVideoRequest(),
        model: 'fal-veo3' as const,
      };

      const mockResponse = {
        success: true,
        videoUrl: 'https://fal.ai/videos/test.mp4',
        fileId: 'fal-123',
      };

      vi.mocked(global.fetch).mockResolvedValueOnce(
        createMockFetchResponse(mockResponse),
      );

      const { generateVideo } = await import(
        '@/app/tools/video-generation/api/video-generation-api'
      );
      const result = await generateVideo(request);

      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/video/generate',
        expect.any(Object),
      );
    });

    it('should use Vertex endpoint only for vertex- prefixed models', async () => {
      const models: Array<{ model: string; expectedEndpoint: string }> = [
        { model: 'vertex-veo3', expectedEndpoint: '/api/video/generate-vertex' },
        { model: 'vertex-veo2', expectedEndpoint: '/api/video/generate-vertex' },
        { model: 'fal-veo3', expectedEndpoint: '/api/video/generate' },
      ];

      for (const { model, expectedEndpoint } of models) {
        const request = {
          ...createValidImageToVideoRequest(),
          model: model as any,
        };

        const mockResponse =
          expectedEndpoint === '/api/video/generate-vertex'
            ? createSuccessfulVertexResponse(`${model}-123`)
            : {
                success: true,
                videoUrl: 'https://fal.ai/video.mp4',
                fileId: `${model}-123`,
              };

        vi.mocked(global.fetch).mockResolvedValueOnce(
          createMockFetchResponse(mockResponse),
        );

        const { generateVideo } = await import(
          '@/app/tools/video-generation/api/video-generation-api'
        );
        await generateVideo(request);

        const fetchCall = vi.mocked(global.fetch).mock.calls[
          vi.mocked(global.fetch).mock.calls.length - 1
        ];
        expect(fetchCall?.[0]).toBe(expectedEndpoint);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid image data error from API', async () => {
      const request = createValidImageToVideoRequest();

      vi.mocked(global.fetch).mockResolvedValueOnce(
        createMockFetchResponse(
          {
            success: false,
            error: 'Invalid image data',
          },
          400,
        ),
      );

      const { generateVideo } = await import(
        '@/app/tools/video-generation/api/video-generation-api'
      );
      const result = await generateVideo(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid image data');
    });

    it('should handle network errors gracefully', async () => {
      const request = createValidImageToVideoRequest();

      vi.mocked(global.fetch).mockRejectedValueOnce(
        new Error('Network error'),
      );

      const { generateVideo } = await import(
        '@/app/tools/video-generation/api/video-generation-api'
      );
      const result = await generateVideo(request);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle missing video URL in response', async () => {
      const request = createValidImageToVideoRequest();

      vi.mocked(global.fetch)
        .mockResolvedValueOnce(
          createMockFetchResponse(
            createSuccessfulVertexResponse('vertex-123'),
          ),
        )
        .mockResolvedValueOnce(
          createMockFetchResponse({
            status: 'completed',
            success: true,
          }),
        );

      const { generateVideo } = await import(
        '@/app/tools/video-generation/api/video-generation-api'
      );
      const result = await generateVideo(request);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle timeout during polling', async () => {
      const request = createValidImageToVideoRequest();

      vi.mocked(global.fetch)
        .mockResolvedValueOnce(
          createMockFetchResponse(
            createSuccessfulVertexResponse('vertex-timeout'),
          ),
        )
        .mockResolvedValue(
          createMockFetchResponse({
            status: 'processing',
            success: true,
          }),
        );

      const { generateVideo } = await import(
        '@/app/tools/video-generation/api/video-generation-api'
      );
      const result = await generateVideo(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('timeout');
    });
  });

  describe('Image Variations', () => {
    it('should handle different aspect ratios with image', async () => {
      const aspectRatios = ['16:9', '9:16', '1:1'] as const;

      for (const aspectRatio of aspectRatios) {
        const request = {
          ...createValidImageToVideoRequest(),
          aspectRatio,
        };

        const fileId = `vertex-${aspectRatio}-123`;
        vi.mocked(global.fetch).mockResolvedValueOnce(
          createMockFetchResponse(createSuccessfulVertexResponse(fileId)),
        );

        const { generateVideo } = await import(
          '@/app/tools/video-generation/api/video-generation-api'
        );
        await generateVideo(request);

        const fetchCall = vi.mocked(global.fetch).mock.calls[
          vi.mocked(global.fetch).mock.calls.length - 1
        ];
        const requestBody = JSON.parse(fetchCall?.[1]?.body as string);
        expect(requestBody.aspectRatio).toBe(aspectRatio);
      }
    });

    it('should handle different resolutions with image', async () => {
      const resolutions = ['720p', '1080p'] as const;

      for (const resolution of resolutions) {
        const request = {
          ...createValidImageToVideoRequest(),
          resolution,
        };

        const fileId = `vertex-${resolution}-123`;
        vi.mocked(global.fetch).mockResolvedValueOnce(
          createMockFetchResponse(createSuccessfulVertexResponse(fileId)),
        );

        const { generateVideo } = await import(
          '@/app/tools/video-generation/api/video-generation-api'
        );
        await generateVideo(request);

        const fetchCall = vi.mocked(global.fetch).mock.calls[
          vi.mocked(global.fetch).mock.calls.length - 1
        ];
        const requestBody = JSON.parse(fetchCall?.[1]?.body as string);
        expect(requestBody.resolution).toBe(resolution);
      }
    });

    it('should handle different durations with image', async () => {
      const durations = [4, 6, 8] as const;

      for (const duration of durations) {
        const request = {
          ...createValidImageToVideoRequest(),
          duration,
        };

        const fileId = `vertex-dur${duration}-123`;
        vi.mocked(global.fetch).mockResolvedValueOnce(
          createMockFetchResponse(createSuccessfulVertexResponse(fileId)),
        );

        const { generateVideo } = await import(
          '@/app/tools/video-generation/api/video-generation-api'
        );
        await generateVideo(request);

        const fetchCall = vi.mocked(global.fetch).mock.calls[
          vi.mocked(global.fetch).mock.calls.length - 1
        ];
        const requestBody = JSON.parse(fetchCall?.[1]?.body as string);
        expect(requestBody.duration).toBe(String(duration));
      }
    });
  });

  describe('Negative Prompt Support', () => {
    it('should include negativePrompt with image-to-video', async () => {
      const request = {
        ...createValidImageToVideoRequest(),
        negativePrompt: 'blurry, distorted, low quality',
      };

      const fileId = 'vertex-neg-123';
      vi.mocked(global.fetch).mockResolvedValueOnce(
        createMockFetchResponse(createSuccessfulVertexResponse(fileId)),
      );

      const { generateVideo } = await import(
        '@/app/tools/video-generation/api/video-generation-api'
      );
      await generateVideo(request);

      const fetchCall = vi.mocked(global.fetch).mock.calls[0];
      const requestBody = JSON.parse(fetchCall?.[1]?.body as string);
      expect(requestBody.negativePrompt).toBe('blurry, distorted, low quality');
    });
  });
});
