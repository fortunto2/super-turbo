'use client';

import { useState } from 'react';
import { BananaVeo3Chat } from './banana-veo3-chat';
import { DataStreamHandler } from '@/components/shared/data-stream-handler';
import { ArtifactProvider } from '@/contexts/artifact-context';
import type { UIMessage } from 'ai';
import type { VisibilityType } from '@/components/shared/visibility-selector';
import type { Session } from 'next-auth';

interface BananaVeo3ChatWrapperProps {
  id: string;
  initialMessages: Array<UIMessage>;
  initialChatModel: string;
  initialVisibilityType: VisibilityType;
  isReadonly: boolean;
  session: Session;
  autoResume: boolean;
}

export function BananaVeo3ChatWrapper(props: BananaVeo3ChatWrapperProps) {
  const [dataStream, setDataStream] = useState<any[]>([]);

  return (
    <ArtifactProvider chatId={props.id} messages={props.initialMessages}>
      <BananaVeo3Chat {...props} onDataStream={setDataStream} />
      <DataStreamHandler id={props.id} dataStream={dataStream} />
    </ArtifactProvider>
  );
}
