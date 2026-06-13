"use client";

import { type ReactNode, type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-gradient-brand text-white hover:opacity-90 shadow-lg shadow-brand-blue/20",
  secondary:
    "bg-navy-700 text-ink hover:bg-navy-600 border border-navy-600",
  ghost: "text-slate-600 hover:text-ink hover:bg-navy-800",
  danger:
    "bg-transparent text-red-500 hover:bg-red-500/10 border border-red-500/30",
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: { variant?: Variant; children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${variantClasses[variant]} ${className}`}
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
      className={`rounded-xl border border-navy-700 bg-navy-800/60 ${className}`}
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
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${cls}`}
    >
      {label}
    </span>
  );
}
