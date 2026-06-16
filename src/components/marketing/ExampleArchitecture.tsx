import { ChevronRight } from "lucide-react";

/**
 * A static, hand-built sample of what System Atlas produces from a one-paragraph
 * brief: a typed component diagram, the trade-off behind a choice, and a decision
 * record. Purely presentational - it sells the output to first-time visitors and
 * is not wired to the live model.
 */
export function ExampleArchitecture() {
  return (
    <div className="rounded-md border border-navy-700 bg-navy-900/50 p-4 sm:p-5">
      {/* Diagram */}
      <div className="flex items-stretch justify-center gap-1.5 overflow-x-auto pb-1 thin-scroll sm:gap-2">
        <Node code="CL" accent="text-sky-700" name="Client" tech="Web + mobile" />
        <Arrow />
        <Column>
          <Node
            code="GW"
            accent="text-indigo-700"
            name="API Gateway"
            tech="Routing + auth"
          />
          <Node
            code="RL"
            accent="text-fuchsia-700"
            name="Rate limiter"
            tech="Abuse control"
          />
        </Column>
        <Arrow />
        <Node
          code="API"
          accent="text-emerald-700"
          name="App service"
          tech="Stateless API"
        />
        <Arrow />
        <Column>
          <Node code="CA" accent="text-cyan-700" name="Cache" tech="Redis" />
          <Node
            code="DB"
            accent="text-blue-700"
            name="Primary store"
            tech="Postgres"
          />
        </Column>
      </div>

      {/* Output artifacts */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Artifact
          kind="Trade-off"
          title="Postgres vs DynamoDB"
          body="Postgres - relational data, transactions, and your scale fit a single primary with read replicas."
        />
        <Artifact
          kind="Decision"
          title="ADR-001 · Primary datastore"
          body="Use Postgres for the primary store; revisit if write volume outgrows a single node."
        />
      </div>
    </div>
  );
}

function Column({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col justify-center gap-2">{children}</div>;
}

function Node({
  code,
  accent,
  name,
  tech,
}: {
  code: string;
  accent: string;
  name: string;
  tech: string;
}) {
  return (
    <div className="flex w-36 shrink-0 items-center gap-2.5 rounded-md border border-navy-700 bg-navy-900 px-3 py-2 shadow-sm">
      <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-sm border border-navy-700 bg-paper-soft font-mono text-[10px] font-semibold ${accent}`}>
        {code}
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold text-ink">{name}</p>
        <p className="truncate text-[11px] text-slate-500">{tech}</p>
      </div>
    </div>
  );
}

function Arrow() {
  return (
    <div className="flex shrink-0 items-center text-slate-600">
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
