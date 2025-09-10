"use client";

import { IFileRead } from "@turbo-super/api";
import { create } from "zustand";

type SetState = Omit<ProjectVideoRenderStore, "setState">;

type ProjectVideoRenderStore = {
  progress: null | number;
  result: IFileRead | null;
  setState: (state: Partial<SetState>) => void;
};

export const useProjectVideoRenderStore = create<ProjectVideoRenderStore>(
  (set) => ({
    progress: null,
    result: null,
    setState: (state) => {
      set(state);
    },
  })
);
