"use client";

import { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from "@turbo-super/ui";
import {
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileImage,
  Trash2,
} from "lucide-react";

interface UploadedFile {
  id: string;
  file: File;
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
  error?: string;
  result?: any;
}

export default function TestUploadPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Проверка размера файла (максимум 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { valid: false, error: "Файл слишком большой (максимум 10MB)" };
    }

    // Проверка типа файла
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: "Неподдерживаемый тип файла. Разрешены только PNG, JPEG, WebP",
      };
    }

    return { valid: true };
  };

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: UploadedFile[] = [];

    Array.from(selectedFiles).forEach((file) => {
      const validation = validateFile(file);

      if (validation.valid) {
        newFiles.push({
          id: Math.random().toString(36).substr(2, 9),
          file,
          status: "pending",
          progress: 0,
        });
      } else {
        // Показываем ошибку валидации
        console.error(
          `Файл ${file.name} не прошел валидацию:`,
          validation.error
        );
      }
    });

    setFiles((prev) => [...prev, ...newFiles]);
  };

  // Простой метод загрузки файлов через fetch
  const uploadFile = async (uploadedFile: UploadedFile) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === uploadedFile.id
          ? { ...f, status: "uploading", progress: 0 }
          : f
      )
    );

    try {
      console.log("🚀 Starting upload for file:", uploadedFile.file.name);

      // Логируем детали файла
      console.log("📁 File details:", {
        name: uploadedFile.file.name,
        size: uploadedFile.file.size,
        type: uploadedFile.file.type,
        lastModified: uploadedFile.file.lastModified,
      });

      // Создаем FormData как в рабочих примерах
      const formData = new FormData();
      formData.append("payload", uploadedFile.file);
      formData.append("type", "image");

      console.log("📤 FormData created, making fetch request...");

      // Логируем содержимое FormData для отладки
      console.log("📤 FormData entries:");
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(
            `  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`
          );
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }

      // Простой fetch запрос через proxy
      const response = await fetch("/api/proxy/file/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Upload error response:", {
          status: response.status,
          statusText: response.statusText,
          errorData,
        });
        throw new Error(
          `HTTP ${response.status}: ${errorData.error || response.statusText}`
        );
      }

      const result = await response.json();
      console.log("✅ Upload successful:", result);

      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadedFile.id
            ? { ...f, status: "success", progress: 100, result }
            : f
        )
      );
    } catch (error) {
      console.error("❌ Upload failed:", error);
      console.error("❌ Error details:", {
        name: (error as any)?.constructor?.name,
        message: (error as any)?.message,
        stack: (error as any)?.stack,
        type: typeof error,
      });
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadedFile.id
            ? {
                ...f,
                status: "error",
                error: error instanceof Error ? error.message : String(error),
              }
            : f
        )
      );
    }
  };

  const uploadAllFiles = async () => {
    const pendingFiles = files.filter((f) => f.status === "pending");
    for (const file of pendingFiles) {
      await uploadFile(file);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  };

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const clearAll = () => {
    setFiles([]);
  };

  const getStatusIcon = (status: UploadedFile["status"]) => {
    switch (status) {
      case "pending":
        return <FileImage className="w-5 h-5 text-gray-500" />;
      case "uploading":
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: UploadedFile["status"]) => {
    switch (status) {
      case "pending":
        return "bg-gray-100 dark:bg-gray-800";
      case "uploading":
        return "bg-blue-100 dark:bg-blue-900/20";
      case "success":
        return "bg-green-100 dark:bg-green-900/20";
      case "error":
        return "bg-red-100 dark:bg-red-900/20";
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-6 h-6" />
            Тест загрузки файлов
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Загрузка файлов */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
            <input
              type="file"
              multiple
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center gap-4"
            >
              <Upload className="w-12 h-12 text-gray-400" />
              <div>
                <p className="text-lg font-medium">
                  Выберите файлы для загрузки
                </p>
                <p className="text-sm text-gray-500">
                  Поддерживаются PNG, JPEG, WebP (максимум 10MB)
                </p>
              </div>
              <Button variant="outline">Выбрать файлы</Button>
            </label>
          </div>

          {/* Управление */}
          {files.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={uploadAllFiles}
                disabled={!files.some((f) => f.status === "pending")}
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Загрузить все
              </Button>
              <Button
                onClick={clearAll}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Очистить все
              </Button>
            </div>
          )}

          {/* Список файлов */}
          {files.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Загруженные файлы:</h3>
              {files.map((file) => (
                <Card
                  key={file.id}
                  className={getStatusColor(file.status)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        {getStatusIcon(file.status)}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {file.file.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {(file.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          {file.status === "uploading" && (
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${file.progress}%` }}
                              />
                            </div>
                          )}
                          {file.error && (
                            <p className="text-sm text-red-500 mt-1">
                              {file.error}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            file.status === "success"
                              ? "default"
                              : file.status === "error"
                                ? "destructive"
                                : file.status === "uploading"
                                  ? "secondary"
                                  : "outline"
                          }
                        >
                          {file.status === "pending" && "Ожидает"}
                          {file.status === "uploading" && "Загружается"}
                          {file.status === "success" && "Успешно"}
                          {file.status === "error" && "Ошибка"}
                        </Badge>
                        {file.status === "pending" && (
                          <Button
                            size="sm"
                            onClick={() => uploadFile(file)}
                            className="flex items-center gap-1"
                          >
                            <Upload className="w-3 h-3" />
                            Загрузить
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFile(file.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Отладочная информация */}
          <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Отладочная информация:</h3>
            <div className="text-sm space-y-1">
              <p>• Используется простой fetch запрос</p>
              <p>• FormData содержит: payload (файл) + type (image)</p>
              <p>• Запрос идет через /api/proxy/file/upload</p>
              <p>• Proxy обрабатывает FormData правильно</p>
              <p>• Подробное логирование FormData в консоли</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
