'use client';

import { Artifact } from '@/components/artifacts/create-artifact';
import { CopyIcon, ShareIcon, DownloadIcon } from '@/components/common/icons';
import { toast } from 'sonner';
import { Markdown } from '@/components';

export const scriptArtifact = new Artifact<'script'>({
  kind: 'script',
  description: 'Useful for script/scenario content in markdown.',
  onCreateDocument: ({ setArtifact }) => {
    // Устанавливаем статус streaming при создании артефакта
    setArtifact((draft) => ({
      ...draft,
      status: 'streaming',
      isVisible: true,
    }));
  },
  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === 'text-delta') {
      setArtifact((draftArtifact) => {
        return {
          ...draftArtifact,
          content:
            (draftArtifact.content || '') + (streamPart.content as string),
          status: 'streaming',
          isVisible:
            draftArtifact.status === 'streaming' &&
            draftArtifact.content.length > 100 &&
            draftArtifact.content.length < 200
              ? true
              : draftArtifact.isVisible,
        };
      });
    }

    if (streamPart.type === 'finish') {
      setArtifact((draft) => ({ ...draft, status: 'completed' }));
    }

    // Make artifact visible when kind is set to script
    if (streamPart.type === 'kind' && streamPart.content === 'script') {
      setArtifact((draftArtifact) => {
        return {
          ...draftArtifact,
          isVisible: true,
          status: 'streaming',
        };
      });
    }

    // Store document ID when it's available
    if (streamPart.type === 'id') {
      setArtifact((draftArtifact) => {
        console.log('📝 Script ID received:', streamPart.content);
        return {
          ...draftArtifact,
          documentId: streamPart.content as string,
        };
      });
    }

    // Add attachment when the stream is finished
    if (streamPart.type === 'finish') {
      setArtifact((draftArtifact) => {
        console.log('🎯 Script finish event triggered:', {
          eventType: streamPart.type,
          documentId: draftArtifact.documentId,
          title: draftArtifact.title,
          hasWindow: typeof window !== 'undefined',
          hasChatInstance: !!(window as any)?.chatInstance,
        });

        return {
          ...draftArtifact,
          isVisible: true,
          status: 'idle',
        };
      });
    }
  },
  content: ({ content, title }) => {
    return (
      <div className="p-8 md:p-20 max-w-4xl mx-auto w-full">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <Markdown>{content}</Markdown>
      </div>
    );
  },
  actions: [
    {
      icon: <CopyIcon size={18} />,
      description: 'Copy to clipboard',
      onClick: ({ content }) => {
        navigator.clipboard.writeText(content);
        toast.success('Copied to clipboard!');
      },
    },
    {
      icon: <DownloadIcon size={18} />,
      description: 'Download as .md file',
      onClick: ({ content, title }) => {
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title?.substring(0, 50)}.md`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Script downloaded!');
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
});
