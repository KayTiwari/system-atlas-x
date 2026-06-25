import { describe, it, expect } from "vitest";
import { reviewArchitecture, readinessLabel } from "../reviewEngine";
import { getScenario } from "@/data/learningScenarios";
import { generateInterviewExplanation } from "../explanationGenerator";
import { getAtlasCoachTips } from "../atlasCoach";
import type { ComponentId } from "../learnTypes";

const payments = getScenario("payment-processing")!;

describe("reviewEngine", () => {
  it("an empty design scores near zero and tells you to start", () => {
    const { items, score } = reviewArchitecture({
      mode: "learn",
      selectedComponentIds: [],
      scenario: payments,
    });
    expect(score.overall).toBeLessThan(15);
    expect(items.some((i) => i.id === "empty")).toBe(true);
  });

  it("flags missing idempotency on a payments scenario as critical", () => {
    const { items } = reviewArchitecture({
      mode: "learn",
      selectedComponentIds: ["web_app", "api_service", "payment_provider", "sql_database"],
      scenario: payments,
    });
    const idem = items.find((i) => i.id === "payments-no-idempotency");
    expect(idem).toBeDefined();
    expect(idem?.type).toBe("critical");
  });

  it("rewards a complete payments design and stops flagging idempotency", () => {
    const ref = [
      "web_app",
      "api_gateway",
      "auth_provider",
      "api_service",
      "idempotency_layer",
      "payment_provider",
      "webhook_handler",
      "sql_database",
      "queue",
      "dead_letter_queue",
      "audit_log",
      "monitoring",
    ] as const;
    const { items, score } = reviewArchitecture({
      mode: "learn",
      selectedComponentIds: [...ref],
      scenario: payments,
    });
    expect(items.find((i) => i.id === "payments-no-idempotency")).toBeUndefined();
    expect(items.some((i) => i.type === "strength")).toBe(true);
    expect(score.overall).toBeGreaterThan(70);
  });

  it("is deterministic for the same input", () => {
    const input = {
      mode: "learn" as const,
      selectedComponentIds: [
        "web_app",
        "api_service",
        "sql_database",
        "cache",
      ] as ComponentId[],
      scenario: getScenario("url-shortener")!,
    };
    const a = reviewArchitecture(input);
    const b = reviewArchitecture(input);
    expect(a.score.overall).toBe(b.score.overall);
    expect(a.items.map((i) => i.id)).toEqual(b.items.map((i) => i.id));
  });

  it("uses mode-specific readiness labels", () => {
    expect(readinessLabel(90, "learn")).toBe("Interview Ready");
    expect(readinessLabel(90, "build")).toBe("Production-Minded");
    expect(readinessLabel(30, "build")).toBe("Risky");
  });
});

describe("explanationGenerator", () => {
  it("produces a stable, full interview explanation", () => {
    const doc = generateInterviewExplanation(payments, [
      "web_app",
      "api_service",
      "payment_provider",
      "idempotency_layer",
      "webhook_handler",
      "sql_database",
    ]);
    expect(doc.title).toContain("Payment");
    expect(doc.sections.length).toBeGreaterThanOrEqual(9);
    expect(doc.sections.every((s) => s.body.length > 0)).toBe(true);
  });
});

describe("atlasCoach", () => {
  it("nudges toward the request path when empty", () => {
    const tips = getAtlasCoachTips({
      mode: "learn",
      selectedComponentIds: [],
      reviewItems: [],
    });
    expect(tips).toHaveLength(1);
    expect(tips[0].suggestedComponentIds?.length).toBeGreaterThan(0);
  });

  it("never returns more than three tips", () => {
    const scenario = getScenario("ecommerce-checkout")!;
    const { items, score } = reviewArchitecture({
      mode: "learn",
      selectedComponentIds: ["web_app"],
      scenario,
    });
    const tips = getAtlasCoachTips({
      mode: "learn",
      selectedComponentIds: ["web_app"],
      selectedComponentId: "queue",
      scenario,
      reviewItems: items,
      score,
    });
    expect(tips.length).toBeLessThanOrEqual(3);
  });
});
