"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@turbo-super/ui";
import { toast } from "sonner";

interface ErrorDisplayProps {
  error: string;
  title?: string;
  onRetry?: () => void;
  showRetry?: boolean;
  className?: string;
}

export function ErrorDisplay({
  error,
  title = "An error occurred",
  onRetry,
  showRetry = true,
  className = "",
}: ErrorDisplayProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      toast.info("Retry function is not available");
    }
  };

  return (
    <Card className={`border-red-200 bg-red-50 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-red-800 text-lg">
          <AlertCircle className="size-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-red-700 text-sm leading-relaxed">{error}</div>

        {showRetry && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              <RefreshCw className="size-4 mr-2" />
              Try again
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.reload()}
              className="text-red-600 hover:bg-red-100"
            >
              Reload page
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface VideoErrorDisplayProps {
  error: string;
  prompt?: string;
  onRetry?: () => void;
}

export function VideoErrorDisplay({
  error,
  prompt,
  onRetry,
}: VideoErrorDisplayProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <ErrorDisplay
        error={error}
        title="Video generation error"
        onRetry={onRetry}
      />
      {prompt && (
        <div className="mt-3 p-3 bg-red-100 rounded-md border border-red-200">
          <p className="text-sm text-red-600 font-medium mb-1">Prompt:</p>
          <p className="text-sm text-red-700 italic">&ldquo;{prompt}&rdquo;</p>
        </div>
      )}
    </div>
  );
}

interface ImageErrorDisplayProps {
  error: string;
  prompt?: string;
  onRetry?: () => void;
}

export function ImageErrorDisplay({
  error,
  prompt,
  onRetry,
}: ImageErrorDisplayProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <ErrorDisplay
        error={error}
        title="Image generation error"
        onRetry={onRetry}
      />
      {prompt && (
        <div className="mt-3 p-3 bg-red-100 rounded-md border border-red-200">
          <p className="text-sm text-red-600 font-medium mb-1">Prompt:</p>
          <p className="text-sm text-red-700 italic">&ldquo;{prompt}&rdquo;</p>
        </div>
      )}
    </div>
  );
}
