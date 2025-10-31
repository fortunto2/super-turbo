import { useCallback } from 'react';
import type {
  ImageEventHandler,
  ImageWSMessage,
} from '../stores/image-websocket-store';
import { imageMonitor, validateImageAssignment } from '../utils/image-debug';
import { FileService, FileTypeEnum } from '@turbo-super/api';

export interface ImageGenerationState {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  imageUrl?: string;
  error?: string;
  projectId?: string;
  requestId?: string;
}

export type ImageStateUpdater = (update: Partial<ImageGenerationState>) => void;

export const useImageEventHandler = (
  projectId: string,
  onStateUpdate: ImageStateUpdater,
  requestId?: string,
): ImageEventHandler => {
  return useCallback(
    (eventData: ImageWSMessage) => {
      // Strict validation - only process events for our specific project
      if (!eventData.projectId && !projectId) {
        console.warn('⚠️ Event received without projectId, ignoring');
        return;
      }

      if (eventData.projectId && eventData.projectId !== projectId) {
        console.log(
          `🔒 Event for different project (${eventData.projectId} vs ${projectId}), ignoring`,
        );
        return;
      }

      // Additional validation for request ID if provided
      if (
        requestId &&
        eventData.requestId &&
        eventData.requestId !== requestId
      ) {
        console.log(
          `🔒 Event for different request (${eventData.requestId} vs ${requestId}), ignoring`,
        );
        return;
      }

      console.log(
        `📨 Processing event for project ${projectId}:`,
        eventData.type,
      );

      // Log the request for monitoring
      imageMonitor.logRequest({
        projectId: eventData.projectId || projectId,
        requestId: eventData.requestId || requestId || '',
        status: eventData.type,
        timestamp: Date.now(),
        imageUrl: eventData.imageUrl || eventData.url || '',
        error: eventData.error || '',
      });

      switch (eventData.type) {
        case 'subscribe':
          // Handle subscription confirmation
          console.log(`✅ Subscribed to project ${projectId}`);
          break;

        case 'file':
          // Handle completed image files
          if (eventData.object) {
            console.log('📁 File object received:', eventData.object);
            const fileObject = eventData.object;

            // Check if it's an image type
            if (
              (fileObject.type === FileTypeEnum.IMAGE ||
                fileObject.contentType?.startsWith('image/')) &&
              fileObject.url
            ) {
              // Validate image assignment
              const isValid = validateImageAssignment(
                eventData.projectId || projectId,
                projectId,
                fileObject.url,
                eventData.requestId || requestId,
              );

              if (isValid) {
                onStateUpdate({
                  status: 'completed',
                  imageUrl: fileObject.url,
                  progress: 100,
                  projectId: eventData.projectId || projectId,
                  ...(eventData.requestId && {
                    requestId: eventData.requestId,
                  }),
                });
              }
            }
            // Handle file_id case - need to resolve to URL using FileService
            else if (fileObject.file_id) {
              console.log(
                '📁 File ID received, resolving to URL:',
                fileObject.file_id,
              );

              // Import FileService dynamically to resolve file_id to URL
              try {
                FileService.fileGetById({
                  id: fileObject.file_id,
                }).then((fileResponse) => {
                  if (fileResponse?.url) {
                    // Check if it's an image file using type field
                    const isImage =
                      fileResponse.type === FileTypeEnum.IMAGE ||
                      fileResponse.url?.match(
                        /\.(jpg|jpeg|png|webp|gif|bmp|svg)$/i,
                      );

                    if (isImage) {
                      console.log(
                        '📁 ✅ File ID resolved to image URL:',
                        fileResponse.url,
                      );

                      // Validate image assignment
                      const isValid = validateImageAssignment(
                        eventData.projectId || projectId,
                        projectId,
                        fileResponse.url,
                        eventData.requestId || requestId,
                      );

                      if (isValid) {
                        onStateUpdate({
                          status: 'completed',
                          imageUrl: fileResponse.url,
                          progress: 100,
                          projectId: eventData.projectId || projectId,
                          ...(eventData.requestId && {
                            requestId: eventData.requestId,
                          }),
                        });
                      }
                    } else {
                      console.log(
                        '📁 ⚠️ File ID resolved to non-image file:',
                        fileResponse.type,
                      );
                    }
                  } else {
                    console.error(
                      '📁 ❌ File ID resolution failed - no URL in response',
                    );
                  }
                });
              } catch (error) {
                console.error('📁 ❌ Failed to resolve file ID to URL:', error);
              }
            }
          }
          // Also handle case where file data is directly in eventData
          else if (eventData.url) {
            // Check if it's an image file
            const isImage = eventData.url?.match(
              /\.(jpg|jpeg|png|webp|gif|bmp|svg)$/i,
            );

            if (isImage) {
              // Validate image assignment
              const isValid = validateImageAssignment(
                eventData.projectId || projectId,
                projectId,
                eventData.url,
                eventData.requestId || requestId,
              );

              if (isValid) {
                onStateUpdate({
                  status: 'completed',
                  imageUrl: eventData.url,
                  progress: 100,
                  projectId: eventData.projectId || projectId,
                  ...(eventData.requestId && {
                    requestId: eventData.requestId,
                  }),
                });
              }
            }
          }
          // Handle direct file_id in eventData
          else if (eventData.object?.file_id || (eventData as any).file_id) {
            const fileId =
              eventData.object?.file_id || (eventData as any).file_id;
            console.log(
              '📁 Direct file ID received, resolving to URL:',
              fileId,
            );

            // Import FileService dynamically to resolve file_id to URL
            try {
              FileService.fileGetById({
                id: fileId,
              }).then((fileResponse) => {
                if (fileResponse?.url) {
                  // Check if it's an image file using type field
                  const isImage =
                    fileResponse.type === FileTypeEnum.IMAGE ||
                    fileResponse.url?.match(
                      /\.(jpg|jpeg|png|webp|gif|bmp|svg)$/i,
                    );

                  if (isImage) {
                    console.log(
                      '📁 ✅ Direct file ID resolved to image URL:',
                      fileResponse.url,
                    );

                    // Validate image assignment
                    const isValid = validateImageAssignment(
                      eventData.projectId || projectId,
                      projectId,
                      fileResponse.url,
                      eventData.requestId || requestId,
                    );

                    if (isValid) {
                      onStateUpdate({
                        status: 'completed',
                        imageUrl: fileResponse.url,
                        progress: 100,
                        projectId: eventData.projectId || projectId,
                        ...(eventData.requestId && {
                          requestId: eventData.requestId,
                        }),
                      });
                    }
                  } else {
                    console.log(
                      '📁 ⚠️ Direct file ID resolved to non-image file:',
                      fileResponse.type,
                    );
                  }
                } else {
                  console.error(
                    '📁 ❌ Direct file ID resolution failed - no URL in response',
                  );
                }
              });
            } catch (error) {
              console.error(
                '📁 ❌ Failed to resolve direct file ID to URL:',
                error,
              );
            }
          }
          break;

        case 'image':
          // Handle direct image objects
          console.log('🖼️ Image event received:', eventData);
          if (eventData.url) {
            // Validate image assignment
            const isValid = validateImageAssignment(
              eventData.projectId || projectId,
              projectId,
              eventData.url,
              eventData.requestId || requestId,
            );

            if (isValid) {
              onStateUpdate({
                status: 'completed',
                imageUrl: eventData.url,
                progress: 100,
                projectId: eventData.projectId || projectId,
                ...(eventData.requestId && { requestId: eventData.requestId }),
              });
            }
          }
          break;

        case 'status_update':
          onStateUpdate({
            status:
              (eventData.status as ImageGenerationState['status']) ||
              'processing',
            ...(eventData.progress !== undefined && {
              progress: eventData.progress,
            }),
            projectId: eventData.projectId || projectId,
            ...(eventData.requestId && { requestId: eventData.requestId }),
          });
          break;

        case 'image_ready':
        case 'image_completed':
          if (eventData.imageUrl || eventData.data?.imageUrl) {
            const imageUrl = eventData.imageUrl || eventData.data?.imageUrl;
            // Validate image assignment
            const isValid = validateImageAssignment(
              eventData.projectId || projectId,
              projectId,
              imageUrl,
              eventData.requestId || requestId,
            );

            if (isValid) {
              onStateUpdate({
                status: 'completed',
                imageUrl,
                progress: 100,
                projectId: eventData.projectId || projectId,
                ...(eventData.requestId && { requestId: eventData.requestId }),
              });
            }
          }
          break;

        case 'error':
        case 'image_error':
          onStateUpdate({
            status: 'failed',
            error:
              eventData.error ||
              eventData.data?.error ||
              'Unknown error occurred',
            projectId: eventData.projectId || projectId,
            ...(eventData.requestId && { requestId: eventData.requestId }),
          });
          break;

        case 'progress':
          onStateUpdate({
            status: 'processing',
            progress: eventData.progress || eventData.data?.progress || 0,
            projectId: eventData.projectId || projectId,
            ...(eventData.requestId && { requestId: eventData.requestId }),
          });
          break;

        case 'render_progress':
          // Handle SuperDuperAI render progress events
          onStateUpdate({
            status: 'processing',
            progress: eventData.object?.progress || 0,
            projectId: eventData.projectId || projectId,
            ...(eventData.requestId && { requestId: eventData.requestId }),
          });
          break;

        case 'render_result':
          // Handle SuperDuperAI render result events
          if (eventData.object?.url || eventData.object?.file_url) {
            const imageUrl = eventData.object.url || eventData.object.file_url;

            // Validate image assignment
            const isValid = validateImageAssignment(
              eventData.projectId || projectId,
              projectId,
              imageUrl,
              eventData.requestId || requestId,
            );

            if (isValid) {
              onStateUpdate({
                status: 'completed',
                imageUrl,
                progress: 100,
                projectId: eventData.projectId || projectId,
                ...(eventData.requestId && { requestId: eventData.requestId }),
              });
            }
          }
          break;

        case 'task_status':
          // Handle task completion events - can trigger polling check
          if (eventData.object?.status === 'COMPLETED') {
            console.log(
              '📡 Task completed for project:',
              eventData.projectId || projectId,
            );

            // Start polling check for completed generation
            setTimeout(async () => {
              try {
                console.log(
                  '🔍 Checking for completed images after task completion',
                );

                const response = await fetch(
                  `/api/project/${eventData.projectId || projectId}`,
                );
                if (!response.ok) {
                  throw new Error(`Failed to get project: ${response.status}`);
                }

                const project = await response.json();

                // Look for image data in project.data
                const imageData = project.data?.find((data: any) => {
                  if (data.value && typeof data.value === 'object') {
                    const value = data.value as Record<string, any>;
                    const hasUrl = !!value.url;
                    const isImage = value.url?.match(
                      /\.(jpg|jpeg|png|webp|gif|bmp|svg)$/i,
                    );

                    return hasUrl && isImage;
                  }
                  return false;
                });

                if (imageData?.value && typeof imageData.value === 'object') {
                  const imageUrl = (imageData.value as Record<string, any>)
                    .url as string;
                  console.log(
                    '🔍 ✅ Found completed image via polling:',
                    imageUrl,
                  );

                  // Validate and update
                  const isValid = validateImageAssignment(
                    eventData.projectId || projectId,
                    projectId,
                    imageUrl,
                    eventData.requestId || requestId,
                  );

                  if (isValid) {
                    onStateUpdate({
                      status: 'completed',
                      imageUrl,
                      progress: 100,
                      projectId: eventData.projectId || projectId,
                      ...(eventData.requestId && {
                        requestId: eventData.requestId,
                      }),
                    });
                  }
                }

                // Handle file_id case in project data
                const fileIdData = project.data?.find((data: any) => {
                  return (
                    data.value &&
                    typeof data.value === 'object' &&
                    (data.value as any).file_id
                  );
                });

                if (fileIdData?.value && typeof fileIdData.value === 'object') {
                  const fileId = (fileIdData.value as Record<string, any>)
                    .file_id as string;
                  console.log(
                    '🔍 Found file_id via polling, resolving:',
                    fileId,
                  );

                  // Import and resolve file_id to URL
                  const fileResponse = await FileService.fileGetById({
                    id: fileId,
                  });

                  if (
                    fileResponse?.url &&
                    fileResponse.type === FileTypeEnum.IMAGE
                  ) {
                    console.log(
                      '🔍 ✅ File ID resolved to image URL via polling:',
                      fileResponse.url,
                    );

                    const isValid = validateImageAssignment(
                      eventData.projectId || projectId,
                      projectId,
                      fileResponse.url,
                      eventData.requestId || requestId,
                    );

                    if (isValid) {
                      onStateUpdate({
                        status: 'completed',
                        imageUrl: fileResponse.url,
                        progress: 100,
                        projectId: eventData.projectId || projectId,
                        ...(eventData.requestId && {
                          requestId: eventData.requestId,
                        }),
                      });
                    }
                  }
                }
              } catch (error) {
                console.error('🔍 ❌ Polling check failed:', error);
              }
            }, 2000); // 2 second delay
          }
          break;

        case 'image_processing':
        case 'processing':
          onStateUpdate({
            status: 'processing',
            progress: eventData.progress || eventData.data?.progress,
            projectId: eventData.projectId || projectId,
            ...(eventData.requestId && { requestId: eventData.requestId }),
          });
          break;

        case 'image_pending':
        case 'pending':
          onStateUpdate({
            status: 'pending',
            progress: 0,
            projectId: eventData.projectId || projectId,
            ...(eventData.requestId && { requestId: eventData.requestId }),
          });
          break;

        default:
          // Try to extract useful info from unknown messages
          if (eventData.status) {
            onStateUpdate({
              status: eventData.status as ImageGenerationState['status'],
              ...(eventData.progress !== undefined && {
                progress: eventData.progress,
              }),
              ...(eventData.imageUrl && { imageUrl: eventData.imageUrl }),
              ...(eventData.error && { error: eventData.error }),
              projectId: eventData.projectId || projectId,
              ...(eventData.requestId && { requestId: eventData.requestId }),
            });
          } else {
            console.log('❓ Unknown event type:', eventData.type);
          }
          break;
      }
    },
    [projectId, onStateUpdate, requestId],
  );
};
