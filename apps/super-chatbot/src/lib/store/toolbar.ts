import { create } from "zustand";

interface ToolbarStore {
  controller: any | null;
  setController: (controller: any) => void;
  clearController: () => void;
}

export const useToolbarStore = create<ToolbarStore>((set) => ({
  controller: null,
  setController: (controller) => set({ controller }),
  clearController: () => set({ controller: null }),
}));
