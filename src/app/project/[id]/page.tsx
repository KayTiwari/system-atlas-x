"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
} from "@xyflow/react";
import {
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { useAtlasStore, useHasHydrated } from "@/lib/store";
import { defaultNodeData } from "@/lib/catalog";
import { generateSkeleton } from "@/lib/skeleton";
import { createId } from "@/lib/id";
import type {
  ArchitectureFlowNode,
  ArchitectureFlowEdge,
  ArchitectureNodeData,
  ArchitectureNodeType,
} from "@/lib/types";
import { Palette } from "@/components/canvas/Palette";
import { Canvas } from "@/components/canvas/Canvas";
import { Inspector } from "@/components/canvas/Inspector";
import { BriefForm } from "@/components/brief/BriefForm";
import { ReviewPanel } from "@/components/review/ReviewPanel";
import { TradeoffPanel } from "@/components/tradeoffs/TradeoffPanel";
import { DecisionList } from "@/components/decisions/DecisionList";
import { ExportDialog } from "@/components/export/ExportDialog";
import { AssistPanel } from "@/components/ai/AssistPanel";
import { HelpButton, CanvasGuide } from "@/components/Guidance";
import { Chip, ConfirmDialog } from "@/components/ui/primitives";

type Tab =
  | "canvas"
  | "brief"
  | "review"
  | "tradeoffs"
  | "assist"
  | "decisions"
  | "export";

const TABS: { id: Tab; label: string; hint: string }[] = [
  { id: "canvas", label: "Canvas", hint: "Arrange and connect components" },
  { id: "brief", label: "Brief", hint: "Describe what you're building" },
  { id: "review", label: "Review", hint: "Catch gaps and missing pieces" },
  { id: "tradeoffs", label: "Tradeoffs", hint: "Compare technology choices" },
  { id: "assist", label: "Assist", hint: "AI review of your design" },
  { id: "decisions", label: "Decisions", hint: "Recorded design decisions (ADRs)" },
  { id: "export", label: "Export", hint: "JSON, Markdown, or PNG design doc" },
];

function TabMark({ type }: { type: Tab }) {
  const common = {
    className: "h-[18px] w-[22px] shrink-0 text-brand-blue",
    viewBox: "0 0 22 18",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true,
  };
  const stroke = {
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "square" as const,
    strokeLinejoin: "miter" as const,
  };

  if (type === "canvas") {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="16" height="12" {...stroke} />
        <path d="M11 3v12M3 9h16" {...stroke} />
        <rect x="8" y="7" width="6" height="4" fill="currentColor" />
      </svg>
    );
  }

  if (type === "brief") {
    return (
      <svg {...common}>
        <path d="M6 2h8l3 3v11H6z" {...stroke} />
        <path d="M14 2v4h3M8 8h7M8 12h6" {...stroke} />
      </svg>
    );
  }

  if (type === "review") {
    return (
      <svg {...common}>
        <circle cx="9" cy="8" r="5" {...stroke} />
        <path d="M13 12l5 4" {...stroke} />
      </svg>
    );
  }

  if (type === "tradeoffs") {
    return (
      <svg {...common}>
        <path d="M11 2v14M5 6h12M5 6l-3 6h6zM17 6l-3 6h6z" {...stroke} />
      </svg>
    );
  }

  if (type === "assist") {
    return (
      <svg {...common}>
        <path d="M11 2v14M4 9h14M6 4l10 10M16 4L6 14" {...stroke} />
        <circle cx="11" cy="9" r="2" fill="currentColor" />
      </svg>
    );
  }

  if (type === "decisions") {
    return (
      <svg {...common}>
        <path d="M7 7V5a4 4 0 0 1 8 0v2" {...stroke} />
        <path d="M4 8h14v7H4zM8 12h6" {...stroke} />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M5 10v5h12v-5M11 2v9M7 7l4 4 4-4" {...stroke} />
    </svg>
  );
}

export default function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const hydrated = useHasHydrated();
  const router = useRouter();

  const project = useAtlasStore((s) => s.projects.find((p) => p.id === id));
  const setGraph = useAtlasStore((s) => s.setGraph);

  // React Flow owns the live graph during editing; seeded once from the store.
  const seed = useAtlasStore.getState().projects.find((p) => p.id === id);

  // A brand-new, empty project opens straight into the Brief (the real starting
  // point); anything that already has a diagram opens on the Canvas.
  const [tab, setTab] = useState<Tab>(
    seed && seed.nodes.length === 0 && !seed.brief.productGoal.trim()
      ? "brief"
      : "canvas"
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [confirmReplaceCanvas, setConfirmReplaceCanvas] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState<ArchitectureFlowNode>(
    seed?.nodes ?? []
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<ArchitectureFlowEdge>(
    seed?.edges ?? []
  );

  // Persist graph changes back to the store (skip the initial mount).
  const firstSync = useRef(true);
  useEffect(() => {
    if (firstSync.current) {
      firstSync.current = false;
      return;
    }
    setGraph(id, nodes, edges);
  }, [nodes, edges, id, setGraph]);

  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((eds) =>
        addEdge({ ...connection, id: createId("edge"), type: "default" }, eds)
      ),
    [setEdges]
  );

  const onAddNode = useCallback(
    (type: ArchitectureNodeType, position: { x: number; y: number }) => {
      const newNode: ArchitectureFlowNode = {
        id: createId("node"),
        type: "component",
        position,
        data: defaultNodeData(type),
      };
      setNodes((ns) => ns.concat(newNode));
      setSelectedNodeId(newNode.id);
    },
    [setNodes]
  );

  const updateSelectedNodeData = useCallback(
    (patch: Partial<ArchitectureNodeData>) => {
      if (!selectedNodeId) return;
      setNodes((ns) =>
        ns.map((n) =>
          n.id === selectedNodeId ? { ...n, data: { ...n.data, ...patch } } : n
        )
      );
    },
    [selectedNodeId, setNodes]
  );

  const applyGeneratedSkeleton = useCallback(() => {
    const brief = useAtlasStore
      .getState()
      .projects.find((p) => p.id === id)?.brief;
    if (!brief) return;
    const { nodes: n, edges: e } = generateSkeleton(brief);
    setNodes(n);
    setEdges(e);
    setSelectedNodeId(null);
    setTab("canvas");
    setConfirmReplaceCanvas(false);
  }, [id, setNodes, setEdges]);

  const generateFromBrief = useCallback(() => {
    if (nodes.length > 0) {
      setConfirmReplaceCanvas(true);
      return;
    }
    applyGeneratedSkeleton();
  }, [applyGeneratedSkeleton, nodes.length]);

  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes((ns) => ns.filter((n) => n.id !== nodeId));
      setEdges((eds) =>
        eds.filter((e) => e.source !== nodeId && e.target !== nodeId)
      );
      setSelectedNodeId((cur) => (cur === nodeId ? null : cur));
    },
    [setNodes, setEdges]
  );

  if (!hydrated) {
    return (
      <main className="atlas-grid-bg flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
      </main>
    );
  }

  if (!project) {
    return (
      <main className="atlas-grid-bg flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-slate-600">This architecture could not be found.</p>
        <button
          onClick={() => router.push("/build")}
          className="text-brand-cyan hover:underline"
        >
          Back to dashboard
        </button>
      </main>
    );
  }

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null;

  return (
    <main className="atlas-grid-bg flex h-screen flex-col">
      {/* Top bar */}
      <header className="flex min-h-[72px] items-center justify-between gap-4 border-b border-navy-700 bg-navy-900/95 px-4 py-3 backdrop-blur">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={() => router.push("/build")}
            className="rounded-md border border-navy-700 p-2 text-slate-600 hover:border-brand-blue/50 hover:bg-paper-soft hover:text-ink"
            title="Back to dashboard"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold leading-tight">
              {project.name}
            </h1>
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate-500">
              {nodes.length} components · {project.decisions.length} decisions
            </p>
          </div>
          <Chip label={project.status} />
        </div>
        <nav className="thin-scroll flex max-w-[62vw] gap-1 overflow-x-auto rounded-md border border-navy-700 bg-paper-soft p-1">
          {TABS.map(({ id: t, label, hint }) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              title={hint}
              className={`flex shrink-0 items-center gap-2 rounded px-3 py-2 text-sm font-semibold transition ${
                tab === t
                  ? "bg-navy-900 text-ink shadow-sm"
                  : "text-slate-600 hover:bg-navy-900/70 hover:text-ink"
              }`}
            >
              <TabMark type={t} />
              {label}
            </button>
          ))}
        </nav>
      </header>

      {/* Body */}
      <div className="min-h-0 flex-1">
        {tab === "canvas" && (
          <div className="flex h-full">
            <Palette />
            <div className="relative min-w-0 flex-1">
              <Canvas
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onAddNode={onAddNode}
                onSelectNode={setSelectedNodeId}
              />
              {nodes.length === 0 && (
                <CanvasGuide onGoToBrief={() => setTab("brief")} />
              )}
            </div>
            <Inspector
              node={selectedNode}
              onChange={updateSelectedNodeData}
              onDelete={deleteNode}
            />
          </div>
        )}

        {tab === "brief" && (
          <TabScroll>
            <BriefForm projectId={id} onGenerateSkeleton={generateFromBrief} />
          </TabScroll>
        )}

        {tab === "review" && (
          <TabScroll>
            <ReviewPanel project={{ ...project, nodes, edges }} />
          </TabScroll>
        )}

        {tab === "tradeoffs" && (
          <TabScroll>
            <TradeoffPanel projectId={id} nodes={nodes} />
          </TabScroll>
        )}

        {tab === "assist" && (
          <TabScroll>
            <AssistPanel project={{ ...project, nodes, edges }} />
          </TabScroll>
        )}

        {tab === "decisions" && (
          <TabScroll>
            <DecisionList projectId={id} />
          </TabScroll>
        )}

        {tab === "export" && (
          <TabScroll>
            <ExportDialog project={{ ...project, nodes, edges }} />
          </TabScroll>
        )}
      </div>

      <HelpButton />

      {confirmReplaceCanvas && (
        <ConfirmDialog
          title="Replace the current canvas?"
          body="Generating a new skeleton will replace the nodes and connections currently on this canvas."
          confirmLabel="Replace canvas"
          destructive
          onCancel={() => setConfirmReplaceCanvas(false)}
          onConfirm={applyGeneratedSkeleton}
        />
      )}
    </main>
  );
}

function TabScroll({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full overflow-y-auto thin-scroll">
      <div className="mx-auto max-w-3xl px-6 py-8">{children}</div>
    </div>
  );
}
