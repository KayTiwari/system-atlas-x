import {
  Activity,
  Archive,
  Boxes,
  Cloud,
  CloudCog,
  Cpu,
  GitBranch,
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
  Rocket,
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
