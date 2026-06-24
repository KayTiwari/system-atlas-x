import { CATALOG } from "./catalog";
import type {
  ArchitectureMode,
  ComponentId,
  LearningScenario,
  ReviewItem,
  ReviewCategory,
  ArchitectureScore,
} from "./learnTypes";
import { REVIEW_CATEGORIES } from "./learnTypes";

/** Normalized signals the rules reason about, fed by a scenario or a brief. */
export type ReviewContext = {
  mode: ArchitectureMode;
  has: (id: ComponentId) => boolean;
  selected: Set<ComponentId>;
  count: number;
  isReadHeavy: boolean;
  isUserSpecific: boolean;
  hasPublicApi: boolean;
  hasFileUploads: boolean;
  hasPayments: boolean;
  hasNotifications: boolean;
  isRealtime: boolean;
  dataSensitivityHigh: boolean;
  reliabilityCritical: boolean;
  internetScale: boolean;
  budgetSensitive: boolean;
  /** Scenario grading sets (empty in free-form build mode). */
  expected: Set<ComponentId>;
  critical: Set<ComponentId>;
  recommended: Set<ComponentId>;
};

export type ReviewInput = {
  mode: ArchitectureMode;
  selectedComponentIds: ComponentId[];
  scenario?: LearningScenario;
  /** Build-mode signals (from a project brief), optional. */
  signals?: Partial<
    Pick<
      ReviewContext,
      | "isReadHeavy"
      | "isUserSpecific"
      | "hasPublicApi"
      | "hasFileUploads"
      | "hasPayments"
      | "hasNotifications"
      | "isRealtime"
      | "dataSensitivityHigh"
      | "reliabilityCritical"
      | "internetScale"
      | "budgetSensitive"
    >
  >;
};

function label(id: ComponentId): string {
  return CATALOG[id]?.label ?? id;
}

function buildContext(input: ReviewInput): ReviewContext {
  const selected = new Set(input.selectedComponentIds);
  const has = (id: ComponentId) => selected.has(id);
  const s = input.scenario;
  const sig = input.signals ?? {};
  return {
    mode: input.mode,
    has,
    selected,
    count: selected.size,
    isReadHeavy: s?.isReadHeavy ?? sig.isReadHeavy ?? false,
    isUserSpecific: s?.isUserSpecific ?? sig.isUserSpecific ?? false,
    hasPublicApi: s?.hasPublicApi ?? sig.hasPublicApi ?? false,
    hasFileUploads: s?.hasFileUploads ?? sig.hasFileUploads ?? false,
    hasPayments: s?.hasPayments ?? sig.hasPayments ?? false,
    hasNotifications: s?.hasNotifications ?? sig.hasNotifications ?? false,
    isRealtime: s?.isRealtime ?? sig.isRealtime ?? false,
    dataSensitivityHigh: sig.dataSensitivityHigh ?? false,
    reliabilityCritical: sig.reliabilityCritical ?? false,
    internetScale: sig.internetScale ?? false,
    budgetSensitive: sig.budgetSensitive ?? false,
    expected: new Set(s?.expectedComponentIds ?? []),
    critical: new Set(s?.criticalComponentIds ?? []),
    recommended: new Set(s?.recommendedComponentIds ?? []),
  };
}

const hasDatabase = (c: ReviewContext) =>
  c.has("sql_database") || c.has("nosql_database");

type Rule = (c: ReviewContext) => ReviewItem | null;

