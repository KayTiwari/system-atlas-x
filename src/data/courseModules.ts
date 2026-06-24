import type { CourseModule } from "@/lib/learnTypes";

/** Lightweight concept modules ("Study Paths") shown in Learn Mode. */
export const COURSE_MODULES: CourseModule[] = [
  {
    id: "request-flow-basics",
    title: "Request Flow Basics",
    description:
      "Trace a request from the client to the database and back. The foundation every system-design answer builds on.",
    relatedComponentIds: ["web_app", "api_gateway", "api_service", "sql_database"],
    keyIdeas: [
      "Clients never talk to the database directly - they go through an API",
      "Start every design by following one request end to end",
      "Stateless services scale horizontally; push state into data stores",
      "Name what receives traffic first: client, CDN, load balancer, or gateway",
    ],
    commonMistakes: [
      "Jumping to databases before defining the request path",
      "Letting the client reach the database directly",
      "Putting state in the service instead of a data store",
    ],
    miniChallenge:
      "Draw the full path of a single 'create account' request, naming every hop.",
  },
  {
    id: "apis-gateways-load-balancers",
    title: "APIs, Gateways, and Load Balancers",
    description:
      "How traffic enters the system: routing, auth at the edge, rate limiting, and spreading load across instances.",
    relatedComponentIds: ["api_gateway", "load_balancer", "rate_limiter", "api_contract"],
    keyIdeas: [
      "A gateway centralizes auth, routing, rate limiting, and request shaping",
      "A load balancer spreads traffic and routes around unhealthy instances",
      "Public endpoints need rate limiting from day one",
      "A versioned API contract keeps clients stable",
    ],
    commonMistakes: [
      "Exposing services directly with no edge layer",
      "Forgetting rate limiting on public APIs",
      "Making the gateway a SPOF or a place for business logic",
    ],
    miniChallenge:
      "Add a gateway and rate limiter in front of a service and explain what each rejects.",
  },
  {
    id: "databases-sources-of-truth",
    title: "Databases and Sources of Truth",
    description:
      "Choosing a data store, modeling for access patterns, and keeping one clear source of truth.",
    relatedComponentIds: ["sql_database", "nosql_database", "read_replica", "backup"],
    keyIdeas: [
      "Default to relational unless access patterns clearly demand NoSQL",
      "Clarify read/write ratio early - it drives every data decision",
      "There is exactly one source of truth; caches and indexes derive from it",
      "Reads scale with replicas before you reach for sharding",
    ],
    commonMistakes: [
      "Picking NoSQL for 'scale' without known access patterns",
      "Treating a cache or search index as the source of truth",
      "Snapshots with no tested restore",
    ],
    miniChallenge:
      "For a social feed, decide SQL vs NoSQL and justify it from the access pattern.",
  },
  {
    id: "caching-read-scaling",
    title: "Caching and Read Scaling",
    description:
      "Serving hot reads fast without losing correctness: cache-aside, TTLs, invalidation, and stampedes.",
    relatedComponentIds: ["cache", "cdn", "read_replica"],
    keyIdeas: [
      "Cache hot reads but keep the database as the source of truth",
      "Every cache needs an invalidation strategy - usually cache-aside + TTL",
      "CDNs cache static/edge content close to users",
      "Guard against stampedes with jittered TTLs or request coalescing",
    ],
    commonMistakes: [
      "Caching with no invalidation, serving stale data",
      "Caching per-user/private responses in a shared CDN",
      "Synchronized TTLs that all expire at once",
    ],
    miniChallenge:
      "Add a cache to a read-heavy endpoint and describe exactly when it's invalidated.",
  },
  {
    id: "queues-workers-async",
    title: "Queues, Workers, and Async Processing",
    description:
      "Moving slow or unreliable work off the request path with queues, idempotent consumers, and dead-letter handling.",
    relatedComponentIds: ["queue", "worker", "dead_letter_queue", "idempotency_layer"],
    keyIdeas: [
      "Queues decouple producers from consumers",
      "Async work improves latency when users don't need an immediate result",
      "Consumers should be idempotent - messages can arrive more than once",
      "Failed jobs need retry limits and a dead-letter queue",
      "Queue depth and consumer lag must be monitored",
    ],
    commonMistakes: [
      "Adding a queue without a worker to consume it",
      "Retrying forever with no DLQ",
      "Ignoring duplicate message delivery",
      "Using async flow when the user needs immediate consistency",
    ],
    miniChallenge:
      "Design a notification system that can tolerate provider downtime.",
  },
  {
    id: "reliability-retries-dlqs",
    title: "Reliability, Retries, and DLQs",
    description:
      "Designing for failure: retries with backoff, dead-letter queues, idempotency, and backups you actually test.",
    relatedComponentIds: ["dead_letter_queue", "idempotency_layer", "backup", "monitoring"],
    keyIdeas: [
      "Everything fails; design the failure path, not just the happy path",
      "Retries need limits and backoff, then a DLQ for poison messages",
      "Idempotency turns at-least-once delivery into safe-to-replay",
      "A backup is worthless until you've tested the restore",
    ],
    commonMistakes: [
      "Infinite retries that amplify an outage",
      "No idempotency, so retries double-apply effects",
      "Untested backups discovered to be broken during an incident",
    ],
    miniChallenge:
      "Take a payment flow and make every step safe to retry.",
  },
  {
    id: "auth-and-authz",
    title: "Authentication and Authorization",
    description:
      "Knowing who a caller is (authn) versus what they're allowed to do (authz), and enforcing both.",
    relatedComponentIds: ["auth_provider", "authorization", "secrets_manager", "audit_log"],
    keyIdeas: [
      "Authentication (who you are) is separate from authorization (what you can do)",
      "Prefer managed auth over rolling your own",
      "Check authorization on every privileged action, not just at login",
      "Secrets live in a manager, never in code or config",
    ],
    commonMistakes: [
      "Conflating authn and authz",
      "Building custom crypto/session logic",
      "Checking permissions only at the UI layer",
    ],
    miniChallenge:
      "Add an authorization boundary to an admin tool and list the roles.",
  },
  {
    id: "observability",
    title: "Observability: Logs, Metrics, and Traces",
    description:
      "Operating what you build: structured logs, metrics, distributed traces, and alerting on symptoms.",
    relatedComponentIds: ["monitoring"],
    keyIdeas: [
      "You can't operate what you can't see",
      "Logs, metrics, and traces answer different questions - you need all three",
      "Correlation IDs stitch one request across services",
      "Alert on SLOs and user-facing symptoms, not every blip",
    ],
    commonMistakes: [
      "Logs only, with no metrics or traces",
      "No correlation IDs across async boundaries",
      "Alert fatigue from noisy, non-actionable alerts",
    ],
    miniChallenge:
      "Pick the three metrics you'd alert on for a checkout service and why.",
  },
  {
    id: "payments-idempotency",
    title: "Payments and Idempotency",
    description:
      "Moving money correctly: idempotency keys, webhooks as the source of truth, audit logs, and reconciliation.",
    relatedComponentIds: ["payment_provider", "idempotency_layer", "webhook_handler", "audit_log"],
    keyIdeas: [
      "Every money-moving call carries an idempotency key",
      "The provider webhook, not the synchronous response, is the final word",
      "Every money movement is recorded in an append-only audit log",
      "A reconciliation job compares your state against the provider",
    ],
    commonMistakes: [
      "No idempotency, so retries double-charge",
      "Trusting the API response instead of the webhook",
      "No reconciliation between internal and provider state",
    ],
    miniChallenge:
      "Explain what happens if a payment webhook arrives before your API response.",
  },
  {
    id: "tradeoffs-interview-framing",
    title: "Architecture Tradeoffs and Interview Framing",
    description:
      "Communicating decisions like a senior engineer: requirements first, name tradeoffs, defend choices out loud.",
    relatedComponentIds: ["api_gateway", "sql_database", "cache", "queue"],
    keyIdeas: [
      "Start from requirements and constraints, not components",
      "Every choice has a tradeoff - name it before the interviewer does",
      "Don't over-engineer; match complexity to the requirements",
      "Be able to explain the request flow and failure modes out loud",
    ],
    commonMistakes: [
      "Listing buzzwords with no reasoning",
      "Over-engineering a simple problem",
      "Failing to state assumptions and tradeoffs",
    ],
    miniChallenge:
      "Pitch your URL shortener design in 90 seconds, leading with requirements.",
  },
];

export function getCourseModule(id: string): CourseModule | undefined {
  return COURSE_MODULES.find((m) => m.id === id);
}
