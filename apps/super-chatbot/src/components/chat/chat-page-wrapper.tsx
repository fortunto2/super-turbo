"use client";

import { useState } from "react";
import { Chat } from "./chat";
import { DataStreamHandler } from "../shared/data-stream-handler";
import { ArtifactProvider } from "@/contexts/artifact-context";
import type { UIMessage } from "ai";
import type { VisibilityType } from "../shared/visibility-selector";
import type { Session } from "next-auth";

interface ChatPageWrapperProps {
  id: string;
  initialMessages: Array<UIMessage>;
  initialChatModel: string;
  initialVisibilityType: VisibilityType;
  isReadonly: boolean;
  session: Session;
  autoResume: boolean;
}

export function ChatPageWrapper(props: ChatPageWrapperProps) {
  const [dataStream, setDataStream] = useState<any[]>([]);

  return (
    <ArtifactProvider
      chatId={props.id}
      messages={props.initialMessages}
    >
      <Chat
        {...props}
        onDataStream={setDataStream}
      />
      <DataStreamHandler
        id={props.id}
        dataStream={dataStream}
      />
    </ArtifactProvider>
  );
}
