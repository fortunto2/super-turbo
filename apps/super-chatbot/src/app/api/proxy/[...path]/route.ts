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

    // AICODE-NOTE: Для file upload НЕ добавляем query параметры - все должно быть в FormData
    let finalUrl = fullUrl;
    if (apiPath === "file/upload" && method === "POST") {
      // Убираем query параметры для file upload - все должно быть в FormData
      const baseUrl = `${process.env.SUPERDUPERAI_URL || "https://dev-editor.superduperai.co"}/api/v1/file/upload`;
      finalUrl = baseUrl;
      console.log(
        "📤 Proxy: Using clean URL for file upload (no query params):",
        finalUrl
      );
    }

    // Получаем тело запроса
    let body: any = undefined;
    let isFormData = false;

    if (method !== "GET") {
      const contentType = request.headers.get("content-type") || "";

      // Проверяем, является ли запрос FormData (загрузка файлов)
      if (contentType.includes("multipart/form-data")) {
        console.log("📤 Proxy: Detected FormData request for file upload");
        const formData = await request.formData();

        console.log("📤 Proxy: FormData fields:");
        for (const [key, value] of formData.entries()) {
          if (value instanceof File) {
            console.log(
              `  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`
            );
          } else {
            console.log(`  ${key}: ${value}`);
          }
        }

        // AICODE-NOTE: Для file upload используем оригинальный FormData без конвертации
        if (apiPath === "file/upload" && method === "POST") {
          // Добавляем type если не передан
          if (!formData.has("type")) {
            const typeFromQuery =
              new URL(request.url).searchParams.get("type") || "image";
            formData.append("type", typeFromQuery);
            console.log(
              "📤 Proxy: Added type field to FormData:",
              typeFromQuery
            );
          }

          console.log("📤 Proxy: Using original FormData (no conversion)");
          body = formData;
          isFormData = true;
        } else {
          body = formData;
          isFormData = true;
        }
      } else {
        try {
          const bodyString = await request.text();
          if (bodyString.trim()) {
            body = JSON.parse(bodyString);
          }
        } catch {
          const bodyString = await request.text();
          body = bodyString;
        }
      }
    }

    // Подготавливаем заголовки
    const headers: Record<string, string> = {
      Authorization: `Bearer ${process.env.SUPERDUPERAI_TOKEN}`,
      "User-Agent": `SuperChatbot/3.0.22 (NextJS/${process.env.NODE_ENV || "development"})`,
      Accept: "application/json",
    };

    // AICODE-NOTE: Для браузерного FormData НЕ добавляем Content-Type - браузер сам установит с boundary
    if (!isFormData && body) {
      // Для JSON добавляем Content-Type
      headers["Content-Type"] = "application/json";
    }
    // Для FormData (браузерного) НЕ добавляем Content-Type - браузер сам установит с boundary

    console.log(`📤 Proxy: Sending ${method} request to:`, finalUrl);
    console.log(`📤 Proxy: Headers:`, headers);

    // Выполняем запрос к SuperDuperAI API
    const response = await fetch(finalUrl, {
      method,
      headers,
      body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    });

    console.log(
      `✅ Proxy: Response ${response.status} for ${method} ${apiPath}`
    );

    if (!response.ok) {
      let errorData: any;
      try {
        errorData = await response.json();
      } catch {
        errorData = { error: "API Error", message: await response.text() };
      }

      console.log(`❌ Proxy: Error response:`, errorData);
      return NextResponse.json(
        { error: errorData.error || "API Error", details: errorData },
        { status: response.status }
      );
    }

    // Для успешных ответов пытаемся получить JSON
    try {
      const responseData = await response.json();
      return NextResponse.json(responseData);
    } catch {
      // Если не JSON, возвращаем как текст
      const responseText = await response.text();
      return new NextResponse(responseText, {
        status: response.status,
        headers: {
          "Content-Type": response.headers.get("content-type") || "text/plain",
        },
      });
    }
  } catch (error: any) {
    console.error("Proxy API Error:", error);

    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
