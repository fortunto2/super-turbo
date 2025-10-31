'use client';

import type { UIMessage } from 'ai';
import type { Attachment } from '@/lib/types/attachment';
import cx from 'classnames';
import {
  useRef,
  useEffect,
  useState,
  useCallback,
  type Dispatch,
  type SetStateAction,
  type ChangeEvent,
  memo,
} from 'react';
import { toast } from 'sonner';
import { useLocalStorage, useWindowSize } from 'usehooks-ts';

import { ArrowUpIcon, PaperclipIcon, StopIcon } from '../common/icons';
import { PreviewAttachment } from '../shared/preview-attachment';
import { EnhancedTextarea } from '../ui/enhanced-textarea';
import { SuggestedActions } from './suggested-actions';
import { ChatImageHistory } from './chat-image-history';
import equal from 'fast-deep-equal';
import type { UseChatHelpers } from '@ai-sdk/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { useScrollToBottom } from '@/hooks/use-scroll-to-bottom';

import { Button } from '@turbo-super/ui';
import type { VisibilityType } from '../shared/visibility-selector';
function PureMultimodalInput({
  chatId,
  input,
  setInput,
  status,
  stop,
  attachments,
  setAttachments,
  messages,
  setMessages,
  append,
  handleSubmit,
  className,
  selectedVisibilityType,
  isSubmitting,
  isSubmittingRef,
}: {
  chatId: string;
  input: string; // AI SDK v5: manually managed
  setInput: (value: string) => void; // AI SDK v5: manually managed
  status: UseChatHelpers<any>['status'];
  stop: () => void;
  isSubmitting?: boolean;
  isSubmittingRef?: React.MutableRefObject<boolean>;
  attachments: Array<Attachment>;
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
  messages: Array<UIMessage>;
  setMessages: UseChatHelpers<any>['setMessages'];
  append: (message: any, options?: any) => Promise<string | null | undefined>; // AI SDK v5: append type
  handleSubmit: (event?: any, options?: any) => void; // AI SDK v5: handleSubmit type
  className?: string;
  selectedVisibilityType: VisibilityType;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();

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

  const resetHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = '98px';
    }
  };

  const [localStorageInput, setLocalStorageInput] = useLocalStorage(
    'input',
    '',
  );

  useEffect(() => {
    if (textareaRef.current) {
      const domValue = textareaRef.current.value;
      // Prefer DOM value over localStorage to handle hydration
      const finalValue = domValue || localStorageInput || '';
      setInput(finalValue);
      adjustHeight();
    }
    // Only run once after hydration
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLocalStorageInput(input);
  }, [input, setLocalStorageInput]);

  const handleInput = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    adjustHeight();
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);

  const submitForm = useCallback(
    (e: any) => {
      // Проверяем блокировку
      if (
        status !== 'ready' ||
        isSubmitting ||
        isSubmittingRef?.current === true
      ) {
        console.log(
          '🔍 submitForm blocked - status:',
          status,
          'isSubmitting:',
          isSubmitting,
          'isSubmittingRef:',
          isSubmittingRef?.current,
        );
        return;
      }

      if (!input.trim() && attachments.length === 0) {
        return;
      }

      // НЕ обновляем URL сразу - ждем успешного создания чата
      // URL будет обновлен через команду от сервера

      handleSubmit(undefined, {
        experimental_attachments: attachments,
      });

      setAttachments([]);
      setLocalStorageInput('');
      resetHeight();

      if (width && width > 768) {
        textareaRef.current?.focus();
      }
    },
    [
      attachments,
      handleSubmit,
      setAttachments,
      setLocalStorageInput,
      width,
      input,
      status,
      isSubmitting,
      isSubmittingRef,
    ],
  );

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const { url, pathname, contentType } = data;

        return {
          url,
          name: pathname,
          contentType: contentType,
        };
      }
      const { error } = await response.json();
      toast.error(error);
      return null;
    } catch (error) {
      toast.error('Failed to upload file, please try again!');
      return null;
    }
  };

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);

      setUploadQueue(files.map((file) => file.name));

      // НЕ обновляем URL при загрузке файлов - ждем команду от сервера

      try {
        const uploadPromises = files.map((file) => uploadFile(file));
        const uploadedAttachments = await Promise.all(uploadPromises);
        const successfullyUploadedAttachments = uploadedAttachments.filter(
          (attachment) => attachment !== undefined && attachment !== null,
        ) as Attachment[];

        setAttachments((currentAttachments) => [
          ...currentAttachments,
          ...successfullyUploadedAttachments,
        ]);
      } catch (error) {
        console.error('Error uploading files!', error);
      } finally {
        setUploadQueue([]);
      }
    },
    [setAttachments],
  );

  const { isAtBottom, scrollToBottom } = useScrollToBottom();
  const [showImageHistory, setShowImageHistory] = useState(false);

  useEffect(() => {
    if (status === 'submitted') {
      scrollToBottom();
    }
  }, [status, scrollToBottom]);

  return (
    <div className="relative w-full flex flex-col gap-4">
      <AnimatePresence>
        {!isAtBottom && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="absolute left-1/2 bottom-28 -translate-x-1/2 z-50"
          >
            <Button
              data-testid="scroll-to-bottom-button"
              className="rounded-full"
              size="icon"
              variant="outline"
              onClick={(event) => {
                event.preventDefault();
                scrollToBottom();
              }}
            >
              <ArrowDown />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {messages.length === 0 &&
        attachments.length === 0 &&
        uploadQueue.length === 0 && (
          <SuggestedActions
            append={append}
            chatId={chatId}
            selectedVisibilityType={selectedVisibilityType}
            onAppend={(message) => {
              // НЕ обновляем URL здесь - ждем команду от сервера
              append(message);
            }}
          />
        )}

      <input
        type="file"
        className="fixed -top-4 -left-4 size-0.5 opacity-0 pointer-events-none"
        ref={fileInputRef}
        multiple
        onChange={handleFileChange}
        tabIndex={-1}
      />

      {(attachments.length > 0 || uploadQueue.length > 0) && (
        <div
          data-testid="attachments-preview"
          className="flex flex-row gap-2 overflow-x-scroll items-end"
        >
          {attachments.map((attachment) => (
            <PreviewAttachment
              key={attachment.url}
              attachment={attachment}
              chatId={chatId}
            />
          ))}

          {uploadQueue.map((filename) => (
            <PreviewAttachment
              key={filename}
              attachment={{
                url: '',
                name: filename,
                contentType: '',
              }}
              isUploading={true}
              chatId={chatId}
            />
          ))}
        </div>
      )}

      {showImageHistory && (
        <ChatImageHistory
          chatId={chatId}
          isVisible={showImageHistory}
          onImageSelect={(imageUrl) => {
            // When user selects an image, add it to input
            const imageReference = `![Generated Image](${imageUrl})`;
            setInput(input + (input ? '\n\n' : '') + imageReference);
            // Optionally close the history after selection
            setShowImageHistory(false);
            // Focus textarea
            if (textareaRef.current) {
              textareaRef.current.focus();
              setTimeout(() => {
                adjustHeight();
              }, 0);
            }
          }}
        />
      )}

      <EnhancedTextarea
        data-testid="multimodal-input"
        ref={textareaRef}
        placeholder="Send a message..."
        value={input}
        onChange={handleInput}
        className={cx(
          'min-h-[24px] max-h-[calc(75dvh)] overflow-hidden rounded-2xl !text-base bg-muted pb-10 dark:border-zinc-700',
          className,
        )}
        rows={2}
        autoFocus
        fullscreenTitle="Message"
        onKeyDown={(event) => {
          if (
            event.key === 'Enter' &&
            !event.shiftKey &&
            !event.nativeEvent.isComposing
          ) {
            event.preventDefault();

            if (status !== 'ready') {
              toast.error('Please wait for the model to finish its response!');
            } else {
              submitForm(event);
            }
          }
        }}
      />

      <div className="absolute bottom-0 p-2 w-fit flex flex-row justify-start gap-1">
        <AttachmentsButton fileInputRef={fileInputRef} status={status} />
        <ImageHistoryButton
          showImageHistory={showImageHistory}
          setShowImageHistory={setShowImageHistory}
          status={status}
        />
      </div>

      <div className="absolute bottom-0 right-0 p-2 w-fit flex flex-row justify-end">
        {status === 'submitted' ? (
          <StopButton stop={stop} setMessages={setMessages} />
        ) : (
          <SendButton
            input={input}
            submitForm={submitForm}
            uploadQueue={uploadQueue}
            status={status}
            {...(isSubmitting !== undefined && { isSubmitting })}
            {...(isSubmittingRef && { isSubmittingRef })}
          />
        )}
      </div>
    </div>
  );
}

