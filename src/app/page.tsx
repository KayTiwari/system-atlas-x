import Link from "next/link";
import {
  ArrowRight,
  GraduationCap,
  Hammer,
  Search,
  ShieldAlert,
  Scale,
  MessageSquareQuote,
  FileText,
  Compass,
} from "lucide-react";
import { TopNav } from "@/components/nav/TopNav";
import { ExampleArchitecture } from "@/components/marketing/ExampleArchitecture";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-dark">
      <TopNav />

      <div className="mx-auto max-w-6xl px-5 pb-20 sm:px-6">
        {/* Hero */}
        <section className="pt-14 sm:pt-20">
          <div className="eyebrow mb-5 flex items-center gap-3 text-brand-cyan">
            <Compass className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.32em]">
              Architecture intelligence for engineers
            </span>
          </div>
          <h1 className="max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            Learn system design.{" "}
            <span className="gradient-text">Build real architectures.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl">
            Practice architecture decisions, uncover missing pieces, compare
            tradeoffs, and generate senior-level explanations - then design your
            real systems with the same engine.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/learn"
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-brand-blue bg-brand-blue px-6 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(31,77,68,0.16)] transition hover:bg-brand-blue-dark"
            >
              <GraduationCap className="h-4 w-4" /> Start Learning
            </Link>
            <Link
              href="/build"
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-navy-600 bg-navy-900 px-6 py-2.5 text-sm font-semibold text-ink transition hover:border-brand-blue/60 hover:bg-paper-soft"
            >
              <Hammer className="h-4 w-4" /> Build an Architecture
            </Link>
          </div>
        </section>

        {/* Mode cards */}
        <section className="mt-16 grid gap-5 lg:grid-cols-2">
          <ModeCard
            href="/learn"
            icon={<GraduationCap className="h-5 w-5" />}
            eyebrow="Learn Mode"
            title="Practice and prep for interviews"
            description="Work through system design scenarios, study architecture concepts, and generate interview-ready explanations - with senior-level review of every design."
            cta="Start Learning"
            points={[
              "10 guided scenarios with requirements and pitfalls",
              "Interview-readiness scoring and missing-piece detection",
              "Senior-level reference architectures to compare against",
            ]}
          />
          <ModeCard
            href="/build"
            icon={<Hammer className="h-5 w-5" />}
            eyebrow="Build Mode"
            title="Plan a real software architecture"
            description="Start from a guided brief or template, get a recommended starter architecture, review it for production risk, and export an implementation-ready spec."
            cta="Build Architecture"
            points={[
              "Recommended components from your project brief",
              "Production-risk review and suggested additions",
              "Exportable architecture spec (Markdown, JSON, PNG)",
            ]}
          />
        </section>

        {/* Value cards */}
        <section className="mt-16">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            One engine, two modes
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {VALUE_CARDS.map((v) => (
              <div
                key={v.title}
                className="rounded-md border border-navy-700 bg-navy-900 p-5"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-paper-soft text-brand-cyan">
                  {v.icon}
                </div>
                <h3 className="font-semibold">{v.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  {v.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Example output */}
        <section className="mt-16 overflow-hidden rounded-md border border-navy-700 bg-navy-900">
          <div className="border-b border-navy-700 p-6 sm:p-8">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-cyan">
              Example output
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              From a brief to a design you can defend
            </h2>
            <p className="mt-2 max-w-2xl text-slate-600">
              A URL shortener System Atlas reasons about: a typed component
              diagram, the tradeoff behind each choice, and the missing pieces a
              reviewer would flag.
            </p>
            <div className="mt-5">
              <ExampleArchitecture />
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 p-6 sm:p-8">
            <p className="text-sm text-slate-600">
              Study it as an interview scenario, or build your own from scratch.
            </p>
            <div className="flex gap-2">
              <Link
                href="/learn/url-shortener"
                className="inline-flex min-h-10 items-center gap-2 rounded-md border border-brand-blue bg-brand-blue px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-blue-dark"
              >
                Open this scenario <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/components"
                className="inline-flex min-h-10 items-center gap-2 rounded-md border border-navy-600 bg-navy-900 px-4 py-2 text-sm font-semibold text-ink transition hover:border-brand-blue/60 hover:bg-paper-soft"
              >
                Browse components
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function ModeCard({
  href,
  icon,
  eyebrow,
  title,
  description,
  cta,
  points,
}: {
  href: string;
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  points: string[];
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-lg border border-navy-700 bg-navy-900 p-6 transition hover:border-brand-blue/50 sm:p-8"
    >
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-brand text-white">
          {icon}
        </span>
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-cyan">
          {eyebrow}
        </span>
      </div>
      <h3 className="text-2xl font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-slate-600">{description}</p>
      <ul className="mt-4 space-y-2">
        {points.map((p) => (
          <li key={p} className="flex items-start gap-2 text-sm text-slate-600">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-cyan" />
            {p}
          </li>
        ))}
      </ul>
      <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-cyan">
        {cta}{" "}
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

const VALUE_CARDS: { icon: React.ReactNode; title: string; body: string }[] = [
  {
    icon: <Search className="h-4 w-4" />,
    title: "Guided system design scenarios",
    body: "Ten interview-grade prompts with requirements, constraints, and common pitfalls.",
  },
  {
    icon: <ShieldAlert className="h-4 w-4" />,
    title: "Architecture review",
    body: "Deterministic rules catch missing rate limiters, DLQs, idempotency, audit logs, and more.",
  },
  {
    icon: <Scale className="h-4 w-4" />,
    title: "Component tradeoffs & failure modes",
    body: "Every component carries when-to-use, alternatives, tradeoffs, and how it fails.",
  },
  {
    icon: <MessageSquareQuote className="h-4 w-4" />,
    title: "Interview-ready explanations",
    body: "Turn your design into a confident, first-person walkthrough of the request flow and tradeoffs.",
  },
  {
    icon: <FileText className="h-4 w-4" />,
    title: "Real architecture specs",
    body: "In Build Mode, export an implementation-ready spec from your project brief.",
  },
  {
    icon: <Compass className="h-4 w-4" />,
    title: "Atlas Coach guidance",
    body: "Quiet, senior-engineer nudges as you design - never popups, never noise.",
  },
];
