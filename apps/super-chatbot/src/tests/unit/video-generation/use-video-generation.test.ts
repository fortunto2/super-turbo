import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { VideoGenerationRequest } from '@/app/tools/video-generation/api/video-generation-api';

vi.mock('@/app/tools/video-generation/api/video-generation-api');
vi.mock('sonner');

function createValidBase64DataUrl(): string {
  return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA';
}

function createSuccessfulVideoResult() {
  return {
    success: true,
    data: {
      id: 'video-123',
      url: 'https://example.com/video.mp4',
      prompt: 'Test video',
      timestamp: Date.now(),
      settings: {
        duration: 8,
        aspectRatio: '16:9',
        resolution: '720p',
      },
    },
    fileId: 'video-123',
    url: 'https://example.com/video.mp4',
    videoUrl: 'https://example.com/video.mp4',
    provider: 'vertex-ai',
    model: 'veo-3.1',
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
    prompt: 'A beautiful sunset',
    model: 'fal-veo3',
    duration: 8,
    aspectRatio: '16:9',
    resolution: '720p',
  };
}

describe('useVideoGeneration Hook - Image-to-Video', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    };
  });

  describe('Text-to-Video (Existing Functionality)', () => {
    it('should generate video without sourceImageUrl', async () => {
      const { generateVideo } = await import(
        '@/app/tools/video-generation/api/video-generation-api'
      );
      vi.mocked(generateVideo).mockResolvedValueOnce(
        createSuccessfulVideoResult(),
      );

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { id: 'video-123' } }),
      } as Response);

      const { useVideoGeneration } = await import(
        '@/app/tools/video-generation/hooks/use-video-generation'
      );
      const { result } = renderHook(() => useVideoGeneration());

      expect(result.current.isGenerating).toBe(false);

      await act(async () => {
        await result.current.generateVideo(createValidTextToVideoRequest());
      });

      expect(generateVideo).toHaveBeenCalledWith(
        expect.not.objectContaining({ sourceImageUrl: expect.anything() }),
      );
    });

    it('should update generation status during text-to-video', async () => {
      const { generateVideo } = await import(
        '@/app/tools/video-generation/api/video-generation-api'
      );
      vi.mocked(generateVideo).mockResolvedValueOnce(
        createSuccessfulVideoResult(),
      );

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      const { useVideoGeneration } = await import(
        '@/app/tools/video-generation/hooks/use-video-generation'
      );
      const { result } = renderHook(() => useVideoGeneration());

      await act(async () => {
        await result.current.generateVideo(createValidTextToVideoRequest());
      });

      await waitFor(() => {
        expect(result.current.generationStatus.status).toBe('completed');
      });
    });
  });

  describe('Image-to-Video Generation', () => {
    it('should generate video with sourceImageUrl', async () => {
      const { generateVideo } = await import(
        '@/app/tools/video-generation/api/video-generation-api'
      );
      vi.mocked(generateVideo).mockResolvedValueOnce(
        createSuccessfulVideoResult(),
      );

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { id: 'img2vid-123' } }),
      } as Response);

      const { useVideoGeneration } = await import(
        '@/app/tools/video-generation/hooks/use-video-generation'
      );
      const { result } = renderHook(() => useVideoGeneration());

      const request = createValidImageToVideoRequest();

      await act(async () => {
        await result.current.generateVideo(request);
      });

      expect(generateVideo).toHaveBeenCalledWith(
        expect.objectContaining({
          sourceImageUrl: expect.stringContaining('data:image/jpeg;base64,'),
        }),
      );
    });

    it('should pass sourceImageUrl to API correctly', async () => {
      const { generateVideo } = await import(
        '@/app/tools/video-generation/api/video-generation-api'
      );
      vi.mocked(generateVideo).mockResolvedValueOnce(
        createSuccessfulVideoResult(),
      );

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      const { useVideoGeneration } = await import(
        '@/app/tools/video-generation/hooks/use-video-generation'
      );
      const { result } = renderHook(() => useVideoGeneration());

      const dataUrl = createValidBase64DataUrl();
      const request = {
        ...createValidImageToVideoRequest(),
        sourceImageUrl: dataUrl,
      };

      await act(async () => {
        await result.current.generateVideo(request);
      });

      expect(generateVideo).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: request.prompt,
          sourceImageUrl: dataUrl,
          model: request.model,
        }),
      );
    });

    it('should set isGenerating during image-to-video generation', async () => {
      const { generateVideo } = await import(
        '@/app/tools/video-generation/api/video-generation-api'
      );
      vi.mocked(generateVideo).mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(createSuccessfulVideoResult()), 100);
          }),
      );

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      const { useVideoGeneration } = await import(
        '@/app/tools/video-generation/hooks/use-video-generation'
      );
      const { result } = renderHook(() => useVideoGeneration());

      expect(result.current.isGenerating).toBe(false);

      act(() => {
        result.current.generateVideo(createValidImageToVideoRequest());
      });

      await waitFor(() => {
        expect(result.current.isGenerating).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.isGenerating).toBe(false);
      });
    });

    it('should update generationStatus for image-to-video', async () => {
      const { generateVideo } = await import(
        '@/app/tools/video-generation/api/video-generation-api'
      );
      vi.mocked(generateVideo).mockResolvedValueOnce(
        createSuccessfulVideoResult(),
      );

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      const { useVideoGeneration } = await import(
        '@/app/tools/video-generation/hooks/use-video-generation'
      );
      const { result } = renderHook(() => useVideoGeneration());

      await act(async () => {
        await result.current.generateVideo(createValidImageToVideoRequest());
      });

      await waitFor(() => {
        expect(result.current.generationStatus.status).toBe('completed');
        expect(result.current.generationStatus.progress).toBe(100);
      });
    });

    it('should add generated video to generatedVideos array', async () => {
      const { generateVideo } = await import(
        '@/app/tools/video-generation/api/video-generation-api'
      );
      const videoResult = createSuccessfulVideoResult();
      vi.mocked(generateVideo).mockResolvedValueOnce(videoResult);

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { id: 'saved-123' } }),
      } as Response);

      const { useVideoGeneration } = await import(
        '@/app/tools/video-generation/hooks/use-video-generation'
      );
      const { result } = renderHook(() => useVideoGeneration());

      expect(result.current.generatedVideos).toHaveLength(0);

      await act(async () => {
        await result.current.generateVideo(createValidImageToVideoRequest());
      });

      await waitFor(() => {
        expect(result.current.generatedVideos).toHaveLength(1);
        expect(result.current.generatedVideos[0]?.url).toBe(videoResult.url);
      });
    });

    it('should set currentGeneration after successful image-to-video', async () => {
      const { generateVideo } = await import(
        '@/app/tools/video-generation/api/video-generation-api'
      );
      const videoResult = createSuccessfulVideoResult();
      vi.mocked(generateVideo).mockResolvedValueOnce(videoResult);

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      const { useVideoGeneration } = await import(
        '@/app/tools/video-generation/hooks/use-video-generation'
      );
      const { result } = renderHook(() => useVideoGeneration());

      expect(result.current.currentGeneration).toBeNull();

      await act(async () => {
        await result.current.generateVideo(createValidImageToVideoRequest());
      });

      await waitFor(() => {
        expect(result.current.currentGeneration).not.toBeNull();
        expect(result.current.currentGeneration?.url).toBe(videoResult.url);
      });
    });
  });

  describe('Error Handling for Image-to-Video', () => {
    it('should handle generation failure with sourceImageUrl', async () => {
      const { generateVideo } = await import(
        '@/app/tools/video-generation/api/video-generation-api'
      );
      vi.mocked(generateVideo).mockResolvedValueOnce({
        success: false,
        error: 'Invalid image data',
      });

      const { useVideoGeneration } = await import(
        '@/app/tools/video-generation/hooks/use-video-generation'
      );
      const { result } = renderHook(() => useVideoGeneration());

      await act(async () => {
        await result.current.generateVideo(createValidImageToVideoRequest());
      });

      await waitFor(() => {
        expect(result.current.generationStatus.status).toBe('error');
        expect(result.current.generationStatus.message).toContain(
          'Invalid image data',
        );
      });
    });

    it('should reset isGenerating on error', async () => {
      const { generateVideo } = await import(
        '@/app/tools/video-generation/api/video-generation-api'
      );
      vi.mocked(generateVideo).mockRejectedValueOnce(
        new Error('Network error'),
      );

      const { useVideoGeneration } = await import(
        '@/app/tools/video-generation/hooks/use-video-generation'
      );
      const { result } = renderHook(() => useVideoGeneration());

      await act(async () => {
        await result.current.generateVideo(createValidImageToVideoRequest());
      });

      await waitFor(() => {
        expect(result.current.isGenerating).toBe(false);
      });
    });

    it('should show error toast on image-to-video failure', async () => {
      const { toast } = await import('sonner');
      const { generateVideo } = await import(
        '@/app/tools/video-generation/api/video-generation-api'
      );
      vi.mocked(generateVideo).mockResolvedValueOnce({
        success: false,
        error: 'Image too large',
      });

      const { useVideoGeneration } = await import(
        '@/app/tools/video-generation/hooks/use-video-generation'
      );
      const { result } = renderHook(() => useVideoGeneration());

      await act(async () => {
        await result.current.generateVideo(createValidImageToVideoRequest());
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('Image too large'),
        );
      });
    });
  });

  describe('State Management', () => {
    it('should maintain separate state for image-to-video and text-to-video', async () => {
      const { generateVideo } = await import(
        '@/app/tools/video-generation/api/video-generation-api'
      );

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      const { useVideoGeneration } = await import(
        '@/app/tools/video-generation/hooks/use-video-generation'
      );
      const { result } = renderHook(() => useVideoGeneration());

      vi.mocked(generateVideo).mockResolvedValueOnce({
        ...createSuccessfulVideoResult(),
        data: {
          ...createSuccessfulVideoResult().data!,
          id: 'text-video-1',
        },
      });

      await act(async () => {
        await result.current.generateVideo(createValidTextToVideoRequest());
      });

      expect(result.current.generatedVideos).toHaveLength(1);

      vi.mocked(generateVideo).mockResolvedValueOnce({
        ...createSuccessfulVideoResult(),
        data: {
          ...createSuccessfulVideoResult().data!,
          id: 'image-video-1',
        },
      });

      await act(async () => {
        await result.current.generateVideo(createValidImageToVideoRequest());
      });

      await waitFor(() => {
        expect(result.current.generatedVideos).toHaveLength(2);
      });
    });

    it('should clear currentGeneration correctly', async () => {
      const { generateVideo } = await import(
        '@/app/tools/video-generation/api/video-generation-api'
      );
      vi.mocked(generateVideo).mockResolvedValueOnce(
        createSuccessfulVideoResult(),
      );

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      const { useVideoGeneration } = await import(
        '@/app/tools/video-generation/hooks/use-video-generation'
      );
      const { result } = renderHook(() => useVideoGeneration());

      await act(async () => {
        await result.current.generateVideo(createValidImageToVideoRequest());
      });

      await waitFor(() => {
        expect(result.current.currentGeneration).not.toBeNull();
      });

      act(() => {
        result.current.clearCurrentGeneration();
      });

      expect(result.current.currentGeneration).toBeNull();
      expect(result.current.generationStatus.status).toBe('idle');
    });
  });

  describe('Database Integration', () => {
    it('should save image-to-video result to database', async () => {
      const mockFetch = vi.fn()
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ success: false }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            data: { id: 'db-video-123' },
          }),
        });

      global.fetch = mockFetch;

      const { generateVideo } = await import(
        '@/app/tools/video-generation/api/video-generation-api'
      );
      vi.mocked(generateVideo).mockResolvedValueOnce(
        createSuccessfulVideoResult(),
      );

      const { useVideoGeneration } = await import(
        '@/app/tools/video-generation/hooks/use-video-generation'
      );
      const { result } = renderHook(() => useVideoGeneration());

      await act(async () => {
        await result.current.generateVideo(createValidImageToVideoRequest());
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/media/save',
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('video'),
          }),
        );
      });
    });
  });

  describe('LocalStorage Caching', () => {
    it('should save image-to-video results to localStorage', async () => {
      const { generateVideo } = await import(
        '@/app/tools/video-generation/api/video-generation-api'
      );
      vi.mocked(generateVideo).mockResolvedValueOnce(
        createSuccessfulVideoResult(),
      );

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      const { useVideoGeneration } = await import(
        '@/app/tools/video-generation/hooks/use-video-generation'
      );
      const { result } = renderHook(() => useVideoGeneration());

      await act(async () => {
        await result.current.generateVideo(createValidImageToVideoRequest());
      });

      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith(
          'video-generation-videos',
          expect.any(String),
        );
      });
    });
  });
});
