import { create } from "zustand";
import type { FabricControllerType } from "@turbo-super/features";

interface ToolbarStore {
  controller: FabricControllerType | null;
  setController: (controller: FabricControllerType) => void;
  clearController: () => void;
}

export const useToolbarStore = create<ToolbarStore>((set) => ({
  controller: null,
  setController: (controller) => set({ controller }),
  clearController: () => set({ controller: null }),
}));
