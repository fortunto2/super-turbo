import { type NextRequest, NextResponse } from "next/server";
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
    console.log(`🌐 Proxy ${method} request for path:`, path);

    const session = await auth();
    if (!session?.user) {
      console.log("❌ Proxy: Unauthorized - no session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Инициализируем OpenAPI с токеном
    getServerOpenAPI();

    // Строим URL для SuperDuperAI API
    const apiPath = path.join("/");
    const superduperaiUrl = `${process.env.SUPERDUPERAI_URL || "https://dev-editor.superduperai.co"}/api/v1/${apiPath}`;

    console.log(`🎯 Proxy: Forwarding to ${superduperaiUrl}`);

    // Получаем параметры запроса
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const fullUrl = queryString
      ? `${superduperaiUrl}?${queryString}`
      : superduperaiUrl;

    // Получаем тело запроса
    let body: any = undefined;
    let bodyString: string | undefined = undefined;

    if (method !== "GET") {
      try {
        // Сначала получаем тело как текст
        bodyString = await request.text();

        // Пытаемся распарсить как JSON
        if (bodyString.trim()) {
          body = JSON.parse(bodyString);
        }
      } catch {
        // Если не удается распарсить как JSON, используем как есть
        body = bodyString;
      }
    }

    // Подготавливаем заголовки
    const headers: Record<string, string> = {
      Authorization: `Bearer ${process.env.SUPERDUPERAI_TOKEN}`,
      "User-Agent": `SuperChatbot/3.0.22 (NextJS/${process.env.NODE_ENV || "development"})`,
    };

    // Добавляем Content-Type только если есть body
    if (bodyString) {
      headers["Content-Type"] = "application/json";
    }

    // Выполняем запрос к SuperDuperAI API
    const response = await fetch(fullUrl, {
      method,
      headers,
      body: bodyString || undefined,
    });

    const responseData = await response.json();

    console.log(
      `✅ Proxy: Response ${response.status} for ${method} ${apiPath}`
    );

    if (!response.ok) {
      console.log(`❌ Proxy: Error response:`, responseData);
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
