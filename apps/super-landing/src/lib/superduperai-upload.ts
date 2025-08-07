import {
  configureSuperduperAI,
  getSuperduperAIConfig,
} from "@/lib/config/superduperai";

export interface UploadResult {
  id: string;
  url: string;
  filename: string;
  size: number;
  type: string;
}

/**
 * Загружает файл на SuperDuperAI сервер
 */
export async function uploadFileToSuperduperAI(
  file: File,
  type: string = "image"
): Promise<UploadResult> {
  try {
    console.log("🖼️ Uploading file to SuperDuperAI:", {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    // Конфигурируем SuperDuperAI клиент
    configureSuperduperAI();
    const config = getSuperduperAIConfig();

    // Создаем FormData
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    // Загружаем файл
    const response = await fetch(`${config.url}/api/v1/file/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.token}`,
        "User-Agent": "SuperDuperAI-Landing/1.0",
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ SuperDuperAI upload error:", errorText);
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log("✅ File uploaded successfully:", result);

    return {
      id: result.id,
      url: result.url,
      filename: result.filename || file.name,
      size: result.size || file.size,
      type: result.type || file.type,
    };
  } catch (error) {
    console.error("❌ Error uploading file to SuperDuperAI:", error);
    throw error;
  }
}

/**
 * Загружает изображение по URL на SuperDuperAI сервер
 */
export async function uploadImageUrlToSuperduperAI(
  imageUrl: string
): Promise<UploadResult> {
  try {
    console.log("🖼️ Uploading image URL to SuperDuperAI:", imageUrl);

    // Конфигурируем SuperDuperAI клиент
    configureSuperduperAI();
    const config = getSuperduperAIConfig();

    // Сначала получаем изображение по URL
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(
        `Failed to fetch image from ${imageUrl}: ${imageResponse.status}`
      );
    }

    const imageBlob = await imageResponse.blob();
    const filename = imageUrl.split("/").pop() || "image.jpg";
    const file = new File([imageBlob], filename, { type: imageBlob.type });

    // Загружаем файл на SuperDuperAI
    return await uploadFileToSuperduperAI(file, "image");
  } catch (error) {
    console.error("❌ Error uploading image URL to SuperDuperAI:", error);
    throw error;
  }
}
