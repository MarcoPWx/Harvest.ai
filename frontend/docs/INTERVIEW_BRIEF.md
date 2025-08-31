# Harvest.ai — Interview Brief

This brief explains Harvest.ai crisply for interviews: what it is, who it serves, how it’s built, and why the technical choices matter. It links product value to architectural decisions, testing strategy, and tooling so you can speak to both outcomes and implementation.

## 0) At‑a‑glance

- What: A mock‑first content transformation app and reference architecture that turns raw input into polished formats (blog, summary, email, quiz) with transparent, realtime feedback.
- Who: Product engineers, designers, and platform teams who want rapid UI/UX iteration, contract‑first APIs, and demo‑quality docs without waiting on a live backend.
- How: Next.js (App Router) + React + TypeScript with MSW (REST) and a mock WebSocket to simulate end‑to‑end flows; Storybook for interactive docs; Jest/Playwright for tests; Swagger UI for contract visibility.
- Why: Faster iteration, fewer integration surprises, and higher confidence via mocks, contracts, and layered tests.

## 1) Value proposition (what and why)

- Transform raw content into polished formats (blog, summary, email, quiz) with clear realtime feedback.
- Mock‑first development lets UI/UX and API contracts evolve in parallel, enabling rapid iteration before the backend is finalized.
- Consistent developer experience: in‑app docs (MDX), Swagger UI, Storybook demos, unit + E2E tests, optional visual regression, and a post‑deploy smoke script for confidence.

## 2) Primary user journeys

- Create content: Paste text → choose format → Generate → see realtime progress/stream → receive structured result with metadata.
- Explore API: Navigate to /docs/api (Swagger UI) and inspect /api/openapi.json.
- Validate behavior with mocks: Use MSW triggers (TRIGGER_RATE_LIMIT, TRIGGER_ERROR, TRIGGER_CACHED) to simulate errors and caching in E2E and manual testing.
- Operate and release: CI gates (type-check, lint, unit coverage, E2E), optional Chromatic, and scripts/smoke.mjs post-deploy checks.

## 3) Architecture overview

- Next.js App Router (React + TypeScript) application.
- In-app documentation via MDX pages (@next/mdx) and Swagger UI for API docs.
- Mock-first runtime: MSW (REST) + mock-socket (WebSocket) toggled by NEXT_PUBLIC_ENABLE_MSW=1 in dev:mock.
- Realtime design: WebSocket primary; documented fallbacks to SSE → polling; client timeouts and backoff.
- Testing: Jest + RTL (unit), Playwright (E2E), Storybook 9 for component docs, optional Chromatic.
- CI: Node 20 pipeline with coverage gates, E2E, Storybook build, optional Chromatic publish, and smoke script.

## 4) Technologies, small libraries, and how they connect

Below is a complete inventory of dependencies and devDependencies, grouped by purpose, with where/how they are used.

### Core framework and language

- next (15.x): App framework; App Router under src/app. MDX support via next.config.mjs.
- react (19.x), react-dom (19.x): UI runtime and rendering.
- typescript (5.x): Typed application and tests.
- Node 20 (CI/runtime): GitHub Actions and local dev.

### Documentation and API documentation

- @next/mdx: Adds MDX page support to Next.js.
- remark-gfm: GitHub Flavored Markdown for MDX (tables, strikethrough, etc.).
- swagger-ui-react: Renders interactive API docs at /docs/api using /api/openapi.json.

### Styling, layout, and UI primitives

- tailwindcss: Utility-first styling.
- postcss, autoprefixer: CSS processing and vendor prefixing.
- @radix-ui/react-dialog, @radix-ui/react-dropdown-menu, @radix-ui/react-tabs, @radix-ui/react-toast, @radix-ui/react-tooltip: Accessible headless UI primitives.
- lucide-react: Icon set.
- framer-motion: Animations and transitions.
- clsx: Conditional class name composition.
- tailwind-merge: Deduplicates/conflict-resolves Tailwind classes.
- class-variance-authority: Variant-driven styling; co-locates variant logic with components.
- cmdk: Command palette UI.
- vaul: Drawer/sheet component for overlays.

