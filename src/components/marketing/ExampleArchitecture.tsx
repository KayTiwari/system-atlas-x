"use client";

import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { getTechLogo } from "@/lib/techLogos";

type Scenario = "baseline" | "scale" | "secure";
type ExampleNodeId = "client" | "gateway" | "limiter" | "api" | "cache" | "store";

const SCENARIOS: { id: Scenario; label: string }[] = [
  { id: "baseline", label: "Baseline" },
  { id: "scale", label: "High traffic" },
  { id: "secure", label: "Sensitive data" },
];

const EXAMPLE_NODES: Record<
  ExampleNodeId,
  {
    code: string;
    accent: string;
    name: string;
    tech: Record<Scenario, string>;
    tradeoff: Record<Scenario, string>;
    decision: Record<Scenario, string>;
  }
> = {
  client: {
    code: "CL",
    accent: "text-sky-700",
    name: "Client",
    tech: {
      baseline: "Web + mobile",
      scale: "CDN-backed web",
      secure: "Authenticated app",
    },
    tradeoff: {
      baseline: "A thin client keeps business rules server-side while still supporting web and mobile clients.",
      scale: "Static assets move behind CDN caching so traffic spikes do not hit the API for every page load.",
      secure: "The client only holds short-lived session state; protected work still happens behind the API boundary.",
    },
    decision: {
      baseline: "Keep the client as a presentation layer and route all writes through the API.",
      scale: "Serve static client assets through CDN caching before scaling backend services.",
      secure: "Use short-lived sessions and keep authorization decisions on the server.",
    },
  },
  gateway: {
    code: "GW",
    accent: "text-indigo-700",
    name: "API Gateway",
    tech: {
      baseline: "Routing + auth",
      scale: "Edge routing",
      secure: "OIDC + policy checks",
    },
    tradeoff: {
      baseline: "A gateway gives one public entry point for routing and authentication without exposing internal services.",
      scale: "Edge routing absorbs request volume earlier, but gateway rules must stay simple and observable.",
      secure: "Centralized auth is consistent, but policy drift can happen if services skip their own checks.",
    },
    decision: {
      baseline: "Put the gateway in front of all API services.",
      scale: "Keep gateway routing shallow and push domain logic into services.",
      secure: "Validate identity at the gateway and enforce authorization in the service.",
    },
  },
  limiter: {
    code: "RL",
    accent: "text-fuchsia-700",
    name: "Rate limiter",
    tech: {
      baseline: "Abuse control",
      scale: "Redis token bucket",
      secure: "Per-user quotas",
    },
    tradeoff: {
      baseline: "Rate limiting protects expensive endpoints without complicating the core application.",
      scale: "A shared Redis counter keeps limits consistent across horizontally scaled API instances.",
      secure: "Per-user quotas reduce abuse, but support teams need clear override paths.",
    },
    decision: {
      baseline: "Apply rate limits at the gateway before requests reach business logic.",
      scale: "Use Redis-backed token buckets for distributed rate limiting.",
      secure: "Scope quotas by authenticated user and API key.",
    },
  },
  api: {
    code: "API",
    accent: "text-emerald-700",
    name: "App service",
    tech: {
      baseline: "Stateless API",
      scale: "Container service",
      secure: "Audited API",
    },
    tradeoff: {
      baseline: "A stateless service is simple to scale because durable state lives in data stores.",
      scale: "Containers fit steady throughput better than functions once the service is always warm.",
      secure: "Audit hooks add friction, but they make sensitive changes explainable after the fact.",
    },
    decision: {
      baseline: "Keep application servers stateless and horizontally scalable.",
      scale: "Run the API as a container service for predictable high traffic.",
      secure: "Record sensitive write actions with actor, target, and reason.",
    },
  },
  cache: {
    code: "CA",
    accent: "text-cyan-700",
    name: "Cache",
    tech: {
      baseline: "Redis",
      scale: "Redis cluster",
      secure: "Short TTL cache",
    },
    tradeoff: {
      baseline: "Redis speeds hot reads, but every cached value needs an expiration or invalidation plan.",
      scale: "Clustering improves capacity, but operational complexity rises with shard and failover behavior.",
      secure: "Short TTLs limit sensitive-data exposure while still protecting repeated reads.",
    },
    decision: {
      baseline: "Use Redis cache-aside for hot URL lookup paths.",
      scale: "Move Redis to a managed cluster once cache pressure becomes sustained.",
      secure: "Cache sensitive-derived responses only with short TTLs and no shared-user keys.",
    },
  },
  store: {
    code: "DB",
    accent: "text-blue-700",
    name: "Primary store",
    tech: {
      baseline: "Postgres",
      scale: "DynamoDB",
      secure: "Postgres RLS",
    },
    tradeoff: {
      baseline: "Postgres fits relational data, transactions, and operational familiarity for the first version.",
      scale: "DynamoDB wins on predictable high-volume key lookups, but access patterns must be designed upfront.",
      secure: "Postgres RLS keeps tenant isolation close to the data, but policies need careful testing.",
    },
    decision: {
      baseline: "Use Postgres as the primary store; revisit if write volume outgrows a single primary.",
      scale: "Use DynamoDB for predictable key-value access at very high request volume.",
      secure: "Use Postgres with row-level security for tenant-scoped records.",
    },
  },
};

