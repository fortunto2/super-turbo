import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// Директория для хранения загруженных изображений
const UPLOAD_DIR = join(process.cwd(), "public", "uploads", "images");

// Обеспечиваем существование директории
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Обеспечиваем существование директории
    await ensureUploadDir();

    const formData = await request.formData();
    const image = formData.get("image") as File;

    if (!image || image.size === 0) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Проверяем тип файла
    if (!image.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Проверяем размер файла (максимум 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (image.size > maxSize) {
      return NextResponse.json(
        { error: "Image size must be less than 10MB" },
        { status: 400 }
      );
    }

    // Генерируем уникальное имя файла
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = image.name.split(".").pop() ?? "jpg";
    const fileName = `${timestamp}_${randomString}.${extension}`;
    const filePath = join(UPLOAD_DIR, fileName);

    // Конвертируем файл в буфер
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Сохраняем файл
    await writeFile(filePath, buffer);

    // Возвращаем полный URL изображения
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const imageUrl = `${baseUrl}/uploads/images/${fileName}`;

    console.log("✅ Image uploaded successfully:", {
      fileName,
      size: image.size,
      type: image.type,
      url: imageUrl,
    });

    return NextResponse.json({
      success: true,
      imageUrl,
      fileName,
      size: image.size,
      type: image.type,
      // Добавляем информацию о файле для возможного использования в image-to-video
      file: {
        name: image.name,
        size: image.size,
        type: image.type,
        lastModified: image.lastModified,
      },
    });
  } catch (error) {
    console.error("❌ Image upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to upload image",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
