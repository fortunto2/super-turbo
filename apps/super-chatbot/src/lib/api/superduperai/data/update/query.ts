import { type IDataUpdate, DataService } from "@turbo-super/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectKeys } from "../../project/query";

export const useDataUpdate = (updateKeys = true) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: IDataUpdate) =>
      DataService.dataUpdate({
        id: payload.id,
        requestBody: payload,
      }),
    onSuccess: async (data) => {
      if (!updateKeys) return;
      await queryClient.invalidateQueries({
        queryKey: projectKeys.getById({ id: data.project_id }).queryKey,
      });
    },
  });
};
