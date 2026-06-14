# System Atlas

**Live demo: [system-atlas-x.vercel.app](https://system-atlas-x.vercel.app)**

A guided architecture-planning workspace. System Atlas helps engineering teams turn
product requirements into system architecture, trade-off decisions, and
implementation-ready design docs.

![System Atlas canvas](docs/screenshot.png)

## What it is

System Atlas is built around **guided architecture thinking**. You answer a structured
brief, the app proposes a starting architecture, and every component on the canvas
carries real reasoning (purpose, technology, data owned, scaling, failure behavior).
Two engines then work over that model:

- **Architecture Review** flags the pieces teams most often forget.
- **Tradeoff Engine** recommends which technology to pick, explains why, and lets you
  swap a component for an alternative in one click.

## Features

- **Architecture Brief** - a structured intake (goals, users, scale, data sensitivity,
  availability, integrations, compliance).
- **Skeleton generation** - turns the brief into a starting architecture you refine on a
  drag-and-drop canvas.
- **Component knowledge** - every node carries primer-sourced reasoning (purpose, when to
  use, trade-offs) plus editable metadata.
- **Architecture Review** - a rule-based linter that flags missing pieces (no rate limiter
  on a public API, a queue with no dead-letter queue, sensitive data with no audit log).
- **Tradeoff Engine** - given the brief, recommends a technology per decision area
  (Postgres vs Mongo vs DynamoDB, Redis vs CDN cache, Queue vs Kafka, ...), with scored
  comparison matrices and blunt rule-of-thumb cards. Recommendations are framed as
  "suggested fit based on your brief," with a confidence level.
- **Swap parts** - replace any component with an alternative from its inspector; database
  swaps even retype relational vs non-relational, keeping connections intact.
- **AI assist (free, optional)** - upload a wireframe/sketch and let Google Gemini review
  your design. Suggestions flow into the Review and Tradeoffs tabs, and a chat lets you talk
  through tradeoffs (save any reply as a note or ADR). Bring your own free Gemini key
  ([get one here](https://aistudio.google.com/app/apikey)); it is stored only in your browser
  and called directly, so there is still no backend.
- **Notes** - add your own recommendations by hand, right alongside the rule findings and AI
  suggestions in the Review tab.
- **Decision records (ADRs)** - capture architecture choices, generated in one click from
  a trade-off recommendation.
- **Templates** - load industry patterns (three-tier, microservices, event-driven,
  serverless, read-heavy, rate-limited public API) or product use cases (SaaS, document
  processing, real-time chat, e-commerce, AI/RAG).
- **Export** - JSON (round-trips), a Markdown design doc, and a PNG of the canvas.

## How the brief becomes a skeleton

It is a deterministic two-step pipeline (no AI):

1. **Derive context** - keyword detection over the brief's free-text fields produces flags
   like `hasFileUploads`, `hasPayments`, `hasExternalUsers`, `isHighTraffic`, plus the
   structured `dataSensitivity` and `availability`.
2. **Map to a graph** - those flags add the right components in tiered columns and wire
   them up. For example, public users add an API gateway and rate limiter; file uploads add
   object storage, a queue, a worker, and a dead-letter queue; high sensitivity adds an
   audit log and authorization boundary.

The same context flags drive the review linter and the tradeoff engine, so the brief is a
single source of truth across skeleton, review, and recommendations.

## Using the app

1. **Design Wizard** (or pick a template) to create a project.
2. Fill the **Brief**, then **Generate skeleton**.
3. On the **Canvas**, drag components from the palette, connect them, and click any node to
   edit its reasoning in the inspector. Use **Swap technology** to try alternatives.
4. Run **Review** to catch gaps and **Tradeoffs** to compare technologies; turn any
   recommendation into a **Decision** (ADR) with one click.
5. Open **Assist** to upload your wireframe and let Gemini review the design; its
   suggestions land in Review and Tradeoffs, and the chat answers follow-ups. Add your own
   notes in Review too. (Connect a free Gemini key from the dashboard or the Assist tab.)
6. **Export** to JSON, Markdown, or PNG. Re-import JSON from the dashboard.

## Tech stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS (light, premium-minimal theme)
- [React Flow](https://reactflow.dev/) (`@xyflow/react`) for the canvas
- Zustand (with `persist`) for state - **local-first, stored in the browser**
- `html-to-image` for PNG export, `lucide-react` for icons
- Google **Gemini** for the optional AI assistant (bring-your-own free key, called
  directly from the browser - no server proxy)

Project data lives in `localStorage` - the app is fully usable with **no backend, database,
or auth**. The only optional layer is the **AI assistant**, which works the moment you paste
a free Gemini key; the key never leaves your browser, so there is still no server of ours in
the loop. The data model is shaped so a backend can be added later without reshaping data.

### Cost

**No required spend.** Hosting is Vercel's free Hobby tier, project data is local, and the
AI assistant uses each user's own **free** Gemini key (Google AI Studio free tier, which
includes image input). Heavy AI use can hit the free-tier rate limit - the app surfaces a
"slow down" message rather than ever incurring a charge; you would only pay if you enabled
billing on your own Google key. Nothing here bills you or your users by default.

## Local development

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build / type check
```

## Deploy

Stock Next.js App Router app. It deploys to **Vercel** with default settings and **no
environment variables** (local-first persistence). The Gemini key is supplied per-user in
the browser, so it is never an environment variable.

## Roadmap

- **AI assistant** - shipped: wireframe upload, design review into Review/Tradeoffs, and a
  context-aware chat (Gemini, bring-your-own key). Next: stream responses and per-node
  inline suggestions.
- Accounts, a database, and shareable links so projects sync across devices and teams
- Mermaid and PDF export
- Real-time collaboration and version history

## Project structure

```
src/
  app/                 # routes: dashboard (/) and editor (/project/[id]); icon.svg favicon
  components/          # brief, canvas, review, tradeoffs, decisions, export, ai, ui
  lib/
    types.ts           # all entity types (React Flow-native nodes/edges)
    store.ts           # zustand + localStorage persistence (projects, suggestions, key)
    analysis.ts        # deriveContext: brief -> normalized flags (pure)
    catalog.ts         # component library + knowledge (drives palette + inspector)
    templates.ts       # starter reference architectures
    skeleton.ts        # brief -> starter graph (pure)
    linter.ts          # Architecture Review rules (pure)
    tradeoffs.ts       # technology options + scores + rules of thumb
    decisionRules.ts   # decision rules + recommendation engine (pure)
    ai/                # gemini.ts (browser client) + assist.ts (summarize/analyze/chat)
    export/            # markdown / png / json exporters
```

See [docs/PRODUCT_PLAN.md](docs/PRODUCT_PLAN.md) for the full product vision.

---

Built by [Abhi Tiwari](https://abhitiwari.dev), with Claude (Anthropic) as a contributor.
