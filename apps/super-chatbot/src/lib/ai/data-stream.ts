export interface UIMessageStreamWriter {
  write: (data: any) => void;
  end: () => void;
  error: (error: Error) => void;
}

export type DataStreamWriterProps = {
  write: UIMessageStreamWriter['write'];
  end: UIMessageStreamWriter['end'];
  error: UIMessageStreamWriter['error'];
}; 