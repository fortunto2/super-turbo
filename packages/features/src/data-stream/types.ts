// Data Stream types

export interface DataStreamWriter {
  write: (data: any) => void;
  end: () => void;
  error: (error: Error) => void;
}

export type DataStreamWriterProps = {
  write: DataStreamWriter["write"];
  end: DataStreamWriter["end"];
  error: DataStreamWriter["error"];
};

export interface DataStreamConfig {
  bufferSize?: number;
  flushInterval?: number;
  encoding?: string;
  compression?: boolean;
}

export interface DataStreamEvent {
  type: "data" | "end" | "error";
  payload?: any;
  timestamp: number;
  id?: string;
}

export interface DataStreamReader {
  read: () => Promise<any>;
  hasNext: () => boolean;
  close: () => void;
}

export interface DataStreamTransform {
  transform: (data: any) => any;
  flush?: () => any;
}
