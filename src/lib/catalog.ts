import {
  Activity,
  Archive,
  Boxes,
  Cloud,
  Cpu,
  Database,
  FileSearch,
  Globe,
  HardDrive,
  KeyRound,
  Layers,
  ListChecks,
  Lock,
  MailWarning,
  Network,
  Plug,
  Server,
  ShieldCheck,
  Workflow,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { ArchitectureNodeType, DecisionCategory } from "./types";

/** Display groups, mirroring the system-design-primer categories. */
export type PaletteGroup =
  | "Compute"
  | "Networking"
  | "Data"
  | "Async"
  | "Reliability"
  | "Security"
  | "Observability"
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
    label: "Web / Mobile App",
    group: "Compute",
    icon: Globe,
    accent: "text-sky-400",
    purpose: "The client experience users interact with.",
    whenToUse: ["Any user-facing product", "Browser or mobile front end"],
    tradeoffs: [
      "Rendering strategy (SSR/CSR/SSG) affects latency and SEO",
      "State and auth must be handled carefully on the client",
    ],
    commonPatterns: ["Talks to an API gateway or backend API, never the DB directly"],
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
    label: "Authorization Boundary",
    group: "Security",
    icon: ShieldCheck,
    accent: "text-fuchsia-400",
    purpose: "Decides what an authenticated identity is allowed to do (RBAC/ABAC).",
    whenToUse: [
      "Multiple roles (admin vs user vs partner)",
      "Multi-tenant data isolation",
    ],
    tradeoffs: [
      "Centralized policy is consistent but can be a bottleneck",
      "Per-service checks are flexible but easy to get inconsistent",
    ],
    commonPatterns: ["Policy checks on every privileged action, not just login"],
  },
  sql_database: {
    type: "sql_database",
    label: "SQL Database",
    group: "Data",
    icon: Database,
    accent: "text-blue-400",
    decisionCategory: "database",
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
    decisionCategory: "database",
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
    decisionCategory: "storage",
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
    label: "Backup / Restore",
    group: "Reliability",
    icon: Archive,
    accent: "text-teal-400",
    purpose: "Point-in-time recovery for durable data stores.",
    whenToUse: ["Any system of record", "Anything you cannot afford to lose"],
    tradeoffs: [
      "Protects against data loss and corruption",
      "Backups are worthless if you never test restores",
    ],
    commonPatterns: ["Automated snapshots", "Periodic restore drills"],
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
};

export const CATALOG_LIST: CatalogEntry[] = Object.values(CATALOG);

export const PALETTE_GROUPS: PaletteGroup[] = [
  "Compute",
  "Networking",
  "Data",
  "Async",
  "Reliability",
  "Security",
  "Observability",
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
