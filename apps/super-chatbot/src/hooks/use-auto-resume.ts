"use client";

import { useEffect } from "react";
import type { UIMessage } from "ai";

export interface UseAutoResumeParams {
  autoResume: boolean;
  initialMessages: UIMessage[];
  experimental_resume: () => void; // AI SDK v5: resume is now a simple function
  data: any[]; // AI SDK v5: data type changed
  setMessages: (messages: UIMessage[]) => void;
}

export function useAutoResume({
  autoResume,
  initialMessages,
  experimental_resume,
  data,
  setMessages,
}: UseAutoResumeParams) {
  useEffect(() => {
    if (!autoResume) return;

    const mostRecentMessage = initialMessages.at(-1);

    if (mostRecentMessage?.role === "user") {
      experimental_resume();
    }

    // we intentionally run this once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!data) return;
    if (data.length === 0) return;

    // AI SDK v5: Handle data parts differently
    const dataPart = data[0] as any;

    if (dataPart.type === "data-append-message") {
      const message = JSON.parse(dataPart.data) as UIMessage;
      setMessages([...initialMessages, message]);
    }
  }, [data, initialMessages, setMessages]);
}
