'use client';

import { useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
  Separator,
  Badge,
} from '@turbo-super/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from '../../../../components/ui';
import { Edit3, Zap, Palette } from 'lucide-react';
import type { NanoBananaImageEditingRequest } from '../api/nano-banana-api';

interface NanoBananaEditorFormProps {
  onEdit: (request: NanoBananaImageEditingRequest) => Promise<void>;
  isEditing: boolean;
  config?: {
    editTypes: string[];
    precisionLevels: string[];
    blendModes: string[];
  };
}

export function NanoBananaEditorForm({
  onEdit,
  isEditing,
  config = {
    editTypes: [
      'remove_object',
      'add_object',
      'replace_background',
      'style_transfer',
      'color_adjustment',
      'lighting_adjustment',
      'texture_enhancement',
      'composition_change',
      'artistic_effect',
      'object_replacement',
    ],
    precisionLevels: ['low', 'medium', 'high', 'ultra'],
    blendModes: [
      'normal',
      'overlay',
      'soft_light',
      'hard_light',
      'multiply',
      'screen',
    ],
  },
}: NanoBananaEditorFormProps) {
  const [formData, setFormData] = useState<NanoBananaImageEditingRequest>({
    editType: 'object-removal',
    editPrompt: '',
    sourceImageUrl: '',
    precisionLevel: 'automatic',
    blendMode: 'natural',
    preserveOriginalStyle: true,
    enhanceLighting: true,
    preserveShadows: true,
    batchSize: 1,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
        setFormData((prev) => ({
          ...prev,
          sourceImageUrl: e.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.editPrompt.trim() || !formData.sourceImageUrl.trim()) {
      return;
    }
    await onEdit(formData);
  };

  const updateFormData = (
    field: keyof NanoBananaImageEditingRequest,
    value: any,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Поля, зависящие от editType (оставил как есть)
  const getEditTypeSpecificFields = () => {
    switch (formData.editType) {
      case 'remove_object':
        return (
          <Input
            placeholder="e.g., 'person in the background'"
            value={formData.objectToRemove || ''}
            onChange={(e) => updateFormData('objectToRemove', e.target.value)}
            disabled={isEditing}
          />
        );
      case 'add_object':
        return (
          <Input
            placeholder="e.g., 'a golden retriever'"
            value={formData.targetObject || ''}
            onChange={(e) => updateFormData('targetObject', e.target.value)}
            disabled={isEditing}
          />
        );
      case 'replace_background':
        return (
          <Input
            placeholder="e.g., 'beach sunset'"
            value={formData.newBackground || ''}
            onChange={(e) => updateFormData('newBackground', e.target.value)}
            disabled={isEditing}
          />
        );
      case 'style_transfer':
        return (
          <Input
            placeholder="e.g., 'Van Gogh style'"
            value={formData.styleToTransfer || ''}
            onChange={(e) => updateFormData('styleToTransfer', e.target.value)}
            disabled={isEditing}
          />
        );
      case 'object_replacement':
        return (
          <Input
            placeholder="e.g., 'replace the car with a bicycle'"
            value={formData.replacementObject || ''}
            onChange={(e) =>
              updateFormData('replacementObject', e.target.value)
            }
            disabled={isEditing}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit3 className="size-5 text-green-600" />
          <span>Nano Banana Image Editor</span>
          <Badge variant="secondary" className="ml-auto">
            AI-Powered
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Source Image */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Source Image *</Label>
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isEditing}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview(null);
                  updateFormData('sourceImageUrl', '');
                }}
                disabled={isEditing || !imageFile}
              >
                Clear
              </Button>
            </div>
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="mt-2 w-32 h-32 object-cover rounded-lg border"
              />
            )}
          </div>

          {/* Edit Type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Edit Type *</Label>
            <Select
              value={formData.editType || ''}
              onValueChange={(value) => updateFormData('editType', value)}
              disabled={isEditing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select edit type" />
              </SelectTrigger>
              <SelectContent>
                {config.editTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type
                      .replace(/_/g, ' ')
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Prompt */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Edit Instructions *</Label>
            <Textarea
              placeholder="Describe what you want to edit..."
              value={formData.editPrompt}
              onChange={(e) => updateFormData('editPrompt', e.target.value)}
              disabled={isEditing}
            />
          </div>

          {/* Type-specific */}
          {getEditTypeSpecificFields()}

          <Separator />

          {/* Precision + Blend */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Precision Level</Label>
              <Select
                value={formData.precisionLevel || ''}
                onValueChange={(v) => updateFormData('precisionLevel', v)}
                disabled={isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select precision level" />
                </SelectTrigger>
                <SelectContent>
                  {config.precisionLevels.map((lvl) => (
                    <SelectItem key={lvl} value={lvl}>
                      {lvl}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Blend Mode</Label>
              <Select
                value={formData.blendMode || ''}
                onValueChange={(v) => updateFormData('blendMode', v)}
                disabled={isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select blend mode" />
                </SelectTrigger>
                <SelectContent>
                  {config.blendModes.map((mode) => (
                    <SelectItem key={mode} value={mode}>
                      {mode.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Advanced */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Seed</Label>
              <Input
                type="number"
                placeholder="Random seed"
                value={formData.seed || ''}
                onChange={(e) =>
                  updateFormData(
                    'seed',
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
                disabled={isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Batch Size</Label>
              <Select
                value={formData.batchSize?.toString() || '1'}
                onValueChange={(v) => updateFormData('batchSize', Number(v))}
                disabled={isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select batch size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="size-4 text-green-600" />
              <Label className="text-sm font-medium">
                Nano Banana Features
              </Label>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Preserve Original Style
                </Label>
                <Switch
                  checked={formData.preserveOriginalStyle || false}
                  onCheckedChange={(c) =>
                    updateFormData('preserveOriginalStyle', c)
                  }
                  disabled={isEditing}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Enhance Lighting</Label>
                <Switch
                  checked={formData.enhanceLighting || false}
                  onCheckedChange={(c) => updateFormData('enhanceLighting', c)}
                  disabled={isEditing}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Preserve Shadows</Label>
                <Switch
                  checked={formData.preserveShadows || false}
                  onCheckedChange={(c) => updateFormData('preserveShadows', c)}
                  disabled={isEditing}
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full"
            disabled={
              isEditing ||
              !formData.editPrompt.trim() ||
              !formData.sourceImageUrl.trim()
            }
          >
            {isEditing ? (
              <>
                <Palette className="size-4 mr-2 animate-spin" />
                Editing...
              </>
            ) : (
              <>
                <Edit3 className="size-4 mr-2" />
                Edit Image
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
