/**
 * Higher-level AI helpers built on the Gemini client: summarize a project into
 * prompt context, run a one-shot architecture analysis into structured
 * Suggestions, and hold a freeform chat. All browser-side, BYO key.
 */

import { CATALOG } from "../catalog";
import { createId } from "../id";
import type {
  Project,
  Suggestion,
  ReviewSeverity,
  DecisionCategory,
  ArchitectureFlowNode,
} from "../types";
import {
  callGemini,
  imagePartFromDataUrl,
  type GeminiPart,
  type GeminiTurn,
} from "./gemini";

const SEVERITIES: ReviewSeverity[] = ["info", "warning", "critical"];
const CATEGORIES: DecisionCategory[] = [
  "database",
  "cache",
  "queue",
  "compute",
  "api",
  "storage",
  "search",
  "auth",
  "vectorStore",
  "observability",
];

const SYSTEM = `You are a pragmatic principal software architect reviewing a system design.
Be specific and blunt. Prefer concrete, actionable advice grounded in the components and brief you are given.
Never invent components that aren't described. When a wireframe image is provided, read it and reconcile it with the described architecture, calling out anything in the drawing that is missing from the component list.`;

function nodeName(n: ArchitectureFlowNode): string {
  return n.data.name || CATALOG[n.data.architectureType].label;
}

/** Compact, token-cheap text description of the project for prompt context. */
export function summarizeProject(project: Project): string {
  const { brief, nodes, edges, decisions } = project;
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const lines: string[] = [];

  lines.push(`PROJECT: ${project.name}`);
  if (project.description) lines.push(project.description);

  lines.push("\nBRIEF:");
  lines.push(`- Goal: ${brief.productGoal || "(unspecified)"}`);
  lines.push(`- Users: ${brief.users || "(unspecified)"}`);
  if (brief.coreFlows.length) lines.push(`- Core flows: ${brief.coreFlows.join("; ")}`);
  if (brief.trafficAssumptions) lines.push(`- Traffic: ${brief.trafficAssumptions}`);
  lines.push(`- Data sensitivity: ${brief.dataSensitivity}`);
  lines.push(`- Availability: ${brief.availability}`);
  if (brief.latencyNeeds) lines.push(`- Latency: ${brief.latencyNeeds}`);
  if (brief.integrations.length) lines.push(`- Integrations: ${brief.integrations.join(", ")}`);
  if (brief.compliance.length) lines.push(`- Compliance: ${brief.compliance.join(", ")}`);

  lines.push("\nCOMPONENTS:");
  if (nodes.length === 0) {
    lines.push("(none on the canvas yet)");
  } else {
    for (const n of nodes) {
      const entry = CATALOG[n.data.architectureType];
      const tech = n.data.technology ? ` [${n.data.technology}]` : "";
      lines.push(`- ${nodeName(n)} (${entry.label})${tech}`);
      if (n.data.dataStored.length)
        lines.push(`    stores: ${n.data.dataStored.join(", ")}`);
    }
  }

  if (edges.length) {
    lines.push("\nCONNECTIONS:");
    for (const e of edges) {
      const from = byId.get(e.source);
      const to = byId.get(e.target);
      if (from && to) lines.push(`- ${nodeName(from)} -> ${nodeName(to)}`);
    }
  }

  if (decisions.length) {
    lines.push("\nEXISTING DECISIONS:");
    for (const d of decisions) lines.push(`- ${d.title} (${d.status})`);
  }

  return lines.join("\n");
}

function safeSeverity(v: unknown): ReviewSeverity {
  return SEVERITIES.includes(v as ReviewSeverity) ? (v as ReviewSeverity) : "info";
}

function safeCategory(v: unknown): DecisionCategory | undefined {
  return CATEGORIES.includes(v as DecisionCategory)
    ? (v as DecisionCategory)
    : undefined;
}

/** Strips ```json fences if the model wraps its JSON despite being asked not to. */
function unfence(text: string): string {
  const m = /```(?:json)?\s*([\s\S]*?)```/.exec(text);
  return (m ? m[1] : text).trim();
}

export type AnalysisResult = { summary: string; suggestions: Suggestion[] };

/**
 * One-shot review: feeds the project (and optional wireframe image) to Gemini
 * and parses back a summary plus structured suggestions tagged source "ai".
 */
