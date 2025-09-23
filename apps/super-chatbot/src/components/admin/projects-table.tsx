"use client";

import { useState, useEffect } from "react";
import { Button, Input, Badge } from "@turbo-super/ui";
// Using HTML table elements since Table components are not available in UI library
import {
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { DeleteProjectDialog } from "./delete-project-dialog";
import {
  getStatusIcon,
  getStatusColor,
  getStatusText,
} from "@/lib/utils/project-status";

interface Project {
  id: string;
  userId: string;
  projectId: string;
  createdAt: string;
  userEmail: string;
  userBalance: number;
  userType: "guest" | "regular";
  status?: "pending" | "processing" | "completed" | "failed";
  errorStage?: "script" | "entities" | "storyboard";
  errorMessage?: string;
  completedStages?: string[];
  failedStages?: string[];
  tasks?: any[];
}

interface ProjectsResponse {
  success: boolean;
  projects: Project[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface ProjectsTableProps {
  page: number;
  search: string;
}

export function ProjectsTable({ page, search }: ProjectsTableProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(search);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  const fetchProjects = async (pageNum: number, searchQuery: string) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: "20",
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await fetch(`/api/admin/projects?${params}`);
      const data: ProjectsResponse = await response.json();

      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }

      setProjects(data.projects);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects(page, search);
  }, [page, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchTerm) {
      params.set("search", searchTerm);
    } else {
      params.delete("search");
    }
    params.delete("page"); // Reset to first page
    router.push(`/admin/projects?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`/admin/projects?${params.toString()}`);
  };

  const handleDeleteProject = (project: Project) => {
    setSelectedProject(project);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = () => {
    fetchProjects(page, search);
    setDeleteDialogOpen(false);
    setSelectedProject(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading projects...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-destructive flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <form
        onSubmit={handleSearch}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by user email or project ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      {/* Table */}
      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Project ID
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                User
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Type
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Balance
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Status
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Created
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[100px]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  No projects found
                </td>
              </tr>
            ) : (
              projects.map((project) => (
                <tr
                  key={project.id}
                  className="border-b"
                >
                  <td className="p-4 font-mono text-sm">{project.projectId}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{project.userEmail}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge
                      variant={
                        project.userType === "guest" ? "secondary" : "default"
                      }
                    >
                      {project.userType}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">
                        {project.userBalance}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        credits
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {getStatusIcon(project.status || "pending")}
                      </span>
                      <div className="flex flex-col">
                        <span
                          className={`text-sm font-medium ${getStatusColor(project.status || "pending")}`}
                        >
                          {getStatusText(project.status || "pending")}
                        </span>
                        {project.errorStage && (
                          <span className="text-xs text-red-500">
                            Error in {project.errorStage}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {formatDate(project.createdAt)}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(
                            `/project/video/${project.projectId}/generate`,
                            "_blank"
                          )
                        }
                        title="Open Project"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteProject(project)}
                        title="Delete Project"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} projects
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.hasPrev}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNext}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <DeleteProjectDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        project={selectedProject}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
