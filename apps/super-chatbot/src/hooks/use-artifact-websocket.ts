'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useArtifactLegacy } from '@/hooks/use-artifact';
import { imageWebsocketStore } from '@/artifacts/image/stores/image-websocket-store';
import { getSuperduperAIConfig } from '@/lib/config/superduperai';
import type { ImageEventHandler } from '@/artifacts/image/stores/image-websocket-store';

interface UseArtifactWebSocketOptions {
  enabled?: boolean;
}

export const useArtifactWebSocket = ({
  enabled = true,
}: UseArtifactWebSocketOptions = {}) => {
  const { artifact, setArtifact } = useArtifactLegacy();
  const currentProjectIdRef = useRef<string | null>(null);
  const currentRequestIdRef = useRef<string | null>(null);
  const eventHandlerRef = useRef<ImageEventHandler | null>(null);
  const isConnectedRef = useRef(false);

  // Parse current artifact content to get projectId and requestId
  const getArtifactInfo = useCallback(() => {
    if (
      !artifact.content ||
      (artifact.kind !== 'image' && artifact.kind !== 'video')
    ) {
      return { projectId: null, requestId: null };
    }

    try {
      const parsedContent = JSON.parse(artifact.content);
      return {
        projectId: parsedContent.projectId || null,
        requestId: parsedContent.requestId || null,
      };
    } catch (error) {
      console.log('🔌 Artifact WebSocket: Could not parse artifact content');
      return { projectId: null, requestId: null };
    }
  }, [artifact.content, artifact.kind]);

  // Create event handler for media completion (image or video)
  const createEventHandler = useCallback(
    (projectId: string, requestId: string): ImageEventHandler => {
      return (eventData) => {
        console.log('🔌 Artifact WebSocket: Received event:', {
          type: eventData.type,
          projectId: eventData.projectId,
          requestId: eventData.requestId,
          targetProjectId: projectId,
          targetRequestId: requestId,
          objectType: eventData.object?.type,
        });

        if (eventData.type === 'file' && eventData.object?.url) {
          const mediaUrl = eventData.object.url;
          const mediaType = eventData.object.type; // 'image' or 'video'

          console.log(
            '🔌 Artifact WebSocket: Updating artifact with completed media:',
            {
              url: mediaUrl,
              type: mediaType,
            },
          );

          setArtifact((currentArtifact) => {
            if (
              currentArtifact.kind !== 'image' &&
              currentArtifact.kind !== 'video'
            ) {
              console.log(
                '🔌 Artifact WebSocket: Skipping update - not a media artifact',
              );
              return currentArtifact;
            }

            try {
              const currentContent = JSON.parse(
                currentArtifact.content || '{}',
              );

              // Check if this update is for our artifact
              const isMatch =
                currentContent.projectId === projectId ||
                currentContent.requestId === requestId ||
                currentContent.status === 'pending' ||
                currentContent.status === 'streaming';

              if (!isMatch) {
                console.log(
                  '🔌 Artifact WebSocket: Event not matching current artifact, ignoring',
                );
                return currentArtifact;
              }

              // AICODE-FIX: Set appropriate URL field based on artifact type and media type
              const isVideoArtifact = currentArtifact.kind === 'video';
              const isVideoMedia = mediaType === 'video';

              let updatedContent: any;
              if (isVideoArtifact || isVideoMedia) {
                updatedContent = {
                  ...currentContent,
                  status: 'completed',
                  videoUrl: mediaUrl,
                  requestId: requestId || currentContent.requestId,
                  projectId: projectId || currentContent.projectId,
                  timestamp: Date.now(),
                  message: 'Video generation completed!',
                };
              } else {
                updatedContent = {
                  ...currentContent,
                  status: 'completed',
                  imageUrl: mediaUrl,
                  requestId: requestId || currentContent.requestId,
                  projectId: projectId || currentContent.projectId,
                  timestamp: Date.now(),
                  message: 'Image generation completed!',
                };
              }

              console.log(
                '🔌 Artifact WebSocket: Successfully updated artifact content:',
                {
                  previousStatus: currentContent.status,
                  newStatus: updatedContent.status,
                  hasMediaUrl: !!(
                    updatedContent.imageUrl || updatedContent.videoUrl
                  ),
                  artifactKind: currentArtifact.kind,
                  mediaType: mediaType,
                },
              );

              return {
                ...currentArtifact,
                content: JSON.stringify(updatedContent),
                status: 'idle' as const,
              };
            } catch (error) {
              console.error(
                '🔌 Artifact WebSocket: Error updating artifact:',
                error,
              );
              return currentArtifact;
            }
          });
        } else if (eventData.type === 'subscribe') {
          console.log(
            '🔌 Artifact WebSocket: Successfully subscribed to project:',
            projectId,
          );
        }
      };
    },
    [setArtifact],
  );

  // Connect to WebSocket when artifact has projectId
  useEffect(() => {
    if (!enabled) return;

    const { projectId, requestId } = getArtifactInfo();

    // Skip if no projectId
    if (!projectId) {
      return;
    }

    // Skip if already connected to this project
    if (currentProjectIdRef.current === projectId) {
      console.log(
        '🔌 Artifact WebSocket: Already connected to project:',
        projectId,
      );
      return;
    }

    console.log('🔌 Artifact WebSocket: Connecting to project:', {
      projectId,
      requestId,
      artifactStatus: artifact.status,
      artifactDocumentId: artifact.documentId,
      artifactKind: artifact.kind,
    });

    // Clean up previous connection
    if (eventHandlerRef.current && currentProjectIdRef.current) {
      console.log('🔌 Artifact WebSocket: Cleaning up previous connection');
      imageWebsocketStore.removeProjectHandlers(currentProjectIdRef.current, [
        eventHandlerRef.current,
      ]);
    }

    // Create new event handler
    const eventHandler = createEventHandler(projectId, requestId || '');
    eventHandlerRef.current = eventHandler;
    currentProjectIdRef.current = projectId;
    currentRequestIdRef.current = requestId;

    // Connect to WebSocket
    const config = getSuperduperAIConfig();
    const baseUrl = config.wsURL
      .replace('wss://', 'https://')
      .replace('ws://', 'http://');
    const url = `${baseUrl.replace('https://', 'wss://')}/api/v1/ws/project.${projectId}`;

    console.log('🔌 Artifact WebSocket: Connecting to URL:', url);
    imageWebsocketStore.initConnection(url, [eventHandler]);
    isConnectedRef.current = true;

    // Cleanup function
    return () => {
      if (eventHandlerRef.current && currentProjectIdRef.current) {
        console.log('🔌 Artifact WebSocket: Cleaning up connection on unmount');
        imageWebsocketStore.removeProjectHandlers(currentProjectIdRef.current, [
          eventHandlerRef.current,
        ]);
      }
    };
  }, [
    enabled,
    getArtifactInfo,
    artifact.status,
    artifact.documentId,
    createEventHandler,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventHandlerRef.current && currentProjectIdRef.current) {
        console.log('🔌 Artifact WebSocket: Final cleanup');
        imageWebsocketStore.removeProjectHandlers(currentProjectIdRef.current, [
          eventHandlerRef.current,
        ]);
        isConnectedRef.current = false;
      }
    };
  }, []);

  return {
    isConnected: isConnectedRef.current,
    currentProjectId: currentProjectIdRef.current,
    currentRequestId: currentRequestIdRef.current,
  };
};
