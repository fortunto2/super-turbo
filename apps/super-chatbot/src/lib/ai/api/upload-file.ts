import { type FileTypeEnum, FileService } from "@turbo-super/api";

export const uploadFile = async (file: File, type?: FileTypeEnum) => {
  try {
    console.log("🖼️ Attempting direct file upload...", file);

    const uploadResult = await FileService.fileUpload({
      ...(type && { type }),
      formData: {
        payload: file,
      },
    });

    return uploadResult;
  } catch (uploadError) {
    console.warn("⚠️ Upload failed, trying fallback methods...", uploadError);
    throw new Error(`Upload failed: ${uploadError}`);
  }
};
