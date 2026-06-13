"use client";

import { useState } from "react";
import { Trash2, X, Plus, Lightbulb, Repeat } from "lucide-react";
import { CATALOG } from "@/lib/catalog";
import { optionsForCategory } from "@/lib/tradeoffs";
import type {
  ArchitectureFlowNode,
  ArchitectureNodeData,
  DecisionCategory,
} from "@/lib/types";
import { ComparisonMatrix } from "@/components/tradeoffs/ComparisonMatrix";
import { RuleOfThumbCard } from "@/components/tradeoffs/RuleOfThumbCard";

type InspectorProps = {
  node: ArchitectureFlowNode | null;
  onChange: (patch: Partial<ArchitectureNodeData>) => void;
  onDelete: (nodeId: string) => void;
};

function TextField({
  label,
  value,
  onChange,
  placeholder,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
}) {
  const cls =
    "w-full rounded-lg border border-navy-700 bg-navy-900 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-brand-blue";
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-500">
        {label}
      </span>
      {textarea ? (
        <textarea
          rows={2}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cls}
        />
      ) : (
        <input
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cls}
        />
      )}
    </label>
  );
}

function ListField({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");
  function add() {
    const v = draft.trim();
    if (!v) return;
    onChange([...values, v]);
    setDraft("");
  }
  return (
    <div>
      <span className="mb-1 block text-xs font-medium text-slate-500">
        {label}
      </span>
      {values.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {values.map((v, i) => (
            <span
              key={`${v}-${i}`}
              className="inline-flex items-center gap-1 rounded-md bg-navy-700 px-2 py-1 text-xs text-slate-700"
            >
              {v}
              <button
                onClick={() => onChange(values.filter((_, idx) => idx !== i))}
                className="text-slate-500 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          className="w-full rounded-lg border border-navy-700 bg-navy-900 px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-blue"
        />
        <button
          onClick={add}
          className="shrink-0 rounded-lg border border-navy-700 px-2 text-slate-600 hover:border-brand-blue/50 hover:text-ink"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function Inspector({ node, onChange, onDelete }: InspectorProps) {
  if (!node) {
    return (
      <aside className="flex h-full w-80 shrink-0 flex-col items-center justify-center border-l border-navy-700 bg-navy-900 px-6 text-center">
        <p className="text-sm text-slate-500">
          Select a component to edit its reasoning, or drag one from the left to
          start.
        </p>
      </aside>
    );
  }

  const entry = CATALOG[node.data.architectureType];
  const Icon = entry.icon;
  const d = node.data;

  return (
    <aside className="flex h-full w-80 shrink-0 flex-col border-l border-navy-700 bg-navy-900">
      <div className="flex items-center justify-between border-b border-navy-700 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={entry.accent}>
            <Icon className="h-5 w-5" />
          </span>
          <span className="text-sm font-semibold">{entry.label}</span>
        </div>
        <button
          title="Delete component"
          onClick={() => onDelete(node.id)}
          className="rounded-md p-1.5 text-slate-500 hover:bg-red-500/10 hover:text-red-500"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 thin-scroll">
        <TextField
          label="Name"
          value={d.name}
          onChange={(v) => onChange({ name: v })}
        />
        <TextField
          label="Technology"
          value={d.technology ?? ""}
          placeholder={entry.defaultTechnology ?? "e.g. Postgres on RDS"}
          onChange={(v) => onChange({ technology: v })}
        />
        <TextField
          label="Purpose / description"
          value={d.description}
          textarea
          onChange={(v) => onChange({ description: v })}
        />
        <TextField
          label="Owner"
          value={d.owner ?? ""}
          placeholder="Team or person"
          onChange={(v) => onChange({ owner: v })}
        />
        <TextField
          label="Scaling strategy"
          value={d.scalingStrategy ?? ""}
          textarea
          placeholder="e.g. Read replicas first, partition later"
          onChange={(v) => onChange({ scalingStrategy: v })}
        />
        <TextField
          label="Failure behavior"
          value={d.failureMode ?? ""}
          textarea
          placeholder="What happens if this is unavailable?"
          onChange={(v) => onChange({ failureMode: v })}
        />
        {node.data.architectureType === "cache" && (
          <TextField
            label="Cache invalidation"
            value={d.cacheInvalidationStrategy ?? ""}
            placeholder="e.g. TTL 60s + invalidate on write"
            onChange={(v) => onChange({ cacheInvalidationStrategy: v })}
          />
        )}
        <ListField
          label="Data stored"
          values={d.dataStored}
          placeholder="Add a data type and press Enter"
          onChange={(v) => onChange({ dataStored: v })}
        />
        <ListField
          label="Security notes"
          values={d.securityNotes}
          placeholder="Add a security note"
          onChange={(v) => onChange({ securityNotes: v })}
        />
        <ListField
          label="Cost notes"
          values={d.costNotes}
          placeholder="Add a cost note"
          onChange={(v) => onChange({ costNotes: v })}
        />

        {entry.decisionCategory && (
          <div className="space-y-3 border-t border-navy-700 pt-4">
            <SwapPicker
              category={entry.decisionCategory}
              currentTechnology={d.technology}
              onSwap={(patch) => onChange(patch)}
            />
            <RuleOfThumbCard category={entry.decisionCategory} />
            <ComparisonMatrix category={entry.decisionCategory} />
          </div>
        )}

        <div className="rounded-lg border border-navy-700 bg-navy-800/40 p-3">
          <div className="mb-2 flex items-center gap-2 text-brand-cyan">
            <Lightbulb className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">
              About {entry.label}
            </span>
          </div>
          <p className="mb-2 text-sm text-slate-600">{entry.purpose}</p>
          <Knowledge title="When to use" items={entry.whenToUse} />
          <Knowledge title="Trade-offs" items={entry.tradeoffs} />
          <Knowledge title="Common patterns" items={entry.commonPatterns} />
        </div>
      </div>
    </aside>
  );
}

function SwapPicker({
  category,
  currentTechnology,
  onSwap,
}: {
  category: DecisionCategory;
  currentTechnology?: string;
  onSwap: (patch: Partial<ArchitectureNodeData>) => void;
}) {
  const options = optionsForCategory(category);
  if (options.length === 0) return null;
  const current = currentTechnology?.trim().toLowerCase();

  return (
    <div className="rounded-lg border border-navy-700 bg-navy-800/40 p-3">
      <div className="mb-2 flex items-center gap-2 text-brand-cyan">
        <Repeat className="h-4 w-4" />
        <span className="text-xs font-semibold uppercase tracking-wide">
          Swap technology
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const active = current === o.name.toLowerCase();
          return (
            <button
              key={o.id}
              title={o.chooseWhen}
              onClick={() =>
                onSwap({
                  technology: o.name,
                  ...(o.nodeType ? { architectureType: o.nodeType } : {}),
                })
              }
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                active
                  ? "bg-gradient-brand text-white"
                  : "border border-navy-700 text-slate-600 hover:border-brand-blue/50 hover:text-ink"
              }`}
            >
              {o.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Knowledge({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mt-2">
      <p className="text-xs font-medium text-slate-500">{title}</p>
      <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-slate-500">
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </div>
  );
}
