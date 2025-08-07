import { NextResponse } from "next/server";
import { getCurrentDemoBalance } from "@/lib/utils/tools-balance";

export async function GET() {
  const userId = "demo-user";
  const balance = getCurrentDemoBalance(userId);

  const isLow = balance <= 10 && balance > 0;
  const isEmpty = balance <= 0;

  let displayColor: "green" | "yellow" | "red" = "green";
  if (isEmpty) displayColor = "red";
  else if (isLow) displayColor = "yellow";

  return NextResponse.json({
    balance,
    status: {
      balance,
      isLow,
      isEmpty,
      displayColor,
    },
    userType: "demo",
    userId,
  });
}
