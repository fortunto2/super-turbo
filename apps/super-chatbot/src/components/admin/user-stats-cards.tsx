import { Card, CardContent, CardHeader, CardTitle } from "@turbo-super/ui";
import { Users, UserCheck, UserX, DollarSign } from "lucide-react";

interface UserStats {
  totalUsers: number;
  guestUsers: number;
  regularUsers: number;
  balanceStats: {
    total: number;
    average: number;
    max: number;
    min: number;
    zeroBalanceUsers: number;
    highBalanceUsers: number;
  };
}

interface UserStatsCardsProps {
  stats: UserStats;
}

export function UserStatsCards({ stats }: UserStatsCardsProps) {
  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      description: `${stats.guestUsers} guests, ${stats.regularUsers} registered`,
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Registered Users",
      value: stats.regularUsers,
      description: "Users with real email addresses",
      icon: UserCheck,
      color: "text-green-500",
    },
    {
      title: "Guest Users",
      value: stats.guestUsers,
      description: "Temporary guest accounts",
      icon: UserX,
      color: "text-orange-500",
    },
    {
      title: "Total Credits",
      value: stats.balanceStats.total.toLocaleString(),
      description: `Average: ${stats.balanceStats.average} per user`,
      icon: DollarSign,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4">
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
  );
}
