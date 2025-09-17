import { useMutation, useQueryClient } from "@tanstack/react-query";
import { EntityService, IEntityCreate } from "@turbo-super/api";
import { entityKeys } from "../query";

export const useEntityCreate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: IEntityCreate) =>
      EntityService.entityCreate({
        requestBody: payload,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: entityKeys._def });
    },
  });
};
