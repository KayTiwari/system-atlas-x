import Link from "next/link";
import { ArrowRight, GraduationCap, BookOpen } from "lucide-react";
import { TopNav } from "@/components/nav/TopNav";
import { LEARNING_SCENARIOS } from "@/data/learningScenarios";
import { COURSE_MODULES } from "@/data/courseModules";
import type { Difficulty } from "@/lib/learnTypes";

export const metadata = {
  title: "Learn Mode | System Atlas X",
  description:
    "Practice system design scenarios, study architecture concepts, and generate interview-ready explanations.",
};

const DIFFICULTY_CLASS: Record<Difficulty, string> = {
  Beginner: "bg-emerald-500/15 text-emerald-600",
  Intermediate: "bg-amber-500/15 text-amber-600",
  Advanced: "bg-red-500/15 text-red-600",
};

export default function LearnHomePage() {
  return (
    <main className="min-h-screen bg-gradient-dark">
      <TopNav />
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-12">
        <header className="mb-10 border-b border-navy-700 pb-8">
          <div className="eyebrow mb-4 flex items-center gap-3 text-brand-cyan">
            <GraduationCap className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.32em]">
              Learn Mode
            </span>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Practice <span className="text-brand-cyan">system design</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-500">
            Pick a scenario, build your architecture answer, and get senior-level
            review with interview-readiness scoring - then generate an
            interview-ready explanation.
          </p>
        </header>

        <section>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Scenarios
            </h2>
            <span className="text-xs text-slate-500">
              {LEARNING_SCENARIOS.length} scenarios
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {LEARNING_SCENARIOS.map((s) => (
              <Link
                key={s.id}
                href={`/learn/${s.id}`}
                className="group flex flex-col rounded-md border border-navy-700 bg-navy-900 p-5 transition hover:border-brand-blue/50"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span
                    className={`rounded-sm px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] ${DIFFICULTY_CLASS[s.difficulty]}`}
                  >
                    {s.difficulty}
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-brand-cyan" />
                </div>
                <h3 className="text-lg font-semibold leading-tight">{s.title}</h3>
                <p className="mt-1.5 line-clamp-3 text-sm text-slate-600">
                  {s.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {s.concepts.slice(0, 3).map((c) => (
                    <span
                      key={c}
                      className="rounded-full border border-navy-700 bg-paper-soft px-2 py-0.5 text-[11px] text-slate-600"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <div className="mb-5 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-brand-cyan" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Study paths
            </h2>
          </div>
          <p className="mb-5 max-w-2xl text-sm text-slate-600">
            Short concept modules to study the ideas behind the components. Each
            ends with a mini challenge to apply it.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {COURSE_MODULES.map((m) => (
              <details
                key={m.id}
                className="group rounded-md border border-navy-700 bg-navy-900 p-5 [&_summary]:cursor-pointer"
              >
                <summary className="list-none">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{m.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">{m.description}</p>
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-400 transition group-open:rotate-90" />
                  </div>
                </summary>
                <div className="mt-4 space-y-4 border-t border-navy-700 pt-4 text-sm">
                  <div>
                    <p className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-cyan">
                      Key ideas
                    </p>
                    <ul className="space-y-1.5 text-slate-700">
                      {m.keyIdeas.map((k) => (
                        <li key={k} className="flex items-start gap-2">
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-cyan" />
                          {k}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-600">
                      Common mistakes
                    </p>
                    <ul className="space-y-1.5 text-slate-700">
                      {m.commonMistakes.map((k) => (
                        <li key={k} className="flex items-start gap-2">
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-500" />
                          {k}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {m.miniChallenge && (
                    <p className="rounded-md border border-navy-700 bg-paper-soft px-3 py-2 text-slate-700">
                      <span className="font-semibold text-ink">Mini challenge: </span>
                      {m.miniChallenge}
                    </p>
                  )}
                </div>
              </details>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
