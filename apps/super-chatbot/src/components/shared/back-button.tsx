"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center text-primary hover:text-primary/80 transition-all duration-300 hover:scale-105 group"
    >
      <div className="size-10 bg-card border border-border rounded-full flex items-center justify-center mr-3 shadow-lg group-hover:shadow-xl transition-all duration-300">
        <ArrowLeft className="size-4" />
      </div>
      <span className="font-medium">Back</span>
    </button>
  );
}
