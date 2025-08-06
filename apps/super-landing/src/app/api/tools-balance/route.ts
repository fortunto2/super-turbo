import { NextResponse } from "next/server";

export async function GET() {
  // Простая заглушка для баланса
  return NextResponse.json({
    balance: 100,
    status: {
      balance: 100,
      isLow: false,
      isEmpty: false,
      displayColor: "green",
    },
    userType: "demo",
    userId: "demo-user",
  });
}
