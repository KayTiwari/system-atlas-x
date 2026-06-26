"use client";

import { Check } from "lucide-react";

export type StepMeta = { label: string; kind: "overview" | "stage" | "summary" };

export function LessonProgress({
  steps,
  current,
  completed,
  onJump,
}: {
  steps: StepMeta[];
  current: number;
  completed: boolean[];
  onJump: (i: number) => void;
}) {
  const pct = steps.length > 1 ? (current / (steps.length - 1)) * 100 : 0;

  return (
    <div className="rounded-md border border-navy-700 bg-navy-900 p-3">
      <div className="mb-3 h-1 overflow-hidden rounded-full bg-paper-soft">
        <span
          className="block h-full rounded-full bg-brand-blue transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="thin-scroll flex items-center gap-1 overflow-x-auto">
        {steps.map((step, i) => {
          const active = i === current;
          const done = completed[i] && !active;
          return (
            <button
              key={i}
              onClick={() => onJump(i)}
              className={`flex shrink-0 items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-semibold transition ${
                active
                  ? "bg-brand-blue text-white"
                  : "text-slate-600 hover:bg-paper-soft hover:text-ink"
              }`}
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] ${
                  active
                    ? "bg-white/20 text-white"
                    : done
                    ? "bg-emerald-500/20 text-emerald-600"
                    : "bg-paper-soft text-slate-500"
                }`}
              >
                {done ? <Check className="h-2.5 w-2.5" /> : i === 0 ? "i" : i}
              </span>
              <span className="whitespace-nowrap">{step.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
