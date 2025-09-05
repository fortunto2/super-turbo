"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Textarea,
  Button,
  Label,
  Input,
} from "@turbo-super/ui";
import {
  FileText,
  Play,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface GenerationConfig {
  id: string;
  name: string;
  type: string;
  source: string;
  params?: Record<string, any>;
}

interface ProjectVideoCreate {
  template_name: string;
  config: {
    prompt: string;
    aspect_ratio: string;
    image_generation_config_name: string;
    auto_mode: boolean;
    seed: number;
    quality: string;
    entity_ids: string[];
    // Additional fields for API
    dynamic?: number;
    image_model_type?: string;
    voiceover_volume?: number;
    music_volume?: number;
    sound_effect_volume?: number;
    watermark?: boolean;
    subtitles?: boolean;
    voiceover?: boolean;
  };
}

export default function StoryEditorPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [generationConfig, setGenerationConfig] = useState("");
  const [seed, setSeed] = useState("42");
  const [quality, setQuality] = useState("sd");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationConfigs, setGenerationConfigs] = useState<
    GenerationConfig[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Loading generation configurations
  useEffect(() => {
    const loadGenerationConfigs = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/story-editor/configs");
        const result = await response.json();

        if (result.success) {
          setGenerationConfigs(result.configs);
          if (result.configs.length > 0) {
            const defaultConfig = result.configs.find(
              (config: GenerationConfig) => config.name === "comfyui/flux"
            );
            setGenerationConfig(defaultConfig?.name || result.configs[0].name);
          }
        } else {
          setError("Error loading generation configurations");
        }
      } catch (err) {
        setError("Error loading generation configurations");
      } finally {
        setIsLoading(false);
      }
    };

    loadGenerationConfigs();
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Enter a prompt for generation");
      return;
    }

    if (!generationConfig) {
      setError("Select generation configuration");
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);
      setSuccess(null);

      const payload: ProjectVideoCreate = {
        template_name: "story",
        config: {
          prompt: prompt.trim(),
          aspect_ratio: aspectRatio,
          image_generation_config_name: generationConfig,
          auto_mode: true,
          seed: Number(seed),
          quality: quality,
          entity_ids: [],
          // Add additional fields for API
          dynamic: 1,
          voiceover_volume: 0.5,
          music_volume: 0.5,
          sound_effect_volume: 0.5,
          watermark: false,
          subtitles: false,
          voiceover: false,
        },
      };

      // Call API for video generation
      const response = await fetch("/api/story-editor/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(`Video is generating! Project ID: ${result.projectId}`);

        // Redirect to tracking page after 2 seconds
        setTimeout(() => {
          router.push(`/project/video/${result.projectId}/generate`);
        }, 2000);
      } else {
        throw new Error(result.error || "Video generation error");
      }
    } catch (err: any) {
      setError(err.message || "Video generation error");
    } finally {
      setIsGenerating(false);
    }
  };

  const aspectRatioOptions = [
    { value: "16:9", label: "16:9 (Landscape)" },
    { value: "9:16", label: "9:16 (Portrait)" },
    { value: "1:1", label: "1:1 (Square)" },
    { value: "4:3", label: "4:3 (Classic)" },
  ];

  const qualityOptions = [
    { value: "sd", label: "Standard (SD)" },
    { value: "hd", label: "HD" },
    { value: "4k", label: "4K (Full HD)" },
  ];

  if (isLoading) {
    return (
      <div className="mt-10 text-center space-y-4 size-full items-center justify-center flex flex-col">
        <div className="relative">
          <div className="size-16 border-4 border-emerald-200 dark:border-emerald-800 rounded-full animate-spin" />
          <div className="absolute top-0 left-0 size-16 border-4 border-transparent border-t-emerald-500 dark:border-t-emerald-400 rounded-full animate-spin" />
        </div>
        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
            Loading generation configurations...
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Preparing your Story Editor
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background w-full">
      <div className="container mx-auto px-4 py-8 w-full max-w-4xl">
        <div className="w-full space-y-8">
          {/* Main content */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Story Editor
            </h1>
                      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create videos using AI models with SuperDuperAI Project Video API
          </p>

            {/* "My Projects" button */}
            <div className="pt-4">
              <Link href="/project/video/projects">
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2"
                >
                  <FileText className="h-5 w-5" />
                  My Projects
                </Button>
              </Link>
            </div>
          </div>

          {/* Generation form */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="size-6 text-emerald-600" />
                <span>Video Generation</span>
              </CardTitle>
              <CardDescription>
                Fill out the form and click &quot;Generate Video&quot;
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Prompt input */}
              <div className="space-y-2">
                <Label htmlFor="prompt">Generation Prompt</Label>
                <Textarea
                  id="prompt"
                  placeholder="Describe the video you want to create..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Configuration options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Aspect ratio */}
                <div className="space-y-2">
                  <Label htmlFor="aspect-ratio">Aspect Ratio</Label>
                  <Select
                    value={aspectRatio}
                    onValueChange={setAspectRatio}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {aspectRatioOptions.map((option, index) => (
                        <SelectItem
                          key={index}
                          value={option.value}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Generation config */}
                <div className="space-y-2">
                  <Label htmlFor="generation-config">
                    Generation Configuration
                  </Label>
                  <Select
                    value={generationConfig}
                    onValueChange={setGenerationConfig}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {generationConfigs.map((config, index) => (
                        <SelectItem
                          key={index}
                          value={config.name}
                        >
                          {config.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Seed */}
                <div className="space-y-2">
                  <Label htmlFor="seed">Seed</Label>
                  <Input
                    id="seed"
                    type="number"
                    value={seed}
                    onChange={(e) => setSeed(e.target.value)}
                    placeholder="42"
                  />
                </div>

                {/* Quality */}
                <div className="space-y-2">
                  <Label htmlFor="quality">Quality</Label>
                  <Select
                    value={quality}
                    onValueChange={setQuality}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {qualityOptions.map((option, index) => (
                        <SelectItem
                          key={index}
                          value={option.value}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Error/Success messages */}
              {error && (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
                  <AlertCircle className="size-5" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-md">
                  <CheckCircle className="size-5" />
                  <span>{success}</span>
                  <div className="text-sm text-green-500">
                    Redirecting to tracking page...
                  </div>
                </div>
              )}

              {/* Generate button */}
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Play className="size-4 mr-2" />
                    Generate Video
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Footer info */}
          <div className="text-center text-sm text-muted-foreground border-t pt-8 mt-12">
            <p>
              Powered by <strong>SuperDuperAI</strong> • Project Video API for
              generating professional videos
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
