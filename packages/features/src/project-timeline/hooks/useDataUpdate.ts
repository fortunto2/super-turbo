import React, { useState } from "react";
import type { ProjectTimelineMutationOptions } from "../types";
import type { IDataUpdate } from "@turbo-super/api";
import { DataService } from "@turbo-super/api";

export const useDataUpdate = (
  updateKeys = true,
  options?: ProjectTimelineMutationOptions
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (payload: IDataUpdate) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await DataService.dataUpdate({
        id: payload.id,
        requestBody: payload,
      });

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
