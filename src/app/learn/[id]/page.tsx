"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, RotateCcw, ListChecks, AlertTriangle, Target } from "lucide-react";
import { getScenario } from "@/data/learningScenarios";
import { getReferenceArchitecture } from "@/data/referenceArchitectures";
import { useLearnStore, useLearnHasHydrated } from "@/lib/learnStore";
import { reviewArchitecture } from "@/lib/reviewEngine";
import { getAtlasCoachTips } from "@/lib/atlasCoach";
import type { ComponentId } from "@/lib/learnTypes";
import { TopNav } from "@/components/nav/TopNav";
import { ComponentPalette } from "@/components/architecture/ComponentPalette";
import { SelectedComponents } from "@/components/architecture/SelectedComponents";
import { ComponentKnowledgePanel } from "@/components/architecture/ComponentKnowledgePanel";
import { ArchitectureReviewPanel } from "@/components/architecture/ArchitectureReviewPanel";
import { ReferenceArchitecturePanel } from "@/components/learn/ReferenceArchitecturePanel";
import { InterviewExplanationPanel } from "@/components/learn/InterviewExplanationPanel";
import { AtlasCoach } from "@/components/coach/AtlasCoach";

/** Stable empty reference so the store selector never returns a fresh array. */
const EMPTY_SELECTION: ComponentId[] = [];

type Tab = "review" | "reference" | "interview" | "component";

const TABS: { id: Tab; label: string }[] = [
  { id: "review", label: "Review" },
  { id: "reference", label: "Reference" },
  { id: "interview", label: "Interview" },
  { id: "component", label: "Component" },
];

export default function LearnScenarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const scenario = getScenario(id);
  if (!scenario) notFound();

  const hydrated = useLearnHasHydrated();
  // Select the raw (stable) reference and default outside the selector. Returning
  // a fresh [] from the selector would break useSyncExternalStore (React 19
  // "getSnapshot should be cached" / infinite loop).
  const storedList = useLearnStore((s) => s.selections[id]);
  const selectedList = storedList ?? EMPTY_SELECTION;
  const toggle = useLearnStore((s) => s.toggleComponent);
  const add = useLearnStore((s) => s.addComponent);
  const remove = useLearnStore((s) => s.removeComponent);
  const reset = useLearnStore((s) => s.resetScenario);

  const [tab, setTab] = useState<Tab>("review");
  const [activeComponent, setActiveComponent] = useState<ComponentId | undefined>();

  const reference = getReferenceArchitecture(scenario.referenceArchitectureId);
  const selectedSet = useMemo(() => new Set(selectedList), [selectedList]);
  const recommendedSet = useMemo(
    () =>
      new Set<ComponentId>([
        ...scenario.criticalComponentIds,
        ...scenario.expectedComponentIds,
        ...scenario.recommendedComponentIds,
      ]),
    [scenario]
  );

  const { items, score } = useMemo(
    () => reviewArchitecture({ mode: "learn", selectedComponentIds: selectedList, scenario }),
    [selectedList, scenario]
  );

  const coachTips = useMemo(
    () =>
      getAtlasCoachTips({
        mode: "learn",
        selectedComponentIds: selectedList,
        selectedComponentId: activeComponent,
        scenario,
        reviewItems: items,
        score,
      }),
    [selectedList, activeComponent, scenario, items, score]
  );

  function onAdd(cid: ComponentId) {
    add(id, cid);
  }
  function onToggle(cid: ComponentId) {
    toggle(id, cid);
  }
  function onSelectComponent(cid: ComponentId) {
    setActiveComponent(cid);
    setTab("component");
  }

  const scoreColor =
    score.overall < 50
      ? "text-red-500"
      : score.overall < 70
      ? "text-amber-600"
      : score.overall < 85
      ? "text-brand-cyan"
      : "text-emerald-600";

  return (
    <main className="min-h-screen bg-gradient-dark">
      <TopNav />
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Header */}
        <header className="mb-6 border-b border-navy-700 pb-5">
          <Link
            href="/learn"
            className="mb-3 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-cyan"
          >
            <ArrowLeft className="h-4 w-4" /> All scenarios
          </Link>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-cyan">
                Practice
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                {scenario.title}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {scenario.description}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-md border border-navy-700 bg-navy-900 px-4 py-2 text-center">
                <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Interview Readiness
                </p>
                <p className={`text-2xl font-semibold tabular-nums ${scoreColor}`}>
                  {score.overall}
                </p>
                <p className={`text-[11px] font-semibold ${scoreColor}`}>
                  {score.readinessLabel}
                </p>
              </div>
              {selectedList.length > 0 && (
                <button
                  onClick={() => {
                    reset(id);
                    setActiveComponent(undefined);
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
          <div className="grid gap-5 lg:grid-cols-12">
            {/* Left: scenario brief */}
            <aside className="space-y-4 lg:col-span-3">
              <BriefBlock
                icon={<ListChecks className="h-4 w-4 text-brand-cyan" />}
                title="Functional requirements"
                items={scenario.functionalRequirements}
              />
              <BriefBlock
                icon={<Target className="h-4 w-4 text-brand-cyan" />}
                title="Non-functional"
                items={scenario.nonFunctionalRequirements}
              />
              <BriefBlock
                icon={<AlertTriangle className="h-4 w-4 text-amber-600" />}
                title="Common pitfalls"
                items={scenario.commonPitfalls}
                amber
              />
              <div className="rounded-md border border-navy-700 bg-navy-900 p-4">
                <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Concepts
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {scenario.concepts.map((c) => (
                    <span
                      key={c}
                      className="rounded-full border border-navy-700 bg-paper-soft px-2 py-0.5 text-[11px] text-slate-600"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </aside>

            {/* Middle: build area */}
            <section className="lg:col-span-5">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold">Build your architecture answer</h2>
                  <p className="text-xs text-slate-500">
                    {selectedList.length} component{selectedList.length === 1 ? "" : "s"} selected
                  </p>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <div className="rounded-md border border-navy-700 bg-navy-900 p-3">
                  <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Add components
                  </p>
                  <div className="h-[420px]">
                    <ComponentPalette
                      selected={selectedSet}
                      onToggle={onToggle}
                      recommendedIds={recommendedSet}
                    />
                  </div>
                </div>
                <div>
                  <SelectedComponents
                    ids={selectedList}
                    selectedId={activeComponent}
                    onSelect={onSelectComponent}
                    onRemove={(cid) => {
                      remove(id, cid);
                      if (activeComponent === cid) setActiveComponent(undefined);
                    }}
                    emptyState={
                      <>
                        <p className="text-sm font-medium text-slate-600">
                          Start with the request path.
                        </p>
                        <p className="mt-1 max-w-xs text-sm text-slate-500">
                          What receives traffic first: client, CDN, load balancer, or API
                          gateway? Add it from the palette.
                        </p>
                      </>
                    }
                  />
                </div>
              </div>
            </section>

            {/* Right: tabbed panels + coach */}
            <section className="space-y-4 lg:col-span-4">
              <div className="rounded-md border border-navy-700 bg-navy-900">
                <div className="thin-scroll flex gap-1 overflow-x-auto border-b border-navy-700 p-1.5">
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
                <div className="p-4">
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
                  {tab === "component" && (
                    <ComponentKnowledgePanel
                      componentId={activeComponent}
                      mode="learn"
                      selected={selectedSet}
                      onToggle={onToggle}
                    />
                  )}
                </div>
              </div>

              <AtlasCoach tips={coachTips} onAdd={onAdd} />
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

function BriefBlock({
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
