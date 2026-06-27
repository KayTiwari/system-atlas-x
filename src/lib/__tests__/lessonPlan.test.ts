import { describe, it, expect } from "vitest";
import { buildLessonPlan, isStageComplete } from "../lessonPlan";
import { LEARNING_SCENARIOS, getScenario } from "@/data/learningScenarios";
import type { ComponentId } from "../learnTypes";

describe("buildLessonPlan", () => {
  it("every scenario yields at least three ordered stages", () => {
    for (const scenario of LEARNING_SCENARIOS) {
      const plan = buildLessonPlan(scenario);
      expect(plan.stages.length, scenario.id).toBeGreaterThanOrEqual(3);
    }
  });

  it("stage components cover every critical component", () => {
    for (const scenario of LEARNING_SCENARIOS) {
      const plan = buildLessonPlan(scenario);
      const covered = new Set<ComponentId>();
      for (const stage of plan.stages) {
        stage.coreComponentIds.forEach((c) => covered.add(c));
        stage.seniorComponentIds.forEach((c) => covered.add(c));
      }
      for (const crit of scenario.criticalComponentIds) {
        expect(covered.has(crit), `${scenario.id} missing ${crit}`).toBe(true);
      }
    }
  });

  it("a stage is complete once its core components are selected", () => {
    const plan = buildLessonPlan(getScenario("url-shortener")!);
    const stage = plan.stages.find((s) => s.coreComponentIds.length > 0)!;
    expect(isStageComplete(stage, new Set())).toBe(false);
    expect(isStageComplete(stage, new Set(stage.coreComponentIds))).toBe(true);
  });

  it("a senior-only stage is not complete until something is added", () => {
    const plan = buildLessonPlan(getScenario("url-shortener")!);
    const seniorOnly = plan.stages.find(
      (s) => s.coreComponentIds.length === 0 && s.seniorComponentIds.length > 0
    )!;
    expect(seniorOnly, "expected a senior-only stage").toBeDefined();
    expect(isStageComplete(seniorOnly, new Set())).toBe(false);
    expect(
      isStageComplete(seniorOnly, new Set([seniorOnly.seniorComponentIds[0]]))
    ).toBe(true);
  });

  it("is deterministic for the same scenario", () => {
    const a = buildLessonPlan(getScenario("payment-processing")!);
    const b = buildLessonPlan(getScenario("payment-processing")!);
    expect(a.stages.map((s) => s.tier)).toEqual(b.stages.map((s) => s.tier));
    expect(a.stages.map((s) => s.coreComponentIds)).toEqual(
      b.stages.map((s) => s.coreComponentIds)
    );
  });
});
