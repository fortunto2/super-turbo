import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ISceneRead, ISceneUpdate } from "@turbo-super/api";
import { nextSceneKeys } from "../query";

type UpdateScenePayload = {
  sceneId: string;
  requestBody: ISceneUpdate;
};

async function updateSceneRequest({
  sceneId,
  requestBody,
}: UpdateScenePayload): Promise<ISceneRead> {
  const response = await fetch(`/api/scene/update?sceneId=${sceneId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sceneId, requestBody }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Scene update failed: ${errText}`);
  }

  return response.json();
}

export const useNextSceneUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSceneRequest,
    onSuccess: async (updated) => {
      // Invalidate and update cache for the updated scene
      await queryClient.invalidateQueries({ queryKey: nextSceneKeys._def });
    },
  });
};
