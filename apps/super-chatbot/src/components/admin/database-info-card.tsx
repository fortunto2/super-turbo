"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@turbo-super/ui";
import {
  Database,
  HardDrive,
  Server,
  Wifi,
} from "lucide-react";

interface DatabaseInfo {
  databaseSize: string;
  databaseName: string;
  postgresVersion: string;
  activeConnections?: number;
}

export function DatabaseInfoCard() {
  const [info, setInfo] = useState<DatabaseInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDatabaseInfo = async () => {
      try {
        const response = await fetch("/api/admin/system/stats");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch database info");
        }

        setInfo(data.stats.system);
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching database info:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDatabaseInfo();
    // Refresh every 30 seconds
    const interval = setInterval(fetchDatabaseInfo, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Information
          </CardTitle>
          <CardDescription>
            Database configuration and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                  <span className="text-sm font-medium">Loading...</span>
                </div>
                <div className="text-lg font-bold">Loading...</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !info) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Information
          </CardTitle>
          <CardDescription>
            Database configuration and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-destructive">
              Error loading database info: {error}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Information
        </CardTitle>
        <CardDescription>
          Database configuration and performance metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <HardDrive className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Database Size</span>
            </div>
            <div className="text-lg font-bold">{info.databaseSize}</div>
            <div className="text-xs text-muted-foreground">
              Current database size
            </div>
          </div>
          <div className="p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Server className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">PostgreSQL Version</span>
            </div>
            <div className="text-lg font-bold">
              {info.postgresVersion.split(" ")[0] || "Unknown"}
            </div>
            <div className="text-xs text-muted-foreground">
              Database version
            </div>
          </div>
          <div className="p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Wifi className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Active Connections</span>
            </div>
            <div className="text-lg font-bold">
              {info.activeConnections || "N/A"}
            </div>
            <div className="text-xs text-muted-foreground">
              Current connections
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
