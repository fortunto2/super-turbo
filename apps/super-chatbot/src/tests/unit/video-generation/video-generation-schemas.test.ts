import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const videoGenerationSchema = z
  .object({
    prompt: z.string().min(1, 'Промпт обязателен'),
    sourceImageUrl: z.string().optional(),
    duration: z
      .union([z.enum(['4', '6', '8']), z.number()])
      .optional()
      .default('8'),
    aspectRatio: z.enum(['16:9', '9:16', '1:1']).optional().default('16:9'),
    resolution: z.enum(['720p', '1080p']).optional().default('720p'),
    negativePrompt: z.string().optional(),
  })
  .passthrough();

const imageFileSchema = z.object({
  file: z.instanceof(File),
  type: z.enum(['image/jpeg', 'image/png', 'image/webp']),
  size: z.number().max(10 * 1024 * 1024),
});

function createMockFile(
  name: string,
  size: number,
  type: string,
): File {
  const content = new Array(size).fill('a').join('');
  return new File([content], name, { type });
}

function createValidBase64DataUrl(): string {
  return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA';
}

function createValidImageToVideoRequest() {
  return {
    prompt: 'Animate this image with gentle motion',
    sourceImageUrl: createValidBase64DataUrl(),
    model: 'vertex-veo3' as const,
    duration: 8,
    aspectRatio: '16:9' as const,
    resolution: '720p' as const,
  };
}

function createValidTextToVideoRequest() {
  return {
    prompt: 'A beautiful sunset over the ocean',
    duration: 8,
    aspectRatio: '16:9' as const,
    resolution: '720p' as const,
    model: 'fal-veo3' as const,
  };
}

