import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ProjectService } from '@turbo-super/api';
import { projectKeys } from '../../project/query';

type IProjectVideoStoryboard2Video = Parameters<
  typeof ProjectService.projectStoryboard2Video
>[0];

export const useProjectStoryboard2Video = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: IProjectVideoStoryboard2Video) =>
      ProjectService.projectStoryboard2Video(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: projectKeys._def });
    },
  });
};
