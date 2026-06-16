import type {
  ArchitectureNodeType,
  DecisionCategory,
  DecisionCriterion,
} from "./types";

/**
 * A technology option scored 1-5 per criterion, where **higher is always
 * better** (cost: higher = cheaper; operationalComplexity: higher = simpler to
 * run; vendorLockIn: higher = less lock-in). Scores are for comparison, not
 * truth - the UI frames them as "suggested fit," never "objectively best."
 */
export type TechnologyOption = {
  id: string;
  name: string;
  category: DecisionCategory;
  scores: Record<DecisionCriterion, number>;
  bestFor: string[];
  avoidWhen: string[];
  chooseWhen: string;
  tradeoffs: string[];
  /**
   * When swapping a node to this option, retype the node to this architecture
   * type (e.g. Postgres → sql_database, DynamoDB → nosql_database). Omitted
   * when swapping only changes the technology label, not the node's role.
   */
  nodeType?: ArchitectureNodeType;
};

export const CRITERIA: { key: DecisionCriterion; label: string }[] = [
  { key: "simplicity", label: "Simplicity" },
  { key: "scalability", label: "Scalability" },
  { key: "cost", label: "Cost" },
  { key: "consistency", label: "Consistency" },
  { key: "operationalComplexity", label: "Low ops" },
  { key: "teamFamiliarity", label: "Familiarity" },
  { key: "vendorLockIn", label: "No lock-in" },
  { key: "latency", label: "Latency" },
  { key: "compliance", label: "Compliance" },
];

function s(
  simplicity: number,
  scalability: number,
  cost: number,
  consistency: number,
  operationalComplexity: number,
  teamFamiliarity: number,
  vendorLockIn: number,
  latency: number,
  compliance: number
): Record<DecisionCriterion, number> {
  return {
    simplicity,
    scalability,
    cost,
    consistency,
    operationalComplexity,
    teamFamiliarity,
    vendorLockIn,
    latency,
    compliance,
  };
}

