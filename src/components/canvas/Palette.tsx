"use client";

import { CATALOG_LIST, PALETTE_GROUPS } from "@/lib/catalog";
import type { ArchitectureNodeType } from "@/lib/types";

export const PALETTE_DND_TYPE = "application/system-atlas-node";

export function Palette() {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-navy-700 bg-navy-900/95">
      <div className="border-b border-navy-700 px-4 py-4">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-cyan">
          Part library
        </p>
        <h2 className="mt-1 text-sm font-semibold text-ink">Components</h2>
        <p className="text-xs text-slate-500">Drag a part onto the drawing surface</p>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-3 thin-scroll">
        {PALETTE_GROUPS.map((group) => {
          const items = CATALOG_LIST.filter((e) => e.group === group);
          if (items.length === 0) return null;
          return (
            <div key={group} className="mb-4">
              <p className="mb-2 px-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                {group}
              </p>
              <div className="grid gap-1.5">
                {items.map((entry) => {
                  const Icon = entry.icon;
                  return (
                    <div
                      key={entry.type}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData(
                          PALETTE_DND_TYPE,
                          entry.type satisfies ArchitectureNodeType
                        );
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      className="flex cursor-grab items-center gap-2.5 rounded-md border border-navy-700 bg-navy-900 px-2.5 py-2 text-sm transition hover:border-brand-blue/50 hover:bg-paper-soft active:cursor-grabbing"
                    >
                      <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-sm border border-navy-700 bg-paper-soft ${entry.accent}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="truncate text-slate-700">
                        {entry.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
