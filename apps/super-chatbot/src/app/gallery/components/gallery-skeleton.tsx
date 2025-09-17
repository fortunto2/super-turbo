import { Card } from "@turbo-super/ui";
import { Skeleton } from "@turbo-super/ui";
export function GallerySkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <Card
          key={index}
          className="overflow-hidden"
        >
          {/* Thumbnail skeleton - точно такая же высота как в реальных карточках */}
          <Skeleton className="h-48 w-full" />

          {/* Content skeleton - точно такая же структура как в реальных карточках */}
          <div className="p-4 space-y-3 min-h-[140px] flex flex-col">
            {/* Title and type - точно как в реальных карточках */}
            <div className="flex items-start justify-between gap-2">
              <Skeleton className="h-5 flex-1" />
              <Skeleton className="h-6 w-16" />
            </div>

            {/* Model badge - всегда резервируем место */}
            <div className="h-6">
              <Skeleton className="h-6 w-24" />
            </div>

            {/* Tags - всегда резервируем место */}
            <div className="h-6">
              <div className="flex flex-wrap gap-1">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>

            {/* Footer - всегда внизу */}
            <div className="flex items-center justify-between mt-auto">
              <Skeleton className="h-4 w-20" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
