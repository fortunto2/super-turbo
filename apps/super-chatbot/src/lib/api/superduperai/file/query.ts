import type { UseQueryOptions } from '@/lib/types/query';
import { cancelableRequest } from '@/lib/utils/cancelable-request';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import { useQuery } from '@tanstack/react-query';
import {
  FileService,
  type IFileRead,
  type IResponsePaginated_IFileRead_,
} from '@turbo-super/api';

export type IFileListParams = Parameters<typeof FileService.fileGetList>[0];
export type IFileByIdParams = Parameters<typeof FileService.fileGetById>[0];

export const fileKeys = createQueryKeys('file', {
  list: (params: IFileListParams) => ({
    queryKey: [params],
    queryFn: cancelableRequest(() => FileService.fileGetList(params)),
  }),
  getById: (params: IFileByIdParams) => ({
    queryKey: [params],
    queryFn: cancelableRequest(() => FileService.fileGetById(params)),
  }),
});

export const useFileList = (
  params?: IFileListParams,
  options?: UseQueryOptions<IResponsePaginated_IFileRead_>,
) => {
  return useQuery({
    ...fileKeys.list(params ?? {}),
    ...options,
  });
};

export const useFileById = (
  params: IFileByIdParams,
  options?: UseQueryOptions<IFileRead>,
) => {
  return useQuery({
    ...fileKeys.getById(params),
    ...options,
  });
};
