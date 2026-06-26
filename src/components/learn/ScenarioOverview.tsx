"use client";

import {
  ArrowRight,
  ListChecks,
  Target,
  ShieldAlert,
  Route,
} from "lucide-react";
import type { LearningScenario, LessonPlan, Difficulty } from "@/lib/learnTypes";

const DIFFICULTY_CLASS: Record<Difficulty, string> = {
  Beginner: "bg-emerald-500/15 text-emerald-600",
  Intermediate: "bg-amber-500/15 text-amber-600",
  Advanced: "bg-red-500/15 text-red-600",
};

function ReqList({
  icon,
  title,
  items,
  amber,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
  amber?: boolean;
}) {
  return (
    <div className="rounded-md border border-navy-700 bg-navy-900 p-4">
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          {title}
        </p>
      </div>
      <ul className="space-y-1.5 text-sm text-slate-700">
        {items.map((it) => (
          <li key={it} className="flex items-start gap-2">
            <span
              className={`mt-1.5 h-1 w-1 shrink-0 rounded-full ${
                amber ? "bg-amber-500" : "bg-brand-cyan"
              }`}
            />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ScenarioOverview({
  scenario,
  plan,
  onBegin,
}: {
  scenario: LearningScenario;
  plan: LessonPlan;
  onBegin: () => void;
}) {
  return (
    <div className="space-y-8">
      {/* Framing */}
      <div className="rounded-md border border-navy-700 bg-navy-900 p-6">
        <div className="mb-3 flex items-center gap-3">
          <span
            className={`rounded-sm px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] ${DIFFICULTY_CLASS[scenario.difficulty]}`}
          >
            {scenario.difficulty}
          </span>
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            {plan.stages.length}-step lesson
          </span>
        </div>
        <p className="text-base leading-relaxed text-ink-soft">
          {scenario.overview ?? scenario.description}
        </p>
        {scenario.whyItMatters && (
          <div className="mt-4 rounded-md border border-brand-blue/25 bg-brand-blue/[0.05] p-4">
            <p className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-cyan">
              Why this matters
            </p>
            <p className="text-sm leading-relaxed text-slate-700">{scenario.whyItMatters}</p>
          </div>
        )}
      </div>

      {/* Concepts */}
      <div>
        <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          You will practice
        </p>
        <div className="flex flex-wrap gap-1.5">
          {scenario.concepts.map((c) => (
            <span
              key={c}
              className="rounded-full border border-navy-700 bg-paper-soft px-2.5 py-1 text-xs text-slate-700"
            >
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* Requirements + pitfalls */}
      <div className="grid gap-4 md:grid-cols-3">
        <ReqList
          icon={<ListChecks className="h-4 w-4 text-brand-cyan" />}
          title="Functional requirements"
          items={scenario.functionalRequirements}
        />
        <ReqList
          icon={<Target className="h-4 w-4 text-brand-cyan" />}
          title="Non-functional"
          items={scenario.nonFunctionalRequirements}
        />
        <ReqList
          icon={<ShieldAlert className="h-4 w-4 text-amber-600" />}
          title="What we'll avoid"
          items={scenario.commonPitfalls}
          amber
        />
      </div>

      {/* The plan */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Route className="h-4 w-4 text-brand-cyan" />
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            Your plan
          </p>
        </div>
        <ol className="space-y-2">
          {plan.stages.map((stage, i) => (
            <li
              key={stage.tier}
              className="flex items-start gap-3 rounded-md border border-navy-700 bg-navy-900 p-3"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-brand-blue font-mono text-xs font-semibold text-white">
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-semibold">{stage.title.replace(/^Step \d+ - /, "")}</p>
                <p className="text-sm text-slate-600">{stage.teaching}</p>
              </div>
            </li>
          ))}
          <li className="flex items-start gap-3 rounded-md border border-navy-700 bg-paper-soft p-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-brand-cyan font-mono text-xs font-semibold text-white">
              ✓
            </span>
            <div>
              <p className="text-sm font-semibold">Review &amp; explain</p>
              <p className="text-sm text-slate-600">
                See your Interview Readiness score, compare against the senior reference, and
                generate an explanation to rehearse out loud.
              </p>
            </div>
          </li>
        </ol>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onBegin}
          className="inline-flex items-center gap-2 rounded-md border border-brand-blue bg-brand-blue px-6 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(31,77,68,0.16)] transition hover:bg-brand-blue-dark"
        >
          Begin <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
