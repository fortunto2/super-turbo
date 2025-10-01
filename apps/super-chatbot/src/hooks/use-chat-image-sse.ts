"use client";

import { useCallback, useEffect, useRef } from "react";
import { imageSSEStore } from "@/artifacts/image";

interface ChatImageSSEOptions {
  chatId: string;
  messages: any[];
  setMessages: (messages: any) => void;
  enabled?: boolean;
}

// Add function to save message to database
const saveMessageToDatabase = async (chatId: string, message: any) => {
  try {
    /* FIXME(@ai-sdk-upgrade-v5): The `experimental_attachments` property has been replaced with the parts array. Please manually migrate following https://ai-sdk.dev/docs/migration-guides/migration-guide-5-0#attachments--file-parts */
    const messageToSave = {
      id: message.id,
      role: message.role,
      parts: message.parts,
      attachments: message.experimental_attachments || [],
      createdAt: message.createdAt,
    };

    const response = await fetch("/api/save-message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chatId,
        message: messageToSave,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Failed to save image message:", errorData);
      throw new Error(
        `Failed to save message: ${response.status} ${response.statusText}`
      );
    }
  } catch (error) {
    console.error("Failed to save image message:", error);
  }
};

export const useChatImageSSE = ({
  chatId,
  messages,
  setMessages,
  enabled = true,
}: ChatImageSSEOptions) => {
  const mountedRef = useRef(true);
  const connectedProjectsRef = useRef<Set<string>>(new Set());
  const handlersMapRef = useRef<Map<string, ImageEventHandler>>(new Map());

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Create stable event handler that doesn't cause re-renders
  const createEventHandler = useCallback(
    (targetProjectId: string): ImageEventHandler => {
      return (eventData: ImageSSEMessage) => {
        if (!mountedRef.current) return;

        // Filter events only for our target project
        if (eventData.projectId && eventData.projectId !== targetProjectId) {
          return;
        }

        // Only handle completed images that have URL
        if (
          eventData.type === "file" &&
          eventData.object?.type === "image" &&
          eventData.object?.url
        ) {
          const imageUrl = eventData.object.url;
          const requestId = eventData.requestId;

          // Store the last image URL for debugging and try direct artifact update
          if (typeof window !== "undefined") {
            const chatSSEInstance = (window as any).chatSSEInstance;
            if (chatSSEInstance) {
              chatSSEInstance.lastImageUrl = imageUrl;
            }

            // Try direct artifact update immediately
            const artifactInstance = (window as any).artifactInstance;
            if (
              artifactInstance?.artifact &&
              artifactInstance.artifact.kind === "image"
            ) {
              try {
                const currentContent = JSON.parse(
                  artifactInstance.artifact.content || "{}"
                );

                // Check if this update is for current artifact
                if (
                  currentContent.projectId === targetProjectId ||
                  currentContent.status === "pending" ||
                  currentContent.status === "streaming"
                ) {
                  const updatedContent = {
                    ...currentContent,
                    status: "completed",
                    imageUrl: imageUrl,
                    projectId: targetProjectId,
                    requestId: requestId || currentContent.requestId,
                    timestamp: Date.now(),
                    message: "Image generation completed!",
                  };

                  artifactInstance.setArtifact((current: any) => ({
                    ...current,
                    content: JSON.stringify(updatedContent),
                    status: "idle" as const,
                  }));
                }
              } catch (error) {
                console.error("❌ Failed to update artifact:", error);
              }
            }
          }

          // Ensure we're connected to this project if not already
          if (!connectedProjectsRef.current.has(targetProjectId)) {
            connectToProject(targetProjectId);
          }

          // Update messages with completed image
          setTimeout(() => {
            setMessages((prevMessages: any) => {
              const updatedMessages = [...prevMessages];
              let foundArtifact = false;

              // Look for the most recent assistant message with pending/streaming image artifact
              for (let i = updatedMessages.length - 1; i >= 0; i--) {
                const message = updatedMessages[i];

                if (message?.role === "assistant") {
                  // Check if this message has image artifact content
                  const hasImageArtifact = message.parts?.some(
                    (part: any) =>
                      part.type === "text" &&
                      "text" in part &&
                      part.text &&
                      (part.text.includes('"kind":"image"') ||
                        part.text.includes("'kind':'image'") ||
                        part.text.includes("ImageArtifact"))
                  );

                  if (hasImageArtifact) {
                    // Try to find and parse image artifact content
                    for (const part of message.parts || []) {
                      if (part.type === "text" && "text" in part && part.text) {
                        try {
                          let artifactContent = null;

                          // Try different parsing methods
                          if (part.text.includes("```json")) {
                            const jsonMatch = part.text.match(
                              /```json\s*({[\s\S]*?})\s*```/
                            );
                            if (jsonMatch?.[1]) {
                              artifactContent = JSON.parse(jsonMatch[1]);
                            }
                          } else if (
                            part.text.startsWith("{") &&
                            part.text.endsWith("}")
                          ) {
                            artifactContent = JSON.parse(part.text);
                          }

                          if (
                            artifactContent?.projectId === targetProjectId ||
                            artifactContent?.status === "pending" ||
                            artifactContent?.status === "streaming"
                          ) {
                            // Update the artifact content
                            const updatedContent = {
                              ...artifactContent,
                              status: "completed",
                              imageUrl: imageUrl,
                              projectId: targetProjectId,
                              requestId: requestId || artifactContent.requestId,
                              timestamp: Date.now(),
                              message: "Image generation completed!",
                            };

                            // Update the part text
                            const newText = part.text.includes("```json")
                              ? part.text.replace(
                                  /```json\s*{[\s\S]*?}\s*```/,
                                  `\`\`\`json\n${JSON.stringify(updatedContent, null, 2)}\n\`\`\``
                                )
                              : JSON.stringify(updatedContent);

                            (part as any).text = newText;
                            foundArtifact = true;

                            break;
                          }
                        } catch (error) {
                          // Silent fail for parsing
                        }
                      }
                    }

                    if (foundArtifact) break;
                  }
                }
              }

              if (foundArtifact) {
                // Save updated message to database
                const messageToSave =
                  updatedMessages[updatedMessages.length - 1];
                if (messageToSave) {
                  saveMessageToDatabase(chatId, messageToSave);
                }
              }

              return updatedMessages;
            });
          }, 100);
        }
      };
    },
    [setMessages, chatId]
  );

  // Connect to a specific project's SSE channel
  const connectToProject = useCallback(
    (projectId: string) => {
      if (!projectId || connectedProjectsRef.current.has(projectId)) {
        return;
      }

      console.log("🔌 Chat SSE: Connecting to project:", projectId);

      const eventHandler = createEventHandler(projectId);
      handlersMapRef.current.set(projectId, eventHandler);

      // Add handlers to SSE store
      imageSSEStore.addProjectHandlers(projectId, [eventHandler]);

      // Initialize SSE connection for this project using Next.js proxy
      const sseUrl = `/api/events/project.${projectId}`;

      imageSSEStore.initConnection(sseUrl, [eventHandler]);

      connectedProjectsRef.current.add(projectId);

      // Expose global function for manual project notification
      if (typeof window !== "undefined") {
        (window as any).notifyNewImageProject = (newProjectId: string) => {
          console.log(
            "📢 Chat SSE: Manual project notification:",
            newProjectId
          );
          if (newProjectId && newProjectId !== projectId) {
            connectToProject(newProjectId);
          }
        };

        // Store instance for debugging
        (window as any).chatSSEInstance = {
          connectedProjects: connectedProjectsRef.current,
          lastImageUrl: null,
          chatId: chatId,
          manualConnect: connectToProject,
        };
      }
    },
    [createEventHandler]
  );

  // Cleanup project connection
  const disconnectFromProject = useCallback((projectId: string) => {
    if (!projectId || !connectedProjectsRef.current.has(projectId)) {
      return;
    }

    console.log("🔌 Chat SSE: Disconnecting from project:", projectId);

    const handler = handlersMapRef.current.get(projectId);
    if (handler) {
      imageSSEStore.removeProjectHandlers(projectId, [handler]);
      handlersMapRef.current.delete(projectId);
    }

    connectedProjectsRef.current.delete(projectId);
  }, []);

  // Extract project IDs from messages
  const extractProjectIdsFromMessages = useCallback(
    (messages: any[]): string[] => {
      const ids = new Set<string>();

      for (const message of messages) {
        if (message.role === "assistant" && message.parts) {
          for (const part of message.parts) {
            if (part.type === "text" && "text" in part && part.text) {
              try {
                // Check for image artifacts before parsing
                if (
                  part.text.includes('"kind":"image"') ||
                  part.text.includes("'kind':'image'") ||
                  part.text.includes("ImageArtifact")
                ) {
                  let artifactContent: any = null;
                  if (part.text.includes("```json")) {
                    const jsonMatch = part.text.match(
                      /```json\s*({[\s\S]*?})\s*```/
                    );
                    if (jsonMatch) artifactContent = JSON.parse(jsonMatch[1]);
                  } else if (
                    part.text.startsWith("{") &&
                    part.text.endsWith("}")
                  ) {
                    artifactContent = JSON.parse(part.text);
                  }

                  if (artifactContent?.projectId) {
                    ids.add(artifactContent.projectId);
                  }
                  if (artifactContent?.fileId) {
                    ids.add(`file.${artifactContent.fileId}`);
                  }
                }
              } catch (e) {
                /* ignore parse errors */
              }
            }
          }
        }
      }
      return Array.from(ids);
    },
    []
  );

  // Monitor messages for project IDs and connect/disconnect as needed
  useEffect(() => {
    if (!enabled) return;

    const currentProjectIds = new Set(extractProjectIdsFromMessages(messages));
    const previousProjectIds = connectedProjectsRef.current;

    // Connect to new projects
    for (const projectId of currentProjectIds) {
      if (!previousProjectIds.has(projectId)) {
        connectToProject(projectId);
      }
    }

    // Disconnect from old projects
    for (const projectId of previousProjectIds) {
      if (!currentProjectIds.has(projectId)) {
        disconnectFromProject(projectId);
      }
    }

    // Store instance for debugging
    if (typeof window !== "undefined") {
      (window as any).chatSSEInstance = {
        connectedProjects: connectedProjectsRef.current,
        lastImageUrl: null,
        chatId: chatId,
        manualConnect: connectToProject,
      };
    }
  }, [
    messages,
    enabled,
    connectToProject,
    disconnectFromProject,
    extractProjectIdsFromMessages,
    chatId,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;

      // Cleanup all connections
      connectedProjectsRef.current.forEach((projectId) => {
        disconnectFromProject(projectId);
      });

      // Force cleanup if needed
      const debugInfo = imageSSEStore.getDebugInfo();
      if (debugInfo.totalHandlers > 5) {
        console.log("🧹 Chat SSE: Force cleanup due to handler accumulation");
        imageSSEStore.forceCleanup();
      }
    };
  }, [disconnectFromProject]);

  return {
    connectedProjects: connectedProjectsRef.current,
  };
};

type ImageEventHandler = (eventData: ImageSSEMessage) => void;

interface ImageSSEMessage {
  type: string;
  projectId?: string;
  requestId?: string;
  object?: {
    type?: string;
    url?: string;
  };
}
