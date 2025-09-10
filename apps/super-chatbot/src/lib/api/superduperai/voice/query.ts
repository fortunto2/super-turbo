import { createQueryKeys } from "@lukemorales/query-key-factory";
import { type IResponsePaginated_IVoiceRead_, VoiceService } from "@turbo-super/api";
import { useQuery } from "@tanstack/react-query";
import { cancelableRequest } from "@/lib/utils/cancelable-request";
import type { UseQueryOptions } from "@/lib/types/query";

export type IVoiceListParams = Parameters<typeof VoiceService.voiceGetList>[0];

export const voiceKeys = createQueryKeys("voice", {
  list: (params: IVoiceListParams) => ({
    queryKey: [params],
    queryFn: cancelableRequest(() => VoiceService.voiceGetList(params)),
  }),
});

export const useVoiceList = (
  params?: IVoiceListParams,
  options?: UseQueryOptions<IResponsePaginated_IVoiceRead_>
) => {
  return useQuery({
    ...voiceKeys.list(params ?? {}),
    ...options,
  });
};
