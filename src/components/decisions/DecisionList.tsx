"use client";

import { useState } from "react";
import { Plus, Trash2, X, FileText } from "lucide-react";
import { useAtlasStore } from "@/lib/store";
import { createId } from "@/lib/id";
import type { Decision, DecisionStatus } from "@/lib/types";
import { Button, Panel, Chip } from "@/components/ui/primitives";

const STATUSES: DecisionStatus[] = [
  "proposed",
  "accepted",
  "rejected",
  "deprecated",
];

export function DecisionList({ projectId }: { projectId: string }) {
  const decisions = useAtlasStore(
    (s) => s.projects.find((p) => p.id === projectId)?.decisions ?? []
  );
  const addDecision = useAtlasStore((s) => s.addDecision);
  const updateDecision = useAtlasStore((s) => s.updateDecision);
  const removeDecision = useAtlasStore((s) => s.removeDecision);

  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Decision records</h2>
          <p className="mt-1 text-slate-500">
            Capture architecture choices as ADRs before they evaporate into Slack
            threads. Generate them from the Tradeoffs tab, or add your own.
          </p>
        </div>
        <Button onClick={() => setCreating((v) => !v)}>
          <Plus className="h-4 w-4" /> New decision
        </Button>
      </div>

      {creating && (
        <DecisionForm
          onCancel={() => setCreating(false)}
          onSave={(d) => {
            addDecision(projectId, d);
            setCreating(false);
          }}
        />
      )}

      {decisions.length === 0 && !creating ? (
        <Panel className="flex items-center gap-3 p-6 text-slate-500">
          <FileText className="h-6 w-6 text-slate-500" />
          No decisions recorded yet.
        </Panel>
      ) : (
        <div className="space-y-3">
          {decisions.map((d) => (
            <Panel key={d.id} className="p-5">
              <div className="mb-2 flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold">{d.title}</h3>
                <div className="flex items-center gap-2">
                  <select
                    value={d.status}
                    onChange={(e) =>
                      updateDecision(projectId, {
                        ...d,
                        status: e.target.value as DecisionStatus,
                      })
                    }
                    className="rounded-md border border-navy-700 bg-navy-900 px-2 py-1 text-xs capitalize text-slate-700 outline-none focus:border-brand-blue"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeDecision(projectId, d.id)}
                    className="rounded-md p-1.5 text-slate-500 hover:bg-red-500/10 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {d.context && (
                <Field label="Context" body={d.context} />
              )}
              {d.decision && <Field label="Decision" body={d.decision} />}
              {d.alternatives.length > 0 && (
                <FieldList label="Alternatives considered" items={d.alternatives} />
              )}
              {d.tradeoffs.length > 0 && (
                <FieldList label="Trade-offs" items={d.tradeoffs} />
              )}
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ label, body }: { label: string; body: string }) {
  return (
    <div className="mt-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="text-sm text-slate-600">{body}</p>
    </div>
  );
}

function FieldList({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="mt-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <ul className="mt-0.5 list-disc space-y-0.5 pl-5 text-sm text-slate-600">
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </div>
  );
}

function DecisionForm({
  onSave,
  onCancel,
}: {
  onSave: (d: Decision) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [context, setContext] = useState("");
  const [decision, setDecision] = useState("");
  const [alternatives, setAlternatives] = useState<string[]>([]);
  const [tradeoffs, setTradeoffs] = useState<string[]>([]);

  const input =
    "w-full rounded-lg border border-navy-700 bg-navy-900 px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-blue";

  return (
    <Panel className="space-y-4 p-5">
      <input
        autoFocus
        value={title}
        placeholder="Decision title - e.g. Use Postgres as the primary database"
        onChange={(e) => setTitle(e.target.value)}
        className={input}
      />
      <textarea
        value={context}
        rows={2}
        placeholder="Context - what forces this decision?"
        onChange={(e) => setContext(e.target.value)}
        className={input}
      />
      <textarea
        value={decision}
        rows={2}
        placeholder="Decision - what did you choose?"
        onChange={(e) => setDecision(e.target.value)}
        className={input}
      />
      <TagInput
        label="Alternatives considered"
        values={alternatives}
        onChange={setAlternatives}
      />
      <TagInput label="Trade-offs" values={tradeoffs} onChange={setTradeoffs} />
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          disabled={!title.trim()}
          onClick={() =>
            onSave({
              id: createId("dec"),
              title: title.trim(),
              context,
              decision,
              alternatives,
              tradeoffs,
              status: "proposed",
            })
          }
        >
          Save decision
        </Button>
      </div>
    </Panel>
  );
}

function TagInput({
  label,
  values,
  onChange,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
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
      <input
        value={draft}
        placeholder="Type and press Enter"
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            const v = draft.trim();
            if (v) {
              onChange([...values, v]);
              setDraft("");
            }
          }
        }}
        className="w-full rounded-lg border border-navy-700 bg-navy-900 px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-blue"
      />
    </div>
  );
}
