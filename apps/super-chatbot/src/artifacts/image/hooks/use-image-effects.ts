import { useEffect, useRef } from 'react';
import type { UseChatHelpers } from '@ai-sdk/react';

interface UseImageEffectsProps {
  imageUrl?: string;
  status: string;
  append?: UseChatHelpers['append'];
  prompt: string;
  hasInitialized: boolean;
  setArtifact?: (fn: (prev: any) => any) => void;
  chatId?: string;
  resetState: () => void;
  setPrompt: (prompt: string) => void;
  initialPrompt?: string;
  setMessages?: UseChatHelpers['setMessages'];
  isArtifactMode?: boolean;
}

// AICODE-NOTE: Function to generate a valid UUID v4
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export function useImageEffects({
  imageUrl,
  status,
  append,
  prompt,
  hasInitialized,
  setArtifact,
  chatId,
  resetState,
  setPrompt,
  initialPrompt,
  setMessages,
  isArtifactMode,
  fileId,
}: UseImageEffectsProps & { fileId?: string }) {
  const savedImageUrlRef = useRef<string>('none');

  // AICODE-NOTE: Auto-save completed image to chat history for permanent access
  useEffect(() => {
    // Debug all conditions
    console.log('🔍 useImageEffects debug:', {
      imageUrl: imageUrl ? `${imageUrl.substring(0, 50)}...` : 'none',
      status,
      hasInitialized,
      chatId: chatId || 'none',
      fileId: fileId || 'none', // Добавляем логирование fileId
      setMessages: !!setMessages,
      prompt: prompt ? `${prompt.substring(0, 30)}...` : 'none',
      savedImageUrlRef: savedImageUrlRef.current,
      allConditionsMet: !!(
        imageUrl &&
        status === 'completed' &&
        chatId &&
        setMessages &&
        prompt &&
        savedImageUrlRef.current !== imageUrl
      ),
    });

    // AICODE-DEBUG: Подробное логирование fileId в useImageEffects
    console.log('🔍 useImageEffects: FileId details:', {
      receivedFileId: fileId || 'none',
      receivedChatId: chatId || 'none',
      willUseFileId: fileId || chatId,
      fallbackReason: fileId
        ? 'using received fileId'
        : 'using chatId as fallback',
      fileIdType: typeof fileId,
      chatIdType: typeof chatId,
    });

    // AICODE-DEBUG: Логирование условий для сохранения
    const saveConditions = {
      hasImageUrl: !!imageUrl,
      statusIsCompleted: status === 'completed',
      hasChatId: !!chatId,
      hasSetMessages: !!setMessages,
      hasPrompt: !!prompt,
      notAlreadySaved: savedImageUrlRef.current !== imageUrl,
      savedImageUrlRef: savedImageUrlRef.current,
      currentImageUrl: imageUrl ? `${imageUrl.substring(0, 50)}...` : 'none',
    };

    console.log('🔍 useImageEffects: Save conditions check:', saveConditions);
    console.log(
      '🔍 useImageEffects: All conditions met:',
      Object.values(saveConditions).every(Boolean),
    );

    // AICODE-FIX: Remove duplicate saveMediaToChat call
    // The saveMediaToChat is now handled in the artifact wrapper component
    // This prevents double saving to chat history
    if (
      imageUrl &&
      status === 'completed' &&
      chatId &&
      setMessages &&
      prompt &&
      savedImageUrlRef.current !== imageUrl // Prevent duplicate saves
    ) {
      console.log(
        '💾 🎨 Image generation completed, skipping auto-save to chat (handled by wrapper)',
      );
      savedImageUrlRef.current = imageUrl;
    }
  }, [imageUrl, status, hasInitialized, chatId, setMessages, prompt]);

  // Handle prompt reset
  useEffect(() => {
    // AICODE-FIX: Only reset state if not in artifact mode
    if (status === 'completed' && initialPrompt && !isArtifactMode) {
      resetState();
      setPrompt('');
    }
  }, [status, initialPrompt, resetState, setPrompt, isArtifactMode]);

  // Handle artifact update
  useEffect(() => {
    if (imageUrl && setArtifact) {
      // AICODE-DEBUG: Логирование перед обновлением артефакта
      console.log('🔍 useImageEffects: Updating artifact with:', {
        projectId: fileId || chatId,
        fileId: fileId || chatId,
        status,
        imageUrl: imageUrl ? `${imageUrl.substring(0, 50)}...` : 'none',
        prompt: prompt ? `${prompt.substring(0, 30)}...` : 'none',
        fallbackReason: fileId ? 'using fileId' : 'using chatId as fallback',
      });

      setArtifact((prev) => ({
        ...prev,
        content: JSON.stringify({
          projectId: fileId || chatId, // Use fileId for SSE connection, fallback to chatId
          fileId: fileId || chatId, // Use actual fileId if available, fallback to chatId
          status,
          imageUrl,
          prompt,
        }),
      }));
    }
  }, [imageUrl, status, chatId, prompt, setArtifact, fileId]);
}
