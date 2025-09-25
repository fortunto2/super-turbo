"use client";

import { useState, useEffect } from "react";
import { Button, Input, Badge } from "@turbo-super/ui";
// Using HTML table elements since Table components are not available in UI library
import {
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  CreditCard,
  Edit,
  Trash2,
  Filter,
  Download,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { EditUserDialog } from "./edit-user-dialog";
import { DeleteUserDialog } from "./delete-user-dialog";

interface User {
  id: string;
  email: string;
  balance: number;
  type: "guest" | "regular";
}

interface UsersResponse {
  success: boolean;
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function EnhancedUsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState<
    "all" | "guest" | "regular"
  >("all");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  const fetchUsers = async (
    pageNum: number,
    searchQuery: string,
    typeFilter: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: "20",
        ...(searchQuery && { search: searchQuery }),
        ...(typeFilter !== "all" && { type: typeFilter }),
      });

      const response = await fetch(`/api/admin/users/enhanced?${params}`);
      const data: UsersResponse = await response.json();

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const page = Number.parseInt(searchParams.get("page") || "1");
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "all";

    setSearchTerm(search);
    setUserTypeFilter(type as "all" | "guest" | "regular");
    fetchUsers(page, search, type);
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchTerm) {
      params.set("search", searchTerm);
    } else {
      params.delete("search");
    }
    if (userTypeFilter !== "all") {
      params.set("type", userTypeFilter);
    } else {
      params.delete("type");
    }
    params.delete("page"); // Reset to first page
    router.push(`/admin/users/enhanced?${params.toString()}`);
  };

  const handleTypeFilter = (type: "all" | "guest" | "regular") => {
    setUserTypeFilter(type);
    const params = new URLSearchParams(searchParams);
    if (type !== "all") {
      params.set("type", type);
    } else {
      params.delete("type");
    }
    params.delete("page"); // Reset to first page
    router.push(`/admin/users/enhanced?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`/admin/users/enhanced?${params.toString()}`);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleUserUpdate = () => {
    const page = Number.parseInt(searchParams.get("page") || "1");
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "all";
    fetchUsers(page, search, type);
    setEditDialogOpen(false);
    setSelectedUser(null);
  };

  const handleUserDelete = () => {
    const page = Number.parseInt(searchParams.get("page") || "1");
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "all";
    fetchUsers(page, search, type);
    setDeleteDialogOpen(false);
    setSelectedUser(null);
  };

  const exportUsers = async () => {
    try {
      const response = await fetch("/api/admin/users/enhanced?action=by-type");
      const data = await response.json();

      if (data.success) {
        const csvContent = [
          ["Email", "Type", "Balance"],
          ...data.users.map((user: User) => [
            user.email,
            user.type,
            user.balance,
          ]),
        ]
          .map((row) => row.join(","))
          .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `users-export-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Error exporting users:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-destructive">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <form
          onSubmit={handleSearch}
          className="flex gap-2 flex-1"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit">Search</Button>
        </form>

        <div className="flex gap-2">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="flex gap-1">
              {(["all", "guest", "regular"] as const).map((type) => (
                <Button
                  key={type}
                  variant={userTypeFilter === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTypeFilter(type)}
                >
                  {type === "all"
                    ? "All"
                    : type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={exportUsers}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                User
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Type
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Balance
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[150px]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="text-center py-8 text-muted-foreground"
                >
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge
                      variant={user.type === "guest" ? "secondary" : "default"}
                    >
                      {user.type}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {user.balance}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        credits
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUser(user)}
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
            {pagination.total} users
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

      {/* Dialogs */}
      {editDialogOpen && selectedUser && (
        <EditUserDialog
          user={selectedUser}
          onClose={() => setEditDialogOpen(false)}
          onUpdate={handleUserUpdate}
        />
      )}
      {deleteDialogOpen && selectedUser && (
        <DeleteUserDialog
          user={selectedUser}
          onClose={() => setDeleteDialogOpen(false)}
          onDelete={handleUserDelete}
        />
      )}
    </div>
  );
}
