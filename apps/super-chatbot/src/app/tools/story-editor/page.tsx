"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@turbo-super/ui";
import { FileText, ExternalLink, Loader2 } from "lucide-react";

export default function StoryEditorPage() {
  const router = useRouter();

  useEffect(() => {
    // Автоматическое перенаправление на внешний редактор
    const redirectTimer = setTimeout(() => {
      window.location.href = "https://editor.superduperai.co/";
    }, 2000); // 2 секунды задержки для показа информации

    return () => clearTimeout(redirectTimer);
  }, []);

  return (
    <div className="min-h-screen bg-background w-full">
      <div className="container mx-auto px-4 py-8 w-full max-w-4xl">
        <div className="w-full space-y-8">
          {/* Main content */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Story Editor
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Перенаправляем вас на профессиональный редактор историй SuperDuperAI...
            </p>
          </div>

          {/* Redirect card */}
          <div className="flex justify-center">
            <Card className="w-full max-w-2xl">
              <CardHeader className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 rounded-full bg-emerald-100">
                    <FileText className="size-12 text-emerald-600" />
                  </div>
                </div>
                <CardTitle className="text-2xl">Перенаправление...</CardTitle>
                <CardDescription className="text-base">
                  Вы будете автоматически перенаправлены на Story Editor
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-2 text-emerald-600">
                  <Loader2 className="size-5 animate-spin" />
                  <span>Подготовка к перенаправлению...</span>
                </div>
                
                <div className="pt-4">
                  <a
                    href="https://editor.superduperai.co/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-emerald-600 hover:text-emerald-700 underline"
                  >
                    <span>Открыть Story Editor</span>
                    <ExternalLink className="size-4" />
                  </a>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Если автоматическое перенаправление не сработало, нажмите на ссылку выше
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Footer info */}
          <div className="text-center text-sm text-muted-foreground border-t pt-8 mt-12">
            <p>
              Powered by <strong>SuperDuperAI</strong> • Professional story writing and editing tool
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
