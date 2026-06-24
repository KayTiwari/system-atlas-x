"use client";

import { Plus, AlertOctagon, AlertTriangle, Lightbulb, CheckCircle2 } from "lucide-react";
import { CATALOG } from "@/lib/catalog";
import { REVIEW_CATEGORIES } from "@/lib/learnTypes";
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

function scoreColor(n: number): string {
  if (n < 50) return "text-red-500";
  if (n < 70) return "text-amber-600";
  if (n < 85) return "text-brand-cyan";
  return "text-emerald-600";
}

function barColor(n: number): string {
  if (n < 50) return "bg-red-500";
  if (n < 70) return "bg-amber-500";
  if (n < 85) return "bg-brand-cyan";
  return "bg-emerald-500";
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
  const scoreLabel = mode === "learn" ? "Interview Readiness" : "Architecture Confidence";

  return (
    <div className="space-y-5">
      {/* Score card */}
      <div className="rounded-md border border-navy-700 bg-navy-900 p-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {scoreLabel}
            </p>
            <p className={`mt-1 text-4xl font-semibold tabular-nums ${scoreColor(score.overall)}`}>
              {score.overall}
              <span className="text-lg text-slate-400">/100</span>
            </p>
          </div>
          <span
            className={`rounded-md border border-navy-600 bg-navy-900 px-3 py-1.5 text-sm font-semibold ${scoreColor(
              score.overall
            )}`}
          >
            {score.readinessLabel}
          </span>
        </div>
        <p className="mt-3 text-sm text-slate-600">{score.summary}</p>

        <div className="mt-4 grid grid-cols-1 gap-x-5 gap-y-2 sm:grid-cols-2">
          {REVIEW_CATEGORIES.map((cat) => {
            const v = score.categories[cat];
            return (
              <div key={cat} className="flex items-center gap-2">
                <span className="w-28 shrink-0 text-[11px] text-slate-500">{cat}</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-paper-soft">
                  <span
                    className={`block h-full rounded-full ${barColor(v)}`}
                    style={{ width: `${v}%` }}
                  />
                </span>
                <span className="w-7 shrink-0 text-right text-[11px] tabular-nums text-slate-500">
                  {v}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Findings */}
      <div className="space-y-2.5">
        {items.length === 0 ? (
          <p className="rounded-md border border-dashed border-navy-600 p-6 text-center text-sm text-slate-500">
            Add components to get a review.
          </p>
        ) : (
          items.map((item) => {
            const meta = SEVERITY_META[item.type];
            const tip = mode === "learn" ? item.interviewTip : item.buildTip;
            const toAdd = item.suggestedComponentIds.filter((id) => !selected.has(id));
            return (
              <div key={item.id} className={`rounded-md border p-3.5 ${meta.ring}`}>
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
          })
        )}
      </div>
    </div>
  );
}
