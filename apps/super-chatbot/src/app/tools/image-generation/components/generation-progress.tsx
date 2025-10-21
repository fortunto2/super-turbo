'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@turbo-super/ui';
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import type { GenerationStatus } from '../hooks/use-image-generation';

interface GenerationProgressProps {
  generationStatus: GenerationStatus;
  prompt: string;
}

export function GenerationProgress({ generationStatus, prompt }: GenerationProgressProps) {
  if (generationStatus.status === 'idle') {
    return null;
  }

  const getStatusIcon = () => {
    switch (generationStatus.status) {
      case 'pending':
      case 'processing':
        return <Loader2 className="size-5 animate-spin text-blue-400" />;
      case 'completed':
        return <CheckCircle2 className="size-5 text-green-500" />;
      case 'error':
        return <XCircle className="size-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (generationStatus.status) {
      case 'pending':
        return 'Initializing...';
      case 'processing':
        return 'Generating image...';
      case 'completed':
        return 'Image generated successfully!';
      case 'error':
        return generationStatus.message || 'Generation failed';
      default:
        return '';
    }
  };

  const getStatusColor = () => {
    switch (generationStatus.status) {
      case 'pending':
      case 'processing':
        return 'border-blue-900/50 bg-blue-950/30';
      case 'completed':
        return 'border-green-900/50 bg-green-950/30';
      case 'error':
        return 'border-red-900/50 bg-red-950/30';
      default:
        return '';
    }
  };

  return (
    <Card className={`${getStatusColor()} transition-colors`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          {getStatusIcon()}
          Generation Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Status Text */}
        <div>
          <p className="text-sm font-medium">{getStatusText()}</p>
          {prompt && generationStatus.status !== 'error' && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {prompt}
            </p>
          )}
        </div>

        {/* Progress Bar */}
        {(generationStatus.status === 'pending' || generationStatus.status === 'processing') && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span>Progress</span>
              <span>{generationStatus.progress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${generationStatus.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Estimated Time */}
        {generationStatus.estimatedTime > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="size-3" />
            <span>Estimated time: {generationStatus.estimatedTime}s</span>
          </div>
        )}

        {/* Error Message */}
        {generationStatus.status === 'error' && generationStatus.message && (
          <div className="text-xs text-red-400 bg-red-950/50 p-2 rounded border border-red-900/50">
            {generationStatus.message}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
