"use client";

import { useState } from "react";
import {
  MessageCircle,
  ClipboardList,
} from "lucide-react";

const TIPS = [
  "Start in Brief, then Generate skeleton to turn your requirements into a starting diagram.",
  "Drag components from the left palette onto the canvas, and drag between the dots on each node to connect them.",
  "Click any node to edit its reasoning, and use Swap technology to try alternatives in place.",
  "Run Review to catch gaps, and Tradeoffs to compare technologies. Turn a recommendation into a Decision in one click.",
  "Export to JSON, Markdown, or PNG from the Export tab. Re-import JSON from the dashboard.",
];

/**
 * Floating help in the bottom-right corner. Doubles as the reserved spot for a
 * future in-app design assistant (chatbot).
 */
export function HelpButton() {
  const [open, setOpen] = useState(false);
  const [rendered, setRendered] = useState(false);

  function showGuide() {
    setRendered(true);
    setOpen(true);
  }

  function hideGuide() {
    setOpen(false);
    window.setTimeout(() => setRendered(false), 180);
  }

  function toggleGuide() {
    if (rendered && open) hideGuide();
    else showGuide();
  }

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {rendered && (
        <div
          className={`guide-popover mb-3 w-80 rounded-md border border-navy-700 bg-navy-900 p-4 shadow-[0_24px_80px_rgba(28,27,25,0.18)] ${
            open ? "guide-popover-open" : "guide-popover-close"
          }`}
        >
          <div className="mb-3 flex items-center gap-2 text-brand-cyan">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em]">
              Field guide
            </span>
          </div>
          <ul className="space-y-2.5">
            {TIPS.map((text, i) => {
              return (
                <li key={i} className="flex gap-2.5 text-sm text-slate-600">
                  <span className="mt-0.5 font-mono text-[10px] font-semibold text-brand-cyan">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{text}</span>
                </li>
              );
            })}
          </ul>
          <button
            onClick={hideGuide}
            className="mt-4 w-full rounded-md border border-navy-700 bg-paper-soft/70 px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 transition hover:border-brand-blue/50 hover:text-brand-cyan"
          >
            Close guide
          </button>
          <div className="mt-4 flex items-center gap-2 rounded-md border border-dashed border-navy-600 bg-paper-soft/70 px-3 py-2 text-xs text-slate-500">
            <MessageCircle className="h-4 w-4" />
            <span>Design assistant</span>
            <span className="ml-auto rounded-sm bg-navy-700 px-2 py-0.5 font-medium">
              Coming soon
            </span>
          </div>
        </div>
      )}
      <button
        onClick={toggleGuide}
        title="Help & getting started"
        aria-expanded={open}
        className="flex h-12 w-12 items-center justify-center rounded-md border border-brand-blue bg-brand-blue text-white shadow-lg shadow-brand-blue/30 transition hover:bg-brand-blue-dark"
      >
        {open ? <MessageCircle className="h-5 w-5" /> : <span className="ai-launcher-mark" aria-hidden="true" />}
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
      <div className="pointer-events-auto max-w-md rounded-md border border-navy-700 bg-navy-900/95 p-6 text-center shadow-xl backdrop-blur">
        <div className="eyebrow mb-2 font-mono text-[10px] font-semibold uppercase text-brand-cyan">
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
              <strong className="text-ink">blueprints</strong> on the dashboard.
            </span>
          </li>
        </ul>
        <button
          onClick={onGoToBrief}
          className="mt-5 inline-flex items-center gap-2 rounded-md border border-brand-blue bg-brand-blue px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-blue-dark"
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
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-brand-blue font-mono text-xs font-semibold text-white">
      {n}
    </span>
  );
}
