import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "Proxy test working",
    url: request.url,
    timestamp: new Date().toISOString(),
  });
}

export async function PUT(request: NextRequest) {
  const body = await request.text();
  return NextResponse.json({
    message: "PUT test working",
    url: request.url,
    body: body,
    timestamp: new Date().toISOString(),
  });
}
