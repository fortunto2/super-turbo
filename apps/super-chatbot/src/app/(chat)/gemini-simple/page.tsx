"use client";

import { useState } from "react";
import { Button } from "@turbo-super/ui";
import { Send, Loader2 } from "lucide-react";

export default function GeminiSimplePage() {
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
      const res = await fetch("/api/gemini-simple", {
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Gemini 2.5 Flash Lite - Простой тест
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Прямая интеграция с Google AI Platform API
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
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
              Ваше сообщение:
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Напишите что-нибудь для Gemini..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              rows={4}
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            disabled={!message.trim() || loading}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Отправка...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Отправить в Gemini
              </>
            )}
          </Button>
        </form>

        {response && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Ответ Gemini:
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border">
              <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-white">
                {response}
              </pre>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Информация о тесте:
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Использует прямой HTTP запрос к Google AI Platform API</li>
          <li>• Модель: gemini-2.5-flash-lite</li>
          <li>
            • API ключ:{" "}
            {process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY
              ? "Настроен"
              : "Не настроен"}
          </li>
          <li>• Сохраняет сообщения в базу данных</li>
        </ul>
      </div>
    </div>
  );
}
