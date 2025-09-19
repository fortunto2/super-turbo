"use client";

import { useState } from "react";
import { Button } from "@turbo-super/ui";
import {
  Send,
  Loader2,
  Banana,
  Video,
  Zap,
  Play,
  List,
  Lightbulb,
} from "lucide-react";
import { useChat } from "ai/react";

export default function BananaVeo3AdvancedPage() {
  const [chatId] = useState(() => crypto.randomUUID());

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    reload,
    stop,
  } = useChat({
    id: chatId,
    api: "/api/banana-veo3-advanced",
    body: {
      selectedVisibilityType: "private",
    },
  });

  const quickActions = [
    {
      icon: List,
      label: "Показать модели Banana",
      action: "Покажи доступные модели Banana для inference",
      color: "bg-yellow-500 hover:bg-yellow-600",
    },
    {
      icon: Play,
      label: "Создать видео VEO3",
      action: "Создай видео про AI технологии с помощью VEO3",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      icon: Lightbulb,
      label: "Идеи для видео",
      action: "Сгенерируй идеи для видео про роботов",
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      icon: Zap,
      label: "Banana Inference",
      action: "Запусти inference на Banana для анализа текста",
      color: "bg-green-500 hover:bg-green-600",
    },
  ];

  const handleQuickAction = (action: string) => {
    // Устанавливаем текст в input и отправляем
    const inputElement = document.querySelector(
      'textarea[placeholder*="Banana"]'
    ) as HTMLTextAreaElement;
    if (inputElement) {
      inputElement.value = action;
      inputElement.dispatchEvent(new Event("input", { bubbles: true }));
      handleSubmit(new Event("submit") as any);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Banana className="w-8 h-8 text-yellow-500" />
            <Video className="w-8 h-8 text-blue-500" />
            <Zap className="w-8 h-8 text-purple-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Banana + VEO3 Advanced
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Реальная интеграция с Banana GPU Inference и VEO3 Video Generation
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Chat ID: {chatId}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Быстрые действия:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              onClick={() => handleQuickAction(action.action)}
              disabled={isLoading}
              className={`${action.color} text-white`}
            >
              <action.icon className="w-4 h-4 mr-2" />
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="mb-8">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-3xl p-4 rounded-lg ${
                  message.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {message.role === "user" ? (
                    <Banana className="w-4 h-4" />
                  ) : (
                    <Video className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">
                    {message.role === "user" ? "Вы" : "Banana + VEO3"}
                  </span>
                </div>
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <div>
          <label
            htmlFor="input"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Ваш запрос для Banana + VEO3:
          </label>
          <textarea
            id="input"
            value={input}
            onChange={handleInputChange}
            placeholder="Например: 'Создай видео с помощью VEO3 про AI технологии' или 'Запусти inference на Banana для анализа данных'"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
            rows={4}
            disabled={isLoading}
          />
        </div>

        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-r from-yellow-500 to-blue-500 hover:from-yellow-600 hover:to-blue-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Обработка...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Отправить
              </>
            )}
          </Button>

          {isLoading && (
            <Button
              type="button"
              onClick={stop}
              variant="outline"
            >
              Остановить
            </Button>
          )}

          {messages.length > 0 && (
            <Button
              type="button"
              onClick={() => reload()}
              variant="outline"
            >
              Перезапустить
            </Button>
          )}
        </div>
      </form>

      {/* Features Info */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Banana className="w-5 h-5 text-yellow-600" />
            <h4 className="font-semibold text-yellow-900 dark:text-yellow-100">
              Banana GPU Inference
            </h4>
          </div>
          <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
            <li>• Реальные API вызовы к Banana</li>
            <li>• Запуск inference на GPU</li>
            <li>• Список доступных моделей</li>
            <li>• Метрики производительности</li>
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
            <li>• Создание видео из текста</li>
            <li>• Проверка статуса генерации</li>
            <li>• Генерация идей для видео</li>
            <li>• Различные стили и разрешения</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
