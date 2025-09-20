import Link from "next/link";
import { Banana, Video, Zap } from "lucide-react";

export function BananaVeo3Button() {
  return (
    <Link
      href="/banana-veo3"
      className="block"
    >
      <div className="flex items-center gap-2 p-2 rounded-md hover:bg-accent/50 transition-colors cursor-pointer">
        <div className="flex items-center gap-1">
          <Banana className="size-4 text-yellow-500" />
          <Video className="size-4 text-blue-500" />
          <Zap className="size-3 text-purple-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm">Banana + VEO3</div>
          <div className="text-xs text-muted-foreground truncate">
            GPU inference + Video generation
          </div>
        </div>
      </div>
    </Link>
  );
}
