'use client';

import { useEffect } from 'react';
import type { UIMessage } from 'ai';
import type { UseChatHelpers } from '@ai-sdk/react';
import type { DataPart } from '@/lib/types';

export interface UseAutoResumeParams {
  autoResume: boolean;
  initialMessages: UIMessage[];
  data: UseChatHelpers['data'];
  setMessages: UseChatHelpers['setMessages'];
}

export function useAutoResume({
  autoResume,
  initialMessages,
  data,
  setMessages,
}: UseAutoResumeParams) {
  // Note: In AI SDK v5, stream resuming is handled automatically
  // The experimental_resume function has been replaced by resumeStream option in useChat
  useEffect(() => {
    if (!autoResume) return;

    // Auto-resume functionality is now built into useChat with resumeStream option
    // No manual intervention needed in v5

    // we intentionally run this once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!data) return;
    if (data.length === 0) return;

    const dataPart = data[0] as DataPart;

    if (dataPart.type === 'append-message') {
      const message = JSON.parse(dataPart.message) as UIMessage;
      setMessages([...initialMessages, message]);
    }
  }, [data, initialMessages, setMessages]);
}
