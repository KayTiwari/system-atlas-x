import { CATALOG } from "./catalog";
import type {
  ComponentId,
  LearningScenario,
  GeneratedDoc,
} from "./learnTypes";

function label(id: ComponentId): string {
  return CATALOG[id]?.label ?? id;
}

function list(ids: ComponentId[]): string {
  const labels = ids.map(label);
  if (labels.length === 0) return "the selected components";
  if (labels.length === 1) return labels[0];
  return `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
}

const has = (ids: ComponentId[], id: ComponentId) => ids.includes(id);

/**
 * Deterministic interview explanation. Given the same scenario + components it
 * always produces the same first-person, interview-ready walkthrough.
 */
export function generateInterviewExplanation(
  scenario: LearningScenario,
  selected: ComponentId[]
): GeneratedDoc {
  const hasDb =
    has(selected, "sql_database") || has(selected, "nosql_database");
  const entry = selected.find((id) =>
    ["api_gateway", "load_balancer", "cdn", "web_app", "mobile_app"].includes(id)
  );

  const requestFlow: string[] = [];
  requestFlow.push(
    `A request starts at the ${
      entry ? label(entry) : "client"
    } and reaches the application service${
      has(selected, "api_gateway") ? " through the API gateway" : ""
    }${has(selected, "rate_limiter") ? ", which rate-limits and authenticates it" : ""}.`
  );
  if (hasDb)
    requestFlow.push(
      `The service reads and writes the ${
        has(selected, "sql_database") ? "SQL database" : "NoSQL database"
      } as the source of truth${
        has(selected, "cache") ? ", serving hot reads from the cache first" : ""
      }.`
    );
  if (has(selected, "queue"))
    requestFlow.push(
      `Slow or unreliable work is pushed onto a queue and handled by a worker off the request path${
        has(selected, "dead_letter_queue") ? ", with a dead-letter queue for poison messages" : ""
      }.`
    );
  if (has(selected, "event_bus"))
    requestFlow.push(
      "Domain events are published to an event bus that fans out to independent subscribers."
    );
  if (has(selected, "payment_provider"))
    requestFlow.push(
      `Payments go through the provider with idempotency keys, and the webhook${
        has(selected, "webhook_handler") ? " handler" : ""
      } - not the synchronous response - is treated as the source of truth for final state.`
    );

  return {
    title: `Interview Explanation: ${scenario.title}`,
    sections: [
      {
        heading: "Requirements summary",
        body: [
          scenario.description,
          `Functional: ${scenario.functionalRequirements.join("; ")}.`,
          `Non-functional: ${scenario.nonFunctionalRequirements.join("; ")}.`,
        ],
      },
      {
        heading: "High-level architecture",
        body: [
          `I'd build this from ${list(selected)}.`,
          "Each piece earns its place against a requirement - I'd avoid adding anything I can't justify.",
        ],
      },
      { heading: "Request flow", body: requestFlow },
      {
        heading: "Data model considerations",
        body: [
          hasDb
            ? `The ${
                has(selected, "sql_database") ? "relational database" : "NoSQL store"
              } is the source of truth; ${
                scenario.isReadHeavy ? "because this is read-heavy I model for fast reads and cache hot keys" : "I model around the core access patterns"
              }.`
            : "I'd add a primary database as the source of truth and model it around the core access patterns.",
          has(selected, "search")
            ? "A search index serves rich queries but is rebuilt from the database, never authoritative."
            : "Any derived store (cache, index) is rebuildable from the source of truth.",
        ],
      },
      {
        heading: "Scaling strategy",
        body: [
          scenario.isReadHeavy
            ? "This is read-heavy, so I scale reads with caching and read replicas before touching the write path."
            : "I keep services stateless so they scale horizontally behind a load balancer.",
          has(selected, "cdn")
            ? "Static and media content is served from a CDN to keep load off the origin."
            : "I'd front static/media content with a CDN as traffic grows.",
        ],
      },
      {
        heading: "Reliability strategy",
        body: [
          has(selected, "queue")
            ? "Async work is queued with retries and a dead-letter queue, and consumers are idempotent."
            : "I'd move slow or failure-prone work onto a queue with idempotent consumers.",
          scenario.hasPayments
            ? "Money-moving operations use idempotency keys so a retry never double-applies."
            : "Retries are bounded with backoff, and effects are designed to be safe to repeat.",
        ],
      },
      {
        heading: "Security strategy",
        body: [
          has(selected, "auth_provider")
            ? "Authentication establishes identity and authorization decides what each role can do."
            : "I'd add authentication and an authorization boundary for user-specific data.",
          scenario.hasPublicApi
            ? "The public API is rate limited and validated against a schema at the edge."
            : "Secrets live in a manager, and least-privilege access is the default.",
        ],
      },
      {
        heading: "Observability strategy",
        body: [
          has(selected, "monitoring")
            ? "Logs, metrics, and traces with a correlation ID let me follow one request across services and alert on SLOs."
            : "I'd add logs, metrics, traces, and a correlation ID, alerting on user-facing symptoms.",
        ],
      },
      {
        heading: "Tradeoffs",
        body: [
          "Async processing improves resilience and latency but introduces eventual consistency.",
          "Caching cuts latency but adds an invalidation strategy and stale-data risk.",
          scenario.hasPayments
            ? "Provider-hosted payments reduce PCI scope but require reconciliation with internal state."
            : "Managed services trade some control for far less operational burden.",
        ],
      },
      {
        heading: "Possible improvements",
        body: scenario.stretchGoals,
      },
    ],
  };
}

export function docToMarkdown(doc: GeneratedDoc): string {
  const lines: string[] = [`# ${doc.title}`, ""];
  for (const section of doc.sections) {
    lines.push(`## ${section.heading}`, "");
    for (const para of section.body) {
      lines.push(para, "");
    }
  }
  return lines.join("\n").trim() + "\n";
}
