import { deriveContext } from "./analysis";
import type {
  ArchitectureBrief,
  ArchitectureFlowNode,
  ArchitectureNodeType,
  ReviewFinding,
  ReviewSeverity,
} from "./types";

type LintInput = {
  brief: ArchitectureBrief;
  nodes: ArchitectureFlowNode[];
};

type Rule = {
  id: string;
  severity: ReviewSeverity;
  title: string;
  /** Returns a description when the rule fires, otherwise null. */
  evaluate: (
    has: (t: ArchitectureNodeType) => boolean,
    ctx: ReturnType<typeof deriveContext>,
    nodes: ArchitectureFlowNode[]
  ) => { description: string; recommendation: string } | null;
};

const RULES: Rule[] = [
  {
    id: "public-api-no-rate-limiter",
    severity: "warning",
    title: "Public API has no rate limiter",
    evaluate: (has, ctx) =>
      ctx.hasPublicApi && !has("rate_limiter")
        ? {
            description:
              "External clients can reach your API but nothing caps request rates.",
            recommendation:
              "Add a rate limiter (token bucket / sliding window) at the gateway.",
          }
        : null,
  },
  {
    id: "queue-no-dlq",
    severity: "warning",
    title: "Queue has no dead-letter queue",
    evaluate: (has) =>
      has("queue") && !has("dead_letter_queue")
        ? {
            description:
              "Failed messages may silently disappear without a dead-letter queue.",
            recommendation:
              "Add a dead-letter queue and alert on it; define a retry policy.",
          }
        : null,
  },
  {
    id: "queue-no-worker",
    severity: "warning",
    title: "Queue has no worker",
    evaluate: (has) =>
      has("queue") && !has("worker")
        ? {
            description: "You publish async work but nothing consumes the queue.",
            recommendation: "Add a background worker to process queued jobs.",
          }
        : null,
  },
  {
    id: "files-no-object-storage",
    severity: "warning",
    title: "File handling but no object storage",
    evaluate: (has, ctx) =>
      ctx.hasFileUploads && !has("object_storage")
        ? {
            description:
              "Your brief mentions files but there is no object storage - are files going into the database?",
            recommendation:
              "Store large files in object storage and keep metadata + ACLs in the database.",
          }
        : null,
  },
  {
    id: "sensitive-no-audit-log",
    severity: "critical",
    title: "Sensitive data but no audit log",
    evaluate: (has, ctx) =>
      (ctx.dataSensitivity === "high" || ctx.hasCompliance) &&
      !has("audit_log")
        ? {
            description:
              "Sensitive or regulated data is in scope but no audit logging is defined.",
            recommendation:
              "Add an append-only audit log for access to sensitive data.",
          }
        : null,
  },
  {
    id: "ha-no-backup",
    severity: "warning",
    title: "High availability but no backup strategy",
    evaluate: (has, ctx) =>
      ctx.availability === "high" && !has("backup")
        ? {
            description:
              "High availability was selected but there is no backup/restore plan.",
            recommendation:
              "Add automated backups and periodically test restores.",
          }
        : null,
  },
  {
    id: "ha-no-replica",
    severity: "info",
    title: "High availability with a single database",
    evaluate: (has, ctx) =>
      ctx.availability === "high" &&
      has("sql_database") &&
      !has("read_replica")
        ? {
            description:
              "A single database is a single point of failure for a high-availability target.",
            recommendation:
              "Add a read replica / multi-AZ failover for the primary database.",
          }
        : null,
  },
  {
    id: "auth-no-authorization",
    severity: "warning",
    title: "Authentication but no authorization boundary",
    evaluate: (has) =>
      has("auth_provider") && !has("authorization")
        ? {
            description:
              "You establish identity but there is no explicit authorization boundary between roles.",
            recommendation:
              "Add an authorization boundary (RBAC/ABAC) and check it on privileged actions.",
          }
        : null,
  },
  {
    id: "cache-no-invalidation",
    severity: "info",
    title: "Cache without an invalidation strategy",
    evaluate: (has, _ctx, nodes) => {
      const cache = nodes.find((n) => n.data.architectureType === "cache");
      if (!cache) return null;
      return cache.data.cacheInvalidationStrategy?.trim()
        ? null
        : {
            description:
              "A cache is present but no invalidation strategy is documented.",
            recommendation:
              "Define TTLs and an invalidation approach (cache-aside, write-through, ...).",
          };
    },
  },
  {
    id: "external-users-no-auth",
    severity: "warning",
    title: "External users but no auth provider",
    evaluate: (has, ctx) =>
      ctx.hasExternalUsers && !has("auth_provider")
        ? {
            description:
              "External users are in scope but there is no authentication provider.",
            recommendation: "Add an auth provider (OAuth/OIDC or managed auth).",
          }
        : null,
  },
  {
    id: "no-monitoring",
    severity: "info",
    title: "No monitoring / observability",
    evaluate: (has, _ctx, nodes) =>
      nodes.length > 2 && !has("monitoring")
        ? {
            description: "You cannot operate what you cannot see.",
            recommendation:
              "Add monitoring (logs, metrics, traces) and alert on SLOs.",
          }
        : null,
  },
  {
    id: "no-ci-cd",
    severity: "info",
    title: "No CI/CD pipeline",
    evaluate: (has, _ctx, nodes) =>
      nodes.length > 2 && !has("ci_cd")
        ? {
            description:
              "There is no version control / CI/CD pipeline shipping changes safely.",
            recommendation:
              "Add a CI/CD pipeline (build, test, deploy on merge) with one-click rollback.",
          }
        : null,
  },
  {
    id: "no-hosting",
    severity: "info",
    title: "No hosting / deployment target",
    evaluate: (has, _ctx, nodes) =>
      nodes.length > 2 && !has("hosting")
        ? {
            description:
              "No hosting / deployment target describes where the app runs and how versions roll out.",
            recommendation:
              "Add a hosting & deployment component (serverless, containers, or PaaS) with health-gated rollouts.",
          }
        : null,
  },
];

/** Pure: run the Architecture Review rules over a project. */
export function lintArchitecture({ brief, nodes }: LintInput): ReviewFinding[] {
  const ctx = deriveContext(brief, nodes);
  const has = (t: ArchitectureNodeType) => ctx.present.has(t);

  const findings: ReviewFinding[] = [];
  for (const rule of RULES) {
    const result = rule.evaluate(has, ctx, nodes);
    if (result) {
      findings.push({
        id: rule.id,
        severity: rule.severity,
        title: rule.title,
        description: result.description,
        recommendation: result.recommendation,
      });
    }
  }

  const order: Record<ReviewSeverity, number> = {
    critical: 0,
    warning: 1,
    info: 2,
  };
  return findings.sort((a, b) => order[a.severity] - order[b.severity]);
}
