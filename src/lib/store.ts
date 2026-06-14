import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useEffect, useState } from "react";
import { createId } from "./id";
import {
  type Project,
  type ArchitectureBrief,
  type ArchitectureFlowNode,
  type ArchitectureFlowEdge,
  type ArchitectureNodeData,
  type Decision,
  type ProjectStatus,
  type Suggestion,
  type ReferenceImage,
  emptyBrief,
} from "./types";

export type NewProjectInput = {
  name: string;
  description?: string;
  brief?: ArchitectureBrief;
  nodes?: ArchitectureFlowNode[];
  edges?: ArchitectureFlowEdge[];
  decisions?: Decision[];
};

function now() {
  return new Date().toISOString();
}

/**
 * localStorage wrapper that won't crash the app when the quota is exceeded
 * (e.g. several projects each holding a wireframe image). On a failed write the
 * in-memory state still updates; we just warn and fire an event the UI can show,
 * rather than letting the persist middleware throw mid-update.
 */
function guardedLocalStorage(): Storage | undefined {
  if (typeof window === "undefined") return undefined;
  const ls = window.localStorage;
  return {
    getItem: (k) => ls.getItem(k),
    removeItem: (k) => ls.removeItem(k),
    get length() {
      return ls.length;
    },
    key: (i) => ls.key(i),
    clear: () => ls.clear(),
    setItem: (k, v) => {
      try {
        ls.setItem(k, v);
      } catch (err) {
        console.warn(
          "[system-atlas] Could not save to localStorage - storage is full. " +
            "Your work stays in this session but won't persist on reload. " +
            "Remove a large wireframe image or export to JSON.",
          err
        );
        window.dispatchEvent(new CustomEvent("atlas:storage-full"));
      }
    },
  } as Storage;
}

type AtlasState = {
  projects: Project[];
  /** User's own free Gemini API key (browser-side, bring-your-own-key). */
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;

  createProject: (input: NewProjectInput) => string;
  importProject: (raw: unknown) => string;
  deleteProject: (id: string) => void;
  getProject: (id: string) => Project | undefined;

  updateProject: (id: string, patch: Partial<Omit<Project, "id">>) => void;
  setStatus: (id: string, status: ProjectStatus) => void;
  updateBrief: (id: string, brief: ArchitectureBrief) => void;

  setGraph: (
    id: string,
    nodes: ArchitectureFlowNode[],
    edges: ArchitectureFlowEdge[]
  ) => void;
  updateNodeData: (
    id: string,
    nodeId: string,
    patch: Partial<ArchitectureNodeData>
  ) => void;

  addDecision: (id: string, decision: Decision) => void;
  updateDecision: (id: string, decision: Decision) => void;
  removeDecision: (id: string, decisionId: string) => void;

  setReferenceImage: (id: string, image: ReferenceImage | null) => void;
  addSuggestion: (id: string, suggestion: Suggestion) => void;
  addSuggestions: (id: string, suggestions: Suggestion[]) => void;
  removeSuggestion: (id: string, suggestionId: string) => void;
  /** Drops all AI-sourced suggestions (user notes are kept) before a re-run. */
  clearAiSuggestions: (id: string) => void;
};

function mutate(
  set: (fn: (state: AtlasState) => Partial<AtlasState>) => void,
  id: string,
  updater: (project: Project) => Project
) {
  set((state) => ({
    projects: state.projects.map((p) =>
      p.id === id ? { ...updater(p), updatedAt: now() } : p
    ),
  }));
}

