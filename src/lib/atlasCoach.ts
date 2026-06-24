import { CATALOG } from "./catalog";
import { getComponentKnowledge } from "./knowledge";
import type {
  ArchitectureMode,
  ComponentId,
  CoachTip,
  LearningScenario,
  ReviewItem,
  ArchitectureScore,
} from "./learnTypes";

export type CoachInput = {
  mode: ArchitectureMode;
  selectedComponentIds: ComponentId[];
  selectedComponentId?: ComponentId;
  scenario?: LearningScenario;
  reviewItems: ReviewItem[];
  score?: ArchitectureScore;
};

function label(id: ComponentId): string {
  return CATALOG[id]?.label ?? id;
}

/** Component-specific nudges shown right after a component is selected/added. */
const COMPONENT_TIPS: Partial<Record<ComponentId, { title: string; message: string }>> = {
  api_gateway: {
    title: "Good entry point",
    message:
      "Now think about authentication, rate limiting, schema validation, and observability at this edge.",
  },
  queue: {
    title: "Decoupling slow work",
    message:
      "Queues help decouple slow or unreliable work. Pair them with idempotent consumers, retries, and a dead-letter queue.",
  },
  sql_database: {
    title: "Clarify read/write patterns",
    message:
      "Your read/write pattern determines indexing, caching, replication, and backup strategy. State it explicitly.",
  },
  nosql_database: {
    title: "Model around access patterns",
    message:
      "NoSQL rewards known access patterns. Model the table around your queries and name the consistency model.",
  },
  payment_provider: {
    title: "Payments need rigor",
    message:
      "Payment systems need idempotency, audit logs, reconciliation, and safe retry behavior.",
  },
  cache: {
    title: "Plan invalidation",
    message:
      "A cache is only as good as its invalidation. Define TTLs and how it's invalidated on writes.",
  },
  event_bus: {
    title: "Name the subscribers",
    message:
      "An event bus fans out to many consumers. Make them idempotent and version your event schemas.",
  },
  object_storage: {
    title: "Control file access",
    message:
      "Keep files in object storage with metadata and ACLs in the DB. Use signed URLs, not public buckets.",
  },
  auth_provider: {
    title: "Authn vs authz",
    message:
      "Authentication establishes identity; authorization decides what each role can do. You need both.",
  },
};

/**
 * Atlas Coach: 1-3 calm, senior-engineer nudges based on mode, scenario,
 * selection, and review results. Never noisy - the most relevant first.
 */
export function getAtlasCoachTips(input: CoachInput): CoachTip[] {
  const { mode, selectedComponentIds, selectedComponentId, scenario, reviewItems, score } = input;
  const tips: CoachTip[] = [];
  const selected = new Set(selectedComponentIds);

  // Empty state
  if (selectedComponentIds.length === 0) {
    tips.push(
      mode === "learn"
        ? {
            id: "empty-learn",
            title: "Start with the request path",
            message:
              "What receives traffic first - client, CDN, load balancer, or API gateway? In interviews, explain that first and why.",
            severity: "tip",
            suggestedComponentIds: ["web_app", "api_gateway", "api_service", "sql_database"],
          }
        : {
            id: "empty-build",
            title: "Start from the core flow",
            message:
              "What happens when a user takes the most important action in your product? Add those building blocks, or generate a starter architecture from your brief.",
            severity: "tip",
            suggestedComponentIds: ["web_app", "api_service", "sql_database"],
          }
    );
    return tips;
  }

  // Selected component nudge (highest relevance)
  if (selectedComponentId && COMPONENT_TIPS[selectedComponentId]) {
    const t = COMPONENT_TIPS[selectedComponentId]!;
    const k = getComponentKnowledge(selectedComponentId);
    tips.push({
      id: `component-${selectedComponentId}`,
      title: t.title,
      message: t.message,
      severity: "tip",
      suggestedComponentIds: k.relatedComponentIds.filter((id) => !selected.has(id)).slice(0, 3),
    });
  }

  // Most important open finding becomes a coach nudge
  const topFinding =
    reviewItems.find((i) => i.type === "critical") ??
    reviewItems.find((i) => i.type === "warning");
  if (topFinding && tips.length < 3) {
    tips.push({
      id: `finding-${topFinding.id}`,
      title: topFinding.title,
      message: (mode === "learn" ? topFinding.interviewTip : topFinding.buildTip) ?? topFinding.message,
      severity: "warning",
      suggestedComponentIds: topFinding.suggestedComponentIds.filter((id) => !selected.has(id)),
    });
  }

  // Observability reminder if absent and several components present
  if (
    tips.length < 3 &&
    selectedComponentIds.length >= 4 &&
    !selected.has("monitoring") &&
    !tips.some((t) => t.suggestedComponentIds?.includes("monitoring"))
  ) {
    tips.push({
      id: "coach-observability",
      title: "You can't operate what you can't see",
      message:
        "Add logs, metrics, traces, and correlation IDs so you can debug this once it's running.",
      severity: "tip",
      suggestedComponentIds: ["monitoring"],
    });
  }

  // High-score praise
  if (tips.length < 3 && score && score.overall >= 85) {
    tips.push(
      mode === "learn"
        ? {
            id: "praise-learn",
            title: "This is becoming interview-ready",
            message:
              "Now practice explaining the request flow and tradeoffs out loud, end to end.",
            severity: "praise",
          }
        : {
            id: "praise-build",
            title: "Solid starting point",
            message:
              "Next, turn this into implementation phases and write down the open questions.",
            severity: "praise",
          }
    );
  }

  // Scenario-specific nudge if still room
  if (tips.length < 3 && scenario) {
    const missingCritical = scenario.criticalComponentIds.find((id) => !selected.has(id));
    if (missingCritical) {
      tips.push({
        id: `scenario-${missingCritical}`,
        title: `Consider ${label(missingCritical)}`,
        message: `For ${scenario.title}, ${label(missingCritical)} is usually expected.`,
        severity: "tip",
        suggestedComponentIds: [missingCritical],
      });
    }
  }

  return tips.slice(0, 3);
}
