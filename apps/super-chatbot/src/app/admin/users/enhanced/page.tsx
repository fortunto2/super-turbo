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
  CreditCard,
  TrendingUp,
  TrendingDown,
  UserCheck,
  UserX,
  DollarSign,
  BarChart3,
} from "lucide-react";
import { getUserStats } from "@/lib/db/admin-queries";
import { EnhancedUsersTable, UserStatsCards } from "@/components";

export default async function EnhancedUsersPage() {
  // Get user statistics
  const stats = await getUserStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Enhanced User Management</h1>
          <p className="text-muted-foreground">
            Advanced user analytics and management tools
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <UserStatsCards stats={stats} />

      {/* Balance Distribution */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              High Balance Users
            </CardTitle>
            <CardDescription>Users with more than 1000 credits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {stats.balanceStats.highBalanceUsers}
            </div>
            <p className="text-sm text-muted-foreground">
              {(
                (stats.balanceStats.highBalanceUsers / stats.totalUsers) *
                100
              ).toFixed(1)}
              % of total users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              Zero Balance Users
            </CardTitle>
            <CardDescription>Users with no credits remaining</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {stats.balanceStats.zeroBalanceUsers}
            </div>
            <p className="text-sm text-muted-foreground">
              {(
                (stats.balanceStats.zeroBalanceUsers / stats.totalUsers) *
                100
              ).toFixed(1)}
              % of total users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Balance Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Balance Statistics
          </CardTitle>
          <CardDescription>
            Detailed balance distribution across all users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 rounded-lg border">
              <div className="text-2xl font-bold text-blue-600">
                {stats.balanceStats.total.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Total Credits</p>
            </div>
            <div className="text-center p-4 rounded-lg border">
              <div className="text-2xl font-bold text-green-600">
                {stats.balanceStats.average}
              </div>
              <p className="text-sm text-muted-foreground">Average Balance</p>
            </div>
            <div className="text-center p-4 rounded-lg border">
              <div className="text-2xl font-bold text-purple-600">
                {stats.balanceStats.max.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Highest Balance</p>
            </div>
            <div className="text-center p-4 rounded-lg border">
              <div className="text-2xl font-bold text-orange-600">
                {stats.balanceStats.min}
              </div>
              <p className="text-sm text-muted-foreground">Lowest Balance</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced User Management</CardTitle>
          <CardDescription>
            Comprehensive user data with advanced filtering and actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading users...</div>}>
            <EnhancedUsersTable />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
