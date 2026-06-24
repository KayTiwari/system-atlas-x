"use client";

import { useMemo, useState } from "react";
import { Search, Boxes } from "lucide-react";
import { CATALOG_LIST, PALETTE_GROUPS, type PaletteGroup } from "@/lib/catalog";
import { getComponentKnowledge } from "@/lib/knowledge";
import type { ComponentId } from "@/lib/learnTypes";
import { TopNav } from "@/components/nav/TopNav";

function DetailSection({ title, items }: { title: string; items: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <p className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        {title}
      </p>
      <ul className="space-y-1.5 text-sm text-slate-700">
        {items.map((it) => (
          <li key={it} className="flex items-start gap-2">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-cyan" />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ComponentLibraryPage() {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<PaletteGroup | "All">("All");
  const [activeId, setActiveId] = useState<ComponentId>(CATALOG_LIST[0].type);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CATALOG_LIST.filter((c) => {
      if (group !== "All" && c.group !== group) return false;
      if (!q) return true;
      const k = getComponentKnowledge(c.type);
      return (
        c.label.toLowerCase().includes(q) ||
        c.purpose.toLowerCase().includes(q) ||
        c.group.toLowerCase().includes(q) ||
        k.tags.some((t) => t.includes(q))
      );
    });
  }, [query, group]);

  const active = getComponentKnowledge(activeId);
  const ActiveIcon = active.icon;

  return (
    <main className="min-h-screen bg-gradient-dark">
      <TopNav />
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-12">
        <header className="mb-8 border-b border-navy-700 pb-6">
          <div className="eyebrow mb-3 flex items-center gap-3 text-brand-cyan">
            <Boxes className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.32em]">
              Component Library
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Study the building blocks
          </h1>
          <p className="mt-3 max-w-2xl text-slate-500">
            {CATALOG_LIST.length} architecture components with when to use them,
            alternatives, tradeoffs, failure modes, and interview talking points.
          </p>
        </header>

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-md border border-navy-700 bg-navy-900 px-3">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, purpose, or tag..."
              className="w-full bg-transparent py-2.5 text-sm text-ink outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="thin-scroll mb-6 flex gap-1.5 overflow-x-auto pb-1">
          {(["All", ...PALETTE_GROUPS] as const).map((g) => (
            <button
              key={g}
              onClick={() => setGroup(g)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                group === g
                  ? "border-brand-blue bg-brand-blue text-white"
                  : "border-navy-700 bg-navy-900 text-slate-600 hover:border-brand-blue/50"
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-12">
          {/* List */}
          <div className="lg:col-span-5">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {filtered.map((c) => {
                const Icon = c.icon;
                const isActive = c.type === activeId;
                return (
                  <button
                    key={c.type}
                    onClick={() => setActiveId(c.type)}
                    className={`flex items-center gap-3 rounded-md border p-3 text-left transition ${
                      isActive
                        ? "border-brand-blue/50 bg-paper-soft"
                        : "border-navy-700 bg-navy-900 hover:border-brand-blue/40"
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${c.accent}`} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{c.label}</span>
                      <span className="block truncate text-[11px] text-slate-500">
                        {c.group}
                      </span>
                    </span>
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <p className="rounded-md border border-dashed border-navy-600 p-6 text-center text-sm text-slate-500">
                  No components match your search.
                </p>
              )}
            </div>
          </div>

          {/* Detail */}
          <div className="lg:col-span-7">
            <div className="sticky top-20 space-y-5 rounded-md border border-navy-700 bg-navy-900 p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-md bg-paper-soft">
                  <ActiveIcon className={`h-5 w-5 ${active.accent}`} />
                </span>
                <div>
                  <h2 className="text-xl font-semibold leading-tight">{active.label}</h2>
                  <p className="text-xs text-slate-500">{active.group}</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-slate-700">{active.purpose}</p>

              <DetailSection title="When to use" items={active.whenToUse} />
              <DetailSection title="Alternatives" items={active.alternatives} />
              <DetailSection title="Tradeoffs" items={active.tradeoffs} />
              <DetailSection title="Failure modes" items={active.failureModes} />
              <DetailSection
                title="Interview talking points"
                items={active.interviewTalkingPoints}
              />
              <DetailSection title="Implementation notes" items={active.implementationNotes} />

              {active.relatedComponentIds.length > 0 && (
                <div>
                  <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Related components
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {active.relatedComponentIds.map((id) => (
                      <button
                        key={id}
                        onClick={() => setActiveId(id)}
                        className="rounded-full border border-brand-blue/40 bg-navy-900 px-2.5 py-1 text-xs font-medium text-brand-cyan transition hover:bg-brand-blue hover:text-white"
                      >
                        {getComponentKnowledge(id).label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {active.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 border-t border-navy-700 pt-3">
                  {active.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-paper-soft px-2 py-0.5 text-[11px] text-slate-500"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
