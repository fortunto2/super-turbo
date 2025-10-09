import type {
  UseQueryOptions as DefaultUseQueryOptions,
  UseInfiniteQueryOptions as DefaultUseInfiniteQueryOptions,
  InfiniteData,
} from '@tanstack/react-query';

export type UseQueryOptions<TData> = Omit<
  DefaultUseQueryOptions<any, any, TData, any>,
  'queryKey' | 'queryFn'
>;

export type UseInfiniteQueryOptions<TData> = Omit<
  DefaultUseInfiniteQueryOptions<
    any,
    any,
    InfiniteData<TData, any>,
    //@ts-ignore
    InfiniteData<TData, any>,
    any
  >,
  'queryKey' | 'initialPageParam' | 'getNextPageParam'
> & {
  queryFn?: any;
};
