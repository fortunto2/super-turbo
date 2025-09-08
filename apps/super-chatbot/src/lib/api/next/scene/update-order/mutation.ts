import { useMutation, useQueryClient } from "@tanstack/react-query";
import { nextSceneKeys } from "../query";

type UpdateOrderPayload = {
  sceneId: string; // current route sceneId
  id: string; // target scene id
  order: number;
};

async function updateOrderRequest({
  sceneId,
  id,
  order,
}: UpdateOrderPayload): Promise<void> {
  const response = await fetch(`/api/scene/update-order?sceneId=${sceneId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, requestBody: { id, order } }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Scene update failed: ${errText}`);
  }
}

export const useNextSceneUpdateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateOrderRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: nextSceneKeys._def });
    },
  });
};
