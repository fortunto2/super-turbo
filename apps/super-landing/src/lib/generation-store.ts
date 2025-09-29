// Простое хранилище для данных генерации в localStorage
// Используется для клиентской части

export interface GenerationData {
  generationId: string;
  status: "pending" | "processing" | "completed" | "error";
  progress: number;
  prompt: string;
  modelName: string;
  modelType: "image" | "video";
  paymentSessionId?: string;
  createdAt: string;
  error?: string;
  // Для изображений
  images?: {
    fileId: string;
    status: "pending" | "processing" | "completed" | "error";
    url?: string;
    thumbnailUrl?: string;
  }[];
  // Для видео
  videoGeneration?: {
    fileId: string;
    status: "pending" | "processing" | "completed" | "error";
    url?: string;
    thumbnailUrl?: string;
  };
  // Дополнительные поля для совместимости
  imageCount?: number;
  modelConfig?: Record<string, unknown>;
  // Тип генерации
  generationType?:
    | "text-to-image"
    | "image-to-image"
    | "text-to-video"
    | "image-to-video";
}

// Сохраняем данные генерации в localStorage
export function saveGenerationData(data: GenerationData) {
  if (typeof window === "undefined") return;

  console.log(`💾 Saving generation data to localStorage:`, data);

  try {
    const key = `generation_${data.generationId}`;
    localStorage.setItem(key, JSON.stringify(data));
    console.log(`💾 Saved generation data for ${data.generationId}`);
  } catch (error) {
    console.error(`❌ Error saving generation data:`, error);
  }
}

// Загружаем данные генерации из localStorage
export function loadGenerationData(
  generationId: string
): GenerationData | null {
  if (typeof window === "undefined") return null;

  console.log(`🔍 Looking for generation data with ID: ${generationId}`);

  try {
    const key = `generation_${generationId}`;
    const data = localStorage.getItem(key);

    if (data) {
      const parsedData = JSON.parse(data) as GenerationData;
      console.log(`📂 Loaded generation data for ${generationId}:`, parsedData);
      return parsedData;
    } else {
      console.log(`❌ No data found for ${generationId}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error loading generation data:`, error);
    return null;
  }
}

// Получаем все данные генерации из localStorage
export function getAllGenerationData(): GenerationData[] {
  if (typeof window === "undefined") return [];

  try {
    const allData: GenerationData[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("generation_")) {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            const parsedData = JSON.parse(data) as GenerationData;
            allData.push(parsedData);
          }
        } catch (error) {
          console.error(`Error parsing data for key ${key}:`, error);
        }
      }
    }

    return allData;
  } catch (error) {
    console.error("Error reading localStorage:", error);
    return [];
  }
}

// Удаляем данные генерации из localStorage
export function deleteGenerationData(generationId: string) {
  if (typeof window === "undefined") return false;

  try {
    const key = `generation_${generationId}`;
    localStorage.removeItem(key);
    console.log(`🗑️ Deleted generation data for ${generationId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting generation data for ${generationId}:`, error);
    return false;
  }
}
