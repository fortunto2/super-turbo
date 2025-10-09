import { useMutation, useQueryClient } from '@tanstack/react-query';

type GenerateAudioPayload = {
  requestBody: {
    project_id?: string;
    scene_id?: string;
    config: any; // сервер валидирует
  };
};

async function generateAudioRequest(payload: GenerateAudioPayload) {
  const response = await fetch('/api/file/generate-audio', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Failed to generate audio');
  }
  console.log('AUDIO', response);
  return response.json();
}

export const useNextGenerateAudio = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: generateAudioRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries();
    },
  });
};
