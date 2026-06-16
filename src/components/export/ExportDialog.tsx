"use client";

import { useRef, useState } from "react";
import { ReactFlow, Background } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { FileJson, FileText, Image as ImageIcon } from "lucide-react";
import { nodeTypes } from "@/components/canvas/nodes/ComponentNode";
import { projectToJson, downloadFile, slugify } from "@/lib/export/json";
import { projectToMarkdown } from "@/lib/export/markdown";
import { exportElementToPng } from "@/lib/export/png";
import type { Project } from "@/lib/types";
import { Button, Panel } from "@/components/ui/primitives";

export function ExportDialog({ project }: { project: Project }) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const slug = slugify(project.name);

  function exportJson() {
    downloadFile(
      `${slug}.json`,
      projectToJson(project),
      "application/json"
    );
  }

  function exportMarkdown() {
    downloadFile(
      `${slug}.md`,
      projectToMarkdown(project),
      "text/markdown"
    );
  }

  async function exportPng() {
    if (!previewRef.current) return;
    setBusy(true);
    try {
      await exportElementToPng(previewRef.current, `${slug}.png`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Export</h2>
        <p className="mt-1 text-slate-500">
          Take your architecture out as a portable file, a design doc, or an
          image. (Import lives on the dashboard.)
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <ExportCard
          icon={<FileJson className="h-5 w-5 text-brand-cyan" />}
          title="JSON"
          desc="Full project. Re-import from the dashboard."
          onClick={exportJson}
          label="Export JSON"
        />
        <ExportCard
          icon={<FileText className="h-5 w-5 text-brand-cyan" />}
          title="Markdown"
          desc="A generated design doc with components, decisions, and review."
          onClick={exportMarkdown}
          label="Export Markdown"
        />
        <ExportCard
          icon={<ImageIcon className="h-5 w-5 text-brand-cyan" />}
          title="PNG"
          desc="A snapshot of the architecture diagram below."
          onClick={exportPng}
          label={busy ? "Rendering…" : "Export PNG"}
          disabled={busy || project.nodes.length === 0}
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-slate-500">
          Diagram preview
        </p>
        <div
          ref={previewRef}
          className="h-[360px] w-full overflow-hidden rounded-md border border-navy-700 bg-navy-900"
        >
          <ReactFlow
            nodes={project.nodes}
            edges={project.edges}
            nodeTypes={nodeTypes}
            fitView
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#1e2d45" gap={20} />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}

function ExportCard({
  icon,
  title,
  desc,
  onClick,
  label,
  disabled,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  onClick: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <Panel className="flex flex-col p-4">
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <span className="font-semibold">{title}</span>
      </div>
      <p className="mb-4 flex-1 text-sm text-slate-500">{desc}</p>
      <Button variant="secondary" onClick={onClick} disabled={disabled}>
        {label}
      </Button>
    </Panel>
  );
}
