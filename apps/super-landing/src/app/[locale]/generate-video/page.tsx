import { GenerateVideoForm } from "@/components/generate-video-form";
import type { Locale } from "@/config/i18n-config";

interface PageProps {
  params: Promise<{
    locale: Locale;
  }>;
  searchParams: Promise<{
    model?: string;
  }>;
}

export default async function GenerateVideoPage({
  params,
  searchParams,
}: PageProps) {
  const { locale } = await params;
  const { model } = await searchParams;
  const modelName = model ?? "Unknown Model";

  return (
    <GenerateVideoForm
      locale={locale}
      modelName={modelName}
    />
  );
}
