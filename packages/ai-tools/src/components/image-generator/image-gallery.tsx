"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
} from "@turbo-super/ui";
import { ImageIcon, Download, Copy, Trash2, Eye } from "lucide-react";
import { GeneratedImage } from "../../types";

interface ImageGalleryProps {
  images: GeneratedImage[];
  currentGeneration: GeneratedImage | null;
  onDeleteImage: (imageId: string) => void;
  onClearAll: () => void;
  onDownloadImage: (image: GeneratedImage) => Promise<void>;
  onCopyImageUrl: (image: GeneratedImage) => Promise<void>;
}

export function ImageGallery({
  images,
  currentGeneration,
  onDeleteImage,
  onClearAll,
  onDownloadImage,
  onCopyImageUrl,
}: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(
    null
  );

  if (images.length === 0 && !currentGeneration) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="size-5" />
            Generated Images
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <ImageIcon className="size-12 mx-auto mb-4 opacity-50" />
            <p>No images generated yet</p>
            <p className="text-sm">Generate your first image to see it here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const allImages = currentGeneration ? [currentGeneration, ...images] : images;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="size-5" />
            Generated Images ({allImages.length})
          </CardTitle>
          {images.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearAll}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="size-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
          {allImages.map((image) => (
            <div
              key={image.id}
              className={`relative group border rounded-lg overflow-hidden ${
                currentGeneration?.id === image.id ? "ring-2 ring-blue-500" : ""
              }`}
            >
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                {image.url ? (
                  <img
                    src={image.url}
                    alt={image.prompt}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => setSelectedImage(image)}
                  />
                ) : (
                  <div className="text-center text-muted-foreground">
                    <ImageIcon className="size-8 mx-auto mb-2" />
                    <p className="text-sm">Loading...</p>
                  </div>
                )}
              </div>

              {/* Image Info */}
              <div className="p-3 bg-white border-t">
                <p
                  className="text-sm font-medium truncate"
                  title={image.prompt}
                >
                  {image.prompt}
                </p>
                <p className="text-xs text-muted-foreground">
                  {image.model} •{" "}
                  {new Date(image.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setSelectedImage(image)}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="size-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onDownloadImage(image)}
                    className="h-8 w-8 p-0"
                  >
                    <Download className="size-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onCopyImageUrl(image)}
                    className="h-8 w-8 p-0"
                  >
                    <Copy className="size-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDeleteImage(image.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>

              {/* Current Generation Indicator */}
              {currentGeneration?.id === image.id && (
                <div className="absolute top-2 left-2">
                  <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    Generating...
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Image Preview Modal */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl max-h-[90vh] overflow-hidden">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-semibold">Image Preview</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedImage(null)}
                >
                  ×
                </Button>
              </div>
              <div className="p-4">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.prompt}
                  className="w-full h-auto max-h-[60vh] object-contain"
                />
                <div className="mt-4">
                  <p className="font-medium mb-2">Prompt:</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {selectedImage.prompt}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => onDownloadImage(selectedImage)}
                    >
                      <Download className="size-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onCopyImageUrl(selectedImage)}
                    >
                      <Copy className="size-4 mr-2" />
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
