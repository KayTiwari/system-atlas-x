"use client";

import { useState } from "react";
import {
  Check,
  Plus,
  ChevronDown,
  HelpCircle,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { CATALOG } from "@/lib/catalog";
import { getComponentKnowledge } from "@/lib/knowledge";
import { ReviewItemCard } from "@/components/architecture/ArchitectureReviewPanel";
import type {
  ArchitectureMode,
  ComponentId,
  LessonStage as LessonStageType,
  ReviewItem,
} from "@/lib/learnTypes";

function KnowledgeBlock({ title, items }: { title: string; items: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <p className="mb-1 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        {title}
      </p>
      <ul className="space-y-1 text-xs text-slate-600">
        {items.map((it) => (
          <li key={it} className="flex items-start gap-1.5">
            <span className="mt-1.5 h-0.5 w-0.5 shrink-0 rounded-full bg-slate-400" />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ToolCard({
  id,
  mode,
  selected,
  onToggle,
  senior,
}: {
  id: ComponentId;
  mode: ArchitectureMode;
  selected: boolean;
  onToggle: (id: ComponentId) => void;
  senior?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const entry = CATALOG[id];
  if (!entry) return null;
  const k = getComponentKnowledge(id);
  const Icon = entry.icon;

  return (
    <div
      className={`rounded-md border transition ${
        selected ? "border-emerald-500/40 bg-emerald-500/[0.05]" : "border-navy-700 bg-navy-900"
      }`}
    >
      <div className="flex items-start gap-3 p-3">
        <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${entry.accent}`} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold">{entry.label}</p>
            {senior && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-cyan/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-brand-cyan">
                <Sparkles className="h-2.5 w-2.5" /> Senior signal
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-slate-600">{entry.purpose}</p>
          <button
            onClick={() => setOpen((v) => !v)}
            className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-brand-cyan"
          >
            <ChevronDown className={`h-3 w-3 transition ${open ? "rotate-180" : ""}`} />
            {open ? "Hide details" : "Tradeoffs & failure modes"}
          </button>
        </div>
        <button
          onClick={() => onToggle(id)}
          className={`inline-flex shrink-0 items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold transition ${
            selected
              ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 hover:bg-red-500/10 hover:text-red-500"
              : "border border-brand-blue bg-brand-blue text-white hover:bg-brand-blue-dark"
          }`}
          title={selected ? "Added (click to remove)" : "Add to your design"}
        >
          {selected ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          {selected ? "Added" : "Add"}
        </button>
      </div>
      {open && (
        <div className="space-y-3 border-t border-navy-700 p-3">
          {k.technologies.length > 0 && (
            <div>
              <p className="mb-1 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Common tech
              </p>
              <div className="flex flex-wrap gap-1">
                {k.technologies.slice(0, 4).map((t) => (
                  <span
                    key={t}
                    className="rounded border border-brand-blue/30 bg-brand-blue/[0.06] px-1.5 py-0.5 text-[11px] font-medium text-brand-cyan"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
          <KnowledgeBlock title="When to use" items={k.whenToUse} />
          <KnowledgeBlock title="Tradeoffs" items={k.tradeoffs} />
          <KnowledgeBlock title="Failure modes" items={k.failureModes} />
          <KnowledgeBlock
            title={mode === "learn" ? "Interview talking points" : "Implementation notes"}
            items={mode === "learn" ? k.interviewTalkingPoints : k.implementationNotes}
          />
        </div>
      )}
    </div>
  );
}

export function LessonStage({
  stage,
  stageNumber,
  totalStages,
  mode,
  selected,
  items,
  onToggle,
  onAdd,
}: {
  stage: LessonStageType;
  stageNumber: number;
  totalStages: number;
  mode: ArchitectureMode;
  selected: Set<ComponentId>;
  items: ReviewItem[];
  onToggle: (id: ComponentId) => void;
  onAdd: (id: ComponentId) => void;
}) {
  const stageIds = new Set<ComponentId>([
    ...stage.coreComponentIds,
    ...stage.seniorComponentIds,
  ]);
  // Findings that point at a component in this layer.
  const relevant = items.filter((it) =>
    it.suggestedComponentIds.some((id) => stageIds.has(id))
  );

  return (
    <div className="space-y-6">
      {/* Teaching */}
      <div>
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-cyan">
          Step {stageNumber} of {totalStages} · {stage.tier}
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">
          {stage.title.replace(/^Step \d+ - /, "")}
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{stage.teaching}</p>
        <div className="mt-3 flex items-start gap-2 rounded-md border border-brand-blue/25 bg-brand-blue/[0.05] p-3">
          <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand-cyan" />
          <p className="text-sm text-slate-700">{stage.guidingQuestion}</p>
        </div>
      </div>

      {/* Pitfalls for this layer */}
      {stage.pitfalls.length > 0 && (
        <div className="rounded-md border border-amber-500/30 bg-amber-500/[0.05] p-4">
          <div className="mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-700">
              Watch out for
            </p>
          </div>
          <ul className="space-y-1.5 text-sm text-slate-700">
            {stage.pitfalls.map((p) => (
              <li key={p} className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-500" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tools to add */}
      <div>
        <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          Add for this layer
        </p>
        {stage.coreComponentIds.length === 0 && stage.seniorComponentIds.length === 0 ? (
          <p className="rounded-md border border-dashed border-navy-600 p-4 text-sm text-slate-500">
            Nothing required here for this scenario - move on.
          </p>
        ) : (
          <div className="space-y-2">
            {stage.coreComponentIds.map((id) => (
              <ToolCard
                key={id}
                id={id}
                mode={mode}
                selected={selected.has(id)}
                onToggle={onToggle}
              />
            ))}
            {stage.seniorComponentIds.map((id) => (
              <ToolCard
                key={id}
                id={id}
                mode={mode}
                selected={selected.has(id)}
                onToggle={onToggle}
                senior
              />
            ))}
          </div>
        )}
      </div>

      {/* Per-stage review feedback */}
      {relevant.length > 0 && (
        <div>
          <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            Review of this layer
          </p>
          <div className="space-y-2">
            {relevant.map((it) => (
              <ReviewItemCard
                key={it.id}
                item={it}
                mode={mode}
                selected={selected}
                onAdd={onAdd}
              />
            ))}
          </div>
        </div>
      )}

      {/* Check prompt */}
      <div className="rounded-md border border-navy-700 bg-paper-soft p-4">
        <p className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          Before you move on
        </p>
        <p className="text-sm text-slate-700">{stage.checkPrompt}</p>
      </div>
    </div>
  );
}
