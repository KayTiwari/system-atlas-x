"use client";

import { type ReactNode, type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variantClasses: Record<Variant, string> = {
  primary:
    "border border-brand-blue bg-brand-blue text-white shadow-[0_10px_24px_rgba(31,77,68,0.16)] hover:bg-brand-blue-dark",
  secondary:
    "border border-navy-600 bg-navy-900 text-ink hover:border-brand-blue/60 hover:bg-paper-soft",
  ghost: "text-slate-600 hover:text-ink hover:bg-paper-soft",
  danger:
    "border border-red-500/30 bg-transparent text-red-500 hover:bg-red-500/10",
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: { variant?: Variant; children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold leading-none transition disabled:cursor-not-allowed disabled:opacity-40 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-md border border-navy-700 bg-navy-900 shadow-[0_1px_0_rgba(28,27,25,0.04)] ${className}`}
    >
      {children}
    </div>
  );
}

const severityChip: Record<string, string> = {
  draft: "bg-slate-500/15 text-slate-600",
  reviewed: "bg-brand-cyan/15 text-brand-cyan",
  accepted: "bg-emerald-500/15 text-emerald-300",
  info: "bg-slate-500/15 text-slate-600",
  warning: "bg-amber-500/15 text-amber-300",
  critical: "bg-red-500/15 text-red-500",
  low: "bg-slate-500/15 text-slate-600",
  medium: "bg-amber-500/15 text-amber-300",
  high: "bg-emerald-500/15 text-emerald-300",
  proposed: "bg-slate-500/15 text-slate-600",
  rejected: "bg-red-500/15 text-red-500",
  deprecated: "bg-slate-500/15 text-slate-500 line-through",
};

export function Chip({ label }: { label: string }) {
  const cls = severityChip[label] ?? "bg-navy-700 text-slate-600";
  return (
    <span
      className={`inline-block rounded-sm px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] ${cls}`}
    >
      {label}
    </span>
  );
}
