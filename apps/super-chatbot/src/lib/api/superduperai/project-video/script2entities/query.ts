import type { MutationKey } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ProjectService } from "@turbo-super/api";
import { projectKeys } from "../../project/query";
import { entityKeys } from "../../entity";

type IProjectVideoScript2Entities = Parameters<
  typeof ProjectService.projectScript2Entities
>[0];

export const useProjectVideoScript2Entities = (mutationKey?: MutationKey) => {
  const queryClient = useQueryClient();
  return useMutation({
    ...(mutationKey && { mutationKey }),
    mutationFn: (payload: IProjectVideoScript2Entities) =>
      ProjectService.projectScript2Entities(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: projectKeys._def });
      await queryClient.invalidateQueries({ queryKey: entityKeys._def });
    },
  });
};