export const MultimodalInput = memo(
  PureMultimodalInput,
  (prevProps, nextProps) => {
    if (prevProps.input !== nextProps.input) return false;
    if (prevProps.status !== nextProps.status) return false;
    if (!equal(prevProps.attachments, nextProps.attachments)) return false;
    if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType)
      return false;

    return true;
  },
);

function PureAttachmentsButton({
  fileInputRef,
  status,
}: {
  fileInputRef: React.MutableRefObject<HTMLInputElement | null>;
  status: UseChatHelpers<any>['status'];
}) {
  return (
    <Button
      data-testid="attachments-button"
      className="rounded-md rounded-bl-lg p-[7px] h-fit dark:border-zinc-700 hover:dark:bg-zinc-900 hover:bg-zinc-200"
      onClick={(event) => {
        event.preventDefault();
        fileInputRef.current?.click();
      }}
      disabled={status !== 'ready'}
      variant="ghost"
    >
      <PaperclipIcon size={14} />
    </Button>
  );
}

const AttachmentsButton = memo(PureAttachmentsButton);

function PureStopButton({
  stop,
  setMessages,
}: {
  stop: () => void;
  setMessages: UseChatHelpers<any>['setMessages'];
}) {
  return (
    <Button
      data-testid="stop-button"
      className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
      onClick={(event) => {
        event.preventDefault();
        stop();
        setMessages((messages: UIMessage[]) => messages);
      }}
    >
      <StopIcon size={14} />
    </Button>
  );
}