/** The deterministic rule set. Order here is the order findings are produced. */
const RULES: Rule[] = [
  // 1. Empty design
  (c) =>
    c.count === 0
      ? {
          id: "empty",
          type: "warning",
          category: "Product Fit",
          title: "Start with the request path",
          message:
            "Nothing is on the board yet. Begin with the core building blocks: a client, an application service, and a database, then add an entry point.",
          suggestedComponentIds: ["web_app", "api_service", "sql_database", "api_gateway"],
          whyItMatters:
            "Every architecture answer is built by tracing one request from client to data and back.",
          interviewTip: "In an interview, narrate what receives traffic first and why.",
          buildTip: "Generate a starter architecture from your brief to skip the blank page.",
        }
      : null,
  // 2. Service but no database
  (c) =>
    c.has("api_service") && !hasDatabase(c)
      ? {
          id: "service-no-db",
          type: "warning",
          category: "Data Modeling",
          title: "Application service with no source of truth",
          message:
            "You have a service handling logic but no database. Most stateful systems need a clear source of truth.",
          suggestedComponentIds: ["sql_database"],
          whyItMatters:
            "Without a source of truth, there's nowhere durable for state to live and recover from.",
          interviewTip: "State your data store and read/write pattern early.",
          buildTip: "Pick a primary database and define what it owns.",
        }
      : null,
  // 3. Public API but no rate limiter
  (c) =>
    c.hasPublicApi && !c.has("rate_limiter")
      ? {
          id: "public-no-rate-limit",
          type: "warning",
          category: "Security",
          title: "Public endpoints have no rate limiter",
          message:
            "External clients can reach your API but nothing caps request rates.",
          suggestedComponentIds: ["rate_limiter", "api_gateway"],
          whyItMatters:
            "Unprotected public endpoints invite abuse, cost blowouts, and traffic spikes.",
          interviewTip:
            "Mention rate limiting early - it signals you think about abuse, cost protection, and spikes.",
          buildTip: "Add a token-bucket / sliding-window limiter at the gateway.",
        }
      : null,
  // 4. User-specific / public-facing but no auth
  (c) =>
    (c.isUserSpecific || c.hasPayments) && !c.has("auth_provider")
      ? {
          id: "user-data-no-auth",
          type: "critical",
          category: "Security",
          title: "User-specific data but no authentication",
          message:
            "This system has per-user data but no auth provider establishing who the caller is.",
          suggestedComponentIds: ["auth_provider", "authorization"],
          whyItMatters:
            "Without authentication, any caller can read or modify another user's data.",
          interviewTip: "Separate authentication (who) from authorization (what they can do).",
          buildTip: "Use managed auth (OIDC/OAuth) before building anything custom.",
        }
      : null,
  // 5. Queue but no DLQ
  (c) =>
    c.has("queue") && !c.has("dead_letter_queue")
      ? {
          id: "queue-no-dlq",
          type: "warning",
          category: "Failure Handling",
          title: "Queue has no dead-letter queue",
          message:
            "Failed or poison messages can silently disappear without a dead-letter queue.",
          suggestedComponentIds: ["dead_letter_queue"],
          whyItMatters:
            "Without a DLQ, a single bad message can be retried forever or lost without a trace.",
          interviewTip: "Pair every queue with a DLQ and a retry limit.",
          buildTip: "Route messages to a DLQ after max retries and alert on its depth.",
        }
      : null,
  // 6. Queue but no worker
  (c) =>
    c.has("queue") && !c.has("worker")
      ? {
          id: "queue-no-worker",
          type: "warning",
          category: "Reliability",
          title: "Queue has no worker",
          message: "You publish async work but nothing consumes the queue.",
          suggestedComponentIds: ["worker"],
          whyItMatters: "A queue with no consumer just accumulates a growing backlog.",
          interviewTip: "Name the consumer and make it idempotent.",
          buildTip: "Add a background worker that pulls and processes jobs.",
        }
      : null,
  // 7. Notifications but no queue
  (c) =>
    (c.hasNotifications || c.has("notification_provider")) && !c.has("queue")
      ? {
          id: "notify-no-queue",
          type: "suggestion",
          category: "Reliability",
          title: "Notifications are not queued",
          message:
            "Sending notifications directly on the request path ties you to provider uptime and latency.",
          suggestedComponentIds: ["queue", "worker"],
          whyItMatters:
            "Queueing turns a provider outage into a retry instead of a dropped message.",
          interviewTip: "Queue notifications so retries and provider downtime are handled.",
          buildTip: "Enqueue notifications and send them from a worker with retries.",
        }
      : null,
  // 8. Payments but no idempotency
  (c) =>
    (c.hasPayments || c.has("payment_provider")) && !c.has("idempotency_layer")
      ? {
          id: "payments-no-idempotency",
          type: "critical",
          category: "Reliability",
          title: "Payments without idempotency",
          message:
            "A retried checkout or webhook can charge the customer twice without idempotency keys.",
          suggestedComponentIds: ["idempotency_layer"],
          whyItMatters:
            "At-least-once delivery and client retries make duplicate charges the default failure without idempotency.",
          interviewTip: "Idempotency keys are the first thing to mention for payments.",
          buildTip: "Add a unique (operation, idempotency_key) constraint and store the result.",
        }
      : null,
  // 9. Payments but no audit log
  (c) =>
    (c.hasPayments || c.has("payment_provider")) && !c.has("audit_log")
      ? {
          id: "payments-no-audit",
          type: "warning",
          category: "Security",
          title: "Payments without an audit log",
          message:
            "Money movements have no immutable record for reconciliation or disputes.",
          suggestedComponentIds: ["audit_log"],
          whyItMatters:
            "You can't reconcile or investigate payment disputes without an immutable trail.",
          interviewTip: "Mention auditability and reconciliation for any payment system.",
          buildTip: "Write an append-only audit entry on every money movement.",
        }
      : null,
  // 10. Payments but no webhook handler
  (c) =>
    (c.hasPayments || c.has("payment_provider")) && !c.has("webhook_handler")
      ? {
          id: "payments-no-webhook",
          type: "warning",
          category: "Reliability",
          title: "Payments without a webhook handler",
          message:
            "Payment providers confirm asynchronously via webhooks - the synchronous response isn't final.",
          suggestedComponentIds: ["webhook_handler"],
          whyItMatters:
            "Treating the API response as final misses async confirmations, refunds, and disputes.",
          interviewTip: "Say the webhook, not the API response, is the source of truth for final state.",
          buildTip: "Verify, store, and process provider webhooks asynchronously.",
        }
      : null,
  // 11. Object storage but no auth
  (c) =>
    c.has("object_storage") && !c.has("auth_provider") && c.isUserSpecific
      ? {
          id: "files-no-auth",
          type: "warning",
          category: "Security",
          title: "File storage without access control",
          message:
            "User files are stored but there's no auth boundary deciding who can read them.",
          suggestedComponentIds: ["auth_provider", "authorization"],
          whyItMatters: "Public buckets and missing ACLs are a top source of data leaks.",
          interviewTip: "Use signed URLs and per-file ACLs, never public buckets.",
          buildTip: "Gate downloads behind auth and short-lived signed URLs.",
        }
      : null,
  // 12. Files but no malware scanner
  (c) =>
    (c.hasFileUploads || c.has("object_storage")) &&
    c.isUserSpecific &&
    !c.has("malware_scanner")
      ? {
          id: "uploads-no-scan",
          type: "suggestion",
          category: "Security",
          title: "User uploads are not scanned",
          message:
            "Files uploaded by users and served to others should be scanned for malware first.",
          suggestedComponentIds: ["malware_scanner"],
          whyItMatters: "Serving an unscanned upload can spread malware to other users.",
          interviewTip: "Quarantine uploads, scan, then promote before serving.",
          buildTip: "Scan in a quarantine bucket and only promote files that pass.",
        }
      : null,
  // 13. Search but no database
  (c) =>
    c.has("search") && !hasDatabase(c)
      ? {
          id: "search-no-db",
          type: "warning",
          category: "Data Modeling",
          title: "Search index with no source of truth",
          message:
            "A search index is present but there's no database behind it.",
          suggestedComponentIds: ["sql_database"],
          whyItMatters:
            "A search index can drift or be rebuilt - it must never be the source of truth.",
          interviewTip: "Keep the DB authoritative and rebuild the index from it if it drifts.",
          buildTip: "Index off change events; the database stays authoritative.",
        }
      : null,
  // 14. Read-heavy with DB but no cache
  (c) =>
    c.isReadHeavy && hasDatabase(c) && !c.has("cache")
      ? {
          id: "read-heavy-no-cache",
          type: "warning",
          category: "Scalability",
          title: "Read-heavy system with no cache",
          message:
            "This workload is read-heavy but every read hits the database.",
          suggestedComponentIds: ["cache"],
          whyItMatters: "Hot reads against the primary waste capacity and add latency.",
          interviewTip: "Cache hot reads; keep the DB as the source of truth.",
          buildTip: "Add cache-aside with TTLs for the hottest read paths.",
        }
      : null,
  // 15. Distributed but no observability
  (c) =>
    c.count >= 4 && !c.has("monitoring")
      ? {
          id: "no-observability",
          type: "warning",
          category: "Observability",
          title: "Distributed system with no observability",
          message:
            "Several components are in play but there's no logs/metrics/traces story.",
          suggestedComponentIds: ["monitoring"],
          whyItMatters: "You can't operate or debug a distributed system you can't see.",
          interviewTip: "Mention correlation IDs across services and alerting on SLOs.",
          buildTip: "Add structured logs, metrics, traces, and a correlation ID.",
        }
      : null,
  // 16. Observability strength
  (c) =>
    c.has("monitoring") && c.count >= 4
      ? {
          id: "has-observability",
          type: "strength",
          category: "Observability",
          title: "Observability is in place",
          message: "Including observability shows you intend to operate this, not just ship it.",
          suggestedComponentIds: [],
          whyItMatters: "Operability is what separates a demo from a production system.",
        }
      : null,
  // 17. High sensitivity / payments but no secrets manager
  (c) =>
    (c.dataSensitivityHigh || c.hasPayments || c.has("payment_provider")) &&
    !c.has("secrets_manager")
      ? {
          id: "no-secrets-manager",
          type: "suggestion",
          category: "Security",
          title: "Sensitive system without a secrets manager",
          message:
            "API keys and credentials for this system need a managed home with rotation.",
          suggestedComponentIds: ["secrets_manager"],
          whyItMatters: "Secrets in code or config are a breach waiting to happen.",
          interviewTip: "Mention a secrets manager and short-lived, rotated credentials.",
          buildTip: "Inject secrets at runtime from a manager; never commit them.",
        }
      : null,
  // 18. Admin dashboard but no auth
  (c) =>
    c.has("admin_dashboard") && !c.has("auth_provider")
      ? {
          id: "admin-no-auth",
          type: "critical",
          category: "Security",
          title: "Admin dashboard with no auth boundary",
          message:
            "An internal admin surface is exposed with no authentication.",
          suggestedComponentIds: ["auth_provider", "authorization"],
          whyItMatters: "Privileged tooling is the highest-value target; it must be gated.",
          interviewTip: "Give admin tooling its own auth and role boundary.",
          buildTip: "Separate staff roles (RBAC) from end users behind auth.",
        }
      : null,
  // 19. Admin dashboard but no audit log
  (c) =>
    c.has("admin_dashboard") && !c.has("audit_log")
      ? {
          id: "admin-no-audit",
          type: "suggestion",
          category: "Security",
          title: "Admin actions are not audited",
          message:
            "Staff can act on user data but there's no record of who did what.",
          suggestedComponentIds: ["audit_log"],
          whyItMatters: "Privileged access without an audit trail fails privacy and compliance reviews.",
          interviewTip: "Every privileged action should write an audit entry.",
          buildTip: "Log actor, action, target, and time for every staff mutation.",
        }
      : null,
  // 20. Internet-scale but missing edge scaling
  (c) =>
    c.internetScale && !(c.has("cdn") && c.has("load_balancer") && c.has("cache"))
      ? {
          id: "scale-missing-edge",
          type: "warning",
          category: "Scalability",
          title: "Internet-scale target missing edge scaling",
          message:
            "For internet-scale traffic you'll want a CDN, a load balancer, and a cache working together.",
          suggestedComponentIds: ["cdn", "load_balancer", "cache"],
          whyItMatters: "Edge caching and load spreading are what keep origin load survivable at scale.",
          interviewTip: "Talk through the CDN → LB → cache → service → DB layering.",
          buildTip: "Add a CDN for static/media, an LB for services, and a cache for hot reads.",
        }
      : null,
  // 21. Mission-critical but no backup
  (c) =>
    c.reliabilityCritical && hasDatabase(c) && !c.has("backup")
      ? {
          id: "critical-no-backup",
          type: "warning",
          category: "Reliability",
          title: "Mission-critical with no backup/restore",
          message:
            "A mission-critical target needs a tested disaster-recovery plan, not just a database.",
          suggestedComponentIds: ["backup"],
          whyItMatters: "Without tested restores, data loss or corruption is unrecoverable.",
          interviewTip: "Mention RTO/RPO and that backups are tested, not just taken.",
          buildTip: "Automate snapshots and run periodic restore drills.",
        }
      : null,
  // 22. Event bus but no consumer
  (c) =>
    c.has("event_bus") && !(c.has("worker") || c.has("api_service") || c.has("notification_provider"))
      ? {
          id: "event-bus-no-consumer",
          type: "warning",
          category: "Failure Handling",
          title: "Event bus with no consumers",
          message: "Events are published but nothing is shown consuming them.",
          suggestedComponentIds: ["worker"],
          whyItMatters: "An event bus only adds value when subscribers react to its events.",
          interviewTip: "Name the subscribers and make them idempotent.",
          buildTip: "Add at least one consumer and track its processing offset.",
        }
      : null,
  // 23. Gateway but no API contract
  (c) =>
    c.has("api_gateway") && c.hasPublicApi && !c.has("api_contract")
      ? {
          id: "gateway-no-contract",
          type: "suggestion",
          category: "Maintainability",
          title: "Public API without a versioned contract",
          message:
            "A public API benefits from a versioned, validated schema so clients stay stable.",
          suggestedComponentIds: ["api_contract"],
          whyItMatters: "Unversioned APIs break clients on every change and resist safe evolution.",
          interviewTip: "Mention schema-first design and contract tests in CI.",
          buildTip: "Define OpenAPI/GraphQL and validate requests against it.",
        }
      : null,
  // 24. Over-engineering for a simple scenario
  (c) =>
    c.expected.size > 0 && c.count >= c.expected.size + 7
      ? {
          id: "overengineered",
          type: "suggestion",
          category: "Cost Awareness",
          title: "This may be over-engineered",
          message:
            "There are many more components here than this problem needs. Validate each against a real requirement.",
          suggestedComponentIds: [],
          whyItMatters: "Unjustified components add cost, operational burden, and review surface.",
          interviewTip: "Senior signal is matching complexity to requirements, not maximizing it.",
          buildTip: "Trim anything you can't tie to a concrete requirement or risk.",
        }
      : null,
  // 25. Queue + DLQ strength
  (c) =>
    c.has("queue") && c.has("dead_letter_queue")
      ? {
          id: "strength-dlq",
          type: "strength",
          category: "Failure Handling",
          title: "Solid async failure handling",
          message: "A queue paired with a dead-letter queue shows you've designed the failure path.",
          suggestedComponentIds: [],
          whyItMatters: "Handling poison messages is a hallmark of production-ready async design.",
        }
      : null,
  // 26. Rate limiter strength on public API
  (c) =>
    c.hasPublicApi && c.has("rate_limiter")
      ? {
          id: "strength-rate-limit",
          type: "strength",
          category: "Security",
          title: "Public API is rate limited",
          message: "Protecting the public surface against abuse is exactly the right instinct.",
          suggestedComponentIds: [],
          whyItMatters: "Abuse and cost protection on public endpoints is a senior default.",
        }
      : null,
  // 27. Idempotency strength on payments
  (c) =>
    (c.hasPayments || c.has("payment_provider")) && c.has("idempotency_layer")
      ? {
          id: "strength-idempotency",
          type: "strength",
          category: "Reliability",
          title: "Payments are idempotent",
          message: "Idempotency keys mean a retry won't double-charge - the core payment correctness property.",
          suggestedComponentIds: [],
          whyItMatters: "It's the single most important property of a payment system.",
        }
      : null,
];

