import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ProjectService } from "@turbo-super/api";
import { projectKeys } from "../../project/query";

export const useProjectTimeline2Video = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ProjectService.projectTimeline2Video,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: projectKeys._def });
    },
  });
};
