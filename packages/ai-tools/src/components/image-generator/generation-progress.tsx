"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
} from "@turbo-super/ui";
import { Loader2, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { GenerationStatus } from "../../types";

interface GenerationProgressProps {
  generationStatus: GenerationStatus;
  onForceCheck?: () => void;
}

function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
      <div
        className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function GenerationProgress({
  generationStatus,
  onForceCheck,
}: GenerationProgressProps) {
  if (generationStatus.status === "idle") {
    return null;
  }

  const getStatusIcon = () => {
    switch (generationStatus.status) {
      case "generating":
        return <Loader2 className="size-5 animate-spin" />;
      case "completed":
        return <CheckCircle className="size-5 text-green-500" />;
      case "error":
        return <XCircle className="size-5 text-red-500" />;
      default:
        return <Loader2 className="size-5" />;
    }
  };

  const getStatusColor = () => {
    switch (generationStatus.status) {
      case "generating":
        return "text-blue-600";
      case "completed":
        return "text-green-600";
      case "error":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getProgressValue = () => {
    if (generationStatus.status === "completed") return 100;
    if (generationStatus.status === "error") return 0;
    return generationStatus.progress || 0;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          <span className={getStatusColor()}>
            {generationStatus.status === "generating" && "Generating Image..."}
            {generationStatus.status === "completed" && "Generation Complete!"}
            {generationStatus.status === "error" && "Generation Failed"}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{getProgressValue()}%</span>
          </div>
          <Progress
            value={getProgressValue()}
            className="w-full"
          />
        </div>

        {/* Status Message */}
        {generationStatus.message && (
          <div className="text-sm text-muted-foreground">
            {generationStatus.message}
          </div>
        )}

        {/* Error Message */}
        {generationStatus.status === "error" && generationStatus.error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-800">
              <strong>Error:</strong> {generationStatus.error}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {generationStatus.status === "generating" && onForceCheck && (
            <Button
              variant="outline"
              size="sm"
              onClick={onForceCheck}
              className="flex items-center gap-2"
            >
              <RefreshCw className="size-4" />
              Check Status
            </Button>
          )}

          {generationStatus.status === "error" && onForceCheck && (
            <Button
              variant="outline"
              size="sm"
              onClick={onForceCheck}
              className="flex items-center gap-2"
            >
              <RefreshCw className="size-4" />
              Retry
            </Button>
          )}
        </div>

        {/* Generation Details */}
        {generationStatus.status === "completed" && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <p className="text-sm text-green-800">
              <strong>Success!</strong> Your image has been generated
              successfully.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
