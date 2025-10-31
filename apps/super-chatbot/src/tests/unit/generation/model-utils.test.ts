import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  normalizeImageGenerationType,
  normalizeVideoGenerationType,
  ensureNonEmptyPrompt,
  selectImageToImageModel,
} from '@/lib/generation/model-utils';

describe('model-utils', () => {
  describe('normalizeImageGenerationType', () => {
    it('should return "image-to-image" for image-to-image input', () => {
      expect(normalizeImageGenerationType('image-to-image')).toBe(
        'image-to-image',
      );
    });

    it('should return "text-to-image" for any other input', () => {
      expect(normalizeImageGenerationType('text-to-image')).toBe(
        'text-to-image',
      );
      expect(normalizeImageGenerationType('invalid')).toBe('text-to-image');
      expect(normalizeImageGenerationType(null)).toBe('text-to-image');
      expect(normalizeImageGenerationType(undefined)).toBe('text-to-image');
    });
  });

  describe('normalizeVideoGenerationType', () => {
    it('should return "image-to-video" for image-to-video input', () => {
      expect(normalizeVideoGenerationType('image-to-video')).toBe(
        'image-to-video',
      );
    });

    it('should return "text-to-video" for any other input', () => {
      expect(normalizeVideoGenerationType('text-to-video')).toBe(
        'text-to-video',
      );
      expect(normalizeVideoGenerationType('invalid')).toBe('text-to-video');
      expect(normalizeVideoGenerationType(null)).toBe('text-to-video');
      expect(normalizeVideoGenerationType(undefined)).toBe('text-to-video');
    });
  });

  describe('ensureNonEmptyPrompt', () => {
    it('should return the input string if it is non-empty', () => {
      expect(ensureNonEmptyPrompt('A beautiful sunset', 'fallback')).toBe(
        'A beautiful sunset',
      );
      expect(ensureNonEmptyPrompt('  A beautiful sunset  ', 'fallback')).toBe(
        'A beautiful sunset',
      );
    });

    it('should return fallback for empty or invalid input', () => {
      expect(ensureNonEmptyPrompt('', 'fallback')).toBe('fallback');
      expect(ensureNonEmptyPrompt('   ', 'fallback')).toBe('fallback');
      expect(ensureNonEmptyPrompt(null, 'fallback')).toBe('fallback');
      expect(ensureNonEmptyPrompt(undefined, 'fallback')).toBe('fallback');
      expect(ensureNonEmptyPrompt(123, 'fallback')).toBe('fallback');
    });
  });

  describe('selectImageToImageModel', () => {
    const mockGetAvailableImageModels = vi.fn();

    beforeEach(() => {
      vi.clearAllMocks();

      mockGetAvailableImageModels.mockResolvedValue([
        { name: 'comfyui/flux', label: 'Flux', type: 'image_to_image' },
        {
          name: 'comfyui/flux-inpaint',
          label: 'Flux Inpaint',
          type: 'image_to_image',
        },
        { name: 'comfyui/sdxl', label: 'SDXL', type: 'image_to_image' },
        {
          name: 'comfyui/stable-diffusion',
          label: 'Stable Diffusion',
          type: 'text_to_image',
        },
      ]);
    });

    it('should select exact model name match', async () => {
      const result = await selectImageToImageModel(
        'comfyui/flux',
        mockGetAvailableImageModels,
      );

      expect(result).toBe('comfyui/flux');
    });

    it('should select exact model label match', async () => {
      const result = await selectImageToImageModel(
        'Flux',
        mockGetAvailableImageModels,
      );

      expect(result).toBe('comfyui/flux');
    });

    it('should select model by base token (flux)', async () => {
      const result = await selectImageToImageModel(
        'flux-model',
        mockGetAvailableImageModels,
      );

      expect(result).toBe('comfyui/flux');
    });

    it('should select model by base token (sdxl)', async () => {
      const result = await selectImageToImageModel(
        'sdxl-model',
        mockGetAvailableImageModels,
      );

      expect(result).toBe('comfyui/sdxl');
    });

    it('should exclude inpainting models when allowInpainting is false', async () => {
      const result = await selectImageToImageModel(
        'flux',
        mockGetAvailableImageModels,
        { allowInpainting: false },
      );

      expect(result).toBe('comfyui/flux');
      expect(result).not.toBe('comfyui/flux-inpaint');
    });

    it('should include inpainting models when allowInpainting is true', async () => {
      const result = await selectImageToImageModel(
        'flux-inpaint',
        mockGetAvailableImageModels,
        { allowInpainting: true },
      );

      expect(result).toBe('comfyui/flux-inpaint');
    });

    it('should return null when no matching model is found', async () => {
      const result = await selectImageToImageModel(
        'nonexistent-model',
        mockGetAvailableImageModels,
      );

      expect(result).toBeNull();
    });

    it('should handle empty model name', async () => {
      const result = await selectImageToImageModel(
        '',
        mockGetAvailableImageModels,
      );

      expect(result).toBeNull();
    });

    it('should handle null model name', async () => {
      const result = await selectImageToImageModel(
        null as any,
        mockGetAvailableImageModels,
      );

      expect(result).toBeNull();
    });

    it('should filter out text-to-image models', async () => {
      const result = await selectImageToImageModel(
        'stable-diffusion',
        mockGetAvailableImageModels,
      );

      expect(result).toBeNull();
    });

    it('should handle case insensitive matching', async () => {
      const result = await selectImageToImageModel(
        'FLUX',
        mockGetAvailableImageModels,
      );

      expect(result).toBe('comfyui/flux');
    });

    it('should handle complex model names with slashes and dashes', async () => {
      const result = await selectImageToImageModel(
        'comfyui/flux-special',
        mockGetAvailableImageModels,
      );

      expect(result).toBe('comfyui/flux');
    });
  });
});