export const TECHNOLOGY_OPTIONS: TechnologyOption[] = [
  // ---- Frontend / rendering strategy ----
  {
    id: "nextjs",
    name: "Next.js",
    category: "frontend",
    scores: s(3, 5, 4, 4, 4, 5, 3, 4, 3),
    bestFor: ["SSR/ISR with SEO", "Apps that mix static and dynamic pages"],
    avoidWhen: ["A purely static brochure site", "You want zero framework overhead"],
    chooseWhen: "You want SEO and a batteries-included React framework - and when in doubt.",
    tradeoffs: [
      "Server rendering plus a huge ecosystem and hiring pool.",
      "More moving parts than a plain SPA; best on a Node or edge host.",
    ],
  },
  {
    id: "react-spa",
    name: "React SPA",
    category: "frontend",
    scores: s(5, 4, 5, 3, 5, 5, 5, 3, 3),
    bestFor: ["Highly interactive app behind a login", "Cheap static hosting"],
    avoidWhen: ["SEO matters", "Slow first paint hurts conversion"],
    chooseWhen: "The app lives behind auth and SEO does not matter.",
    tradeoffs: [
      "Dead simple to host as static files on a CDN.",
      "Weak SEO and a slower first paint without server rendering.",
    ],
  },
  {
    id: "sveltekit",
    name: "SvelteKit",
    category: "frontend",
    scores: s(4, 4, 4, 4, 4, 3, 4, 5, 3),
    bestFor: ["Lean, fast UIs", "Less client JavaScript"],
    avoidWhen: ["You need the largest ecosystem and hiring pool"],
    chooseWhen: "You want top performance and a smaller bundle than React.",
    tradeoffs: [
      "Excellent performance and ergonomics.",
      "Smaller ecosystem and talent pool than React.",
    ],
  },
  {
    id: "astro",
    name: "Astro",
    category: "frontend",
    scores: s(4, 5, 5, 4, 5, 3, 4, 5, 3),
    bestFor: ["Content sites, docs, blogs", "Mostly-static, read-heavy pages"],
    avoidWhen: ["App-like, highly interactive dashboards"],
    chooseWhen: "The site is content-first and ships little client JavaScript.",
    tradeoffs: [
      "Ships near-zero JS by default; very fast and cheap on a CDN.",
      "Less suited to stateful, app-like interactivity.",
    ],
  },
  {
    id: "remix",
    name: "Remix",
    category: "frontend",
    scores: s(3, 4, 4, 4, 4, 3, 4, 4, 3),
    bestFor: ["Form-heavy apps", "Progressive enhancement and web standards"],
    avoidWhen: ["A static site", "Your team is standardized on Next.js"],
    chooseWhen: "You want server-rendered React built around web fundamentals.",
    tradeoffs: [
      "Great data loading and mutation story on web standards.",
      "Smaller community than Next.js.",
    ],
  },
  {
    id: "nuxt",
    name: "Nuxt",
    category: "frontend",
    scores: s(3, 4, 4, 4, 4, 4, 4, 4, 3),
    bestFor: ["Vue teams wanting SSR/SSG"],
    avoidWhen: ["The team is React-first"],
    chooseWhen: "Your team prefers Vue and wants a Next.js-style framework.",
    tradeoffs: [
      "Next.js-class features for the Vue ecosystem.",
      "Smaller ecosystem than React/Next.",
    ],
  },

  // ---- SQL database ----
  {
    id: "postgres",
    name: "Postgres",
    category: "sqlDatabase",
    nodeType: "sql_database",
    scores: s(4, 3, 4, 5, 3, 5, 4, 4, 4),
    bestFor: ["Relational data", "Transactions", "Reporting", "Audit logs"],
    avoidWhen: ["Unbounded write scale with simple key-value access"],
    chooseWhen: "You need consistency and joins - and when in doubt.",
    tradeoffs: [
      "Reliable, expressive, and well-understood.",
      "Horizontal write scaling is harder than some NoSQL options.",
    ],
  },
  {
    id: "mysql",
    name: "MySQL",
    category: "sqlDatabase",
    nodeType: "sql_database",
    scores: s(4, 4, 4, 4, 3, 5, 4, 4, 4),
    bestFor: ["Relational data", "Common web workloads", "Managed cloud SQL"],
    avoidWhen: ["Heavy analytical queries", "Advanced Postgres-specific features"],
    chooseWhen: "Your team knows MySQL or the ecosystem already standardizes on it.",
    tradeoffs: [
      "Mature, familiar, and widely hosted.",
      "Less feature-rich than Postgres for complex data modeling.",
    ],
  },
  {
    id: "sqlite",
    name: "SQLite",
    category: "sqlDatabase",
    nodeType: "sql_database",
    scores: s(5, 1, 5, 4, 5, 5, 5, 4, 2),
    bestFor: ["Embedded apps", "Local-first prototypes", "Small single-writer systems"],
    avoidWhen: ["Multi-writer backend services", "High-concurrency production APIs"],
    chooseWhen: "The database lives with one app instance and simplicity matters most.",
    tradeoffs: [
      "Tiny operational footprint.",
      "Not a fit for horizontally scaled write-heavy services.",
    ],
  },

  // ---- NoSQL database ----
  {
    id: "mongodb",
    name: "MongoDB",
    category: "noSqlDatabase",
    nodeType: "nosql_database",
    scores: s(4, 4, 3, 3, 3, 4, 3, 4, 3),
    bestFor: ["Document-shaped data", "Flexible/evolving schemas"],
    avoidWhen: ["Heavily relational data", "Strong multi-document transactions"],
    chooseWhen: "Your data is naturally document-shaped.",
    tradeoffs: [
      "Flexible schema and easy to start.",
      "Relationships and joins get awkward.",
    ],
  },
  {
    id: "dynamodb",
    name: "DynamoDB",
    category: "noSqlDatabase",
    nodeType: "nosql_database",
    scores: s(2, 5, 4, 4, 4, 3, 2, 5, 4),
    bestFor: ["Massive scale", "Predictable access patterns"],
    avoidWhen: ["Ad-hoc querying", "Unknown access patterns"],
    chooseWhen: "Access patterns are known and designed upfront.",
    tradeoffs: [
      "Excellent scale and low operational burden.",
      "Query flexibility is limited; model access patterns first.",
    ],
  },
  {
    id: "firebase",
    name: "Firebase",
    category: "noSqlDatabase",
    nodeType: "nosql_database",
    scores: s(5, 3, 3, 3, 5, 3, 1, 4, 2),
    bestFor: ["Fast MVPs", "Realtime client sync"],
    avoidWhen: ["Complex queries", "Avoiding vendor lock-in"],
    chooseWhen: "A small team needs speed over control.",
    tradeoffs: ["Very fast to ship.", "Lock-in and complex security rules later."],
  },

  // ---- Cache ----
  {
    id: "redis",
    name: "Redis",
    category: "cache",
    scores: s(4, 4, 4, 3, 3, 4, 4, 5, 3),
    bestFor: ["Hot reads", "Sessions", "Rate-limit counters"],
    avoidWhen: ["Correctness matters more than speed"],
    chooseWhen: "Reads are frequent, repeated, and expensive.",
    tradeoffs: ["Big latency wins.", "Needs an invalidation strategy."],
  },
  {
    id: "cdn-cache",
    name: "CDN cache",
    category: "cache",
    scores: s(4, 5, 4, 2, 5, 4, 3, 5, 3),
    bestFor: ["Static assets", "Public, cacheable responses"],
    avoidWhen: ["Per-user dynamic data"],
    chooseWhen: "Content is static and globally requested.",
    tradeoffs: ["Offloads origin and cuts latency.", "Invalidation can be tricky."],
  },
  {
    id: "in-memory",
    name: "In-memory cache",
    category: "cache",
    scores: s(5, 2, 5, 2, 5, 5, 5, 5, 3),
    bestFor: ["Single-instance hot data"],
    avoidWhen: ["Multiple instances needing shared state"],
    chooseWhen: "One process and a small, hot dataset.",
    tradeoffs: ["Zero infra.", "Not shared across instances; lost on restart."],
  },

  // ---- Queue ----
  {
    id: "sqs",
    name: "SQS",
    category: "queue",
    scores: s(5, 5, 4, 3, 5, 4, 2, 4, 4),
    bestFor: ["Reliable background jobs", "Smoothing spikes"],
    avoidWhen: ["Replayable event streams", "Complex routing"],
    chooseWhen: "You need simple, reliable async tasks.",
    tradeoffs: ["Managed and simple.", "Less streaming power than a log."],
  },
  {
    id: "rabbitmq",
    name: "RabbitMQ",
    category: "queue",
    scores: s(3, 4, 4, 3, 2, 3, 4, 4, 3),
    bestFor: ["Complex routing", "Flexible delivery semantics"],
    avoidWhen: ["You want zero ops"],
    chooseWhen: "You need rich routing patterns.",
    tradeoffs: ["Powerful routing.", "Operational overhead to run well."],
  },
  {
    id: "kafka",
    name: "Kafka",
    category: "queue",
    scores: s(2, 5, 3, 4, 2, 3, 4, 4, 4),
    bestFor: ["Replayable event logs", "Multiple consumers", "Event sourcing"],
    avoidWhen: ["Simple background jobs", "Small teams"],
    chooseWhen: "Events are part of your source of truth.",
    tradeoffs: ["Durable, replayable streams.", "Heavy complexity - not for boredom."],
  },

  // ---- Compute ----
  {
    id: "serverless",
    name: "Serverless functions",
    category: "compute",
    scores: s(5, 5, 4, 3, 5, 4, 2, 3, 4),
    bestFor: ["Spiky/low traffic", "Event-driven glue"],
    avoidWhen: ["Long-running jobs", "Sustained high throughput"],
    chooseWhen: "Traffic is spiky and you want to avoid managing servers.",
    tradeoffs: ["Scales to zero, low ops.", "Cold starts and runtime limits."],
  },
  {
    id: "containers",
    name: "Container service",
    category: "compute",
    scores: s(3, 5, 3, 4, 3, 4, 4, 5, 4),
    bestFor: ["Long-running services", "Predictable load"],
    avoidWhen: ["Tiny side projects wanting zero ops"],
    chooseWhen: "You need control and steady throughput.",
    tradeoffs: ["Portable and flexible.", "You own scaling and orchestration."],
  },
  {
    id: "vm",
    name: "Virtual machines",
    category: "compute",
    scores: s(3, 3, 3, 4, 2, 4, 5, 5, 4),
    bestFor: ["Legacy or specialized workloads", "Full control"],
    avoidWhen: ["You want managed scaling"],
    chooseWhen: "You need full control of the host.",
    tradeoffs: ["Maximum control, no lock-in.", "Most operational overhead."],
  },

  // ---- API style ----
  {
    id: "rest",
    name: "REST",
    category: "api",
    scores: s(5, 4, 4, 4, 5, 5, 5, 4, 4),
    bestFor: ["CRUD APIs", "Broad client compatibility", "Caching"],
    avoidWhen: ["Highly nested, client-specified queries"],
    chooseWhen: "A conventional, widely understood API fits.",
    tradeoffs: ["Simple and cache-friendly.", "Over/under-fetching on complex reads."],
  },
  {
    id: "graphql",
    name: "GraphQL",
    category: "api",
    scores: s(3, 4, 3, 4, 3, 3, 4, 4, 4),
    bestFor: ["Client-driven queries", "Many related resources"],
    avoidWhen: ["Simple CRUD", "Heavy edge caching needs"],
    chooseWhen: "Clients need flexible, shaped responses.",
    tradeoffs: ["Flexible fetching.", "Caching and complexity costs on the server."],
  },
  {
    id: "grpc",
    name: "gRPC",
    category: "api",
    scores: s(3, 5, 4, 4, 3, 3, 4, 5, 4),
    bestFor: ["Service-to-service", "Low-latency, high-throughput"],
    avoidWhen: ["Public browser-facing APIs"],
    chooseWhen: "Internal services need fast, typed contracts.",
    tradeoffs: ["Fast and strongly typed.", "Less browser-friendly tooling."],
  },

  // ---- Object storage ----
  {
    id: "s3",
    name: "Amazon S3",
    category: "objectStorage",
    nodeType: "object_storage",
    scores: s(4, 5, 5, 4, 4, 4, 3, 4, 4),
    bestFor: ["Large files", "Cheap durable storage at scale"],
    avoidWhen: ["Tiny transactional records"],
    chooseWhen: "You are on AWS or need the default object-store baseline.",
    tradeoffs: [
      "Cheap, scalable, durable, and deeply integrated with AWS.",
      "Needs metadata in the DB and signed-URL access control.",
    ],
  },
  {
    id: "gcs",
    name: "Google Cloud Storage",
    category: "objectStorage",
    nodeType: "object_storage",
    scores: s(4, 5, 5, 4, 4, 4, 3, 4, 4),
    bestFor: ["Large files", "GCP workloads", "Data lake inputs"],
    avoidWhen: ["AWS-first stacks", "Azure-first enterprise stacks"],
    chooseWhen: "The rest of your platform is already on Google Cloud.",
    tradeoffs: [
      "Strong managed object storage with GCP integration.",
      "Cloud-platform lock-in still applies.",
    ],
  },
  {
    id: "azure-blob",
    name: "Azure Blob Storage",
    category: "objectStorage",
    nodeType: "object_storage",
    scores: s(4, 5, 4, 4, 4, 3, 2, 4, 5),
    bestFor: ["Enterprise files", "Azure workloads", "Compliance-heavy storage"],
    avoidWhen: ["Avoiding Azure lock-in"],
    chooseWhen: "You are already on Azure or need its enterprise controls.",
    tradeoffs: ["Good enterprise integration.", "Less portable across clouds."],
  },
  {
    id: "cloudflare-r2",
    name: "Cloudflare R2",
    category: "objectStorage",
    nodeType: "object_storage",
    scores: s(4, 4, 5, 4, 4, 3, 3, 5, 3),
    bestFor: ["Public assets", "Egress-sensitive workloads", "Edge-adjacent files"],
    avoidWhen: ["Deep AWS/GCP/Azure native integrations are required"],
    chooseWhen: "Egress cost and edge delivery matter more than cloud-native hooks.",
    tradeoffs: ["Low egress cost.", "Smaller ecosystem than the major cloud stores."],
  },

  // ---- Search ----
  {
    id: "pg-fts",
    name: "Postgres full-text",
    category: "search",
    scores: s(5, 3, 5, 4, 5, 5, 4, 4, 4),
    bestFor: ["Simple search", "Staying in one datastore"],
    avoidWhen: ["Relevance tuning at scale", "Huge corpora"],
    chooseWhen: "Search needs are modest.",
    tradeoffs: ["No new infra.", "Limited relevance and scale."],
  },
  {
    id: "elasticsearch",
    name: "Elasticsearch",
    category: "search",
    scores: s(2, 5, 3, 3, 2, 3, 4, 5, 4),
    bestFor: ["Rich relevance", "Faceting", "Large-scale search"],
    avoidWhen: ["Small apps wanting low ops"],
    chooseWhen: "Search is a core, large-scale feature.",
    tradeoffs: ["Powerful search.", "A second store to operate and sync."],
  },

  // ---- Auth ----
  {
    id: "managed-auth",
    name: "Auth0",
    category: "auth",
    scores: s(5, 4, 3, 4, 5, 4, 2, 4, 5),
    bestFor: ["Fast, secure auth", "SSO/MFA out of the box"],
    avoidWhen: ["Strict no-lock-in or unusual flows"],
    chooseWhen: "You want secure auth without owning the risk.",
    tradeoffs: ["Secure and fast to adopt.", "Cost and vendor lock-in."],
  },
  {
    id: "custom-auth",
    name: "Custom auth",
    category: "auth",
    scores: s(2, 4, 4, 4, 2, 3, 5, 4, 3),
    bestFor: ["Unusual requirements", "Full control"],
    avoidWhen: ["Most teams - auth is easy to get wrong"],
    chooseWhen: "Requirements truly cannot be met by managed auth.",
    tradeoffs: ["Total control.", "You own all the security risk."],
  },

  // ---- Vector store ----
  {
    id: "pgvector",
    name: "pgvector",
    category: "vectorStore",
    scores: s(5, 3, 5, 4, 4, 4, 4, 4, 4),
    bestFor: ["RAG alongside existing Postgres", "Moderate scale"],
    avoidWhen: ["Billions of vectors", "Specialized ANN tuning"],
    chooseWhen: "You already run Postgres and want vectors close by.",
    tradeoffs: ["One less system.", "Less specialized than dedicated stores."],
  },
  {
    id: "pinecone",
    name: "Pinecone",
    category: "vectorStore",
    scores: s(4, 5, 2, 4, 5, 3, 1, 5, 4),
    bestFor: ["Large-scale managed vector search"],
    avoidWhen: ["Cost sensitivity", "Avoiding lock-in"],
    chooseWhen: "You need managed scale and low ops.",
    tradeoffs: ["Scales easily, low ops.", "Cost and vendor lock-in."],
  },
  {
    id: "qdrant",
    name: "Qdrant",
    category: "vectorStore",
    scores: s(3, 5, 4, 4, 3, 3, 5, 5, 4),
    bestFor: ["Self-hosted vector search", "Filtering + ANN control"],
    avoidWhen: ["Teams wanting zero ops"],
    chooseWhen: "You want control and to avoid lock-in.",
    tradeoffs: ["Open-source, flexible.", "You operate it."],
  },

  // ---- Observability ----
  {
    id: "datadog",
    name: "Datadog",
    category: "observability",
    scores: s(5, 5, 2, 4, 5, 4, 2, 4, 4),
    bestFor: ["Fast setup", "Unified metrics/logs/traces"],
    avoidWhen: ["Tight budgets at high log volume"],
    chooseWhen: "You want full observability without running it.",
    tradeoffs: ["Turnkey and powerful.", "Cost grows fast with volume."],
  },
  {
    id: "grafana-stack",
    name: "Grafana + Prometheus + Loki",
    category: "observability",
    scores: s(3, 5, 5, 4, 3, 4, 5, 4, 4),
    bestFor: ["Cost control", "Open-source flexibility"],
    avoidWhen: ["Teams wanting zero ops"],
    chooseWhen: "You want control and lower cost.",
    tradeoffs: ["Open-source, cheap.", "You run and tune the stack."],
  },
  {
    id: "sentry",
    name: "Sentry",
    category: "observability",
    scores: s(5, 4, 4, 4, 5, 4, 3, 4, 3),
    bestFor: ["Error and performance monitoring", "Frontend + backend tracing"],
    avoidWhen: ["You need full infra metrics and logs in one tool"],
    chooseWhen: "Catching and triaging application errors is the priority.",
    tradeoffs: ["Excellent error tracking with rich context.", "Not a full metrics/logs platform."],
  },

  // ---- Additional popular options ----
  {
    id: "cockroachdb",
    name: "CockroachDB",
    category: "sqlDatabase",
    nodeType: "sql_database",
    scores: s(3, 5, 3, 5, 3, 3, 4, 4, 4),
    bestFor: ["Global, horizontally scaled SQL", "Strong consistency at scale"],
    avoidWhen: ["Small single-region apps where Postgres is simpler"],
    chooseWhen: "You need Postgres-compatible SQL that scales writes across regions.",
    tradeoffs: ["Distributed SQL with strong consistency.", "More ops and cost than a single Postgres."],
  },
  {
    id: "supabase",
    name: "Supabase",
    category: "sqlDatabase",
    nodeType: "sql_database",
    scores: s(5, 3, 4, 5, 5, 4, 3, 4, 3),
    bestFor: ["Fast Postgres-backed MVPs", "Auth, storage, and APIs in one"],
    avoidWhen: ["You need fine-grained control over the database host"],
    chooseWhen: "You want managed Postgres with batteries included and to move fast.",
    tradeoffs: ["Postgres plus auth/storage/realtime out of the box.", "Some platform lock-in."],
  },
  {
    id: "cassandra",
    name: "Cassandra",
    category: "noSqlDatabase",
    nodeType: "nosql_database",
    scores: s(2, 5, 4, 3, 2, 3, 5, 4, 4),
    bestFor: ["Write-heavy, always-on workloads", "Multi-region, linear scale"],
    avoidWhen: ["Ad-hoc queries", "Small datasets"],
    chooseWhen: "You need massive write throughput and high availability.",
    tradeoffs: ["Scales writes linearly with no single point of failure.", "Operationally heavy; model around queries."],
  },
  {
    id: "nats",
    name: "NATS",
    category: "queue",
    scores: s(4, 5, 5, 3, 4, 3, 5, 5, 3),
    bestFor: ["Low-latency messaging", "Lightweight pub/sub and request-reply"],
    avoidWhen: ["You need a managed queue with zero ops"],
    chooseWhen: "You want a fast, lightweight messaging backbone you run yourself.",
    tradeoffs: ["Tiny, fast, and simple to operate.", "Fewer turnkey integrations than SQS/Kafka."],
  },
  {
    id: "trpc",
    name: "tRPC",
    category: "api",
    scores: s(5, 3, 5, 4, 5, 3, 4, 4, 3),
    bestFor: ["TypeScript monorepos", "End-to-end type safety without codegen"],
    avoidWhen: ["Public APIs", "Non-TypeScript or polyglot clients"],
    chooseWhen: "A single TypeScript team owns both client and server.",
    tradeoffs: ["Type-safe client/server with no schema layer.", "TypeScript-only and not for public APIs."],
  },
  {
    id: "algolia",
    name: "Algolia",
    category: "search",
    scores: s(5, 4, 2, 4, 5, 4, 2, 5, 3),
    bestFor: ["Instant search-as-you-type", "Hosted, low-ops search"],
    avoidWhen: ["Tight budgets at high query volume", "Avoiding vendor lock-in"],
    chooseWhen: "You want great search UX fast without running a cluster.",
    tradeoffs: ["Turnkey, fast, great relevance tooling.", "Costly at scale and proprietary."],
  },
  {
    id: "meilisearch",
    name: "Meilisearch",
    category: "search",
    scores: s(5, 3, 5, 4, 4, 3, 5, 5, 3),
    bestFor: ["Typo-tolerant search on a budget", "Self-hosted or small managed"],
    avoidWhen: ["Petabyte-scale analytics-style search"],
    chooseWhen: "You want fast, simple full-text search you can self-host cheaply.",
    tradeoffs: ["Easy to run with great defaults.", "Less mature for very large or complex workloads."],
  },
  {
    id: "milvus",
    name: "Milvus",
    category: "vectorStore",
    scores: s(3, 5, 4, 3, 3, 3, 5, 4, 3),
    bestFor: ["Billion-scale vector search", "Self-hosted vector workloads"],
    avoidWhen: ["Small datasets where pgvector is enough"],
    chooseWhen: "Vector volume is large enough to need a dedicated, scalable store.",
    tradeoffs: ["Purpose-built and scales hard.", "Another system to run versus pgvector."],
  },
  {
    id: "clerk",
    name: "Clerk",
    category: "auth",
    scores: s(5, 4, 3, 4, 5, 3, 2, 4, 4),
    bestFor: ["Drop-in auth UIs", "Fast launch with prebuilt components"],
    avoidWhen: ["You need full control or want no auth vendor"],
    chooseWhen: "You want polished auth and user management with minimal work.",
    tradeoffs: ["Beautiful prebuilt flows and fast setup.", "Pricing and lock-in grow with users."],
  },
  {
    id: "keycloak",
    name: "Keycloak",
    category: "auth",
    scores: s(2, 4, 5, 4, 2, 3, 5, 4, 5),
    bestFor: ["Self-hosted SSO/OIDC", "Enterprise identity, no per-user fees"],
    avoidWhen: ["Small teams wanting zero ops"],
    chooseWhen: "You need open-source identity you control, often for compliance.",
    tradeoffs: ["Full-featured and free to run.", "You operate and upgrade it yourself."],
  },
];

