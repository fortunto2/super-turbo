import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { getUserToolsBalance } from "@/lib/utils/tools-balance";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const balance = await getUserToolsBalance(userId);

    return NextResponse.json({
      userId,
      balance,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error getting user balance:", error);
    return NextResponse.json(
      { error: "Failed to get user balance" },
      { status: 500 }
    );
  }
}
