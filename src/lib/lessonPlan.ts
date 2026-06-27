import { CATALOG } from "./catalog";
import { TIER_ORDER, tierOfComponent, type Tier } from "./tiers";
import { TIER_LESSONS } from "@/data/lessonCopy";
import type {
  ComponentId,
  LearningScenario,
  LessonPlan,
  LessonStage,
} from "./learnTypes";

const STOPWORDS = new Set([
  "the", "and", "for", "with", "service", "layer", "system", "store", "app",
  "and/or", "backend", "frontend", "provider", "stack", "site", "index",
]);

/** Words a pitfall might mention to associate it with a tier's components. */
function tierKeywords(ids: ComponentId[]): Set<string> {
  const words = new Set<string>();
  for (const id of ids) {
    const entry = CATALOG[id];
    if (!entry) continue;
    for (const w of entry.label.toLowerCase().split(/[^a-z]+/)) {
      if (w.length > 2 && !STOPWORDS.has(w)) words.add(w);
    }
    if (entry.defaultTechnology) {
      words.add(entry.defaultTechnology.toLowerCase());
    }
  }
  // A few synonyms the labels don't cover.
  if (ids.includes("rate_limiter")) ["rate", "limiting", "abuse", "spam"].forEach((w) => words.add(w));
  if (ids.includes("idempotency_layer")) ["idempotency", "duplicate", "double", "retries"].forEach((w) => words.add(w));
  if (ids.includes("audit_log")) ["audit", "auditability", "reconciliation"].forEach((w) => words.add(w));
  if (ids.includes("dead_letter_queue")) ["poison", "failed", "retries"].forEach((w) => words.add(w));
  if (ids.includes("malware_scanner")) ["malware", "scan", "virus"].forEach((w) => words.add(w));
  return words;
}

/** Keep the original scenario ordering when filtering an id list. */
function inOrder(source: ComponentId[], keep: Set<ComponentId>): ComponentId[] {
  const seen = new Set<ComponentId>();
  const out: ComponentId[] = [];
  for (const id of source) {
    if (keep.has(id) && !seen.has(id)) {
      seen.add(id);
      out.push(id);
    }
  }
  return out;
}

/**
 * Build a scenario's guided lesson plan: one stage per architecture tier the
 * scenario uses, ordered by TIER_ORDER, with the components, teaching copy, and
 * relevant pitfalls for that layer. Pure and deterministic.
 */
export function buildLessonPlan(scenario: LearningScenario): LessonPlan {
  const core = new Set<ComponentId>([
    ...scenario.criticalComponentIds,
    ...scenario.expectedComponentIds,
  ]);
  const senior = new Set<ComponentId>(
    scenario.recommendedComponentIds.filter((id) => !core.has(id))
  );

  // Group every relevant component by tier.
  const byTier = new Map<Tier, { core: Set<ComponentId>; senior: Set<ComponentId> }>();
  const add = (id: ComponentId, kind: "core" | "senior") => {
    const tier = tierOfComponent(id);
    if (!tier) return;
    if (!byTier.has(tier)) byTier.set(tier, { core: new Set(), senior: new Set() });
    byTier.get(tier)![kind].add(id);
  };
  core.forEach((id) => add(id, "core"));
  senior.forEach((id) => add(id, "senior"));

  const presentTiers = TIER_ORDER.filter((t) => byTier.has(t));

  // Assign each pitfall to the first present tier whose keywords it mentions.
  const pitfallByTier = new Map<Tier, string[]>();
  for (const pitfall of scenario.commonPitfalls) {
    const text = pitfall.toLowerCase();
    for (const tier of presentTiers) {
      const group = byTier.get(tier)!;
      const ids = [...group.core, ...group.senior];
      const keywords = tierKeywords(ids);
      if ([...keywords].some((k) => text.includes(k))) {
        if (!pitfallByTier.has(tier)) pitfallByTier.set(tier, []);
        pitfallByTier.get(tier)!.push(pitfall);
        break;
      }
    }
  }

  const stages: LessonStage[] = presentTiers.map((tier, i) => {
    const group = byTier.get(tier)!;
    const lesson = TIER_LESSONS[tier];
    return {
      tier,
      title: `Step ${i + 1} - ${lesson.label}`,
      teaching: lesson.why,
      guidingQuestion: lesson.question,
      coreComponentIds: inOrder(
        [...scenario.criticalComponentIds, ...scenario.expectedComponentIds],
        group.core
      ),
      seniorComponentIds: inOrder(scenario.recommendedComponentIds, group.senior),
      pitfalls: pitfallByTier.get(tier) ?? [],
      checkPrompt: lesson.check,
    };
  });

  return { scenarioId: scenario.id, stages };
}

/**
 * A stage is "complete" once all its core components are selected AND at least
 * one of its components is present. The second clause matters for layers whose
 * components are all senior-signal (e.g. Observability = just monitoring): with
 * no core components, `every` is vacuously true, so without it the stage would
 * show as done before the user adds anything.
 */
export function isStageComplete(stage: LessonStage, selected: Set<ComponentId>): boolean {
  const all = [...stage.coreComponentIds, ...stage.seniorComponentIds];
  if (all.length === 0) return false;
  const allCoreSelected = stage.coreComponentIds.every((id) => selected.has(id));
  const anySelected = all.some((id) => selected.has(id));
  return allCoreSelected && anySelected;
}
