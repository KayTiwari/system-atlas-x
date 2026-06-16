import { createId } from "./id";
import { defaultNodeData } from "./catalog";
import { deriveContext } from "./analysis";
import type {
  ArchitectureBrief,
  ArchitectureFlowNode,
  ArchitectureFlowEdge,
  ArchitectureNodeType,
} from "./types";

type Spec = { type: ArchitectureNodeType; col: number };

const COL_WIDTH = 260;
const ROW_HEIGHT = 110;

/**
 * Turn an architecture brief into a starter graph. Pure function - given the
 * same brief it always returns the same shape (modulo generated ids).
 */
export function generateSkeleton(brief: ArchitectureBrief): {
  nodes: ArchitectureFlowNode[];
  edges: ArchitectureFlowEdge[];
} {
  const ctx = deriveContext(brief);
  const specs: Spec[] = [];

  // Column 0: client. Column 1: edge/gateway. Column 2: compute.
  specs.push({ type: "web_app", col: 0 });

  if (ctx.hasPublicApi) {
    specs.push({ type: "api_gateway", col: 1 });
    specs.push({ type: "rate_limiter", col: 1 });
  }

  specs.push({ type: "api_service", col: 2 });
  specs.push({ type: "auth_provider", col: 2 });
  if (ctx.dataSensitivity === "high") {
    specs.push({ type: "authorization", col: 2 });
  }

  // Column 3: primary data.
  specs.push({ type: "sql_database", col: 3 });
  specs.push({ type: "cache", col: 3 });
  if (ctx.availability === "high") {
    specs.push({ type: "read_replica", col: 3 });
  }

  // Column 4: async + supporting stores.
  if (ctx.hasFileUploads) {
    specs.push({ type: "object_storage", col: 4 });
    specs.push({ type: "queue", col: 4 });
    specs.push({ type: "worker", col: 4 });
    specs.push({ type: "dead_letter_queue", col: 4 });
  }
  if (ctx.hasSearch) specs.push({ type: "search", col: 4 });
  if (ctx.hasAI) specs.push({ type: "vector_database", col: 4 });

  // Column 5: cross-cutting.
  if (ctx.dataSensitivity === "high" || ctx.hasCompliance) {
    specs.push({ type: "audit_log", col: 5 });
  }
  if (ctx.availability === "high") specs.push({ type: "backup", col: 5 });
  specs.push({ type: "monitoring", col: 5 });

  // Column 6: platform foundation every production system needs.
  specs.push({ type: "cloud_platform", col: 6 });
  specs.push({ type: "hosting", col: 6 });
  specs.push({ type: "ci_cd", col: 6 });

  // Build nodes, stacking each column vertically and centering roughly.
  const byCol = new Map<number, Spec[]>();
  for (const s of specs) {
    const arr = byCol.get(s.col) ?? [];
    arr.push(s);
    byCol.set(s.col, arr);
  }

  const nodes: ArchitectureFlowNode[] = [];
  const idByType = new Map<ArchitectureNodeType, string>();

  for (const [col, items] of byCol) {
    items.forEach((spec, row) => {
      const id = createId("node");
      // first node of a given type wins the lookup slot (used for edges)
      if (!idByType.has(spec.type)) idByType.set(spec.type, id);
      nodes.push({
        id,
        type: "component",
        position: {
          x: col * COL_WIDTH,
          y: row * ROW_HEIGHT - (items.length * ROW_HEIGHT) / 2,
        },
        data: defaultNodeData(spec.type),
      });
    });
  }

  const edges: ArchitectureFlowEdge[] = [];
  const link = (from: ArchitectureNodeType, to: ArchitectureNodeType) => {
    const source = idByType.get(from);
    const target = idByType.get(to);
    if (source && target) {
      edges.push({ id: createId("edge"), source, target, type: "default" });
    }
  };

  const entry: ArchitectureNodeType = ctx.hasPublicApi
    ? "api_gateway"
    : "api_service";
  link("web_app", entry);
  if (ctx.hasPublicApi) {
    link("api_gateway", "api_service");
    link("api_gateway", "auth_provider");
  } else {
    link("api_service", "auth_provider");
  }
  link("api_service", "sql_database");
  link("api_service", "cache");
  link("sql_database", "read_replica");
  link("api_service", "object_storage");
  link("api_service", "queue");
  link("queue", "worker");
  link("queue", "dead_letter_queue");
  link("worker", "object_storage");
  link("api_service", "search");
  link("api_service", "vector_database");
  link("api_service", "audit_log");
  link("sql_database", "backup");
  link("api_service", "external_api");
  // Platform foundation: code ships through CI/CD onto hosting on the cloud.
  link("ci_cd", "hosting");
  link("hosting", "api_service");
  link("cloud_platform", "hosting");

  return { nodes, edges };
}
