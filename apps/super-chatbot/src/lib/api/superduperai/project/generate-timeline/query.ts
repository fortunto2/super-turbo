import type { MutationKey } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ProjectService } from '@turbo-super/api';
import { projectKeys } from '../query';

export const useGenerateTimeline = (mutationKey?: MutationKey) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKey ?? [],
    mutationFn: ProjectService.projectRegenerateTimeline,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: projectKeys._def });
    },
  });
};
