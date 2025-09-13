import { Skeleton } from "@turbo-super/ui";

export function ScenePreviewSkeleton() {
  return (
    <div
      // style={{ height: containerHeight }}
      className="h-full flex items-center justify-center overflow-hidden rounded-lg bg-black relative gap-3 transition-[height] duration-300 ease-in-out"
    >
      {/* Main content area skeleton */}
      <div className="flex-1 flex items-center justify-center h-full">
        <div className="relative max-w-full h-full">
          {/* Media skeleton */}
          <Skeleton className="w-[640px] h-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
