"use client";

export function AiSignalVisual({
  compact = false,
  label = "live context",
}: {
  compact?: boolean;
  label?: string;
}) {
  return (
    <div
      className={`ai-signal relative overflow-hidden bg-[#f3efe6] ${
        compact ? "min-h-28" : "min-h-56"
      }`}
    >
      <div className="ai-signal-grid" />
      <div className="ai-signal-orb ai-signal-orb-a" />
      <div className="ai-signal-orb ai-signal-orb-b" />
      <div className="ai-signal-ribbon ai-signal-ribbon-a" />
      <div className="ai-signal-ribbon ai-signal-ribbon-b" />
      <div className="ai-signal-ribbon ai-signal-ribbon-c" />
      <div className="ai-signal-core" />
      <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-cyan">
          {label}
        </span>
        <span className="h-2 w-2 rounded-full bg-brand-cyan shadow-[0_0_16px_rgba(47,107,94,0.65)]" />
      </div>
    </div>
  );
}
