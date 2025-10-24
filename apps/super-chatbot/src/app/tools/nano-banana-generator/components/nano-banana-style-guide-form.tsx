// AICODE-NOTE: Form component for Nano Banana style guide queries
// Provides comprehensive controls for exploring styles and techniques

'use client';

import { useState } from 'react';
import { Button } from '@turbo-super/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@turbo-super/ui';
import { Input } from '@turbo-super/ui';
import { Label } from '@turbo-super/ui';
import { Separator } from '@turbo-super/ui';
import { Badge } from '@turbo-super/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui';
import { Switch } from '../../../../components/ui';
import { BookOpen, Search, Filter } from 'lucide-react';
import type { NanoBananaStyleGuideRequest } from '../api/nano-banana-api';

interface NanoBananaStyleGuideFormProps {
  onSearch: (request: NanoBananaStyleGuideRequest) => Promise<void>;
  isLoading: boolean;
  searchQuery: string;
  selectedCategory: string;
  selectedTechnique: string;
  selectedDifficulty: string;
  selectedTags: string[];
  onSearchQueryChange: (query: string) => void;
  onCategoryChange: (category: string) => void;
  onTechniqueChange: (technique: string) => void;
  onDifficultyChange: (difficulty: string) => void;
  onTagsChange: (tags: string[]) => void;
  onClearResults: () => void;
  onLoadAll: () => Promise<void>;
}

export function NanoBananaStyleGuideForm({
  onSearch,
  isLoading,
  searchQuery,
  selectedCategory,
  selectedTechnique,
  selectedDifficulty,
  selectedTags,
  onSearchQueryChange,
  onCategoryChange,
  onTechniqueChange,
  onDifficultyChange,
  onTagsChange,
  onClearResults,
  onLoadAll,
}: NanoBananaStyleGuideFormProps) {
  const [includeTips, setIncludeTips] = useState(true);
  const [includeExamples, setIncludeExamples] = useState(true);
  const [limit, setLimit] = useState(10);

  const categories = [
    'realistic',
    'cinematic',
    'artistic',
    'fantasy',
    'sci-fi',
    'portrait',
    'landscape',
    'macro',
  ];

  const techniques = [
    'context-aware-editing',
    'surgical-precision',
    'lighting-mastery',
    'physical-logic',
  ];

  const difficulties = ['beginner', 'intermediate', 'advanced'];

  const popularTags = [
    'golden_hour',
    'dramatic_lighting',
    'rule_of_thirds',
    'leading_lines',
    'symmetry',
    'minimalism',
    'vintage',
    'cinematic',
    'portrait',
    'landscape',
    'abstract',
    'surreal',
  ];

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const request: NanoBananaStyleGuideRequest = {
      ...(selectedCategory &&
        selectedCategory !== 'all' && { category: selectedCategory }),
      ...(selectedTechnique &&
        selectedTechnique !== 'all' && { technique: selectedTechnique }),
      ...(selectedDifficulty &&
        selectedDifficulty !== 'all' && { difficulty: selectedDifficulty }),
      ...(selectedTags.length > 0 && { tags: selectedTags }),
      ...(searchQuery.trim() && { searchQuery: searchQuery.trim() }),
      includeTips,
      includeExamples,
      limit,
    };

    await onSearch(request);
  };

  // Handle tag toggle
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  return (
    <Card className="w-full bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BookOpen className="size-5 text-primary" />
          <span className="text-foreground">Nano Banana Style Guide</span>
          <Badge
            variant="secondary"
            className="ml-auto bg-primary/10 text-primary border-primary/20"
          >
            AI-Powered
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Search Query */}
          <div className="space-y-2">
            <Label htmlFor="searchQuery" className="text-sm font-medium">
              Search Query
            </Label>
            <div className="flex space-x-2">
              <Input
                id="searchQuery"
                placeholder="Search for specific styles, techniques, or concepts..."
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={onLoadAll}
                disabled={isLoading}
              >
                <Search className="size-4 mr-2" />
                Load All
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Search for specific styles, techniques, or concepts in the style
              guide.
            </p>
          </div>

          {/* Category and Technique */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium">
                Category
              </Label>
              <Select
                value={selectedCategory || 'all'}
                onValueChange={onCategoryChange}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="technique" className="text-sm font-medium">
                Technique
              </Label>
              <Select
                value={selectedTechnique || 'all'}
                onValueChange={onTechniqueChange}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select technique" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Techniques</SelectItem>
                  {techniques.map((technique) => (
                    <SelectItem key={technique} value={technique}>
                      {technique
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Difficulty and Limit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="difficulty" className="text-sm font-medium">
                Difficulty Level
              </Label>
              <Select
                value={selectedDifficulty || 'all'}
                onValueChange={onDifficultyChange}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {difficulties.map((difficulty) => (
                    <SelectItem key={difficulty} value={difficulty}>
                      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="limit" className="text-sm font-medium">
                Results Limit
              </Label>
              <Select
                value={limit.toString()}
                onValueChange={(value) => setLimit(Number.parseInt(value))}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select limit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 results</SelectItem>
                  <SelectItem value="10">10 results</SelectItem>
                  <SelectItem value="20">20 results</SelectItem>
                  <SelectItem value="50">50 results</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Popular Tags */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Popular Tags</Label>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <Button
                  key={tag}
                  type="button"
                  variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleTag(tag)}
                  disabled={isLoading}
                  className="text-xs"
                >
                  {tag.replace(/_/g, ' ')}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Click tags to filter by specific concepts or styles.
            </p>
          </div>

          <Separator />

          {/* Display Options */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Filter className="size-4 text-muted-foreground" />
              <Label className="text-sm font-medium text-foreground">
                Display Options
              </Label>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-foreground">
                    Include Tips
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Show practical tips and techniques
                  </p>
                </div>
                <Switch
                  checked={includeTips}
                  onCheckedChange={setIncludeTips}
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-foreground">
                    Include Examples
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Show example prompts and descriptions
                  </p>
                </div>
                <Switch
                  checked={includeExamples}
                  onCheckedChange={setIncludeExamples}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Search className="size-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="size-4 mr-2" />
                  Search Styles
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={onClearResults}
              disabled={isLoading}
            >
              <Filter className="size-4 mr-2" />
              Clear
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
