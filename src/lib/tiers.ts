import { CATALOG, type PaletteGroup } from "./catalog";
import type { ComponentId } from "./learnTypes";

/**
 * The high-level architecture tiers used to group components in the workspace
 * and to order the guided lesson stages. Collapses the fine-grained palette
 * groups into a few teachable layers.
 */
export type Tier =
  | "Edge / Entry"
  | "Services"
  | "Data"
  | "Async / Events"
  | "Reliability"
  | "Security"
  | "Observability"
  | "Operations"
  | "External";

export const TIER_OF: Record<PaletteGroup, Tier> = {
  Client: "Edge / Entry",
  Networking: "Edge / Entry",
  Compute: "Services",
  Data: "Data",
  Async: "Async / Events",
  Reliability: "Reliability",
  Security: "Security",
  Observability: "Observability",
  Platform: "Operations",
  External: "External",
};

/** Canonical order tiers appear in, both in the board and the lesson plan. */
export const TIER_ORDER: Tier[] = [
  "Edge / Entry",
  "Services",
  "Data",
  "Async / Events",
  "Reliability",
  "Security",
  "Observability",
  "Operations",
  "External",
];

export function tierOfComponent(id: ComponentId): Tier | undefined {
  const entry = CATALOG[id];
  return entry ? TIER_OF[entry.group] : undefined;
}
