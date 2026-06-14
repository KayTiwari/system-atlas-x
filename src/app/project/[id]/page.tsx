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
  Network,
  ClipboardList,
  ShieldAlert,
  Scale,
  FileText,
  Download,
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
import { HelpButton, CanvasGuide } from "@/components/Guidance";
import { Chip } from "@/components/ui/primitives";

type Tab = "canvas" | "brief" | "review" | "tradeoffs" | "decisions" | "export";

const TABS: { id: Tab; label: string; icon: typeof Network }[] = [
  { id: "canvas", label: "Canvas", icon: Network },
  { id: "brief", label: "Brief", icon: ClipboardList },
  { id: "review", label: "Review", icon: ShieldAlert },
  { id: "tradeoffs", label: "Tradeoffs", icon: Scale },
  { id: "decisions", label: "Decisions", icon: FileText },
  { id: "export", label: "Export", icon: Download },
];

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

  const [tab, setTab] = useState<Tab>("canvas");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // React Flow owns the live graph during editing; seeded once from the store.
  const seed = useAtlasStore.getState().projects.find((p) => p.id === id);
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

  const generateFromBrief = useCallback(() => {
    const brief = useAtlasStore
      .getState()
      .projects.find((p) => p.id === id)?.brief;
    if (!brief) return;
    if (
      nodes.length > 0 &&
      !window.confirm(
        "Replace the current canvas with a freshly generated skeleton?"
      )
    ) {
      return;
    }
    const { nodes: n, edges: e } = generateSkeleton(brief);
    setNodes(n);
    setEdges(e);
    setSelectedNodeId(null);
    setTab("canvas");
  }, [id, nodes.length, setNodes, setEdges]);

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
      <main className="flex min-h-screen items-center justify-center bg-gradient-dark text-slate-500">
        Loading…
      </main>
    );
  }

  if (!project) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-dark">
        <p className="text-slate-600">This architecture could not be found.</p>
        <button
          onClick={() => router.push("/")}
          className="text-brand-cyan hover:underline"
        >
          Back to dashboard
        </button>
      </main>
    );
  }

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null;

  return (
    <main className="flex h-screen flex-col bg-gradient-dark">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-navy-700 bg-navy-900 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="rounded-md p-1.5 text-slate-500 hover:bg-navy-800 hover:text-ink"
            title="Back to dashboard"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-sm font-semibold leading-tight">
              {project.name}
            </h1>
            <p className="text-xs text-slate-500">
              {nodes.length} components · {project.decisions.length} decisions
            </p>
          </div>
          <Chip label={project.status} />
        </div>
        <nav className="flex gap-1">
          {TABS.map(({ id: t, label, icon: Icon }) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                tab === t
                  ? "bg-navy-700 text-ink"
                  : "text-slate-500 hover:bg-navy-800 hover:text-ink"
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
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
