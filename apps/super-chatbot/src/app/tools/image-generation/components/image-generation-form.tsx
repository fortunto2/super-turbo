'use client';

import { useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
  Input,
} from '@turbo-super/ui';
import { Textarea } from '@turbo-super/ui';
import { Loader2, ImageIcon, Wand2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ImageGenerationRequest } from '../api/image-generation-api';

interface ImageGenerationFormProps {
  onGenerate: (request: ImageGenerationRequest) => Promise<void>;
  isGenerating: boolean;
  config?: {
    styles: Array<{ id: string; label: string; description: string }>;
    qualityLevels: Array<{ id: string; label: string; description: string }>;
    aspectRatios: Array<{ id: string; label: string; description: string }>;
  };
}

export function ImageGenerationForm({
  onGenerate,
  isGenerating,
  config = {
    styles: [
      {
        id: 'realistic',
        label: 'Realistic',
        description: 'Photorealistic images',
      },
      {
        id: 'cinematic',
        label: 'Cinematic',
        description: 'Movie-style with dramatic lighting',
      },
      { id: 'anime', label: 'Anime', description: 'Japanese animation style' },
    ],
    qualityLevels: [
      { id: 'standard', label: 'Standard', description: 'Base quality' },
      { id: 'high', label: 'High', description: 'Improved quality' },
      { id: 'ultra', label: 'Ultra', description: 'Maximum quality' },
    ],
    aspectRatios: [
      { id: '1:1', label: 'Square (1:1)', description: '1024x1024' },
      { id: '16:9', label: 'Widescreen (16:9)', description: '1920x1080' },
      { id: '9:16', label: 'Vertical (9:16)', description: '768x1366' },
    ],
  },
}: ImageGenerationFormProps) {
  const [formData, setFormData] = useState<ImageGenerationRequest>({
    prompt: '',
    style: 'realistic',
    quality: 'high',
    aspectRatio: '1:1',
    batchSize: 1,
    enableContextAwareness: true,
    enableSurgicalPrecision: true,
    creativeMode: false,
  });

  // File upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.prompt.trim()) return;
    await onGenerate(formData);
  };

  const updateField = (field: keyof ImageGenerationRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setImagePreview(imageUrl);
        setFormData((prev) => ({ ...prev, sourceImageUrl: imageUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear image
  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, sourceImageUrl: '' }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="size-5" />
          Image Generation
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Generate high-quality images using AI
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Source Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="sourceImage">
              Source Image (Optional - upload to enable image-to-image)
            </Label>
            <div className="flex items-center space-x-4">
              <Input
                id="sourceImage"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="flex-1"
                disabled={isGenerating}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearImage}
                disabled={isGenerating || !imageFile}
              >
                Clear
              </Button>
            </div>
            {imagePreview && (
              <div className="mt-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg border"
                />
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Upload an image for image-to-image generation or style reference
            </p>
          </div>

          {/* Prompt */}
          <div className="space-y-2">
            <Label htmlFor="prompt">Image Description *</Label>
            <Textarea
              id="prompt"
              placeholder="Describe the image you want to generate..."
              value={formData.prompt}
              onChange={(e) => updateField('prompt', e.target.value)}
              disabled={isGenerating}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Be detailed and specific for better results
            </p>
          </div>

          {/* Grid layout for settings */}
          <div className="grid grid-cols-2 gap-4">
            {/* Style */}
            <div className="space-y-2">
              <Label htmlFor="style">Style</Label>
              <Select
                value={formData.style ?? ''}
                onValueChange={(value) => updateField('style', value)}
                disabled={isGenerating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  {config.styles.map((style) => (
                    <SelectItem key={style.id} value={style.id}>
                      {style.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {
                  config.styles.find((s) => s.id === formData.style)
                    ?.description
                }
              </p>
            </div>

            {/* Quality */}
            <div className="space-y-2">
              <Label htmlFor="quality">Quality</Label>
              <Select
                value={formData.quality ?? ''}
                onValueChange={(value) => updateField('quality', value)}
                disabled={isGenerating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select quality" />
                </SelectTrigger>
                <SelectContent>
                  {config.qualityLevels.map((quality) => (
                    <SelectItem key={quality.id} value={quality.id}>
                      {quality.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {
                  config.qualityLevels.find((q) => q.id === formData.quality)
                    ?.description
                }
              </p>
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-2">
              <Label htmlFor="aspectRatio">Aspect Ratio</Label>
              <Select
                value={formData.aspectRatio ?? ''}
                onValueChange={(value) => updateField('aspectRatio', value)}
                disabled={isGenerating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select aspect ratio" />
                </SelectTrigger>
                <SelectContent>
                  {config.aspectRatios.map((ratio) => (
                    <SelectItem key={ratio.id} value={ratio.id}>
                      {ratio.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {
                  config.aspectRatios.find((r) => r.id === formData.aspectRatio)
                    ?.description
                }
              </p>
            </div>

            {/* Batch Size */}
            <div className="space-y-2">
              <Label htmlFor="batchSize">Batch Size</Label>
              <Select
                value={formData.batchSize?.toString() ?? '1'}
                onValueChange={(value) =>
                  updateField('batchSize', Number.parseInt(value))
                }
                disabled={isGenerating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select batch size" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4].map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size} {size === 1 ? 'image' : 'images'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Generate multiple variations at once
              </p>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="space-y-3 border-t pt-4">
            <Label className="text-sm font-medium">
              Advanced Options (Nano Banana)
            </Label>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enableContextAwareness"
                checked={formData.enableContextAwareness ?? true}
                onChange={(e) =>
                  updateField('enableContextAwareness', e.target.checked)
                }
                disabled={isGenerating}
                className="rounded"
              />
              <Label
                htmlFor="enableContextAwareness"
                className="text-sm font-normal cursor-pointer"
              >
                Context Awareness
              </Label>
            </div>
            <p className="text-xs text-muted-foreground ml-6">
              AI understands object relationships and environment
            </p>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enableSurgicalPrecision"
                checked={formData.enableSurgicalPrecision ?? true}
                onChange={(e) =>
                  updateField('enableSurgicalPrecision', e.target.checked)
                }
                disabled={isGenerating}
                className="rounded"
              />
              <Label
                htmlFor="enableSurgicalPrecision"
                className="text-sm font-normal cursor-pointer"
              >
                Surgical Precision
              </Label>
            </div>
            <p className="text-xs text-muted-foreground ml-6">
              Precise handling of occlusions and boundaries
            </p>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="creativeMode"
                checked={formData.creativeMode ?? false}
                onChange={(e) => updateField('creativeMode', e.target.checked)}
                disabled={isGenerating}
                className="rounded"
              />
              <Label
                htmlFor="creativeMode"
                className="text-sm font-normal cursor-pointer"
              >
                Creative Mode
              </Label>
            </div>
            <p className="text-xs text-muted-foreground ml-6">
              More creative and unusual interpretations
            </p>
          </div>

          {/* Seed (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="seed">Seed (Optional)</Label>
            <Input
              id="seed"
              type="number"
              placeholder="Random seed for reproducibility"
              value={formData.seed ?? ''}
              onChange={(e) => {
                const val = e.target.value;
                updateField('seed', val ? Number.parseInt(val) : undefined);
              }}
              disabled={isGenerating}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isGenerating || !formData.prompt.trim()}
          >
            {isGenerating ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <ImageIcon className="size-4 mr-2" />
                Generate Image
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
