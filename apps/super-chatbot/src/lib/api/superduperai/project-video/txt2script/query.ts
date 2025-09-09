import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ProjectService } from "@turbo-super/api";
import { projectKeys } from "../../project/query";

type IProjectTxt2Script = Parameters<
  typeof ProjectService.projectTxt2Script
>[0];

export const useProjectTxt2Script = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: IProjectTxt2Script) =>
      ProjectService.projectTxt2Script(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: projectKeys._def });
    },
  });
};
