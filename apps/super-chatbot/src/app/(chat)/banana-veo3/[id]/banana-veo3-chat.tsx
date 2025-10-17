"use client";

import type { UIMessage } from "ai";
import { useEffect, useState, useRef } from "react";
import type { Session } from "next-auth";
import type { VisibilityType } from "@/components/shared/visibility-selector";
import {
  Banana,
  Video,
  Zap,
  Send,
  Loader2,
  Plus,
  Menu,
  X,
  MessageSquare,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { generateUUID } from "@/lib/utils";
import { Button } from "@turbo-super/ui";
import { Textarea } from "@turbo-super/ui";
import { Card } from "@turbo-super/ui";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { fetcher } from "@/lib/utils";

export interface BananaVeo3ChatProps {
  id: string;
  initialMessages: Array<UIMessage>;
  initialChatModel: string;
  initialVisibilityType: VisibilityType;
  isReadonly: boolean;
  session: Session;
  autoResume: boolean;
  onDataStream?: (data: any[]) => void;
}

export function BananaVeo3Chat({
  id,
  initialMessages,
  initialChatModel,
  initialVisibilityType,
  isReadonly,
  session,
  autoResume,
  onDataStream,
}: BananaVeo3ChatProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<UIMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Загружаем историю чатов
  const { data: history } = useSWR<
    { id: string; title: string; createdAt: Date }[]
  >(`/api/banana-veo3/history?userId=${session.user.id}`, fetcher, {
    fallbackData: [],
  });

  // Логирование инициализации
  useEffect(() => {
    console.log("🍌 BananaVeo3Chat initialized with messages:", {
      count: initialMessages.length,
      messages: initialMessages.map((m) => ({
        id: m.id,
        role: m.role,
        content: (m as any).content?.substring(0, 50),
        partsLength: m.parts?.length,
        hasContent: !!(m as any).content,
        hasParts: !!m.parts,
      })),
    });
  }, []);

  const handleNewChat = () => {
    const newChatId = crypto.randomUUID();
    router.push(`/banana-veo3/${newChatId}`);
  };

  const handleBackToMain = () => {
    router.push("/");
  };

  // Автоскролл к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isReadonly) return;

    const userMessage: UIMessage = {
      id: generateUUID(),
      role: "user",
      parts: [{ type: "text", text: input }],
      createdAt: new Date(),
    } as any;

    // Добавляем сообщение пользователя
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/banana-veo3", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          message: userMessage,
          selectedVisibilityType: initialVisibilityType,
        }),
      });

      const data = await response.json();

      if (data.success && data.response) {
        const assistantMessage: UIMessage = {
          id: data.messageId || generateUUID(),
          role: "assistant",
          parts: [{ type: "text", text: data.response }],
          createdAt: new Date(),
        } as any;

        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || "Failed to get response");
      }
    } catch (error) {
      console.error("🍌🎬 Banana+VEO3 Chat error:", error);

      const errorMessage: UIMessage = {
        id: generateUUID(),
        role: "assistant",
        parts: [
          {
            type: "text",
            text: `Ошибка: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`,
          },
        ],
        createdAt: new Date(),
      } as any;

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-950 w-full max-w-4xl">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-80 bg-zinc-950 border-r border-zinc-800 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 ">
            <div className="flex items-center gap-2">
              <Banana className="w-5 h-5 text-yellow-500" />
              <h2 className="font-semibold text-white">Chat History</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Back to Main Button */}
          <div className="p-3 bg-zinc-800">
            <Button
              onClick={handleBackToMain}
              className="w-full bg-zinc-700 hover:bg-zinc-600 text-white border border-zinc-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Main
            </Button>
          </div>

          {/* New Chat Button */}
          <div className="p-3  bg-zinc-800">
            <Button
              onClick={handleNewChat}
              className="w-full bg-gradient-to-r from-yellow-600 via-blue-600 to-purple-600 hover:from-yellow-700 hover:via-blue-700 hover:to-purple-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {history && history.length > 0 ? (
              history.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => router.push(`/banana-veo3/${chat.id}`)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    chat.id === id
                      ? "bg-zinc-800 text-white"
                      : "text-gray-400 hover:bg-zinc-900 hover:text-white"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {chat.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(chat.createdAt).toLocaleDateString("ru-RU")}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No chat history</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col ">
        {/* Header */}
        <div className="flex-shrink-0  bg-zinc-950" />
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="text-gray-400 hover:text-white hover:bg-zinc-800"
              >
                <Menu className="w-5 h-5" />
              </Button>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Banana className="w-5 h-5 text-yellow-500" />
                  <Video className="w-5 h-5 text-blue-500" />
                  <Zap className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-yellow-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                    Banana + VEO3
                  </h1>
                </div>
              </div>
            </div>

            <Button
              onClick={handleNewChat}
              size="sm"
              className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto ">
        <div className="w-full px-6 py-6 h-full">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-end h-full space-y-6 px-4">
              <div className="relative">
                <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-yellow-500/20 via-blue-500/20 to-purple-500/20 rounded-full" />
                <div className="relative flex items-center gap-3 p-6 bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800">
                  <Banana className="w-12 h-12 text-yellow-500" />
                  <Video className="w-12 h-12 text-blue-500" />
                  <Zap className="w-12 h-12 text-purple-500" />
                </div>
              </div>

              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                  Welcome to Banana + VEO3!
                </h2>
                <p className="text-gray-400 text-base">
                  Specialized AI for image and video generation
                </p>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
                <Card className="p-4 bg-zinc-900 border-yellow-500/20 hover:border-yellow-500/40 transition-all hover:shadow-xl hover:shadow-yellow-500/10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-yellow-500/10 rounded-lg">
                      <Banana className="w-5 h-5 text-yellow-500" />
                    </div>
                    <h4 className="font-bold text-yellow-500 text-base">
                      Banana
                    </h4>
                  </div>
                  <ul className="text-xs text-gray-300 space-y-1">
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-500 mt-0.5">⚡</span>
                      <span>Fast GPU processing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-500 mt-0.5">📈</span>
                      <span>Scalable computations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-500 mt-0.5">🤖</span>
                      <span>AI model optimization</span>
                    </li>
                  </ul>
                </Card>

                <Card className="p-4 bg-zinc-900 border-blue-500/20 hover:border-blue-500/40 transition-all hover:shadow-xl hover:shadow-blue-500/10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-blue-500/10 rounded-lg">
                      <Video className="w-5 h-5 text-blue-500" />
                    </div>
                    <h4 className="font-bold text-blue-500 text-base">
                      VEO3 Video Generation
                    </h4>
                  </div>
                  <ul className="text-xs text-gray-300 space-y-1">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">🎬</span>
                      <span>Text-to-video generation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">✨</span>
                      <span>High-quality video output</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">🎨</span>
                      <span>Multiple style support</span>
                    </li>
                  </ul>
                </Card>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message, index) => {
                // Логирование для отладки
                if (index === 0) {
                  console.log("🍌 Rendering message:", {
                    id: message.id,
                    role: message.role,
                    content: (message as any).content,
                    parts: message.parts,
                    hasContent: !!(message as any).content,
                    hasParts: !!message.parts,
                  });
                }

                return (
                  <div
                    key={message.id}
                    className={`flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-10 h-10 mt-1 flex-shrink-0 rounded-full bg-gradient-to-br from-yellow-500 via-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                        🍌
                      </div>
                    )}

                    <div
                      className={`max-w-[80%] ${
                        message.role === "user"
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl px-5 py-3.5 shadow-lg shadow-blue-500/20"
                          : "bg-zinc-900 text-gray-100 rounded-2xl px-5 py-3.5 border border-zinc-800 hover:border-zinc-700 transition-all"
                      }`}
                    >
                      <div className="whitespace-pre-wrap break-words leading-relaxed text-sm">
                        {(message as any).content ||
                          message.parts?.map((part: any, i: number) => {
                            // Поддержка разных форматов parts
                            if (part.type === "text" || part.text) {
                              return <span key={i}>{part.text}</span>;
                            }
                            return null;
                          })}
                      </div>
                    </div>

                    {message.role === "user" && (
                      <div className="w-10 h-10 mt-1 flex-shrink-0 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center text-white text-sm font-semibold shadow-lg border border-zinc-700">
                        {session?.user?.email?.[0]?.toUpperCase() || "U"}
                      </div>
                    )}
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex gap-4 justify-start animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="w-10 h-10 mt-1 flex-shrink-0 rounded-full bg-gradient-to-br from-yellow-500 via-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                    🍌
                  </div>
                  <div className="bg-zinc-900 rounded-2xl px-5 py-3.5 border border-zinc-800">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                      <span className="text-sm text-gray-400">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0  bg-zinc-950">
        <div className="w-full px-6 py-4">
          <form
            onSubmit={handleSubmit}
            className="relative"
          >
            <div className="relative">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isReadonly
                    ? "This chat is read-only"
                    : "Ask about Banana or VEO3 video generation..."
                }
                disabled={isLoading || isReadonly}
                className="min-h-[70px] pr-16 resize-none bg-zinc-900 border-2 border-zinc-800 focus:border-blue-500 rounded-2xl shadow-sm transition-all placeholder:text-gray-500 text-gray-100"
                rows={2}
              />
              <div className="absolute right-2 bottom-2">
                <Button
                  type="submit"
                  size="sm"
                  disabled={!input.trim() || isReadonly || isLoading}
                  className="h-10 w-10 p-0 rounded-xl bg-gradient-to-r from-yellow-500 via-blue-500 to-purple-500 hover:from-yellow-600 hover:via-blue-600 hover:to-purple-600 text-white disabled:opacity-50 shadow-lg shadow-blue-500/20 transition-all"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          </form>
          <div className="flex items-center justify-between mt-3 px-1">
            <p className="text-xs text-gray-500">
              <kbd className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-xs text-gray-400">
                Enter
              </kbd>{" "}
              to send,{" "}
              <kbd className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-xs text-gray-400">
                Shift+Enter
              </kbd>{" "}
              for new line
            </p>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Zap className="w-3 h-3 text-yellow-500" />
              <span>Powered by Gemini</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
