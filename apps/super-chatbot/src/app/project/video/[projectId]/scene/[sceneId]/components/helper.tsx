"use client";

import { IFileRead, TaskStatusEnum } from "@turbo-super/api";
import { Eye } from "lucide-react";

// ---------- Reusable small components ----------
export function Loader() {
  return (
    <div className="space-y-2 text-center">
      <div className="mx-auto w-8 h-8 animate-spin rounded-full border-4 border-gray-300 border-t-black"></div>
      <div className="text-sm text-muted-foreground">Loading scene...</div>
    </div>
  );
}

export function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="space-y-2 text-center">
      <Eye className="mx-auto size-6 text-red-500" />
      <div className="text-sm text-muted-foreground">{message}</div>
    </div>
  );
}

export function EmptyPreview() {
  return (
    <div className="text-center text-sm text-muted-foreground">
      <Eye className="mx-auto mb-2 size-10" />
      Scene image unavailable
    </div>
  );
}

export function Placeholder({ text }: { text: string }) {
  return (
    <div className="grid h-full place-items-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}

export function FileGenerationStatus({ file }: { file: IFileRead }) {
  const isLoading = file.tasks?.find(
    (task) => task.status === TaskStatusEnum.IN_PROGRESS
  );
  const isError = file.tasks?.find(
    (task) => task.status === TaskStatusEnum.ERROR
  );
  return (
    <>
      {isLoading ? (
        <div
          key={`pending-${file.id}`}
          className="aspect-video animate-pulse rounded-lg border bg-muted flex justify-center items-center"
        >
          <span>Generating..</span>
        </div>
      ) : isError ? (
        <div
          key={`pending-${file.id}`}
          className="aspect-video rounded-lg border border-red-500  text-red-500 flex justify-center items-center"
        >
          <span>Error</span>
        </div>
      ) : (
        <div
          key={`pending-${file.id}`}
          className="aspect-video animate-pulse rounded-lg border bg-muted flex justify-center items-center"
        >
          <span>Generating..</span>
        </div>
      )}
    </>
  );
}