/** Scenario coverage: missing critical/expected components and recommended bonuses. */
function coverageItems(c: ReviewContext): ReviewItem[] {
  if (c.expected.size === 0 && c.critical.size === 0) return [];
  const items: ReviewItem[] = [];
  const missingCritical = [...c.critical].filter((id) => !c.has(id));
  const missingExpected = [...c.expected].filter(
    (id) => !c.has(id) && !c.critical.has(id)
  );

  for (const id of missingCritical) {
    items.push({
      id: `missing-critical-${id}`,
      type: "critical",
      category: "Product Fit",
      title: `Missing critical piece: ${label(id)}`,
      message: `This scenario can't be answered well without ${label(id)}.`,
      suggestedComponentIds: [id],
      whyItMatters: `${label(id)} is core to meeting this scenario's requirements.`,
      interviewTip: `An interviewer will expect ${label(id)} here - lead with it.`,
      buildTip: `Add ${label(id)} before going further.`,
    });
  }
  if (missingExpected.length > 0) {
    items.push({
      id: "missing-expected",
      type: "warning",
      category: "Product Fit",
      title: "Some expected components are missing",
      message: `Interviewers would typically expect: ${missingExpected
        .map(label)
        .join(", ")}.`,
      suggestedComponentIds: missingExpected,
      whyItMatters: "Covering the expected building blocks shows you understood the problem.",
      interviewTip: "Walk through each expected component and justify it.",
    });
  }
  return items;
}

