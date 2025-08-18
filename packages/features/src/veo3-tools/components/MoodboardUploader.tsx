import React, { useRef } from "react";
import {
  Label,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@turbo-super/ui";
import { MoodboardImage } from "../types";
import { useTranslation } from "../hooks/use-translation";
import { Locale } from "../translations";

interface MoodboardUploaderProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  onImagesChange: (images: MoodboardImage[]) => void;
  maxImages?: number;
  value?: MoodboardImage[];
  locale?: Locale;
}

export function MoodboardUploader({
  enabled,
  onEnabledChange,
  onImagesChange,
  maxImages = 3,
  value = [],
  locale = "en",
}: MoodboardUploaderProps) {
  const { t } = useTranslation(locale);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages: MoodboardImage[] = [];

    for (let i = 0; i < Math.min(files.length, maxImages - value.length); i++) {
      const file = files[i];
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          const newImage: MoodboardImage = {
            id: Date.now().toString() + i,
            file: file,
            base64: base64,
            tags: [],
            description: "",
            weight: 1.0,
          };

          const updatedImages = [...value, newImage];
          onImagesChange(updatedImages);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleDropZoneClick = () => {
    fileInputRef.current?.click();
  };

  const removeImage = (imageId: string) => {
    const updatedImages = value.filter((img) => img.id !== imageId);
    onImagesChange(updatedImages);
  };

  return (
    <div className="space-y-6">
      {/* Enable/Disable Toggle */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="moodboard-toggle"
            checked={enabled}
            onChange={(e) => onEnabledChange(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <Label
            htmlFor="moodboard-toggle"
            className="text-sm font-medium"
          >
            {t("veo3PromptGenerator.promptBuilder.moodboardTitle")}
          </Label>
        </div>
        {enabled && (
          <Badge
            variant="outline"
            className="text-xs"
          >
            {t("veo3PromptGenerator.promptBuilder.moodboardImages").replace(
              "0/3",
              `${value.length}/${maxImages}`
            )}
          </Badge>
        )}
      </div>

      {enabled && (
        <div className="space-y-6">
          {/* Image Uploader */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t("veo3PromptGenerator.promptBuilder.visualReferences")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
                onClick={handleDropZoneClick}
              >
                <div className="text-gray-500 dark:text-gray-400 mb-2">
                  📁 {t("veo3PromptGenerator.promptBuilder.uploadImages")}
                </div>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  {t(
                    "veo3PromptGenerator.promptBuilder.uploadDescription"
                  ).replace("3", maxImages.toString())}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {t("veo3PromptGenerator.promptBuilder.supportedFormats")}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Image Configuration */}
          {value.length > 0 && (
            <div className="space-y-4">
              {value.map((image) => (
                <Card
                  key={image.id}
                  className="group relative"
                >
                  <CardContent className="pt-6">
                    {/* Delete Button */}
                    <button
                      onClick={() => removeImage(image.id)}
                      className="absolute top-2 right-2 z-10 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove image"
                    >
                      ✕
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Image Preview */}
                      <div className="lg:col-span-1">
                        <div className="aspect-square relative rounded-lg overflow-hidden bg-muted">
                          {image.url ? (
                            <img
                              src={image.url}
                              alt="Moodboard reference"
                              className="w-full h-full object-cover"
                            />
                          ) : image.base64 ? (
                            <img
                              src={image.base64}
                              alt="Moodboard reference"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              Image Preview
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Configuration */}
                      <div className="lg:col-span-2 space-y-4">
                        <div className="text-sm text-muted-foreground">
                          <p>Image ID: {image.id}</p>
                          {image.description && (
                            <p>Description: {image.description}</p>
                          )}
                          {image.tags.length > 0 && (
                            <p>Tags: {image.tags.join(", ")}</p>
                          )}
                          <p>Weight: {image.weight}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Instructions */}
          <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                  🎨 {t("veo3PromptGenerator.promptBuilder.moodboardTips")}
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400">•</span>
                    <span>{t("veo3PromptGenerator.promptBuilder.tip1")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400">•</span>
                    <span>{t("veo3PromptGenerator.promptBuilder.tip2")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400">•</span>
                                         <span>
                       {t("veo3PromptGenerator.promptBuilder.tip3")}
                     </span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
