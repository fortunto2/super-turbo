import { ArrowLeft, Eye } from "lucide-react";
import { useRouter } from "next/navigation";

interface ErrorStateProps {
  projectId?: string;
  sceneId?: string;
  error?: string | null;
}

export function ErrorState({ projectId, sceneId, error }: ErrorStateProps) {
  const router = useRouter();

  if (!projectId || !sceneId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="p-8 text-center bg-card border rounded-2xl shadow-2xl">
          <div className="size-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <Eye className="size-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="mb-4 text-2xl font-bold text-foreground">
            Scene ID not found
          </h1>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-primary-foreground shadow-lg transition-all duration-300 hover:scale-105 hover:bg-primary/90"
          >
            <ArrowLeft className="mr-2 size-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="p-8 text-center bg-card border rounded-2xl shadow-2xl">
          <div className="size-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <Eye className="size-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="mb-4 text-2xl font-bold text-foreground">{error}</h1>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-primary-foreground shadow-lg transition-all duration-300 hover:scale-105 hover:bg-primary/90"
          >
            <ArrowLeft className="mr-2 size-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return null;
}
