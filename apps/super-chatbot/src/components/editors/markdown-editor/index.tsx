"use client";

import type { ForwardedRef } from "react";
import { useEffect, useState } from "react";
import type { MDXEditorMethods, MDXEditorProps } from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import styles from "./styles.module.scss";
import { cn } from "@turbo-super/ui";

export const MarkdownEditor = ({
  editorRef,
  className,
  ...props
}: {
  editorRef: ForwardedRef<MDXEditorMethods> | null;
  className?: string;
} & MDXEditorProps) => {
  const [Editor, setEditor] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadEditor = async () => {
      try {
        const [
          { MDXEditor },
          { headingsPlugin },
          { listsPlugin },
          { quotePlugin },
          { thematicBreakPlugin },
          { markdownShortcutPlugin },
          { toolbarPlugin },
          { UndoRedo },
          { BoldItalicUnderlineToggles },
          { BlockTypeSelect },
          { ListsToggle },
          { Separator },
          { codeBlockPlugin },
          { InsertCodeBlock },
          { codeMirrorPlugin },
        ] = await Promise.all([
          import("@mdxeditor/editor"),
          import("@mdxeditor/editor"),
          import("@mdxeditor/editor"),
          import("@mdxeditor/editor"),
          import("@mdxeditor/editor"),
          import("@mdxeditor/editor"),
          import("@mdxeditor/editor"),
          import("@mdxeditor/editor"),
          import("@mdxeditor/editor"),
          import("@mdxeditor/editor"),
          import("@mdxeditor/editor"),
          import("@mdxeditor/editor"),
          import("@mdxeditor/editor"),
          import("@mdxeditor/editor"),
          import("@mdxeditor/editor"),
        ]);

        // CSS будет импортирован статически в начале файла

        const EditorComponent = (editorProps: any) => (
          <MDXEditor
            {...editorProps}
            contentEditableClassName={cn("prose", styles.editor)}
            plugins={[
              toolbarPlugin({
                toolbarContents: () => (
                  <>
                    <InsertCodeBlock />
                    <UndoRedo />
                    <Separator />
                    <BoldItalicUnderlineToggles />
                    <ListsToggle />
                    <Separator />
                    <BlockTypeSelect />
                  </>
                ),
              }),
              headingsPlugin(),
              listsPlugin(),
              quotePlugin(),
              thematicBreakPlugin(),
              codeBlockPlugin({
                defaultCodeBlockLanguage: "txt",
              }),
              codeMirrorPlugin({
                codeBlockLanguages: {
                  json: "json",
                  txt: "text",
                },
              }),
              markdownShortcutPlugin(),
            ]}
          />
        );

        setEditor(() => EditorComponent);
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
        className={cn(
          "flex items-center justify-center h-64 w-full",
          className
        )}
      >
        <div className="text-gray-500">Loading editor...</div>
      </div>
    );
  }

  if (!Editor) {
    return (
      <div
        className={cn(
          "flex items-center justify-center h-64 w-full",
          className
        )}
      >
        <div className="text-red-500">Failed to load editor</div>
      </div>
    );
  }

  return (
    <Editor
      {...props}
      ref={editorRef}
      className={className}
    />
  );
};
