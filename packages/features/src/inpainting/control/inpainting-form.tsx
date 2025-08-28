"use client";

import type { Canvas } from "fabric";
import type { FC } from "react";
import { useEffect, useState } from "react";
import { cursorName } from "./inpainting-tools";
import { Textarea } from "@turbo-super/ui";

type Props = {
  canvas?: Canvas | null;
  onComplete?: (prompt: string, mask: File, generationConfig: string) => void;
  loading?: boolean;
  initialPrompt?: string;
};

export const InpaintingForm: FC<Props> = ({
  canvas,
  onComplete,
  loading = false,
  initialPrompt = "",
}) => {
  const [disabled, setDisabled] = useState(true);
  const [prompt, setPrompt] = useState(initialPrompt);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!canvas) return;

    const updateDisable = () => {
      const filteredCanvas = canvas
        .getObjects()
        .filter((obj) => obj.get("name") !== cursorName);
      setDisabled(!filteredCanvas.length);
    };

    canvas.on("object:added", updateDisable);
    canvas.on("object:removed", updateDisable);

    return () => {
      canvas.off("object:added", updateDisable);
      canvas.off("object:removed", updateDisable);
      setDisabled(true);
    };
  }, [canvas]);

  const handleClick = () => {
    if (!canvas || !onComplete) return;

    try {
      canvas.getElement().toBlob((blob) => {
        if (!blob) {
          setError("Ошибка создания маски");
          return;
        }

        onComplete(
          prompt.trim(),
          new File([blob], "mask.png", { type: "image/png" }),
          "comfyui/flux/inpainting"
        );
      }, "image/png");
    } catch (error) {
      setError("Ошибка обработки");
      console.error("Inpainting error:", error);
    }
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    if (error) {
      setError("");
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 justify-end p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          Prompt
        </label>
        <Textarea
          className="w-full resize-none border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          value={prompt}
          onChange={handlePromptChange}
          placeholder="Опишите, что должно появиться в закрашенной области..."
          autoFocus
          rows={4}
        />
        {error && (
          <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}
      </div>

      <button
        disabled={disabled || loading}
        onClick={handleClick}
        className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 dark:bg-blue-500 dark:hover:bg-blue-600 dark:disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors disabled:cursor-not-allowed shadow-sm"
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Генерируем...
          </div>
        ) : (
          "Inpaint"
        )}
      </button>
    </div>
  );
};
