import { useQuery } from "@tanstack/react-query";
import { createQueryKeys } from "@lukemorales/query-key-factory";
import { UseQueryOptions } from "../../../types/query";
import type { ISceneRead } from "@turbo-super/api";

// Next API based scene queries (proxy on Next server)

export type INextSceneGetByIdParams = {
  sceneId: string;
};

export const nextSceneKeys = createQueryKeys("next-scene", {
  listByProject: (params: { projectId: string }) => ({
    queryKey: ["list", params],
    queryFn: async () => {
      const res = await fetch(
        `/api/story-editor/scenes?projectId=${params.projectId}`
      );
      if (!res.ok) {
        throw new Error(`Failed to fetch scenes: ${res.status}`);
      }
      const json = await res.json();
      if (!json?.success || !Array.isArray(json?.scenes)) {
        throw new Error(json?.error || "Failed to load scenes");
      }
      return json.scenes as ISceneRead[];
    },
  }),
  getById: (params: INextSceneGetByIdParams) => ({
    queryKey: [params],
    // Using fetch towards Next route to avoid CORS issues
    queryFn: async () => {
      const res = await fetch(
        `/api/story-editor/scene?sceneId=${params.sceneId}`
      );
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Scene not found");
        }
        throw new Error(`HTTP ${res.status}`);
      }
      const json = await res.json();
      if (!json?.success || !json?.scene) {
        throw new Error(json?.error || "Failed to load scene");
      }
      return json.scene as ISceneRead;
    },
  }),
});

export const useNextScenesListByProject = (
  params: { projectId: string },
  options?: UseQueryOptions<ISceneRead[]>
) => {
  return useQuery({
    ...nextSceneKeys.listByProject(params),
    ...options,
  });
};

export const useNextSceneGetById = (
  params: INextSceneGetByIdParams,
  options?: UseQueryOptions<ISceneRead>
) => {
  return useQuery({
    ...nextSceneKeys.getById(params),
    ...options,
  });
};
