import { describe, it, expect } from "vitest";
import { emptyBrief } from "../types";
import type {
  ArchitectureBrief,
  ArchitectureFlowNode,
  ArchitectureNodeType,
} from "../types";
import { generateSkeleton } from "../skeleton";
import { lintArchitecture } from "../linter";
import { recommend } from "../decisionRules";
import { defaultNodeData } from "../catalog";
import { optionsForCategory } from "../tradeoffs";
import { getTechLogo } from "../techLogos";

function brief(over: Partial<ArchitectureBrief> = {}): ArchitectureBrief {
  return { ...emptyBrief(), ...over };
}

function node(type: ArchitectureNodeType): ArchitectureFlowNode {
  return {
    id: type,
    type: "component",
    position: { x: 0, y: 0 },
    data: defaultNodeData(type),
  };
}

function typeSet(nodes: ArchitectureFlowNode[]): Set<ArchitectureNodeType> {
  return new Set(nodes.map((n) => n.data.architectureType));
}

describe("generateSkeleton", () => {
  it("adds the object-storage + queue pipeline when the brief implies file uploads", () => {
    const { nodes } = generateSkeleton(
      brief({ coreFlows: ["A user can upload a document"] })
    );
    const t = typeSet(nodes);
    expect(t.has("object_storage")).toBe(true);
    expect(t.has("queue")).toBe(true);
    expect(t.has("worker")).toBe(true);
    expect(t.has("dead_letter_queue")).toBe(true);
  });

  it("adds a gateway + rate limiter for public / external users", () => {
    const { nodes } = generateSkeleton(
      brief({ users: "public customers on the open internet" })
    );
    const t = typeSet(nodes);
    expect(t.has("api_gateway")).toBe(true);
    expect(t.has("rate_limiter")).toBe(true);
  });

  it("adds an audit log for highly sensitive data", () => {
    const { nodes } = generateSkeleton(brief({ dataSensitivity: "high" }));
    expect(typeSet(nodes).has("audit_log")).toBe(true);
  });

  it("produces the same component set for the same brief (deterministic shape)", () => {
    const b = brief({ coreFlows: ["upload"], dataSensitivity: "high" });
    const a = [...typeSet(generateSkeleton(b).nodes)].sort();
    const c = [...typeSet(generateSkeleton(b).nodes)].sort();
    expect(a).toEqual(c);
  });

  it("always includes the platform foundation (cloud, hosting, CI/CD)", () => {
    const t = typeSet(generateSkeleton(brief()).nodes);
    expect(t.has("cloud_platform")).toBe(true);
    expect(t.has("hosting")).toBe(true);
    expect(t.has("ci_cd")).toBe(true);
  });
});

describe("lintArchitecture", () => {
  it("flags a public API with no rate limiter", () => {
    const findings = lintArchitecture({
      brief: brief({ users: "external customers" }),
      nodes: [node("api_gateway"), node("api_service")],
    });
    expect(findings.map((f) => f.id)).toContain("public-api-no-rate-limiter");
  });

  it("flags a queue with no dead-letter queue", () => {
    const findings = lintArchitecture({
      brief: brief(),
      nodes: [node("queue"), node("worker")],
    });
    expect(findings.map((f) => f.id)).toContain("queue-no-dlq");
  });

  it("does not flag the DLQ rule once a dead-letter queue is present", () => {
    const findings = lintArchitecture({
      brief: brief(),
      nodes: [node("queue"), node("worker"), node("dead_letter_queue")],
    });
    expect(findings.map((f) => f.id)).not.toContain("queue-no-dlq");
  });

  it("raises a critical audit-log finding for sensitive data", () => {
    const findings = lintArchitecture({
      brief: brief({ dataSensitivity: "high" }),
      nodes: [node("sql_database")],
    });
    const audit = findings.find((f) => f.id === "sensitive-no-audit-log");
    expect(audit?.severity).toBe("critical");
  });

  it("flags a missing CI/CD pipeline and hosting target", () => {
    const ids = lintArchitecture({
      brief: brief(),
      nodes: [node("web_app"), node("api_service"), node("sql_database")],
    }).map((f) => f.id);
    expect(ids).toContain("no-ci-cd");
    expect(ids).toContain("no-hosting");
  });

  it("clears the platform findings once those pieces are present", () => {
    const ids = lintArchitecture({
      brief: brief(),
      nodes: [
        node("web_app"),
        node("api_service"),
        node("sql_database"),
        node("ci_cd"),
        node("hosting"),
      ],
    }).map((f) => f.id);
    expect(ids).not.toContain("no-ci-cd");
    expect(ids).not.toContain("no-hosting");
  });
});

describe("recommend", () => {
  it("recommends Postgres for high-sensitivity payment workloads", () => {
    const recs = recommend(
      brief({
        dataSensitivity: "high",
        coreFlows: ["Checkout and payment via Stripe"],
      })
    );
    const db = recs.find((r) => r.category === "sqlDatabase");
    expect(db?.recommendedOptionId).toBe("postgres");
  });

  it("always covers the core decision categories", () => {
    const cats = recommend(brief()).map((r) => r.category);
    expect(cats).toContain("sqlDatabase");
    expect(cats).toContain("compute");
    expect(cats).toContain("api");
  });
});

describe("technology options", () => {
  it("keeps SQL, NoSQL, and object storage options in their matching categories", () => {
    const sql = optionsForCategory("sqlDatabase").map((o) => o.name);
    const noSql = optionsForCategory("noSqlDatabase").map((o) => o.name);
    const objectStorage = optionsForCategory("objectStorage").map((o) => o.name);

    expect(sql).toEqual(expect.arrayContaining(["Postgres", "MySQL", "SQLite"]));
    expect(sql).not.toEqual(expect.arrayContaining(["MongoDB", "DynamoDB", "Firebase"]));

    expect(noSql).toEqual(expect.arrayContaining(["MongoDB", "DynamoDB", "Firebase"]));
    expect(noSql).not.toEqual(expect.arrayContaining(["Postgres", "MySQL", "SQLite"]));

    expect(objectStorage).toEqual(
      expect.arrayContaining([
        "Amazon S3",
        "Google Cloud Storage",
        "Azure Blob Storage",
        "Cloudflare R2",
      ])
    );
    expect(objectStorage).not.toContain("Database blobs");
  });

  it("has logos for SQL, NoSQL, and object storage technology options", () => {
    const categories = ["sqlDatabase", "noSqlDatabase", "objectStorage"] as const;
    for (const category of categories) {
      for (const option of optionsForCategory(category)) {
        expect(getTechLogo(option.name), `${option.name} should have a logo`).not.toBeNull();
      }
    }
  });
});
