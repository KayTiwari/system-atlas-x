"use client";

import { useMemo, useState } from "react";
import { Search, Plus, Check } from "lucide-react";
import { CATALOG_LIST, PALETTE_GROUPS, type PaletteGroup } from "@/lib/catalog";
import type { ComponentId } from "@/lib/learnTypes";

export function ComponentPalette({
  selected,
  onToggle,
  recommendedIds,
}: {
  selected: Set<ComponentId>;
  onToggle: (id: ComponentId) => void;
  recommendedIds?: Set<ComponentId>;
}) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<PaletteGroup | "All">("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CATALOG_LIST.filter((c) => {
      if (group !== "All" && c.group !== group) return false;
      if (!q) return true;
      return (
        c.label.toLowerCase().includes(q) ||
        c.purpose.toLowerCase().includes(q) ||
        c.group.toLowerCase().includes(q)
      );
    });
  }, [query, group]);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex items-center gap-2 rounded-md border border-navy-700 bg-navy-900 px-3">
        <Search className="h-4 w-4 shrink-0 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search components..."
          className="w-full bg-transparent py-2 text-sm text-ink outline-none placeholder:text-slate-400"
        />
      </div>

      <div className="thin-scroll mb-3 flex gap-1.5 overflow-x-auto pb-1">
        {(["All", ...PALETTE_GROUPS] as const).map((g) => (
          <button
            key={g}
            onClick={() => setGroup(g)}
            className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium transition ${
              group === g
                ? "border-brand-blue bg-brand-blue text-white"
                : "border-navy-700 bg-navy-900 text-slate-600 hover:border-brand-blue/50"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="thin-scroll min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1">
        {filtered.map((c) => {
          const isSelected = selected.has(c.type);
          const isRecommended = recommendedIds?.has(c.type);
          const Icon = c.icon;
          return (
            <button
              key={c.type}
              onClick={() => onToggle(c.type)}
              className={`flex w-full items-center gap-3 rounded-md border p-2.5 text-left transition ${
                isSelected
                  ? "border-brand-blue/50 bg-paper-soft"
                  : "border-navy-700 bg-navy-900 hover:border-brand-blue/40"
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${c.accent}`} />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-medium">{c.label}</span>
                  {isRecommended && !isSelected && (
                    <span className="rounded-full bg-brand-cyan/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-brand-cyan">
                      Suggested
                    </span>
                  )}
                </span>
                <span className="block truncate text-[11px] text-slate-500">
                  {c.group} · {c.purpose}
                </span>
              </span>
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded ${
                  isSelected ? "bg-brand-blue text-white" : "bg-paper-soft text-slate-500"
                }`}
              >
                {isSelected ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              </span>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="px-2 py-6 text-center text-sm text-slate-500">
            No components match &ldquo;{query}&rdquo;.
          </p>
        )}
      </div>
    </div>
  );
}
