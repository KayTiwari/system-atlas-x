"use client";

import { useState } from "react";
import {
  HelpCircle,
  X,
  Sparkles,
  MessageCircle,
  ClipboardList,
  MousePointerClick,
  Repeat,
  ShieldAlert,
  Download,
} from "lucide-react";

const TIPS: { icon: typeof ClipboardList; text: string }[] = [
  {
    icon: ClipboardList,
    text: "Start in Brief, then Generate skeleton to turn your requirements into a starting diagram.",
  },
  {
    icon: MousePointerClick,
    text: "Drag components from the left palette onto the canvas, and drag between the dots on each node to connect them.",
  },
  {
    icon: Repeat,
    text: "Click any node to edit its reasoning, and use Swap technology to try alternatives in place.",
  },
  {
    icon: ShieldAlert,
    text: "Run Review to catch gaps, and Tradeoffs to compare technologies. Turn a recommendation into a Decision in one click.",
  },
  {
    icon: Download,
    text: "Export to JSON, Markdown, or PNG from the Export tab. Re-import JSON from the dashboard.",
  },
];

/**
 * Floating help in the bottom-right corner. Doubles as the reserved spot for a
 * future in-app design assistant (chatbot).
 */
export function HelpButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {open && (
        <div className="mb-3 w-80 rounded-xl border border-navy-700 bg-navy-900 p-4 shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-brand-cyan">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-semibold">Getting started</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-md p-1 text-slate-500 hover:bg-navy-800 hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <ul className="space-y-2.5">
            {TIPS.map((t, i) => {
              const Icon = t.icon;
              return (
                <li key={i} className="flex gap-2.5 text-sm text-slate-600">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-cyan" />
                  <span>{t.text}</span>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-dashed border-navy-600 bg-navy-800/40 px-3 py-2 text-xs text-slate-500">
            <MessageCircle className="h-4 w-4" />
            <span>Design assistant</span>
            <span className="ml-auto rounded-full bg-navy-700 px-2 py-0.5 font-medium">
              Coming soon
            </span>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        title="Help & getting started"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-brand text-white shadow-lg shadow-brand-blue/30 transition hover:opacity-90"
      >
        {open ? <X className="h-5 w-5" /> : <HelpCircle className="h-5 w-5" />}
      </button>
    </div>
  );
}

/**
 * Centered guide shown over an empty canvas to orient first-time users.
 */
export function CanvasGuide({ onGoToBrief }: { onGoToBrief: () => void }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-6">
      <div className="pointer-events-auto max-w-md rounded-2xl border border-navy-700 bg-navy-900/95 p-6 text-center shadow-xl backdrop-blur">
        <div className="eyebrow mb-2 text-xs font-semibold uppercase text-brand-cyan">
          Empty canvas
        </div>
        <h3 className="text-xl font-semibold">Three ways to start</h3>
        <ul className="mx-auto mt-4 space-y-3 text-left text-sm text-slate-600">
          <li className="flex gap-3">
            <Step n={1} />
            <span>
              Fill the <strong className="text-ink">Brief</strong> and click
              Generate skeleton to auto-build a starting architecture.
            </span>
          </li>
          <li className="flex gap-3">
            <Step n={2} />
            <span>
              Drag a component from the{" "}
              <strong className="text-ink">palette</strong> on the left onto the
              canvas.
            </span>
          </li>
          <li className="flex gap-3">
            <Step n={3} />
            <span>
              Or load a ready-made architecture from{" "}
              <strong className="text-ink">templates</strong> on the dashboard.
            </span>
          </li>
        </ul>
        <button
          onClick={onGoToBrief}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          <ClipboardList className="h-4 w-4" /> Go to the Brief
        </button>
        <p className="mt-3 text-xs text-slate-500">
          Then click any node to add its reasoning, and connect nodes by dragging
          between the dots.
        </p>
      </div>
    </div>
  );
}

function Step({ n }: { n: number }) {
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-xs font-semibold text-white">
      {n}
    </span>
  );
}
