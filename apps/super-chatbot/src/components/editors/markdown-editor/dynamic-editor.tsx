"use client";

import { forwardRef, useEffect, useState } from "react";
import type { MDXEditorMethods, MDXEditorProps } from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";

interface DynamicMarkdownEditorProps extends Omit<MDXEditorProps, "ref"> {
  editorRef?: React.RefObject<MDXEditorMethods>;
  className?: string;
}

export const DynamicMarkdownEditor = forwardRef<
  MDXEditorMethods,
  DynamicMarkdownEditorProps
>(({ editorRef, className, ...props }, ref) => {
  const [Editor, setEditor] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadEditor = async () => {
      try {
        const { MDXEditor } = await import("@mdxeditor/editor");
        setEditor(() => MDXEditor);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load MDXEditor:", error);
        setIsLoading(false);
      }
    };

    loadEditor();
  }, []);

  if (isLoading) {
    return (
      <div
        className={`flex items-center justify-center h-64 ${className || ""}`}
      >
        <div className="text-gray-500">Loading editor...</div>
      </div>
    );
  }

  if (!Editor) {
    return (
      <div
        className={`flex items-center justify-center h-64 ${className || ""}`}
      >
        <div className="text-red-500">Failed to load editor</div>
      </div>
    );
  }

  return (
    <Editor
      ref={ref || editorRef}
      className={className}
      {...props}
    />
  );
});

DynamicMarkdownEditor.displayName = "DynamicMarkdownEditor";
