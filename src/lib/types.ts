import type { Node, Edge } from "@xyflow/react";

/**
 * The kind of architecture component a node represents. This lives inside
 * `node.data.architectureType` and NOT in React Flow's `node.type` - React Flow
 * uses `node.type` to pick a renderer (always "component" here). Keeping them
 * separate avoids a nasty collision.
 */
export type ArchitectureNodeType =
  | "web_app"
  | "api_gateway"
  | "api_service"
  | "rate_limiter"
  | "auth_provider"
  | "authorization"
  | "sql_database"
  | "nosql_database"
  | "object_storage"
  | "cache"
  | "queue"
  | "dead_letter_queue"
  | "worker"
  | "cdn"
  | "audit_log"
  | "backup"
  | "read_replica"
  | "search"
  | "vector_database"
  | "external_api"
  | "monitoring"
  | "ci_cd"
  | "hosting"
  | "cloud_platform";

/** Editable reasoning metadata attached to every node. */
export type ArchitectureNodeData = {
  architectureType: ArchitectureNodeType;
  name: string;
  description: string;
  technology?: string;
  owner?: string;
  scalingStrategy?: string;
  failureMode?: string;
  cacheInvalidationStrategy?: string;
  dataStored: string[];
  securityNotes: string[];
  costNotes: string[];
  linkedDecisions: string[];
};

export type ArchitectureEdgeData = {
  protocol?: string;
  description?: string;
  dataFlow?: string;
};

export type ArchitectureFlowNode = Node<ArchitectureNodeData, "component">;
export type ArchitectureFlowEdge = Edge<ArchitectureEdgeData>;

/** Decision categories the Tradeoff Engine reasons about. */
export type DecisionCategory =
  | "database"
  | "sqlDatabase"
  | "noSqlDatabase"
  | "cache"
  | "queue"
  | "compute"
  | "api"
  | "storage"
  | "objectStorage"
  | "search"
  | "auth"
  | "vectorStore"
  | "observability";

/** Criteria each technology option is scored against (1-5, for comparison only). */
export type DecisionCriterion =
  | "simplicity"
  | "scalability"
  | "cost"
  | "consistency"
  | "operationalComplexity"
  | "teamFamiliarity"
  | "vendorLockIn"
  | "latency"
  | "compliance";

export type DataSensitivity = "low" | "medium" | "high";
export type Availability = "best_effort" | "standard" | "high";

export type ArchitectureBrief = {
  productGoal: string;
  users: string;
  coreFlows: string[];
  trafficAssumptions: string;
  dataSensitivity: DataSensitivity;
  availability: Availability;
  latencyNeeds: string;
  integrations: string[];
  compliance: string[];
};

export type ReviewSeverity = "info" | "warning" | "critical";
export type ReviewFinding = {
  id: string;
  severity: ReviewSeverity;
  title: string;
  description: string;
  recommendation: string;
};

/**
 * A recommendation that lives ON the project (persisted), as opposed to the
 * linter's rule findings which are recomputed live. Sourced either from the
 * user (hand-authored note) or the AI assistant. An optional `category` lets a
 * suggestion surface next to the matching Tradeoff Engine recommendation.
 */
export type SuggestionSource = "ai" | "user";
export type Suggestion = {
  id: string;
  source: SuggestionSource;
  severity: ReviewSeverity;
  title: string;
  description: string;
  recommendation: string;
  category?: DecisionCategory;
  createdAt: string;
};

/**
 * A wireframe / sketch the user uploads as the source of truth for their
 * design. Stored as a downscaled data URL so it round-trips through
 * localStorage and JSON export without a backend.
 */
export type ReferenceImage = {
  dataUrl: string;
  name: string;
  addedAt: string;
};

export type DecisionStatus = "proposed" | "accepted" | "rejected" | "deprecated";
export type Decision = {
  id: string;
  title: string;
  context: string;
  decision: string;
  alternatives: string[];
  tradeoffs: string[];
  status: DecisionStatus;
};

/**
 * Output of the Tradeoff Engine. A clean object for the UI to render and for
 * "Create ADR from this choice" to consume without spaghetti.
 */
export type DecisionRecommendation = {
  id: string;
  category: DecisionCategory;
  title: string;
  recommendedOptionId: string;
  reason: string;
  alternatives: string[];
  tradeoffs: string[];
  confidence: "low" | "medium" | "high";
  matchedRuleIds: string[];
  targetNodeId?: string;
};

export type ProjectStatus = "draft" | "reviewed" | "accepted";

export type Project = {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  brief: ArchitectureBrief;
  nodes: ArchitectureFlowNode[];
  edges: ArchitectureFlowEdge[];
  decisions: Decision[];
  suggestions: Suggestion[];
  referenceImage?: ReferenceImage | null;
};

export function emptyBrief(): ArchitectureBrief {
  return {
    productGoal: "",
    users: "",
    coreFlows: [],
    trafficAssumptions: "",
    dataSensitivity: "medium",
    availability: "standard",
    latencyNeeds: "",
    integrations: [],
    compliance: [],
  };
}
