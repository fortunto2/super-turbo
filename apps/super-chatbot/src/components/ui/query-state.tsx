"use client";

import type { ReactNode } from "react";
import { AlertCircle, Eye } from "lucide-react";
import { cn } from "@turbo-super/ui";

interface QueryStateProps {
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
  isEmpty?: boolean;
  emptyMessage?: string;
  loadingMessage?: string;
  errorMessage?: string;
  children: ReactNode;
  className?: string;
  loadingComponent?: ReactNode;
  errorComponent?: ReactNode;
  emptyComponent?: ReactNode;
}

export function QueryState({
  isLoading = false,
  isError = false,
  error = null,
  isEmpty = false,
  emptyMessage = "No data available",
  loadingMessage = "Loading...",
  errorMessage,
  children,
  className,
  loadingComponent,
  errorComponent,
  emptyComponent,
}: QueryStateProps) {
  // Показываем загрузку
  if (isLoading) {
    if (loadingComponent) return <>{loadingComponent}</>;

    return (
      <div className={cn("flex items-center justify-center py-8", className)}>
        <div className="text-center space-y-4 flex flex-col items-center">
          <div className="relative">
            <div className="size-12 border-4 border-muted rounded-full animate-spin" />
            <div className="absolute top-0 left-0 size-12 border-4 border-transparent border-t-primary rounded-full animate-spin" />
          </div>
          <div className="space-y-2">
            <p className=" font-medium text-foreground">{loadingMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  // Показываем ошибку
  if (isError) {
    if (errorComponent) return <>{errorComponent}</>;

    return (
      <div className={cn("flex items-center justify-center py-8", className)}>
        <div className="text-center space-y-4">
          <div className="size-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="size-8 text-red-600 dark:text-red-400" />
          </div>
          <div className="space-y-2">
            <p className="text-xl font-medium text-red-600 dark:text-red-400">
              {errorMessage || "Something went wrong"}
            </p>
            <p className="text-muted-foreground">
              {error?.message || "Please try again later"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Показываем пустое состояние
  if (isEmpty) {
    if (emptyComponent) return <>{emptyComponent}</>;

    return (
      <div
        className={cn(
          "flex items-center justify-center py-8 size-full",
          className
        )}
      >
        <div className="text-center space-y-4">
          <div className="size-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <Eye className="size-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <p className="text-xl font-medium text-muted-foreground">
              {emptyMessage}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Показываем контент
  return <>{children}</>;
}

// Компонент для карточек с состояниями
export function QueryCard({
  isLoading,
  isError,
  error,
  isEmpty,
  emptyMessage,
  loadingMessage,
  errorMessage,
  children,
  className,
}: Omit<
  QueryStateProps,
  "loadingComponent" | "errorComponent" | "emptyComponent"
>) {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-xl p-6 shadow-xl",
        className
      )}
    >
      <QueryState
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={isEmpty}
        emptyMessage={emptyMessage}
        loadingMessage={loadingMessage}
        errorMessage={errorMessage}
      >
        {children}
      </QueryState>
    </div>
  );
}

// Хук для упрощения работы с React Query
export function useQueryState<T>(
  query: {
    data?: T;
    isLoading?: boolean;
    isError?: boolean;
    error?: Error | null;
  },
  options?: {
    emptyCondition?: (data: T | undefined) => boolean;
    emptyMessage?: string;
  }
) {
  const { data, isLoading, isError, error } = query;
  const isEmpty = options?.emptyCondition
    ? options.emptyCondition(data)
    : false;

  return {
    data,
    isLoading,
    isError,
    error,
    isEmpty,
    QueryState: (
      props: Omit<
        QueryStateProps,
        "isLoading" | "isError" | "error" | "isEmpty"
      >
    ) => (
      <QueryState
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={isEmpty}
        emptyMessage={options?.emptyMessage}
        {...props}
      />
    ),
  };
}
