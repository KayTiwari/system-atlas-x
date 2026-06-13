"use client";

import { Table2 } from "lucide-react";
import { optionsForCategory, CATEGORY_LABELS } from "@/lib/tradeoffs";
import type { DecisionCategory } from "@/lib/types";

/**
 * Scored "Best for / Weakness / Choose when" comparison for a category.
 * Framed as suggested fit, not objective truth.
 */
export function ComparisonMatrix({ category }: { category: DecisionCategory }) {
  const options = optionsForCategory(category);
  if (options.length === 0) return null;

  return (
    <div className="rounded-lg border border-navy-700 bg-navy-800/40 p-3">
      <div className="mb-2 flex items-center gap-2 text-brand-cyan">
        <Table2 className="h-4 w-4" />
        <span className="text-xs font-semibold uppercase tracking-wide">
          {CATEGORY_LABELS[category]} options
        </span>
      </div>
      <div className="space-y-2">
        {options.map((o) => (
          <div key={o.id} className="rounded-md border border-navy-700 p-2.5">
            <p className="text-sm font-semibold text-slate-800">{o.name}</p>
            <p className="mt-0.5 text-xs text-slate-500">
              <span className="text-slate-500">Best for:</span>{" "}
              {o.bestFor.join(", ")}
            </p>
            <p className="text-xs text-slate-500">
              <span className="text-slate-500">Weakness:</span>{" "}
              {o.avoidWhen.join(", ")}
            </p>
            <p className="text-xs text-brand-cyan">
              <span className="text-slate-500">Choose when:</span> {o.chooseWhen}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
