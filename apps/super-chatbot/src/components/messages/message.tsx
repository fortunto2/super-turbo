"use client";

import type { UIMessage } from "ai";
import cx from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import { memo, useState } from "react";
import type { Vote } from "@/lib/db/schema";
import { PencilEditIcon, SparklesIcon } from "../common/icons";
import { MessageActions } from "./message-actions";

import equal from "fast-deep-equal";
import { sanitizeText } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { MessageEditor } from "./message-editor";
import { MessageReasoning } from "./message-reasoning";
import type { CustomUseChatHelpers } from "@/lib/types/use-chat-helpers";
import { MediaSettings, PreviewAttachment, Markdown } from "../";
import type {
  ImageGenerationConfig,
  ImageSettings,
  VideoGenerationConfig,
  VideoSettings as VideoSettingsType,
} from "@/lib/types/media-settings";
import { useArtifactLegacy } from "@/hooks/use-artifact";
import { ScriptArtifactViewer } from "@/artifacts/text/client";
import { Button, cn } from "@turbo-super/ui";

const PurePreviewMessage = ({
  chatId,
  message,
  vote,
  isLoading,
  setMessages,
  reload,
  isReadonly,
  requiresScrollPadding,
  selectedChatModel,
  selectedVisibilityType,
  append,
}: {
  chatId: string;
  message: UIMessage;
  vote: Vote | undefined;
  isLoading: boolean;
  setMessages: CustomUseChatHelpers["setMessages"];
  reload: () => void;
  isReadonly: boolean;
  requiresScrollPadding: boolean;
  selectedChatModel: string;
  selectedVisibilityType: "public" | "private";
  append?: (message: any) => void;
}) => {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const { setArtifact } = useArtifactLegacy();

  /* FIXME(@ai-sdk-upgrade-v5): The `experimental_attachments` property has been replaced with the parts array. Please manually migrate following https://ai-sdk.dev/docs/migration-guides/migration-guide-5-0#attachments--file-parts */
  return (
    <AnimatePresence>
      <motion.div
        data-testid={`message-${message.role}`}
        className="w-full mx-auto max-w-3xl px-4 group/message"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        data-role={message.role}
      >
        <div
          className={cn(
            "flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl",
            {
              "w-full": mode === "edit",
              "group-data-[role=user]/message:w-fit": mode !== "edit",
            }
          )}
        >
          {message.role === "assistant" && (
            <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background">
              <div className="translate-y-px">
                <SparklesIcon size={14} />
              </div>
            </div>
          )}

          <div
            className={cn("flex flex-col gap-4 w-full", {
              "min-h-96": message.role === "assistant" && requiresScrollPadding,
            })}
          >
            {message.parts?.filter((part) => part.type === "file") &&
              message.parts?.filter((part) => part.type === "file").length >
                0 && (
                <div
                  data-testid={`message-attachments`}
                  className="flex flex-row justify-end gap-2"
                >
                  {message.parts
                    ?.filter((part) => part.type === "file")
                    .map((attachment) => (
                      <PreviewAttachment
                        key={attachment.url || (attachment as any).name}
                        attachment={{
                          ...attachment,
                          name: (attachment as any).name || "File",
                          contentType:
                            (attachment as any).contentType ||
                            "application/octet-stream",
                        }}
                        chatId={chatId}
                      />
                    ))}
                </div>
              )}

            {message.parts?.map((part, index) => {
              const { type } = part;
              const key = `message-${message.id}-part-${index}`;

              if (type === "reasoning") {
                return (
                  <MessageReasoning
                    key={key}
                    isLoading={isLoading}
                    reasoningText={
                      (part as any).reasoningText || part.text || ""
                    }
                  />
                );
              }

              if (type === "text") {
                if (mode === "view") {
                  // --- EMBED ARTIFACT (image/video/text) ---
                  let artifact: any = null;
                  if (part.text.startsWith("```json")) {
                    try {
                      const jsonMatch = part.text.match(
                        /```json\s*({[\s\S]*?})\s*```/
                      );
                      if (jsonMatch?.[1]) {
                        artifact = JSON.parse(jsonMatch[1]);
                      }
                    } catch {}
                  } else if (
                    part.text.startsWith("{") &&
                    part.text.endsWith("}")
                  ) {
                    try {
                      artifact = JSON.parse(part.text);
                    } catch {}
                  }
                  if (
                    artifact &&
                    artifact.kind === "text" &&
                    artifact.content
                  ) {
                    return (
                      <div
                        key={key}
                        className="flex flex-row gap-2 items-start"
                      >
                        <div
                          className="cursor-pointer w-full"
                          onClick={() => {
                            setArtifact({
                              title: artifact.title || "",
                              documentId: artifact.documentId,
                              kind: "text",
                              content: artifact.content,
                              isVisible: true,
                              status: "idle",
                              boundingBox: {
                                top: 0,
                                left: 0,
                                width: 0,
                                height: 0,
                              },
                            });
                          }}
                        >
                          <ScriptArtifactViewer
                            title={artifact.title || ""}
                            content={artifact.content}
                          />
                        </div>
                      </div>
                    );
                  }
                  // --- END EMBED ---
                  // Check if this is a resolution selection message
                  if (part.text.startsWith("Выбрано разрешение:")) {
                    const resolutionMatch = part.text.match(
                      /разрешение: (\d+)x(\d+), стиль: (.+?), размер кадра: (.+?), модель: (.+?)(?:, сид: (\d+))?$/
                    );
                    if (resolutionMatch) {
                      const [
                        ,
                        width,
                        height,
                        style,
                        shotSize,
                        imageModel,
                        seed,
                      ] = resolutionMatch;
                      return (
                        <div
                          key={key}
                          className="flex flex-row gap-2 items-start"
                        >
                          <div
                            data-testid="message-content"
                            className="flex flex-col gap-4 bg-primary text-primary-foreground px-3 py-2 rounded-xl"
                          >
                            <div className="flex flex-col gap-2">
                              <p>
                                Выбрано разрешение: {width} × {height}
                              </p>
                              <p>Стиль: {style}</p>
                              <p>Размер кадра: {shotSize}</p>
                              <p>Модель: {imageModel}</p>
                              {seed && <p>Сид: {seed}</p>}
                            </div>
                          </div>
                        </div>
                      );
                    }
                  }

                  return (
                    <div
                      key={key}
                      className="flex flex-row gap-2 items-start"
                    >
                      {message.role === "user" && !isReadonly && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              data-testid="message-edit-button"
                              variant="ghost"
                              className="px-2 h-fit rounded-full text-muted-foreground opacity-0 group-hover/message:opacity-100"
                              onClick={() => {
                                setMode("edit");
                              }}
                            >
                              <PencilEditIcon />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit message</TooltipContent>
                        </Tooltip>
                      )}

                      <div
                        data-testid="message-content"
                        className={cn("flex flex-col gap-4", {
                          "bg-primary text-primary-foreground px-3 py-2 rounded-xl":
                            message.role === "user",
                        })}
                      >
                        <Markdown>{sanitizeText(part.text)}</Markdown>
                      </div>
                    </div>
                  );
                }

                if (mode === "edit") {
                  return (
                    <div
                      key={key}
                      className="flex flex-row gap-2 items-start"
                    >
                      <div className="size-8" />

                      <MessageEditor
                        key={message.id}
                        message={message}
                        setMode={setMode}
                        setMessages={setMessages}
                        reload={reload}
                      />
                    </div>
                  );
                }
              }

              if (type.startsWith("tool-")) {
                const toolCall = part as any;
                const { toolCallId, state } = toolCall;
                const toolName = type.replace("tool-", "");

                if (state === "call") {
                  return null;
                }

                if (state === "result") {
                  const { result } = toolCall;

                  if (
                    toolName === "configureScriptGeneration" &&
                    result &&
                    typeof result === "object" &&
                    "id" in result &&
                    "title" in result
                  ) {
                    return (
                      <div
                        key={toolCallId}
                        className="flex flex-row gap-2 items-start"
                      >
                        <div
                          className="cursor-pointer w-full"
                          onClick={() => {
                            setArtifact({
                              title: result.title as string,
                              documentId: result.id as string,
                              kind: "script",
                              content: "", // Content will be fetched in the artifact viewer
                              isVisible: true,
                              status: "idle",
                              boundingBox: {
                                top: 0,
                                left: 0,
                                width: 0,
                                height: 0,
                              },
                            });
                          }}
                        >
                          <ScriptArtifactViewer
                            title={result.title as string}
                            content={""}
                          />
                        </div>
                      </div>
                    );
                  }

                  // Handle image generation configuration
                  if (
                    toolName === "configureImageGeneration" &&
                    result?.type === "image-generation-settings"
                  ) {
                    const config = result as ImageGenerationConfig;
                    return (
                      <div
                        key={toolCallId}
                        className="p-4"
                      >
                        <MediaSettings
                          config={config}
                          onConfirm={(
                            settings: ImageSettings | VideoSettingsType
                          ) => {
                            console.log("Image settings selected:", settings);
                          }}
                          selectedChatModel={selectedChatModel}
                          selectedVisibilityType={selectedVisibilityType}
                          {...(append && { append })}
                        />
                      </div>
                    );
                  }

                  // Handle video generation configuration
                  if (
                    toolName === "configureVideoGeneration" &&
                    result?.type === "video-generation-settings"
                  ) {
                    const config = result as VideoGenerationConfig;
                    return (
                      <div
                        key={toolCallId}
                        className="p-4"
                      >
                        <MediaSettings
                          config={config}
                          onConfirm={(
                            settings: ImageSettings | VideoSettingsType
                          ) => {
                            console.log("Video settings selected:", settings);
                          }}
                          selectedChatModel={selectedChatModel}
                          selectedVisibilityType={selectedVisibilityType}
                          {...(append && { append })}
                        />
                      </div>
                    );
                  }

                  return null;
                }
              }

              return null;
            })}

            {!isReadonly && (
              <MessageActions
                key={`action-${message.id}`}
                chatId={chatId}
                message={message}
                vote={vote}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    if (prevProps.message.id !== nextProps.message.id) return false;
    if (prevProps.requiresScrollPadding !== nextProps.requiresScrollPadding)
      return false;
    if (!equal(prevProps.message.parts, nextProps.message.parts)) return false;
    if (!equal(prevProps.vote, nextProps.vote)) return false;

    return true;
  }
);

export const ThinkingMessage = () => {
  const role = "assistant";

  return (
    <motion.div
      data-testid="message-assistant-loading"
      className="w-full mx-auto max-w-3xl px-4 group/message min-h-96"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role={role}
    >
      <div
        className={cx(
          "flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl",
          {
            "group-data-[role=user]/message:bg-muted": true,
          }
        )}
      >
        <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
          <SparklesIcon size={14} />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-4 text-muted-foreground">
            Hmm...
          </div>
        </div>
      </div>
    </motion.div>
  );
};
