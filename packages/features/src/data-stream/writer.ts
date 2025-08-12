// Data Stream Writer implementation

import type {
  DataStreamWriter,
  DataStreamWriterProps,
  DataStreamConfig,
  DataStreamEvent,
} from "./types";

export class BufferedDataStreamWriter implements DataStreamWriter {
  private buffer: any[] = [];
  private config: DataStreamConfig;
  private flushTimer?: number;

  constructor(config: DataStreamConfig = {}) {
    this.config = {
      bufferSize: 1000,
      flushInterval: 100,
      encoding: "utf8",
      compression: false,
      ...config,
    };
  }

  write(data: any): void {
    this.buffer.push(data);

    if (this.buffer.length >= (this.config.bufferSize || 1000)) {
      this.flush();
    }
  }

  end(): void {
    this.flush();
    this.cleanup();
  }

  error(error: Error): void {
    this.cleanup();
    throw error;
  }

  private flush(): void {
    if (this.buffer.length > 0) {
      // Process buffered data
      const data = this.buffer.splice(0);
      // Here you would typically send data to the actual stream
      console.log("Flushing data stream:", data.length, "items");
    }
  }

  private cleanup(): void {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
    }
  }
}

export function createDataStreamWriter(
  props: DataStreamWriterProps
): DataStreamWriter {
  return {
    write: props.write,
    end: props.end,
    error: props.error,
  };
}

export function createBufferedDataStreamWriter(
  config?: DataStreamConfig
): DataStreamWriter {
  return new BufferedDataStreamWriter(config);
}
