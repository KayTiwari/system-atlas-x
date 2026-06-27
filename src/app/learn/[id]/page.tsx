"use client";

import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, RotateCcw, ChevronDown } from "lucide-react";
import { getScenario } from "@/data/learningScenarios";
import { getReferenceArchitecture } from "@/data/referenceArchitectures";
import { useLearnStore, useLearnHasHydrated } from "@/lib/learnStore";
import { reviewArchitecture } from "@/lib/reviewEngine";
import { getAtlasCoachTips } from "@/lib/atlasCoach";
import { buildLessonPlan, isStageComplete } from "@/lib/lessonPlan";
import type { ComponentId } from "@/lib/learnTypes";
import { TopNav } from "@/components/nav/TopNav";
import { SelectedComponents } from "@/components/architecture/SelectedComponents";
import { scoreColor, CategoryBreakdown } from "@/components/architecture/ScoreCard";
import { AtlasCoach } from "@/components/coach/AtlasCoach";
import { LessonProgress, type StepMeta } from "@/components/learn/LessonProgress";
import { ScenarioOverview } from "@/components/learn/ScenarioOverview";
import { LessonStage } from "@/components/learn/LessonStage";
import { ScenarioSummary } from "@/components/learn/ScenarioSummary";

/** Stable empty reference so the store selector never returns a fresh array. */
const EMPTY_SELECTION: ComponentId[] = [];

