export type ImageGenType = "text-to-image" | "image-to-image";

export function normalizeImageGenerationType(value: any): ImageGenType {
  return value === "image-to-image" ? "image-to-image" : "text-to-image";
}

export function ensureNonEmptyPrompt(input: any, fallback: string): string {
  const str = typeof input === "string" ? input.trim() : "";
  return str.length > 0 ? str : fallback;
}

export async function selectImageToImageModel(
  rawModelName: string,
  getAvailableImageModels: () => Promise<any[]>,
  options?: { allowInpainting?: boolean }
): Promise<string | null> {
  const allowInpainting = options?.allowInpainting ?? false;
  const allImageModels = await getAvailableImageModels();
  const allI2I = allImageModels.filter((m: any) => m.type === "image_to_image");

  const wants = String(rawModelName || "");
  const baseToken = wants.toLowerCase().includes("flux")
    ? "flux"
    : wants.split("/").pop()?.split("-")[0] || wants.toLowerCase();

  const candidates = allowInpainting
    ? allI2I
    : allI2I.filter((m: any) => !/inpaint/i.test(String(m.name || "")));

  let pick = candidates.find(
    (m: any) =>
      String(m.name || "").toLowerCase() === wants.toLowerCase() ||
      String(m.label || "").toLowerCase() === wants.toLowerCase()
  );
  if (!pick && baseToken) {
    pick = candidates.find(
      (m: any) =>
        String(m.name || "")
          .toLowerCase()
          .includes(baseToken) ||
        String(m.label || "")
          .toLowerCase()
          .includes(baseToken)
    );
  }
  if (!pick && candidates.length > 0) pick = candidates[0];

  return pick?.name || null;
}
