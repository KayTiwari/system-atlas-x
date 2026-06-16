"use client";

import { useState } from "react";
import { Sparkles, X, Plus, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [step, setStep] = useState(0);

  if (!brief) return null;

  const set = (patch: Partial<ArchitectureBrief>) =>
    updateBrief(projectId, { ...brief, ...patch });

  const canGenerate =
    brief.productGoal.trim().length > 0 && brief.coreFlows.length > 0;

  const lastStep = STEPS.length - 1;
  const isLast = step === lastStep;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Architecture brief</h2>
        <p className="mt-1 text-slate-500">
          Answer the brief, then generate a starting architecture you can refine
          on the canvas. The brief also feeds the review and tradeoff engine.
        </p>
      </div>

      {/* Progress */}
      <div className="flex gap-2">
        {STEPS.map((s, i) => (
          <button
            key={s.title}
            onClick={() => setStep(i)}
            className="group flex-1 text-left"
          >
            <div
              className={`h-1.5 rounded-full transition ${
                i <= step ? "bg-gradient-brand" : "bg-navy-700"
              }`}
            />
            <span
              className={`mt-2 block text-xs font-medium transition ${
                i === step
                  ? "text-ink"
                  : "text-slate-500 group-hover:text-slate-600"
              }`}
            >
              {i + 1}. {s.title}
            </span>
          </button>
        ))}
      </div>

      <Panel className="space-y-5 p-6">
        <p className="text-sm text-slate-500">{STEPS[step].subtitle}</p>

        {step === 0 && (
          <>
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
          </>
        )}

        {step === 1 && (
          <>
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
          </>
        )}

        {step === 2 && (
          <>
            <List
              label="External integrations"
              values={brief.integrations}
              placeholder="Stripe, Twilio, S3, OpenAI…"
              example="Stripe for payments · S3 for storage · SendGrid for email"
              onChange={(v) => set({ integrations: v })}
            />
            <List
              label="Compliance"
              values={brief.compliance}
              placeholder="HIPAA, SOC 2, GDPR, audit logs…"
              example="SOC 2 · GDPR · audit logging for sensitive records"
              onChange={(v) => set({ compliance: v })}
            />
          </>
        )}
      </Panel>

      {/* Step navigation + generate */}
      <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-navy-700 bg-navy-900/95 py-4 backdrop-blur">
        <div>
          {step > 0 && (
            <Button variant="ghost" onClick={() => setStep(step - 1)}>
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
          )}
        </div>
        <div className="flex items-center gap-3">
          {isLast && !canGenerate && (
            <span className="hidden text-xs text-slate-500 sm:block">
              Add what you&apos;re building and one core flow to generate.
            </span>
          )}
          {!isLast && (
            <Button variant="secondary" onClick={() => setStep(step + 1)}>
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          )}
          <Button
            onClick={onGenerateSkeleton}
            disabled={!canGenerate}
            className="shrink-0 px-5 py-2.5"
          >
            <Sparkles className="h-4 w-4" /> Generate skeleton
          </Button>
        </div>
      </div>
    </div>
  );
}

const STEPS: { title: string; subtitle: string }[] = [
  {
    title: "Product",
    subtitle: "What you're building, who it's for, and the core flows.",
  },
  {
    title: "Constraints",
    subtitle: "Scale, data sensitivity, availability, and latency.",
  },
  {
    title: "Integrations",
    subtitle: "External services and compliance requirements (optional).",
  },
];

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
