import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileService } from "@turbo-super/api";
import { fileKeys } from "../query";

export const useFileGenerateAudio = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: FileService.fileGenerateAudio,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: fileKeys._def });
    },
  });
};
