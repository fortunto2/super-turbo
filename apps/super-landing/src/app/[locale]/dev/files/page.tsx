import type { Metadata } from "next";
import DevFilesClient from "@/components/dev/dev-files-client";

interface DevFilesPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export function generateMetadata(): Metadata {
  return {
    title: `Dev Files Browser | SuperDuperAI`,
    description: "Development file browser for testing and debugging.",
    robots: "noindex, nofollow",
  };
}

export default async function DevFilesPage({ params }: DevFilesPageProps) {
  const { locale } = await params;

  return <DevFilesClient locale={locale} />;
}
