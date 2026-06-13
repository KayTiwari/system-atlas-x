"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Wand2,
  LayoutTemplate,
  Upload,
  Trash2,
  ArrowRight,
  Boxes,
} from "lucide-react";
import { useAtlasStore, useHasHydrated } from "@/lib/store";
import { TEMPLATES, TEMPLATE_GROUPS } from "@/lib/templates";
import { Button, Panel, Chip } from "@/components/ui/primitives";

export default function DashboardPage() {
  const hydrated = useHasHydrated();
  const router = useRouter();
  const projects = useAtlasStore((s) => s.projects);
  const createProject = useAtlasStore((s) => s.createProject);
  const importProject = useAtlasStore((s) => s.importProject);
  const deleteProject = useAtlasStore((s) => s.deleteProject);

  const [showTemplates, setShowTemplates] = useState(false);
  const [naming, setNaming] = useState(false);
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
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setNaming(true)}>
              <Wand2 className="h-4 w-4" /> Design Wizard
            </Button>
            <Button variant="secondary" onClick={() => setShowTemplates(true)}>
              <LayoutTemplate className="h-4 w-4" /> From template
            </Button>
            <Button
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4" /> Import JSON
            </Button>
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
          </div>
        </header>

        {importError && (
          <p className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
            {importError}
          </p>
        )}

        {!hydrated ? (
          <p className="text-slate-500">Loading…</p>
        ) : projects.length === 0 ? (
          <Panel className="p-12 text-center">
            <p className="text-lg font-medium text-slate-700">
              No architectures yet
            </p>
            <p className="mx-auto mt-2 max-w-md text-slate-500">
              Start from a blank canvas, pick a starter template, or import a
              project you exported earlier.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button onClick={() => setNaming(true)}>
                <Wand2 className="h-4 w-4" /> Design Wizard
              </Button>
              <Button variant="secondary" onClick={() => setShowTemplates(true)}>
                <LayoutTemplate className="h-4 w-4" /> Browse templates
              </Button>
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

      {showTemplates && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
          onClick={() => setShowTemplates(false)}
        >
          <Panel
            className="max-h-[80vh] w-full max-w-2xl overflow-y-auto bg-navy-900 p-6 thin-scroll"
            // stop the backdrop click from closing when interacting inside
          >
            <div
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="mb-1 text-xl font-bold">Start from a template</h2>
              <p className="mb-5 text-sm text-slate-500">
                Load a reference architecture you can refine - swap any component
                for an alternative from its inspector.
              </p>
              {TEMPLATE_GROUPS.map((group) => {
                const items = TEMPLATES.filter((t) => t.group === group);
                if (items.length === 0) return null;
                return (
                  <div key={group} className="mb-5">
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
              <div className="mt-6 flex justify-end">
                <Button variant="ghost" onClick={() => setShowTemplates(false)}>
                  Close
                </Button>
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
    </main>
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
            <Wand2 className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wide">
              Design Wizard
            </span>
          </div>
          <h2 className="mb-4 text-xl font-bold">Name your architecture</h2>
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
              <Wand2 className="h-4 w-4" /> Create
            </Button>
          </div>
        </div>
      </Panel>
    </div>
  );
}
