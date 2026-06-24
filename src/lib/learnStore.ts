import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useEffect, useState } from "react";
import type { ComponentId } from "./learnTypes";

type LearnState = {
  /** Selected components per scenario id. */
  selections: Record<string, ComponentId[]>;
  toggleComponent: (scenarioId: string, id: ComponentId) => void;
  addComponent: (scenarioId: string, id: ComponentId) => void;
  removeComponent: (scenarioId: string, id: ComponentId) => void;
  resetScenario: (scenarioId: string) => void;
  getSelection: (scenarioId: string) => ComponentId[];
};

export const useLearnStore = create<LearnState>()(
  persist(
    (set, get) => ({
      selections: {},
      getSelection: (scenarioId) => get().selections[scenarioId] ?? [],
      toggleComponent: (scenarioId, id) =>
        set((state) => {
          const cur = state.selections[scenarioId] ?? [];
          const next = cur.includes(id)
            ? cur.filter((c) => c !== id)
            : [...cur, id];
          return { selections: { ...state.selections, [scenarioId]: next } };
        }),
      addComponent: (scenarioId, id) =>
        set((state) => {
          const cur = state.selections[scenarioId] ?? [];
          if (cur.includes(id)) return state;
          return { selections: { ...state.selections, [scenarioId]: [...cur, id] } };
        }),
      removeComponent: (scenarioId, id) =>
        set((state) => {
          const cur = state.selections[scenarioId] ?? [];
          return {
            selections: { ...state.selections, [scenarioId]: cur.filter((c) => c !== id) },
          };
        }),
      resetScenario: (scenarioId) =>
        set((state) => {
          const next = { ...state.selections };
          delete next[scenarioId];
          return { selections: next };
        }),
    }),
    {
      name: "system-atlas-learn-v1",
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? (undefined as unknown as Storage) : window.localStorage
      ),
    }
  )
);

/** Mirror of the build store's hydration guard, for Learn Mode components. */
export function useLearnHasHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const unsub = useLearnStore.persist.onFinishHydration(() => setHydrated(true));
    if (useLearnStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);
  return hydrated;
}
