"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@turbo-super/ui";
import { FileText, Save, Users } from "lucide-react";
import { BackButton } from "@/components/shared/back-button";
import Link from "next/link";
import { MarkdownEditor } from "@/components/editors/markdown-editor";
import { useProjectGetById, useDataUpdate } from "@/lib/api";
import type { MDXEditorMethods } from "@mdxeditor/editor";

export default function ScriptPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const projectId = params.projectId as string;

  const [scriptText, setScriptText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const editorRef = useRef<MDXEditorMethods>(null);

  const { mutate, isPending: isUpdating, isSuccess } = useDataUpdate();

  const {
    data: project,
    isLoading,
    isError,
  } = useProjectGetById({ id: projectId });

  // Получаем скрипт из данных проекта
  const scriptData = project?.data?.find((item) => item.type === "script");
  const currentScript = scriptData?.value?.text || "";

  // Инициализируем редактор с данными проекта
  useEffect(() => {
    if (currentScript && !scriptText) {
      const formattedText = currentScript.replace(/(?<!(?<!\\)\\)</g, "\\<");
      setScriptText(formattedText);
      editorRef.current?.setMarkdown(formattedText);
      // Сбрасываем флаг изменений после инициализации
      setHasChanges(false);
    }
  }, [currentScript, scriptText]);

  const handleChange = (value: string) => {
    setScriptText(value);
    // Сравниваем с оригинальным текстом, а не с currentScript
    const originalText = scriptData?.value?.text || "";
    setHasChanges(value !== originalText);
  };

  const handleSave = async () => {
    if (!project || !scriptData) return;

    setIsSaving(true);
    try {
      const safeText = scriptText.replace(/\\</g, "<");

      // Используем mutate для сохранения скрипта
      mutate(
        {
          ...scriptData,
          value: {
            text: safeText,
          },
        },
        {
          onSuccess: () => {
            setHasChanges(false);
            console.log("✅ Script saved successfully");
          },
          onError: (error) => {
            console.error("❌ Error saving script:", error);
          },
        }
      );
    } catch (error) {
      console.error("❌ Error saving script:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!projectId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Project ID not found
          </h1>
          <BackButton href="/project/video/projects" />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="size-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <FileText className="size-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">Loading script...</p>
        </div>
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Failed to load project
          </h1>
          <BackButton href="/project/video/projects" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-background">
      <div className="mx-auto px-4 py-4 w-full max-w-6xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <BackButton href={`/project/video/${projectId}/preview`}>
            Back to Preview
          </BackButton>

          <div className="flex items-center space-x-4">
            <Link
              href={`/project/video/${projectId}/entities`}
              className="inline-flex items-center text-primary hover:text-primary/80 transition-all duration-300 hover:scale-105 group"
            >
              <div className="size-8 bg-card border border-border rounded-full flex items-center justify-center mr-2 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <Users className="size-3" />
              </div>
              <span className="font-medium text-sm">Entities</span>
            </Link>

            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving || isUpdating}
              variant="outline"
              size="sm"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving || isUpdating ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>

        {/* Page Title */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-2">
            Edit Script
          </h1>
          <p className="text-sm text-muted-foreground">
            Modify your video script and continue to preview
          </p>
        </div>

        {/* Script Editor */}
        <div className="w-full">
          <div className="mb-4">
            <h2 className="text-lg font-semibold flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Script Editor</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Edit your video script using the markdown editor below
            </p>
          </div>

          <div className="border border-border rounded-lg ">
            <MarkdownEditor
              editorRef={editorRef}
              markdown={scriptText}
              onChange={handleChange}
              placeholder="Start writing your script..."
            />
          </div>

          {hasChanges && (
            <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                You have unsaved changes. Click &quot;Save&quot; to save your
                changes.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-4">
          <div className="inline-flex items-center space-x-2 bg-card border border-border px-4 py-2 rounded-full shadow-md">
            <div className="size-2 bg-primary rounded-full animate-pulse" />
            <span className="text-xs text-muted-foreground">
              Powered by{" "}
              <strong className="text-foreground">SuperDuperAI</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
