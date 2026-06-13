# System Atlas

A guided architecture-planning workspace. System Atlas helps engineering teams turn
product requirements into system architecture, trade-off decisions, and
implementation-ready design docs.

It is not a blank diagramming tool. The value is in **guided architecture thinking**:

- **Architecture Brief** - a structured intake that captures goals, users, scale, data
  sensitivity, availability needs, and integrations.
- **Skeleton generation** - turns the brief into a starting architecture you refine on a
  drag-and-drop canvas.
- **Component knowledge** - every node carries primer-sourced reasoning (purpose, when to
  use, trade-offs) and editable metadata (technology, data owned, scaling, failure mode).
- **Architecture Review** - a rule-based linter that flags missing pieces (no rate limiter
  on a public API, a queue with no dead-letter queue, sensitive data with no audit log).
- **Tradeoff Engine** - given the brief, recommends *which* technology to pick and *why*
  (Postgres vs Mongo vs DynamoDB, Redis vs CDN cache, Queue vs Kafka, ...), with scored
  comparison matrices and blunt rule-of-thumb cards. Recommendations frame "suggested fit
  based on your brief," never "objectively best."
- **Decision records (ADRs)** - capture architecture choices, generated in one click from a
  trade-off recommendation.
- **Export** - JSON (round-trips), Markdown design doc, and PNG of the canvas.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS
- [React Flow](https://reactflow.dev/) (`@xyflow/react`) for the canvas
- Zustand (with `persist`) for state - **local-only, stored in the browser**
- `html-to-image` for PNG export
- `lucide-react` for icons

There is **no backend, database, or auth** in this MVP. All project data lives in
`localStorage`. The data model is shaped so a backend can be added later without
reshaping data.

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build / type check
```

## Deploy

Stock Next.js App Router app - deploy to **Vercel** with default settings. No
environment variables or external services are required (local-only persistence).

## Project structure

```
src/
  app/                 # routes: dashboard (/) and editor (/project/[id])
  components/          # brief, canvas, review, tradeoffs, decisions, export, ui
  lib/
    types.ts           # all entity types (React Flow-native nodes/edges)
    store.ts           # zustand + localStorage persistence
    catalog.ts         # component library + knowledge (drives palette + inspector)
    templates.ts       # starter reference architectures
    skeleton.ts        # brief -> starter graph (pure)
    linter.ts          # Architecture Review rules (pure)
    tradeoffs.ts       # technology options + scores
    decisionRules.ts   # decision rules + recommendation engine (pure)
    export/            # markdown / png / json exporters
```

See [docs/PRODUCT_PLAN.md](docs/PRODUCT_PLAN.md) for the full product vision.
