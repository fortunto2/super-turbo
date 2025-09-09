import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileService } from "@turbo-super/api";
import { fileKeys } from "../query";

export const useFileGenerateImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: FileService.fileGenerateImage,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: fileKeys._def });
    },
  });
};