/**
 * A compact, interactive sample of what System Atlas produces from a brief:
 * a typed component diagram, the trade-off behind each choice, and a decision
 * record that changes as the user explores the design.
 */
export function ExampleArchitecture() {
  const [scenario, setScenario] = useState<Scenario>("baseline");
  const [selectedId, setSelectedId] = useState<ExampleNodeId>("store");
  const selected = EXAMPLE_NODES[selectedId];

  const tradeoffTitle = useMemo(() => {
    if (selectedId === "store") return `${selected.tech.baseline} vs DynamoDB`;
    return `${selected.name} choice`;
  }, [selected, selectedId]);

  return (
    <div className="rounded-md border border-navy-700 bg-navy-900/50 p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-md border border-navy-700 bg-paper-soft p-1">
          {SCENARIOS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setScenario(item.id)}
              className={`rounded px-3 py-1.5 text-xs font-semibold transition ${
                scenario === item.id
                  ? "bg-navy-900 text-ink shadow-sm"
                  : "text-slate-600 hover:bg-navy-900/70 hover:text-ink"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          Selected · {selected.name}
        </p>
      </div>

      <div className="flex items-stretch justify-center gap-1.5 overflow-x-auto pb-1 thin-scroll sm:gap-2">
        <Node
          id="client"
          scenario={scenario}
          selected={selectedId === "client"}
          onSelect={setSelectedId}
        />
        <Arrow active={selectedId === "client" || selectedId === "gateway"} />
        <Column>
          <Node
            id="gateway"
            scenario={scenario}
            selected={selectedId === "gateway"}
            onSelect={setSelectedId}
          />
          <Node
            id="limiter"
            scenario={scenario}
            selected={selectedId === "limiter"}
            onSelect={setSelectedId}
          />
        </Column>
        <Arrow active={selectedId === "gateway" || selectedId === "limiter" || selectedId === "api"} />
        <Node
          id="api"
          scenario={scenario}
          selected={selectedId === "api"}
          onSelect={setSelectedId}
        />
        <Arrow active={selectedId === "api" || selectedId === "cache" || selectedId === "store"} />
        <Column>
          <Node
            id="cache"
            scenario={scenario}
            selected={selectedId === "cache"}
            onSelect={setSelectedId}
          />
          <Node
            id="store"
            scenario={scenario}
            selected={selectedId === "store"}
            onSelect={setSelectedId}
          />
        </Column>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Artifact
          kind="Trade-off"
          title={tradeoffTitle}
          body={selected.tradeoff[scenario]}
        />
        <Artifact
          kind="Decision"
          title={`ADR-001 · ${selected.name}`}
          body={selected.decision[scenario]}
        />
      </div>
    </div>
  );
}

function Column({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col justify-center gap-2">{children}</div>;
}

function Node({
  id,
  scenario,
  selected,
  onSelect,
}: {
  id: ExampleNodeId;
  scenario: Scenario;
  selected: boolean;
  onSelect: (id: ExampleNodeId) => void;
}) {
  const node = EXAMPLE_NODES[id];
  const tech = node.tech[scenario];
  const logo = getTechLogo(tech);
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      aria-pressed={selected}
      className={`flex w-36 shrink-0 items-center gap-2.5 rounded-md border px-3 py-2 text-left shadow-sm transition ${
        selected
          ? "border-brand-blue bg-navy-900 ring-2 ring-brand-blue/15"
          : "border-navy-700 bg-navy-900 hover:border-brand-blue/50 hover:bg-paper-soft"
      }`}
    >
      <span
        className={`grid h-7 w-7 shrink-0 place-items-center rounded-sm border border-navy-700 bg-paper-soft font-mono text-[10px] font-semibold ${
          logo ? "" : node.accent
        }`}
      >
        {logo?.kind === "img" ? (
          <img
            src={logo.src}
            alt={`${logo.title} logo`}
            className="h-4 w-4 object-contain"
          />
        ) : logo ? (
          <svg
            role="img"
            aria-label={`${logo.title} logo`}
            viewBox="0 0 24 24"
            fill={logo.hex}
            className="h-4 w-4"
          >
            <title>{logo.title}</title>
            <path d={logo.path} />
          </svg>
        ) : (
          node.code
        )}
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold text-ink">{node.name}</p>
        <p className="truncate text-[11px] text-slate-500">{tech}</p>
      </div>
    </button>
  );
}

function Arrow({ active }: { active?: boolean }) {
  return (
    <div
      className={`flex shrink-0 items-center transition ${
        active ? "text-brand-cyan" : "text-slate-600"
      }`}
    >
      <ChevronRight className="h-4 w-4" />
    </div>
  );
}

function Artifact({
  kind,
  title,
  body,
}: {
  kind: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-md border border-navy-700 bg-paper-soft/70 p-3">
      <div className="mb-1 flex items-center gap-1.5 text-brand-cyan">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em]">
          {kind}
        </span>
      </div>
      <p className="text-sm font-semibold text-ink">{title}</p>
      <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{body}</p>
    </div>
  );
}
