/**
 * Утилиты для работы с персистентностью артефактов
 */

export interface SavedArtifactData {
  documentId: string;
  status: "streaming" | "idle" | "error" | "completed" | "pending";
  kind: string;
  title: string;
  content: string;
  isVisible: boolean;
  timestamp: number;
  version: string;
}

/**
 * Сохраняет артефакт в localStorage
 */
export function saveArtifactToStorage(chatId: string, artifact: any): void {
  console.log("🔍 saveArtifactToStorage called:", {
    chatId,
    artifact,
    hasWindow: typeof window !== "undefined",
  });

  if (typeof window === "undefined" || !chatId || !artifact) {
    console.log("⚠️ saveArtifactToStorage skipped:", {
      hasWindow: typeof window !== "undefined",
      chatId: !!chatId,
      artifact: !!artifact,
    });
    return;
  }

  // Don't save artifacts with init documentId (temporary/placeholder artifacts)
  if (artifact.documentId === "init") {
    console.log("⚠️ saveArtifactToStorage skipped: init documentId");
    return;
  }

  const artifactData: SavedArtifactData = {
    documentId: artifact.documentId,
    status: artifact.status,
    kind: artifact.kind,
    title: artifact.title || "",
    content: artifact.content || "",
    isVisible: artifact.isVisible,
    timestamp: Date.now(),
    version: "2.0",
  };

  try {
    const key = `artifact-${chatId}`;
    const value = JSON.stringify(artifactData);

    console.log("🔍 Saving to localStorage:", { key, value: artifactData });
    localStorage.setItem(key, value);

    // Проверяем, что данные действительно сохранились
    const saved = localStorage.getItem(key);
    console.log(
      "🔍 Verification - saved data:",
      saved ? "✅ Success" : "❌ Failed"
    );

    console.log("💾 Artifact saved to storage:", {
      chatId,
      documentId: artifactData.documentId,
      status: artifactData.status,
      isVisible: artifactData.isVisible,
    });
  } catch (error) {
    console.warn("⚠️ Error saving artifact to storage:", error);
  }
}

/**
 * Загружает артефакт из localStorage
 */
export function loadArtifactFromStorage(
  chatId: string
): SavedArtifactData | null {
  console.log("🔍 loadArtifactFromStorage called:", {
    chatId,
    hasWindow: typeof window !== "undefined",
  });

  if (typeof window === "undefined" || !chatId) {
    console.log("⚠️ loadArtifactFromStorage skipped:", {
      hasWindow: typeof window !== "undefined",
      chatId: !!chatId,
    });
    return null;
  }

  try {
    const key = `artifact-${chatId}`;
    const saved = localStorage.getItem(key);
    console.log("🔍 Retrieved from localStorage:", {
      key,
      saved: saved ? "Found" : "Not found",
    });

    if (!saved) {
      console.log("🔍 No data found for key:", key);
      return null;
    }

    const data = JSON.parse(saved) as SavedArtifactData;
    console.log("🔍 Parsed data:", data);

    // Проверяем актуальность данных (не старше 24 часов)
    const maxAge = 24 * 60 * 60 * 1000; // 24 часа в миллисекундах
    const age = Date.now() - data.timestamp;
    console.log("🔍 Data age check:", { age, maxAge, isExpired: age > maxAge });

    if (age > maxAge) {
      console.log("🗑️ Artifact data expired, removing:", chatId);
      localStorage.removeItem(key);
      return null;
    }

    console.log("✅ Data is valid and not expired");
    return data;
  } catch (error) {
    console.error("❌ Failed to load artifact from storage:", error);
    localStorage.removeItem(`artifact-${chatId}`);
    return null;
  }
}

/**
 * Очищает артефакт из localStorage
 */
export function clearArtifactFromStorage(chatId: string): void {
  if (typeof window === "undefined" || !chatId) return;

  localStorage.removeItem(`artifact-${chatId}`);
  console.log("🗑️ Artifact cleared from storage:", chatId);
}

/**
 * Проверяет, есть ли сохраненный артефакт для чата
 */
export function hasSavedArtifact(chatId: string): boolean {
  if (typeof window === "undefined" || !chatId) return false;

  return localStorage.getItem(`artifact-${chatId}`) !== null;
}

/**
 * Получает список всех сохраненных артефактов
 */
export function getAllSavedArtifacts(): Array<{
  chatId: string;
  data: SavedArtifactData;
}> {
  if (typeof window === "undefined") return [];

  const artifacts: Array<{ chatId: string; data: SavedArtifactData }> = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("artifact-")) {
      const chatId = key.replace("artifact-", "");
      const data = loadArtifactFromStorage(chatId);
      if (data) {
        artifacts.push({ chatId, data });
      }
    }
  }

  return artifacts;
}

/**
 * Восстанавливает артефакт из сохраненных данных
 */
export function restoreArtifactFromData(data: SavedArtifactData): any {
  return {
    documentId: data.documentId,
    kind: data.kind,
    status: data.status,
    isVisible: data.isVisible,
    title: data.title,
    content: data.content,
    boundingBox: {
      top: 0,
      left: 0,
      width: 0,
      height: 0,
    },
    timestamp: data.timestamp,
  };
}
