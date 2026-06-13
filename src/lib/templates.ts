import type { NewProjectInput } from "./store";
import { generateSkeleton } from "./skeleton";
import { defaultNodeData } from "./catalog";
import { createId } from "./id";
import {
  emptyBrief,
  type ArchitectureBrief,
  type ArchitectureFlowNode,
  type ArchitectureFlowEdge,
  type ArchitectureNodeType,
} from "./types";

export type TemplateGroup = "Pattern" | "Use case";

export type Template = {
  id: string;
  name: string;
  summary: string;
  group: TemplateGroup;
  build: () => NewProjectInput;
};

/** A node placed explicitly on the canvas. */
type NodeSpec = {
  key: string;
  type: ArchitectureNodeType;
  x: number;
  y: number;
  name?: string;
  technology?: string;
};
/** [fromKey, toKey, description?] */
type EdgeSpec = [string, string, string?];

/** Hand-compose a precise reference architecture from explicit nodes/edges. */
function compose(
  name: string,
  description: string,
  brief: Partial<ArchitectureBrief>,
  nodeSpecs: NodeSpec[],
  edgeSpecs: EdgeSpec[]
): NewProjectInput {
  const idByKey = new Map<string, string>();
  const nodes: ArchitectureFlowNode[] = nodeSpecs.map((n) => {
    const id = createId("node");
    idByKey.set(n.key, id);
    const data = defaultNodeData(n.type);
    return {
      id,
      type: "component",
      position: { x: n.x, y: n.y },
      data: {
        ...data,
        ...(n.name ? { name: n.name } : {}),
        ...(n.technology ? { technology: n.technology } : {}),
      },
    };
  });
  const edges: ArchitectureFlowEdge[] = edgeSpecs
    .map(([from, to, desc]): ArchitectureFlowEdge | null => {
      const source = idByKey.get(from);
      const target = idByKey.get(to);
      if (!source || !target) return null;
      return {
        id: createId("edge"),
        source,
        target,
        type: "default",
        ...(desc ? { data: { description: desc } } : {}),
      };
    })
    .filter((e): e is ArchitectureFlowEdge => e !== null);

  return { name, description, brief: { ...emptyBrief(), ...brief }, nodes, edges };
}

/** Generate a use-case template from a tailored brief via the skeleton engine. */
function fromBrief(
  name: string,
  description: string,
  brief: Partial<ArchitectureBrief>
): NewProjectInput {
  const full: ArchitectureBrief = { ...emptyBrief(), ...brief };
  const { nodes, edges } = generateSkeleton(full);
  return { name, description, brief: full, nodes, edges };
}

const COL = 260;

