import { create } from "zustand";
import type { FabricController } from "@turbo-super/features";

interface ToolbarStore {
  controller: FabricController | null;
  setController: (controller: FabricController) => void;
  clearController: () => void;
}

export const useToolbarStore = create<ToolbarStore>((set) => ({
  controller: null,
  setController: (controller) => set({ controller }),
  clearController: () => set({ controller: null }),
}));
