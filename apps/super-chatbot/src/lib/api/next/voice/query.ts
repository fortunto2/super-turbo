import { useQuery } from "@tanstack/react-query";
import { createQueryKeys } from "@lukemorales/query-key-factory";

type Voice = { name: string; preview_url?: string | null };

export const nextVoiceKeys = createQueryKeys("next-voice", {
  list: (params: { limit?: number } = {}) => ({
    queryKey: [params],
    queryFn: async (): Promise<{ items: Voice[] }> => {
      const url = params.limit
        ? `/api/voiceover?limit=${params.limit}`
        : `/api/voiceover`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch voices: ${res.status}`);
      return res.json();
    },
  }),
});

export const useNextVoiceList = (
  params?: { limit?: number },
  options?: any
) => {
  return useQuery({
    ...nextVoiceKeys.list(params ?? {}),
    ...options,
  });
};
