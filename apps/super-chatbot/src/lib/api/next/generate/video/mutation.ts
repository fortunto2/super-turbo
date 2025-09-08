import { useMutation, useQueryClient } from "@tanstack/react-query";

type GenerateVideoPayload = FormData;

async function generateVideoRequest(
  formData: GenerateVideoPayload
): Promise<any> {
  const response = await fetch("/api/generate/video", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to start generation");
  }

  return response.json();
}

export const useNextGenerateVideo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: generateVideoRequest,
  });
};