export default function LearnScenarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const scenario = getScenario(id);
  if (!scenario) notFound();

  const hydrated = useLearnHasHydrated();
  const storedList = useLearnStore((s) => s.selections[id]);
  const selectedList = storedList ?? EMPTY_SELECTION;
  const storedStep = useLearnStore((s) => s.progress[id]);
  const add = useLearnStore((s) => s.addComponent);
  const toggle = useLearnStore((s) => s.toggleComponent);
  const reset = useLearnStore((s) => s.resetScenario);
  const setStepStore = useLearnStore((s) => s.setStep);

  const plan = useMemo(() => buildLessonPlan(scenario), [scenario]);
  const reference = getReferenceArchitecture(scenario.referenceArchitectureId);

  const steps: StepMeta[] = useMemo(
    () => [
      { label: "Overview", kind: "overview" },
      ...plan.stages.map((s) => ({
        label: s.title.replace(/^Step \d+ - /, ""),
        kind: "stage" as const,
      })),
      { label: "Review", kind: "summary" as const },
    ],
    [plan]
  );
  const lastStep = steps.length - 1;

  const [step, setStep] = useState(0);
  const initRef = useRef(false);

  // Initialize the step once from the URL (?step) or persisted progress.
  useEffect(() => {
    if (!hydrated || initRef.current) return;
    initRef.current = true;
    const q = new URLSearchParams(window.location.search).get("step");
    let initial = 0;
    if (q !== null && /^\d+$/.test(q)) initial = Math.min(parseInt(q, 10), lastStep);
    else if (storedStep && /^\d+$/.test(storedStep))
      initial = Math.min(parseInt(storedStep, 10), lastStep);
    if (initial !== 0) setStep(initial);
  }, [hydrated, lastStep, storedStep]);

  const goTo = useCallback(
    (n: number) => {
      const clamped = Math.max(0, Math.min(n, lastStep));
      setStep(clamped);
      setStepStore(id, String(clamped));
      const url = new URL(window.location.href);
      url.searchParams.set("step", String(clamped));
      window.history.replaceState(null, "", url.toString());
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [id, lastStep, setStepStore]
  );

  const selectedSet = useMemo(() => new Set(selectedList), [selectedList]);
  const { items, score } = useMemo(
    () => reviewArchitecture({ mode: "learn", selectedComponentIds: selectedList, scenario }),
    [selectedList, scenario]
  );

  const onAdd = useCallback((cid: ComponentId) => add(id, cid), [add, id]);
  const onToggle = useCallback((cid: ComponentId) => toggle(id, cid), [toggle, id]);

  const isOverview = step === 0;
  const isSummary = step === lastStep;
  const stageIndex = step - 1;
  const currentStage = !isOverview && !isSummary ? plan.stages[stageIndex] : null;

  const coachTips = useMemo(
    () =>
      getAtlasCoachTips({
        mode: "learn",
        selectedComponentIds: selectedList,
        selectedComponentId: currentStage?.coreComponentIds[0],
        scenario,
        reviewItems: items,
        score,
      }),
    [selectedList, currentStage, scenario, items, score]
  );

  const completed = useMemo(
    () =>
      steps.map((s, i) => {
        if (s.kind === "overview") return step > 0;
        if (s.kind === "summary") return false;
        return isStageComplete(plan.stages[i - 1], selectedSet);
      }),
    [steps, step, plan, selectedSet]
  );

  return (
    <main className="min-h-screen bg-gradient-dark">
      <TopNav />
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {/* Header */}
        <header className="mb-5 border-b border-navy-700 pb-4">
          <Link
            href="/learn"
            className="mb-3 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-cyan"
          >
            <ArrowLeft className="h-4 w-4" /> All scenarios
          </Link>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-cyan">
                Practice
              </p>
              <h1 className="text-2xl font-semibold tracking-tight">{scenario.title}</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="group relative">
                <button
                  type="button"
                  className="flex cursor-default items-center gap-2 rounded-md border border-navy-700 bg-navy-900 px-3 py-1.5 text-left"
                >
                  <span>
                    <span className="block font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Interview Readiness
                    </span>
                    <span className={`block text-xl font-semibold leading-none tabular-nums ${scoreColor(score.overall)}`}>
                      {score.overall}
                      <span className="ml-1 text-[11px] font-semibold">{score.readinessLabel}</span>
                    </span>
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400 transition group-hover:rotate-180" />
                </button>
                <div className="invisible absolute right-0 z-30 mt-2 w-80 rounded-md border border-navy-700 bg-navy-900 p-4 opacity-0 shadow-[0_24px_60px_rgba(28,27,25,0.18)] transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <p className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Score breakdown
                  </p>
                  <p className="mb-3 text-xs text-slate-600">{score.summary}</p>
                  <CategoryBreakdown score={score} />
                </div>
              </div>
              {selectedList.length > 0 && (
                <button
                  onClick={() => {
                    reset(id);
                    goTo(0);
                  }}
                  title="Reset this scenario"
                  className="inline-flex items-center gap-1.5 rounded-md border border-navy-600 bg-navy-900 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-red-500/40 hover:text-red-500"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Reset
                </button>
              )}
            </div>
          </div>
        </header>

        {!hydrated ? (
          <div className="h-64 animate-pulse rounded-md border border-navy-700 bg-navy-900/60" />
        ) : (
          <>
            <div className="mb-5">
              <LessonProgress
                steps={steps}
                current={step}
                completed={completed}
                onJump={goTo}
              />
            </div>

            <div className="grid gap-5 lg:grid-cols-12">
              {/* Main column */}
              <section className={isOverview ? "lg:col-span-12" : "lg:col-span-8"}>
                {isOverview && (
                  <ScenarioOverview scenario={scenario} plan={plan} onBegin={() => goTo(1)} />
                )}
                {currentStage && (
                  <LessonStage
                    stage={currentStage}
                    stageNumber={stageIndex + 1}
                    totalStages={plan.stages.length}
                    mode="learn"
                    selected={selectedSet}
                    items={items}
                    onToggle={onToggle}
                    onAdd={onAdd}
                  />
                )}
                {isSummary && (
                  <ScenarioSummary
                    scenario={scenario}
                    reference={reference}
                    items={items}
                    score={score}
                    selectedList={selectedList}
                    selectedSet={selectedSet}
                    onAdd={onAdd}
                  />
                )}
              </section>

              {/* Right rail: persistent context (hidden on overview) */}
              {!isOverview && (
                <aside className="space-y-4 lg:col-span-4">
                  <div className="rounded-md border border-navy-700 bg-navy-900 p-4">
                    <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Your design so far · {selectedList.length}
                    </p>
                    <SelectedComponents
                      ids={selectedList}
                      onSelect={() => {}}
                      onRemove={(cid) => onToggle(cid)}
                      emptyState={
                        <p className="text-sm text-slate-500">
                          Add components as you work through the steps and they will appear
                          here.
                        </p>
                      }
                    />
                  </div>
                  <AtlasCoach tips={coachTips} onAdd={onAdd} />
                </aside>
              )}
            </div>

            {/* Footer nav */}
            {!isOverview && (
              <div className="mt-6 flex items-center justify-between border-t border-navy-700 pt-5">
                <button
                  onClick={() => goTo(step - 1)}
                  className="inline-flex items-center gap-2 rounded-md border border-navy-600 bg-navy-900 px-4 py-2 text-sm font-semibold text-ink transition hover:border-brand-blue/60 hover:bg-paper-soft"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                {!isSummary ? (
                  <button
                    onClick={() => goTo(step + 1)}
                    className="inline-flex items-center gap-2 rounded-md border border-brand-blue bg-brand-blue px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-blue-dark"
                  >
                    {step + 1 === lastStep ? "Review & explain" : `Next: ${steps[step + 1].label}`}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <Link
                    href="/learn"
                    className="inline-flex items-center gap-2 rounded-md border border-brand-blue bg-brand-blue px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-blue-dark"
                  >
                    Finish <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
