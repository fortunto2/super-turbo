'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { Users, Edit, Eye } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { BackButton } from '@/components/shared/back-button';
import { QueryState } from '@/components/ui/query-state';
import { useEntityList } from '@/lib/api/superduperai/entity/query';
import type { EntityTypeEnum } from '@turbo-super/api';

export default function EntitiesPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const {
    data: entities,
    isLoading,
    isError,
    error,
    refetch,
  } = useEntityList({ projectId });

  const backRoute = useMemo(() => {
    return `/project/video/${projectId}/preview`;
  }, [projectId]);

  const getEntityTypeIcon = (type: EntityTypeEnum) => {
    switch (type) {
      case 'character':
        return '👤';
      case 'location':
        return '📍';
      case 'object':
        return '📦';
      case 'place':
        return '🏢';
      default:
        return '❓';
    }
  };

  const getEntityTypeColor = (type: EntityTypeEnum) => {
    switch (type) {
      case 'character':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'location':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'object':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'place':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  if (!projectId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20 dark:border-slate-700/50">
          <div className="size-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="size-8 text-red-600 dark:text-red-400" />
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

          {/* <div className="flex items-center space-x-4">
            <Link
              href={`/project/video/${projectId}/entity/add`}
              className="inline-flex items-center text-primary hover:text-primary/80 transition-all duration-300 hover:scale-105 group"
            >
              <div className="size-10 bg-card border border-border rounded-full flex items-center justify-center mr-3 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <Plus className="size-4" />
              </div>
              <span className="font-medium">Add Entity</span>
            </Link>
          </div> */}
        </div>

        {/* Main Content */}
        <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col">
          {/* Page Title */}
          <div className="text-center mb-6 flex-shrink-0">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-2">
              Project Entities
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage characters, locations, and objects for your video project
            </p>
          </div>

          {/* Content */}
          <div className="w-full flex-1 flex flex-col">
            <div className="size-full bg-card border border-border rounded-xl shadow-lg overflow-hidden flex-1 flex flex-col">
              <QueryState
                isLoading={isLoading}
                isError={isError}
                error={error as any}
                isEmpty={!entities?.items || entities.items.length === 0}
                emptyMessage="No entities found"
                loadingMessage="Loading entities..."
                errorMessage="Failed to load entities"
                className="size-full"
              >
                {entities?.items && entities.items.length > 0 && (
                  <div className="p-6 flex-1">
                    {/* Entities Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {entities.items.map((entity) => (
                        <div
                          key={entity.id}
                          className="bg-card border border-border rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 flex flex-col h-full"
                        >
                          {/* Entity Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <span className="text-2xl">
                                {getEntityTypeIcon(entity.type)}
                              </span>
                              <div>
                                <h3 className="font-semibold text-foreground text-sm">
                                  {entity.name}
                                </h3>
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEntityTypeColor(
                                    entity.type,
                                  )}`}
                                >
                                  {entity.type}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Entity Description - фиксированная высота */}
                          <div className="mb-3 min-h-[2.5rem] flex items-start">
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {entity.description || 'No description'}
                            </p>
                          </div>

                          {/* Entity Image - фиксированная высота */}
                          <div className="mb-3 h-24">
                            {entity.file?.url ? (
                              <div className="w-full h-full bg-black rounded-md overflow-hidden">
                                <Image
                                  src={entity.file.url}
                                  alt={entity.name}
                                  width={200}
                                  height={96}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-full h-full bg-muted rounded-md flex items-center justify-center">
                                <span className="text-xs text-muted-foreground">
                                  No image
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Entity Actions - всегда внизу */}
                          <div className="flex space-x-2 mt-auto">
                            <Link
                              href={`/project/video/${projectId}/entity/${entity.id}`}
                              className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm"
                            >
                              <Edit className="size-3" />
                              <span>Edit</span>
                            </Link>
                            <Link
                              href={`/project/video/${projectId}/entity/${entity.id}?tab=media`}
                              className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors text-sm"
                            >
                              <Eye className="size-3" />
                              <span>Media</span>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="mt-6 pt-4 border-t border-border">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                          Total entities:{' '}
                          <strong className="text-foreground">
                            {entities.items.length}
                          </strong>
                        </span>
                        <span>
                          Characters:{' '}
                          <strong className="text-foreground">
                            {
                              entities.items.filter(
                                (e) => e.type === 'character',
                              ).length
                            }
                          </strong>
                        </span>
                        <span>
                          Locations:{' '}
                          <strong className="text-foreground">
                            {
                              entities.items.filter(
                                (e) => e.type === 'location',
                              ).length
                            }
                          </strong>
                        </span>
                        <span>
                          Objects:{' '}
                          <strong className="text-foreground">
                            {
                              entities.items.filter((e) => e.type === 'object')
                                .length
                            }
                          </strong>
                        </span>
                      </div>
                    </div>
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
                Powered by{' '}
                <strong className="text-foreground">SuperDuperAI</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
