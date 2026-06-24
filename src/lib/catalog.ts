import {
  Activity,
  Archive,
  Boxes,
  Cloud,
  CloudCog,
  Cpu,
  GitBranch,
  Database,
  FileCode2,
  FileSearch,
  Globe,
  Smartphone,
  Split,
  HardDrive,
  KeyRound,
  Layers,
  ListChecks,
  Lock,
  MailWarning,
  Network,
  Plug,
  Rocket,
  Server,
  ShieldCheck,
  Workflow,
  Zap,
  Scale,
  Radio,
  CreditCard,
  Bell,
  Fingerprint,
  Webhook,
  BarChart3,
  Warehouse,
  Flag,
  LayoutDashboard,
  CalendarClock,
  ShieldAlert,
  FileJson,
  SlidersHorizontal,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { ArchitectureNodeType, DecisionCategory } from "./types";

/** Display groups, mirroring the system-design-primer categories. */
export type PaletteGroup =
  | "Client"
  | "Compute"
  | "Networking"
  | "Data"
  | "Async"
  | "Reliability"
  | "Security"
  | "Observability"
  | "Platform"
  | "External";

export type CatalogEntry = {
  type: ArchitectureNodeType;
  label: string;
  group: PaletteGroup;
  icon: LucideIcon;
  accent: string; // tailwind text color class for the node icon
  /** Links a component to the Tradeoff Engine decision category, when relevant. */
  decisionCategory?: DecisionCategory;
  defaultTechnology?: string;
  purpose: string;
  whenToUse: string[];
  tradeoffs: string[];
  commonPatterns: string[];
};

export const CATALOG: Record<ArchitectureNodeType, CatalogEntry> = {
  web_app: {
    type: "web_app",
    label: "Web App",
    group: "Client",
    icon: Globe,
    accent: "text-sky-400",
    decisionCategory: "frontend",
    defaultTechnology: "Next.js",
    purpose: "The browser client users interact with.",
    whenToUse: ["Any user-facing web product", "Dashboards, storefronts, SaaS UIs"],
    tradeoffs: [
      "Rendering strategy (SSR/CSR/SSG/ISR) trades SEO and TTFB against complexity",
      "State and auth must be handled carefully on the client",
    ],
    commonPatterns: ["Talks to an API gateway or backend API, never the DB directly"],
  },
  mobile_app: {
    type: "mobile_app",
    label: "Mobile App",
    group: "Client",
    icon: Smartphone,
    accent: "text-sky-400",
    defaultTechnology: "React Native",
    purpose: "A native or cross-platform app on phones and tablets.",
    whenToUse: ["Push notifications, offline use, device APIs", "App-store presence"],
    tradeoffs: [
      "Cross-platform (React Native/Flutter) trades native polish for shared code",
      "Release cycles are gated by app-store review",
    ],
    commonPatterns: ["Calls the same backend API as the web client, often via a BFF"],
  },
  static_site: {
    type: "static_site",
    label: "Static Site / SSG",
    group: "Client",
    icon: FileCode2,
    accent: "text-cyan-400",
    decisionCategory: "frontend",
    defaultTechnology: "Astro",
    purpose: "Pre-rendered pages served from a CDN, optionally hydrated.",
    whenToUse: ["Marketing sites, docs, blogs", "Content-heavy, read-mostly pages"],
    tradeoffs: [
      "Fastest TTFB and cheapest hosting; rebuilds on content change",
      "Dynamic, per-user content needs client fetches or edge functions",
    ],
    commonPatterns: ["Built in CI and pushed to a CDN; APIs called from the edge/client"],
  },
  bff: {
    type: "bff",
    label: "Backend for Frontend",
    group: "Client",
    icon: Split,
    accent: "text-emerald-400",
    decisionCategory: "compute",
    defaultTechnology: "Node.js",
    purpose: "A thin API tailored to one client, aggregating downstream services.",
    whenToUse: ["Web and mobile need different payloads", "Hiding service sprawl from clients"],
    tradeoffs: [
      "Trims over-fetching and shapes responses per client",
      "One more service to deploy; can drift into a second monolith",
    ],
    commonPatterns: ["Sits between the client and internal services; owns no database"],
  },
  api_gateway: {
    type: "api_gateway",
    label: "API Gateway",
    group: "Networking",
    icon: Network,
    accent: "text-indigo-400",
    purpose: "Single entry point that routes, authenticates, and shapes API traffic.",
    whenToUse: [
      "You expose APIs to external clients",
      "You need centralized auth, routing, and rate limiting",
    ],
    tradeoffs: [
      "Adds a network hop and a potential single point of failure",
      "Can become a bottleneck if under-provisioned",
    ],
    commonPatterns: ["Sits in front of services; pairs with a rate limiter and auth"],
  },
  api_service: {
    type: "api_service",
    label: "API Service",
    group: "Compute",
    icon: Server,
    accent: "text-emerald-400",
    decisionCategory: "compute",
    purpose: "Stateless backend service that implements business logic and APIs.",
    whenToUse: ["Core request/response handling", "Owning a bounded domain"],
    tradeoffs: [
      "Stateless scales horizontally; push state into databases/caches",
      "Service boundaries affect coupling and deployment",
    ],
    commonPatterns: ["Behind a load balancer / gateway", "Owns one database"],
  },
  rate_limiter: {
    type: "rate_limiter",
    label: "Rate Limiter",
    group: "Networking",
    icon: Zap,
    accent: "text-amber-400",
    purpose: "Protects services by capping request rates per client/key.",
    whenToUse: ["Public APIs", "Expensive endpoints", "Abuse / cost control"],
    tradeoffs: [
      "Too strict harms legitimate users; too loose invites abuse",
      "Needs shared storage (often Redis) for distributed counting",
    ],
    commonPatterns: ["Token bucket / sliding window at the gateway"],
  },
  auth_provider: {
    type: "auth_provider",
    label: "Auth Provider",
    group: "Security",
    icon: KeyRound,
    accent: "text-fuchsia-400",
    decisionCategory: "auth",
    purpose: "Establishes identity (who the caller is) via login / tokens.",
    whenToUse: ["Any system with accounts", "OAuth / OIDC / SSO needs"],
    tradeoffs: [
      "Build vs buy: custom auth is risky; managed auth adds lock-in",
      "Token lifetimes trade security against UX",
    ],
    commonPatterns: ["Issues JWT/session validated by the gateway or services"],
  },
  authorization: {
    type: "authorization",
    label: "Authorization & RLS",
    group: "Security",
    icon: ShieldCheck,
    accent: "text-fuchsia-400",
    purpose:
      "Decides what an authenticated identity is allowed to do (RBAC/ABAC) and enforces row-level security (RLS) at the data layer.",
    whenToUse: [
      "Multiple roles (admin vs user vs partner)",
      "Multi-tenant data isolation",
      "Per-row access control enforced in the database",
    ],
    tradeoffs: [
      "Centralized policy is consistent but can be a bottleneck",
      "Per-service checks are flexible but easy to get inconsistent",
      "RLS keeps enforcement close to the data but is easy to misconfigure",
    ],
    commonPatterns: [
      "Policy checks on every privileged action, not just login",
      "Postgres RLS policies scoped by tenant / owner",
    ],
  },
  sql_database: {
    type: "sql_database",
    label: "SQL Database",
    group: "Data",
    icon: Database,
    accent: "text-blue-400",
    decisionCategory: "sqlDatabase",
    defaultTechnology: "Postgres",
    purpose: "Relational store for structured, transactional data.",
    whenToUse: [
      "Relationships, transactions, reporting",
      "When unsure - a sensible default",
    ],
    tradeoffs: [
      "Strong consistency and joins",
      "Horizontal write scaling is harder than some NoSQL options",
    ],
    commonPatterns: ["One database per service", "Read replicas before sharding"],
  },
  nosql_database: {
    type: "nosql_database",
    label: "NoSQL Database",
    group: "Data",
    icon: Database,
    accent: "text-blue-400",
    decisionCategory: "noSqlDatabase",
    defaultTechnology: "DynamoDB",
    purpose: "Non-relational store optimized for scale and flexible schemas.",
    whenToUse: [
      "Known access patterns at large scale",
      "Document- or key-value-shaped data",
    ],
    tradeoffs: [
      "Excellent scale and availability",
      "Limited ad-hoc querying; model access patterns upfront",
    ],
    commonPatterns: ["Single-table design", "Denormalized for read paths"],
  },
  object_storage: {
    type: "object_storage",
    label: "Object Storage",
    group: "Data",
    icon: HardDrive,
    accent: "text-cyan-400",
    decisionCategory: "objectStorage",
    defaultTechnology: "S3",
    purpose: "Cheap, scalable storage for large files and blobs.",
    whenToUse: ["File uploads, images, documents, backups"],
    tradeoffs: [
      "Cheap and durable at scale",
      "Needs metadata in the DB and signed-URL access control",
    ],
    commonPatterns: ["Store file in object storage, metadata + ACL in the DB"],
  },
  cache: {
    type: "cache",
    label: "Cache",
    group: "Data",
    icon: Zap,
    accent: "text-rose-400",
    decisionCategory: "cache",
    defaultTechnology: "Redis",
    purpose: "Fast in-memory store for hot reads and ephemeral state.",
    whenToUse: [
      "Frequent, repeated, expensive reads",
      "Sessions, rate-limit counters",
    ],
    tradeoffs: [
      "Big latency wins",
      "Requires an invalidation strategy; stale data risk",
    ],
    commonPatterns: ["Cache-aside", "Write-through", "TTL + invalidation on write"],
  },
  queue: {
    type: "queue",
    label: "Message Queue",
    group: "Async",
    icon: Workflow,
    accent: "text-orange-400",
    decisionCategory: "queue",
    defaultTechnology: "SQS",
    purpose: "Decouples producers from consumers for async work.",
    whenToUse: [
      "Work can happen after the request",
      "Smoothing spikes, retries, background jobs",
    ],
    tradeoffs: [
      "Improves resilience and responsiveness",
      "Adds eventual consistency and ops complexity",
    ],
    commonPatterns: ["Producer → queue → worker", "Pairs with a dead-letter queue"],
  },
  dead_letter_queue: {
    type: "dead_letter_queue",
    label: "Dead-Letter Queue",
    group: "Async",
    icon: MailWarning,
    accent: "text-orange-400",
    purpose: "Captures messages that repeatedly fail processing.",
    whenToUse: ["Any queue-based pipeline you care about"],
    tradeoffs: [
      "Prevents silent data loss",
      "Needs monitoring and a replay/triage process",
    ],
    commonPatterns: ["Max-retries then route to DLQ + alert"],
  },
  worker: {
    type: "worker",
    label: "Background Worker",
    group: "Compute",
    icon: Cpu,
    accent: "text-emerald-400",
    decisionCategory: "compute",
    purpose: "Consumes async jobs and performs longer-running processing.",
    whenToUse: ["Image/file processing", "Email, exports, scheduled work"],
    tradeoffs: [
      "Keeps request latency low",
      "Needs idempotency, retries, and a job-status model",
    ],
    commonPatterns: ["Pull from queue", "Idempotent handlers", "Status table"],
  },
  cdn: {
    type: "cdn",
    label: "CDN",
    group: "Networking",
    icon: Cloud,
    accent: "text-indigo-400",
    purpose: "Serves static/edge content from locations near users.",
    whenToUse: ["Static assets, media", "Global low-latency delivery"],
    tradeoffs: [
      "Cuts latency and origin load",
      "Cache invalidation and cost considerations",
    ],
    commonPatterns: ["Pull CDN in front of object storage / app"],
  },
  audit_log: {
    type: "audit_log",
    label: "Audit Log",
    group: "Security",
    icon: ListChecks,
    accent: "text-fuchsia-400",
    purpose: "Immutable record of sensitive actions for compliance and forensics.",
    whenToUse: [
      "Sensitive data access",
      "Compliance (HIPAA, SOC 2, GDPR)",
    ],
    tradeoffs: [
      "Essential for accountability",
      "Append-only volume and retention to manage",
    ],
    commonPatterns: ["Append-only store", "Separate from operational data"],
  },
  backup: {
    type: "backup",
    label: "Backup & Recovery",
    group: "Reliability",
    icon: Archive,
    accent: "text-teal-400",
    purpose:
      "Point-in-time recovery for durable data stores, paired with a tested restore and rollback plan.",
    whenToUse: ["Any system of record", "Anything you cannot afford to lose"],
    tradeoffs: [
      "Protects against data loss and corruption",
      "Backups are worthless if you never test restores",
    ],
    commonPatterns: [
      "Automated snapshots",
      "Periodic restore drills",
      "Documented recovery runbook (RTO/RPO)",
    ],
  },
  read_replica: {
    type: "read_replica",
    label: "Read Replica",
    group: "Reliability",
    icon: Layers,
    accent: "text-teal-400",
    purpose: "Read-only database copy for scaling reads and availability.",
    whenToUse: ["Read-heavy workloads", "Reporting offloaded from primary"],
    tradeoffs: [
      "Scales reads and adds failover options",
      "Replication lag means eventual consistency on reads",
    ],
    commonPatterns: ["Route reads to replicas, writes to primary"],
  },
  search: {
    type: "search",
    label: "Search Index",
    group: "Data",
    icon: FileSearch,
    accent: "text-cyan-400",
    decisionCategory: "search",
    purpose: "Full-text / faceted search over your data.",
    whenToUse: ["Rich text search, filters, relevance ranking"],
    tradeoffs: [
      "Powerful querying",
      "A second store to keep in sync with the source of truth",
    ],
    commonPatterns: ["Postgres FTS for simple needs", "Elasticsearch/OpenSearch at scale"],
  },
  vector_database: {
    type: "vector_database",
    label: "Vector Database",
    group: "Data",
    icon: Boxes,
    accent: "text-cyan-400",
    decisionCategory: "vectorStore",
    purpose: "Stores embeddings for semantic search and RAG.",
    whenToUse: ["AI/RAG retrieval", "Semantic similarity search"],
    tradeoffs: [
      "Enables semantic recall",
      "Another store; pgvector keeps it close to existing Postgres",
    ],
    commonPatterns: ["pgvector for simplicity", "Pinecone/Qdrant for scale"],
  },
  external_api: {
    type: "external_api",
    label: "External API",
    group: "External",
    icon: Plug,
    accent: "text-slate-300",
    purpose: "A third-party service your system depends on.",
    whenToUse: ["Stripe, Twilio, OpenAI, Salesforce, etc."],
    tradeoffs: [
      "Buy vs build leverage",
      "Latency, rate limits, and outages outside your control",
    ],
    commonPatterns: ["Wrap with timeouts, retries, and a circuit breaker"],
  },
  monitoring: {
    type: "monitoring",
    label: "Monitoring / Observability",
    group: "Observability",
    icon: Activity,
    accent: "text-lime-400",
    decisionCategory: "observability",
    purpose: "Logs, metrics, traces, and alerting for the system.",
    whenToUse: ["Anything running in production"],
    tradeoffs: [
      "You cannot operate what you cannot see",
      "Cost and noise if alerting is not tuned",
    ],
    commonPatterns: ["Metrics + logs + traces", "Alert on SLOs, not every blip"],
  },
  ci_cd: {
    type: "ci_cd",
    label: "CI/CD & Version Control",
    group: "Platform",
    icon: GitBranch,
    accent: "text-violet-400",
    purpose:
      "Source control plus an automated pipeline that builds, tests, and ships every change.",
    whenToUse: [
      "Any code that reaches more than one environment",
      "More than one engineer touching the codebase",
    ],
    tradeoffs: [
      "Catches regressions before they reach users",
      "Pipeline upkeep and flaky tests cost time if neglected",
    ],
    commonPatterns: [
      "PR checks → build → test → deploy on merge",
      "One-click rollback to the last green build",
    ],
  },
  hosting: {
    type: "hosting",
    label: "Hosting & Deployment",
    group: "Platform",
    icon: Rocket,
    accent: "text-violet-400",
    purpose: "Where the app runs and how new versions are rolled out to it.",
    whenToUse: ["Anything that has to be reachable in production"],
    tradeoffs: [
      "Serverless/PaaS trades control for less operational burden",
      "Containers/VMs give control but you own scaling and patching",
    ],
    commonPatterns: [
      "Blue/green or rolling deploys behind a load balancer",
      "Health checks gate traffic; failed deploys auto-roll-back",
    ],
  },
  cloud_platform: {
    type: "cloud_platform",
    label: "Cloud & Compute",
    group: "Platform",
    icon: CloudCog,
    accent: "text-violet-400",
    purpose:
      "The cloud account, network, and compute foundation everything else runs on.",
    whenToUse: ["Any system not running on a single box you own"],
    tradeoffs: [
      "Managed infrastructure scales on demand",
      "Cost, region, and IAM sprawl need governance from day one",
    ],
    commonPatterns: [
      "Infrastructure as code (Terraform/CDK)",
      "Isolated VPC + least-privilege cloud IAM",
    ],
  },
  load_balancer: {
    type: "load_balancer",
    label: "Load Balancer",
    group: "Networking",
    icon: Scale,
    accent: "text-indigo-400",
    purpose:
      "Spreads incoming traffic across many service instances and routes around unhealthy ones.",
    whenToUse: [
      "More than one instance of a service",
      "Zero-downtime deploys and failover",
      "Any internet-facing system at scale",
    ],
    tradeoffs: [
      "Enables horizontal scaling and health-gated routing",
      "Itself must be highly available; adds a hop and config surface",
    ],
    commonPatterns: [
      "L7 LB in front of stateless services",
      "Health checks remove bad instances from rotation",
    ],
  },
  event_bus: {
    type: "event_bus",
    label: "Event Bus",
    group: "Async",
    icon: Radio,
    accent: "text-orange-400",
    purpose:
      "Publishes domain events to many independent subscribers (pub/sub fan-out).",
    whenToUse: [
      "One action must notify several systems",
      "Decoupling producers from a growing set of consumers",
      "Event-driven and real-time fan-out",
    ],
    tradeoffs: [
      "Loose coupling and easy extension",
      "Harder to trace; ordering and at-least-once delivery need handling",
    ],
    commonPatterns: [
      "Publish event, N subscribers react independently",
      "Pairs with idempotent consumers and a DLQ",
    ],
  },
  payment_provider: {
    type: "payment_provider",
    label: "Payment Provider",
    group: "External",
    icon: CreditCard,
    accent: "text-emerald-400",
    purpose:
      "A third party (Stripe, Adyen) that processes charges and holds PCI scope.",
    whenToUse: ["Taking payments", "Subscriptions, marketplaces, checkout"],
    tradeoffs: [
      "Provider-hosted checkout slashes PCI scope",
      "Less UI control; you must reconcile their state with yours",
    ],
    commonPatterns: [
      "Create payment intent, confirm via webhook",
      "Idempotency keys on every money-moving call",
    ],
  },
  notification_provider: {
    type: "notification_provider",
    label: "Notification Provider",
    group: "External",
    icon: Bell,
    accent: "text-emerald-400",
    purpose:
      "Sends email, SMS, or push through a third party (SES, Twilio, FCM).",
    whenToUse: ["Transactional email/SMS", "Push notifications", "Alerts"],
    tradeoffs: [
      "Buy vs build deliverability and carrier relationships",
      "External rate limits and outages; needs retries and a fallback",
    ],
    commonPatterns: [
      "Queue notifications, worker calls provider with retries",
      "Track delivery status and suppress on bounce",
    ],
  },
  idempotency_layer: {
    type: "idempotency_layer",
    label: "Idempotency Layer",
    group: "Reliability",
    icon: Fingerprint,
    accent: "text-teal-400",
    purpose:
      "Deduplicates retried or replayed requests so an operation runs at most once.",
    whenToUse: [
      "Payments and any money-moving operation",
      "Webhook processing and at-least-once queues",
      "Anywhere a client may retry",
    ],
    tradeoffs: [
      "Prevents duplicate charges and double-processing",
      "Needs a key store and a clear key-scoping strategy",
    ],
    commonPatterns: [
      "Idempotency key + stored result, replayed on retry",
      "Unique constraint on (operation, key)",
    ],
  },
  webhook_handler: {
    type: "webhook_handler",
    label: "Webhook Handler",
    group: "Compute",
    icon: Webhook,
    accent: "text-emerald-400",
    purpose:
      "Receives, verifies, and processes asynchronous callbacks from external systems.",
    whenToUse: [
      "Payment provider confirmations",
      "Any provider that calls you back",
    ],
    tradeoffs: [
      "Decouples you from provider latency",
      "Must verify signatures, dedupe, and tolerate out-of-order delivery",
    ],
    commonPatterns: [
      "Verify signature, store raw event, process async",
      "Return 200 fast, do work on a queue",
    ],
  },
  analytics_pipeline: {
    type: "analytics_pipeline",
    label: "Analytics Pipeline",
    group: "Data",
    icon: BarChart3,
    accent: "text-cyan-400",
    purpose:
      "Collects, buffers, and transforms events into a store for reporting and trends.",
    whenToUse: [
      "Product analytics and dashboards",
      "Trend detection over event streams",
    ],
    tradeoffs: [
      "Keeps the hot path fast by processing async",
      "Eventual consistency; schema drift needs governance",
    ],
    commonPatterns: [
      "Emit event → buffer/queue → transform → warehouse",
      "Keep raw events; derive aggregates downstream",
    ],
  },
  data_warehouse: {
    type: "data_warehouse",
    label: "Data Warehouse",
    group: "Data",
    icon: Warehouse,
    accent: "text-blue-400",
    purpose:
      "Columnar store optimized for analytical queries over large historical data.",
    whenToUse: ["Reporting, BI, trend analysis", "Querying months of events"],
    tradeoffs: [
      "Fast aggregates over huge datasets",
      "Not a transactional store; batch/stream loads add lag",
    ],
    commonPatterns: [
      "ELT from the app DB / event pipeline",
      "Separate from the operational source of truth",
    ],
  },
  secrets_manager: {
    type: "secrets_manager",
    label: "Secrets Manager",
    group: "Security",
    icon: Lock,
    accent: "text-fuchsia-400",
    purpose:
      "Stores and rotates credentials, keys, and tokens out of code and config.",
    whenToUse: [
      "Any system with API keys or DB credentials",
      "High-sensitivity or regulated data",
    ],
    tradeoffs: [
      "Central rotation and least-privilege access",
      "A dependency on the request/boot path if not cached carefully",
    ],
    commonPatterns: [
      "Inject secrets at runtime, never in the repo",
      "Short-lived credentials with automatic rotation",
    ],
  },
  feature_flag: {
    type: "feature_flag",
    label: "Feature Flag Service",
    group: "Platform",
    icon: Flag,
    accent: "text-violet-400",
    purpose:
      "Toggles features at runtime for rollout, experimentation, and kill switches.",
    whenToUse: [
      "Progressive rollout and canary releases",
      "A/B tests and emergency kill switches",
    ],
    tradeoffs: [
      "Decouples deploy from release; instant rollback",
      "Flag debt accumulates; another runtime dependency",
    ],
    commonPatterns: [
      "Evaluate flags at the edge or in-service",
      "Clean up stale flags on a schedule",
    ],
  },
  admin_dashboard: {
    type: "admin_dashboard",
    label: "Admin Dashboard",
    group: "Client",
    icon: LayoutDashboard,
    accent: "text-sky-400",
    purpose:
      "Internal console for staff to view, moderate, and act on data.",
    whenToUse: [
      "Operations, support, and moderation workflows",
      "Reviewing intake, orders, or flagged content",
    ],
    tradeoffs: [
      "Unlocks staff productivity",
      "A privileged surface: needs auth, RBAC, and audit logging",
    ],
    commonPatterns: [
      "Separate auth boundary and roles from end users",
      "Every privileged action writes an audit entry",
    ],
  },
  scheduler: {
    type: "scheduler",
    label: "Scheduler / Cron",
    group: "Async",
    icon: CalendarClock,
    accent: "text-orange-400",
    purpose:
      "Triggers recurring or future-dated jobs (reports, cleanup, reconciliation).",
    whenToUse: [
      "Nightly batch and digests",
      "Reconciliation and retention sweeps",
    ],
    tradeoffs: [
      "Simple time-based automation",
      "Needs locking so a job runs once across instances",
    ],
    commonPatterns: [
      "Cron enqueues a job; a worker does the work",
      "Distributed lock to avoid double-runs",
    ],
  },
  malware_scanner: {
    type: "malware_scanner",
    label: "Malware Scanner",
    group: "Security",
    icon: ShieldAlert,
    accent: "text-fuchsia-400",
    purpose:
      "Scans user-uploaded files for malicious content before they are served.",
    whenToUse: [
      "Any system accepting file uploads",
      "Files later served to other users",
    ],
    tradeoffs: [
      "Stops you from hosting and serving malware",
      "Adds processing latency; quarantine flow needed",
    ],
    commonPatterns: [
      "Upload to quarantine bucket, scan async, then promote",
      "Block serving until scan passes",
    ],
  },
  api_contract: {
    type: "api_contract",
    label: "API Contract / Schema",
    group: "Compute",
    icon: FileJson,
    accent: "text-emerald-400",
    purpose:
      "A versioned, validated schema (OpenAPI/GraphQL) defining the API surface.",
    whenToUse: [
      "Public or partner APIs",
      "Multiple teams or clients consuming an API",
    ],
    tradeoffs: [
      "Stable contracts and generated clients/validation",
      "Versioning discipline and deprecation process required",
    ],
    commonPatterns: [
      "Schema-first with request/response validation",
      "Contract tests gate breaking changes in CI",
    ],
  },
  config_service: {
    type: "config_service",
    label: "Configuration Service",
    group: "Platform",
    icon: SlidersHorizontal,
    accent: "text-violet-400",
    purpose:
      "Centralizes runtime configuration across services and environments.",
    whenToUse: [
      "Many services sharing settings",
      "Changing config without a redeploy",
    ],
    tradeoffs: [
      "Consistent, auditable config",
      "A new dependency; cache and fail safe on outages",
    ],
    commonPatterns: [
      "Versioned config with safe defaults",
      "Watch/poll for changes; validate on load",
    ],
  },
  recommendation_service: {
    type: "recommendation_service",
    label: "Recommendation Service",
    group: "Compute",
    icon: Sparkles,
    accent: "text-emerald-400",
    purpose:
      "Computes personalized rankings or suggestions from user and item data.",
    whenToUse: [
      "Feeds, related items, personalization",
      "Discovery in content and marketplaces",
    ],
    tradeoffs: [
      "Drives engagement and discovery",
      "Needs feature data, retraining, and a sensible cold-start fallback",
    ],
    commonPatterns: [
      "Precompute candidates offline, rank at request time",
      "Fall back to popularity when signals are thin",
    ],
  },
};

export const CATALOG_LIST: CatalogEntry[] = Object.values(CATALOG);

export const PALETTE_GROUPS: PaletteGroup[] = [
  "Client",
  "Compute",
  "Networking",
  "Data",
  "Async",
  "Reliability",
  "Security",
  "Observability",
  "Platform",
  "External",
];

/** A friendly default node payload for a freshly dropped component. */
export function defaultNodeData(type: ArchitectureNodeType) {
  const entry = CATALOG[type];
  return {
    architectureType: type,
    name: entry.label,
    description: entry.purpose,
    technology: entry.defaultTechnology,
    dataStored: [],
    securityNotes: [],
    costNotes: [],
    linkedDecisions: [],
  };
}
