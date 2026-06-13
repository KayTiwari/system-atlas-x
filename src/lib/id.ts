/**
 * Stable ID creation for every entity (projects, nodes, edges, decisions,
 * findings, recommendations). Use this everywhere instead of scattering
 * Math.random() around the codebase.
 */
export function createId(prefix = "id"): string {
  // crypto.randomUUID is available in modern browsers and Node 19+.
  const uuid =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36);
  return `${prefix}_${uuid}`;
}
