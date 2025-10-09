import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fileKeys } from '../query';
import { FileService } from '@turbo-super/api';

export const useFileDelete = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: FileService.fileDelete,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: fileKeys._def });
    },
  });
};
