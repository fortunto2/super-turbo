"use client";

import { useEffect, useCallback } from "react";
import { toast } from "sonner";

interface ChatError {
  id: string;
  type: "video" | "image" | "text" | "general";
  message: string;
  timestamp: number;
  prompt?: string;
  retryable?: boolean;
}

interface UseChatErrorHandlerProps {
  onError?: (error: ChatError) => void;
  showToasts?: boolean;
}

export function useChatErrorHandler({
  onError,
  showToasts = true,
}: UseChatErrorHandlerProps = {}) {
  
  const handleError = useCallback((error: Omit<ChatError, "id" | "timestamp">) => {
    const chatError: ChatError = {
      ...error,
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    // Log error to console for debugging
    console.error(`🎬 ❌ Chat Error [${error.type}]:`, error.message);

    // Show toast notification
    if (showToasts) {
      const toastMessage = error.prompt 
        ? `Ошибка ${error.type === "video" ? "генерации видео" : error.type === "image" ? "генерации изображения" : "обработки"}: ${error.message}`
        : error.message;

      toast.error(toastMessage, {
        duration: 8000,
        description: error.prompt ? `Промпт: "${error.prompt}"` : undefined,
      });
    }

    // Call custom error handler
    if (onError) {
      onError(chatError);
    }
  }, [onError, showToasts]);

  // Global error handler for unhandled errors
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      // Only handle errors related to our app
      if (event.error && typeof event.error === "object") {
        const errorMessage = event.error.message || "Неизвестная ошибка";
        
        // Check if it's a video generation error
        if (errorMessage.includes("video") || errorMessage.includes("Video")) {
          handleError({
            type: "video",
            message: errorMessage,
            retryable: true,
          });
        } else if (errorMessage.includes("image") || errorMessage.includes("Image")) {
          handleError({
            type: "image", 
            message: errorMessage,
            retryable: true,
          });
        } else {
          handleError({
            type: "general",
            message: errorMessage,
            retryable: false,
          });
        }
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const errorMessage = event.reason?.message || "Ошибка выполнения операции";
      
      handleError({
        type: "general",
        message: errorMessage,
        retryable: true,
      });
    };

    window.addEventListener("error", handleGlobalError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleGlobalError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, [handleError]);

  return {
    handleError,
  };
}
