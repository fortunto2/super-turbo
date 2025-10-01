"use client";

import { useState } from "react";
import { ChevronDownIcon } from "../common/icons";
import { motion, AnimatePresence } from "framer-motion";
import { Markdown } from "../";

interface MessageReasoningDebugProps {
  isLoading: boolean;
  reasoningText: any; // Изменяем тип на any, чтобы анализировать разные форматы
  message?: any;
}

export function MessageReasoningDebug({
  isLoading,
  reasoningText,
  message,
}: MessageReasoningDebugProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Подготавливаем текст рассуждений
  let processedReasoningText = "";

  // Попытка извлечь рассуждения из разных форматов
  if (typeof reasoningText === "string") {
    processedReasoningText = reasoningText;

    // Для случая, когда think tags находятся в тексте
    const thinkMatch = reasoningText.match(/<think>(.*?)<\/think>/s);
    if (thinkMatch?.[1]) {
      processedReasoningText = thinkMatch[1].trim();
    }
  } else if (reasoningText && typeof reasoningText === "object") {
    try {
      processedReasoningText = JSON.stringify(reasoningText, null, 2);
    } catch (e) {
      processedReasoningText = "Unable to convert reasoning to string";
    }
  }

  // Ищем рассуждения в разных местах
  if (message) {
    if (!processedReasoningText && message.parts) {
      // Ищем в parts
      for (const part of message.parts) {
        if (part.type === "reasoning" && (part as any).reasoningText) {
          processedReasoningText = (part as any).reasoningText;
          break;
        } else if (part.type === "reasoning" && part.text) {
          processedReasoningText = part.text;
          break;
        } else if (part.type === "reasoning" && (part as any).textDelta) {
          processedReasoningText = (part as any).textDelta;
          break;
        }
      }
    }

    // Проверяем, есть ли рассуждения в свойстве reasoning
    if (!processedReasoningText && (message as any).reasoningText) {
      processedReasoningText =
        typeof (message as any).reasoningText === "string"
          ? (message as any).reasoningText
          : JSON.stringify((message as any).reasoningText, null, 2);
    }

    // Ищем рассуждения в content
    if (
      !processedReasoningText &&
      (message as any).content &&
      typeof (message as any).content === "string"
    ) {
      const thinkMatch = (message as any).content.match(
        /<think>(.*?)<\/think>/s
      );
      if (thinkMatch?.[1]) {
        processedReasoningText = thinkMatch[1].trim();
      }
    }
  }

  const variants = {
    collapsed: {
      height: 0,
      opacity: 0,
      marginTop: 0,
      marginBottom: 0,
    },
    expanded: {
      height: "auto",
      opacity: 1,
      marginTop: "1rem",
      marginBottom: "0.5rem",
    },
  };

  // Проверяем, есть ли содержимое в рассуждениях
  if (!processedReasoningText || processedReasoningText.trim() === "") {
    return (
      <div className="flex flex-col">
        <div className="text-xs p-2 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 rounded">
          ⚠️ Рассуждения были запрошены, но не найдены в ответе
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-row gap-2 items-center">
        <div className="font-medium bg-gradient-to-r from-blue-500 to-violet-500 text-transparent bg-clip-text">
          AI reasoning debug
        </div>
        <span className="text-xs text-muted-foreground">
          ({processedReasoningText.length} chars)
        </span>
        <button
          data-testid="message-reasoning-toggle"
          type="button"
          className="cursor-pointer"
          onClick={() => {
            setIsExpanded(!isExpanded);
          }}
        >
          <ChevronDownIcon />
        </button>
      </div>
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            data-testid="message-reasoning"
            key="content"
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            variants={variants}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
            className="pl-4 text-zinc-600 dark:text-zinc-400 border-l flex flex-col gap-4"
          >
            <div className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded text-xs">
              <details>
                <summary>Debugging info</summary>
                <pre>
                  {JSON.stringify(
                    {
                      sourceType: typeof reasoningText,
                      sourceKeys:
                        reasoningText && typeof reasoningText === "object"
                          ? Object.keys(reasoningText)
                          : "not an object",
                      messageInfo: message
                        ? {
                            keys: Object.keys(message),
                            hasReasoning: !!(message as any).reasoningText,
                            parts: message.parts ? message.parts.length : 0,
                          }
                        : "no message",
                    },
                    null,
                    2
                  )}
                </pre>
              </details>
            </div>
            <Markdown>{processedReasoningText}</Markdown>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
