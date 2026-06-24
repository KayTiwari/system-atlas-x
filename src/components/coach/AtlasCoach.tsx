"use client";

import { useState } from "react";
import { Compass, ChevronDown, Plus, Lightbulb, AlertTriangle, Sparkles } from "lucide-react";
import { CATALOG } from "@/lib/catalog";
import type { CoachTip, ComponentId } from "@/lib/learnTypes";

const SEVERITY_ICON = {
  tip: <Lightbulb className="h-4 w-4 text-brand-cyan" />,
  warning: <AlertTriangle className="h-4 w-4 text-amber-600" />,
  praise: <Sparkles className="h-4 w-4 text-emerald-600" />,
};

export function AtlasCoach({
  tips,
  onAdd,
}: {
  tips: CoachTip[];
  onAdd?: (id: ComponentId) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <section className="rounded-md border border-navy-700 bg-navy-900">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-brand text-white">
            <Compass className="h-4 w-4" />
          </span>
          <span>
            <span className="block text-sm font-semibold leading-tight">Atlas Coach</span>
            <span className="block text-[11px] text-slate-500">Architecture guidance</span>
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 text-slate-500 transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="space-y-3 border-t border-navy-700 p-4">
          {tips.length === 0 ? (
            <p className="text-sm text-slate-500">
              No tips right now - your design is in good shape.
            </p>
          ) : (
            tips.map((tip) => (
              <div
                key={tip.id}
                className="rounded-md border border-navy-700 bg-paper-soft p-3"
              >
                <div className="mb-1 flex items-center gap-2">
                  {SEVERITY_ICON[tip.severity ?? "tip"]}
                  <p className="text-sm font-semibold">{tip.title}</p>
                </div>
                <p className="text-sm leading-relaxed text-slate-700">{tip.message}</p>
                {onAdd && tip.suggestedComponentIds && tip.suggestedComponentIds.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {tip.suggestedComponentIds.map((id) => (
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
            ))
          )}
        </div>
      )}
    </section>
  );
}