describe('Video Generation Schemas', () => {
  describe('Text-to-Video Validation', () => {
    it('should validate text-to-video request without sourceImageUrl', () => {
      const request = createValidTextToVideoRequest();
      const result = videoGenerationSchema.safeParse(request);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sourceImageUrl).toBeUndefined();
      }
    });

    it('should reject empty prompt for text-to-video', () => {
      const request = {
        ...createValidTextToVideoRequest(),
        prompt: '',
      };

      const result = videoGenerationSchema.safeParse(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toEqual(['prompt']);
      }
    });

    it('should use default values for optional fields', () => {
      const minimalRequest = {
        prompt: 'A beautiful sunset',
      };

      const result = videoGenerationSchema.safeParse(minimalRequest);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.duration).toBe('8');
        expect(result.data.aspectRatio).toBe('16:9');
        expect(result.data.resolution).toBe('720p');
      }
    });
  });

  describe('Image-to-Video Validation', () => {
    it('should validate image-to-video request with sourceImageUrl', () => {
      const request = createValidImageToVideoRequest();
      const result = videoGenerationSchema.safeParse(request);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sourceImageUrl).toBeDefined();
        expect(result.data.sourceImageUrl).toContain('data:image/jpeg;base64,');
      }
    });

    it('should accept base64 data URL for sourceImageUrl', () => {
      const request = {
        prompt: 'Animate this',
        sourceImageUrl: createValidBase64DataUrl(),
      };

      const result = videoGenerationSchema.safeParse(request);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sourceImageUrl).toContain('base64,');
      }
    });

    it('should accept HTTP URL for sourceImageUrl', () => {
      const request = {
        prompt: 'Animate this',
        sourceImageUrl: 'https://example.com/image.jpg',
      };

      const result = videoGenerationSchema.safeParse(request);

      expect(result.success).toBe(true);
    });

    it('should require prompt even with sourceImageUrl', () => {
      const request = {
        prompt: '',
        sourceImageUrl: createValidBase64DataUrl(),
      };

      const result = videoGenerationSchema.safeParse(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toEqual(['prompt']);
      }
    });

    it('should validate all parameters together for image-to-video', () => {
      const request = {
        prompt: 'Pan camera left slowly',
        sourceImageUrl: createValidBase64DataUrl(),
        duration: '6' as const,
        aspectRatio: '9:16' as const,
        resolution: '1080p' as const,
        negativePrompt: 'blurry, distorted',
      };

      const result = videoGenerationSchema.safeParse(request);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.duration).toBe('6');
        expect(result.data.aspectRatio).toBe('9:16');
        expect(result.data.resolution).toBe('1080p');
        expect(result.data.negativePrompt).toBe('blurry, distorted');
      }
    });
  });

  describe('Image File Validation', () => {
    it('should validate JPEG image file', () => {
      const file = createMockFile('test.jpg', 1024 * 1024, 'image/jpeg');
      const request = {
        file,
        type: 'image/jpeg' as const,
        size: file.size,
      };

      const result = imageFileSchema.safeParse(request);

      expect(result.success).toBe(true);
    });

    it('should validate PNG image file', () => {
      const file = createMockFile('test.png', 2 * 1024 * 1024, 'image/png');
      const request = {
        file,
        type: 'image/png' as const,
        size: file.size,
      };

      const result = imageFileSchema.safeParse(request);

      expect(result.success).toBe(true);
    });

    it('should validate WebP image file', () => {
      const file = createMockFile('test.webp', 500 * 1024, 'image/webp');
      const request = {
        file,
        type: 'image/webp' as const,
        size: file.size,
      };

      const result = imageFileSchema.safeParse(request);

      expect(result.success).toBe(true);
    });

    it('should reject file larger than 10MB', () => {
      const file = createMockFile('large.jpg', 11 * 1024 * 1024, 'image/jpeg');
      const request = {
        file,
        type: 'image/jpeg' as const,
        size: file.size,
      };

      const result = imageFileSchema.safeParse(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toEqual(['size']);
      }
    });

    it('should reject invalid image type', () => {
      const file = createMockFile('test.gif', 1024, 'image/gif');
      const request = {
        file,
        type: 'image/gif',
        size: file.size,
      };

      const result = imageFileSchema.safeParse(request);

      expect(result.success).toBe(false);
    });

    it('should accept exactly 10MB file', () => {
      const file = createMockFile('max.jpg', 10 * 1024 * 1024, 'image/jpeg');
      const request = {
        file,
        type: 'image/jpeg' as const,
        size: file.size,
      };

      const result = imageFileSchema.safeParse(request);

      expect(result.success).toBe(true);
    });
  });

  describe('Duration Validation', () => {
    it('should accept valid duration values', () => {
      const durations = ['4', '6', '8'] as const;

      for (const duration of durations) {
        const request = {
          prompt: 'Test video',
          duration,
        };

        const result = videoGenerationSchema.safeParse(request);
        expect(result.success).toBe(true);
      }
    });

    it('should reject invalid duration', () => {
      const request = {
        prompt: 'Test video',
        duration: '10',
      };

      const result = videoGenerationSchema.safeParse(request);

      expect(result.success).toBe(false);
    });
  });

  describe('Aspect Ratio Validation', () => {
    it('should accept valid aspect ratios', () => {
      const aspectRatios = ['16:9', '9:16', '1:1'] as const;

      for (const aspectRatio of aspectRatios) {
        const request = {
          prompt: 'Test video',
          aspectRatio,
        };

        const result = videoGenerationSchema.safeParse(request);
        expect(result.success).toBe(true);
      }
    });

    it('should reject invalid aspect ratio', () => {
      const request = {
        prompt: 'Test video',
        aspectRatio: '4:3',
      };

      const result = videoGenerationSchema.safeParse(request);

      expect(result.success).toBe(false);
    });
  });

  describe('Resolution Validation', () => {
    it('should accept valid resolutions', () => {
      const resolutions = ['720p', '1080p'] as const;

      for (const resolution of resolutions) {
        const request = {
          prompt: 'Test video',
          resolution,
        };

        const result = videoGenerationSchema.safeParse(request);
        expect(result.success).toBe(true);
      }
    });

    it('should reject invalid resolution', () => {
      const request = {
        prompt: 'Test video',
        resolution: '4k',
      };

      const result = videoGenerationSchema.safeParse(request);

      expect(result.success).toBe(false);
    });
  });
});
