"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  LayoutTemplate,
  Upload,
  Trash2,
  ArrowRight,
  Hammer,
  HardDrive,
  KeyRound,
  ExternalLink,
  X,
} from "lucide-react";
import { useAtlasStore, useHasHydrated } from "@/lib/store";
import { BLUEPRINTS, BLUEPRINT_GROUPS } from "@/lib/blueprints";
import { Button, Panel, Chip, ConfirmDialog } from "@/components/ui/primitives";
import { TopNav } from "@/components/nav/TopNav";

function AiConnectMark({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 3v4M10 3v4M5 7h6v3a3 3 0 0 1-6 0V7zM8 13v2.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 15.5h5.5M13.5 7.5H17M13.5 12H17"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="17" cy="7.5" r="1.5" fill="currentColor" />
      <circle cx="17" cy="12" r="1.5" fill="currentColor" />
      <circle cx="13.5" cy="15.5" r="1.5" fill="currentColor" />
    </svg>
  );
}

export default function BuildDashboardPage() {
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
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
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

  const projectToDelete = deleteProjectId
    ? projects.find((project) => project.id === deleteProjectId)
    : null;

  return (
    <main className="min-h-screen bg-gradient-dark">
      <TopNav />
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-12">
        <header className="mb-10 border-b border-navy-700 pb-8">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <div className="max-w-3xl">
              <div className="eyebrow mb-4 flex items-center gap-3 text-brand-cyan">
                <Hammer className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-[0.32em]">
                  Build Mode
                </span>
              </div>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Plan real <span className="text-brand-cyan">architectures</span>
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-500">
                Turn a project brief into a recommended starter architecture,
                review it for production risk, and export an implementation-ready
                spec.
              </p>
              <p className="mt-6 inline-flex max-w-full items-center gap-2 rounded-full border border-navy-700 bg-navy-900/45 px-4 py-2 text-sm text-slate-500">
                <HardDrive className="h-4 w-4 shrink-0" />
                <span>Stored in your browser. Export a project to keep or move it.</span>
              </p>
            </div>
            <div className="flex w-full flex-wrap justify-start gap-2 lg:w-auto lg:justify-end">
              <Button onClick={() => setNaming(true)} className="min-w-40">
                <Plus className="h-4 w-4" /> New architecture
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowBlueprints(true)}
                className="min-w-36"
              >
                <LayoutTemplate className="h-4 w-4" /> Browse templates
              </Button>
              <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4" /> Import JSON
              </Button>
              <Button variant="secondary" onClick={() => setShowKey(true)}>
                <AiConnectMark className="h-4 w-4" />
                {geminiApiKey ? "AI connected" : "Connect AI"}
              </Button>
            </div>
          </div>
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
          <Panel className="p-10 sm:p-12" aria-busy="true">
            <div className="mx-auto max-w-2xl animate-pulse space-y-4">
              <div className="h-7 w-56 rounded bg-navy-700/70" />
              <div className="h-4 w-full rounded bg-navy-700/50" />
              <div className="h-4 w-3/4 rounded bg-navy-700/50" />
              <div className="mt-2 h-32 w-full rounded-md bg-navy-700/30" />
            </div>
          </Panel>
        ) : projects.length === 0 ? (
          <Panel className="overflow-hidden">
            <div className="p-6 sm:p-8">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-cyan">
                New here?
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                From a one-paragraph brief to a design you can defend
              </h2>
              <p className="mt-2 max-w-2xl text-slate-600">
                Describe what you&apos;re building, get a recommended starter
                architecture, harden it with a production-risk review, and export
                a spec to Markdown, JSON, or PNG.
              </p>
              <ol className="mt-6 grid gap-4 text-left sm:grid-cols-3">
                {ONBOARDING_STEPS.map((step, i) => (
                  <li
                    key={step.title}
                    className="rounded-md border border-navy-700 bg-navy-900 p-4"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-brand-blue font-mono text-xs font-semibold text-white">
                        {i + 1}
                      </span>
                      <span className="font-semibold">{step.title}</span>
                    </div>
                    <p className="text-sm text-slate-600">{step.body}</p>
                  </li>
                ))}
              </ol>
              <div className="mt-8 flex flex-wrap justify-end gap-2">
                <Button variant="secondary" onClick={() => setShowBlueprints(true)}>
                  <LayoutTemplate className="h-4 w-4" /> Start from a template
                </Button>
                <Button onClick={() => setNaming(true)} className="px-6 py-3 text-base">
                  Start with your own brief
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
                  <h2 className="text-lg font-semibold leading-tight">{p.name}</h2>
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
                  <Button variant="ghost" onClick={() => router.push(`/project/${p.id}`)}>
                    Open <ArrowRight className="h-4 w-4" />
                  </Button>
                  <button
                    title="Delete project"
                    onClick={() => setDeleteProjectId(p.id)}
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
            <div className="flex min-h-0 flex-1 flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between gap-4 border-b border-navy-700 p-6 pb-4">
                <div>
                  <h2 className="text-xl font-bold">Start from a template</h2>
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
                        {group === "Pattern" ? "Industry patterns" : "Product use cases"}
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
                            <p className="mt-1 text-sm text-slate-500">{t.summary}</p>
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

      {projectToDelete && (
        <ConfirmDialog
          title={`Delete "${projectToDelete.name}"?`}
          body="This removes the architecture from this browser. Export it first if you want a copy."
          confirmLabel="Delete project"
          destructive
          onCancel={() => setDeleteProjectId(null)}
          onConfirm={() => {
            deleteProject(projectToDelete.id);
            setDeleteProjectId(null);
          }}
        />
      )}
    </main>
  );
}

const ONBOARDING_STEPS: { title: string; body: string }[] = [
  { title: "Brief", body: "Answer a few questions about what you're building." },
  { title: "Review", body: "Get a starter architecture and a production-risk review." },
  { title: "Spec", body: "Export a Markdown, JSON, or PNG design doc to share." },
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
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em]">
              AI assistant (optional)
            </span>
          </div>
          <h2 className="mb-2 text-xl font-bold">Connect a free Gemini key</h2>
          <p className="mb-4 text-sm text-slate-500">
            The optional AI assistant runs on Google Gemini using your own free
            API key, stored only in this browser and called directly. Every core
            feature works without it.
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
      <Panel className="w-full max-w-md bg-navy-900 p-6">
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
