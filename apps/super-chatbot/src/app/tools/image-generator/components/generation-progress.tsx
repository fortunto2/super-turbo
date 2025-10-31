'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, Button } from '@turbo-super/ui';
import { Loader2, Image, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import NextImage from 'next/image';

// AICODE-NOTE: Simple Progress component since it's not available in UI library
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

// AICODE-NOTE: Simple Badge component since it's not available in UI library
function Badge({
  children,
  variant = 'default',
  className,
}: {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  className?: string;
}) {
  const baseClasses =
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';
  const variantClasses = {
    default: 'bg-blue-600 text-white',
    secondary: 'bg-gray-100 text-gray-900',
    outline: 'border border-gray-200 bg-white text-gray-900',
    destructive: 'bg-red-600 text-white',
  };

  return (
    <span
      className={`${baseClasses} ${variantClasses[variant]} ${className || ''}`}
    >
      {children}
    </span>
  );
}

export interface GenerationStatus {
  status: 'idle' | 'pending' | 'processing' | 'completed' | 'error';
  progress?: number;
  message?: string;
  estimatedTime?: number;
  projectId?: string;
  requestId?: string;
  fileId?: string;
  url?: string;
}

interface GenerationProgressProps {
  generationStatus: GenerationStatus;
  prompt?: string;
  onForceCheck?: () => Promise<void>;
}

export function GenerationProgress({
  generationStatus,
  prompt,
  onForceCheck,
}: GenerationProgressProps) {
  const [displayProgress, setDisplayProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isCheckingResults, setIsCheckingResults] = useState(false);

  // AICODE-NOTE: Animate progress bar smoothly
  useEffect(() => {
    if (generationStatus.progress !== undefined) {
      const timer = setTimeout(() => {
        setDisplayProgress(generationStatus.progress || 0);
      }, 100);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [generationStatus.progress]);

  // AICODE-NOTE: Track elapsed time during generation
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (
      generationStatus.status === 'processing' ||
      generationStatus.status === 'pending'
    ) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedTime(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [generationStatus.status]);

  // Don't render if idle
  if (generationStatus.status === 'idle') {
    return null;
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const getStatusIcon = () => {
    switch (generationStatus.status) {
      case 'pending':
        return <Loader2 className="size-5 animate-spin text-blue-500" />;
      case 'processing':
        return <Image className="size-5 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="size-5 text-green-500" />;
      case 'error':
        return <XCircle className="size-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = () => {
    switch (generationStatus.status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'processing':
        return <Badge variant="default">Processing</Badge>;
      case 'completed':
        return (
          <Badge variant="outline" className="text-green-600 border-green-200">
            Completed
          </Badge>
        );
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return null;
    }
  };

  const getStatusMessage = () => {
    if (generationStatus.message) {
      return generationStatus.message;
    }

    switch (generationStatus.status) {
      case 'pending':
        return 'Preparing your image generation request...';
      case 'processing':
        return 'Generating your image using AI models...';
      case 'completed':
        return 'Image generated successfully!';
      case 'error':
        return 'Failed to generate image. Please try again.';
      default:
        return '';
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Status Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <span className="font-medium">
                {generationStatus.status === 'processing'
                  ? 'Generating Image'
                  : 'Image Generation'}
              </span>
            </div>
            {getStatusBadge()}
          </div>

          {/* Prompt Display */}
          {prompt && (
            <div className="bg-muted rounded-md p-3">
              <p className="text-sm text-muted-foreground mb-1">Prompt:</p>
              <p className="text-sm font-medium line-clamp-2">{prompt}</p>
            </div>
          )}

          {/* Progress Bar - only show during processing */}
          {(generationStatus.status === 'processing' ||
            generationStatus.status === 'pending') && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(displayProgress)}%</span>
              </div>
              <Progress value={displayProgress} className="w-full h-2" />
            </div>
          )}

          {/* Status Message */}
          <p className="text-sm text-muted-foreground">{getStatusMessage()}</p>

          {/* Time and Metadata */}
          <div className="flex justify-between text-xs text-muted-foreground">
            <div className="space-x-4">
              {elapsedTime > 0 && (
                <span>Elapsed: {formatTime(elapsedTime)}</span>
              )}
              {generationStatus.estimatedTime &&
                generationStatus.status === 'processing' && (
                  <span>
                    Est. remaining:{' '}
                    {formatTime(
                      Math.max(0, generationStatus.estimatedTime - elapsedTime),
                    )}
                  </span>
                )}
            </div>

            <div className="space-x-2">
              {generationStatus.projectId && (
                <span className="font-mono">
                  ID: {generationStatus.projectId.slice(-8)}
                </span>
              )}
            </div>
          </div>

          {/* Force Check Button - only show during processing/pending */}
          {onForceCheck &&
            (generationStatus.status === 'processing' ||
              generationStatus.status === 'pending') && (
              <div className="pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    setIsCheckingResults(true);
                    try {
                      await onForceCheck();
                    } finally {
                      setIsCheckingResults(false);
                    }
                  }}
                  disabled={isCheckingResults}
                  className="w-full"
                >
                  {isCheckingResults ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Checking results...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="size-4 mr-2" />
                      Check for results
                    </>
                  )}
                </Button>
              </div>
            )}

          {/* Image Display */}
          {generationStatus.status === 'completed' && generationStatus.url && (
            <div className="mt-4">
              <NextImage
                src={generationStatus.url}
                alt={`Generated image: ${prompt || 'Generated image'}`}
                width={600}
                height={384}
                className="w-full h-auto rounded-lg border max-h-96 object-contain"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
