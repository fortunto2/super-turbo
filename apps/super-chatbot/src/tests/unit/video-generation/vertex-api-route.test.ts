import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

function createValidBase64DataUrl(): string {
  return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA';
}

function extractBase64FromDataUrl(dataUrl: string): string {
  const base64Match = dataUrl.match(/^data:image\/[^;]+;base64,(.+)$/);
  if (base64Match) {
    return base64Match[1] || '';
  }
  return dataUrl;
}

function createMockSession() {
  return {
    user: {
      id: 'test-user-123',
      email: 'test@example.com',
      name: 'Test User',
    },
  };
}

function createMockBalanceValidation(valid = true) {
  return {
    valid,
    cost: 100,
    currentBalance: 1000,
    remainingBalance: 900,
  };
}

vi.mock('@/app/(auth)/auth');
vi.mock('@/lib/utils/tools-balance');

describe('Vertex AI Video Generation Route - Image-to-Video', () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    const { auth } = await import('@/app/(auth)/auth');
    const { validateOperationBalance, deductOperationBalance } = await import(
      '@/lib/utils/tools-balance'
    );

    vi.mocked(auth).mockResolvedValue(createMockSession());
    vi.mocked(validateOperationBalance).mockResolvedValue(
      createMockBalanceValidation(),
    );
    vi.mocked(deductOperationBalance).mockResolvedValue(undefined);

    process.env.GOOGLE_AI_API_KEY = 'test-api-key-12345';
  });

  describe('Base64 Extraction Helper', () => {
    it('should extract base64 from data URL', () => {
      const dataUrl = createValidBase64DataUrl();
      const base64 = extractBase64FromDataUrl(dataUrl);

      expect(base64).not.toContain('data:image/jpeg;base64,');
      expect(base64.length).toBeGreaterThan(0);
    });

    it('should handle JPEG data URL', () => {
      const dataUrl = 'data:image/jpeg;base64,abc123';
      const base64 = extractBase64FromDataUrl(dataUrl);

      expect(base64).toBe('abc123');
    });

    it('should handle PNG data URL', () => {
      const dataUrl = 'data:image/png;base64,xyz789';
      const base64 = extractBase64FromDataUrl(dataUrl);

      expect(base64).toBe('xyz789');
    });

    it('should handle WebP data URL', () => {
      const dataUrl = 'data:image/webp;base64,def456';
      const base64 = extractBase64FromDataUrl(dataUrl);

      expect(base64).toBe('def456');
    });

    it('should return original string if not data URL', () => {
      const url = 'https://example.com/image.jpg';
      const result = extractBase64FromDataUrl(url);

      expect(result).toBe(url);
    });

    it('should return base64 string if already extracted', () => {
      const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const result = extractBase64FromDataUrl(base64);

      expect(result).toBe(base64);
    });
  });

  describe('Request Validation with Image', () => {
    it('should accept request with sourceImageUrl', async () => {
      const request = new NextRequest('http://localhost/api/video/generate-vertex', {
        method: 'POST',
        body: JSON.stringify({
          prompt: 'Animate this image',
          sourceImageUrl: createValidBase64DataUrl(),
          duration: '8',
          aspectRatio: '16:9',
          resolution: '720p',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const { POST } = await import('@/app/api/video/generate-vertex/route');

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ name: 'test-operation' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should validate sourceImageUrl is a string', async () => {
      const request = new NextRequest('http://localhost/api/video/generate-vertex', {
        method: 'POST',
        body: JSON.stringify({
          prompt: 'Animate this',
          sourceImageUrl: 12345,
          duration: '8',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const { POST } = await import('@/app/api/video/generate-vertex/route');
      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should allow sourceImageUrl to be optional', async () => {
      const request = new NextRequest('http://localhost/api/video/generate-vertex', {
        method: 'POST',
        body: JSON.stringify({
          prompt: 'A beautiful sunset',
          duration: '8',
          aspectRatio: '16:9',
          resolution: '720p',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const { POST } = await import('@/app/api/video/generate-vertex/route');

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ name: 'text-to-video-operation' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe('Vertex AI Payload Construction', () => {
    it('should include image field when sourceImageUrl is provided', async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ name: 'operation-with-image' }),
      });
      global.fetch = mockFetch;

      const request = new NextRequest('http://localhost/api/video/generate-vertex', {
        method: 'POST',
        body: JSON.stringify({
          prompt: 'Pan camera left',
          sourceImageUrl: createValidBase64DataUrl(),
          duration: '8',
          aspectRatio: '16:9',
          resolution: '720p',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const { POST } = await import('@/app/api/video/generate-vertex/route');
      await POST(request);

      expect(mockFetch).toHaveBeenCalled();
      const fetchCall = mockFetch.mock.calls[0];
      const payload = JSON.parse(fetchCall?.[1]?.body as string);

      expect(payload.instances[0]).toHaveProperty('image');
      expect(payload.instances[0]?.image).toHaveProperty('bytesBase64Encoded');
    });

    it('should extract base64 from data URL for Vertex AI', async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ name: 'operation' }),
      });
      global.fetch = mockFetch;

      const dataUrl = createValidBase64DataUrl();
      const request = new NextRequest('http://localhost/api/video/generate-vertex', {
        method: 'POST',
        body: JSON.stringify({
          prompt: 'Animate',
          sourceImageUrl: dataUrl,
          duration: '8',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const { POST } = await import('@/app/api/video/generate-vertex/route');
      await POST(request);

      const fetchCall = mockFetch.mock.calls[0];
      const payload = JSON.parse(fetchCall?.[1]?.body as string);
      const base64 = payload.instances[0]?.image?.bytesBase64Encoded;

      expect(base64).toBeDefined();
      expect(base64).not.toContain('data:image');
      expect(base64).not.toContain('base64,');
    });

    it('should not include image field when sourceImageUrl is absent', async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ name: 'text-operation' }),
      });
      global.fetch = mockFetch;

      const request = new NextRequest('http://localhost/api/video/generate-vertex', {
        method: 'POST',
        body: JSON.stringify({
          prompt: 'A sunset',
          duration: '8',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const { POST } = await import('@/app/api/video/generate-vertex/route');
      await POST(request);

      const fetchCall = mockFetch.mock.calls[0];
      const payload = JSON.parse(fetchCall?.[1]?.body as string);

      expect(payload.instances[0]?.image).toBeUndefined();
    });

    it('should include both prompt and image in payload', async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ name: 'combined-operation' }),
      });
      global.fetch = mockFetch;

      const request = new NextRequest('http://localhost/api/video/generate-vertex', {
        method: 'POST',
        body: JSON.stringify({
          prompt: 'Camera pans slowly',
          sourceImageUrl: createValidBase64DataUrl(),
          duration: '6',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const { POST } = await import('@/app/api/video/generate-vertex/route');
      await POST(request);

      const fetchCall = mockFetch.mock.calls[0];
      const payload = JSON.parse(fetchCall?.[1]?.body as string);

      expect(payload.instances[0]?.prompt).toBe('Camera pans slowly');
      expect(payload.instances[0]?.image).toBeDefined();
    });
  });

  describe('Balance Calculation for Image-to-Video', () => {
    it('should use image-to-video generation type when sourceImageUrl provided', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ name: 'operation' }),
      });

      const request = new NextRequest('http://localhost/api/video/generate-vertex', {
        method: 'POST',
        body: JSON.stringify({
          prompt: 'Animate',
          sourceImageUrl: createValidBase64DataUrl(),
          duration: '8',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const { POST } = await import('@/app/api/video/generate-vertex/route');
      const { validateOperationBalance } = await import('@/lib/utils/tools-balance');

      await POST(request);

      expect(validateOperationBalance).toHaveBeenCalledWith(
        'test-user-123',
        'video-generation',
        'image-to-video',
        expect.any(Array),
      );
    });

    it('should use text-to-video generation type when sourceImageUrl absent', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ name: 'operation' }),
      });

      const request = new NextRequest('http://localhost/api/video/generate-vertex', {
        method: 'POST',
        body: JSON.stringify({
          prompt: 'A sunset',
          duration: '8',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const { POST } = await import('@/app/api/video/generate-vertex/route');
      const { validateOperationBalance } = await import('@/lib/utils/tools-balance');

      await POST(request);

      expect(validateOperationBalance).toHaveBeenCalledWith(
        'test-user-123',
        'video-generation',
        'text-to-video',
        expect.any(Array),
      );
    });

    it('should deduct balance with image-to-video metadata', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ name: 'operation-img2vid' }),
      });

      const request = new NextRequest('http://localhost/api/video/generate-vertex', {
        method: 'POST',
        body: JSON.stringify({
          prompt: 'Animate this image',
          sourceImageUrl: createValidBase64DataUrl(),
          duration: '8',
          resolution: '1080p',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const { POST } = await import('@/app/api/video/generate-vertex/route');
      const { deductOperationBalance } = await import('@/lib/utils/tools-balance');

      await POST(request);

      expect(deductOperationBalance).toHaveBeenCalledWith(
        'test-user-123',
        'video-generation',
        'image-to-video',
        expect.any(Array),
        expect.objectContaining({
          operationType: 'image-to-video',
        }),
      );
    });
  });

  describe('Error Handling', () => {
    it('should return 401 for unauthenticated requests', async () => {
      const { auth } = await import('@/app/(auth)/auth');
      vi.mocked(auth).mockResolvedValueOnce(null);

      const request = new NextRequest('http://localhost/api/video/generate-vertex', {
        method: 'POST',
        body: JSON.stringify({
          prompt: 'Test',
          sourceImageUrl: createValidBase64DataUrl(),
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const { POST } = await import('@/app/api/video/generate-vertex/route');
      const response = await POST(request);

      expect(response.status).toBe(401);
    });

    it('should return 402 when balance is insufficient', async () => {
      const { validateOperationBalance } = await import('@/lib/utils/tools-balance');
      vi.mocked(validateOperationBalance).mockResolvedValueOnce({
        valid: false,
        cost: 100,
        currentBalance: 50,
        remainingBalance: -50,
        error: 'Insufficient balance',
      });

      const request = new NextRequest('http://localhost/api/video/generate-vertex', {
        method: 'POST',
        body: JSON.stringify({
          prompt: 'Animate',
          sourceImageUrl: createValidBase64DataUrl(),
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const { POST } = await import('@/app/api/video/generate-vertex/route');
      const response = await POST(request);

      expect(response.status).toBe(402);
    });

    it('should handle malformed base64 data gracefully', async () => {
      const request = new NextRequest('http://localhost/api/video/generate-vertex', {
        method: 'POST',
        body: JSON.stringify({
          prompt: 'Animate',
          sourceImageUrl: 'data:image/jpeg;base64,!!!invalid!!!',
          duration: '8',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () =>
          JSON.stringify({ error: 'Invalid base64 image data' }),
      });

      const { POST } = await import('@/app/api/video/generate-vertex/route');
      const response = await POST(request);

      expect(response.status).toBe(400);
    });
  });

  describe('Integration with Different Parameters', () => {
    it('should work with all parameters combined', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ name: 'full-params-operation' }),
      });

      const request = new NextRequest('http://localhost/api/video/generate-vertex', {
        method: 'POST',
        body: JSON.stringify({
          prompt: 'Camera pans left slowly',
          sourceImageUrl: createValidBase64DataUrl(),
          duration: '6',
          aspectRatio: '9:16',
          resolution: '1080p',
          negativePrompt: 'blurry, distorted',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const { POST } = await import('@/app/api/video/generate-vertex/route');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});
