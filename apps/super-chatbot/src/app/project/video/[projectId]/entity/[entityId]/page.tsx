"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { Button, Input, Label, Textarea } from "@turbo-super/ui";
import {
  Edit,
  Save,
  ArrowLeft,
  Image as ImageIcon,
  Wand2,
  Plus,
  Trash2,
  Check,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { BackButton } from "@/components/shared/back-button";
import { QueryState } from "@/components/ui/query-state";
import { EntityForm } from "@/components/entity/entity-form";
import { useEntityGetById } from "@/lib/api/superduperai/entity/query";
import { useEntityUpdate } from "@/lib/api/superduperai/entity/update/query";
import { useFileList } from "@/lib/api/superduperai/file/query";
import { useFileGenerateImage } from "@/lib/api/superduperai/file/generate-image/query";
import { useFileDelete } from "@/lib/api/superduperai/file/delete/query";
import { FileTypeEnum, type IFileRead } from "@turbo-super/api";
import type { EntityData } from "@/components/entity/entity-form";

type TabType = "edit" | "media";

export default function EntityPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = params.projectId as string;
  const entityId = params.entityId as string;

  const [activeTab, setActiveTab] = useState<TabType>("edit");

  // Initialize tab from URL parameter
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "media") {
      setActiveTab("media");
    }
  }, [searchParams]);
  const [imagePrompt, setImagePrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSelectingFile, setIsSelectingFile] = useState<string | null>(null);

  const {
    data: entity,
    isLoading,
    isError,
    error,
    refetch,
  } = useEntityGetById({ id: entityId });

  const {
    data: files,
    isLoading: isFilesLoading,
    isError: isFilesError,
    error: filesError,
    refetch: refetchFiles,
  } = useFileList({
    entityId,
    types: [FileTypeEnum.IMAGE, FileTypeEnum.VIDEO],
  });

  const { mutate: updateEntity, isPending: isUpdating } = useEntityUpdate();
  const { mutate: generateImage } = useFileGenerateImage();
  const { mutate: deleteFile } = useFileDelete();

  const handleSubmit = (data: EntityData) => {
    if (!entity) return;

    updateEntity(
      {
        id: entity.id,
        file_id: entity.file_id || "",
        ...data,
      } as any,
      {
        onSuccess: () => {
          console.log("Entity updated successfully");
        },
        onError: (error: any) => {
          console.error("Failed to update entity:", error);
        },
      }
    );
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;

    setIsGenerating(true);
    try {
      generateImage(
        {
          requestBody: {
            project_id: projectId,
            entity_id: entityId,
            config: {
              prompt: imagePrompt,
              batch_size: 1,
              generation_config_name: "comfyui/flux",
            },
          },
        },
        {
          onSuccess: (files) => {
            if (files && files.length > 0 && entity) {
              updateEntity(
                {
                  id: entity.id,
                  file_id: files[0].id,
                } as any,
                {
                  onSuccess: () => {
                    setImagePrompt("");
                    refetchFiles();
                  },
                }
              );
            }
          },
          onError: (error) => {
            console.error("Failed to generate image:", error);
          },
          onSettled: () => {
            setIsGenerating(false);
          },
        }
      );
    } catch (error) {
      console.error("Failed to generate image:", error);
      setIsGenerating(false);
    }
  };

  const handleSelectFile = async (file: IFileRead) => {
    if (!entity || isSelectingFile) return;

    setIsSelectingFile(file.id);
    try {
      updateEntity(
        {
          id: entity.id,
          name: entity.name,
          description: entity.description,
          type: entity.type,
          file_id: file.id,
          config: entity.config,
          voice_name: entity.voice_name,
          loras: entity.loras,
        } as any,
        {
          onSuccess: () => {
            refetch(); // Обновляем данные сущности
            setIsSelectingFile(null);
          },
          onError: (error) => {
            console.error("Error selecting file:", error);
            setIsSelectingFile(null);
          },
        }
      );
    } catch (error) {
      console.error("Error selecting file:", error);
      setIsSelectingFile(null);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      await deleteFile({ id: fileId });
      refetchFiles();
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const backRoute = useMemo(() => {
    return `/project/video/${projectId}/entities`;
  }, [projectId]);

  const isGeneratingMedia = entity?.file?.url === null;

  if (!projectId || !entityId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20 dark:border-slate-700/50">
          <div className="size-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="size-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Project or Entity ID not found
          </h1>
          <BackButton href="/project/video/projects" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-background flex flex-col">
      <div className="size-full mx-auto px-4 py-4 flex-1 flex flex-col">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <BackButton href={backRoute} />

          <div className="flex items-center space-x-4">
            {/* Tab Navigation */}
            <div className="flex bg-muted rounded-lg p-1">
              <button
                onClick={() => setActiveTab("edit")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "edit"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Edit
              </button>
              <button
                onClick={() => setActiveTab("media")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "media"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Media
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col">
          {/* Page Title */}
          <div className="text-center mb-6 flex-shrink-0">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-2">
              {activeTab === "edit" ? "Edit Entity" : "Entity Media"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {activeTab === "edit"
                ? "Configure your entity settings and properties"
                : "Manage media files for this entity"}
            </p>
          </div>

          {/* Content */}
          <div className="w-full flex-1 flex flex-col">
            <div className="w-full bg-card border border-border rounded-xl shadow-lg overflow-hidden flex-1 flex flex-col">
              <QueryState
                isLoading={isLoading}
                isError={isError}
                error={error as any}
                isEmpty={!entity}
                emptyMessage="Entity not found"
                loadingMessage="Loading entity..."
                errorMessage="Failed to load entity"
              >
                {entity && (
                  <div className="p-6 flex-1 flex flex-col">
                    {activeTab === "edit" ? (
                      <>
                        {/* Entity Image */}
                        <div className="mb-6">
                          <div className="w-full h-64 bg-black rounded-lg overflow-hidden shadow-lg flex items-center justify-center">
                            <QueryState
                              isLoading={isGeneratingMedia}
                              isEmpty={!entity.file?.url}
                              emptyMessage="No image available"
                              loadingMessage="Generating image..."
                            >
                              {entity.file?.url && (
                                <Image
                                  src={entity.file.url}
                                  alt={entity.name}
                                  width={800}
                                  height={400}
                                  className="w-full h-full object-contain"
                                />
                              )}
                            </QueryState>
                          </div>
                        </div>

                        {/* Entity Form */}
                        <div className="flex-1">
                          <EntityForm
                            entity={entity}
                            type={entity.type}
                            onSubmit={handleSubmit}
                            isLoading={isUpdating}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Media Section */}
                        <div className="space-y-6">
                          {/* Generate New Image */}
                          <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-4">
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                              <div className="size-8 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                                <Wand2 className="size-4 text-primary" />
                              </div>
                              Generate New Image
                            </h3>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="imagePrompt">
                                  Image Prompt
                                </Label>
                                <Textarea
                                  id="imagePrompt"
                                  value={imagePrompt}
                                  onChange={(e) =>
                                    setImagePrompt(e.target.value)
                                  }
                                  placeholder="Describe the image you want to generate..."
                                  rows={3}
                                  className="resize-vertical"
                                />
                              </div>
                              <Button
                                onClick={handleGenerateImage}
                                disabled={!imagePrompt.trim() || isGenerating}
                                className="w-full sm:w-auto"
                              >
                                {isGenerating ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                                    Generating...
                                  </>
                                ) : (
                                  <>
                                    <Wand2 className="w-4 h-4 mr-2" />
                                    Generate Image
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>

                          {/* Media Files */}
                          <div>
                            <h3 className="text-lg font-semibold mb-4">
                              Media Files
                            </h3>
                            <QueryState
                              isLoading={isFilesLoading}
                              isError={isFilesError}
                              error={filesError as any}
                              isEmpty={
                                !files?.items || files.items.length === 0
                              }
                              emptyMessage="No media files found"
                              loadingMessage="Loading media files..."
                              errorMessage="Failed to load media files"
                            >
                              {files?.items && files.items.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                  {files.items.map((file) => (
                                    <div
                                      key={file.id}
                                      className="group relative aspect-video bg-muted rounded-lg overflow-hidden"
                                    >
                                      <button
                                        onClick={() => handleSelectFile(file)}
                                        disabled={isSelectingFile === file.id}
                                        className={`relative w-full h-full flex items-center justify-center transition-all duration-200 ${
                                          file.id === entity.file_id
                                            ? "ring-2 ring-primary"
                                            : "hover:ring-2 hover:ring-primary/50"
                                        } ${isSelectingFile === file.id ? "opacity-50 cursor-not-allowed" : ""}`}
                                      >
                                        {file.type === FileTypeEnum.VIDEO && (
                                          <div className="absolute z-10">
                                            <div className="size-8 bg-black/50 rounded-full flex items-center justify-center">
                                              <div className="w-0 h-0 border-l-[6px] border-l-white border-y-[4px] border-y-transparent ml-1" />
                                            </div>
                                          </div>
                                        )}

                                        {file.url || file.thumbnail_url ? (
                                          <Image
                                            src={
                                              (file.thumbnail_url ||
                                                file.url) as string
                                            }
                                            alt={file.id}
                                            width={320}
                                            height={180}
                                            className="h-full w-full object-cover"
                                          />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center">
                                            <div className="text-muted-foreground text-sm">
                                              No preview
                                            </div>
                                          </div>
                                        )}

                                        {/* Active indicator */}
                                        {file.id === entity.file_id && (
                                          <div className="absolute top-2 left-2 p-1 bg-primary text-primary-foreground rounded-full">
                                            <Check className="w-3 h-3" />
                                          </div>
                                        )}

                                        {/* Loading overlay */}
                                        {isSelectingFile === file.id && (
                                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                          </div>
                                        )}

                                        {/* Delete button */}
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteFile(file.id);
                                          }}
                                          disabled={isSelectingFile === file.id}
                                          className="absolute top-2 right-2 p-1 bg-red-500/90 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </QueryState>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </QueryState>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 flex-shrink-0">
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
    </div>
  );
}
