"use client";

import React, { useState, useRef } from "react";
import { Button } from "@turbo-super/ui";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { useTranslation } from "@/hooks/use-translation";

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  onImageRemove: () => void;
  selectedImage: File | null;
  className?: string;
  required?: boolean;
  title?: string;
  description?: string;
  locale?: string;
}

export function ImageUpload({
  onImageSelect,
  onImageRemove,
  selectedImage,
  className = "",
  required = false,
  title = "Upload Reference Image",
  description = "Optional",
  locale = "en",
}: ImageUploadProps) {
  const { t } = useTranslation(locale as any);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files?.[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        onImageSelect(file);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      onImageSelect(e.target.files[0]);
    }
  };

  const handleRemoveImage = () => {
    onImageRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-sm font-medium text-muted-foreground">
        {title} {!required && `(${description})`}
        {required && <span className="text-red-500 ml-1">*</span>}
      </div>

      {!selectedImage ? (
        <div
          role="button"
          tabIndex={0}
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? "border-green-400 bg-green-950/20"
              : "border-muted-foreground/30 hover:border-green-400/50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="space-y-2">
            <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-green-400">
                {t("video_generator.click_to_upload", "Click to upload")}
              </span>{" "}
              {t("video_generator.or_drag_and_drop", "or drag and drop")}
            </div>
            <div className="text-xs text-muted-foreground">
              {t("video_generator.file_formats", "PNG, JPG, GIF up to 10MB")}
            </div>
          </div>
        </div>
      ) : (
        <div className="relative border border-green-500/30 rounded-lg p-4 bg-green-950/20">
          <div className="flex items-center gap-3">
            <ImageIcon className="h-8 w-8 text-green-400" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-green-300 truncate">
                {selectedImage.name}
              </div>
              <div className="text-xs text-muted-foreground">
                {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveImage}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-3">
            <Image
              src={URL.createObjectURL(selectedImage)}
              alt="Preview"
              width={400}
              height={128}
              className="w-full h-32 object-cover rounded border border-green-500/20"
            />
          </div>
        </div>
      )}
    </div>
  );
}
