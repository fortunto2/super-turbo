import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { addUserBalance } from "@/lib/utils/tools-balance";

export async function POST(request: NextRequest) {
  try {
    console.log("🔔 Add credits endpoint called");

    const session = await auth();
    console.log(
      "👤 Session:",
      session?.user?.id ? "authenticated" : "not authenticated"
    );

    if (!session?.user?.id) {
      console.error("❌ Authentication required");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { amount = 100 } = await request.json();
    const userId = session.user.id;

    console.log(`💰 Adding ${amount} credits to user ${userId}`);

    const transaction = await addUserBalance(
      userId,
      amount,
      "manual_addition",
      {
        timestamp: new Date().toISOString(),
        reason: "Manual credit addition for testing",
      }
    );

    console.log("✅ Credits added successfully:", transaction);

    return NextResponse.json({
      success: true,
      transaction,
      message: `Added ${amount} credits to user ${userId}`,
    });
  } catch (error) {
    console.error("❌ Error adding credits:", error);
    return NextResponse.json(
      { error: "Failed to add credits" },
      { status: 500 }
    );
  }
}