const SEVERITY_ORDER: Record<ReviewItem["type"], number> = {
  critical: 0,
  warning: 1,
  suggestion: 2,
  strength: 3,
};

/** Run the engine: produce sorted findings plus a category + overall score. */
export function reviewArchitecture(input: ReviewInput): {
  items: ReviewItem[];
  score: ArchitectureScore;
} {
  const c = buildContext(input);
  const items: ReviewItem[] = [];
  for (const rule of RULES) {
    const r = rule(c);
    if (r) items.push(r);
  }
  items.push(...coverageItems(c));
  items.sort((a, b) => SEVERITY_ORDER[a.type] - SEVERITY_ORDER[b.type]);

  return { items, score: scoreArchitecture(c, items, input.mode) };
}

const CATEGORY_FLOOR = 35;

function scoreArchitecture(
  c: ReviewContext,
  items: ReviewItem[],
  mode: ArchitectureMode
): ArchitectureScore {
  // Per-category: start mid, reward strengths, punish open findings.
  const categories = {} as Record<ReviewCategory, number>;
  for (const cat of REVIEW_CATEGORIES) categories[cat] = 70;

  for (const item of items) {
    const delta =
      item.type === "critical"
        ? -26
        : item.type === "warning"
        ? -13
        : item.type === "suggestion"
        ? -5
        : 8; // strength
    categories[item.category] = clamp(
      categories[item.category] + delta,
      CATEGORY_FLOOR,
      100
    );
  }

  // Overall: coverage-driven baseline, then global penalties/bonuses.
  let overall: number;
  if (c.count === 0) {
    overall = 6;
  } else {
    const criticalsTotal = c.critical.size || 0;
    const expectedTotal = c.expected.size || 0;
    let base = 40;
    if (criticalsTotal > 0) {
      const covered = [...c.critical].filter((id) => c.has(id)).length;
      base += Math.round((covered / criticalsTotal) * 30);
    } else {
      base += 15;
    }
    if (expectedTotal > 0) {
      const coveredE = [...c.expected].filter((id) => c.has(id)).length;
      base += Math.round((coveredE / expectedTotal) * 10);
    } else {
      base += 5;
    }
    // Recommended components are senior-signal bonuses.
    const recHit = [...c.recommended].filter((id) => c.has(id)).length;
    base += Math.min(12, recHit * 3);

    // Open findings drag the score.
    for (const item of items) {
      if (item.type === "critical") base -= 12;
      else if (item.type === "warning") base -= 5;
      else if (item.type === "suggestion") base -= 2;
      else base += 2; // strength
    }
    overall = clamp(base, 4, 100);
  }

  return {
    overall,
    readinessLabel: readinessLabel(overall, mode),
    summary: scoreSummary(overall, items, mode),
    categories,
  };
}

export function readinessLabel(score: number, mode: ArchitectureMode): string {
  if (mode === "build") {
    if (score < 50) return "Risky";
    if (score < 70) return "Needs Hardening";
    if (score < 85) return "Solid Starting Point";
    return "Production-Minded";
  }
  if (score < 50) return "Needs Work";
  if (score < 70) return "Developing";
  if (score < 85) return "Strong";
  return "Interview Ready";
}

function scoreSummary(
  score: number,
  items: ReviewItem[],
  mode: ArchitectureMode
): string {
  const criticals = items.filter((i) => i.type === "critical").length;
  const warnings = items.filter((i) => i.type === "warning").length;
  if (score < 20) {
    return mode === "build"
      ? "Just getting started - add the core building blocks."
      : "Just getting started - trace the request path first.";
  }
  if (criticals > 0) {
    return `${criticals} critical gap${criticals > 1 ? "s" : ""} to close before this holds up.`;
  }
  if (warnings > 0) {
    return `Solid foundation with ${warnings} thing${warnings > 1 ? "s" : ""} to tighten.`;
  }
  return mode === "build"
    ? "Production-minded - turn this into a spec and implementation phases."
    : "Interview-ready - now practice explaining the flow and tradeoffs out loud.";
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}
