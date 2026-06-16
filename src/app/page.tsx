"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  LayoutTemplate,
  Upload,
  Trash2,
  ArrowRight,
  Boxes,
  Sparkles,
  KeyRound,
  ExternalLink,
  PencilRuler,
  Scale,
  FileText,
  X,
  HardDrive,
} from "lucide-react";
import { useAtlasStore, useHasHydrated } from "@/lib/store";
import { BLUEPRINTS, BLUEPRINT_GROUPS } from "@/lib/blueprints";
import { Button, Panel, Chip } from "@/components/ui/primitives";
import { ExampleArchitecture } from "@/components/marketing/ExampleArchitecture";

export default function DashboardPage() {
  const hydrated = useHasHydrated();
  const router = useRouter();
  const projects = useAtlasStore((s) => s.projects);
  const createProject = useAtlasStore((s) => s.createProject);
  const importProject = useAtlasStore((s) => s.importProject);
  const deleteProject = useAtlasStore((s) => s.deleteProject);
  const geminiApiKey = useAtlasStore((s) => s.geminiApiKey);

  const [showBlueprints, setShowBlueprints] = useState(false);
  const [naming, setNaming] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function createNamed(name: string) {
    const id = createProject({ name });
    router.push(`/project/${id}`);
  }

  async function onImportFile(file: File) {
    setImportError(null);
    try {
      const text = await file.text();
      const id = importProject(JSON.parse(text));
      router.push(`/project/${id}`);
    } catch {
      setImportError("That file could not be read as a System Atlas project.");
    }
  }

  return (
    <main className="min-h-screen bg-gradient-dark">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <header className="mb-12 flex flex-wrap items-end justify-between gap-6 border-b border-navy-700 pb-10">
          <div>
            <div className="eyebrow mb-3 flex items-center gap-2 text-brand-cyan">
              <Boxes className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase">
                System Atlas
              </span>
            </div>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Your <span className="gradient-text">architectures</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-slate-500">
              Turn product requirements into system architecture, trade-off
              decisions, and implementation-ready design docs.
            </p>
            <p className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-navy-700 bg-navy-800/60 px-3 py-1 text-xs text-slate-500">
              <HardDrive className="h-3.5 w-3.5" />
              Stored in your browser. Export a project to keep or move it.
            </p>
          </div>
          {hydrated && projects.length > 0 && (
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => setNaming(true)}>
                <Plus className="h-4 w-4" /> New architecture
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowBlueprints(true)}
              >
                <LayoutTemplate className="h-4 w-4" /> From blueprint
              </Button>
              <Button
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" /> Import JSON
              </Button>
              <Button variant="secondary" onClick={() => setShowKey(true)}>
                <Sparkles className="h-4 w-4" />
                {geminiApiKey ? "AI connected" : "Connect AI"}
              </Button>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onImportFile(file);
              e.target.value = "";
            }}
          />
        </header>

        {importError && (
          <p className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
            {importError}
          </p>
        )}

        {!hydrated ? (
          <p className="text-slate-500">Loading…</p>
        ) : projects.length === 0 ? (
          <Panel className="overflow-hidden">
            {/* Lead with the output: a real generated architecture */}
            <div className="border-b border-navy-700 p-6 sm:p-8">
              <div className="eyebrow mb-3 flex items-center gap-2 text-brand-cyan">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  Example output
                </span>
              </div>
              <h2 className="text-2xl font-semibold tracking-tight">
                From a one-paragraph brief to a design you can defend
              </h2>
              <p className="mt-2 max-w-2xl text-slate-500">
                Here is a URL shortener System Atlas generated: a typed
                component diagram, the trade-off behind each choice, and a
                decision record. Yours exports to Markdown, JSON, or PNG.
              </p>
              <div className="mt-5">
                <ExampleArchitecture />
              </div>
            </div>

            {/* How it works + start */}
            <div className="p-6 sm:p-8">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                How it works
              </p>
              <ol className="grid gap-4 text-left sm:grid-cols-3">
                {ONBOARDING_STEPS.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <li
                      key={step.title}
                      className="rounded-xl border border-navy-700 bg-navy-900/40 p-4"
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-xs font-semibold text-white">
                          {i + 1}
                        </span>
                        <Icon className="h-4 w-4 text-brand-cyan" />
                        <span className="font-semibold">{step.title}</span>
                      </div>
                      <p className="text-sm text-slate-500">{step.body}</p>
                    </li>
                  );
                })}
              </ol>

              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <button
                    onClick={() => setShowBlueprints(true)}
                    className="transition hover:text-ink"
                  >
                    Browse blueprints
                  </button>
                  <span aria-hidden className="text-navy-600">
                    ·
                  </span>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="transition hover:text-ink"
                  >
                    Import a project
                  </button>
                  <span aria-hidden className="text-navy-600">
                    ·
                  </span>
                  <button
                    onClick={() => setShowKey(true)}
                    className="transition hover:text-ink"
                  >
                    {geminiApiKey ? "AI connected" : "Connect AI"}
                  </button>
                </div>
                <Button
                  onClick={() => setNaming(true)}
                  className="px-6 py-3 text-base"
                >
                  <Plus className="h-5 w-5" /> Start with your own brief
                </Button>
              </div>
            </div>
          </Panel>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <Panel
                key={p.id}
                className="group flex flex-col p-5 transition hover:border-brand-blue/50"
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <h2 className="text-lg font-semibold leading-tight">
                    {p.name}
                  </h2>
                  <Chip label={p.status} />
                </div>
                <p className="mb-4 line-clamp-2 min-h-[2.5rem] text-sm text-slate-500">
                  {p.description || "No description yet."}
                </p>
                <div className="mb-4 flex gap-4 text-xs text-slate-500">
                  <span>{p.nodes.length} components</span>
                  <span>{p.decisions.length} decisions</span>
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <Button
                    variant="ghost"
                    onClick={() => router.push(`/project/${p.id}`)}
                  >
                    Open <ArrowRight className="h-4 w-4" />
                  </Button>
                  <button
                    title="Delete project"
                    onClick={() => {
                      if (
                        window.confirm(`Delete "${p.name}"? This cannot be undone.`)
                      ) {
                        deleteProject(p.id);
                      }
                    }}
                    className="rounded-md p-2 text-slate-500 transition hover:bg-red-500/10 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </Panel>
            ))}
          </div>
        )}
      </div>

      {showBlueprints && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
          onClick={() => setShowBlueprints(false)}
        >
          <Panel className="flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden bg-navy-900">
            <div
              className="flex min-h-0 flex-1 flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 border-b border-navy-700 p-6 pb-4">
                <div>
                  <h2 className="text-xl font-bold">Start from a blueprint</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Load a reference architecture you can refine - swap any
                    component for an alternative from its inspector.
                  </p>
                </div>
                <button
                  onClick={() => setShowBlueprints(false)}
                  title="Close"
                  aria-label="Close"
                  className="-mr-1 -mt-1 shrink-0 rounded-md p-2 text-slate-500 transition hover:bg-navy-800 hover:text-ink"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-6 thin-scroll">
                {BLUEPRINT_GROUPS.map((group) => {
                  const items = BLUEPRINTS.filter((t) => t.group === group);
                  if (items.length === 0) return null;
                  return (
                    <div key={group} className="mb-5 last:mb-0">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {group === "Pattern"
                          ? "Industry patterns"
                          : "Product use cases"}
                      </p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {items.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => {
                              const id = createProject(t.build());
                              router.push(`/project/${id}`);
                            }}
                            className="rounded-lg border border-navy-700 bg-navy-800/60 p-4 text-left transition hover:border-brand-blue/50"
                          >
                            <p className="font-semibold">{t.name}</p>
                            <p className="mt-1 text-sm text-slate-500">
                              {t.summary}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Panel>
        </div>
      )}

      {naming && (
        <NameModal
          onCancel={() => setNaming(false)}
          onCreate={(name) => {
            setNaming(false);
            createNamed(name);
          }}
        />
      )}

      {showKey && <GeminiKeyModal onClose={() => setShowKey(false)} />}
    </main>
  );
}

const ONBOARDING_STEPS: {
  icon: typeof PencilRuler;
  title: string;
  body: string;
}[] = [
  {
    icon: PencilRuler,
    title: "Design",
    body: "Drop components on a canvas or start from a reference blueprint.",
  },
  {
    icon: Scale,
    title: "Decide",
    body: "Weigh trade-offs with rules of thumb and side-by-side comparisons.",
  },
  {
    icon: FileText,
    title: "Document",
    body: "Export a Markdown, JSON, or PNG design doc to share.",
  },
];

const KEY_URL = "https://aistudio.google.com/app/apikey";

function GeminiKeyModal({ onClose }: { onClose: () => void }) {
  const geminiApiKey = useAtlasStore((s) => s.geminiApiKey);
  const setGeminiApiKey = useAtlasStore((s) => s.setGeminiApiKey);
  const [draft, setDraft] = useState(geminiApiKey);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
      onClick={onClose}
    >
      <Panel className="w-full max-w-md bg-navy-900 p-6">
        <div onClick={(e) => e.stopPropagation()}>
          <div className="mb-1 flex items-center gap-2 text-brand-cyan">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wide">
              AI assistant
            </span>
          </div>
          <h2 className="mb-2 text-xl font-bold">Connect a free Gemini key</h2>
          <p className="mb-4 text-sm text-slate-500">
            The assistant runs on Google Gemini using your own free API key,
            stored only in this browser and called directly - no backend, no
            secrets on a server we run.
          </p>
          <a
            href={KEY_URL}
            target="_blank"
            rel="noreferrer"
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-brand-cyan hover:underline"
          >
            <KeyRound className="h-4 w-4" /> Get a free Gemini key{" "}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <input
            autoFocus
            type="password"
            value={draft}
            placeholder="Paste your Gemini API key"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setGeminiApiKey(draft.trim());
                onClose();
              }
              if (e.key === "Escape") onClose();
            }}
            className="w-full rounded-lg border border-navy-700 bg-navy-900 px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-blue"
          />
          <div className="mt-5 flex items-center justify-between gap-2">
            {geminiApiKey ? (
              <button
                onClick={() => {
                  setGeminiApiKey("");
                  setDraft("");
                }}
                className="text-xs text-slate-500 hover:text-red-500"
              >
                Disconnect
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setGeminiApiKey(draft.trim());
                  onClose();
                }}
              >
                Save key
              </Button>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}

function NameModal({
  onCreate,
  onCancel,
}: {
  onCreate: (name: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("Untitled architecture");
  function submit() {
    const value = name.trim();
    if (!value) return;
    onCreate(value);
  }
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
      onClick={onCancel}
    >
      <Panel
        className="w-full max-w-md bg-navy-900 p-6"
      >
        <div onClick={(e) => e.stopPropagation()}>
          <div className="mb-1 flex items-center gap-2 text-brand-cyan">
            <Plus className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wide">
              New architecture
            </span>
          </div>
          <h2 className="mb-1 text-xl font-bold">Name your architecture</h2>
          <p className="mb-4 text-sm text-slate-500">
            You will land in the Brief next - answer a few questions and Atlas
            generates a starting diagram.
          </p>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onFocus={(e) => e.target.select()}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
              if (e.key === "Escape") onCancel();
            }}
            className="w-full rounded-lg border border-navy-700 bg-navy-900 px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-blue"
          />
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
            <Button disabled={!name.trim()} onClick={submit}>
              Continue to Brief <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Panel>
    </div>
  );
}
