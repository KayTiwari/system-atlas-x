"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { CATALOG } from "@/lib/catalog";
import type { ArchitectureFlowNode } from "@/lib/types";
import { ComponentGlyph } from "@/components/canvas/ComponentGlyph";

export function ComponentNode({ data, selected }: NodeProps<ArchitectureFlowNode>) {
  const entry = CATALOG[data.architectureType];

  return (
    <div
      className={`flex w-52 items-center gap-3 rounded-md border bg-navy-900 px-3 py-2.5 shadow-[0_10px_26px_rgba(28,27,25,0.08)] transition ${
        selected
          ? "border-brand-blue ring-2 ring-brand-blue/20"
          : "border-navy-700"
      }`}
    >
      <Handle type="target" position={Position.Left} />
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-sm border border-navy-700 bg-paper-soft">
        <ComponentGlyph
          technology={data.technology}
          fallbackIcon={entry.icon}
          accent={entry.accent}
        />
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
