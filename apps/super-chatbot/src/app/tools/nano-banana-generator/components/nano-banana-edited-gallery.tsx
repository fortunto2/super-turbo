// AICODE-NOTE: Gallery component for displaying Nano Banana edited images
// Shows edited images with actions and metadata specific to editing

"use client";

import { useState } from "react";
import { Button } from "@turbo-super/ui";
import { Card, CardContent, } from "@turbo-super/ui";
import { Badge } from "@turbo-super/ui";
import {
  Download,
  Copy,
  Trash2,
  Eye,
  Edit3,
  Zap,
  Settings,
  Calendar,
  Palette,
} from "lucide-react";
import type { NanoBananaEditResult } from "../api/nano-banana-api";

interface NanoBananaEditedGalleryProps {
  images: NanoBananaEditResult[];
  currentEdit: NanoBananaEditResult | null;
  onDeleteImage: (imageId: string) => void;
  onClearAll: () => void;
  onDownloadImage: (image: NanoBananaEditResult) => Promise<void>;
  onCopyImageUrl: (image: NanoBananaEditResult) => Promise<void>;
  isEditing: boolean;
}

export function NanoBananaEditedGallery({
  images,
  currentEdit,
  onDeleteImage,
  onClearAll,
  onDownloadImage,
  onCopyImageUrl,
  isEditing,
}: NanoBananaEditedGalleryProps) {
  const [selectedImage, setSelectedImage] =
    useState<NanoBananaEditResult | null>(null);

  console.log(isEditing);
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getEditTypeBadgeColor = (editType: string) => {
    const colors: Record<string, string> = {
      remove_object: "bg-red-100 text-red-800",
      add_object: "bg-green-100 text-green-800",
      replace_background: "bg-blue-100 text-blue-800",
      style_transfer: "bg-purple-100 text-purple-800",
      color_adjustment: "bg-yellow-100 text-yellow-800",
      lighting_adjustment: "bg-orange-100 text-orange-800",
      texture_enhancement: "bg-pink-100 text-pink-800",
      composition_change: "bg-cyan-100 text-cyan-800",
      artistic_effect: "bg-indigo-100 text-indigo-800",
      object_replacement: "bg-gray-100 text-gray-800",
    };
    return colors[editType] || "bg-gray-100 text-gray-800";
  };

  const getPrecisionBadgeColor = (precision: string) => {
    const colors: Record<string, string> = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-green-100 text-green-800",
      ultra: "bg-blue-100 text-blue-800",
    };
    return colors[precision] || "bg-gray-100 text-gray-800";
  };

  if (images.length === 0 && !currentEdit) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Edit3 className="size-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Edited Images Yet
          </h3>
          <p className="text-gray-500 text-center max-w-sm">
            Start by editing your first image using the form on the left.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4  flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Edit3 className="size-5 text-green-600" />
          <h2 className="text-xl font-semibold">Edited Images</h2>
          <Badge variant="secondary">{images.length}</Badge>
        </div>
        {images.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearAll}
            disabled={isEditing}
          >
            <Trash2 className="size-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      {/* Current Edit */}
      {isEditing && (
        <Card className="border-green-200 bg-green-50 h-[300px]">
          <CardContent className="size-full">
            <div className="space-y-3 size-full">
              <div className=" rounded-lg flex items-center justify-center size-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Editing...</p>
                </div>
              </div>
              {/* <p className="text-sm text-gray-700 line-clamp-2">
                {currentEdit.editPrompt}
              </p> */}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Images Grid */}
      <div className="flex flex-wrap gap-4 overflow-y-auto overflow-x-hidden pr-1 flex-1">
        {images.map((image) => (
          <Card
            key={image.id}
            className="group hover:shadow-lg transition-shadow w-[calc((100%-32px)/3)] max-w-[calc((100%-32px)/3)] max-h-52"
          >
            <CardContent className="p-0 size-full">
              {/* Image */}
              <div className="relative overflow-hidden rounded-t-lg size-full">
                <img
                  src={image.url}
                  alt={image.editPrompt}
                  className="size-full object-cover group-hover:scale-105 transition-transform duration-200"
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
                  {image.editPrompt}
                </p>

                {/* Edit Type and Settings */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Badge className={getEditTypeBadgeColor(image.editType)}>
                      {image.editType.replace(/_/g, " ")}
                    </Badge>
                    <Badge
                      className={getPrecisionBadgeColor(
                        image.settings.precisionLevel
                      )}
                    >
                      {image.settings.precisionLevel}
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>Blend: {image.settings.blendMode}</span>
                  </div>

                  {/* Nano Banana Features */}
                  <div className="flex items-center space-x-2 ">
                    {image.settings.preserveOriginalStyle && (
                      <Badge
                        variant="outline"
                        className="text-xs"
                      >
                        <Settings className="size-3 mr-1" />
                        Style
                      </Badge>
                    )}
                    {image.settings.enhanceLighting && (
                      <Badge
                        variant="outline"
                        className="text-xs"
                      >
                        <Zap className="size-3 mr-1" />
                        Lighting
                      </Badge>
                    )}
                    {image.settings.preserveShadows && (
                      <Badge
                        variant="outline"
                        className="text-xs"
                      >
                        <Palette className="size-3 mr-1" />
                        Shadows
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center space-x-1 text-xs text-gray-400">
                    <Calendar className="size-3" />
                    <span>{formatTimestamp(image.timestamp)}</span>
                  </div>
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
              <h3 className="text-lg font-semibold">Edited Image Preview</h3>
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
                alt={selectedImage.editPrompt}
                className="max-w-full max-h-[60vh] object-contain mx-auto"
              />
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-700">
                  {selectedImage.editPrompt}
                </p>
                <div className="flex items-center space-x-2">
                  <Badge
                    className={getEditTypeBadgeColor(selectedImage.editType)}
                  >
                    {selectedImage.editType.replace(/_/g, " ")}
                  </Badge>
                  <Badge
                    className={getPrecisionBadgeColor(
                      selectedImage.settings.precisionLevel
                    )}
                  >
                    {selectedImage.settings.precisionLevel}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    Blend: {selectedImage.settings.blendMode}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