const StopButton = memo(PureStopButton);

function PureSendButton({
  submitForm,
  input,
  uploadQueue,
  status,
  isSubmitting,
  isSubmittingRef,
}: {
  submitForm: (event: any) => void;
  input: string;
  uploadQueue: Array<string>;
  status: UseChatHelpers<any>['status'];
  isSubmitting?: boolean;
  isSubmittingRef?: React.MutableRefObject<boolean>;
}) {
  const isDisabled =
    input?.length === 0 ||
    uploadQueue.length > 0 ||
    status !== 'ready' ||
    isSubmitting ||
    isSubmittingRef?.current === true;

  return (
    <Button
      data-testid="send-button"
      className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
      onClick={(event) => {
        event.preventDefault();
        submitForm(event);
      }}
      disabled={isDisabled}
      style={{
        opacity: isDisabled ? 0.5 : 1,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
      }}
    >
      <ArrowUpIcon size={14} />
    </Button>
  );
}

const SendButton = memo(PureSendButton, (prevProps, nextProps) => {
  if (prevProps.uploadQueue.length !== nextProps.uploadQueue.length)
    return false;
  if (prevProps.input !== nextProps.input) return false;
  if (prevProps.status !== nextProps.status) return false;
  if (prevProps.isSubmitting !== nextProps.isSubmitting) return false;
  if (prevProps.isSubmittingRef?.current !== nextProps.isSubmittingRef?.current)
    return false;
  return true;
});

function PureImageHistoryButton({
  showImageHistory,
  setShowImageHistory,
  status,
}: {
  showImageHistory: boolean;
  setShowImageHistory: (show: boolean) => void;
  status: UseChatHelpers<any>['status'];
}) {
  return (
    <Button
      data-testid="image-history-button"
      className={cx(
        'rounded-md p-[7px] h-fit dark:border-zinc-700 hover:dark:bg-zinc-900 hover:bg-zinc-200',
        showImageHistory && 'bg-zinc-200 dark:bg-zinc-900',
      )}
      onClick={(event) => {
        event.preventDefault();
        setShowImageHistory(!showImageHistory);
      }}
      disabled={status !== 'ready'}
      variant="ghost"
      title={showImageHistory ? 'Hide image history' : 'Show image history'}
    >
      <svg
        width={14}
        height={14}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
      </svg>
    </Button>
  );
}

const ImageHistoryButton = memo(PureImageHistoryButton);
