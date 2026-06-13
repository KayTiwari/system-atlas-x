"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { CATALOG } from "@/lib/catalog";
import type { ArchitectureFlowNode } from "@/lib/types";

export function ComponentNode({ data, selected }: NodeProps<ArchitectureFlowNode>) {
  const entry = CATALOG[data.architectureType];
  const Icon = entry.icon;

  return (
    <div
      className={`flex w-48 items-center gap-3 rounded-xl border bg-navy-800 px-3 py-2.5 shadow-lg transition ${
        selected
          ? "border-brand-blue ring-2 ring-brand-blue/40"
          : "border-navy-700"
      }`}
    >
      <Handle type="target" position={Position.Left} />
      <span className={`shrink-0 ${entry.accent}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-ink">{data.name}</p>
        <p className="truncate text-xs text-slate-500">
          {data.technology || entry.label}
        </p>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export const nodeTypes = { component: ComponentNode };
