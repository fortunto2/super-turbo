import { Artifact } from '@/components/artifacts/create-artifact';
import {
  CopyIcon,
  ShareIcon,
  UndoIcon,
  RedoIcon,
} from '@/components/common/icons';
import { toast } from 'sonner';

// Import console helpers for debugging (auto-exposes in browser)
import '@/lib/utils/console-helpers';
import { VideoArtifactWrapper } from '@/artifacts/video';

export default function ArtifactContentVideo(props: any) {
  return <VideoArtifactWrapper {...props} />;
}

export const videoArtifact = new Artifact({
  kind: 'video',
  description: 'Useful for video generation with real-time progress tracking',
  onCreateDocument: ({ setArtifact }) => {
    // Устанавливаем статус streaming при создании артефакта
    setArtifact((draft) => ({
      ...draft,
      status: 'streaming',
      isVisible: true,
    }));
  },
  content: ArtifactContentVideo,
  actions: [
    {
      icon: <UndoIcon size={18} />,
      description: 'View Previous version',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('prev');
      },
      isDisabled: ({ currentVersionIndex }) => {
        if (currentVersionIndex === 0) {
          return true;
        }
        return false;
      },
    },
    {
      icon: <RedoIcon size={18} />,
      description: 'View Next version',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('next');
      },
      isDisabled: ({ isCurrentVersion }) => {
        if (isCurrentVersion) {
          return true;
        }
        return false;
      },
    },
    {
      icon: <CopyIcon size={18} />,
      description: 'Copy video URL',
      onClick: ({ content }) => {
        try {
          const parsedContent = JSON.parse(content);
          if (parsedContent.status === 'completed' && parsedContent.videoUrl) {
            navigator.clipboard.writeText(parsedContent.videoUrl);
            toast.success('Video URL copied to clipboard!');
          } else {
            toast.error('Video is not ready yet');
          }
        } catch {
          toast.error('Unable to copy video URL');
        }
      },
      isDisabled: ({ content }) => {
        try {
          const parsedContent = JSON.parse(content);
          return parsedContent.status !== 'completed';
        } catch {
          return true;
        }
      },
    },
    {
      icon: <ShareIcon size={18} />,
      description: 'Copy artifact link',
      onClick: (context) => {
        const documentId = (context as any).documentId;
        if (documentId && documentId !== 'init') {
          const shareUrl = `${window.location.origin}/artifact/${documentId}`;
          navigator.clipboard.writeText(shareUrl);
          toast.success('Artifact link copied to clipboard!');
        } else {
          toast.error('Unable to generate share link - artifact not saved yet');
        }
      },
    },
  ],
  toolbar: [],
  onStreamPart: ({ streamPart, setArtifact }) => {
    // Handle text-delta with JSON content from server
    if (streamPart.type === 'text-delta') {
      const newContent = streamPart.content as string;
      try {
        const parsedContent = JSON.parse(newContent);
        setArtifact((draftArtifact) => ({
          ...draftArtifact,
          content: newContent,
          status: parsedContent.status || 'streaming', // Обновляем статус из контента
          // Открываем артефакт если генерация завершена, в процессе или только началась
          isVisible:
            parsedContent.status === 'completed' ||
            parsedContent.status === 'pending' ||
            parsedContent.status === 'streaming' ||
            draftArtifact.status === 'streaming',
        }));
      } catch {
        // Invalid JSON - don't overwrite existing content
        console.log('🎬 ⚠️ Skipping invalid JSON content in stream part');
      }
    }

    // Handle finish event to complete generation
    if (streamPart.type === 'finish') {
      setArtifact((draftArtifact) => {
        try {
          // Try to parse content and add completion status
          const parsedContent = JSON.parse(draftArtifact.content || '{}');

          // Check for error status
          if (parsedContent.status === 'error' || parsedContent.error) {
            console.error(
              '🎬 ❌ Video generation error in artifact:',
              parsedContent.error,
            );
            return {
              ...draftArtifact,
              content: JSON.stringify({
                ...parsedContent,
                status: 'error',
                timestamp: Date.now(),
              }),
              status: 'completed',
            };
          }

          // If the parsed content has videoUrl, mark as completed with videoUrl
          if (parsedContent.videoUrl || parsedContent.status === 'completed') {
            const updatedContent = {
              ...parsedContent,
              status: 'completed',
            };

            return {
              ...draftArtifact,
              content: JSON.stringify(updatedContent),
              status: 'completed',
            };
          }

          // For other content, just mark as idle
          return {
            ...draftArtifact,
            status: 'completed',
          };
        } catch (error) {
          console.error('🎬 ❌ Error parsing video artifact content:', error);
          // If content is not JSON, mark as error
          return {
            ...draftArtifact,
            content: JSON.stringify({
              status: 'error',
              error: 'Failed to parse video generation result',
              timestamp: Date.now(),
            }),
            status: 'completed',
          };
        }
      });
    }
  },
});
