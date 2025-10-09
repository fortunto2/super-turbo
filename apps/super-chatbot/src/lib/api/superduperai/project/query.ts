import { createQueryKeys } from '@lukemorales/query-key-factory';
import {
  type IProjectRead,
  type IResponsePaginated_IProjectRead_,
  ProjectService,
} from '@turbo-super/api';
import { useQuery } from '@tanstack/react-query';
import type { UseQueryOptions } from '@/lib/types/query';
import { cancelableRequest } from '@/lib/utils/cancelable-request';

export type IProjectListParams = Parameters<
  typeof ProjectService.projectGetList
>[0];
export type IProjectByIdParams = Parameters<
  typeof ProjectService.projectGetById
>[0];

export const projectKeys = createQueryKeys('project', {
  list: (params: IProjectListParams) => ({
    queryKey: [params],
    queryFn: cancelableRequest(() => ProjectService.projectGetList(params)),
  }),
  getById: (params: IProjectByIdParams) => ({
    queryKey: [params],
    queryFn: cancelableRequest(() => ProjectService.projectGetById(params)),
  }),
});

export const useProjectList = (
  params?: IProjectListParams,
  options?: UseQueryOptions<IResponsePaginated_IProjectRead_>,
) => {
  return useQuery({
    ...projectKeys.list(params ?? {}),
    ...options,
  });
};

export const useProjectGetById = (
  params: IProjectByIdParams,
  options?: UseQueryOptions<IProjectRead>,
) => {
  return useQuery({
    ...projectKeys.getById(params),
    ...options,
  });
};
