'use client';

import { memo, useEffect, useRef, useState } from 'react';
import type { Suggestion } from '@/lib/db/schema';

type EditorProps = {
  content: string;
  onSaveContent: (updatedContent: string, debounce: boolean) => void;
  status: 'streaming' | 'idle' | 'error';
  isCurrentVersion: boolean;
  currentVersionIndex: number;
  suggestions: Array<Suggestion>;
};

function PureCodeEditor({ content, onSaveContent, status }: EditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const initEditor = async () => {
      if (containerRef.current && !editorRef.current && !isLoaded) {
        try {
          // Динамический импорт CodeMirror
          const [
            { EditorView },
            { EditorState },
            { python },
            { oneDark },
            { basicSetup },
          ] = await Promise.all([
            import('@codemirror/view'),
            import('@codemirror/state'),
            import('@codemirror/lang-python'),
            import('@codemirror/theme-one-dark'),
            import('codemirror'),
          ]);

          const startState = EditorState.create({
            doc: content,
            extensions: [basicSetup, python(), oneDark],
          });

          editorRef.current = new EditorView({
            state: startState,
            parent: containerRef.current,
          });

          setIsLoaded(true);
        } catch (error) {
          console.error('Failed to load CodeMirror:', error);
        }
      }
    };

    initEditor();

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
    // NOTE: we only want to run this effect once
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (editorRef.current && isLoaded) {
      const updateListener = editorRef.current.state
        .facet(editorRef.current.state.facet.define)
        .updateListener?.of((update: any) => {
          if (update.docChanged) {
            const transaction = update.transactions.find(
              (tr: any) => !tr.annotation(tr.annotation.define?.remote),
            );

            if (transaction) {
              const newContent = update.state.doc.toString();
              onSaveContent(newContent, true);
            }
          }
        });

      if (updateListener) {
        const currentSelection = editorRef.current.state.selection;
        const newState = editorRef.current.state.update({
          extensions: [updateListener],
          selection: currentSelection,
        });
        editorRef.current.setState(newState);
      }
    }
  }, [onSaveContent, isLoaded]);

  useEffect(() => {
    if (editorRef.current && content && isLoaded) {
      const currentContent = editorRef.current.state.doc.toString();

      if (status === 'streaming' || currentContent !== content) {
        const transaction = editorRef.current.state.update({
          changes: {
            from: 0,
            to: currentContent.length,
            insert: content,
          },
          annotations: [
            editorRef.current.state.annotation.define?.remote?.of(true),
          ],
        });

        editorRef.current.dispatch(transaction);
      }
    }
  }, [content, status, isLoaded]);

  return (
    <div
      className="relative not-prose w-full pb-[calc(80dvh)] text-sm"
      ref={containerRef}
    />
  );
}

function areEqual(prevProps: EditorProps, nextProps: EditorProps) {
  if (prevProps.suggestions !== nextProps.suggestions) return false;
  if (prevProps.currentVersionIndex !== nextProps.currentVersionIndex)
    return false;
  if (prevProps.isCurrentVersion !== nextProps.isCurrentVersion) return false;
  if (prevProps.status === 'streaming' && nextProps.status === 'streaming')
    return false;
  if (prevProps.content !== nextProps.content) return false;

  return true;
}

export const CodeEditor = memo(PureCodeEditor, areEqual);
