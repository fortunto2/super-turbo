import { Artifact } from '@/components/artifacts/create-artifact';
import {
  CopyIcon,
  LineChartIcon,
  RedoIcon,
  SparklesIcon,
  UndoIcon,
  ShareIcon,
} from '@/components/common/icons';
import { SpreadsheetEditor } from '@/components/editors/sheet-editor';
import { parse, unparse } from 'papaparse';
import { toast } from 'sonner';

type Metadata = any;

export const sheetArtifact = new Artifact<'sheet', Metadata>({
  kind: 'sheet',
  description: 'Useful for working with spreadsheets',
  onCreateDocument: ({ setArtifact }) => {
    // Устанавливаем статус streaming при создании артефакта
    setArtifact((draft) => ({
      ...draft,
      status: 'streaming',
      isVisible: true,
    }));
  },
  initialize: async () => {},
  onStreamPart: ({ setArtifact, streamPart }) => {
    if (streamPart.type === 'sheet-delta') {
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: streamPart.content as string,
        // Открываем артефакт только если контент достаточно большой
        isVisible:
          (streamPart.content as string).length > 100 ||
          draftArtifact.isVisible,
        status: 'streaming',
      }));
    }

    if (streamPart.type === 'finish') {
      setArtifact((draft) => ({ ...draft, status: 'completed' }));
    }
  },
  content: ({
    content,
    currentVersionIndex,
    isCurrentVersion,
    onSaveContent,
    status,
  }) => {
    return (
      <SpreadsheetEditor
        content={content}
        currentVersionIndex={currentVersionIndex}
        isCurrentVersion={isCurrentVersion}
        saveContent={onSaveContent}
        status={status}
      />
    );
  },
  actions: [
    {
      icon: <UndoIcon size={18} />,
      description: 'View Previous version',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('prev');
      },
      isDisabled: ({ currentVersionIndex }) => {
        if (currentVersionIndex === 0) {
          return true;
        }

        return false;
      },
    },
    {
      icon: <RedoIcon size={18} />,
      description: 'View Next version',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('next');
      },
      isDisabled: ({ isCurrentVersion }) => {
        if (isCurrentVersion) {
          return true;
        }

        return false;
      },
    },
    {
      icon: <CopyIcon />,
      description: 'Copy as .csv',
      onClick: ({ content }) => {
        const parsed = parse<string[]>(content, { skipEmptyLines: true });

        const nonEmptyRows = parsed.data.filter((row) =>
          row.some((cell) => cell.trim() !== ''),
        );

        const cleanedCsv = unparse(nonEmptyRows);

        navigator.clipboard.writeText(cleanedCsv);
        toast.success('Copied csv to clipboard!');
      },
    },
    {
      icon: <ShareIcon size={18} />,
      description: 'Copy artifact link',
      onClick: (context) => {
        const documentId = (context as any).documentId;
        if (documentId && documentId !== 'init') {
          const shareUrl = `${window.location.origin}/artifact/${documentId}`;
          navigator.clipboard.writeText(shareUrl);
          toast.success('Artifact link copied to clipboard!');
        } else {
          toast.error('Unable to generate share link - artifact not saved yet');
        }
      },
    },
  ],
  toolbar: [
    {
      description: 'Format and clean data',
      icon: <SparklesIcon />,
      onClick: ({ appendMessage }) => {
        appendMessage?.({
          role: 'user',
          content: 'Can you please format and clean the data?',
        });
      },
    },
    {
      description: 'Analyze and visualize data',
      icon: <LineChartIcon />,
      onClick: ({ appendMessage }) => {
        appendMessage?.({
          role: 'user',
          content:
            'Can you please analyze and visualize the data by creating a new code artifact in python?',
        });
      },
    },
  ],
});
