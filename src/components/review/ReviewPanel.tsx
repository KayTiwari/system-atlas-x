"use client";

import { useMemo, useState } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Info,
  Plus,
  Trash2,
  Sparkles,
  User,
  Cog,
} from "lucide-react";
import { lintArchitecture } from "@/lib/linter";
import { useAtlasStore } from "@/lib/store";
import { createId } from "@/lib/id";
import type {
  Project,
  ReviewSeverity,
  Suggestion,
  SuggestionSource,
} from "@/lib/types";
import { Button, Panel } from "@/components/ui/primitives";

const SEVERITY_META: Record<
  ReviewSeverity,
  { icon: typeof Info; color: string; label: string }
> = {
  critical: { icon: AlertOctagon, color: "text-red-400", label: "Critical" },
  warning: { icon: AlertTriangle, color: "text-amber-400", label: "Warning" },
  info: { icon: Info, color: "text-slate-500", label: "Info" },
};

const SOURCE_META: Record<
  SuggestionSource | "rule",
  { icon: typeof Info; label: string; color: string }
> = {
  rule: { icon: Cog, label: "Rule", color: "text-slate-500" },
  ai: { icon: Sparkles, label: "AI", color: "text-brand-cyan" },
  user: { icon: User, label: "You", color: "text-emerald-300" },
};

function SourceTag({ source }: { source: SuggestionSource | "rule" }) {
  const m = SOURCE_META[source];
  const Icon = m.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-navy-700 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${m.color}`}
    >
      <Icon className="h-3 w-3" /> {m.label}
    </span>
  );
}

export function ReviewPanel({ project }: { project: Project }) {
  const addSuggestion = useAtlasStore((s) => s.addSuggestion);
  const removeSuggestion = useAtlasStore((s) => s.removeSuggestion);
  const [adding, setAdding] = useState(false);

  const findings = useMemo(
    () => lintArchitecture({ brief: project.brief, nodes: project.nodes }),
    [project.brief, project.nodes]
  );
  const suggestions = project.suggestions ?? [];
  const total = findings.length + suggestions.length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Architecture review</h2>
          <p className="mt-1 text-slate-500">
            Rule-based checks, AI suggestions, and your own notes in one place.
            Generate AI findings from the Assist tab.
          </p>
        </div>
        <Button variant="secondary" onClick={() => setAdding((v) => !v)}>
          <Plus className="h-4 w-4" /> Add a note
        </Button>
      </div>

      {adding && (
        <NoteForm
          onCancel={() => setAdding(false)}
          onSave={(s) => {
            addSuggestion(project.id, s);
            setAdding(false);
          }}
        />
      )}

      {total === 0 && !adding ? (
        <Panel className="flex items-center gap-3 p-6">
          <ShieldCheck className="h-6 w-6 text-emerald-400" />
          <div>
            <p className="font-medium text-slate-800">Nothing flagged yet</p>
            <p className="text-sm text-slate-500">
              Add more of your design, run the AI assistant, or jot your own
              note.
            </p>
          </div>
        </Panel>
      ) : (
        <div className="space-y-3">
          {findings.map((f) => {
            const meta = SEVERITY_META[f.severity];
            const Icon = meta.icon;
            return (
              <Panel key={f.id} className="p-4">
                <div className="flex items-start gap-3">
                  <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${meta.color}`} />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-slate-800">{f.title}</p>
                      <span
                        className={`text-xs font-semibold uppercase ${meta.color}`}
                      >
                        {meta.label}
                      </span>
                      <SourceTag source="rule" />
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {f.description}
                    </p>
                    <p className="mt-2 text-sm text-brand-cyan">
                      → {f.recommendation}
                    </p>
                  </div>
                </div>
              </Panel>
            );
          })}

          {suggestions.map((s) => {
            const meta = SEVERITY_META[s.severity];
            const Icon = meta.icon;
            return (
              <Panel key={s.id} className="p-4">
                <div className="flex items-start gap-3">
                  <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${meta.color}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-slate-800">{s.title}</p>
                      <span
                        className={`text-xs font-semibold uppercase ${meta.color}`}
                      >
                        {meta.label}
                      </span>
                      <SourceTag source={s.source} />
                    </div>
                    {s.description && (
                      <p className="mt-1 text-sm text-slate-500">
                        {s.description}
                      </p>
                    )}
                    {s.recommendation && (
                      <p className="mt-2 whitespace-pre-wrap text-sm text-brand-cyan">
                        → {s.recommendation}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeSuggestion(project.id, s.id)}
                    className="rounded-md p-1.5 text-slate-500 hover:bg-red-500/10 hover:text-red-500"
                    title="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </Panel>
            );
          })}
        </div>
      )}
    </div>
  );
}

function NoteForm({
  onSave,
  onCancel,
}: {
  onSave: (s: Suggestion) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [severity, setSeverity] = useState<ReviewSeverity>("info");
  const input =
    "w-full rounded-lg border border-navy-700 bg-navy-900 px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-blue";

  return (
    <Panel className="space-y-3 p-5">
      <input
        autoFocus
        value={title}
        placeholder="Note title - e.g. Revisit caching after launch"
        onChange={(e) => setTitle(e.target.value)}
        className={input}
      />
      <textarea
        value={recommendation}
        rows={2}
        placeholder="Your recommendation"
        onChange={(e) => setRecommendation(e.target.value)}
        className={input}
      />
      <div className="flex items-center justify-between gap-2">
        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value as ReviewSeverity)}
          className="rounded-md border border-navy-700 bg-navy-900 px-2 py-1.5 text-xs capitalize text-slate-700 outline-none focus:border-brand-blue"
        >
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="critical">Critical</option>
        </select>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            disabled={!title.trim()}
            onClick={() =>
              onSave({
                id: createId("sug"),
                source: "user",
                severity,
                title: title.trim(),
                description: "",
                recommendation: recommendation.trim(),
                createdAt: new Date().toISOString(),
              })
            }
          >
            Save note
          </Button>
        </div>
      </div>
    </Panel>
  );
}
