"use client";

import { useState, useEffect } from "react";
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
  Activity,
  TrendingUp,
  User,
  Calendar,
  Award,
  BarChart3,
} from "lucide-react";

interface ActivityData {
  recentUsers: number;
  recentDocuments: number;
  recentProjects: number;
  topCreators: Array<{
    userId: string;
    userEmail: string;
    documentCount: number;
  }>;
  topProjectCreators: Array<{
    userId: string;
    userEmail: string;
    projectCount: number;
  }>;
}

export function ActivityOverview() {
  const [activity, setActivity] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await fetch("/api/admin/system/stats");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch activity data");
        }

        setActivity(data.stats.activity);
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching activity data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
    // Refresh every 60 seconds
    const interval = setInterval(fetchActivity, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>Loading...</CardTitle>
              <CardDescription>Loading activity data...</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div
                    key={j}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-muted animate-pulse rounded-full" />
                      <div>
                        <div className="h-4 w-32 bg-muted animate-pulse rounded mb-1" />
                        <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                      </div>
                    </div>
                    <div className="h-6 w-12 bg-muted animate-pulse rounded" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Activity Overview</CardTitle>
            <CardDescription>
              Recent user activity and top creators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="text-destructive">
                Error loading activity data: {error}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Top Content Creators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Top Content Creators
          </CardTitle>
          <CardDescription>
            Users with the most documents created
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activity.topCreators.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No content creators found
              </div>
            ) : (
              activity.topCreators.map((creator, index) => (
                <div
                  key={creator.userId}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{creator.userEmail}</p>
                      <p className="text-xs text-muted-foreground">
                        {creator.userEmail.includes("guest")
                          ? "Guest User"
                          : "Registered User"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {creator.documentCount} docs
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Project Creators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Top Project Creators
          </CardTitle>
          <CardDescription>
            Users with the most projects created
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activity.topProjectCreators.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No project creators found
              </div>
            ) : (
              activity.topProjectCreators.map((creator, index) => (
                <div
                  key={creator.userId}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{creator.userEmail}</p>
                      <p className="text-xs text-muted-foreground">
                        {creator.userEmail.includes("guest")
                          ? "Guest User"
                          : "Registered User"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {creator.projectCount} projects
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Summary */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Activity Summary
          </CardTitle>
          <CardDescription>
            Activity metrics for the last 24 hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Recent Users</span>
              </div>
              <div className="text-2xl font-bold">{activity.recentUsers}</div>
              <p className="text-xs text-muted-foreground">
                New users in last 24h
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Recent Documents</span>
              </div>
              <div className="text-2xl font-bold">
                {activity.recentDocuments}
              </div>
              <p className="text-xs text-muted-foreground">
                Documents created in last 24h
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">Recent Projects</span>
              </div>
              <div className="text-2xl font-bold">
                {activity.recentProjects}
              </div>
              <p className="text-xs text-muted-foreground">
                Projects created in last 24h
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