export const useAtlasStore = create<AtlasState>()(
  persist(
    (set, get) => ({
      projects: [],
      geminiApiKey: "",

      setGeminiApiKey: (key) => set({ geminiApiKey: key.trim() }),

      createProject: (input) => {
        const id = createId("proj");
        const project: Project = {
          id,
          name: input.name.trim() || "Untitled architecture",
          description: input.description ?? "",
          status: "draft",
          createdAt: now(),
          updatedAt: now(),
          brief: input.brief ?? emptyBrief(),
          nodes: input.nodes ?? [],
          edges: input.edges ?? [],
          decisions: input.decisions ?? [],
          suggestions: [],
          referenceImage: null,
        };
        set((state) => ({ projects: [project, ...state.projects] }));
        return id;
      },

      importProject: (raw) => {
        const data = raw as Partial<Project>;
        if (!data || typeof data !== "object") {
          throw new Error("Invalid project file.");
        }
        const id = createId("proj");
        const project: Project = {
          id,
          name: (data.name || "Imported architecture").toString(),
          description: data.description?.toString() ?? "",
          status: (data.status as ProjectStatus) ?? "draft",
          createdAt: now(),
          updatedAt: now(),
          brief: { ...emptyBrief(), ...(data.brief ?? {}) },
          nodes: Array.isArray(data.nodes) ? data.nodes : [],
          edges: Array.isArray(data.edges) ? data.edges : [],
          decisions: Array.isArray(data.decisions) ? data.decisions : [],
          suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
          referenceImage: data.referenceImage ?? null,
        };
        set((state) => ({ projects: [project, ...state.projects] }));
        return id;
      },

      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        })),

      getProject: (id) => get().projects.find((p) => p.id === id),

      updateProject: (id, patch) => mutate(set, id, (p) => ({ ...p, ...patch })),

      setStatus: (id, status) => mutate(set, id, (p) => ({ ...p, status })),

      updateBrief: (id, brief) => mutate(set, id, (p) => ({ ...p, brief })),

      setGraph: (id, nodes, edges) =>
        mutate(set, id, (p) => ({ ...p, nodes, edges })),

      updateNodeData: (id, nodeId, patch) =>
        mutate(set, id, (p) => ({
          ...p,
          nodes: p.nodes.map((n) =>
            n.id === nodeId ? { ...n, data: { ...n.data, ...patch } } : n
          ),
        })),

      addDecision: (id, decision) =>
        mutate(set, id, (p) => ({ ...p, decisions: [decision, ...p.decisions] })),

      updateDecision: (id, decision) =>
        mutate(set, id, (p) => ({
          ...p,
          decisions: p.decisions.map((d) =>
            d.id === decision.id ? decision : d
          ),
        })),

      removeDecision: (id, decisionId) =>
        mutate(set, id, (p) => ({
          ...p,
          decisions: p.decisions.filter((d) => d.id !== decisionId),
        })),

      setReferenceImage: (id, image) =>
        mutate(set, id, (p) => ({ ...p, referenceImage: image })),

      addSuggestion: (id, suggestion) =>
        mutate(set, id, (p) => ({
          ...p,
          suggestions: [suggestion, ...(p.suggestions ?? [])],
        })),

      addSuggestions: (id, suggestions) =>
        mutate(set, id, (p) => ({
          ...p,
          suggestions: [...suggestions, ...(p.suggestions ?? [])],
        })),

      removeSuggestion: (id, suggestionId) =>
        mutate(set, id, (p) => ({
          ...p,
          suggestions: (p.suggestions ?? []).filter(
            (s) => s.id !== suggestionId
          ),
        })),

      clearAiSuggestions: (id) =>
        mutate(set, id, (p) => ({
          ...p,
          suggestions: (p.suggestions ?? []).filter((s) => s.source !== "ai"),
        })),
    }),
    {
      name: "system-atlas-v1",
      storage: createJSONStorage(() => guardedLocalStorage() ?? localStorage),
      version: 2,
      // v1 projects predate suggestions/referenceImage; backfill so reads are safe.
      migrate: (persisted, version) => {
        const state = persisted as AtlasState | undefined;
        if (!state) return persisted as AtlasState;
        if (version < 2) {
          return {
            ...state,
            geminiApiKey: state.geminiApiKey ?? "",
            projects: (state.projects ?? []).map((p) => ({
              ...p,
              suggestions: p.suggestions ?? [],
              referenceImage: p.referenceImage ?? null,
            })),
          };
        }
        return state;
      },
    }
  )
);

/**
 * Guards against hydration mismatches: the persisted store only exists in the
 * browser, so components gate their first render until rehydration finishes.
 */
export function useHasHydrated(): boolean {
  // Start false on both server and client so the first render matches, then
  // flip true once the persisted store has rehydrated from localStorage.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const unsub = useAtlasStore.persist.onFinishHydration(() =>
      setHydrated(true)
    );
    if (useAtlasStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);
  return hydrated;
}
