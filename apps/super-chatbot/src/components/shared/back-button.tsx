"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  href?: string;
  children?: React.ReactNode;
  className?: string;
}

export function BackButton({
  href,
  children = "Back",
  className = "",
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center text-primary hover:text-primary/80 transition-all duration-300 hover:scale-105 group ${className}`}
    >
      <div className="size-10 bg-card border border-border rounded-full flex items-center justify-center mr-3 shadow-lg group-hover:shadow-xl transition-all duration-300">
        <ArrowLeft className="size-4" />
      </div>
      <span className="font-medium">{children}</span>
    </button>
  );
}
