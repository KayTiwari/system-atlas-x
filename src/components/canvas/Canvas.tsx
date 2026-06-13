"use client";

import { useCallback, useRef } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { nodeTypes } from "./nodes/ComponentNode";
import { PALETTE_DND_TYPE } from "./Palette";
import type {
  ArchitectureFlowNode,
  ArchitectureFlowEdge,
  ArchitectureNodeType,
} from "@/lib/types";

type CanvasProps = {
  nodes: ArchitectureFlowNode[];
  edges: ArchitectureFlowEdge[];
  onNodesChange: OnNodesChange<ArchitectureFlowNode>;
  onEdgesChange: OnEdgesChange<ArchitectureFlowEdge>;
  onConnect: OnConnect;
  onAddNode: (type: ArchitectureNodeType, position: { x: number; y: number }) => void;
  onSelectNode: (id: string | null) => void;
};

function Flow(props: CanvasProps) {
  const { screenToFlowPosition } = useReactFlow();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData(
        PALETTE_DND_TYPE
      ) as ArchitectureNodeType;
      if (!type) return;
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      props.onAddNode(type, position);
    },
    [props, screenToFlowPosition]
  );

  const onNodeClick: NodeMouseHandler<ArchitectureFlowNode> = useCallback(
    (_e, node) => props.onSelectNode(node.id),
    [props]
  );

  return (
    <div ref={wrapperRef} className="h-full w-full">
      <ReactFlow
        nodes={props.nodes}
        edges={props.edges}
        nodeTypes={nodeTypes}
        onNodesChange={props.onNodesChange}
        onEdgesChange={props.onEdgesChange}
        onConnect={props.onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={() => props.onSelectNode(null)}
        onDrop={onDrop}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
        }}
        fitView
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ animated: true }}
      >
        <Background color="#1e2d45" gap={20} />
        <Controls className="!bg-navy-800" />
        <MiniMap
          pannable
          zoomable
          className="!bg-navy-900"
          maskColor="rgba(8,13,26,0.7)"
          nodeColor="#1e2d45"
        />
      </ReactFlow>
    </div>
  );
}

export function Canvas(props: CanvasProps) {
  return (
    <ReactFlowProvider>
      <Flow {...props} />
    </ReactFlowProvider>
  );
}
