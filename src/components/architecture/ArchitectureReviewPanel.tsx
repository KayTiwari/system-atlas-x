"use client";

import { Plus, AlertOctagon, AlertTriangle, Lightbulb, CheckCircle2 } from "lucide-react";
import { CATALOG } from "@/lib/catalog";
import { ScoreCard } from "./ScoreCard";
import type {
  ArchitectureMode,
  ArchitectureScore,
  ComponentId,
  ReviewItem,
} from "@/lib/learnTypes";

const SEVERITY_META = {
  critical: {
    icon: <AlertOctagon className="h-4 w-4 text-red-500" />,
    ring: "border-red-500/30 bg-red-500/[0.06]",
    label: "Critical",
  },
  warning: {
    icon: <AlertTriangle className="h-4 w-4 text-amber-600" />,
    ring: "border-amber-500/30 bg-amber-500/[0.06]",
    label: "Warning",
  },
  suggestion: {
    icon: <Lightbulb className="h-4 w-4 text-brand-cyan" />,
    ring: "border-brand-blue/25 bg-brand-blue/[0.05]",
    label: "Suggestion",
  },
  strength: {
    icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
    ring: "border-emerald-500/30 bg-emerald-500/[0.06]",
    label: "Strength",
  },
} as const;

/** A single review finding card (reused by the stage and summary screens). */
export function ReviewItemCard({
  item,
  mode,
  selected,
  onAdd,
}: {
  item: ReviewItem;
  mode: ArchitectureMode;
  selected: Set<ComponentId>;
  onAdd: (id: ComponentId) => void;
}) {
  const meta = SEVERITY_META[item.type];
  const tip = mode === "learn" ? item.interviewTip : item.buildTip;
  const toAdd = item.suggestedComponentIds.filter((id) => !selected.has(id));
  return (
    <div className={`rounded-md border p-3.5 ${meta.ring}`}>
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5">{meta.icon}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold">{item.title}</p>
            <span className="rounded-sm bg-paper-soft px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wide text-slate-500">
              {item.category}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-700">{item.message}</p>
          <p className="mt-1.5 text-xs text-slate-500">
            <span className="font-semibold text-slate-600">Why it matters: </span>
            {item.whyItMatters}
          </p>
          {tip && (
            <p className="mt-1.5 rounded border border-navy-700 bg-navy-900/70 px-2.5 py-1.5 text-xs text-slate-600">
              <span className="font-semibold text-brand-cyan">
                {mode === "learn" ? "Interview tip: " : "Build tip: "}
              </span>
              {tip}
            </p>
          )}
          {toAdd.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {toAdd.map((id) => (
                <button
                  key={id}
                  onClick={() => onAdd(id)}
                  className="inline-flex items-center gap-1 rounded-full border border-brand-blue/40 bg-navy-900 px-2.5 py-1 text-xs font-medium text-brand-cyan transition hover:bg-brand-blue hover:text-white"
                >
                  <Plus className="h-3 w-3" /> {CATALOG[id]?.label ?? id}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ArchitectureReviewPanel({
  mode,
  items,
  score,
  selected,
  onAdd,
}: {
  mode: ArchitectureMode;
  items: ReviewItem[];
  score: ArchitectureScore;
  selected: Set<ComponentId>;
  onAdd: (id: ComponentId) => void;
}) {
  return (
    <div className="space-y-5">
      <ScoreCard mode={mode} score={score} />
      <div className="space-y-2.5">
        {items.length === 0 ? (
          <p className="rounded-md border border-dashed border-navy-600 p-6 text-center text-sm text-slate-500">
            Add components to get a review.
          </p>
        ) : (
          items.map((item) => (
            <ReviewItemCard
              key={item.id}
              item={item}
              mode={mode}
              selected={selected}
              onAdd={onAdd}
            />
          ))
        )}
      </div>
    </div>
  );
}
