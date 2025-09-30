// AICODE-NOTE: Component for displaying enhanced prompts
// Shows original and enhanced prompts with improvements and technical details

"use client";

import { useState } from "react";
import { Button } from "@turbo-super/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@turbo-super/ui";
import { Badge } from "@turbo-super/ui";
import { Separator } from "@turbo-super/ui";
import {
  Copy,
  Trash2,
  Lightbulb,
  Sparkles,
  Wand2,
  CheckCircle,
  ArrowRight,
  Tag,
  Star,
} from "lucide-react";
import type { NanoBananaEnhancedPrompt } from "../api/nano-banana-api";

interface NanoBananaEnhancedPromptDisplayProps {
  enhancedPrompts: NanoBananaEnhancedPrompt[];
  currentEnhancement: NanoBananaEnhancedPrompt | null;
  onClearAll: () => void;
  onCopyPrompt: (enhancedPrompt: NanoBananaEnhancedPrompt) => Promise<void>;
}

export function NanoBananaEnhancedPromptDisplay({
  enhancedPrompts,
  currentEnhancement,
  onClearAll,
  onCopyPrompt,
}: NanoBananaEnhancedPromptDisplayProps) {
  const [selectedEnhancement, setSelectedEnhancement] =
    useState<NanoBananaEnhancedPrompt | null>(null);

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getTechniqueBadgeColor = (technique: string) => {
    const colors: Record<string, string> = {
      context_awareness: "bg-blue-100 text-blue-800",
      surgical_precision: "bg-green-100 text-green-800",
      physical_logic: "bg-purple-100 text-purple-800",
      technical_enhancement: "bg-orange-100 text-orange-800",
      artistic_enhancement: "bg-pink-100 text-pink-800",
      composition_optimization: "bg-cyan-100 text-cyan-800",
      lighting_enhancement: "bg-yellow-100 text-yellow-800",
      style_consistency: "bg-indigo-100 text-indigo-800",
    };
    return colors[technique] || "bg-gray-100 text-gray-800";
  };

  if (enhancedPrompts.length === 0 && !currentEnhancement) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Sparkles className="size-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Enhanced Prompts Yet
          </h3>
          <p className="text-gray-500 text-center max-w-sm">
            Start by enhancing your first prompt using the form on the left.
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
          <Sparkles className="size-5 text-purple-600" />
          <h2 className="text-xl font-semibold">Enhanced Prompts</h2>
          <Badge variant="secondary">{enhancedPrompts.length}</Badge>
        </div>
        {enhancedPrompts.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearAll}
          >
            <Trash2 className="size-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      {/* Current Enhancement */}
      {currentEnhancement && (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-sm">
              <Wand2 className="size-4 text-purple-600" />
              <span>Currently Enhancing</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-lg border">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge
                    className={getTechniqueBadgeColor(
                      currentEnhancement.technique
                    )}
                  >
                    {currentEnhancement.technique.replace(/_/g, " ")}
                  </Badge>
                </div>
                <p className="text-sm text-gray-700 line-clamp-2">
                  {currentEnhancement.originalPrompt}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Prompts List */}
      <div className="space-y-4">
        {enhancedPrompts.map((enhancedPrompt, index) => (
          <Card
            key={index}
            className="group hover:shadow-lg transition-shadow"
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="size-4 text-green-600" />
                  <span>Enhanced Prompt #{index + 1}</span>
                </CardTitle>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedEnhancement(enhancedPrompt)}
                  >
                    <Lightbulb className="size-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onCopyPrompt(enhancedPrompt)}
                  >
                    <Copy className="size-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Technique Badge */}
              <div className="flex items-center space-x-2">
                <Badge
                  className={getTechniqueBadgeColor(enhancedPrompt.technique)}
                >
                  {enhancedPrompt.technique.replace(/_/g, " ")}
                </Badge>
              </div>

              {/* Original vs Enhanced */}
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Original Prompt:
                  </h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">
                      {enhancedPrompt.originalPrompt}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <ArrowRight className="size-4 text-gray-400" />
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Enhanced Prompt:
                  </h4>
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <p className="text-sm text-gray-800">
                      {enhancedPrompt.enhancedPrompt}
                    </p>
                  </div>
                </div>
              </div>

              {/* Improvements */}
              {enhancedPrompt.improvements.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Star className="size-4 mr-1" />
                    Improvements:
                  </h4>
                  <div className="space-y-1">
                    {enhancedPrompt.improvements.map((improvement, idx) => (
                      <div
                        key={idx}
                        className="flex items-start space-x-2"
                      >
                        <CheckCircle className="size-3 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-gray-600">
                          {improvement}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Terms */}
              {enhancedPrompt.technicalTerms.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Tag className="size-4 mr-1" />
                    Technical Terms:
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {enhancedPrompt.technicalTerms.map((term, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="text-xs"
                      >
                        {term}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Quality Descriptors */}
              {enhancedPrompt.qualityDescriptors.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Sparkles className="size-4 mr-1" />
                    Quality Descriptors:
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {enhancedPrompt.qualityDescriptors.map(
                      (descriptor, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="text-xs"
                        >
                          {descriptor}
                        </Badge>
                      )
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhancement Preview Modal */}
      {selectedEnhancement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Enhanced Prompt Details</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedEnhancement(null)}
              >
                Close
              </Button>
            </div>
            <div className="p-4 max-h-[70vh] overflow-y-auto">
              <div className="space-y-6">
                {/* Technique */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Enhancement Technique:
                  </h4>
                  <Badge
                    className={getTechniqueBadgeColor(
                      selectedEnhancement.technique
                    )}
                  >
                    {selectedEnhancement.technique.replace(/_/g, " ")}
                  </Badge>
                </div>

                {/* Original vs Enhanced */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Original Prompt:
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">
                        {selectedEnhancement.originalPrompt}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Enhanced Prompt:
                    </h4>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <p className="text-sm text-gray-800">
                        {selectedEnhancement.enhancedPrompt}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Improvements */}
                {selectedEnhancement.improvements.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Improvements:
                    </h4>
                    <div className="space-y-2">
                      {selectedEnhancement.improvements.map(
                        (improvement, idx) => (
                          <div
                            key={idx}
                            className="flex items-start space-x-2"
                          >
                            <CheckCircle className="size-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-600">
                              {improvement}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Technical Terms */}
                {selectedEnhancement.technicalTerms.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Technical Terms:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedEnhancement.technicalTerms.map((term, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                        >
                          {term}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quality Descriptors */}
                {selectedEnhancement.qualityDescriptors.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Quality Descriptors:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedEnhancement.qualityDescriptors.map(
                        (descriptor, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                          >
                            {descriptor}
                          </Badge>
                        )
                      )}
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
