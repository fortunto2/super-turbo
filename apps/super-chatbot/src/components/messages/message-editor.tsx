'use client';

import type { UIMessage as Message } from 'ai';
import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';
import { deleteTrailingMessages } from '@/app/(chat)/actions';

import { Button, Textarea } from '@turbo-super/ui';
export type MessageEditorProps = {
  message: Message;
  setMode: Dispatch<SetStateAction<'view' | 'edit'>>;
  setMessages: any // AI SDK v5: setMessages type changed;
  reload: any // AI SDK v5: reload type changed;
};

export function MessageEditor({
  message,
  setMode,
  setMessages,
  reload,
}: MessageEditorProps) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // AI SDK v5: Extract text from parts instead of content
  const initialContent = message.parts
    ?.filter((p: any) => p.type === 'text')
    ?.map((p: any) => p.text)
    ?.join('') || (message as any).content || '';

  const [draftContent, setDraftContent] = useState<string>(initialContent);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, []);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 2}px`;
    }
  };

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraftContent(event.target.value);
    adjustHeight();
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <Textarea
        data-testid="message-editor"
        ref={textareaRef}
        className="bg-transparent outline-none overflow-hidden resize-none !text-base rounded-xl w-full"
        value={draftContent}
        onChange={handleInput}
      />

      <div className="flex flex-row gap-2 justify-end">
        <Button
          variant="outline"
          className="h-fit py-2 px-3"
          onClick={() => {
            setMode('view');
          }}
        >
          Cancel
        </Button>
        <Button
          data-testid="message-editor-send-button"
          variant="default"
          className="h-fit py-2 px-3"
          disabled={isSubmitting}
          onClick={async () => {
            setIsSubmitting(true);

            await deleteTrailingMessages({
              id: message.id,
            });

            setMessages((messages: any) => {
              const index = messages.findIndex((m: any) => m.id === message.id);

              if (index !== -1) {
                const updatedMessage = {
                  ...message,
                  content: draftContent,
                  parts: [{ type: 'text', text: draftContent }],
                };

                return [...messages.slice(0, index), updatedMessage];
              }

              return messages;
            });

            setMode('view');
            reload();
          }}
        >
          {isSubmitting ? 'Sending...' : 'Send'}
        </Button>
      </div>
    </div>
  );
}
