import { NextRequest, NextResponse } from "next/server";
import { getCurrentDemoBalance } from "@/lib/utils/tools-balance";

export async function GET(request: NextRequest) {
  // Используем IP адрес как стабильный идентификатор пользователя
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0] || realIp || "unknown";
  const userId = `demo-user-${ip}`;

  console.log(`🔍 Tools balance API - IP: ${ip}, userId: ${userId}`);

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
