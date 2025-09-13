import type { MutationKey } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectKeys } from "../../project/query";
import { sceneKeys } from "../../scene/query";
import { ProjectService } from "@turbo-super/api";

type IProjectVideoScript2Storyboard = Parameters<
  typeof ProjectService.projectScript2Storyboard
>[0];

export const useProjectScript2Storyboard = (mutationKey?: MutationKey) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey,
    mutationFn: (payload: IProjectVideoScript2Storyboard) =>
      ProjectService.projectScript2Storyboard(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: projectKeys._def });
      await queryClient.invalidateQueries({ queryKey: sceneKeys._def });
    },
  });
};
