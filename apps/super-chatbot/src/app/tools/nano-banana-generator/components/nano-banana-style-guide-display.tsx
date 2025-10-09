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
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-orange-100 text-orange-800',
      expert: 'bg-red-100 text-red-800',
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      photography: 'bg-blue-100 text-blue-800',
      digital_art: 'bg-purple-100 text-purple-800',
      traditional_art: 'bg-amber-100 text-amber-800',
      cinematic: 'bg-red-100 text-red-800',
      architectural: 'bg-gray-100 text-gray-800',
      portrait: 'bg-pink-100 text-pink-800',
      landscape: 'bg-green-100 text-green-800',
      abstract: 'bg-indigo-100 text-indigo-800',
      minimalist: 'bg-gray-100 text-gray-800',
      vintage: 'bg-yellow-100 text-yellow-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Loading Style Guide...
          </h3>
          <p className="text-gray-500 text-center max-w-sm">
            Fetching the latest styles and techniques from Nano Banana.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (styleInfos.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BookOpen className="size-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Styles Found
          </h3>
          <p className="text-gray-500 text-center max-w-sm">
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
          <BookOpen className="size-5 text-blue-600" />
          <h2 className="text-xl font-semibold">Style Guide Results</h2>
          <Badge variant="secondary">{styleInfos.length}</Badge>
        </div>
        {currentQuery && (
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Search className="size-4" />
            <span>Filtered results</span>
          </div>
        )}
      </div>

      {/* Styles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {styleInfos?.map((styleInfo, index) => (
          <Card key={index} className="group hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{styleInfo.technique}</CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedStyle(styleInfo)}
                >
                  <Eye className="size-4" />
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={getCategoryBadgeColor(styleInfo.category)}>
                  {styleInfo.category.replace(/_/g, ' ')}
                </Badge>
                <Badge
                  className={getDifficultyBadgeColor(styleInfo.difficulty)}
                >
                  {styleInfo.difficulty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Description */}
              <p className="text-sm text-gray-700 line-clamp-3">
                {styleInfo.description}
              </p>

              {/* Tags */}
              {styleInfo.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {styleInfo.tags.slice(0, 3).map((tag, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {styleInfo.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{styleInfo.tags.length - 3} more
                    </Badge>
                  )}
                </div>
              )}

              {/* Tips Preview */}
              {styleInfo.tips.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Lightbulb className="size-3 mr-1" />
                    Tips:
                  </h4>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {styleInfo.tips[0]}
                  </p>
                </div>
              )}

              {/* Examples Preview */}
              {styleInfo.examples.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Star className="size-3 mr-1" />
                    Examples:
                  </h4>
                  <p className="text-xs text-gray-600 line-clamp-2">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {selectedStyle.technique}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedStyle(null)}
              >
                Close
              </Button>
            </div>
            <div className="p-4 max-h-[70vh] overflow-y-auto">
              <div className="space-y-6">
                {/* Header Info */}
                <div className="flex items-center space-x-4">
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
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Description:
                  </h4>
                  <p className="text-sm text-gray-600">
                    {selectedStyle.description}
                  </p>
                </div>

                {/* Tags */}
                {selectedStyle.tags.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Tag className="size-4 mr-1" />
                      Tags:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedStyle.tags.map((tag, idx) => (
                        <Badge key={idx} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tips */}
                {selectedStyle.tips.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Lightbulb className="size-4 mr-1" />
                      Tips:
                    </h4>
                    <div className="space-y-2">
                      {selectedStyle.tips.map((tip, idx) => (
                        <div key={idx} className="flex items-start space-x-2">
                          <Star className="size-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Examples */}
                {selectedStyle.examples.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Star className="size-4 mr-1" />
                      Examples:
                    </h4>
                    <div className="space-y-2">
                      {selectedStyle.examples.map((example, idx) => (
                        <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-700">{example}</p>
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
