import { useQuery } from "@tanstack/react-query";
import { createQueryKeys } from "@lukemorales/query-key-factory";
import { UseQueryOptions } from "../../../types/query";
import type { IFileRead } from "@turbo-super/api";

export type INextFileListParams = {
  projectId: string;
  sceneId: string;
  types: string; // comma-separated list of FileTypeEnum
};

export type INextFileGetByIdParams = {
  id: string;
};

export const nextFileKeys = createQueryKeys("next-file", {
  list: (params: INextFileListParams) => ({
    queryKey: [params],
    queryFn: async () => {
      const res = await fetch(
        `/api/file?sceneId=${params.sceneId}&projectId=${params.projectId}&types=${params.types}`
      );
      if (!res.ok) {
        throw new Error(`Failed to fetch files: ${res.status}`);
      }
      const json = await res.json();
      return json.items as IFileRead[];
    },
  }),
  getById: (params: INextFileGetByIdParams) => ({
    queryKey: [params],
    queryFn: async () => {
      const res = await fetch(`/api/file/${params.id}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch file: ${res.status}`);
      }
      return (await res.json()) as IFileRead;
    },
  }),
});

export const useNextFileList = (
  params: INextFileListParams,
  options?: UseQueryOptions<IFileRead[]>
) => {
  return useQuery({
    ...nextFileKeys.list(params),
    ...options,
  });
};

export const useNextFileGetById = (
  params: INextFileGetByIdParams,
  options?: UseQueryOptions<IFileRead>
) => {
  return useQuery({
    ...nextFileKeys.getById(params),
    ...options,
  });
};
