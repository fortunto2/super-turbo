"use client";

import { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
  Textarea,
} from "@turbo-super/ui";
import { Loader2, FileText, Copy, RefreshCw } from "lucide-react";
import { ScriptGenerationParams } from "../../types";

interface ScriptGeneratorFormProps {
  onGenerate: (params: ScriptGenerationParams) => void;
  isGenerating: boolean;
  disabled?: boolean;
  generatedScript?: string;
  onCopyScript?: () => void;
  onReset?: () => void;
}

export function ScriptGeneratorForm({
  onGenerate,
  isGenerating,
  disabled = false,
  generatedScript,
  onCopyScript,
  onReset,
}: ScriptGeneratorFormProps) {
  const [formData, setFormData] = useState<ScriptGenerationParams>({
    prompt: "",
  });

  const handleInputChange = (
    field: keyof ScriptGenerationParams,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.prompt.trim()) {
      onGenerate(formData);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="size-5" />
          AI Script Generator
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Generate professional scripts for videos, podcasts, presentations, and
          more
        </p>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Script Description */}
          <div className="space-y-2">
            <Label htmlFor="prompt">Script Description *</Label>
            <Textarea
              id="prompt"
              placeholder="Describe what you want the script to be about..."
              value={formData.prompt}
              onChange={(e) => handleInputChange("prompt", e.target.value)}
              disabled={disabled || isGenerating}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Describe the topic, message, or story you want to convey
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isGenerating || disabled}
          >
            {isGenerating ? (
              <Loader2 className="size-4 animate-spin mr-2" />
            ) : (
              <FileText className="size-4 mr-2" />
            )}
            Generate Script
          </Button>
        </form>

        {/* Generated Result */}
        {generatedScript && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Generated Script</Label>
              <div className="flex gap-2">
                {onCopyScript && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onCopyScript}
                    className="h-8 px-3"
                  >
                    <Copy className="size-3 mr-1" />
                    Copy
                  </Button>
                )}
                {onReset && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onReset}
                    className="h-8 px-3"
                  >
                    <RefreshCw className="size-3 mr-1" />
                    Reset
                  </Button>
                )}
              </div>
            </div>
            <div className="p-4 bg-gray-50 border rounded-md">
              <pre className="text-sm whitespace-pre-wrap font-sans">
                {generatedScript}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
