"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
} from "@turbo-super/ui";
import {
  VideoIcon,
  Download,
  Copy,
  Trash2,
  Eye,
  Play,
  Pause,
} from "lucide-react";
import { GeneratedVideo } from "../../types";

interface VideoGalleryProps {
  videos: GeneratedVideo[];
  currentGeneration: GeneratedVideo | null;
  onDeleteVideo: (videoId: string) => void;
  onClearAll: () => void;
  onDownloadVideo: (video: GeneratedVideo) => Promise<void>;
  onCopyVideoUrl: (video: GeneratedVideo) => Promise<void>;
}

export function VideoGallery({
  videos,
  currentGeneration,
  onDeleteVideo,
  onClearAll,
  onDownloadVideo,
  onCopyVideoUrl,
}: VideoGalleryProps) {
  const [selectedVideo, setSelectedVideo] = useState<GeneratedVideo | null>(
    null
  );
  const [playingVideos, setPlayingVideos] = useState<Set<string>>(new Set());

  const toggleVideoPlay = (videoId: string) => {
    const newPlayingVideos = new Set(playingVideos);
    if (newPlayingVideos.has(videoId)) {
      newPlayingVideos.delete(videoId);
    } else {
      newPlayingVideos.add(videoId);
    }
    setPlayingVideos(newPlayingVideos);
  };

  if (videos.length === 0 && !currentGeneration) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <VideoIcon className="size-5" />
            Generated Videos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <VideoIcon className="size-12 mx-auto mb-4 opacity-50" />
            <p>No videos generated yet</p>
            <p className="text-sm">Generate your first video to see it here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const allVideos = currentGeneration ? [currentGeneration, ...videos] : videos;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <VideoIcon className="size-5" />
            Generated Videos ({allVideos.length})
          </CardTitle>
          {videos.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearAll}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="size-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
          {allVideos.map((video) => (
            <div
              key={video.id}
              className={`relative group border rounded-lg overflow-hidden ${
                currentGeneration?.id === video.id ? "ring-2 ring-blue-500" : ""
              }`}
            >
              <div className="aspect-video bg-gray-100 flex items-center justify-center relative">
                {video.url ? (
                  <>
                    <video
                      src={video.url}
                      className="w-full h-full object-cover"
                      controls={false}
                      muted
                      loop
                      onPlay={() => toggleVideoPlay(video.id)}
                      onPause={() => toggleVideoPlay(video.id)}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-10 w-10 p-0 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70"
                        onClick={() => toggleVideoPlay(video.id)}
                      >
                        {playingVideos.has(video.id) ? (
                          <Pause className="size-4" />
                        ) : (
                          <Play className="size-4" />
                        )}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <VideoIcon className="size-8 mx-auto mb-2" />
                    <p className="text-sm">Loading...</p>
                  </div>
                )}
              </div>

              {/* Video Info */}
              <div className="p-3 bg-white border-t">
                <p
                  className="text-sm font-medium truncate"
                  title={video.prompt}
                >
                  {video.prompt}
                </p>
                <p className="text-xs text-muted-foreground">
                  {video.model} • {video.duration}s •{" "}
                  {new Date(video.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setSelectedVideo(video)}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="size-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onDownloadVideo(video)}
                    className="h-8 w-8 p-0"
                  >
                    <Download className="size-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onCopyVideoUrl(video)}
                    className="h-8 w-8 p-0"
                  >
                    <Copy className="size-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDeleteVideo(video.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>

              {/* Current Generation Indicator */}
              {currentGeneration?.id === video.id && (
                <div className="absolute top-2 left-2">
                  <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    Generating...
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Video Preview Modal */}
        {selectedVideo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-semibold">Video Preview</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedVideo(null)}
                >
                  ×
                </Button>
              </div>
              <div className="p-4">
                <video
                  src={selectedVideo.url}
                  controls
                  className="w-full h-auto max-h-[60vh]"
                />
                <div className="mt-4">
                  <p className="font-medium mb-2">Prompt:</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {selectedVideo.prompt}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => onDownloadVideo(selectedVideo)}
                    >
                      <Download className="size-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onCopyVideoUrl(selectedVideo)}
                    >
                      <Copy className="size-4 mr-2" />
                      Copy URL
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
