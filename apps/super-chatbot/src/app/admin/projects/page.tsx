import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@turbo-super/ui";
import { Badge } from "@turbo-super/ui";
import {
  Users,
  FileText,
  Calendar,
} from "lucide-react";
import { getProjectStats } from "@/lib/db/admin-project-queries";
import { ProjectsTable } from "@/components/admin/projects-table";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
}

export default async function ProjectsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const page = Number.parseInt(resolvedSearchParams.page || "1");
  const search = resolvedSearchParams.search || "";

  // Get project statistics
  const stats = await getProjectStats();

  const statCards = [
    {
      title: "Total Projects",
      value: stats.totalProjects,
      description: `${stats.guestProjects} guest, ${stats.regularProjects} registered`,
      icon: FileText,
      color: "text-blue-500",
    },
    {
      title: "Recent Projects",
      value: stats.recentProjects,
      description: "Created in last 24h",
      icon: Calendar,
      color: "text-green-500",
    },
    {
      title: "Top Users",
      value: stats.topUsers.length,
      description: "Most active creators",
      icon: Users,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Project Management</h1>
          <p className="text-muted-foreground">
            Manage user projects and monitor creation activity
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Top Users */}
      <Card>
        <CardHeader>
          <CardTitle>Top Project Creators</CardTitle>
          <CardDescription>
            Users with the most projects created
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.topUsers.slice(0, 5).map((user, index) => (
              <div
                key={user.userId}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{user.userEmail}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.userEmail.includes("guest")
                        ? "Guest User"
                        : "Registered User"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {user.projectCount} projects
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Projects Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Projects</CardTitle>
          <CardDescription>View and manage all user projects</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading projects...</div>}>
            <ProjectsTable
              page={page}
              search={search}
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