/** Canonical, industry-standard architecture patterns. */
const PATTERNS: Template[] = [
  {
    id: "three-tier",
    name: "Three-tier web app",
    summary:
      "The classic baseline: client → load balancer → app servers → database, with a cache.",
    group: "Pattern",
    build: () =>
      compose(
        "Three-tier web app",
        "The standard three-tier architecture used by most web applications.",
        {
          productGoal: "A standard three-tier web application",
          users: "External web users",
          availability: "standard",
        },
        [
          { key: "web", type: "web_app", x: 0, y: 0 },
          { key: "lb", type: "api_gateway", x: COL, y: 0, name: "Load Balancer" },
          { key: "api", type: "api_service", x: COL * 2, y: 0 },
          { key: "db", type: "sql_database", x: COL * 3, y: 0 },
          { key: "cache", type: "cache", x: COL * 2, y: 150 },
          { key: "mon", type: "monitoring", x: COL * 3, y: 150 },
        ],
        [
          ["web", "lb", "HTTPS"],
          ["lb", "api"],
          ["api", "db", "read/write"],
          ["api", "cache", "cache-aside"],
          ["api", "mon", "metrics/logs"],
        ]
      ),
  },
  {
    id: "microservices",
    name: "Microservices",
    summary:
      "API gateway fronting independent services, each owning its database, with async events.",
    group: "Pattern",
    build: () =>
      compose(
        "Microservices",
        "An API gateway routing to independent services, each owning its own data.",
        {
          productGoal: "A microservices platform with independent services",
          users: "External customers",
          availability: "high",
          trafficAssumptions: "High traffic across multiple domains",
        },
        [
          { key: "web", type: "web_app", x: 0, y: 60 },
          { key: "gw", type: "api_gateway", x: COL, y: 60 },
          { key: "auth", type: "auth_provider", x: COL, y: 220 },
          { key: "orders", type: "api_service", x: COL * 2, y: -80, name: "Order Service" },
          { key: "payments", type: "api_service", x: COL * 2, y: 80, name: "Payment Service" },
          { key: "users", type: "api_service", x: COL * 2, y: 240, name: "User Service" },
          { key: "ordersDb", type: "sql_database", x: COL * 3, y: -80, name: "Orders DB" },
          { key: "paymentsDb", type: "sql_database", x: COL * 3, y: 80, name: "Payments DB" },
          { key: "usersDb", type: "sql_database", x: COL * 3, y: 240, name: "Users DB" },
          { key: "queue", type: "queue", x: COL * 2, y: 400, name: "Event Bus" },
          { key: "mon", type: "monitoring", x: COL, y: 400 },
        ],
        [
          ["web", "gw"],
          ["gw", "auth", "verify"],
          ["gw", "orders"],
          ["gw", "payments"],
          ["gw", "users"],
          ["orders", "ordersDb"],
          ["payments", "paymentsDb"],
          ["users", "usersDb"],
          ["orders", "queue", "events"],
          ["payments", "queue", "events"],
          ["gw", "mon"],
        ]
      ),
  },
  {
    id: "event-driven",
    name: "Event-driven processing",
    summary:
      "Async pipeline: API publishes jobs to a queue, workers process them, with a dead-letter queue.",
    group: "Pattern",
    build: () =>
      compose(
        "Event-driven processing",
        "An asynchronous processing pipeline with a queue, worker, and dead-letter queue.",
        {
          productGoal: "A system with heavy asynchronous background processing",
          users: "External customers",
          coreFlows: ["Submit work", "Process work asynchronously"],
          availability: "standard",
        },
        [
          { key: "web", type: "web_app", x: 0, y: 0 },
          { key: "api", type: "api_service", x: COL, y: 0 },
          { key: "db", type: "sql_database", x: COL * 2, y: 0 },
          { key: "queue", type: "queue", x: COL, y: 160 },
          { key: "worker", type: "worker", x: COL * 2, y: 160 },
          { key: "store", type: "object_storage", x: COL * 3, y: 160 },
          { key: "dlq", type: "dead_letter_queue", x: COL * 2, y: 320 },
          { key: "mon", type: "monitoring", x: 0, y: 160 },
        ],
        [
          ["web", "api"],
          ["api", "db", "metadata"],
          ["api", "queue", "publish job"],
          ["queue", "worker", "consume"],
          ["worker", "store", "write result"],
          ["worker", "db", "update status"],
          ["queue", "dlq", "failed jobs"],
          ["api", "mon"],
        ]
      ),
  },
  {
    id: "serverless",
    name: "Serverless web app",
    summary:
      "CDN + API gateway + serverless functions + managed NoSQL - scales to zero, low ops.",
    group: "Pattern",
    build: () =>
      compose(
        "Serverless web app",
        "A serverless architecture with functions, managed NoSQL, and a CDN.",
        {
          productGoal: "A serverless web application with spiky traffic",
          users: "External customers",
          trafficAssumptions: "Spiky, unpredictable traffic",
          availability: "standard",
        },
        [
          { key: "web", type: "web_app", x: 0, y: 0 },
          { key: "cdn", type: "cdn", x: COL, y: -60 },
          { key: "gw", type: "api_gateway", x: COL * 2, y: 0 },
          {
            key: "fn",
            type: "api_service",
            x: COL * 3,
            y: 0,
            name: "Functions",
            technology: "Serverless functions",
          },
          {
            key: "db",
            type: "nosql_database",
            x: COL * 4,
            y: 0,
            technology: "DynamoDB",
          },
          {
            key: "auth",
            type: "auth_provider",
            x: COL * 2,
            y: 160,
            technology: "Managed auth (Cognito)",
          },
          { key: "store", type: "object_storage", x: COL * 3, y: 160 },
        ],
        [
          ["web", "cdn", "static assets"],
          ["cdn", "gw"],
          ["web", "gw", "API calls"],
          ["gw", "fn"],
          ["fn", "db"],
          ["gw", "auth", "verify"],
          ["fn", "store"],
        ]
      ),
  },
  {
    id: "read-heavy",
    name: "Read-heavy + caching",
    summary:
      "CDN, cache, and read replicas in front of a primary database for read-dominant workloads.",
    group: "Pattern",
    build: () =>
      compose(
        "Read-heavy + caching",
        "A read-optimized architecture with a CDN, cache, and read replicas.",
        {
          productGoal: "A read-heavy application (feeds, catalogs, content)",
          users: "External consumers",
          trafficAssumptions: "Read-dominant, high traffic, millions of views",
          availability: "high",
        },
        [
          { key: "web", type: "web_app", x: 0, y: 0 },
          { key: "cdn", type: "cdn", x: COL, y: -60 },
          { key: "gw", type: "api_gateway", x: COL * 2, y: 0 },
          { key: "api", type: "api_service", x: COL * 3, y: 0 },
          { key: "cache", type: "cache", x: COL * 3, y: 160 },
          { key: "db", type: "sql_database", x: COL * 4, y: 0, name: "Primary DB" },
          { key: "replica", type: "read_replica", x: COL * 4, y: 160 },
          { key: "backup", type: "backup", x: COL * 4, y: 320 },
          { key: "mon", type: "monitoring", x: COL * 2, y: 160 },
        ],
        [
          ["web", "cdn", "static"],
          ["cdn", "gw"],
          ["gw", "api"],
          ["api", "cache", "hot reads"],
          ["api", "db", "writes"],
          ["api", "replica", "reads"],
          ["db", "replica", "replication"],
          ["db", "backup", "snapshots"],
          ["gw", "mon"],
        ]
      ),
  },
  {
    id: "public-api",
    name: "Rate-limited public API",
    summary:
      "Gateway with auth, rate limiting, cache, and audit logging - a hardened public API platform.",
    group: "Pattern",
    build: () =>
      compose(
        "Rate-limited public API",
        "A hardened public API platform with auth, rate limiting, and audit logging.",
        {
          productGoal: "A public API platform consumed by external developers",
          users: "External partner API consumers",
          dataSensitivity: "high",
          availability: "high",
          compliance: ["Audit logs"],
        },
        [
          { key: "client", type: "web_app", x: 0, y: 60, name: "API Clients" },
          { key: "gw", type: "api_gateway", x: COL, y: 60 },
          { key: "rl", type: "rate_limiter", x: COL, y: 220 },
          { key: "auth", type: "auth_provider", x: COL, y: -100 },
          { key: "api", type: "api_service", x: COL * 2, y: 60 },
          { key: "db", type: "sql_database", x: COL * 3, y: 60 },
          { key: "cache", type: "cache", x: COL * 3, y: 220 },
          { key: "audit", type: "audit_log", x: COL * 2, y: 220 },
          { key: "mon", type: "monitoring", x: COL * 2, y: -100 },
        ],
        [
          ["client", "gw", "HTTPS"],
          ["gw", "rl", "throttle"],
          ["gw", "auth", "API keys / OAuth"],
          ["gw", "api"],
          ["api", "db"],
          ["api", "cache"],
          ["api", "audit", "log access"],
          ["gw", "mon"],
        ]
      ),
  },
];

