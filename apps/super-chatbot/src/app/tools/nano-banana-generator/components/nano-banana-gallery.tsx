// AICODE-NOTE: Gallery component for displaying Nano Banana generated images
// Shows generated images with actions and metadata

"use client";

import { useState } from "react";
import { Button } from "@turbo-super/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@turbo-super/ui";
import { Badge } from "@turbo-super/ui";
import { Separator } from "@turbo-super/ui";
import {
  Download,
  Copy,
  Trash2,
  Eye,
  ImageIcon,
  Sparkles,
  Zap,
  Settings,
  Calendar,
  Wand2,
} from "lucide-react";
import type { NanoBananaImageResult } from "../api/nano-banana-api";

interface NanoBananaGalleryProps {
  images: NanoBananaImageResult[];
  currentGeneration: NanoBananaImageResult | null;
  onDeleteImage: (imageId: string) => void;
  onClearAll: () => void;
  onDownloadImage: (image: NanoBananaImageResult) => Promise<void>;
  onCopyImageUrl: (image: NanoBananaImageResult) => Promise<void>;
  isGenerating: boolean;
}

export function NanoBananaGallery({
  images,
  currentGeneration,
  onDeleteImage,
  onClearAll,
  onDownloadImage,
  onCopyImageUrl,
  isGenerating,
}: NanoBananaGalleryProps) {
  const [selectedImage, setSelectedImage] =
    useState<NanoBananaImageResult | null>(null);

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStyleBadgeColor = (style: string) => {
    const colors: Record<string, string> = {
      photorealistic: "bg-blue-100 text-blue-800",
      artistic: "bg-purple-100 text-purple-800",
      minimalist: "bg-gray-100 text-gray-800",
      vintage: "bg-amber-100 text-amber-800",
      futuristic: "bg-cyan-100 text-cyan-800",
      cinematic: "bg-red-100 text-red-800",
      painterly: "bg-pink-100 text-pink-800",
      sketch: "bg-green-100 text-green-800",
    };
    return colors[style] || "bg-gray-100 text-gray-800";
  };

  const getQualityBadgeColor = (quality: string) => {
    const colors: Record<string, string> = {
      standard: "bg-gray-100 text-gray-800",
      high: "bg-green-100 text-green-800",
      ultra: "bg-blue-100 text-blue-800",
    };
    return colors[quality] || "bg-gray-100 text-gray-800";
  };

  if (images.length === 0 && !currentGeneration) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ImageIcon className="size-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Images Generated Yet
          </h3>
          <p className="text-gray-500 text-center max-w-sm">
            Start by generating your first Nano Banana image using the form on
            the left.
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
          <Wand2 className="size-5 text-yellow-600" />
          <h2 className="text-xl font-semibold">Generated Images</h2>
          <Badge variant="secondary">{images.length}</Badge>
        </div>
        {images.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearAll}
            disabled={isGenerating}
          >
            <Trash2 className="size-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      {/* Current Generation */}
      {currentGeneration && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-sm">
              <Sparkles className="size-4 text-blue-600" />
              <span>Currently Generating</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Generating...</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 line-clamp-2">
                {currentGeneration.prompt}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Images Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image) => (
          <Card
            key={image.id}
            className="group hover:shadow-lg transition-shadow"
          >
            <CardContent className="p-0">
              {/* Image */}
              <div className="aspect-square relative overflow-hidden rounded-t-lg">
                <img
                  src={image.url}
                  alt={image.prompt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  onClick={() => setSelectedImage(image)}
                />

                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setSelectedImage(image)}
                    >
                      <Eye className="size-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onDownloadImage(image)}
                    >
                      <Download className="size-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onCopyImageUrl(image)}
                    >
                      <Copy className="size-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDeleteImage(image.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Image Info */}
              <div className="p-4 space-y-3">
                <p className="text-sm text-gray-700 line-clamp-2">
                  {image.prompt}
                </p>

                {/* Settings */}
                {image.settings && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Badge
                        className={getStyleBadgeColor(
                          image.settings.style || "default"
                        )}
                      >
                        {image.settings.style || "Default"}
                      </Badge>
                      <Badge
                        className={getQualityBadgeColor(
                          image.settings.quality || "high"
                        )}
                      >
                        {image.settings.quality || "High"}
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>{image.settings.aspectRatio || "1:1"}</span>
                      {image.settings.seed && (
                        <>
                          <span>•</span>
                          <span>Seed: {image.settings.seed}</span>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Nano Banana Features */}
                {image.settings && (
                  <div className="flex items-center space-x-2">
                    {image.settings.enableContextAwareness && (
                      <Badge
                        variant="outline"
                        className="text-xs"
                      >
                        <Zap className="size-3 mr-1" />
                        Context
                      </Badge>
                    )}
                    {image.settings.enableSurgicalPrecision && (
                      <Badge
                        variant="outline"
                        className="text-xs"
                      >
                        <Settings className="size-3 mr-1" />
                        Precision
                      </Badge>
                    )}
                    {image.settings.creativeMode && (
                      <Badge
                        variant="outline"
                        className="text-xs"
                      >
                        <Sparkles className="size-3 mr-1" />
                        Creative
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex items-center space-x-1 text-xs text-gray-400">
                  <Calendar className="size-3" />
                  <span>{formatTimestamp(image.timestamp)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Image Preview</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedImage(null)}
              >
                Close
              </Button>
            </div>
            <div className="p-4">
              <img
                src={selectedImage.url}
                alt={selectedImage.prompt}
                className="max-w-full max-h-[60vh] object-contain mx-auto"
              />
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-700">{selectedImage.prompt}</p>
                {selectedImage.settings && (
                  <div className="flex items-center space-x-2">
                    <Badge
                      className={getStyleBadgeColor(
                        selectedImage.settings.style || "default"
                      )}
                    >
                      {selectedImage.settings.style || "Default"}
                    </Badge>
                    <Badge
                      className={getQualityBadgeColor(
                        selectedImage.settings.quality || "high"
                      )}
                    >
                      {selectedImage.settings.quality || "High"}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {selectedImage.settings.aspectRatio || "1:1"}
                    </span>
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
