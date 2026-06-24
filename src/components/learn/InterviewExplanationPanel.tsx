"use client";

import { useState } from "react";
import { MessageSquareQuote, Copy, Check } from "lucide-react";
import {
  generateInterviewExplanation,
  docToMarkdown,
} from "@/lib/explanationGenerator";
import type { ComponentId, LearningScenario, GeneratedDoc } from "@/lib/learnTypes";

export function InterviewExplanationPanel({
  scenario,
  selected,
}: {
  scenario: LearningScenario;
  selected: ComponentId[];
}) {
  const [doc, setDoc] = useState<GeneratedDoc | null>(null);
  const [copied, setCopied] = useState(false);

  function generate() {
    setDoc(generateInterviewExplanation(scenario, selected));
    setCopied(false);
  }

  async function copy() {
    if (!doc) return;
    try {
      await navigator.clipboard.writeText(docToMarkdown(doc));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  }

  if (!doc) {
    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center rounded-md border border-dashed border-navy-600 bg-navy-900/50 p-8 text-center">
        <MessageSquareQuote className="mb-3 h-7 w-7 text-brand-cyan" />
        <p className="max-w-sm text-sm text-slate-600">
          Turn your selected components into a confident, first-person interview
          walkthrough - requirements, request flow, scaling, reliability,
          security, and tradeoffs.
        </p>
        <button
          onClick={generate}
          disabled={selected.length === 0}
          className="mt-5 inline-flex items-center gap-2 rounded-md border border-brand-blue bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-blue-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          <MessageSquareQuote className="h-4 w-4" /> Generate Interview Explanation
        </button>
        {selected.length === 0 && (
          <p className="mt-2 text-xs text-slate-500">Add components first.</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold">{doc.title}</h3>
        <div className="flex gap-2">
          <button
            onClick={copy}
            className="inline-flex items-center gap-1.5 rounded-md border border-navy-600 bg-navy-900 px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-brand-blue/60 hover:bg-paper-soft"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy Markdown"}
          </button>
          <button
            onClick={generate}
            className="rounded-md border border-navy-600 bg-navy-900 px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-brand-blue/60 hover:bg-paper-soft"
          >
            Regenerate
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {doc.sections.map((section) => (
          <div key={section.heading}>
            <p className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-cyan">
              {section.heading}
            </p>
            <div className="space-y-1.5 text-sm leading-relaxed text-slate-700">
              {section.body.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
