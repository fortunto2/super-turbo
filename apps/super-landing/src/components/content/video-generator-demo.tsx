"use client";

import { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
} from "@turbo-super/ui";
import { Play, ArrowRight } from "lucide-react";
import Link from "@/components/ui/optimized-link";

const models = [
  {
    name: "Kling 2.1",
    description: "Быстрая генерация коротких видео клипов",
    duration: "до 120с",
    aspectRatio: "16:9",
    slug: "kling-2-1",
    color: "bg-blue-500",
  },
  {
    name: "Sora",
    description: "Экспериментальная модель OpenAI",
    duration: "до 10с",
    aspectRatio: "9:16",
    slug: "sora",
    color: "bg-green-500",
  },
  {
    name: "Veo2",
    description: "Преобразование изображений в видео",
    duration: "до 8с",
    aspectRatio: "16:9",
    slug: "veo2",
    color: "bg-purple-500",
  },
  {
    name: "Google Imagen 4",
    description: "Высококачественные изображения",
    duration: "до 8с",
    aspectRatio: "1:1",
    slug: "google-imagen-4",
    color: "bg-orange-500",
  },
];

export function VideoGeneratorDemo() {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  return (
    <section className="py-16 bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Генерация видео с AI моделями
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Создавайте потрясающие видео с помощью самых современных AI моделей.
            Просто опишите, что вы хотите увидеть, и получите результат за
            считанные минуты.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {models.map((model) => (
            <Card
              key={model.name}
              className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                selectedModel === model.name ? "ring-2 ring-green-500" : ""
              }`}
              onClick={() => {
                setSelectedModel(model.name);
              }}
            >
              <CardHeader className="text-center">
                <div
                  className={`w-12 h-12 rounded-full ${model.color} mx-auto mb-3 flex items-center justify-center`}
                >
                  <Play className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg">{model.name}</CardTitle>
                <CardDescription className="text-sm">
                  {model.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-2">
                <div className="flex justify-center gap-2">
                  <Badge
                    variant="secondary"
                    className="text-xs"
                  >
                    {model.duration}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="text-xs"
                  >
                    {model.aspectRatio}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center space-y-6">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-white mb-4">
              Как это работает
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
              <div className="text-center">
                <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold">
                  1
                </div>
                <p>Выберите модель</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold">
                  2
                </div>
                <p>Опишите видео</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold">
                  3
                </div>
                <p>Получите результат</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/test-video-generator">
              <Button
                size="lg"
                className="flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Попробовать все модели
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/tr/blog">
              <Button
                size="lg"
                variant="outline"
                className="flex items-center gap-2"
              >
                Посмотреть блог
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
