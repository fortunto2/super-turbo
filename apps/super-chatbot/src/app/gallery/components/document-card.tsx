'use client';

import { Card } from '@turbo-super/ui';
import {
  FileIcon,
  ImageIcon,
  PlayIcon,
  LineChartIcon,
} from '@/components/common/icons';
import { formatDistance } from 'date-fns';
import { useRouter } from 'next/navigation';
import type { ArtifactKind } from '@/components/artifacts/artifact';

interface DocumentCardProps {
  document: {
    id: string;
    title: string;
    kind: ArtifactKind;
    thumbnailUrl?: string;
    createdAt: Date;
    userId: string;
    username?: string;
    model?: string;
    tags: string[];
    viewCount: number;
    visibility: 'public' | 'private';
    metadata: Record<string, any>;
  };
}

// AICODE-NOTE: Document cards link to existing /artifact/[id] routes
export function DocumentCard({ document }: DocumentCardProps) {
  const router = useRouter();

  const getIcon = () => {
    switch (document.kind) {
      case 'image':
        return <ImageIcon size={24} />;
      case 'video':
        return <PlayIcon size={24} />;
      case 'sheet':
        return <LineChartIcon size={24} />;
      default:
        return <FileIcon size={24} />;
    }
  };

  const getThumbnail = () => {
    if (document.thumbnailUrl) {
      return (
        <div className="relative h-48 overflow-hidden bg-muted">
          <img
            src={document.thumbnailUrl}
            alt={document.title}
            className="w-full h-full object-cover"
          />
        </div>
      );
    }
    // Если нет thumbnail, но есть imageUrl
    if (document.metadata?.imageUrl) {
      return (
        <div className="relative h-48 overflow-hidden bg-muted">
          <img
            src={document.metadata.imageUrl}
            alt={document.title}
            className="w-full h-full object-cover"
          />
        </div>
      );
    }
    // Fallback thumbnail for different types
    return (
      <div className="h-48 bg-muted flex items-center justify-center">
        <div className="text-muted-foreground">{getIcon()}</div>
      </div>
    );
  };

  return (
    <Card
      className="overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
      onClick={() => router.push(`/artifact/${document.id}`)}
    >
      {/* Thumbnail */}
      {getThumbnail()}

      {/* Content - фиксированная высота для консистентности */}
      <div className="p-4 space-y-3 min-h-[140px] flex flex-col">
        {/* Title and type */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium line-clamp-2 flex-1">{document.title}</h3>
          <span className="shrink-0 px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded">
            {document.kind}
          </span>
        </div>

        {/* Model badge - всегда резервируем место */}
        <div className="h-6">
          {document.model && (
            <span className="inline-block px-2 py-1 text-xs border rounded">
              {document.model}
            </span>
          )}
        </div>

        {/* Tags - всегда резервируем место */}
        <div className="h-6">
          {document.tags && document.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {document.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="px-2 py-1 text-xs border rounded">
                  {tag}
                </span>
              ))}
              {document.tags.length > 3 && (
                <span className="px-2 py-1 text-xs border rounded">
                  +{document.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer - всегда внизу */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
          <span>
            {formatDistance(new Date(document.createdAt), new Date(), {
              addSuffix: true,
            })}
          </span>
          <div className="flex items-center gap-2">
            {document.visibility === 'public' && (
              <span className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded">
                Public
              </span>
            )}
            <span>{document.viewCount} views</span>
          </div>
        </div>

        {/* Username - removed to hide user email */}
      </div>
    </Card>
  );
}
