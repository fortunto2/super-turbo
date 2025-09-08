/**
 * React hook for working with SuperDuperAI models
 * Uses typed client with OpenAPI models for type safety
 */

import { useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { IGenerationConfigRead } from "@turbo-super/api";

export interface UseModelsReturn {
  // Data
  imageModels: IGenerationConfigRead[];
  videoModels: IGenerationConfigRead[];
  allModels: IGenerationConfigRead[];

  // State
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;

  // Actions
  refreshModels: () => Promise<void>;
  findModel: (name: string) => IGenerationConfigRead | undefined;
  clearCache: () => void;
}

export function useModels(): UseModelsReturn {
  const [imageModels, setImageModels] = useState<IGenerationConfigRead[]>([]);
  const [videoModels, setVideoModels] = useState<IGenerationConfigRead[]>([]);
  const [allModels, setAllModels] = useState<IGenerationConfigRead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const modelsQuery = useQuery({
    queryKey: ["models", { forceRefresh: false }],
    queryFn: async () => {
      // Предполагаем, что modelsClient доступен в области видимости
      return modelsClient.getModels(false);
    },
    staleTime: 60_000,
  });

  const loadModels = useCallback(
    async (forceRefresh = false) => {
      try {
        setIsLoading(true);
        setError(null);

        // Если нужен форс, инвалидируем и рефетчим
        if (forceRefresh) {
          await queryClient.invalidateQueries({ queryKey: ["models"] });
        }
        const response = forceRefresh
          ? await modelsClient.getModels(true)
          : await modelsQuery
              .refetch()
              .then((r) => r.data ?? modelsClient.getModels(false));

        // Приводим к единому формату
        const result = response?.data ? response : (response as any);

        setImageModels(result.data.imageModels);
        setVideoModels(result.data.videoModels);
        setAllModels(result.data.allModels);
        setLastUpdated(result.timestamp);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load models";
        setError(errorMessage);
        console.error("❌ Failed to load models:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [modelsQuery, queryClient]
  );

  const refreshModels = useCallback(async () => {
    await loadModels(true);
  }, [loadModels]);

  const findModel = useCallback(
    (name: string): IGenerationConfigRead | undefined => {
      return allModels.find((model) => model.name === name);
    },
    [allModels]
  );

  const clearCache = useCallback(() => {
    modelsClient.clearCache();
  }, []);

  // Инициализация из кэша/запроса
  useEffect(() => {
    if (modelsQuery.isLoading) {
      setIsLoading(true);
      return;
    }
    if (modelsQuery.isError) {
      const err = modelsQuery.error as Error;
      setError(err?.message || "Failed to load models");
      setIsLoading(false);
      return;
    }
    const data: any = modelsQuery.data;
    if (data?.data) {
      setImageModels(data.data.imageModels);
      setVideoModels(data.data.videoModels);
      setAllModels(data.data.allModels);
      setLastUpdated(data.timestamp ?? null);
    }
    setIsLoading(false);
  }, [
    modelsQuery.isLoading,
    modelsQuery.isError,
    modelsQuery.data,
    modelsQuery.error,
  ]);

  return {
    // Data
    imageModels,
    videoModels,
    allModels,

    // State
    isLoading,
    error,
    lastUpdated,

    // Actions
    refreshModels,
    findModel,
    clearCache,
  };
}
