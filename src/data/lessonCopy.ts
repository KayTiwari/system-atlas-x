import type { Tier } from "@/lib/tiers";

/**
 * Generic per-tier teaching used to build a scenario's guided lessons. Each
 * scenario reuses this copy and layers its own emphasis on top, so we get a
 * paced, course-like lesson per architecture layer without hand-authoring every
 * stage for every scenario.
 */
export type TierLesson = {
  /** Short label used in the stepper and stage title. */
  label: string;
  /** Why this layer exists and what it does for the system. */
  why: string;
  /** A question to think through before adding components. */
  question: string;
  /** A reflection / check prompt to reinforce the lesson. */
  check: string;
};

export const TIER_LESSONS: Record<Tier, TierLesson> = {
  "Edge / Entry": {
    label: "Entry & Edge",
    why: "Every request enters somewhere. The edge is where traffic first arrives and where you authenticate, route, rate-limit, and cache before anything reaches your services. Getting this layer right protects everything behind it.",
    question:
      "What receives traffic first - a client, a CDN, a load balancer, or an API gateway? And what does that entry point need to do before passing the request on?",
    check:
      "Can you name, in order, every hop a request takes from the user to your first service?",
  },
  Services: {
    label: "Services & Logic",
    why: "Services hold your business logic. Keeping them stateless lets you run many copies behind a load balancer and scale horizontally - state lives in data stores, not in the service.",
    question:
      "Which service owns this behavior, and what is the single responsibility of each one? Is any state hiding in a service that should live in a data store?",
    check:
      "If you ran ten copies of this service, would any request break? If so, where is the hidden state?",
  },
  Data: {
    why: "Data is the source of truth - the part you cannot afford to get wrong. The read/write pattern here drives every later decision: indexing, caching, replication, and backups.",
    label: "Data & State",
    question:
      "What is the source of truth, and is this workload read-heavy or write-heavy? Which derived stores (cache, search, warehouse) are rebuildable from it?",
    check:
      "Which single store is authoritative, and could you rebuild every other store from it?",
  },
  "Async / Events": {
    label: "Async & Events",
    why: "Not all work needs to finish before you answer the user. Queues and event buses move slow or unreliable work off the request path, smoothing spikes and decoupling producers from consumers.",
    question:
      "Which work can happen after the response? Who consumes each queue or event, and are those consumers idempotent?",
    check:
      "For each async hop: what happens if the same message is delivered twice?",
  },
  Reliability: {
    label: "Reliability",
    why: "Everything fails eventually. This layer is about designing the failure path - retries with limits, dead-letter queues for poison messages, idempotency so retries are safe, and backups you have actually tested.",
    question:
      "What happens when each dependency is slow or down? Where could a retry double-apply an effect, and what catches a message that keeps failing?",
    check:
      "Pick the riskiest step. Is it safe to retry, and where does a permanently failing job end up?",
  },
  Security: {
    label: "Security & Access",
    why: "Security decides who can do what. Authentication establishes identity, authorization decides permissions, and sensitive actions need an audit trail. This layer is where data leaks are prevented or created.",
    question:
      "Who is allowed to do this, and is that checked on every privileged action - not just at login? Where do secrets live, and what gets audited?",
    check:
      "Could one user reach another user's data? What stops them, and is the attempt recorded?",
  },
  Observability: {
    label: "Observability",
    why: "You cannot operate what you cannot see. Logs, metrics, and traces - tied together by a correlation ID - let you follow one request across services and alert on real user-facing symptoms.",
    question:
      "When this breaks at 3am, what do you look at first? Can you follow a single request across every service?",
    check:
      "Name the three signals you would alert on, and how you would trace one slow request end to end.",
  },
  Operations: {
    label: "Operations",
    why: "This is the platform the system runs on: how it ships, where it runs, how config and feature flags change behavior without a redeploy. It is what keeps day-two operation sane.",
    question:
      "How do changes reach production safely, and how do you turn a feature off fast if it misbehaves?",
    check:
      "How would you roll back a bad deploy, and toggle a risky feature without shipping code?",
  },
  External: {
    label: "External Providers",
    why: "Some capabilities are better bought than built - payments, notifications, third-party APIs. These live outside your control, so you wrap them with timeouts, retries, and a fallback for when they are down.",
    question:
      "Which third parties does this depend on, and what is your plan for when one is slow, rate-limited, or offline?",
    check:
      "If this provider went down for an hour, what would your users experience?",
  },
};
