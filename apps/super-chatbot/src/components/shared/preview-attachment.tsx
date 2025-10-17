import type { Attachment } from '@/lib/types/attachment';

import { LoaderIcon } from '../common/icons';
import { useArtifactLegacy } from '@/hooks/use-artifact';

export const PreviewAttachment = ({
  attachment,
  isUploading = false,
  chatId,
}: {
  attachment: Attachment;
  isUploading?: boolean;
  chatId?: string;
}) => {
  const { name, url, contentType } = attachment;
  const { setArtifact } = useArtifactLegacy(chatId);

  const handleAttachmentClick = () => {
    if (contentType?.startsWith('image')) {
      // Извлекаем fileId из поля name, как мы это делаем в ImageEditing
      let extractedFileId: string | undefined;
      let displayPrompt = name || '';
      const fileIdRegex = /\[FILE_ID:([a-f0-9-]+)\]\s*(.*)/;
      const match = name?.match(fileIdRegex);

      if (match) {
        extractedFileId = match[1]; // Извлекаем fileId
        displayPrompt = match[2]?.trim() || ''; // Остальная часть имени - это prompt
      } else {
        // AICODE-DEBUG: Попробуем извлечь fileId из URL изображения
        console.log(
          '🔍 PreviewAttachment: Trying to extract fileId from URL:',
          {
            url: url,
            urlParts: url ? url.split('/') : [],
          },
        );

        // Попробуем извлечь fileId из URL (например, из /file/{fileId} или из имени файла)
        if (url) {
          // Ищем UUID в URL
          const uuidRegex =
            /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i;
          const urlMatch = url.match(uuidRegex);
          if (urlMatch) {
            extractedFileId = urlMatch[1];
            console.log(
              '🔍 PreviewAttachment: Found fileId in URL:',
              extractedFileId,
            );
          }
        }
      }

      console.log('🖼️ PreviewAttachment: Opening image from chat:', {
        url: url ? `${url.substring(0, 50)}...` : 'none',
        chatId: chatId || 'none',
        extractedFileId: extractedFileId || 'none',
        originalName: name || 'none',
        displayPrompt: displayPrompt || 'none',
        attachmentKeys: Object.keys(attachment),
        fullAttachment: attachment,
      });

      // AICODE-DEBUG: Подробное логирование извлечения fileId
      console.log('🔍 PreviewAttachment: FileId extraction details:', {
        originalName: name,
        fileIdRegex: /\[FILE_ID:([a-f0-9-]+)\]\s*(.*)/,
        regexMatch: match,
        extractedFileId: extractedFileId,
        displayPrompt: displayPrompt,
        willUseFileId: extractedFileId || chatId,
        fallbackReason: extractedFileId
          ? 'fileId found'
          : 'using chatId as fallback',
      });

      setArtifact((prev) => ({
        ...prev,
        isVisible: true,
        kind: 'image',
        content: JSON.stringify({
          status: 'completed',
          imageUrl: url,
          prompt: displayPrompt, // Используем извлеченный prompt
          projectId: extractedFileId || chatId, // Используем извлеченный fileId для SSE соединения
          fileId: extractedFileId || chatId, // Используем извлеченный fileId, с запасным вариантом chatId
        }),
        title: displayPrompt || 'Image', // Используем извлеченный prompt для заголовка
      }));
    } else if (contentType?.startsWith('video')) {
      setArtifact((prev) => ({
        ...prev,
        isVisible: true,
        kind: 'video',
        content: JSON.stringify({
          status: 'completed',
          videoUrl: url,
          prompt: name || '',
          projectId: chatId,
        }),
        title: name || 'Video',
      }));
    } else if (contentType === 'text/markdown') {
      let documentId: string | undefined;

      // Проверяем, есть ли documentId в самом attachment (приоритет)
      if ((attachment as any).documentId) {
        documentId = (attachment as any).documentId;
      }
      // Если нет, пытаемся извлечь из URL
      else if (url) {
        // URL может быть вида "/api/document?id=UUID" или просто "UUID"
        const idMatch = url.match(/[?&]id=([a-f0-9-]{36})/i);
        if (idMatch) {
          documentId = idMatch[1];
        } else {
          // Fallback: берем последнюю часть после /
          const urlParts = url.split('/');
          const lastPart = urlParts[urlParts.length - 1];
          // Проверяем, что это UUID
          if (/^[a-f0-9-]{36}$/i.test(lastPart)) {
            documentId = lastPart;
          }
        }
      }

      const kind = (attachment as any).kind === 'script' ? 'script' : 'text';

      console.log('📄 PreviewAttachment: Opening markdown document:', {
        documentId,
        kind,
        url,
        name,
        attachment: attachment,
      });

      if (documentId) {
        // Открываем артефакт - хук useArtifact автоматически сохранит в localStorage
        setArtifact({
          isVisible: true,
          kind,
          documentId,
          title: name || (kind === 'script' ? 'Script' : 'Document'),
          status: 'idle' as const,
          content: '',
          boundingBox: {
            top: 0,
            left: 0,
            width: 0,
            height: 0,
          },
        });
      } else {
        console.error(
          '❌ PreviewAttachment: Could not extract documentId from attachment',
        );
      }
    }
  };

  return (
    <div data-testid="input-attachment-preview" className="flex flex-col gap-2">
      <div className="w-20 h-16 aspect-video bg-muted rounded-md relative flex flex-col items-center justify-center">
        {contentType ? (
          contentType.startsWith('image') ? (
            // NOTE: it is recommended to use next/image for images
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={url}
              src={url}
              alt={name ?? 'An image attachment'}
              className="rounded-md size-full object-cover cursor-pointer"
              onClick={handleAttachmentClick}
            />
          ) : contentType.startsWith('video') ? (
            <div
              role="button"
              tabIndex={0}
              className="rounded-md size-full bg-black cursor-pointer flex items-center justify-center relative"
              onClick={handleAttachmentClick}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleAttachmentClick();
                }
              }}
            >
              {/* Use thumbnail if available (from attachment.thumbnailUrl) */}
              {(attachment as any).thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={(attachment as any).thumbnailUrl}
                  alt={name ?? 'Video thumbnail'}
                  className="rounded-md size-full object-cover"
                />
              ) : (
                <span className="text-white text-lg">🎬</span>
              )}
              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/50 rounded-full p-1">
                  <span className="text-white text-xs">▶</span>
                </div>
              </div>
            </div>
          ) : contentType === 'text/markdown' ? (
            <div
              role="button"
              tabIndex={0}
              className="rounded-md size-full bg-white cursor-pointer flex items-center justify-center relative border border-zinc-200"
              onClick={handleAttachmentClick}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleAttachmentClick();
                }
              }}
            >
              <span className="text-zinc-700 text-2xl">📄</span>
            </div>
          ) : (
            <div className="" />
          )
        ) : (
          <div className="" />
        )}

        {isUploading && contentType !== 'text/markdown' && (
          <div
            data-testid="input-attachment-loader"
            className="animate-spin absolute text-zinc-500"
          >
            <LoaderIcon />
          </div>
        )}
      </div>
      <div className="text-xs text-zinc-500 max-w-16 truncate">{name}</div>
    </div>
  );
};
