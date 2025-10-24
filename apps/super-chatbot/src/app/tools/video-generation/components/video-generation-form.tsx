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
import { Badge } from '@turbo-super/ui';
import { Loader2, VideoIcon, Wand2, Sparkles } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type {
  VideoGenerationRequest,
  VideoModel,
} from '../api/video-generation-api';

interface VideoGenerationFormProps {
  onGenerate: (request: VideoGenerationRequest) => Promise<void>;
  isGenerating: boolean;
  config?: {
    durations: Array<{ id: number; label: string; description: string }>;
    aspectRatios: Array<{ id: string; label: string; description: string }>;
    resolutions?: Array<{ id: string; label: string; description: string }>;
    models?: Array<{
      id: VideoModel;
      label: string;
      description: string;
      badge?: string;
    }>;
  };
}

export function VideoGenerationForm({
  onGenerate,
  isGenerating,
  config = {
    durations: [
      { id: 4, label: '4 seconds', description: 'Quick clip' },
      { id: 6, label: '6 seconds', description: 'Medium clip' },
      { id: 8, label: '8 seconds', description: 'Standard duration' },
    ],
    aspectRatios: [
      { id: '16:9', label: 'Landscape (16:9)', description: 'Widescreen' },
      { id: '9:16', label: 'Portrait (9:16)', description: 'Stories' },
      { id: '1:1', label: 'Square (1:1)', description: 'Instagram' },
    ],
    resolutions: [
      { id: '720p', label: '720p', description: 'HD' },
      { id: '1080p', label: '1080p', description: 'Full HD' },
    ],
    models: [
      {
        id: 'fal-veo3',
        label: 'Fal.ai Veo 3',
        description: 'Recommended',
        badge: 'Best',
      },
      {
        id: 'vertex-veo3',
        label: 'Vertex AI Veo 3',
        description: 'Direct Google',
        badge: 'Direct',
      },
      {
        id: 'vertex-veo2',
        label: 'Vertex AI Veo 2',
        description: 'Older version',
      },
    ],
  },
}: VideoGenerationFormProps) {
  const [formData, setFormData] = useState<VideoGenerationRequest>({
    prompt: '',
    duration: 8,
    aspectRatio: '16:9',
    resolution: '720p',
    model: 'fal-veo3',
    generateAudio: true,
    enhancePrompt: true,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.prompt.trim()) return;

    console.log('🎬 Submitting video generation request:', formData);
    await onGenerate(formData);
  };

  const updateField = <K extends keyof VideoGenerationRequest>(
    field: K,
    value: VideoGenerationRequest[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const selectedModel = config.models?.find((m) => m.id === formData.model);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="size-5" />
          Video Generation
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Generate high-quality videos using AI models
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Model Selection */}
          <div className="space-y-2">
            <Label htmlFor="model">AI Model *</Label>
            <Select
              value={formData.model || 'fal-veo3'}
              onValueChange={(value: string) =>
                updateField('model', value as VideoModel)
              }
              disabled={isGenerating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {config.models?.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex items-center gap-2">
                      <span>{model.label}</span>
                      {model.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {model.badge}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedModel && (
              <p className="text-xs text-muted-foreground">
                {selectedModel.description}
              </p>
            )}
          </div>

          {/* Prompt */}
          <div className="space-y-2">
            <Label htmlFor="prompt">Video Description *</Label>
            <Textarea
              id="prompt"
              placeholder="Describe the video you want to generate... Be specific about actions, camera angles, and visual details."
              value={formData.prompt}
              onChange={(e) => updateField('prompt', e.target.value)}
              disabled={isGenerating}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Example: &ldquo;A cinematic shot of ocean waves at sunset, slow
              motion, 4K quality&rdquo;
            </p>
          </div>

          {/* Grid layout for basic settings */}
          <div className="grid grid-cols-2 gap-4">
            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Select
                value={formData.duration?.toString() ?? '8'}
                onValueChange={(value) =>
                  updateField('duration', Number.parseInt(value))
                }
                disabled={isGenerating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {config.durations.map((duration) => (
                    <SelectItem
                      key={duration.id}
                      value={duration.id.toString()}
                    >
                      {duration.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-2">
              <Label htmlFor="aspectRatio">Aspect Ratio</Label>
              <Select
                value={formData.aspectRatio || '16:9'}
                onValueChange={(value: string) =>
                  updateField('aspectRatio', value as '16:9' | '9:16' | '1:1')
                }
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
            </div>
          </div>

          {/* Resolution */}
          <div className="space-y-2">
            <Label htmlFor="resolution">Resolution</Label>
            <Select
              value={formData.resolution || '720p'}
              onValueChange={(value: string) =>
                updateField('resolution', value as '720p' | '1080p')
              }
              disabled={isGenerating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select resolution" />
              </SelectTrigger>
              <SelectContent>
                {config.resolutions?.map((res) => (
                  <SelectItem key={res.id} value={res.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{res.label}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {res.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fal.ai specific options */}
          {formData.model === 'fal-veo3' && (
            <div className="space-y-3 p-3 bg-blue-950/20 rounded-lg border border-blue-900/30">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label
                    htmlFor="generateAudio"
                    className="text-sm font-medium"
                  >
                    Generate Audio
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Add sound effects and ambient audio
                  </p>
                </div>
                <Switch
                  id="generateAudio"
                  checked={formData.generateAudio ?? true}
                  onCheckedChange={(checked) =>
                    updateField('generateAudio', checked)
                  }
                  disabled={isGenerating}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label
                    htmlFor="enhancePrompt"
                    className="text-sm font-medium flex items-center gap-1"
                  >
                    <Sparkles className="size-3" />
                    AI Prompt Enhancement
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically improve your prompt
                  </p>
                </div>
                <Switch
                  id="enhancePrompt"
                  checked={formData.enhancePrompt ?? true}
                  onCheckedChange={(checked) =>
                    updateField('enhancePrompt', checked)
                  }
                  disabled={isGenerating}
                />
              </div>
            </div>
          )}

          {/* Advanced Options Toggle */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full"
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced Options
          </Button>

          {/* Advanced Options */}
          {showAdvanced && (
            <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
              {/* Negative Prompt */}
              <div className="space-y-2">
                <Label htmlFor="negativePrompt">
                  Negative Prompt (Optional)
                </Label>
                <Textarea
                  id="negativePrompt"
                  placeholder="What to avoid in the video..."
                  value={formData.negativePrompt || ''}
                  onChange={(e) =>
                    updateField('negativePrompt', e.target.value || undefined)
                  }
                  disabled={isGenerating}
                  rows={2}
                  className="resize-none"
                />
              </div>

              {/* Seed */}
              <div className="space-y-2">
                <Label htmlFor="seed">Seed (Optional)</Label>
                <Input
                  id="seed"
                  type="number"
                  placeholder="Random seed for reproducibility"
                  value={formData.seed ?? ''}
                  onChange={(e) =>
                    updateField(
                      'seed',
                      e.target.value
                        ? Number.parseInt(e.target.value)
                        : undefined,
                    )
                  }
                  disabled={isGenerating}
                />
              </div>
            </div>
          )}

          {/* Generate Button */}
          <Button
            type="submit"
            disabled={isGenerating || !formData.prompt.trim()}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Generating Video...
              </>
            ) : (
              <>
                <VideoIcon className="mr-2 size-4" />
                Generate Video
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