export function optionsForCategory(category: DecisionCategory) {
  return TECHNOLOGY_OPTIONS.filter((o) => o.category === category);
}

export function optionById(id: string) {
  return TECHNOLOGY_OPTIONS.find((o) => o.id === id);
}

export const CATEGORY_LABELS: Record<DecisionCategory, string> = {
  frontend: "Frontend",
  database: "Database",
  sqlDatabase: "SQL database",
  noSqlDatabase: "NoSQL database",
  cache: "Cache",
  queue: "Async / Queue",
  compute: "Compute",
  api: "API style",
  storage: "File storage",
  objectStorage: "Object storage",
  search: "Search",
  auth: "Authentication",
  vectorStore: "Vector store",
  observability: "Observability",
};

/** Blunt rule-of-thumb guidance per category. */
export const RULES_OF_THUMB: Record<
  DecisionCategory,
  { use: string[]; avoid: string[] }
> = {
  frontend: {
    use: [
      "Use SSR/ISR (Next.js, Nuxt) when SEO and fast first paint matter.",
      "Use SSG (Astro) for content-heavy, read-mostly pages.",
      "A plain SPA is fine behind a login where SEO does not matter.",
    ],
    avoid: ["Don't pay for server rendering on a site that is purely static."],
  },
  database: {
    use: [
      "Use Postgres when data has relationships, needs transactions, or you are unsure.",
      "Use DynamoDB when you know your access patterns and need huge scale.",
    ],
    avoid: ["Don't reach for NoSQL just to dodge schema discipline."],
  },
  sqlDatabase: {
    use: [
      "Use SQL when data has relationships, transactions, reporting, or audit requirements.",
      "Postgres is the safest default unless your team or platform has a strong MySQL reason.",
    ],
    avoid: ["Avoid SQL only when the access patterns are simple, massive, and known upfront."],
  },
  noSqlDatabase: {
    use: [
      "Use NoSQL for document/key-value shapes with known access patterns and high scale needs.",
      "DynamoDB fits predictable access patterns; MongoDB fits document-shaped data.",
    ],
    avoid: ["Don't use NoSQL for heavily relational workflows that need joins and transactions."],
  },
  cache: {
    use: [
      "Cache when reads are frequent, repeated, and the source is slow.",
      "Slight staleness must be acceptable.",
    ],
    avoid: [
      "Avoid caching when correctness beats speed.",
      "Don't cache without an invalidation strategy.",
      "Don't add a cache before the system is actually slow.",
    ],
  },
  queue: {
    use: [
      "Use a queue when work can happen after the request and needs retries.",
      "Use a log (Kafka) when events are replayable and shared by many consumers.",
    ],
    avoid: ["Don't use Kafka because you are bored."],
  },
  compute: {
    use: [
      "Serverless for spiky, event-driven, low-baseline workloads.",
      "Containers for long-running services with steady load.",
    ],
    avoid: ["Avoid serverless for long-running or latency-sensitive jobs."],
  },
  api: {
    use: [
      "REST for conventional CRUD and broad compatibility.",
      "gRPC for internal, low-latency service-to-service calls.",
    ],
    avoid: ["Avoid GraphQL for simple CRUD where it just adds complexity."],
  },
  storage: {
    use: ["Store large files in object storage; keep metadata + ACLs in the DB."],
    avoid: ["Don't store large files as database blobs."],
  },
  objectStorage: {
    use: [
      "Use S3/GCS/Azure Blob/R2 for files, media, documents, backups, and generated artifacts.",
      "Keep metadata, ownership, and access rules in the database.",
    ],
    avoid: ["Don't put large files in SQL/NoSQL records unless they are tiny and truly transactional."],
  },
  search: {
    use: [
      "Postgres full-text for modest search needs.",
      "Elasticsearch/OpenSearch when search is a core, large-scale feature.",
    ],
    avoid: ["Don't run a search cluster you don't need yet."],
  },
  auth: {
    use: ["Prefer managed auth - most teams should not build their own."],
    avoid: ["Avoid custom auth unless requirements truly demand it."],
  },
  vectorStore: {
    use: [
      "pgvector when you already run Postgres and scale is moderate.",
      "Dedicated vector DBs when you need large-scale ANN.",
    ],
    avoid: ["Don't add a vector DB before you have a retrieval use case."],
  },
  observability: {
    use: ["Instrument metrics, logs, and traces; alert on SLOs."],
    avoid: ["Don't alert on every blip - tune for signal."],
  },
};
