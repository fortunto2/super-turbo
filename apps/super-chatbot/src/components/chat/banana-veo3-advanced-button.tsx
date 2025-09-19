import Link from "next/link";
import { Banana, Video, Zap, Star } from "lucide-react";

export function BananaVeo3AdvancedButton() {
  return (
    <Link
      href="/banana-veo3-advanced"
      className="block"
    >
      <div className="flex items-center gap-2 p-2 rounded-md hover:bg-accent/50 transition-colors cursor-pointer border border-yellow-200 dark:border-yellow-800">
        <div className="flex items-center gap-1">
          <Star className="size-3 text-yellow-500" />
          <Banana className="size-4 text-yellow-500" />
          <Video className="size-4 text-blue-500" />
          <Zap className="size-3 text-purple-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm">Banana + VEO3 Pro</div>
          <div className="text-xs text-muted-foreground truncate">
            Реальные API + инструменты
          </div>
        </div>
      </div>
    </Link>
  );
}
