import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useEffect, useState } from "react";
import type { ComponentId } from "./learnTypes";

/** Where the user is in a scenario's guided course. */
export type ScenarioStep = "overview" | { stage: number } | "summary";

type LearnState = {
  /** Selected components per scenario id. */
  selections: Record<string, ComponentId[]>;
  /** Serialized current step per scenario id, so a scenario resumes. */
  progress: Record<string, string>;
  toggleComponent: (scenarioId: string, id: ComponentId) => void;
  addComponent: (scenarioId: string, id: ComponentId) => void;
  removeComponent: (scenarioId: string, id: ComponentId) => void;
  resetScenario: (scenarioId: string) => void;
  getSelection: (scenarioId: string) => ComponentId[];
  setStep: (scenarioId: string, step: string) => void;
};

export const useLearnStore = create<LearnState>()(
  persist(
    (set, get) => ({
      selections: {},
      progress: {},
      getSelection: (scenarioId) => get().selections[scenarioId] ?? [],
      setStep: (scenarioId, step) =>
        set((state) => ({ progress: { ...state.progress, [scenarioId]: step } })),
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
          const nextProgress = { ...state.progress };
          delete nextProgress[scenarioId];
          return { selections: next, progress: nextProgress };
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
