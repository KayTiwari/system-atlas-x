"use client";

import { Check, Ban } from "lucide-react";
import { RULES_OF_THUMB, CATEGORY_LABELS } from "@/lib/tradeoffs";
import type { DecisionCategory } from "@/lib/types";

/** Blunt "use X when / avoid when" guidance per decision category. */
export function RuleOfThumbCard({ category }: { category: DecisionCategory }) {
  const rot = RULES_OF_THUMB[category];
  if (!rot) return null;

  return (
    <div className="rounded-lg border border-navy-700 bg-navy-800/40 p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {CATEGORY_LABELS[category]} - rules of thumb
      </p>
      <ul className="space-y-1">
        {rot.use.map((u, i) => (
          <li key={`u${i}`} className="flex gap-2 text-xs text-slate-600">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
            {u}
          </li>
        ))}
        {rot.avoid.map((a, i) => (
          <li key={`a${i}`} className="flex gap-2 text-xs text-slate-600">
            <Ban className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
            {a}
          </li>
        ))}
      </ul>
    </div>
  );
}
