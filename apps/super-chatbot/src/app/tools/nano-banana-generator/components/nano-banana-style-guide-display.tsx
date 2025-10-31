// AICODE-NOTE: Component for displaying style guide results
// Shows style information, tips, examples, and techniques

'use client';

import { useState } from 'react';
import { Button } from '@turbo-super/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@turbo-super/ui';
import { Badge } from '@turbo-super/ui';
import { BookOpen, Lightbulb, Star, Tag, Eye, Search } from 'lucide-react';
import type { NanoBananaStyleInfo } from '../api/nano-banana-api';

interface NanoBananaStyleGuideDisplayProps {
  styleInfos: NanoBananaStyleInfo[];
  isLoading: boolean;
  currentQuery: any;
}

export function NanoBananaStyleGuideDisplay({
  styleInfos,
  isLoading,
  currentQuery,
}: NanoBananaStyleGuideDisplayProps) {
  const [selectedStyle, setSelectedStyle] =
    useState<NanoBananaStyleInfo | null>(null);

  const getDifficultyBadgeColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      beginner:
        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      intermediate:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      advanced:
        'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    };
    return (
      colors[difficulty] ||
      'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    );
  };

  const getCategoryBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      realistic:
        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      cinematic: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      artistic:
        'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      fantasy:
        'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
      'sci-fi':
        'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
      portrait:
        'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
      landscape:
        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      macro:
        'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    };
    return (
      colors[category] ||
      'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    );
  };

  if (isLoading) {
    return (
      <Card className="w-full bg-card border-border">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
          <h3 className="text-base font-medium text-foreground mb-1">
            Loading Style Guide...
          </h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Fetching the latest styles and techniques from Nano Banana.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (styleInfos.length === 0) {
    return (
      <Card className="w-full bg-card border-border">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BookOpen className="size-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-base font-medium text-foreground mb-1">
            No Styles Found
          </h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Try adjusting your search criteria or load all styles to explore the
            complete guide.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BookOpen className="size-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">
            Style Guide Results
          </h2>
          <Badge
            variant="secondary"
            className="bg-primary/10 text-primary border-primary/20"
          >
            {styleInfos.length}
          </Badge>
        </div>
        {currentQuery && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Search className="size-4" />
            <span>Filtered results</span>
          </div>
        )}
      </div>

      {/* Styles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {styleInfos?.map((styleInfo, index) => (
          <Card
            key={index}
            className="group bg-card border-border hover:shadow-lg hover:border-primary/20 transition-all duration-200"
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-sm text-foreground line-clamp-2 leading-tight">
                  {styleInfo.technique}
                </CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  className="ml-2 flex-shrink-0 hover:bg-primary/10 hover:border-primary/30 h-6 w-6 p-0"
                  onClick={() => setSelectedStyle(styleInfo)}
                >
                  <Eye className="size-3" />
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-1 mt-1">
                <Badge
                  className={`text-xs px-1 py-0 ${getCategoryBadgeColor(styleInfo.category)}`}
                >
                  {styleInfo.category.replace(/_/g, ' ')}
                </Badge>
                <Badge
                  className={`text-xs px-1 py-0 ${getDifficultyBadgeColor(styleInfo.difficulty)}`}
                >
                  {styleInfo.difficulty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              {/* Description */}
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {styleInfo.description}
              </p>

              {/* Tags */}
              {styleInfo.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {styleInfo.tags.slice(0, 2).map((tag, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="text-xs px-1 py-0 border-border/50 hover:border-primary/30"
                    >
                      {tag}
                    </Badge>
                  ))}
                  {styleInfo.tags.length > 2 && (
                    <Badge
                      variant="outline"
                      className="text-xs px-1 py-0 border-border/50 hover:border-primary/30"
                    >
                      +{styleInfo.tags.length - 2}
                    </Badge>
                  )}
                </div>
              )}

              {/* Tips Preview */}
              {styleInfo.tips.length > 0 && (
                <div className="bg-muted/30 rounded p-1">
                  <h4 className="text-xs font-medium text-foreground mb-1 flex items-center">
                    <Lightbulb className="size-2 mr-1 text-yellow-500" />
                    Tips:
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-1 leading-relaxed">
                    {styleInfo.tips[0]}
                  </p>
                </div>
              )}

              {/* Examples Preview */}
              {styleInfo.examples.length > 0 && (
                <div className="bg-muted/30 rounded p-1">
                  <h4 className="text-xs font-medium text-foreground mb-1 flex items-center">
                    <Star className="size-2 mr-1 text-blue-500" />
                    Examples:
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-1 leading-relaxed">
                    {styleInfo.examples[0]}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Style Detail Modal */}
      {selectedStyle && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">
                {selectedStyle.technique}
              </h3>
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-primary/10 hover:border-primary/30"
                onClick={() => setSelectedStyle(null)}
              >
                Close
              </Button>
            </div>
            <div className="p-4 max-h-[70vh] overflow-y-auto">
              <div className="space-y-6">
                {/* Header Info */}
                <div className="flex flex-wrap items-center gap-3">
                  <Badge
                    className={getCategoryBadgeColor(selectedStyle.category)}
                  >
                    {selectedStyle.category.replace(/_/g, ' ')}
                  </Badge>
                  <Badge
                    className={getDifficultyBadgeColor(
                      selectedStyle.difficulty,
                    )}
                  >
                    {selectedStyle.difficulty}
                  </Badge>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">
                    Description:
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedStyle.description}
                  </p>
                </div>

                {/* Tags */}
                {selectedStyle.tags.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2 flex items-center">
                      <Tag className="size-4 mr-1" />
                      Tags:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedStyle.tags.map((tag, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="border-border/50 hover:border-primary/30"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tips */}
                {selectedStyle.tips.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2 flex items-center">
                      <Lightbulb className="size-4 mr-1 text-yellow-500" />
                      Tips:
                    </h4>
                    <div className="space-y-2">
                      {selectedStyle.tips.map((tip, idx) => (
                        <div key={idx} className="flex items-start space-x-2">
                          <Star className="size-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground leading-relaxed">
                            {tip}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Examples */}
                {selectedStyle.examples.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2 flex items-center">
                      <Star className="size-4 mr-1 text-blue-500" />
                      Examples:
                    </h4>
                    <div className="space-y-2">
                      {selectedStyle.examples.map((example, idx) => (
                        <div
                          key={idx}
                          className="bg-muted/30 p-3 rounded-lg border border-border/50"
                        >
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {example}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
