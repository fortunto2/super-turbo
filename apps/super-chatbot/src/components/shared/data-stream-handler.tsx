"use client";
import { useEffect, useRef, memo } from "react";
import type { Suggestion } from "@/lib/db/schema";
import { initialArtifactData, useArtifactLegacy } from "@/hooks/use-artifact";
import { useArtifactContext } from "@/contexts/artifact-context";
import { toast } from "../common/toast";
import { artifactDefinitions, type ArtifactKind } from "../artifacts/artifact";

export type DataStreamDelta = {
  type:
    | "text-delta"
    | "sheet-delta"
    | "image-delta"
    | "title"
    | "id"
    | "suggestion"
    | "clear"
    | "finish"
    | "kind"
    | "error";
  content: string | Suggestion;
};

function PureDataStreamHandler({
  id,
  dataStream,
}: {
  id: string;
  dataStream?: any[];
}) {
  // Throttle logging to avoid spam
  const lastLogTime = useRef<number>(0);
  const logWithThrottle = (message: string, data?: any) => {
    if (process.env.NODE_ENV === "development") {
      const now = Date.now();
      if (now - lastLogTime.current > 500) {
        // Log at most every 500ms
        console.log(message, data);
        lastLogTime.current = now;
      }
    }
  };

  // DataStreamHandler initialized silently

  // Всегда вызываем оба хука
  const legacy = useArtifactLegacy();

  // Попытаемся использовать контекст, если доступен
  let artifact, setArtifact, setMetadata;
  try {
    const context = useArtifactContext();
    artifact = context.artifact;
    setArtifact = context.setArtifact;
    setMetadata = context.setMetadata;
  } catch (error) {
    console.log("🔍 DataStreamHandler: Context not available, using legacy");
    artifact = legacy.artifact;
    setArtifact = legacy.setArtifact;
    setMetadata = legacy.setMetadata;
  }
  const lastProcessedIndex = useRef(-1);
  const isProcessing = useRef(false);

  // Memoize dataStream length to prevent unnecessary effect reruns
  const dataStreamLength = dataStream?.length || 0;
  const stableArtifactKind = useRef(artifact.kind);

  // Update stable artifact kind only when it actually changes
  if (stableArtifactKind.current !== artifact.kind) {
    stableArtifactKind.current = artifact.kind;
  }

  useEffect(() => {
    // Prevent concurrent processing
    if (isProcessing.current) return;

    if (
      !dataStream?.length ||
      lastProcessedIndex.current >= dataStream.length - 1
    )
      return;

    isProcessing.current = true;

    try {
      const newDeltas = dataStream.slice(lastProcessedIndex.current + 1);

      if (newDeltas.length === 0) {
        isProcessing.current = false;
        return;
      }

      lastProcessedIndex.current = dataStream.length - 1;

      // Find artifact definition once
      const artifactDefinition = artifactDefinitions.find(
        (def) => def.kind === stableArtifactKind.current
      );

      (newDeltas as DataStreamDelta[]).forEach((delta: DataStreamDelta) => {
        if (artifactDefinition?.onStreamPart) {
          artifactDefinition.onStreamPart({
            streamPart: delta,
            setArtifact,
            setMetadata,
          });
        }

        setArtifact((draftArtifact) => {
          if (!draftArtifact) {
            return { ...initialArtifactData, status: "streaming" };
          }

          switch (delta.type) {
            case "id":
              return {
                ...draftArtifact,
                documentId: delta.content as string,
                status: "streaming",
              };

            case "title":
              return {
                ...draftArtifact,
                title: delta.content as string,
                status: "streaming",
              };

            case "kind":
              // Вызываем onCreateDocument когда создается новый артефакт
              const newKind = delta.content as ArtifactKind;
              console.log("🎯 Creating new artifact with kind:", newKind);

              // Проверяем, не создан ли уже артефакт этого типа
              if (
                draftArtifact.kind === newKind &&
                draftArtifact.documentId !== "init"
              ) {
                console.log(
                  "🎯 Artifact already created, skipping onCreateDocument"
                );
                return {
                  ...draftArtifact,
                  kind: newKind,
                  status: "streaming",
                  isVisible: true,
                };
              }

              const kindArtifactDefinition = artifactDefinitions.find(
                (def) => def.kind === newKind
              );
              if (kindArtifactDefinition?.onCreateDocument) {
                console.log("🎯 Calling onCreateDocument for:", newKind);
                kindArtifactDefinition.onCreateDocument({
                  setArtifact: (updater) => {
                    if (typeof updater === "function") {
                      setArtifact((current) => {
                        const updated = updater(current);
                        return {
                          ...updated,
                          kind: newKind,
                          status: "streaming",
                        };
                      });
                    } else {
                      setArtifact({
                        ...updater,
                        kind: newKind,
                        status: "streaming",
                      });
                    }
                  },
                });
              } else {
                console.log("🎯 No onCreateDocument found for:", newKind);
                // Если нет onCreateDocument, устанавливаем базовые значения
                setArtifact((current) => ({
                  ...current,
                  kind: newKind,
                  status: "streaming",
                  isVisible: true,
                }));
              }
              return {
                ...draftArtifact,
                kind: newKind,
                status: "streaming",
                isVisible: true, // Убеждаемся что артефакт видим
              };

            case "clear":
              return {
                ...draftArtifact,
                content: "",
                status: "streaming",
              };

            case "finish":
              return {
                ...draftArtifact,
                status: "idle",
              };

            case "error":
              // Show error toast to user
              toast({
                type: "error",
                description: delta.content as string,
              });
              return {
                ...draftArtifact,
                status: "error",
              };

            default:
              return draftArtifact;
          }
        });
      });
    } finally {
      isProcessing.current = false;
    }
  }, [dataStream, setArtifact, setMetadata, id]); // Removed artifact from deps to prevent loops

  return null;
}

// Memoize DataStreamHandler to prevent unnecessary rerenders
export const DataStreamHandler = memo(
  PureDataStreamHandler,
  (prevProps, nextProps) => {
    // Only re-render if critical props actually change
    if (prevProps.id !== nextProps.id) return false;

    const prevLength = prevProps.dataStream?.length || 0;
    const nextLength = nextProps.dataStream?.length || 0;
    if (prevLength !== nextLength) return false;

    return true;
  }
);
