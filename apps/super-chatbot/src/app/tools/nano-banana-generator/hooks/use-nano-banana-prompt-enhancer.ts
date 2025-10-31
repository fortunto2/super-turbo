// AICODE-NOTE: Hook for Nano Banana prompt enhancement functionality
// Manages state for prompt enhancement operations and results

'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  enhanceNanoBananaPrompt,
  type NanoBananaPromptEnhancementRequest,
  type NanoBananaEnhancedPrompt,
} from '../api/nano-banana-api';

export interface UseNanoBananaPromptEnhancerReturn {
  // Enhancement state
  isEnhancing: boolean;
  enhancedPrompts: NanoBananaEnhancedPrompt[];
  currentEnhancement: NanoBananaEnhancedPrompt | null;

  // Actions
  enhancePrompt: (request: NanoBananaPromptEnhancementRequest) => Promise<void>;
  clearCurrentEnhancement: () => void;
  clearAllEnhancements: () => void;
  copyEnhancedPrompt: (
    enhancedPrompt: NanoBananaEnhancedPrompt,
  ) => Promise<void>;
}

export function useNanoBananaPromptEnhancer(): UseNanoBananaPromptEnhancerReturn {
  // State management
  const [enhancedPrompts, setEnhancedPrompts] = useState<
    NanoBananaEnhancedPrompt[]
  >([]);
  const [currentEnhancement, setCurrentEnhancement] =
    useState<NanoBananaEnhancedPrompt | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);

  // Main enhancement function
  const enhancePrompt = useCallback(
    async (request: NanoBananaPromptEnhancementRequest) => {
      try {
        setIsEnhancing(true);

        // Call API
        const result = await enhanceNanoBananaPrompt(request);

        if (!result.success) {
          throw new Error(result.error || 'Enhancement failed');
        }

        if (!result.data) {
          throw new Error('No data returned from enhancement');
        }

        // Store data in a variable after null check
        const enhancedData = result.data;

        // Update with result
        setCurrentEnhancement(enhancedData);
        setEnhancedPrompts((prev) => [enhancedData, ...prev]);

        toast.success('Prompt enhanced successfully!');
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Prompt enhancement failed';
        console.error('Nano Banana prompt enhancement error:', error);
        toast.error(message);
      } finally {
        setIsEnhancing(false);
      }
    },
    [],
  );

  const clearCurrentEnhancement = useCallback(() => {
    setCurrentEnhancement(null);
  }, []);

  const clearAllEnhancements = useCallback(() => {
    setEnhancedPrompts([]);
    setCurrentEnhancement(null);
    toast.success('All enhancements cleared');
  }, []);

  const copyEnhancedPrompt = useCallback(
    async (enhancedPrompt: NanoBananaEnhancedPrompt) => {
      try {
        await navigator.clipboard.writeText(enhancedPrompt.enhancedPrompt);
        toast.success('Enhanced prompt copied to clipboard');
      } catch (error) {
        toast.error('Failed to copy enhanced prompt');
      }
    },
    [],
  );

  return {
    isEnhancing,
    enhancedPrompts,
    currentEnhancement,
    enhancePrompt,
    clearCurrentEnhancement,
    clearAllEnhancements,
    copyEnhancedPrompt,
  };
}