### Forms and validation

- react-hook-form: High-performance forms.
- @hookform/resolvers: Bridges RHF with schema validation.
- zod: Schema validation for form data and boundary types.

### Data fetching, caching, and networking

- @tanstack/react-query: Client-side cache and async state for fetches.
- fetch (standardized; polyfilled in tests): HTTP requests.
- date-fns: Date utilities for formatting/manipulation.

### Realtime and streaming (mock-first)

- mock-socket: In-browser WebSocket server for dev/mock mode (progress events, stream chunks, completion).
- Custom realtime module: src/lib/realtime/generation.ts exposes connectGenerationProgress, parsing WS messages and simulating when WS isn’t available.

### Mocking and fake data

- msw (2.x): REST mocking layer for dev and tests.
- msw-storybook-addon: Integrates MSW into Storybook stories for interactive API demos.
- @mswjs/data: In-memory data modeling for realistic mock responses.
- @faker-js/faker: Generates fake data/streaming chunks for demos.

### Charts and visualization

- recharts: Data visualizations when needed in the UI.

### Authentication, security, and integration SDKs (available/optional)

- @supabase/supabase-js, @supabase/auth-helpers-nextjs, @supabase/auth-helpers-react, @supabase/ssr: Supabase auth/session integration points.
- stripe, @stripe/stripe-js: Payments integration (server + client).
- resend: Transactional email API SDK.
- jsonwebtoken: Token handling in server routes/utilities.
- bcryptjs: Password hashing utility (server-side use cases).

### Rate limiting and caching

- In-memory (dev) or DB-backed (optional).

### Notifications/toasts

- sonner: Toast/notification library (standardized).

### Testing (unit, E2E, visual, a11y)

- jest, jest-environment-jsdom: Unit tests in a browser-like environment.
- @testing-library/react, @testing-library/jest-dom, @testing-library/user-event: Component testing and DOM matchers.
- Playwright, @playwright/test: Cross-browser E2E; runs against dev:mock server; artifacts and traces.
- Storybook 9, @storybook/nextjs-vite: Component isolation and MDX stories with Vite-based builder.
- @storybook/addon-a11y: Accessibility checks within stories.
- @storybook/addon-docs, @storybook/addon-vitest: Storybook docs/testing integrations.
- @chromatic-com/storybook + chromaui/action@v1 (in CI): Optional visual regression; runs when CHROMATIC_PROJECT_TOKEN is set.
- vitest, @vitest/browser, @vitest/coverage-v8: Present for browser-based test experiment/option; primary unit tests run on Jest today.

### Build, scripts, and CI

- Scripts: dev, dev:mock (NEXT_PUBLIC_ENABLE_MSW=1 on :3002), build (turbopack), start, lint, type-check, unit coverage, e2e variants, storybook dev/build, storybook test, smoke, smoke:try.
- Turbopack: next build --turbopack for faster builds.
- GitHub Actions: Node 20 setup, npm ci, type-check, lint, unit with coverage gates, Playwright E2E (mock), Storybook build artifact, optional Chromatic publish, and post-deploy smoke step.
- scripts/smoke.mjs: Hits /, /docs/api, /api/openapi.json, and optionally POST /api/generate.

### AI provider SDKs (available for backend integrations)

- openai, @anthropic-ai/sdk, @google/generative-ai: Provider SDKs to support multi-provider backends; available for server routes/functions.

## 5) Key connections in the codebase

- MSW + WS mocks initialization: src/components/ClientLayoutWrapper.tsx
  - Starts MSW worker and WebSocket mocks automatically when NEXT_PUBLIC_ENABLE_MSW=1 or in development.
- WebSocket realtime client: src/lib/realtime/generation.ts
  - connectGenerationProgress handles WS messages and simulates progress/stream when WS is unavailable.
- WebSocket mock server: src/mocks/ws.ts (dev/mock mode)
  - Emits deterministic progress events and streaming text chunks; used by Demo and stories.
