"use client";

import { X } from "lucide-react";
import { CATALOG, type PaletteGroup } from "@/lib/catalog";
import type { ComponentId } from "@/lib/learnTypes";

/** Collapse the fine-grained palette groups into a few architecture tiers. */
const TIER_OF: Record<PaletteGroup, string> = {
  Client: "Edge / Entry",
  Networking: "Edge / Entry",
  Compute: "Services",
  Data: "Data",
  Async: "Async / Events",
  Reliability: "Reliability",
  Security: "Security",
  Observability: "Observability",
  Platform: "Operations",
  External: "External",
};

const TIER_ORDER = [
  "Edge / Entry",
  "Services",
  "Data",
  "Async / Events",
  "Reliability",
  "Security",
  "Observability",
  "Operations",
  "External",
];

export function SelectedComponents({
  ids,
  selectedId,
  onSelect,
  onRemove,
  emptyState,
}: {
  ids: ComponentId[];
  selectedId?: ComponentId;
  onSelect: (id: ComponentId) => void;
  onRemove: (id: ComponentId) => void;
  emptyState: React.ReactNode;
}) {
  if (ids.length === 0) {
    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center rounded-md border border-dashed border-navy-600 bg-navy-900/50 p-8 text-center">
        {emptyState}
      </div>
    );
  }

  const tiers = new Map<string, ComponentId[]>();
  for (const id of ids) {
    const entry = CATALOG[id];
    if (!entry) continue;
    const tier = TIER_OF[entry.group];
    if (!tiers.has(tier)) tiers.set(tier, []);
    tiers.get(tier)!.push(id);
  }

  const orderedTiers = TIER_ORDER.filter((t) => tiers.has(t));

  return (
    <div className="space-y-5">
      {orderedTiers.map((tier) => (
        <div key={tier}>
          <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            {tier}
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {tiers.get(tier)!.map((id) => {
              const entry = CATALOG[id];
              const Icon = entry.icon;
              const active = selectedId === id;
              return (
                <div
                  key={id}
                  className={`group flex items-center gap-2.5 rounded-md border p-2.5 transition ${
                    active
                      ? "border-brand-blue bg-paper-soft"
                      : "border-navy-700 bg-navy-900 hover:border-brand-blue/40"
                  }`}
                >
                  <button
                    onClick={() => onSelect(id)}
                    className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${entry.accent}`} />
                    <span className="truncate text-sm font-medium">{entry.label}</span>
                  </button>
                  <button
                    onClick={() => onRemove(id)}
                    title={`Remove ${entry.label}`}
                    className="rounded p-1 text-slate-400 transition hover:bg-red-500/10 hover:text-red-500"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
