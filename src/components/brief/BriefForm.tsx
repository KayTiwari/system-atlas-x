"use client";

import { useState } from "react";
import { Sparkles, X, Plus } from "lucide-react";
import { useAtlasStore } from "@/lib/store";
import type {
  ArchitectureBrief,
  Availability,
  DataSensitivity,
} from "@/lib/types";
import { Button, Panel } from "@/components/ui/primitives";

export function BriefForm({
  projectId,
  onGenerateSkeleton,
}: {
  projectId: string;
  onGenerateSkeleton: () => void;
}) {
  const brief = useAtlasStore(
    (s) => s.projects.find((p) => p.id === projectId)?.brief
  );
  const updateBrief = useAtlasStore((s) => s.updateBrief);

  if (!brief) return null;

  const set = (patch: Partial<ArchitectureBrief>) =>
    updateBrief(projectId, { ...brief, ...patch });

  const canGenerate =
    brief.productGoal.trim().length > 0 && brief.coreFlows.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Architecture brief</h2>
        <p className="mt-1 text-slate-500">
          Answer the brief, then generate a starting architecture you can refine
          on the canvas. The brief also feeds the review and tradeoff engine.
        </p>
      </div>

      <Panel className="space-y-5 p-6">
        <Text
          label="What are you building?"
          value={brief.productGoal}
          textarea
          placeholder="e.g. A customer-facing document upload and review platform"
          example="A claims platform where insurance customers upload documents and reviewers approve them"
          onChange={(v) => set({ productGoal: v })}
        />
        <Text
          label="Who are the users?"
          value={brief.users}
          placeholder="Internal, external customers, admins, partner API…"
          example="External policyholders, internal claims reviewers, a partner API"
          onChange={(v) => set({ users: v })}
        />
        <List
          label="Core user flows"
          values={brief.coreFlows}
          placeholder="e.g. Customer uploads a document"
          example="Customer uploads a claim · Reviewer approves or rejects · Customer checks status"
          onChange={(v) => set({ coreFlows: v })}
        />
        <Text
          label="Traffic assumptions"
          value={brief.trafficAssumptions}
          placeholder="Users/day, requests/sec, peak traffic"
          example="~5k daily users, ~50 req/s average, ~300 req/s at peak"
          onChange={(v) => set({ trafficAssumptions: v })}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <Select<DataSensitivity>
            label="Data sensitivity"
            value={brief.dataSensitivity}
            options={[
              ["low", "Low"],
              ["medium", "Medium"],
              ["high", "High"],
            ]}
            onChange={(v) => set({ dataSensitivity: v })}
          />
          <Select<Availability>
            label="Availability requirement"
            value={brief.availability}
            options={[
              ["best_effort", "Best effort"],
              ["standard", "Standard"],
              ["high", "High availability"],
            ]}
            onChange={(v) => set({ availability: v })}
          />
        </div>
        <Text
          label="Latency needs"
          value={brief.latencyNeeds}
          placeholder="What needs to be fast?"
          example="Document list loads under 300ms; uploads can process asynchronously"
          onChange={(v) => set({ latencyNeeds: v })}
        />
        <List
          label="External integrations"
          values={brief.integrations}
          placeholder="Stripe, Twilio, S3, OpenAI…"
          onChange={(v) => set({ integrations: v })}
        />
        <List
          label="Compliance"
          values={brief.compliance}
          placeholder="HIPAA, SOC 2, GDPR, audit logs…"
          onChange={(v) => set({ compliance: v })}
        />
      </Panel>

      <div className="sticky bottom-0 flex flex-col gap-3 border-t border-navy-700 bg-navy-900/95 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          {canGenerate
            ? "Atlas turns this brief into a starting diagram you can refine."
            : "Add what you're building and at least one core user flow to generate."}
        </p>
        <Button
          onClick={onGenerateSkeleton}
          disabled={!canGenerate}
          className="shrink-0 px-6 py-3 text-base"
        >
          <Sparkles className="h-5 w-5" /> Generate skeleton
        </Button>
      </div>
    </div>
  );
}

function Text({
  label,
  value,
  onChange,
  placeholder,
  textarea,
  example,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
  example?: string;
}) {
  const cls =
    "w-full rounded-lg border border-navy-700 bg-navy-900 px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-blue";
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-600">
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
      {example && <Example text={example} />}
    </label>
  );
}

function Example({ text }: { text: string }) {
  return (
    <span className="mt-1.5 block text-xs text-slate-500">
      <span className="font-medium text-slate-600">Example:</span> {text}
    </span>
  );
}

function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: [T, string][];
  onChange: (v: T) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-600">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full rounded-lg border border-navy-700 bg-navy-900 px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-blue"
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  );
}

function List({
  label,
  values,
  onChange,
  placeholder,
  example,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  example?: string;
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
      <span className="mb-1.5 block text-sm font-medium text-slate-600">
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
          className="shrink-0 rounded-lg border border-navy-700 px-3 text-slate-600 hover:border-brand-blue/50 hover:text-ink"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      {example && <Example text={example} />}
    </div>
  );
}
