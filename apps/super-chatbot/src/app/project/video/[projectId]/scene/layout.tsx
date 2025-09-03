import { BackButton } from "@/components/back-button";
import { Scenes } from "@/components/scenes";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

export default async function Layout({
  children,
  params,
}: {
  children: ReactNode;
  params: { projectId: string };
}) {
  const { projectId } = await params;
  return (
    <div className="w-full h-screen overflow-hidden bg-background">
      <div className="h-full px-4 py-4 flex flex-col">
        {/* Header (compact) */}
        <div className="mb-4 flex items-center justify-between shrink-0">
          <BackButton />

          <Link
            href={`/project/video/${projectId}/timeline`}
            className="inline-flex items-center text-primary hover:text-primary/80 transition-all duration-300 hover:scale-105 group"
          >
            <div className="size-10 bg-card border border-border rounded-full flex items-center justify-center mr-3 shadow-lg group-hover:shadow-xl transition-all duration-300">
              <ArrowRight className="size-4" />
            </div>
            <span className="font-medium">Timeline</span>
          </Link>
        </div>
        {/* Main no-scroll layout */}
        <div className="flex-1 flex gap-4 overflow-hidden">
          {/* Left side: scenes list */}
          <aside className="w-1/5 min-w-[220px] bg-card border border-border rounded-xl p-2 overflow-hidden">
            <div className="h-full grid grid-cols-1 auto-rows-[minmax(56px,auto)] gap-2 overflow-hidden">
              <div className="flex-1 overflow-auto">
                <Scenes />
              </div>
            </div>
          </aside>

          {children}
        </div>
      </div>
    </div>
  );
}
