"use client";

import { Check, Plus } from "lucide-react";
import { CATALOG } from "@/lib/catalog";
import type { ComponentId, ReferenceArchitecture } from "@/lib/learnTypes";

function Block({ title, items }: { title: string; items: string[] }) {
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

export function ReferenceArchitecturePanel({
  reference,
  selected,
  onAdd,
}: {
  reference: ReferenceArchitecture;
  selected: Set<ComponentId>;
  onAdd: (id: ComponentId) => void;
}) {
  const missing = reference.componentIds.filter((id) => !selected.has(id));

  return (
    <div className="space-y-5">
      <div>
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-cyan">
          Senior-Level Reference
        </p>
        <h3 className="mt-1 text-lg font-semibold">{reference.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          {reference.explanation}
        </p>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            Components ({reference.componentIds.length})
          </p>
          {missing.length > 0 && (
            <button
              onClick={() => missing.forEach(onAdd)}
              className="text-xs font-semibold text-brand-cyan hover:underline"
            >
              Add {missing.length} missing
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {reference.componentIds.map((id) => {
            const have = selected.has(id);
            return (
              <button
                key={id}
                onClick={() => !have && onAdd(id)}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                  have
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700"
                    : "border-brand-blue/40 bg-navy-900 text-brand-cyan hover:bg-brand-blue hover:text-white"
                }`}
              >
                {have ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}{" "}
                {CATALOG[id]?.label ?? id}
              </button>
            );
          })}
        </div>
        {missing.length === 0 ? (
          <p className="mt-2 text-xs text-emerald-700">
            Your design covers every component in the reference. Now defend the choices.
          </p>
        ) : (
          <p className="mt-2 text-xs text-slate-500">
            The reference uses {missing.length} component{missing.length > 1 ? "s" : ""} you
            haven&apos;t added. They&apos;re a guide, not a checklist - know why each is there.
          </p>
        )}
      </div>

      <Block title="Key flows" items={reference.keyFlows} />
      <Block title="Tradeoffs" items={reference.tradeoffs} />
      <Block title="Interviewer follow-ups" items={reference.interviewerFollowUps} />
    </div>
  );
}
