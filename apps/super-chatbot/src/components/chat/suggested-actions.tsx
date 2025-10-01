"use client";

import { motion } from "framer-motion";
import { memo } from "react";
import type { VisibilityType } from "../shared/visibility-selector";

import { Button } from "@turbo-super/ui";
interface SuggestedActionsProps {
  chatId: string;
  append: (message: any) => void;
  selectedVisibilityType: VisibilityType;
  onAppend?: (message: any) => void; // Добавляем callback для обновления URL
}

function PureSuggestedActions({
  chatId,
  append,
  selectedVisibilityType,
  onAppend,
}: SuggestedActionsProps) {
  const suggestedActions = [
    {
      title: "Generate an image",
      label: "of a futuristic cityscape at sunset",
      action:
        "Create a cinematic wide shot of a futuristic cityscape at sunset with flying cars and neon lights, photorealistic style",
    },
    {
      title: "Create a video",
      label: "showing ocean waves at the beach",
      action:
        "Generate a 5-second video of ocean waves gently crashing on a sandy beach at golden hour, cinematic style, 30fps",
    },
    {
      title: "Write a screenplay",
      label: "about AI and human friendship",
      action:
        "Write a 3-page comedy screenplay about an AI assistant and a human becoming unlikely friends while working on a creative project",
    },
    {
      title: "Design a storyboard",
      label: "for a product commercial",
      action:
        "Create a 6-panel storyboard for a 30-second commercial showing someone using a smartphone app, include camera angles and scene descriptions",
    },
  ];

  return (
    <div
      data-testid="suggested-actions"
      className="grid sm:grid-cols-2 gap-2 w-full"
    >
      {suggestedActions.map((suggestedAction, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05 * index }}
          key={`suggested-action-${suggestedAction.title}-${index}`}
          className={index > 1 ? "hidden sm:block" : "block"}
        >
          <Button
            variant="ghost"
            onClick={async () => {
              // Обновляем URL при добавлении сообщения
              if (onAppend) {
                onAppend({
                  role: "user",
                  content: suggestedAction.action,
                });
              } else {
                append({
                  role: "user",
                  content: suggestedAction.action,
                });
              }
            }}
            className="text-left border rounded-xl px-4 py-3.5 text-sm flex-1 gap-1 sm:flex-col w-full h-auto justify-start items-start"
          >
            <span className="font-medium">{suggestedAction.title}</span>
            <span className="text-muted-foreground">
              {suggestedAction.label}
            </span>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

export const SuggestedActions = memo(
  PureSuggestedActions,
  (prevProps, nextProps) => {
    if (prevProps.chatId !== nextProps.chatId) return false;
    if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType)
      return false;

    return true;
  }
);
