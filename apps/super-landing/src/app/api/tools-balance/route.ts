import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getCurrentDemoBalance } from "@/lib/utils/tools-balance";

export async function GET(request: NextRequest) {
  // Приоритет: cookie → fallback IP
  const cookieUid = request.cookies.get("superduperai_uid")?.value;
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0]?.trim() ?? realIp ?? "unknown";
  const userId = cookieUid ? `demo-user-${cookieUid}` : `demo-user-${ip}`;

  console.log(
    `🔍 Tools balance API - uid: ${cookieUid ?? "(no-cookie)"}, ip: ${ip}, userId: ${userId}`
  );

  const balance = await getCurrentDemoBalance(userId);

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
