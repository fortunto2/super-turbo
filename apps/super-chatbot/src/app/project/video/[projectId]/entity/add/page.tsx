"use client";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Button, Input, Label, Textarea } from "@turbo-super/ui";
import { ArrowLeft, Plus, Users, MapPin, Box, Building2 } from "lucide-react";
import { BackButton } from "@/components/shared/back-button";
import { QueryState } from "@/components/ui/query-state";
import { EntityForm } from "@/components/entity/entity-form";
import { useEntityCreate } from "@/lib/api/superduperai/entity/create/query";
import { EntityTypeEnum, type IEntityCreate } from "@turbo-super/api";
import type { EntityData } from "@/components/entity/entity-form";

export default function AddEntityPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [selectedType, setSelectedType] = useState<EntityTypeEnum>(
    EntityTypeEnum.CHARACTER
  );
  const [isCreating, setIsCreating] = useState(false);

  const { mutate: createEntity } = useEntityCreate();

  const backRoute = useMemo(() => {
    return `/project/video/${projectId}/entities`;
  }, [projectId]);

  const handleSubmit = (data: EntityData) => {
    setIsCreating(true);
    createEntity(
      {
        ...data,
        type: selectedType,
      } as IEntityCreate,
      {
        onSuccess: () => {
          // Перенаправляем обратно к списку сущностей
          window.location.href = backRoute;
        },
        onError: (error: any) => {
          console.error("Failed to create entity:", error);
          setIsCreating(false);
        },
      }
    );
  };

  const entityTypes = [
    {
      type: EntityTypeEnum.CHARACTER,
      label: "Character",
      icon: "👤",
      description: "Create a character for your video",
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    },
    {
      type: EntityTypeEnum.LOCATION,
      label: "Location",
      icon: "📍",
      description: "Define a location or setting",
      color:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    },
    {
      type: EntityTypeEnum.OBJECT,
      label: "Object",
      icon: "📦",
      description: "Add an object or prop",
      color:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    },
  ];

  if (!projectId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20 dark:border-slate-700/50">
          <div className="size-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="size-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Project ID not found
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
        </div>

        {/* Main Content */}
        <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col">
          {/* Page Title */}
          <div className="text-center mb-6 flex-shrink-0">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-2">
              Add New Entity
            </h1>
            <p className="text-sm text-muted-foreground">
              Create a new character, location, or object for your project
            </p>
          </div>

          {/* Content */}
          <div className="w-full flex-1 flex flex-col">
            <div className="w-full bg-card border border-border rounded-xl shadow-lg overflow-hidden flex-1 flex flex-col">
              <div className="p-6 flex-1 flex flex-col">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Entity Type Selection */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      Choose Entity Type
                    </h3>
                    <div className="space-y-3">
                      {entityTypes.map((entityType) => (
                        <button
                          key={entityType.type}
                          onClick={() => setSelectedType(entityType.type)}
                          className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                            selectedType === entityType.type
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{entityType.icon}</span>
                            <div className="flex-1">
                              <h4 className="font-semibold text-foreground">
                                {entityType.label}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {entityType.description}
                              </p>
                            </div>
                            <div
                              className={`px-2 py-1 rounded-full text-xs font-medium ${entityType.color}`}
                            >
                              {entityType.type}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Entity Form */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      Entity Details
                    </h3>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <EntityForm
                        type={selectedType}
                        onSubmit={handleSubmit}
                        isLoading={isCreating}
                      />
                    </div>
                  </div>
                </div>
              </div>
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
