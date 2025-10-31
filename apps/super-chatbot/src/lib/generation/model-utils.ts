export type ImageGenType = 'text-to-image' | 'image-to-image';
export type VideoGenType = 'text-to-video' | 'image-to-video';

export function normalizeImageGenerationType(value: any): ImageGenType {
  return value === 'image-to-image' ? 'image-to-image' : 'text-to-image';
}

export function normalizeVideoGenerationType(value: any): VideoGenType {
  return value === 'image-to-video' ? 'image-to-video' : 'text-to-video';
}

export function ensureNonEmptyPrompt(input: any, fallback: string): string {
  const str = typeof input === 'string' ? input.trim() : '';
  return str.length > 0 ? str : fallback;
}

export async function selectImageToImageModel(
  rawModelName: string,
  getAvailableImageModels: () => Promise<any[]>,
  options?: { allowInpainting?: boolean },
): Promise<string | null> {
  const allowInpainting = options?.allowInpainting ?? false;
  const allImageModels = await getAvailableImageModels();
  const allI2I = allImageModels.filter((m: any) => m.type === 'image_to_image');

  const wants = String(rawModelName || '').trim();
  const wantsLower = wants.toLowerCase();

  if (!wants) {
    return null;
  }

  const candidates = allowInpainting
    ? allI2I
    : allI2I.filter((m: any) => !/inpaint/i.test(String(m.name || '')));

  if (candidates.length === 0) {
    return null;
  }

  let pick = candidates.find(
    (m: any) =>
      String(m.name || '').toLowerCase() === wantsLower ||
      String(m.label || '').toLowerCase() === wantsLower,
  );

  if (!pick) {
    pick = candidates.find((m: any) => {
      const modelName = String(m.name || '').toLowerCase();
      const modelLabel = String(m.label || '').toLowerCase();
      return modelName.includes(wantsLower) || modelLabel.includes(wantsLower);
    });
  }

  if (!pick) {
    const baseToken = wantsLower.includes('flux')
      ? 'flux'
      : wants.split('/').pop()?.split('-')[0]?.toLowerCase() || wantsLower;

    if (baseToken && baseToken !== wantsLower) {
      pick = candidates.find(
        (m: any) =>
          String(m.name || '')
            .toLowerCase()
            .includes(baseToken) ||
          String(m.label || '')
            .toLowerCase()
            .includes(baseToken),
      );
    }
  }

  return pick?.name || null;
}

export async function selectImageToVideoModel(
  rawModelName: string,
  getAvailableVideoModels: () => Promise<any[]>,
): Promise<string | null> {
  const allVideoModels = await getAvailableVideoModels();
  const allI2V = allVideoModels.filter((m: any) => m.type === 'image_to_video');

  const wants = String(rawModelName || '');
  const baseToken = wants.toLowerCase().includes('sora')
    ? 'sora'
    : wants.toLowerCase().includes('veo')
      ? 'veo'
      : wants.split('/').pop()?.split('-')[0] || wants.toLowerCase();

  let pick = allI2V.find(
    (m: any) =>
      String(m.name || '').toLowerCase() === wants.toLowerCase() ||
      String(m.label || '').toLowerCase() === wants.toLowerCase(),
  );

  if (!pick && baseToken) {
    pick = allI2V.find(
      (m: any) =>
        String(m.name || '')
          .toLowerCase()
          .includes(baseToken) ||
        String(m.label || '')
          .toLowerCase()
          .includes(baseToken),
    );
  }

  return pick?.name || null;
}
