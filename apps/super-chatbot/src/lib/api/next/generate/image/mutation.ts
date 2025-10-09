import { useMutation } from '@tanstack/react-query';
import { API_NEXT_ROUTES } from '@/lib/config/next-api-routes';

type GenerateImagePayload = FormData;

async function generateImageRequest(
  formData: GenerateImagePayload,
): Promise<any> {
  const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/${API_NEXT_ROUTES.GENERATE_IMAGE}`;
  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Failed to generate image');
  }

  return response.json();
}

export const useNextGenerateImage = () => {
  return useMutation({
    mutationFn: generateImageRequest,
  });
};
