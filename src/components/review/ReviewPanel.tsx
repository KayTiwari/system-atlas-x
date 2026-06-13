"use client";

import { useMemo } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Info,
} from "lucide-react";
import { lintArchitecture } from "@/lib/linter";
import type { Project, ReviewSeverity } from "@/lib/types";
import { Panel } from "@/components/ui/primitives";

const SEVERITY_META: Record<
  ReviewSeverity,
  { icon: typeof Info; color: string; label: string }
> = {
  critical: { icon: AlertOctagon, color: "text-red-400", label: "Critical" },
  warning: { icon: AlertTriangle, color: "text-amber-400", label: "Warning" },
  info: { icon: Info, color: "text-slate-500", label: "Info" },
};

export function ReviewPanel({ project }: { project: Project }) {
  const findings = useMemo(
    () => lintArchitecture({ brief: project.brief, nodes: project.nodes }),
    [project.brief, project.nodes]
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Architecture review</h2>
        <p className="mt-1 text-slate-500">
          Rule-based checks over your brief and canvas. These catch the pieces
          teams most often forget.
        </p>
      </div>

      {findings.length === 0 ? (
        <Panel className="flex items-center gap-3 p-6">
          <ShieldCheck className="h-6 w-6 text-emerald-400" />
          <div>
            <p className="font-medium text-slate-800">No findings</p>
            <p className="text-sm text-slate-500">
              Nothing to flag yet. Add more of your design, or refine the brief,
              and re-check.
            </p>
          </div>
        </Panel>
      ) : (
        <div className="space-y-3">
          {findings.map((f) => {
            const meta = SEVERITY_META[f.severity];
            const Icon = meta.icon;
            return (
              <Panel key={f.id} className="p-4">
                <div className="flex items-start gap-3">
                  <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${meta.color}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-800">{f.title}</p>
                      <span
                        className={`text-xs font-semibold uppercase ${meta.color}`}
                      >
                        {meta.label}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {f.description}
                    </p>
                    <p className="mt-2 text-sm text-brand-cyan">
                      → {f.recommendation}
                    </p>
                  </div>
                </div>
              </Panel>
            );
          })}
        </div>
      )}
    </div>
  );
}
