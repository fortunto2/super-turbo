import type { Suggestion } from '@/lib/db/schema';
import type { UseChatHelpers } from '@ai-sdk/react';
import type { ComponentType, Dispatch, ReactNode, SetStateAction } from 'react';
import type { DataStreamDelta } from '../shared/data-stream-handler';
import type { UIArtifact } from './artifact';

export type ArtifactActionContext<M = any> = {
  content: string;
  handleVersionChange: (type: 'next' | 'prev' | 'toggle' | 'latest') => void;
  currentVersionIndex: number;
  isCurrentVersion: boolean;
  mode: 'edit' | 'diff';
  metadata: M;
  setMetadata: Dispatch<SetStateAction<M>>;
  title?: string;
};

type ArtifactAction<M = any> = {
  icon: ReactNode;
  label?: string;
  description: string;
  onClick: (context: ArtifactActionContext<M>) => Promise<void> | void;
  isDisabled?: (context: ArtifactActionContext<M>) => boolean;
};

export type ArtifactToolbarContext = {
  appendMessage?: (
    message: any,
    options?: any,
  ) => Promise<string | null | undefined>; // AI SDK v5: append type
};

export type ArtifactToolbarItem = {
  description: string;
  icon: ReactNode;
  onClick: (context: ArtifactToolbarContext) => void;
};

interface ArtifactContent<M = any> {
  title: string;
  content: string;
  mode: 'edit' | 'diff';
  isCurrentVersion: boolean;
  currentVersionIndex: number;
  status: 'streaming' | 'idle' | 'error';
  suggestions: Array<Suggestion>;
  onSaveContent: (updatedContent: string, debounce: boolean) => void;
  isInline: boolean;
  getDocumentContentById: (index: number) => string;
  isLoading: boolean;
  metadata: M;
  setMetadata: Dispatch<SetStateAction<M>>;
  append?: (message: any, options?: any) => Promise<string | null | undefined>; // AI SDK v5: append type
  setMessages?: UseChatHelpers<any>['setMessages'];
  setArtifact?: Dispatch<SetStateAction<UIArtifact>>;
  chatId?: string;
  documentId?: string;
}

interface InitializeParameters<M = any> {
  documentId: string;
  setMetadata: Dispatch<SetStateAction<M>>;
}

type ArtifactConfig<T extends string, M = any> = {
  kind: T;
  description: string;
  content: ComponentType<ArtifactContent<M>>;
  actions: Array<ArtifactAction<M>>;
  toolbar: ArtifactToolbarItem[];
  initialize?: (parameters: InitializeParameters<M>) => void;
  onCreateDocument?: (args: {
    setArtifact: Dispatch<SetStateAction<UIArtifact>>;
  }) => void;
  onStreamPart: (args: {
    setMetadata: Dispatch<SetStateAction<M>>;
    setArtifact: Dispatch<SetStateAction<UIArtifact>>;
    streamPart: DataStreamDelta;
  }) => void;
};

export class Artifact<T extends string, M = any> {
  readonly kind: T;
  readonly description: string;
  readonly content: ComponentType<ArtifactContent<M>>;
  readonly actions: Array<ArtifactAction<M>>;
  readonly toolbar: ArtifactToolbarItem[];
  readonly initialize?: (parameters: InitializeParameters) => void;
  readonly onCreateDocument?: (args: {
    setArtifact: Dispatch<SetStateAction<UIArtifact>>;
  }) => void;
  readonly onStreamPart: (args: {
    setMetadata: Dispatch<SetStateAction<M>>;
    setArtifact: Dispatch<SetStateAction<UIArtifact>>;
    streamPart: DataStreamDelta;
  }) => void;

  constructor(config: ArtifactConfig<T, M>) {
    this.kind = config.kind;
    this.description = config.description;
    this.content = config.content;
    this.actions = config.actions || [];
    this.toolbar = config.toolbar || [];
    this.initialize = config.initialize || (async () => ({}));
    this.onCreateDocument = config.onCreateDocument || (() => {});
    this.onStreamPart = config.onStreamPart;
  }
}
