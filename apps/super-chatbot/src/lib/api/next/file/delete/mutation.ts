import { useMutation, useQueryClient } from "@tanstack/react-query";
import { nextFileKeys } from "../query";

type DeleteFilePayload = {
  id: string;
};

async function deleteFileRequest({ id }: DeleteFilePayload): Promise<void> {
  const response = await fetch("/api/file/delete", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });

  if (!response.ok) {
    throw new Error("Failed to delete file");
  }
}

export const useNextFileDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFileRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: nextFileKeys._def });
    },
  });
};