- Demo page (realtime UX): src/app/demo/page.tsx
  - Wires connectGenerationProgress to progress bar and streaming output UI while a generate request runs.
- E2E tests: tests/e2e/\* (e.g., tests/e2e/demo.spec.ts)
  - Validates navigation, responsiveness, dark mode, and realtime streaming progress in mock mode.
- Swagger UI route: /docs/api (React component) ← reads /api/openapi.json.
- In-app docs (MDX): src/app/docs/\* (Overview, Testing & CI, API Usage, Production Checklist, Ops Summary).
- Dev tools (local only): src/app/dev/tools/page.tsx
  - Shows MSW status, quick links, and an API playground for POST /api/generate with TRIGGER\_\* inputs.
- GitHub Actions CI: .github/workflows/ci.yml
  - Type-check, lint, unit + coverage (artifact), Playwright E2E (mock), Storybook build (artifact), optional Chromatic, optional smoke.

## 6) Design patterns and practices

- Mock-first development
  - MSW (REST) and mock-socket (WS) enable deterministic, realistic dev and tests before a backend exists.
- Contract-first exposure
  - Swagger UI + /api/openapi.json keeps API expectations visible, versioned, and testable alongside UI work.
- Realtime progressive enhancement
  - WS primary; documented fallback to SSE → polling. Client has timeouts/backoff to avoid hangs and storms.
- Test pyramid with visual/docs layer
  - Jest + RTL for unit; Playwright for E2E against mocks; Storybook for component isolation + a11y; optional Chromatic for visuals.
- Feature gating via environment
  - NEXT_PUBLIC_ENABLE_MSW toggles mocks in the browser; NODE_ENV drives dev-only tooling visibility.
- Separation of concerns
  - UI primitives (Radix/Tailwind) vs. form logic (RHF + zod) vs. data/cache (React Query) vs. network (fetch) for swappable layers.
- Schema validation at boundaries
  - zod enforces runtime safety for inputs/outputs.
- Typed event unions for realtime
  - Discriminated unions for GenerationEvent make stream handling explicit and type-safe.

## 7) Trade-offs and rationale

- Next.js 15 + React 19
  - Modern features and DX; some ecosystem lag risk mitigated by conventional patterns and tests.
- Mock-first vs. staging
  - Mocks increase speed/determinism; still plan staging tests against a real backend before production.
- HTTP client standardization
  - Standardized on fetch to reduce surface area and bundle size.
- Toast library standardization
  - Standardized on sonner; removed react-hot-toast to avoid duplication.
- Multiple WS mock variants
  - Consolidate on src/mocks/ws.ts to avoid confusion.
- Chromatic optionality
  - Keeps contributor friction low; can be made required with PR checks in mature repos.

## 8) How I built it (interview narrative)

- Defined UX and API contracts up front via Demo page + Swagger UI to align stakeholders early.
- Implemented mock-first infrastructure (MSW for REST, mock-socket for WS) to validate error and cache paths with TRIGGER\_\* inputs.
- Built a resilient realtime client (connectGenerationProgress) with typed events, timeouts, and stream UI that feels fast.
- Established robust testing: Jest + RTL for unit; Playwright across browsers; Storybook 9 with MSW addon; optional Chromatic for visual diffs.
- Added CI quality gates: type-check, lint, unit coverage thresholds (≥60% statements/functions/lines, ≥50% branches), E2E (mock), Storybook build; artifacts and optional Chromatic publish.
- Added a post-deploy smoke script to validate critical surfaces (/, /docs/api, /api/openapi.json, optional POST /api/generate).
- Wrote in-app MDX docs (API Usage, Production Checklist, Ops Summary) and a dev-only tools page to accelerate onboarding.

## 9) Ready-to-use talking points

- User value: Faster content production with transparent feedback and robust error handling.
- Engineering value: Mock-first + contract-first; fast feedback loops with E2E and Storybook; CI coverage gates and smoke checks.
- Realtime: Progressive enhancement and resilience (timeouts, backoff, fallback strategies).
- Future work: Provider abstraction, stronger observability (traces/metrics), required Chromatic, a11y expansion, staging E2E.
