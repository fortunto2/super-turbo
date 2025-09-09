import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { getServerOpenAPI } from "@/lib/api/server-openapi";

/**
 * Универсальный прокси API роут для всех запросов к SuperDuperAI
 * Автоматически добавляет токен авторизации
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return handleProxyRequest(request, path, "GET");
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return handleProxyRequest(request, path, "POST");
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return handleProxyRequest(request, path, "PUT");
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return handleProxyRequest(request, path, "DELETE");
}

async function handleProxyRequest(
  request: NextRequest,
  path: string[],
  method: string
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Инициализируем OpenAPI с токеном
    getServerOpenAPI();

    // Строим URL для SuperDuperAI API
    const apiPath = path.join("/");
    const superduperaiUrl = `${process.env.SUPERDUPERAI_URL || "https://dev-editor.superduperai.co"}/api/v1/${apiPath}`;

    // Получаем параметры запроса
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const fullUrl = queryString
      ? `${superduperaiUrl}?${queryString}`
      : superduperaiUrl;

    // Получаем тело запроса
    let body: any = undefined;
    if (method !== "GET") {
      try {
        body = await request.json();
      } catch {
        // Если не JSON, получаем как текст
        body = await request.text();
      }
    }

    // Выполняем запрос к SuperDuperAI API
    const response = await fetch(fullUrl, {
      method,
      headers: {
        Authorization: `Bearer ${process.env.SUPERDUPERAI_TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent": `SuperChatbot/3.0.22 (NextJS/${process.env.NODE_ENV || "development"})`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const responseData = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: responseData.error || "API Error", details: responseData },
        { status: response.status }
      );
    }

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("Proxy API Error:", error);

    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
