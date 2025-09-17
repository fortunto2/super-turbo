import { useMutation, useQueryClient } from "@tanstack/react-query";
import { EntityService, IEntityUpdate } from "@turbo-super/api";
import { entityKeys } from "../query";

export const useEntityUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: IEntityUpdate) =>
      EntityService.entityUpdate({
        id: payload.id,
        requestBody: payload,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: entityKeys._def });
    },
  });
};
