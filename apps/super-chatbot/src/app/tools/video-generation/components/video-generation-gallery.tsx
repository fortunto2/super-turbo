"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
} from "@turbo-super/ui";
import { Download, Copy, Trash2, X, VideoIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import type { GeneratedVideoResult } from "../api/video-generation-api";

interface VideoGenerationGalleryProps {
  generatedVideos: GeneratedVideoResult[];
  currentGeneration: GeneratedVideoResult | null;
  onDeleteVideo: (videoId: string) => void;
  onClearAll: () => void;
  onDownloadVideo: (url: string, filename: string) => void;
  onCopyVideoUrl: (url: string) => void;
  isGenerating: boolean;
}

export function VideoGenerationGallery({
  generatedVideos,
  currentGeneration,
  onDeleteVideo,
  onClearAll,
  onDownloadVideo,
  onCopyVideoUrl,
  isGenerating,
}: VideoGenerationGalleryProps) {
  const [selectedVideo, setSelectedVideo] =
    useState<GeneratedVideoResult | null>(null);

  const allVideos = currentGeneration
    ? [
        currentGeneration,
        ...generatedVideos.filter((vid) => vid.id !== currentGeneration.id),
      ]
    : generatedVideos;

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <VideoIcon className="size-5" />
              Generated Videos
              {allVideos.length > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  ({allVideos.length})
                </span>
              )}
            </CardTitle>
            {allVideos.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearAll}
                disabled={isGenerating}
              >
                <Trash2 className="size-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto h-full">
          {isGenerating && allVideos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="size-12 animate-spin text-blue-400" />
              <p className="text-sm text-muted-foreground">
                Generating your video with VEO3...
              </p>
            </div>
          ) : allVideos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
              <div className="p-4 rounded-full bg-muted/50 border border-border">
                <VideoIcon className="size-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">No videos yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Generate your first video to see it here
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {allVideos.map((video, index) => (
                <div
                  key={video.id}
                  className="group relative rounded-lg border border-border overflow-hidden hover:border-blue-500 transition-colors bg-card"
                >
                  {/* Video Thumbnail */}
                  <div
                    className="relative h-40 cursor-pointer bg-black"
                    onClick={() => setSelectedVideo(video)}
                  >
                    <video
                      src={video.url}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                      <div className="p-3 rounded-full bg-white/90">
                        <VideoIcon className="size-6 text-black" />
                      </div>
                    </div>
                    {index === 0 && currentGeneration?.id === video.id && (
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded">
                          Latest
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="p-2 border-t border-border">
                    <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                      {video.prompt}
                    </p>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          onDownloadVideo(video.url, `video-${video.id}.mp4`)
                        }
                        className="flex-1 h-7 text-xs px-2"
                      >
                        <Download className="size-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onCopyVideoUrl(video.url)}
                        className="flex-1 h-7 text-xs px-2"
                      >
                        <Copy className="size-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeleteVideo(video.id)}
                        className="h-7 px-2"
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Video Preview Modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh]">
            <Button
              variant="outline"
              size="sm"
              className="absolute top-4 right-4 z-10"
              onClick={() => setSelectedVideo(null)}
            >
              <X className="size-4" />
            </Button>
            <div className="relative w-full h-full">
              <video
                src={selectedVideo.url}
                controls
                autoPlay
                className="w-full h-auto max-h-[80vh] rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="mt-4 p-4 bg-card border border-border rounded-lg">
              <p className="text-sm">{selectedVideo.prompt}</p>
              {selectedVideo.settings && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedVideo.settings.duration && (
                    <span className="text-xs px-2 py-1 bg-muted rounded">
                      Duration: {selectedVideo.settings.duration}s
                    </span>
                  )}
                  {selectedVideo.settings.aspectRatio && (
                    <span className="text-xs px-2 py-1 bg-muted rounded">
                      Ratio: {selectedVideo.settings.aspectRatio}
                    </span>
                  )}
                  {selectedVideo.settings.seed && (
                    <span className="text-xs px-2 py-1 bg-muted rounded">
                      Seed: {selectedVideo.settings.seed}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
