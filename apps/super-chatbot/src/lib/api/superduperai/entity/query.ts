import { createQueryKeys } from "@lukemorales/query-key-factory";
import { cancelableRequest } from "@/lib/utils/cancelable-request";
import {
  type IEntityRead,
  type IResponsePaginated_IEntityRead_,
  EntityService,
} from "@turbo-super/api";
import { useQuery } from "@tanstack/react-query";
import type { UseQueryOptions } from "@/lib/types/query";

export type IEntityListParams = Parameters<
  typeof EntityService.entityGetList
>[0];
export type IEntityByIdParams = Parameters<
  typeof EntityService.entityGetById
>[0];
export type IEntityListByIdsParams = Parameters<
  typeof EntityService.entityGetListByIds
>[0];

export const entityKeys = createQueryKeys("entity", {
  list: (params: IEntityListParams) => ({
    queryKey: [params],
    queryFn: cancelableRequest(() => EntityService.entityGetList(params)),
  }),
  getById: (params: IEntityByIdParams) => ({
    queryKey: [params],
    queryFn: cancelableRequest(() => EntityService.entityGetById(params)),
  }),
  getByIds: (params: IEntityListByIdsParams) => ({
    queryKey: [params],
    queryFn: cancelableRequest(() => EntityService.entityGetListByIds(params)),
  }),
});

export const useEntityList = (
  params?: IEntityListParams,
  options?: UseQueryOptions<IResponsePaginated_IEntityRead_>
) => {
  return useQuery({
    ...entityKeys.list(params ?? {}),
    ...options,
  });
};

export const useEntityListByIds = (
  params: IEntityListByIdsParams,
  options?: UseQueryOptions<IEntityRead[]>
) => {
  return useQuery({
    ...entityKeys.getByIds(params),
    ...options,
  });
};

export const useEntityGetById = (
  params: IEntityByIdParams,
  options?: UseQueryOptions<IEntityRead>
) => {
  return useQuery({
    ...entityKeys.getById(params),
    ...options,
  });
};
