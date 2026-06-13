"use client";

import { CATALOG_LIST, PALETTE_GROUPS } from "@/lib/catalog";
import type { ArchitectureNodeType } from "@/lib/types";

export const PALETTE_DND_TYPE = "application/system-atlas-node";

export function Palette() {
  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-navy-700 bg-navy-900">
      <div className="border-b border-navy-700 px-4 py-3">
        <h2 className="text-sm font-semibold text-ink">Components</h2>
        <p className="text-xs text-slate-500">Drag onto the canvas</p>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-3 thin-scroll">
        {PALETTE_GROUPS.map((group) => {
          const items = CATALOG_LIST.filter((e) => e.group === group);
          if (items.length === 0) return null;
          return (
            <div key={group} className="mb-4">
              <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
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
                      className="flex cursor-grab items-center gap-2.5 rounded-lg border border-navy-700 bg-navy-800/60 px-2.5 py-2 text-sm transition hover:border-brand-blue/50 active:cursor-grabbing"
                    >
                      <span className={entry.accent}>
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
