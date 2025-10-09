// AICODE-NOTE: Hook for Nano Banana style guide functionality
// Manages state for style guide queries and results

'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import {
  getNanoBananaStyleGuide,
  type NanoBananaStyleGuideRequest,
  type NanoBananaStyleInfo,
} from '../api/nano-banana-api';

export interface UseNanoBananaStyleGuideReturn {
  // Style guide state
  isLoading: boolean;
  styleInfos: NanoBananaStyleInfo[];
  currentQuery: NanoBananaStyleGuideRequest | null;
  searchQuery: string;
  selectedCategory: string;
  selectedTechnique: string;
  selectedDifficulty: string;
  selectedTags: string[];

  // Actions
  searchStyles: (request: NanoBananaStyleGuideRequest) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setSelectedTechnique: (technique: string) => void;
  setSelectedDifficulty: (difficulty: string) => void;
  setSelectedTags: (tags: string[]) => void;
  clearResults: () => void;
  loadAllStyles: () => Promise<void>;
}

export function useNanoBananaStyleGuide(): UseNanoBananaStyleGuideReturn {
  // State management
  const [styleInfos, setStyleInfos] = useState<NanoBananaStyleInfo[]>([]);
  const [currentQuery, setCurrentQuery] =
    useState<NanoBananaStyleGuideRequest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTechnique, setSelectedTechnique] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Load all styles on mount
  useEffect(() => {
    loadAllStyles();
  }, []);

  // Main search function
  const searchStyles = useCallback(
    async (request: NanoBananaStyleGuideRequest) => {
      try {
        setIsLoading(true);
        setCurrentQuery(request);

        // Call API
        const result = await getNanoBananaStyleGuide(request);

        if (!result.success) {
          throw new Error(result.error || 'Style guide search failed');
        }

        if (!result.data) {
          throw new Error('No data returned from style guide');
        }

        // Transform the result data to match NanoBananaStyleInfo[] format
        const transformedData: NanoBananaStyleInfo[] = [];

        // Add examples as style infos
        if (result.data?.examples && Array.isArray(result.data.examples)) {
          result.data.examples.forEach((example: any) => {
            transformedData.push({
              category: example.category?.id || 'unknown',
              technique: example.title || 'Unknown Technique',
              difficulty: example.difficulty || 'beginner',
              description: example.prompt || 'No description available',
              tips: result.data?.tips?.nanoBananaSpecific || [],
              examples: [example.prompt || 'No example available'],
              tags: example.tags || [],
            });
          });
        }

        // Add techniques as style infos
        if (result.data?.techniques && Array.isArray(result.data.techniques)) {
          result.data.techniques.forEach((technique: any) => {
            transformedData.push({
              category: 'technique',
              technique: technique.label || technique.id,
              difficulty: 'intermediate',
              description: technique.description || 'No description available',
              tips: technique.tips || [],
              examples: [technique.example || 'No example available'],
              tags: [technique.id],
            });
          });
        }

        // Update with transformed data
        setStyleInfos(transformedData);

        toast.success(`Found ${transformedData.length} style techniques`);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Style guide search failed';
        console.error('Nano Banana style guide error:', error);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const loadAllStyles = useCallback(async () => {
    await searchStyles({});
  }, [searchStyles]);

  const clearResults = useCallback(() => {
    setStyleInfos([]);
    setCurrentQuery(null);
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedTechnique('');
    setSelectedDifficulty('');
    setSelectedTags([]);
  }, []);

  return {
    isLoading,
    styleInfos,
    currentQuery,
    searchQuery,
    selectedCategory,
    selectedTechnique,
    selectedDifficulty,
    selectedTags,
    searchStyles,
    setSearchQuery,
    setSelectedCategory,
    setSelectedTechnique,
    setSelectedDifficulty,
    setSelectedTags,
    clearResults,
    loadAllStyles,
  };
}
