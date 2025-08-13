"use client";

import { useState, useCallback } from "react";
import { PromptEnhancementParams, EnhancementResult } from "../types";

export interface EnhancedPrompt {
  id: string;
  original: string;
  enhanced: string;
  mediaType: string;
  enhancementLevel: string;
  createdAt: string;
}

export interface UsePromptEnhancerOptions {
  onEnhance?: (params: PromptEnhancementParams) => Promise<string>;
  onError?: (error: string) => void;
  onSuccess?: (enhancedPrompt: string) => void;
}

export interface UsePromptEnhancerReturn {
  // State
  isEnhancing: boolean;
  enhancedPrompts: EnhancedPrompt[];
  currentEnhanced: string | null;

  // Actions
  enhancePrompt: (params: PromptEnhancementParams) => Promise<void>;
  clearCurrent: () => void;
  deleteEnhanced: (id: string) => void;
  clearAll: () => void;

  // Utils
  copyEnhanced: (enhancedPrompt: string) => Promise<void>;
}

export function usePromptEnhancer(
  options: UsePromptEnhancerOptions = {}
): UsePromptEnhancerReturn {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedPrompts, setEnhancedPrompts] = useState<EnhancedPrompt[]>([]);
  const [currentEnhanced, setCurrentEnhanced] = useState<string | null>(null);

  const enhancePrompt = useCallback(
    async (params: PromptEnhancementParams) => {
      if (!options.onEnhance) {
        console.warn("No onEnhance function provided to usePromptEnhancer");
        return;
      }

      try {
        setIsEnhancing(true);

        const enhanced = await options.onEnhance(params);

        const enhancedPrompt: EnhancedPrompt = {
          id: Date.now().toString(),
          original: params.originalPrompt,
          enhanced,
          mediaType: params.mediaType || "general",
          enhancementLevel: params.enhancementLevel || "detailed",
          createdAt: new Date().toISOString(),
        };

        setCurrentEnhanced(enhanced);
        setEnhancedPrompts((prev) => [enhancedPrompt, ...prev]);

        options.onSuccess?.(enhanced);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Prompt enhancement failed";
        options.onError?.(errorMessage);
      } finally {
        setIsEnhancing(false);
      }
    },
    [options]
  );

  const clearCurrent = useCallback(() => {
    setCurrentEnhanced(null);
  }, []);

  const deleteEnhanced = useCallback((id: string) => {
    setEnhancedPrompts((prev) => prev.filter((prompt) => prompt.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setEnhancedPrompts([]);
    setCurrentEnhanced(null);
  }, []);

  const copyEnhanced = useCallback(async (enhancedPrompt: string) => {
    try {
      await navigator.clipboard.writeText(enhancedPrompt);
    } catch (error) {
      console.error("Failed to copy enhanced prompt:", error);
    }
  }, []);

  return {
    isEnhancing,
    enhancedPrompts,
    currentEnhanced,
    enhancePrompt,
    clearCurrent,
    deleteEnhanced,
    clearAll,
    copyEnhanced,
  };
}
