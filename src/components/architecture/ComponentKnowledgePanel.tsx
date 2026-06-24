"use client";

import { Plus, Check } from "lucide-react";
import { CATALOG } from "@/lib/catalog";
import { getComponentKnowledge } from "@/lib/knowledge";
import type { ArchitectureMode, ComponentId } from "@/lib/learnTypes";

function Section({ title, items }: { title: string; items: string[] }) {
  if (!items || items.length === 0) return null;
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

export function ComponentKnowledgePanel({
  componentId,
  mode,
  selected,
  onToggle,
}: {
  componentId?: ComponentId;
  mode: ArchitectureMode;
  selected: Set<ComponentId>;
  onToggle: (id: ComponentId) => void;
}) {
  if (!componentId) {
    return (
      <p className="rounded-md border border-dashed border-navy-600 bg-navy-900/50 p-6 text-center text-sm text-slate-500">
        Select a component to study its tradeoffs, failure modes, and{" "}
        {mode === "learn" ? "interview talking points" : "implementation notes"}.
      </p>
    );
  }

  const k = getComponentKnowledge(componentId);
  const Icon = k.icon;
  const related = k.relatedComponentIds;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-paper-soft">
          <Icon className={`h-5 w-5 ${k.accent}`} />
        </span>
        <div>
          <h3 className="text-lg font-semibold leading-tight">{k.label}</h3>
          <p className="text-xs text-slate-500">{k.group}</p>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-slate-700">{k.purpose}</p>

      <Section title="When to use" items={k.whenToUse} />
      <Section title="Alternatives" items={k.alternatives} />
      <Section title="Tradeoffs" items={k.tradeoffs} />
      <Section title="Failure modes" items={k.failureModes} />

      {mode === "learn" ? (
        <Section title="Interview talking points" items={k.interviewTalkingPoints} />
      ) : (
        <Section title="Implementation notes" items={k.implementationNotes} />
      )}
      {/* Always show the secondary list too, it's useful in both modes */}
      {mode === "learn" ? (
        <Section title="Implementation notes" items={k.implementationNotes} />
      ) : (
        <Section title="Interview talking points" items={k.interviewTalkingPoints} />
      )}

      {related.length > 0 && (
        <div>
          <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            Related components
          </p>
          <div className="flex flex-wrap gap-1.5">
            {related.map((id) => {
              const isSel = selected.has(id);
              return (
                <button
                  key={id}
                  onClick={() => onToggle(id)}
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                    isSel
                      ? "border-brand-blue/40 bg-paper-soft text-slate-600"
                      : "border-brand-blue/40 bg-navy-900 text-brand-cyan hover:bg-brand-blue hover:text-white"
                  }`}
                >
                  {isSel ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}{" "}
                  {CATALOG[id]?.label ?? id}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {k.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 border-t border-navy-700 pt-3">
          {k.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-paper-soft px-2 py-0.5 text-[11px] text-slate-500"
            >
              #{t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
