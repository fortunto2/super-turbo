"use client";

import { useState } from "react";
import { Button } from "@turbo-super/ui";
import { Send, Loader2, Banana, Video, Zap } from "lucide-react";

export default function BananaVeo3Page() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatId] = useState(() => crypto.randomUUID());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("/api/banana-veo3", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: chatId,
          message: {
            id: crypto.randomUUID(),
            content: message,
            role: "user",
            parts: [{ text: message }],
          },
          selectedVisibilityType: "private",
        }),
      });

      const data = await res.json();

      if (data.success) {
        setResponse(data.response);
      } else {
        setResponse(`Ошибка: ${data.error || "Неизвестная ошибка"}`);
      }
    } catch (error) {
      setResponse(
        `Ошибка: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Banana className="w-8 h-8 text-yellow-500" />
            <Video className="w-8 h-8 text-blue-500" />
            <Zap className="w-8 h-8 text-purple-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Banana + VEO3 Chat
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Специализированный чат для GPU inference и видео генерации
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Chat ID: {chatId}
        </p>
      </div>

      <div className="space-y-6">
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Ваш запрос для Banana + VEO3:
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Например: 'Создай видео с помощью VEO3 про AI технологии' или 'Запусти inference на Banana для анализа данных'"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              rows={4}
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            disabled={!message.trim() || loading}
            className="w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-blue-500 hover:from-yellow-600 hover:to-blue-600"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Обработка...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Отправить в Banana + VEO3
              </>
            )}
          </Button>
        </form>

        {response && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Ответ от Banana + VEO3:
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border">
              <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-white">
                {response}
              </pre>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Banana className="w-5 h-5 text-yellow-600" />
            <h4 className="font-semibold text-yellow-900 dark:text-yellow-100">
              Banana GPU Inference
            </h4>
          </div>
          <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
            <li>• Быстрая обработка на GPU</li>
            <li>• Масштабируемые вычисления</li>
            <li>• Оптимизация для AI моделей</li>
            <li>• Автоматическое масштабирование</li>
          </ul>
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Video className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-blue-900 dark:text-blue-100">
              VEO3 Video Generation
            </h4>
          </div>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Генерация видео из текста</li>
            <li>• Высокое качество видео</li>
            <li>• Поддержка различных стилей</li>
            <li>• Интеграция с Google Cloud</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