export async function analyzeArchitecture(
  project: Project,
  apiKey: string
): Promise<AnalysisResult> {
  const parts: GeminiPart[] = [
    {
      text: `${summarizeProject(project)}

Review this architecture. Identify gaps, risks, and concrete improvements (missing reliability/security pieces, questionable technology fits, scaling concerns, data-flow problems).

Respond ONLY with JSON of this exact shape:
{
  "summary": "2-3 sentence overall read of the design",
  "suggestions": [
    {
      "severity": "info" | "warning" | "critical",
      "title": "short imperative title",
      "description": "what the issue/opportunity is",
      "recommendation": "the concrete action to take",
      "category": one of ["database","cache","queue","compute","api","storage","search","auth","vectorStore","observability"] or null if not tied to a technology choice
    }
  ]
}
Aim for 3-8 high-signal suggestions. No prose outside the JSON.`,
    },
  ];

  if (project.referenceImage) {
    const imgPart = imagePartFromDataUrl(project.referenceImage.dataUrl);
    if (imgPart) parts.push(imgPart);
  }

  const raw = await callGemini({
    apiKey,
    system: SYSTEM,
    contents: [{ role: "user", parts }],
    json: true,
    temperature: 0.3,
  });

  let parsed: { summary?: string; suggestions?: unknown[] };
  try {
    parsed = JSON.parse(unfence(raw));
  } catch {
    throw new Error("Gemini returned a response that wasn't valid JSON. Try again.");
  }

  const now = new Date().toISOString();
  const suggestions: Suggestion[] = (parsed.suggestions ?? [])
    .filter((s): s is Record<string, unknown> => !!s && typeof s === "object")
    .map((s) => ({
      id: createId("sug"),
      source: "ai" as const,
      severity: safeSeverity(s.severity),
      title: String(s.title ?? "Suggestion").slice(0, 200),
      description: String(s.description ?? ""),
      recommendation: String(s.recommendation ?? ""),
      category: safeCategory(s.category),
      createdAt: now,
    }))
    .filter((s) => s.title || s.recommendation);

  return { summary: String(parsed.summary ?? ""), suggestions };
}

export type ChatMessage = { role: "user" | "model"; text: string };

/**
 * Freeform chat grounded in the project context (sent once as a priming turn),
 * plus the optional wireframe image on the first user message.
 */
export async function chatAboutProject(
  project: Project,
  history: ChatMessage[],
  userText: string,
  apiKey: string
): Promise<string> {
  const contents: GeminiTurn[] = [];

  // Prime the model with the project context as the first exchange.
  contents.push({
    role: "user",
    parts: [
      {
        text: `Here is the architecture we're discussing. Keep answers concise and specific to it.\n\n${summarizeProject(
          project
        )}`,
      },
    ],
  });
  contents.push({
    role: "model",
    parts: [{ text: "Got it. Ask me anything about this design." }],
  });

  for (const m of history) {
    contents.push({ role: m.role, parts: [{ text: m.text }] });
  }

  const lastParts: GeminiPart[] = [{ text: userText }];
  // Attach the wireframe only on the first user message of the conversation.
  if (history.length === 0 && project.referenceImage) {
    const imgPart = imagePartFromDataUrl(project.referenceImage.dataUrl);
    if (imgPart) lastParts.push(imgPart);
  }
  contents.push({ role: "user", parts: lastParts });

  return callGemini({
    apiKey,
    system: SYSTEM,
    contents,
    temperature: 0.5,
  });
}

/** Target ceiling for a stored wireframe so localStorage and a single Gemini
 * request stay comfortable. ~900 KB of decoded bytes. */
const IMAGE_BUDGET_BYTES = 900_000;

/** Approximate decoded byte size of a base64 data URL. */
function approxBytes(dataUrl: string): number {
  const comma = dataUrl.indexOf(",");
  const b64 = comma >= 0 ? dataUrl.length - comma - 1 : dataUrl.length;
  return Math.floor(b64 * 0.75);
}

/**
 * Downscale an uploaded image to a data URL small enough for localStorage and a
 * single Gemini request. Caps the longest edge, re-encodes as JPEG, then keeps
 * lowering quality (and finally dimensions) until it fits the byte budget so a
 * large photo can never blow the storage quota.
 */
export function fileToResizedDataUrl(
  file: File,
  maxDim = 1280,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("That file isn't a readable image."));
      img.onload = () => {
        const longest = Math.max(img.width, img.height);
        const render = (scale: number, q: number): string => {
          const w = Math.max(1, Math.round(img.width * scale));
          const h = Math.max(1, Math.round(img.height * scale));
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("Canvas not supported in this browser.");
          ctx.drawImage(img, 0, 0, w, h);
          return canvas.toDataURL("image/jpeg", q);
        };

        try {
          let scale = Math.min(1, maxDim / longest);
          let q = quality;
          let out = render(scale, q);
          // Drop quality first - cheaper than losing resolution.
          while (approxBytes(out) > IMAGE_BUDGET_BYTES && q > 0.4) {
            q -= 0.12;
            out = render(scale, q);
          }
          // Still too big? Shrink dimensions.
          while (approxBytes(out) > IMAGE_BUDGET_BYTES && scale > 0.3) {
            scale *= 0.8;
            out = render(scale, q);
          }
          resolve(out);
        } catch (e) {
          reject(e instanceof Error ? e : new Error("Could not process image."));
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
