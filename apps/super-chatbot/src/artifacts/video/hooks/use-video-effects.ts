import { useEffect, useRef } from "react";
import type { UseChatHelpers } from "@ai-sdk/react";
import { saveMediaToChat } from "@/lib/ai/chat/media";

export interface UseVideoEffectsProps {
  videoUrl?: string;
  status: string;
  append?: UseChatHelpers["append"];
  prompt: string;
  hasInitialized: boolean;
  setArtifact?: (fn: (prev: any) => any) => void;
  chatId?: string;
  resetState: () => void;
  setPrompt: (prompt: string) => void;
  initialPrompt?: string;
  setMessages?: UseChatHelpers["setMessages"];
}

// AICODE-NOTE: Function to generate a valid UUID v4
const generateUUID = (): string => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export function useVideoEffects({
  videoUrl,
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
}: UseVideoEffectsProps) {
  const savedVideoUrlRef = useRef<string>("none");

  // AICODE-NOTE: Auto-save completed video to chat history for permanent access
  useEffect(() => {
    // Debug all conditions
    console.log("🔍 useVideoEffects debug:", {
      videoUrl: videoUrl ? `${videoUrl.substring(0, 50)}...` : "none",
      status,
      hasInitialized,
      chatId: chatId || "none",
      setMessages: !!setMessages,
      prompt: prompt ? `${prompt.substring(0, 30)}...` : "none",
      savedVideoUrlRef: savedVideoUrlRef.current,
      allConditionsMet: !!(
        videoUrl &&
        status === "completed" &&
        hasInitialized &&
        chatId &&
        setMessages &&
        prompt &&
        savedVideoUrlRef.current !== videoUrl
      ),
    });

    // AICODE-FIX: Remove duplicate saveMediaToChat call
    // The saveMediaToChat is now handled in the artifact wrapper component
    // This prevents double saving to chat history
    if (
      videoUrl &&
      status === "completed" &&
      hasInitialized &&
      chatId &&
      setMessages &&
      prompt &&
      savedVideoUrlRef.current !== videoUrl // Prevent duplicate saves
    ) {
      console.log(
        "💾 🎬 Video generation completed, skipping auto-save to chat (handled by wrapper)"
      );
      savedVideoUrlRef.current = videoUrl;
    }
  }, [videoUrl, status, hasInitialized, chatId, setMessages, prompt]);

  // Handle prompt reset
  useEffect(() => {
    if (status === "completed" && initialPrompt) {
      resetState();
      setPrompt("");
    }
  }, [status, initialPrompt, resetState, setPrompt]);

  // Handle artifact update
  useEffect(() => {
    if (videoUrl && setArtifact) {
      setArtifact((prev) => ({
        ...prev,
        content: JSON.stringify({
          projectId: chatId,
          status,
          videoUrl,
          prompt,
        }),
      }));
    }
  }, [videoUrl, status, chatId, prompt, setArtifact]);
}
