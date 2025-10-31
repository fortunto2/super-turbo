import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/generate/image/route';
import { auth } from '@/app/(auth)/auth';
import { getSuperduperAIConfigWithUserToken } from '@/lib/config/superduperai';
import { generateImageWithStrategy } from '@turbo-super/api';
import { selectImageToImageModel } from '@/lib/generation/model-utils';
import { validateOperationBalance } from '@/lib/utils/tools-balance';

// Mock dependencies
// NOTE: DO NOT mock @/app/(auth)/auth here - it will be auto-loaded and use the
// mocked NextAuth from setup.ts. We'll configure the mock in beforeEach.
vi.mock('@/lib/config/superduperai');
vi.mock('@turbo-super/api');
vi.mock('@/lib/generation/model-utils', () => ({
  selectImageToImageModel: vi.fn(),
  ensureNonEmptyPrompt: vi.fn((input, fallback) => {
    const str = typeof input === 'string' ? input.trim() : '';
    return str.length > 0 ? str : fallback;
  }),
}));
vi.mock('@/lib/utils/tools-balance');
vi.mock('@/lib/monitoring/simple-monitor', () => ({
  withMonitoring: (fn: any) => fn,
}));

describe('/api/generate/image/route', () => {
  const mockSession = {
    user: { id: 'test-user', email: 'test@example.com' },
  };

  const mockConfig = {
    url: 'https://api.example.com',
    token: 'test-token',
    wsURL: 'wss://api.example.com',
    isUserToken: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // auth is a real vi.fn() created by the mocked NextAuth in setup.ts
    (auth as any).mockResolvedValue(mockSession);
    vi.mocked(getSuperduperAIConfigWithUserToken).mockReturnValue(mockConfig);
    vi.mocked(validateOperationBalance).mockResolvedValue({
      valid: true,
      cost: 10,
    });
  });

  it('should return 401 for unauthenticated requests', async () => {
    (auth as any).mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/generate/image', {
      method: 'POST',
      body: JSON.stringify({
        prompt: 'A beautiful sunset',
        generationType: 'text-to-image',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should handle text-to-image generation', async () => {
    const mockResult = {
      success: true,
      data: { id: 'test-image-id' },
    };

    vi.mocked(generateImageWithStrategy).mockResolvedValue(mockResult);

    const request = new NextRequest('http://localhost/api/generate/image', {
      method: 'POST',
      body: JSON.stringify({
        prompt: 'A beautiful sunset over mountains',
        generationType: 'text-to-image',
        style: 'realistic',
        resolution: '1024x1024',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(generateImageWithStrategy).toHaveBeenCalledWith(
      'text-to-image',
      expect.objectContaining({
        prompt: 'A beautiful sunset over mountains',
        generationType: 'text-to-image',
        style: 'realistic',
        resolution: '1024x1024',
      }),
      mockConfig,
    );
  });

  it('should handle image-to-image generation', async () => {
    const mockResult = {
      success: true,
      data: { id: 'test-image-id' },
    };

    vi.mocked(selectImageToImageModel).mockResolvedValue('comfyui/flux');
    vi.mocked(generateImageWithStrategy).mockResolvedValue(mockResult);

    const request = new NextRequest('http://localhost/api/generate/image', {
      method: 'POST',
      body: JSON.stringify({
        prompt: 'Transform this image into a watercolor painting',
        generationType: 'image-to-image',
        sourceImage: 'data:image/jpeg;base64,test',
        model: 'flux',
        style: 'watercolor',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(selectImageToImageModel).toHaveBeenCalledWith(
      'flux',
      expect.any(Function),
      { allowInpainting: false },
    );
    expect(generateImageWithStrategy).toHaveBeenCalledWith(
      'image-to-image',
      expect.objectContaining({
        prompt: 'Transform this image into a watercolor painting',
        generationType: 'image-to-image',
        sourceImage: 'data:image/jpeg;base64,test',
        model: { name: 'comfyui/flux' },
      }),
      mockConfig,
    );
  });

  it('should handle inpainting generation', async () => {
    const mockResult = {
      success: true,
      data: { id: 'test-image-id' },
    };

    vi.mocked(selectImageToImageModel).mockResolvedValue(
      'comfyui/flux-inpaint',
    );
    vi.mocked(generateImageWithStrategy).mockResolvedValue(mockResult);

    const request = new NextRequest('http://localhost/api/generate/image', {
      method: 'POST',
      body: JSON.stringify({
        prompt: 'A beautiful sunset over mountains',
        generationType: 'image-to-image',
        editingMode: 'inpainting',
        mask: 'data:image/png;base64,test',
        sourceImage: 'data:image/jpeg;base64,test',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(selectImageToImageModel).toHaveBeenCalledWith(
      '',
      expect.any(Function),
      { allowInpainting: true },
    );
  });

  it('should handle multipart form data', async () => {
    const mockResult = {
      success: true,
      data: { id: 'test-image-id' },
    };

    vi.mocked(generateImageWithStrategy).mockResolvedValue(mockResult);

    const formData = new FormData();
    formData.append('prompt', 'A beautiful sunset over mountains');
    formData.append('generationType', 'text-to-image');
    formData.append('style', 'realistic');

    const request = new NextRequest('http://localhost/api/generate/image', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    // Multipart processing wraps style in an object for consistency with JSON path
    expect(generateImageWithStrategy).toHaveBeenCalled();
    const callArgs = vi.mocked(generateImageWithStrategy).mock.calls[0];
    expect(callArgs?.[0]).toBe('text-to-image');
    expect(callArgs?.[1]).toMatchObject({
      prompt: 'A beautiful sunset over mountains',
      generationType: 'text-to-image',
    });
  });

  it('should handle generation failure', async () => {
    const mockResult = {
      success: false,
      error: 'Generation failed',
    };

    vi.mocked(generateImageWithStrategy).mockResolvedValue(mockResult);

    const request = new NextRequest('http://localhost/api/generate/image', {
      method: 'POST',
      body: JSON.stringify({
        prompt: 'A beautiful sunset over mountains',
        generationType: 'text-to-image',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Generation failed');
  });

  it('should handle balance validation failure', async () => {
    vi.mocked(validateOperationBalance).mockResolvedValue({
      valid: false,
      error: 'Insufficient balance',
    });

    const request = new NextRequest('http://localhost/api/generate/image', {
      method: 'POST',
      body: JSON.stringify({
        prompt: 'A beautiful sunset over mountains',
        generationType: 'text-to-image',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(402);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Insufficient balance');
  });

  it('should handle invalid JSON', async () => {
    const request = new NextRequest('http://localhost/api/generate/image', {
      method: 'POST',
      body: 'invalid json',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBeDefined();
  });

  it('should handle missing prompt', async () => {
    const mockResult = {
      success: true,
      data: { id: 'test-image-id' },
    };

    vi.mocked(generateImageWithStrategy).mockResolvedValue(mockResult);

    const request = new NextRequest('http://localhost/api/generate/image', {
      method: 'POST',
      body: JSON.stringify({
        generationType: 'text-to-image',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    // Route uses ensureNonEmptyPrompt which provides fallback, so this should succeed
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should handle model selection failure gracefully', async () => {
    vi.mocked(selectImageToImageModel).mockRejectedValue(
      new Error('Model selection failed'),
    );

    const request = new NextRequest('http://localhost/api/generate/image', {
      method: 'POST',
      body: JSON.stringify({
        prompt: 'Transform this image',
        generationType: 'image-to-image',
        model: 'invalid-model',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    // When model selection fails, catch block logs warning but doesn't set result, causing 500
    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
  });
});
