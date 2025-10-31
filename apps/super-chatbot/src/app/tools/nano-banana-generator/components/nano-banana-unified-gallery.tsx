// AICODE-NOTE: Unified gallery component for Nano Banana image generation and editing results
// Combines functionality from both generator and editor galleries

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@turbo-super/ui';
import { Button } from '@turbo-super/ui';
import { Badge } from '@turbo-super/ui';
import {
  Download,
  Copy,
  Trash2,
  Eye,
  Wand2,
  Edit3,
  Calendar,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';
import type {
  NanoBananaImageResult,
  NanoBananaEditResult,
} from '../api/nano-banana-api';

interface UnifiedImageResult {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  type: 'generated' | 'edited';
  settings?: {
    style?: string;
    quality?: string;
    aspectRatio?: string;
    seed?: number;
    enableContextAwareness?: boolean;
    enableSurgicalPrecision?: boolean;
    creativeMode?: boolean;
    // Edit-specific settings
    editType?: string;
    precisionLevel?: string;
    blendMode?: string;
    preserveOriginalStyle?: boolean;
    enhanceLighting?: boolean;
    preserveShadows?: boolean;
    originalImageUrl?: string;
  };
}

interface NanoBananaUnifiedGalleryProps {
  generatedImages: NanoBananaImageResult[];
  editedImages: NanoBananaEditResult[];
  currentGeneration?: NanoBananaImageResult | null;
  currentEdit?: NanoBananaEditResult | null;
  onDeleteGeneratedImage: (id: string) => void;
  onDeleteEditedImage: (id: string) => void;
  onClearAllGenerated: () => void;
  onClearAllEdited: () => void;
  onDownloadGeneratedImage: (url: string, filename: string) => void;
  onDownloadEditedImage: (url: string, filename: string) => void;
  onCopyGeneratedImageUrl: (url: string) => void;
  onCopyEditedImageUrl: (url: string) => void;
  isGenerating: boolean;
  isEditing: boolean;
}

export function NanoBananaUnifiedGallery({
  generatedImages,
  editedImages,
  currentGeneration,
  currentEdit,
  onDeleteGeneratedImage,
  onDeleteEditedImage,
  onClearAllGenerated,
  onClearAllEdited,
  onDownloadGeneratedImage,
  onDownloadEditedImage,
  onCopyGeneratedImageUrl,
  onCopyEditedImageUrl,
  isGenerating,
  isEditing,
}: NanoBananaUnifiedGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<UnifiedImageResult | null>(
    null,
  );
  // No view mode filtering - show all images together

  // Combine all images into unified format
  const allImages: UnifiedImageResult[] = [
    ...generatedImages.map((img) => ({
      ...img,
      type: 'generated' as const,
    })),
    ...editedImages.map((img) => ({
      ...img,
      prompt: img.editPrompt || '',
      type: 'edited' as const,
    })),
  ].sort((a, b) => b.timestamp - a.timestamp);

  // Add current generation/edit if they exist and are not already in the arrays
  const displayImages: UnifiedImageResult[] = [
    ...(currentGeneration &&
    !generatedImages.some((img) => img.id === currentGeneration.id)
      ? [
          {
            ...currentGeneration,
            type: 'generated' as const,
          },
        ]
      : []),
    ...(currentEdit && !editedImages.some((img) => img.id === currentEdit.id)
      ? [
          {
            ...currentEdit,
            prompt: currentEdit.editPrompt || '',
            type: 'edited' as const,
          },
        ]
      : []),
    ...allImages,
  ];

  // Show all images without filtering
  const filteredImages = displayImages;

  const handleDownload = (image: UnifiedImageResult) => {
    const filename = `nano-banana-${image.type}-${image.id}.png`;
    if (image.type === 'generated') {
      onDownloadGeneratedImage(image.url, filename);
    } else {
      onDownloadEditedImage(image.url, filename);
    }
  };

  const handleCopyUrl = (image: UnifiedImageResult) => {
    if (image.type === 'generated') {
      onCopyGeneratedImageUrl(image.url);
    } else {
      onCopyEditedImageUrl(image.url);
    }
  };

  const handleDelete = (image: UnifiedImageResult) => {
    if (image.type === 'generated') {
      onDeleteGeneratedImage(image.id);
    } else {
      onDeleteEditedImage(image.id);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusBadge = (image: UnifiedImageResult) => {
    if (image.type === 'generated') {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Wand2 className="size-3" />
          Generated
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <Edit3 className="size-3" />
          Edited
        </Badge>
      );
    }
  };

  const clearAll = () => {
    onClearAllGenerated();
    onClearAllEdited();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ImageIcon className="size-5 text-blue-600" />
            <span>Image Gallery</span>
            <Badge variant="secondary">
              {filteredImages.length} image
              {filteredImages.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            {/* Clear All Button */}
            {filteredImages.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAll}
                disabled={isGenerating || isEditing}
                className="text-muted-foreground hover:text-foreground"
              >
                <Trash2 className="size-3 mr-1" />
                Clear All
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {filteredImages.length === 0 ? (
          <div className="text-center py-8">
            <ImageIcon className="size-10 text-muted-foreground/50 mx-auto mb-3" />
            <h3 className="text-base font-medium text-foreground mb-1">
              No images yet
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Generate or edit images to see them here
            </p>
            {(isGenerating || isEditing) && (
              <div className="flex items-center justify-center space-x-2 text-primary">
                <Sparkles className="size-4 animate-spin" />
                <span className="text-sm">
                  {isGenerating ? 'Generating...' : 'Editing...'}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className="group relative bg-card rounded-lg overflow-hidden border border-border hover:shadow-lg transition-all duration-200 hover:border-primary/20"
              >
                {/* Image */}
                <div className="aspect-square relative">
                  <img
                    src={image.url}
                    alt={image.prompt}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setSelectedImage(image)}
                        className="h-8 w-8 p-0 bg-background/80 hover:bg-background"
                      >
                        <Eye className="size-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleDownload(image)}
                        className="h-8 w-8 p-0 bg-background/80 hover:bg-background"
                      >
                        <Download className="size-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleCopyUrl(image)}
                        className="h-8 w-8 p-0 bg-background/80 hover:bg-background"
                      >
                        <Copy className="size-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(image)}
                        className="h-8 w-8 p-0 bg-destructive/80 hover:bg-destructive"
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-2 left-2">
                    {getStatusBadge(image)}
                  </div>
                </div>

                {/* Image Info */}
                <div className="p-2 space-y-2">
                  {/* Prompt */}
                  <div className="space-y-1">
                    <p className="text-xs text-foreground line-clamp-2 leading-relaxed">
                      {image.prompt}
                    </p>
                  </div>

                  {/* Timestamp and Seed */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="size-3" />
                      <span className="truncate">
                        {new Date(image.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    {image.settings?.seed && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-muted/50 px-1 py-0"
                      >
                        {image.settings.seed}
                      </Badge>
                    )}
                  </div>

                  {/* Settings Summary */}
                  <div className="flex flex-wrap gap-1">
                    {image.type === 'generated' && (
                      <>
                        {image.settings?.style && (
                          <Badge
                            variant="secondary"
                            className="text-xs px-1 py-0 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                          >
                            {image.settings.style}
                          </Badge>
                        )}
                        {image.settings?.quality && (
                          <Badge
                            variant="secondary"
                            className="text-xs px-1 py-0 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          >
                            {image.settings.quality}
                          </Badge>
                        )}
                      </>
                    )}
                    {image.type === 'edited' && (
                      <>
                        {image.settings?.editType && (
                          <Badge
                            variant="secondary"
                            className="text-xs px-1 py-0 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                          >
                            {image.settings.editType.replace(/_/g, ' ')}
                          </Badge>
                        )}
                        {image.settings?.precisionLevel && (
                          <Badge
                            variant="secondary"
                            className="text-xs px-1 py-0 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                          >
                            {image.settings.precisionLevel}
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Image Preview Modal */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-lg max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusBadge(selectedImage)}
                  <span className="text-sm text-muted-foreground">
                    {formatTimestamp(selectedImage.timestamp)}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedImage(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </Button>
              </div>

              <div className="p-4 space-y-4">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.prompt}
                  className="max-w-full max-h-[60vh] object-contain mx-auto rounded-lg"
                />

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      Prompt:
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {selectedImage.prompt}
                    </p>
                  </div>

                  {/* Settings Info */}
                  <div className="flex flex-wrap gap-2">
                    {selectedImage.type === 'generated' && (
                      <>
                        {selectedImage.settings?.style && (
                          <Badge
                            variant="secondary"
                            className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                          >
                            Style: {selectedImage.settings.style}
                          </Badge>
                        )}
                        {selectedImage.settings?.quality && (
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          >
                            Quality: {selectedImage.settings.quality}
                          </Badge>
                        )}
                      </>
                    )}
                    {selectedImage.type === 'edited' && (
                      <>
                        {selectedImage.settings?.editType && (
                          <Badge
                            variant="secondary"
                            className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                          >
                            {selectedImage.settings.editType.replace(/_/g, ' ')}
                          </Badge>
                        )}
                        {selectedImage.settings?.precisionLevel && (
                          <Badge
                            variant="secondary"
                            className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                          >
                            {selectedImage.settings.precisionLevel}
                          </Badge>
                        )}
                      </>
                    )}
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button
                      onClick={() => handleDownload(selectedImage)}
                      size="sm"
                      className="flex-1"
                    >
                      <Download className="size-3 mr-2" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleCopyUrl(selectedImage)}
                      size="sm"
                      className="flex-1"
                    >
                      <Copy className="size-3 mr-2" />
                      Copy URL
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
