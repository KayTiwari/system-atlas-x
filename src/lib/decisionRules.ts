import { createId } from "./id";
import { deriveContext, type ArchitectureContext } from "./analysis";
import {
  optionsForCategory,
  optionById,
  CATEGORY_LABELS,
  type TechnologyOption,
} from "./tradeoffs";
import type {
  ArchitectureBrief,
  ArchitectureFlowNode,
  DecisionCategory,
  DecisionCriterion,
  DecisionRecommendation,
} from "./types";

export type { ArchitectureContext } from "./analysis";

/**
 * A rule that, when its condition holds, contributes reasoning and can nudge a
 * specific option up the ranking for a category.
 */
export type DecisionRule = {
  id: string;
  category: DecisionCategory;
  condition: (ctx: ArchitectureContext) => boolean;
  reason: string;
  boostOptionId?: string;
  boost?: number;
};

export const DECISION_RULES: DecisionRule[] = [
  {
    id: "payments-need-transactions",
    category: "sqlDatabase",
    condition: (c) => c.hasPayments,
    reason: "Payments need strong transactions and relational integrity.",
    boostOptionId: "postgres",
    boost: 1.5,
  },
  {
    id: "sensitive-data-consistency",
    category: "sqlDatabase",
    condition: (c) => c.dataSensitivity === "high",
    reason: "Sensitive data benefits from a consistent, auditable relational store.",
    boostOptionId: "postgres",
    boost: 1,
  },
  {
    id: "high-traffic-scale-db",
    category: "noSqlDatabase",
    condition: (c) => c.isHighTraffic,
    reason: "Very high traffic with known access patterns can favor a scalable key-value store.",
    boostOptionId: "dynamodb",
    boost: 0.75,
  },
  {
    id: "files-object-storage",
    category: "objectStorage",
    condition: (c) => c.hasFileUploads,
    reason: "Large files should live in object storage, not the application database.",
    boostOptionId: "s3",
    boost: 1.5,
  },
  {
    id: "external-users-managed-auth",
    category: "auth",
    condition: (c) => c.hasExternalUsers,
    reason: "External users mean real auth surface - managed auth lowers risk.",
    boostOptionId: "managed-auth",
    boost: 1,
  },
  {
    id: "realtime-low-latency-cache",
    category: "cache",
    condition: (c) => c.hasRealtime,
    reason: "Realtime features lean on fast, shared in-memory state.",
    boostOptionId: "redis",
    boost: 1,
  },
  {
    id: "ai-vector",
    category: "vectorStore",
    condition: (c) => c.hasAI,
    reason: "AI/RAG retrieval needs an embedding store; pgvector keeps it simple.",
    boostOptionId: "pgvector",
    boost: 1,
  },
  {
    id: "search-scale",
    category: "search",
    condition: (c) => c.isHighTraffic && c.hasSearch,
    reason: "Large-scale search with relevance favors a dedicated search engine.",
    boostOptionId: "elasticsearch",
    boost: 0.75,
  },
  {
    id: "spiky-serverless",
    category: "compute",
    condition: (c) => !c.isHighTraffic,
    reason: "Without sustained high traffic, serverless avoids idle cost and ops.",
    boostOptionId: "serverless",
    boost: 0.75,
  },
  {
    id: "high-traffic-containers",
    category: "compute",
    condition: (c) => c.isHighTraffic,
    reason: "Sustained high throughput favors long-running container services.",
    boostOptionId: "containers",
    boost: 1,
  },
];

/** Per-criterion weights derived from the brief context. Base weight is 1. */
export function weightsFor(ctx: ArchitectureContext): Record<DecisionCriterion, number> {
  const w: Record<DecisionCriterion, number> = {
    simplicity: 1,
    scalability: 1,
    cost: 1,
    consistency: 1,
    operationalComplexity: 1,
    teamFamiliarity: 1,
    vendorLockIn: 0.5,
    latency: 1,
    compliance: 0.5,
  };
  if (ctx.dataSensitivity === "high") {
    w.consistency += 1;
    w.compliance += 1.5;
  }
  if (ctx.hasPayments) w.consistency += 1;
  if (ctx.hasCompliance) w.compliance += 1.5;
  if (ctx.isHighTraffic) {
    w.scalability += 1.5;
    w.latency += 0.5;
  }
  if (ctx.hasRealtime) w.latency += 1;
  if (ctx.availability === "high") w.scalability += 0.5;
  if (ctx.availability === "best_effort") {
    w.simplicity += 1;
    w.cost += 1;
  }
  return w;
}

