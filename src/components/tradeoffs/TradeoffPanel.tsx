"use client";

import { useMemo, useState } from "react";
import { Scale, FilePlus2, ChevronDown, Check, Sparkles } from "lucide-react";
import { useAtlasStore } from "@/lib/store";
import { recommend, recommendationToDecision } from "@/lib/decisionRules";
import type {
  ArchitectureFlowNode,
  DecisionCategory,
  DecisionRecommendation,
  Suggestion,
} from "@/lib/types";
import { Button, Panel } from "@/components/ui/primitives";
import { ComparisonMatrix } from "./ComparisonMatrix";
import { RuleOfThumbCard } from "./RuleOfThumbCard";

function AiSuggestionRow({ s }: { s: Suggestion }) {
  return (
    <div className="rounded-lg border border-brand-cyan/20 bg-brand-cyan/5 p-3">
      <p className="flex items-center gap-1.5 text-sm font-medium text-slate-800">
        <Sparkles className="h-3.5 w-3.5 text-brand-cyan" /> {s.title}
      </p>
      {s.recommendation && (
        <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
          {s.recommendation}
        </p>
      )}
    </div>
  );
}

const CONFIDENCE_COLOR: Record<DecisionRecommendation["confidence"], string> = {
  high: "text-emerald-400",
  medium: "text-amber-400",
  low: "text-slate-500",
};

export function TradeoffPanel({
  projectId,
  nodes,
}: {
  projectId: string;
  nodes: ArchitectureFlowNode[];
}) {
  const brief = useAtlasStore(
    (s) => s.projects.find((p) => p.id === projectId)?.brief
  );
  const suggestions = useAtlasStore(
    (s) => s.projects.find((p) => p.id === projectId)?.suggestions ?? []
  );
  const addDecision = useAtlasStore((s) => s.addDecision);
  const [addedFor, setAddedFor] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const recommendations = useMemo(
    () => (brief ? recommend(brief, nodes) : []),
    [brief, nodes]
  );

  // AI suggestions tagged with a decision category, grouped so they sit next to
  // the matching tradeoff recommendation.
  const aiByCategory = useMemo(() => {
    const map = new Map<DecisionCategory, Suggestion[]>();
    for (const s of suggestions) {
      if (s.source !== "ai" || !s.category) continue;
      const list = map.get(s.category) ?? [];
      list.push(s);
      map.set(s.category, list);
    }
    return map;
  }, [suggestions]);

  if (!brief) return null;

  const coveredCategories = new Set(recommendations.map((r) => r.category));
  const orphanAi = [...aiByCategory.entries()].filter(
    ([cat]) => !coveredCategories.has(cat)
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Tradeoff engine</h2>
        <p className="mt-1 text-slate-500">
          Suggested fit based on your brief - not an objective “best.” Compare
          the options, then capture the call as a decision record.
        </p>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec) => {
          const open = expanded[rec.category];
          const added = addedFor[rec.id];
          return (
            <Panel key={rec.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Scale className="h-4 w-4 text-brand-cyan" />
                    <h3 className="text-lg font-semibold">{rec.title}</h3>
                  </div>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wide">
                    <span className="text-slate-500">Suggested fit · </span>
                    <span className={CONFIDENCE_COLOR[rec.confidence]}>
                      {rec.confidence} confidence
                    </span>
                  </p>
                </div>
                <Button
                  variant={added ? "secondary" : "primary"}
                  disabled={added}
                  onClick={() => {
                    addDecision(projectId, recommendationToDecision(rec));
                    setAddedFor((m) => ({ ...m, [rec.id]: true }));
                  }}
                >
                  {added ? (
                    <>
                      <Check className="h-4 w-4" /> Added to decisions
                    </>
                  ) : (
                    <>
                      <FilePlus2 className="h-4 w-4" /> Create ADR
                    </>
                  )}
                </Button>
              </div>

              <p className="mt-3 text-sm text-slate-600">{rec.reason}</p>

              {rec.alternatives.length > 0 && (
                <p className="mt-2 text-sm text-slate-500">
                  <span className="text-slate-500">Alternatives:</span>{" "}
                  {rec.alternatives.join(", ")}
                </p>
              )}

              {rec.tradeoffs.length > 0 && (
                <ul className="mt-2 list-disc space-y-0.5 pl-5 text-sm text-slate-500">
                  {rec.tradeoffs.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              )}

              <button
                onClick={() =>
                  setExpanded((m) => ({ ...m, [rec.category]: !m[rec.category] }))
                }
                className="mt-3 flex items-center gap-1 text-sm text-brand-cyan hover:underline"
              >
                <ChevronDown
                  className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`}
                />
                {open ? "Hide comparison" : "Compare options"}
              </button>

              {(aiByCategory.get(rec.category)?.length ?? 0) > 0 && (
                <div className="mt-3 space-y-2">
                  {aiByCategory.get(rec.category)!.map((s) => (
                    <AiSuggestionRow key={s.id} s={s} />
                  ))}
                </div>
              )}

              {open && (
                <div className="mt-3 space-y-3">
                  <RuleOfThumbCard category={rec.category} />
                  <ComparisonMatrix category={rec.category} />
                </div>
              )}
            </Panel>
          );
        })}

        {orphanAi.length > 0 && (
          <Panel className="space-y-3 p-5">
            <h3 className="flex items-center gap-1.5 text-lg font-semibold">
              <Sparkles className="h-4 w-4 text-brand-cyan" /> Other AI
              suggestions
            </h3>
            {orphanAi.map(([cat, list]) => (
              <div key={cat} className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {cat}
                </p>
                {list.map((s) => (
                  <AiSuggestionRow key={s.id} s={s} />
                ))}
              </div>
            ))}
          </Panel>
        )}
      </div>
    </div>
  );
}
