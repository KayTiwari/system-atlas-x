import type {
  ArchitectureBrief,
  ArchitectureFlowNode,
  ArchitectureNodeType,
  Availability,
  DataSensitivity,
} from "./types";

/**
 * A normalized view of a project used by the linter, the skeleton generator,
 * and the Tradeoff Engine. Derived from the brief (keyword detection over the
 * free-text fields) plus which component types are already on the canvas.
 * Pure: no side effects, easy to test.
 */
export type ArchitectureContext = {
  dataSensitivity: DataSensitivity;
  availability: Availability;
  hasPayments: boolean;
  hasFileUploads: boolean;
  hasExternalUsers: boolean;
  hasPublicApi: boolean;
  hasSearch: boolean;
  hasAI: boolean;
  hasRealtime: boolean;
  isHighTraffic: boolean;
  hasCompliance: boolean;
  /** Component types currently present on the canvas. */
  present: Set<ArchitectureNodeType>;
};

function briefText(brief: ArchitectureBrief): string {
  return [
    brief.productGoal,
    brief.users,
    brief.trafficAssumptions,
    brief.latencyNeeds,
    ...brief.coreFlows,
    ...brief.integrations,
    ...brief.compliance,
  ]
    .join(" \n ")
    .toLowerCase();
}

const PATTERNS = {
  payments: /payment|stripe|checkout|billing|invoice|charge|subscription/,
  files: /upload|file|document|image|video|attachment|photo|pdf|media/,
  external:
    /customer|external|public|partner|consumer|client-facing|user-facing|end user|marketplace|shopper|buyer|seller/,
  search: /search|full[- ]?text|filter|discovery|autocomplete/,
  ai: /\bai\b|rag|llm|embedding|recommendation|semantic|gpt|chatbot|vector/,
  realtime: /real[- ]?time|live|chat|tracking|websocket|stream|presence/,
  highTraffic:
    /million|billions?|high traffic|peak|thousands?|\/sec|\/s\b|qps|rps|spike|viral|scale/,
};

export function deriveContext(
  brief: ArchitectureBrief,
  nodes: ArchitectureFlowNode[] = []
): ArchitectureContext {
  const text = briefText(brief);
  const present = new Set(nodes.map((n) => n.data.architectureType));
  const hasExternalUsers = PATTERNS.external.test(text);

  return {
    dataSensitivity: brief.dataSensitivity,
    availability: brief.availability,
    hasPayments: PATTERNS.payments.test(text),
    hasFileUploads: PATTERNS.files.test(text),
    hasExternalUsers,
    hasPublicApi: hasExternalUsers || present.has("api_gateway"),
    hasSearch: PATTERNS.search.test(text),
    hasAI: PATTERNS.ai.test(text),
    hasRealtime: PATTERNS.realtime.test(text),
    isHighTraffic: PATTERNS.highTraffic.test(text),
    hasCompliance: brief.compliance.length > 0,
    present,
  };
}