function baseScore(
  option: TechnologyOption,
  weights: Record<DecisionCriterion, number>
): number {
  let total = 0;
  let weightSum = 0;
  for (const key of Object.keys(weights) as DecisionCriterion[]) {
    total += option.scores[key] * weights[key];
    weightSum += weights[key];
  }
  return total / weightSum; // normalized to the 1-5 range
}

/** Categories worth recommending for, given the brief and what's on the canvas. */
export function relevantCategories(
  ctx: ArchitectureContext
): DecisionCategory[] {
  const set = new Set<DecisionCategory>(["sqlDatabase", "compute", "api"]);
  set.add("cache");
  set.add("observability");
  if (ctx.hasFileUploads) {
    set.add("objectStorage");
    set.add("queue");
  }
  if (ctx.isHighTraffic) set.add("noSqlDatabase");
  if (ctx.isHighTraffic) set.add("queue");
  if (ctx.hasSearch) set.add("search");
  if (ctx.hasAI) set.add("vectorStore");
  if (ctx.hasExternalUsers) set.add("auth");
  return Array.from(set);
}

function recommendForCategory(
  category: DecisionCategory,
  ctx: ArchitectureContext,
  weights: Record<DecisionCriterion, number>
): DecisionRecommendation | null {
  const options = optionsForCategory(category);
  if (options.length === 0) return null;

  const matchedRules = DECISION_RULES.filter(
    (r) => r.category === category && r.condition(ctx)
  );

  const scored = options
    .map((opt) => {
      let score = baseScore(opt, weights);
      for (const rule of matchedRules) {
        if (rule.boostOptionId === opt.id) score += rule.boost ?? 1;
      }
      return { opt, score };
    })
    .sort((a, b) => b.score - a.score);

  const top = scored[0];
  const second = scored[1];
  const gap = second ? (top.score - second.score) / top.score : 1;
  const confidence: DecisionRecommendation["confidence"] =
    gap > 0.15 ? "high" : gap > 0.05 ? "medium" : "low";

  const ruleReasons = matchedRules
    .filter((r) => !r.boostOptionId || r.boostOptionId === top.opt.id)
    .map((r) => r.reason);
  const reason =
    ruleReasons.length > 0
      ? ruleReasons.join(" ")
      : `Best overall fit for your brief across ${CATEGORY_LABELS[
          category
        ].toLowerCase()} criteria.`;

  return {
    id: createId("rec"),
    category,
    title: `${CATEGORY_LABELS[category]}: ${top.opt.name}`,
    recommendedOptionId: top.opt.id,
    reason,
    alternatives: scored.slice(1, 3).map((s) => s.opt.name),
    tradeoffs: top.opt.tradeoffs,
    confidence,
    matchedRuleIds: matchedRules.map((r) => r.id),
  };
}

/** Top-level entry point: recommendations for every relevant category. */
export function recommend(
  brief: ArchitectureBrief,
  nodes: ArchitectureFlowNode[] = []
): DecisionRecommendation[] {
  const ctx = deriveContext(brief, nodes);
  const weights = weightsFor(ctx);
  return relevantCategories(ctx)
    .map((c) => recommendForCategory(c, ctx, weights))
    .filter((r): r is DecisionRecommendation => r !== null);
}

/** Build an ADR (Decision) from a recommendation, ready to drop in the store. */
export function recommendationToDecision(rec: DecisionRecommendation) {
  const opt = optionById(rec.recommendedOptionId);
  return {
    id: createId("dec"),
    title: rec.title,
    context: rec.reason,
    decision: opt ? `Use ${opt.name}.` : rec.title,
    alternatives: rec.alternatives,
    tradeoffs: rec.tradeoffs,
    status: "proposed" as const,
  };
}
