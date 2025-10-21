'use client';

import { Card, CardContent, CardHeader, CardTitle, Button } from '@turbo-super/ui';
import { Download, Copy, Trash2, X, ImageIcon, Loader2 } from 'lucide-react';
import { useState } from 'react';
import type { GeneratedImageResult } from '../api/image-generation-api';
import Image from 'next/image';

interface ImageGenerationGalleryProps {
  generatedImages: GeneratedImageResult[];
  currentGeneration: GeneratedImageResult | null;
  onDeleteImage: (imageId: string) => void;
  onClearAll: () => void;
  onDownloadImage: (url: string, filename: string) => void;
  onCopyImageUrl: (url: string) => void;
  isGenerating: boolean;
}

export function ImageGenerationGallery({
  generatedImages,
  currentGeneration,
  onDeleteImage,
  onClearAll,
  onDownloadImage,
  onCopyImageUrl,
  isGenerating,
}: ImageGenerationGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<GeneratedImageResult | null>(null);

  const allImages = currentGeneration
    ? [currentGeneration, ...generatedImages.filter((img) => img.id !== currentGeneration.id)]
    : generatedImages;

  return (
    <>
      <Card className="h-[calc(100vh-200px)] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="size-5" />
              Generated Images
              {allImages.length > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  ({allImages.length})
                </span>
              )}
            </CardTitle>
            {allImages.length > 0 && (
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
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          {isGenerating && allImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="size-12 animate-spin text-blue-400" />
              <p className="text-sm text-muted-foreground">Generating your image...</p>
            </div>
          ) : allImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
              <div className="p-4 rounded-full bg-muted/50 border border-border">
                <ImageIcon className="size-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">No images yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Generate your first image to see it here
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {allImages.map((image, index) => (
                <div
                  key={image.id}
                  className="group relative rounded-lg border border-border overflow-hidden hover:border-blue-500 transition-colors bg-card"
                >
                  {/* Image */}
                  <div
                    className="relative aspect-square cursor-pointer"
                    onClick={() => setSelectedImage(image)}
                  >
                    <Image
                      src={image.url}
                      alt={image.prompt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    {index === 0 && currentGeneration?.id === image.id && (
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded">
                          Latest
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="p-3 border-t border-border">
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{image.prompt}</p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDownloadImage(image.url, `image-${image.id}.png`)}
                        className="flex-1"
                      >
                        <Download className="size-3 mr-1" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onCopyImageUrl(image.url)}
                        className="flex-1"
                      >
                        <Copy className="size-3 mr-1" />
                        Copy URL
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeleteImage(image.id)}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh]">
            <Button
              variant="outline"
              size="sm"
              className="absolute top-4 right-4 z-10"
              onClick={() => setSelectedImage(null)}
            >
              <X className="size-4" />
            </Button>
            <div className="relative w-full h-full">
              <Image
                src={selectedImage.url}
                alt={selectedImage.prompt}
                width={1024}
                height={1024}
                className="object-contain w-full h-auto max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="mt-4 p-4 bg-card border border-border rounded-lg">
              <p className="text-sm">{selectedImage.prompt}</p>
              {selectedImage.settings && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedImage.settings.style && (
                    <span className="text-xs px-2 py-1 bg-muted rounded">
                      Style: {selectedImage.settings.style}
                    </span>
                  )}
                  {selectedImage.settings.quality && (
                    <span className="text-xs px-2 py-1 bg-muted rounded">
                      Quality: {selectedImage.settings.quality}
                    </span>
                  )}
                  {selectedImage.settings.aspectRatio && (
                    <span className="text-xs px-2 py-1 bg-muted rounded">
                      Ratio: {selectedImage.settings.aspectRatio}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
