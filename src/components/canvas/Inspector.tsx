"use client";

import { useState } from "react";
import { Trash2, X, Plus, Check } from "lucide-react";
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
    "w-full rounded-md border border-navy-700 bg-navy-900 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-brand-blue";
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

/**
 * Technology input with typeahead from the Tradeoff Engine catalog. Free text is
 * still allowed, but typing something that matches a known option lets you apply
 * the canonical name (and retype the node, e.g. relational <-> non-relational),
 * keeping the field in sync with the Swap picker and comparison matrix.
 */
function TechnologyField({
  category,
  value,
  placeholder,
  onChange,
  onApplyOption,
}: {
  category?: DecisionCategory;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
  onApplyOption: (patch: Partial<ArchitectureNodeData>) => void;
}) {
  const [focused, setFocused] = useState(false);
  const options = category ? optionsForCategory(category) : [];
  const norm = value.trim().toLowerCase();
  const exact = options.find((o) => o.name.toLowerCase() === norm);
  const matches = options.filter((o) => o.name.toLowerCase().includes(norm));
  const showList = focused && options.length > 0 && !exact && matches.length > 0;

  function apply(option: (typeof options)[number]) {
    onApplyOption({
      technology: option.name,
      ...(option.nodeType ? { architectureType: option.nodeType } : {}),
    });
  }

  const cls =
    "w-full rounded-md border border-navy-700 bg-navy-900 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-brand-blue";

  return (
    <div className="relative">
      <span className="mb-1 flex items-center gap-1.5 text-xs font-medium text-slate-500">
        Technology
        {exact && (
          <span className="inline-flex items-center gap-0.5 text-brand-cyan">
            <Check className="h-3 w-3" /> in catalog
          </span>
        )}
      </span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          // Snap a free-typed value to the catalog's canonical casing when it
          // matches, so the node and the Swap picker agree.
          const m = options.find((o) => o.name.toLowerCase() === norm);
          if (m && m.name !== value.trim()) apply(m);
        }}
        className={cls}
      />
      {showList && (
        <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-navy-700 bg-navy-900 py-1 shadow-xl thin-scroll">
          {matches.map((o) => (
            <li key={o.id}>
              <button
                type="button"
                // Keep focus on the input so the click registers before blur.
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => apply(o)}
                className="block w-full px-3 py-1.5 text-left hover:bg-navy-800"
              >
                <span className="text-sm text-slate-800">{o.name}</span>
                <span className="block truncate text-xs text-slate-500">
                  {o.chooseWhen}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
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
              className="inline-flex items-center gap-1 rounded-sm bg-paper-soft px-2 py-1 text-xs text-slate-700"
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
          className="w-full rounded-md border border-navy-700 bg-navy-900 px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-blue"
        />
        <button
          onClick={add}
          className="shrink-0 rounded-md border border-navy-700 px-2 text-slate-600 hover:border-brand-blue/50 hover:bg-paper-soft hover:text-ink"
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
      <aside className="flex h-full w-80 shrink-0 flex-col items-center justify-center border-l border-navy-700 bg-navy-900/95 px-6 text-center">
        <div className="mb-4 h-20 w-28 rounded-md border border-dashed border-navy-600 bg-paper-soft atlas-rule opacity-80" />
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-cyan">
          Inspector idle
        </p>
        <p className="mt-2 text-sm text-slate-500">
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
    <aside className="flex h-full w-80 shrink-0 flex-col border-l border-navy-700 bg-navy-900/95">
      <div className="flex items-center justify-between border-b border-navy-700 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={`grid h-8 w-8 place-items-center rounded-sm border border-navy-700 bg-paper-soft ${entry.accent}`}>
            <Icon className="h-4 w-4" />
          </span>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
              Selected part
            </p>
            <span className="text-sm font-semibold">{entry.label}</span>
          </div>
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
        <TechnologyField
          category={entry.decisionCategory}
          value={d.technology ?? ""}
          placeholder={entry.defaultTechnology ?? "e.g. Postgres on RDS"}
          onChange={(v) => onChange({ technology: v })}
          onApplyOption={(patch) => onChange(patch)}
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

        <div className="rounded-md border border-navy-700 bg-paper-soft/70 p-3">
          <div className="mb-2 flex items-center gap-2 text-brand-cyan">
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
    <div className="rounded-md border border-navy-700 bg-paper-soft/70 p-3">
      <div className="mb-2 flex items-center gap-2 text-brand-cyan">
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
                  ? "border border-brand-blue bg-brand-blue text-white"
                  : "border border-navy-700 bg-navy-900 text-slate-600 hover:border-brand-blue/50 hover:text-ink"
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
