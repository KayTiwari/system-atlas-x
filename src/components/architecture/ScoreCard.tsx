"use client";

import { REVIEW_CATEGORIES } from "@/lib/learnTypes";
import type { ArchitectureMode, ArchitectureScore } from "@/lib/learnTypes";

/** Band colors shared by the overall score, category numbers, and bars. */
export function scoreColor(n: number): string {
  if (n < 50) return "text-red-500";
  if (n < 70) return "text-amber-600";
  if (n < 85) return "text-brand-cyan";
  return "text-emerald-600";
}

export function barColor(n: number): string {
  if (n < 50) return "bg-red-500";
  if (n < 70) return "bg-amber-500";
  if (n < 85) return "bg-brand-cyan";
  return "bg-emerald-500";
}

export function ScoreCard({
  mode,
  score,
  compact = false,
}: {
  mode: ArchitectureMode;
  score: ArchitectureScore;
  /** Hide the category breakdown (used in tight stage panels). */
  compact?: boolean;
}) {
  const scoreLabel = mode === "learn" ? "Interview Readiness" : "Architecture Confidence";
  return (
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

      {!compact && (
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
                <span
                  className={`w-7 shrink-0 text-right text-[11px] font-semibold tabular-nums ${scoreColor(
                    v
                  )}`}
                >
                  {v}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
