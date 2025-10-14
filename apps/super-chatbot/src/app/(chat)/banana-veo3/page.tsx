"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Banana, Video, Zap } from "lucide-react";

export default function BananaVeo3Page() {
  const router = useRouter();

  useEffect(() => {
    // Создаем новый чат и перенаправляем на него
    const chatId = crypto.randomUUID();
    router.push(`/banana-veo3/${chatId}`);
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2">
          <Banana className="w-8 h-8 text-yellow-500 animate-bounce" />
          <Video className="w-8 h-8 text-blue-500 animate-bounce delay-100" />
          <Zap className="w-8 h-8 text-purple-500 animate-bounce delay-200" />
        </div>
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
          <p className="text-gray-600 dark:text-gray-400">
            Creating a new Banana + VEO3 chat...
          </p>
        </div>
      </div>
    </div>
  );
}
