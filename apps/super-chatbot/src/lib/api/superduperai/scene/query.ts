import { createQueryKeys } from "@lukemorales/query-key-factory";

import { useQuery } from "@tanstack/react-query";
import { UseQueryOptions } from "../../../types/query";
import {
  IResponsePaginated_Union_ISceneRead__ISceneMinimalRead__,
  ISceneDetailedRead,
  ISceneRead,
  SceneService,
} from "@turbo-super/api";

export type ISceneListParams = Parameters<typeof SceneService.sceneGetList>[0];
export type ISceneByIdParams = Parameters<typeof SceneService.sceneGetById>[0];
export type ISceneListByIdsParams = Parameters<
  typeof SceneService.sceneGetListByIds
>[0];

export const sceneKeys = createQueryKeys("scene", {
  list: (params: ISceneListParams) => ({
    queryKey: [params],
    queryFn: SceneService.sceneGetList,
  }),
  getById: (params: ISceneByIdParams) => ({
    queryKey: [params],
    queryFn: SceneService.sceneGetById,
  }),
  getByIds: (params: ISceneListByIdsParams) => ({
    queryKey: [params],
    queryFn: SceneService.sceneGetListByIds,
  }),
});

export const useSceneList = (
  params?: ISceneListParams,
  options?: UseQueryOptions<IResponsePaginated_Union_ISceneRead__ISceneMinimalRead__>
) => {
  return useQuery({
    ...sceneKeys.list(params ?? {}),
    ...options,
  });
};

export const useSceneListByIds = (
  params: ISceneListByIdsParams,
  options?: UseQueryOptions<ISceneRead[]>
) => {
  return useQuery({
    ...sceneKeys.getByIds(params),
    ...options,
  });
};

export const useSceneGetById = (
  params: ISceneByIdParams,
  options?: UseQueryOptions<ISceneDetailedRead>
) => {
  return useQuery({
    ...sceneKeys.getById(params),
    ...options,
  });
};
