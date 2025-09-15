import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import {
  getAllUsers,
  getUserById,
  updateUserBalance,
  deleteUser,
  getUserStats,
  getUsersByType,
  getRecentUsers,
} from "@/lib/db/admin-queries";

// Check if user is admin
function isAdmin(email?: string | null): boolean {
  const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [
    "pranov.adiletqwe@gmail.com",
    "admin@superduperai.com",
    "support@superduperai.com",
    "dev@superduperai.com",
  ];
  return email ? adminEmails.includes(email) : false;
}

export async function GET(request: NextRequest) {
  try {
    // Проверка аутентификации и прав админа
    const session = await auth();
    if (!session?.user || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    switch (action) {
      case "stats":
        const stats = await getUserStats();
        return NextResponse.json({ success: true, stats });

      case "by-type":
        const userType = searchParams.get("type") as "guest" | "regular" | null;
        const typeUsers = await getUsersByType(userType);
        return NextResponse.json({ success: true, users: typeUsers });

      case "recent":
        const recentLimit = parseInt(searchParams.get("limit") || "10");
        const recentUsers = await getRecentUsers(recentLimit);
        return NextResponse.json({ success: true, users: recentUsers });

      default:
        // Default: get paginated users
        const page = parseInt(searchParams.get("page") || "1");
        const defaultLimit = parseInt(searchParams.get("limit") || "20");
        const search = searchParams.get("search") || "";

        const result = await getAllUsers(page, defaultLimit, search);
        return NextResponse.json({ success: true, ...result });
    }
  } catch (error: any) {
    console.error("Admin enhanced users fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Проверка аутентификации и прав админа
    const session = await auth();
    if (!session?.user || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { userId, balance } = body;

    if (!userId || balance === undefined) {
      return NextResponse.json(
        { error: "User ID and balance are required" },
        { status: 400 }
      );
    }

    const result = await updateUserBalance(userId, balance);

    return NextResponse.json({
      success: true,
      message: "User balance updated successfully",
      ...result,
    });
  } catch (error: any) {
    console.error("Admin user update error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Проверка аутентификации и прав админа
    const session = await auth();
    if (!session?.user || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const result = await deleteUser(userId);

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
      ...result,
    });
  } catch (error: any) {
    console.error("Admin user delete error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
