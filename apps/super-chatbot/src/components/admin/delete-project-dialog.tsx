"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@turbo-super/ui";
import { Button } from "@turbo-super/ui";
import { AlertTriangle, Trash2 } from "lucide-react";

interface Project {
  id: string;
  userId: string;
  projectId: string;
  createdAt: string;
  userEmail: string;
  userBalance: number;
  userType: "guest" | "regular";
}

interface DeleteProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
  onSuccess: () => void;
}

export function DeleteProjectDialog({
  open,
  onOpenChange,
  project,
  onSuccess,
}: DeleteProjectDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!project) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/admin/projects?projectId=${project.projectId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete project");
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
      console.error("Error deleting project:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!project) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Project
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this project? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 rounded-lg border bg-muted/50">
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium">Project ID:</span>
                <p className="font-mono text-sm">{project.projectId}</p>
              </div>
              <div>
                <span className="text-sm font-medium">User:</span>
                <p className="text-sm">{project.userEmail}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Type:</span>
                <p className="text-sm capitalize">{project.userType}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Created:</span>
                <p className="text-sm">
                  {new Date(project.createdAt).toLocaleDateString("ru-RU", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg border border-destructive bg-destructive/10">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? (
              "Deleting..."
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Project
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
