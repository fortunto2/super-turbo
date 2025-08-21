import React, { useState } from "react";
import type { ProjectTimelineMutationOptions } from "../types";
import { ProjectService } from "@turbo-super/api";

export const useProjectTimeline2Video = (
  options?: ProjectTimelineMutationOptions
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (data: any) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await ProjectService.projectTimeline2Video(data);

      if (options?.onSuccess) {
        options.onSuccess(result);
      }

      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);

      if (options?.onError) {
        options.onError(error);
      }

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    mutate,
    isLoading,
    error,
  };
};
