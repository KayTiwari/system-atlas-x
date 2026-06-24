import type { ArchitectureNodeType } from "./types";
import { CATALOG, type CatalogEntry } from "./catalog";

/**
 * Deeper, study-oriented knowledge that augments the canvas CATALOG with the
 * fields Learn Mode and the Component Library care about: failure modes,
 * interview talking points, implementation notes, alternatives, and links.
 *
 * The CATALOG stays the single source of truth for label/group/icon/purpose;
 * this layer adds the senior-engineer depth on top, keyed by the same type id.
 * Not every component needs a full entry - `getComponentKnowledge` falls back
 * to the catalog so the library is always complete.
 */
export type ComponentKnowledge = {
  type: ArchitectureNodeType;
  alternatives: string[];
  failureModes: string[];
  interviewTalkingPoints: string[];
  implementationNotes: string[];
  relatedComponentIds: ArchitectureNodeType[];
  tags: string[];
};

const KNOWLEDGE: Partial<Record<ArchitectureNodeType, Omit<ComponentKnowledge, "type">>> = {
  api_gateway: {
    alternatives: ["Direct service exposure", "Load balancer only", "BFF per client"],
    failureModes: [
      "Becomes a single point of failure if not replicated",
      "Under-provisioning turns it into a latency bottleneck",
      "Auth/routing misconfig exposes internal services",
    ],
    interviewTalkingPoints: [
      "It centralizes auth, routing, rate limiting, and request shaping at the edge.",
      "I keep it stateless so it scales horizontally behind a load balancer.",
      "I push business logic into services, not the gateway.",
    ],
    implementationNotes: [
      "Terminate TLS and validate tokens here",
      "Attach a correlation ID to every request for tracing",
      "Pair with a rate limiter and schema validation",
    ],
    relatedComponentIds: ["rate_limiter", "auth_provider", "api_contract", "load_balancer"],
    tags: ["edge", "routing", "security", "scalability"],
  },
  load_balancer: {
    alternatives: ["DNS round-robin", "API gateway routing", "Service mesh"],
    failureModes: [
      "Single LB instance is itself a SPOF",
      "Sticky sessions defeat even distribution",
      "Health checks too lax keep routing to dead instances",
    ],
    interviewTalkingPoints: [
      "It lets me scale services horizontally and survive instance failure.",
      "Health checks gate traffic so bad deploys don't take the system down.",
      "I keep services stateless so any instance can serve any request.",
    ],
    implementationNotes: [
      "Use L7 routing for path/host-based rules",
      "Drain connections on deploy for zero downtime",
      "Run the LB itself across availability zones",
    ],
    relatedComponentIds: ["api_gateway", "api_service", "hosting"],
    tags: ["networking", "scalability", "reliability"],
  },
  sql_database: {
    alternatives: ["NoSQL document store", "Key-value store", "NewSQL (Spanner/Cockroach)"],
    failureModes: [
      "Single primary is a write SPOF without failover",
      "Unindexed queries melt under load",
      "Long transactions and lock contention stall writes",
    ],
    interviewTalkingPoints: [
      "I default to a relational DB unless access patterns clearly demand NoSQL.",
      "I clarify read/write ratio early - it drives indexing, caching, and replicas.",
      "Reads scale with replicas before I ever consider sharding.",
    ],
    implementationNotes: [
      "One database per service to keep boundaries clean",
      "Add read replicas before sharding",
      "Define backups and test restores, not just snapshots",
    ],
    relatedComponentIds: ["read_replica", "cache", "backup", "object_storage"],
    tags: ["data", "source-of-truth", "consistency"],
  },
  nosql_database: {
    alternatives: ["SQL database", "Search index", "Wide-column store"],
    failureModes: [
      "Hot partitions throttle a single key range",
      "Modeling for the wrong access pattern forces expensive rewrites",
      "Eventual consistency surprises read-after-write flows",
    ],
    interviewTalkingPoints: [
      "I reach for NoSQL when access patterns are known and scale is large.",
      "I model the table around queries, not entities.",
      "I name the consistency model explicitly so reads aren't a surprise.",
    ],
    implementationNotes: [
      "Single-table design with well-chosen partition keys",
      "Denormalize for the read path",
      "Watch for hot keys and add write sharding if needed",
    ],
    relatedComponentIds: ["cache", "search", "analytics_pipeline"],
    tags: ["data", "scale", "access-patterns"],
  },
  cache: {
    alternatives: ["Read replica", "CDN for static reads", "Materialized view"],
    failureModes: [
      "Stale data when invalidation is wrong",
      "Thundering herd when a hot key expires",
      "Cache stampede / cascading load on a cache outage",
    ],
    interviewTalkingPoints: [
      "I cache hot reads but keep the database as the source of truth.",
      "Every cache needs an invalidation strategy - usually cache-aside with TTLs.",
      "I guard against stampedes with request coalescing or jittered TTLs.",
    ],
    implementationNotes: [
      "Cache-aside is the safe default",
      "Set TTLs and invalidate on write",
      "Add jitter to TTLs to avoid synchronized expiry",
    ],
    relatedComponentIds: ["sql_database", "read_replica", "cdn"],
    tags: ["data", "latency", "read-scaling"],
  },
  queue: {
    alternatives: ["Direct synchronous call", "Event bus", "Scheduled batch job"],
    failureModes: [
      "Poison messages retried forever",
      "Consumer backlog grows faster than workers drain it",
      "Duplicate processing from at-least-once delivery",
      "Lost messages from misconfiguration",
    ],
    interviewTalkingPoints: [
      "I use a queue when the user doesn't need the result synchronously.",
      "I pair it with idempotent consumers and a dead-letter queue.",
      "I monitor queue depth, retry rate, and consumer lag.",
    ],
    implementationNotes: [
      "Set retry limits and route failures to a DLQ",
      "Make consumers idempotent - messages can arrive twice",
      "Carry a correlation ID across the async boundary",
    ],
    relatedComponentIds: ["worker", "dead_letter_queue", "idempotency_layer", "event_bus"],
    tags: ["async", "decoupling", "reliability"],
  },
  dead_letter_queue: {
    alternatives: ["Inline retry with backoff", "Error table", "Manual replay log"],
    failureModes: [
      "DLQ itself goes unmonitored and silently fills",
      "No replay process, so failures pile up forever",
    ],
    interviewTalkingPoints: [
      "A DLQ captures messages that fail after max retries so nothing is silently lost.",
      "I alert on DLQ depth and build a triage/replay process.",
    ],
    implementationNotes: [
      "Max-retries then route to DLQ and alert",
      "Store enough context to replay after a fix",
    ],
    relatedComponentIds: ["queue", "worker", "monitoring"],
    tags: ["async", "failure-handling", "reliability"],
  },
  worker: {
    alternatives: ["Inline request processing", "Serverless function", "Scheduled batch"],
    failureModes: [
      "Non-idempotent handlers double-apply on retry",
      "One slow job type starves others without separate queues",
      "Silent crashes with no job-status visibility",
    ],
    interviewTalkingPoints: [
      "Workers keep request latency low by moving slow work off the hot path.",
      "I make handlers idempotent and track job status.",
      "I separate queues by job type so one backlog doesn't block others.",
    ],
    implementationNotes: [
      "Pull from queue, idempotent handler, status table",
      "Bound retries and surface failures to a DLQ",
    ],
    relatedComponentIds: ["queue", "dead_letter_queue", "idempotency_layer", "scheduler"],
    tags: ["async", "compute", "background"],
  },
  rate_limiter: {
    alternatives: ["Quotas at the gateway", "Per-user API keys", "Load shedding"],
    failureModes: [
      "Too strict blocks legitimate bursts",
      "Local-only counters let limits leak across instances",
      "No shared store means inconsistent enforcement",
    ],
    interviewTalkingPoints: [
      "I rate limit public endpoints early - it shows I think about abuse and cost.",
      "Token bucket or sliding window, backed by Redis for distributed counting.",
      "I return clear 429s with Retry-After so good clients back off.",
    ],
    implementationNotes: [
      "Shared store (Redis) for distributed counting",
      "Per-key and per-IP limits with sensible burst",
    ],
    relatedComponentIds: ["api_gateway", "cache", "auth_provider"],
    tags: ["security", "abuse", "cost", "edge"],
  },
  auth_provider: {
    alternatives: ["Custom auth", "Managed auth (Auth0/Cognito/Clerk)", "SSO/OIDC"],
    failureModes: [
      "Rolling your own crypto/session logic introduces vulnerabilities",
      "Long-lived tokens that can't be revoked",
      "Auth outage locks every user out",
    ],
    interviewTalkingPoints: [
      "I prefer managed auth over rolling my own - custom auth is where breaches live.",
      "Identity (authn) is separate from permissions (authz); I name both.",
      "Token lifetime trades security against UX; I add refresh + revocation.",
    ],
    implementationNotes: [
      "Issue short-lived JWT/session validated at the gateway",
      "Support revocation and refresh",
    ],
    relatedComponentIds: ["authorization", "api_gateway", "secrets_manager", "audit_log"],
    tags: ["security", "identity"],
  },
  monitoring: {
    alternatives: ["Logs only", "Vendor APM (Datadog/Honeycomb)", "OpenTelemetry stack"],
    failureModes: [
      "Alert fatigue from noisy, non-actionable alerts",
      "No correlation IDs, so traces can't be stitched together",
      "Blind spots between services in a distributed call",
    ],
    interviewTalkingPoints: [
      "You can't operate what you can't see - logs, metrics, and traces together.",
      "I alert on SLOs and user-facing symptoms, not every blip.",
      "Correlation IDs let me follow one request across services.",
    ],
    implementationNotes: [
      "Structured logs + metrics + distributed traces",
      "Propagate a correlation ID end to end",
      "Dashboards for the golden signals (latency, traffic, errors, saturation)",
    ],
    relatedComponentIds: ["api_gateway", "queue", "worker"],
    tags: ["observability", "operability", "reliability"],
  },
  payment_provider: {
    alternatives: ["Direct card processing (high PCI scope)", "Stripe/Adyen/Braintree"],
    failureModes: [
      "Duplicate charges without idempotency keys",
      "Webhook arrives before your API response (race)",
      "Provider downtime blocks checkout with no retry path",
      "Internal state drifts from provider state without reconciliation",
    ],
    interviewTalkingPoints: [
      "I design payments around idempotency, auditability, and safe retries.",
      "Provider webhooks - not the synchronous response - are the source of truth for final state.",
      "A reconciliation job compares provider state with internal records.",
    ],
    implementationNotes: [
      "Idempotency key on every money-moving call",
      "Verify, store, then process webhooks asynchronously",
      "Nightly reconciliation against the provider",
    ],
    relatedComponentIds: ["idempotency_layer", "webhook_handler", "audit_log", "queue"],
    tags: ["payments", "external", "correctness"],
  },
  idempotency_layer: {
    alternatives: ["Unique DB constraints", "Dedup table", "Exactly-once broker (rare)"],
    failureModes: [
      "Key scoped too broadly collides across users",
      "Key store eviction lets a retry double-apply",
    ],
    interviewTalkingPoints: [
      "An idempotency key makes a retried request safe to replay.",
      "I store the result keyed by the idempotency key and return it on replay.",
      "Critical for payments and any at-least-once queue consumer.",
    ],
    implementationNotes: [
      "Unique constraint on (operation, idempotency_key)",
      "Persist the response so replays return the same result",
    ],
    relatedComponentIds: ["payment_provider", "webhook_handler", "queue", "worker"],
    tags: ["reliability", "correctness", "payments"],
  },
  object_storage: {
    alternatives: ["Database BLOBs (avoid)", "File system", "S3/GCS/Azure Blob"],
    failureModes: [
      "Public buckets leak private files",
      "Serving unscanned uploads spreads malware",
      "No lifecycle policy means cost grows forever",
    ],
    interviewTalkingPoints: [
      "Large files live in object storage; metadata and ACLs live in the database.",
      "I use signed URLs for access control, not public buckets.",
      "User uploads get scanned and quarantined before they're served.",
    ],
    implementationNotes: [
      "Signed URLs for upload and download",
      "Quarantine bucket → scan → promote",
      "Lifecycle/retention policy for cost and compliance",
    ],
    relatedComponentIds: ["malware_scanner", "auth_provider", "cdn", "sql_database"],
    tags: ["data", "files", "storage"],
  },
  audit_log: {
    alternatives: ["App logs (insufficient)", "Append-only table", "Event store"],
    failureModes: [
      "Mutable logs can't be trusted for forensics",
      "Mixing audit data with operational data muddies retention",
    ],
    interviewTalkingPoints: [
      "An immutable audit log records who did what to sensitive data and when.",
      "It's essential for compliance, reconciliation, and incident forensics.",
    ],
    implementationNotes: [
      "Append-only, separate from operational data",
      "Capture actor, action, target, and timestamp",
    ],
    relatedComponentIds: ["admin_dashboard", "payment_provider", "auth_provider"],
    tags: ["security", "compliance", "observability"],
  },
  webhook_handler: {
    alternatives: ["Polling the provider", "Inline synchronous processing"],
    failureModes: [
      "Unverified signatures let attackers forge events",
      "Slow processing causes provider timeouts and retries",
      "Out-of-order or duplicate events double-apply",
    ],
    interviewTalkingPoints: [
      "I verify the signature, store the raw event, return 200 fast, then process async.",
      "Events can arrive out of order and more than once, so handlers are idempotent.",
    ],
    implementationNotes: [
      "Verify signature before trusting the payload",
      "Persist raw event, process on a queue",
      "Dedupe by provider event id",
    ],
    relatedComponentIds: ["payment_provider", "queue", "idempotency_layer"],
    tags: ["external", "async", "integration"],
  },
  notification_provider: {
    alternatives: ["Self-hosted SMTP (deliverability risk)", "SES/Twilio/FCM"],
    failureModes: [
      "Provider outage drops notifications with no retry",
      "No suppression list keeps mailing bounced addresses",
      "Sending on the hot path slows user requests",
    ],
    interviewTalkingPoints: [
      "I queue notifications so provider downtime becomes a retry, not a failure.",
      "Delivery is tracked and bounced recipients are suppressed.",
    ],
    implementationNotes: [
      "Queue → worker → provider with retries and backoff",
      "Track delivery status; honor a fallback channel",
    ],
    relatedComponentIds: ["queue", "worker", "event_bus"],
    tags: ["external", "messaging", "async"],
  },
  event_bus: {
    alternatives: ["Point-to-point queues", "Direct synchronous calls", "Kafka log"],
    failureModes: [
      "Hard to trace which consumers reacted to an event",
      "Schema changes break silent downstream consumers",
      "No DLQ means failed events vanish",
    ],
    interviewTalkingPoints: [
      "An event bus fans one event out to many independent subscribers.",
      "It decouples producers from a growing set of consumers.",
      "Consumers are idempotent because delivery is at-least-once.",
    ],
    implementationNotes: [
      "Versioned event schemas",
      "Each consumer tracks its own offset/idempotency",
    ],
    relatedComponentIds: ["queue", "worker", "notification_provider", "analytics_pipeline"],
    tags: ["async", "event-driven", "decoupling"],
  },
  admin_dashboard: {
    alternatives: ["Direct DB access (avoid)", "Internal tool builder (Retool)"],
    failureModes: [
      "Shared end-user auth grants staff too much",
      "Privileged actions with no audit trail",
    ],
    interviewTalkingPoints: [
      "Admin tooling is a privileged surface - separate auth, roles, and audit logging.",
      "Every staff action that touches user data writes an audit entry.",
    ],
    implementationNotes: [
      "Distinct roles (RBAC) from end users",
      "Audit every privileged mutation",
    ],
    relatedComponentIds: ["auth_provider", "authorization", "audit_log"],
    tags: ["internal", "security", "operations"],
  },
  cdn: {
    alternatives: ["Origin-only serving", "Edge functions", "Regional caches"],
    failureModes: [
      "Stale content after deploys without cache busting",
      "Caching private/personalized responses by mistake",
    ],
    interviewTalkingPoints: [
      "A CDN serves static and media content from near the user, cutting latency and origin load.",
      "I version asset URLs so a deploy invalidates cleanly.",
    ],
    implementationNotes: [
      "Set explicit cache headers; never cache per-user responses",
      "Content-hash asset filenames for instant invalidation",
    ],
    relatedComponentIds: ["object_storage", "cache", "static_site"],
    tags: ["networking", "latency", "edge"],
  },
  search: {
    alternatives: ["Postgres full-text search", "Elasticsearch/OpenSearch", "Algolia"],
    failureModes: [
      "Treating the index as the source of truth and losing data",
      "Index drifts out of sync with the database",
    ],
    interviewTalkingPoints: [
      "A search index serves rich queries, but the database stays the source of truth.",
      "I keep the index in sync via change events, and rebuild from the DB if it drifts.",
    ],
    implementationNotes: [
      "Index off change events / CDC",
      "Postgres FTS for simple needs; dedicated engine at scale",
    ],
    relatedComponentIds: ["sql_database", "event_bus", "analytics_pipeline"],
    tags: ["data", "search", "read"],
  },
  analytics_pipeline: {
    alternatives: ["Direct writes to warehouse", "Logs + batch ETL", "Stream processor"],
    failureModes: [
      "Dropped events under-count without acknowledgement",
      "Schema drift breaks downstream transforms",
    ],
    interviewTalkingPoints: [
      "Analytics events are processed off the hot path so user requests stay fast.",
      "I keep raw events and derive aggregates downstream so I can reprocess.",
    ],
    implementationNotes: [
      "Emit event → buffer/queue → transform → warehouse",
      "Version event schemas; keep the raw layer immutable",
    ],
    relatedComponentIds: ["event_bus", "queue", "data_warehouse"],
    tags: ["data", "analytics", "async"],
  },
};

/** Merge the canvas catalog entry with deep study knowledge (with fallbacks). */
export function getComponentKnowledge(
  type: ArchitectureNodeType
): CatalogEntry & ComponentKnowledge {
  const entry = CATALOG[type];
  const deep = KNOWLEDGE[type];
  return {
    ...entry,
    type,
    alternatives: deep?.alternatives ?? [],
    failureModes: deep?.failureModes ?? [],
    interviewTalkingPoints: deep?.interviewTalkingPoints ?? [],
    implementationNotes: deep?.implementationNotes ?? entry.commonPatterns,
    relatedComponentIds: deep?.relatedComponentIds ?? [],
    tags: deep?.tags ?? [entry.group.toLowerCase()],
  };
}

export function hasDeepKnowledge(type: ArchitectureNodeType): boolean {
  return Boolean(KNOWLEDGE[type]);
}