/** Product-flavored use-case templates generated from briefs. */
const USE_CASES: Template[] = [
  {
    id: "saas",
    name: "SaaS web app",
    summary: "Multi-tenant web product with accounts, API, and a relational DB.",
    group: "Use case",
    build: () =>
      fromBrief(
        "SaaS web app",
        "A multi-tenant customer-facing SaaS application.",
        {
          productGoal: "A multi-tenant SaaS web application for external customers",
          users: "External customers, admins",
          coreFlows: ["Sign up and log in", "Create and manage resources", "View dashboards"],
          trafficAssumptions: "Thousands of daily active users",
          dataSensitivity: "medium",
          availability: "standard",
          integrations: ["Stripe", "SendGrid"],
        }
      ),
  },
  {
    id: "doc-processing",
    name: "Document processing",
    summary:
      "Upload, store, and asynchronously process documents with audit logging.",
    group: "Use case",
    build: () =>
      fromBrief(
        "Document processing platform",
        "Customer-facing document upload and review platform.",
        {
          productGoal:
            "A customer-facing document upload and review platform with async processing",
          users: "External customers, internal reviewers, admins",
          coreFlows: [
            "Customer uploads a document",
            "System validates and extracts data",
            "Reviewer approves or rejects",
          ],
          trafficAssumptions: "Steady upload volume with spikes",
          dataSensitivity: "high",
          availability: "high",
          integrations: ["S3", "Textract"],
          compliance: ["SOC 2", "Audit logs"],
        }
      ),
  },
  {
    id: "realtime-chat",
    name: "Real-time chat",
    summary: "Live messaging with presence, a cache for hot state, and async fanout.",
    group: "Use case",
    build: () =>
      fromBrief("Real-time chat app", "A live chat and presence application.", {
        productGoal: "A real-time chat application with live presence and tracking",
        users: "External consumers",
        coreFlows: [
          "Send and receive messages in real-time",
          "See presence and typing indicators",
          "Receive push notifications",
        ],
        trafficAssumptions: "High concurrent live connections, peak spikes",
        dataSensitivity: "medium",
        availability: "high",
        integrations: ["Twilio", "APNs/FCM"],
      }),
  },
  {
    id: "ecommerce",
    name: "E-commerce",
    summary: "Storefront with payments, search, and order processing.",
    group: "Use case",
    build: () =>
      fromBrief("E-commerce platform", "An online storefront and checkout.", {
        productGoal: "An e-commerce marketplace with checkout and order processing",
        users: "External shoppers, sellers, admins",
        coreFlows: [
          "Browse and search the catalog",
          "Add to cart and checkout (payment)",
          "Process and fulfill orders",
        ],
        trafficAssumptions: "High traffic with seasonal peaks, millions of views",
        dataSensitivity: "high",
        availability: "high",
        integrations: ["Stripe", "Algolia"],
        compliance: ["PCI"],
      }),
  },
  {
    id: "ai-rag",
    name: "AI / RAG app",
    summary: "Retrieval-augmented AI app with a vector store and document ingestion.",
    group: "Use case",
    build: () =>
      fromBrief("AI / RAG application", "A retrieval-augmented AI assistant.", {
        productGoal:
          "An AI assistant using RAG over uploaded documents with semantic search",
        users: "External customers",
        coreFlows: [
          "Upload documents for ingestion",
          "Ask questions answered via RAG",
          "Embed and index content",
        ],
        trafficAssumptions: "Moderate, bursty usage",
        dataSensitivity: "medium",
        availability: "standard",
        integrations: ["OpenAI", "S3"],
      }),
  },
];

export const TEMPLATES: Template[] = [...PATTERNS, ...USE_CASES];

export const TEMPLATE_GROUPS: TemplateGroup[] = ["Pattern", "Use case"];
