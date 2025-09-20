"use client";

import Link from "next/link";
import { Button } from "@turbo-super/ui";
import { Sparkles, Video, Image } from "lucide-react";

export function GeminiChatButton() {
  return (
    <Link
      href="/gemini-chat"
      className="block"
    >
      <div className="flex items-center gap-2 p-2 rounded-md hover:bg-accent/50 transition-colors cursor-pointer">
        <Sparkles className="size-4 text-blue-500" />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm">Gemini + VEO3</div>
          <div className="text-xs text-muted-foreground truncate">
            Быстрые ответы с Gemini 2.5 Flash Lite
          </div>
        </div>
        <div className="flex gap-1">
          <Video className="size-3 text-green-500" />
          <Image className="size-3 text-purple-500" />
        </div>
      </div>
    </Link>
  );
}
