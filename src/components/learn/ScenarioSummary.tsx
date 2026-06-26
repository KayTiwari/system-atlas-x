"use client";

import { useState } from "react";
import { PartyPopper } from "lucide-react";
import { ArchitectureReviewPanel } from "@/components/architecture/ArchitectureReviewPanel";
import { ReferenceArchitecturePanel } from "@/components/learn/ReferenceArchitecturePanel";
import { InterviewExplanationPanel } from "@/components/learn/InterviewExplanationPanel";
import type {
  ArchitectureScore,
  ComponentId,
  LearningScenario,
  ReferenceArchitecture,
  ReviewItem,
} from "@/lib/learnTypes";

type Tab = "review" | "reference" | "interview";

const TABS: { id: Tab; label: string }[] = [
  { id: "review", label: "Review" },
  { id: "reference", label: "Senior Reference" },
  { id: "interview", label: "Interview Explanation" },
];

export function ScenarioSummary({
  scenario,
  reference,
  items,
  score,
  selectedList,
  selectedSet,
  onAdd,
}: {
  scenario: LearningScenario;
  reference?: ReferenceArchitecture;
  items: ReviewItem[];
  score: ArchitectureScore;
  selectedList: ComponentId[];
  selectedSet: Set<ComponentId>;
  onAdd: (id: ComponentId) => void;
}) {
  const [tab, setTab] = useState<Tab>("review");
  const ready = score.overall >= 85;

  return (
    <div className="space-y-5">
      <div className="rounded-md border border-navy-700 bg-navy-900 p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-brand text-white">
            <PartyPopper className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Review &amp; explain</h2>
            <p className="text-sm text-slate-600">
              {ready
                ? "This is interview-ready. Now practice explaining the request flow and tradeoffs out loud."
                : "Close the remaining gaps below, then generate an explanation to rehearse."}
            </p>
          </div>
        </div>
      </div>

      <div className="thin-scroll flex gap-1 overflow-x-auto rounded-md border border-navy-700 bg-navy-900 p-1.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`shrink-0 rounded px-3 py-1.5 text-sm font-semibold transition ${
              tab === t.id
                ? "bg-brand-blue text-white"
                : "text-slate-600 hover:bg-paper-soft hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div>
        {tab === "review" && (
          <ArchitectureReviewPanel
            mode="learn"
            items={items}
            score={score}
            selected={selectedSet}
            onAdd={onAdd}
          />
        )}
        {tab === "reference" && reference && (
          <ReferenceArchitecturePanel
            reference={reference}
            selected={selectedSet}
            onAdd={onAdd}
          />
        )}
        {tab === "interview" && (
          <InterviewExplanationPanel scenario={scenario} selected={selectedList} />
        )}
      </div>
    </div>
  );
}
