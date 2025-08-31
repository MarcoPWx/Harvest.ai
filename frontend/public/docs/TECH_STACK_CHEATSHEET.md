# Tech Stack Cheat Sheet (Harvest.ai)

Purpose: a one-page, interview-friendly view of the stack, tools, patterns, and trade-offs.

## Core

- Framework: Next.js 15 (App Router)
- Language: TypeScript 5
- UI: React 19
- Build: Turbopack (next build --turbopack)

## Docs & API

- In-app docs: @next/mdx + remark-gfm (MDX pages)
- API docs: swagger-ui-react at /docs/api (reads /api/openapi.json)

## Styling & UI Primitives

- Tailwind CSS (w/ postcss + autoprefixer)
- Radix UI (dialog, dropdown-menu, tabs, toast, tooltip)
- Icons: lucide-react
- Animations: framer-motion
- Class tools: clsx, tailwind-merge, class-variance-authority
- Command palette: cmdk
- Drawer/Sheet: vaul

## Forms & Validation

- react-hook-form + @hookform/resolvers
- zod (schemas)

## Data & Networking

- @tanstack/react-query
- fetch (standardized; polyfilled in tests)
- date-fns utilities

## Realtime (Mock-first)

- mock-socket (browser WS server for dev)
- Realtime module: src/lib/realtime/generation.ts (connectGenerationProgress)
- Fallback design: WS → SSE → polling (documented in Ops)

## Mocks & Fake Data

- msw (REST mocks)
- msw-storybook-addon (Storybook integration)
- @mswjs/data (in-memory mock DB)
- @faker-js/faker (fake content)

Dev mock controls (headers):

- x-mock-delay: add latency in ms (e.g., 500)
- x-mock-error-rate: inject 5xx with probability [0..1] (e.g., 0.3)
- Available in handlers via maybeInjectNetworkControls; tweak from /dev/tools UI.

## Charts

- recharts

## Auth/Payments/Email (Integrations available)

- Supabase: @supabase/supabase-js + auth helpers
- Stripe: stripe + @stripe/stripe-js
- Email: resend
- Tokens: jsonwebtoken; Hashing: bcryptjs

## Rate limiting & Cache

- @upstash/ratelimit + @upstash/redis

## Notifications

- sonner (standardized)

## Testing & Docs

- Jest + jest-environment-jsdom
- @testing-library/react + jest-dom + user-event
- Playwright + @playwright/test
- Storybook 9 + @storybook/nextjs-vite (+ a11y, docs, vitest addons)
- Chromatic (@chromatic-com/storybook; chromaui/action in CI)

## AI SDKs (Back-end integrations ready)

- openai, @anthropic-ai/sdk, @google/generative-ai

## CI & Ops

- GitHub Actions: type-check, lint, unit w/ coverage gates (≥60% statements/functions/lines; ≥50% branches), Playwright E2E (mock), Storybook build, optional Chromatic, optional smoke
- scripts/smoke.mjs: /, /docs/api, /api/openapi.json, optional POST /api/generate

Dev tools page (/dev/tools):

- API Playground for POST /api/generate with TRIGGER\_\* inputs
- Network controls: x-mock-delay, x-mock-error-rate headers
- SSE Viewer for GET /api/sse-demo

Network Playground (/dev/network):

- Set global defaults (cookies) for latency and error rate
- Override per-request headers
- Request timeline view across multiple endpoints

---

## Quick comparison tables (trade-offs)

### Supabase vs Keycloak

| Aspect         | Supabase                         | Keycloak                                     |
| -------------- | -------------------------------- | -------------------------------------------- |
| What it is     | BaaS (Postgres, Auth, Storage)   | OSS Identity & Access Management server      |
| Hosting        | Cloud (managed) or self-host     | Self-hosted (managed options exist)          |
| Auth features  | Email/OTP, OAuth, policies, RLS  | SSO, OAuth/OIDC, SAML, advanced IAM          |
| DB integration | Tight (Postgres + RLS)           | External DB; focuses on identity             |
| DX             | Fast to start for apps           | More config but powerful enterprise features |
| Best for       | Product MVPs, app-centric stacks | Enterprise SSO, federation, complex IAM      |

### Redis vs ioredis (client libraries)

| Aspect     | redis (official)             | ioredis                                    |
| ---------- | ---------------------------- | ------------------------------------------ |
| Maturity   | Official maintained by Redis | Community, battle-tested                   |
| Features   | Modern API, cluster support  | Rich features, Sentinel/Cluster, pipelines |
| TypeScript | Good typings                 | Good typings                               |
| Perf       | Excellent                    | Excellent                                  |
| Best for   | Official API preference      | Complex topologies, advanced usage         |

### ws vs socket.io

| Aspect       | ws                        | socket.io                                      |
| ------------ | ------------------------- | ---------------------------------------------- |
| What         | Minimal WebSocket library | Realtime framework on top of WS                |
| Transport    | Pure WebSocket            | WebSocket with fallback (long polling)         |
| Features     | Low-level control         | Rooms, acks, reconnection, namespace, adapters |
| Browser/Node | Client+server via WS      | Client+server with rich ecosystem              |
| Overhead     | Minimal                   | Higher (features + protocol)                   |
| Best for     | Simple, custom protocols  | Feature-rich realtime apps, easy reconnection  |

Notes:

- In this project, dev uses mock-socket (browser-side) for WS simulations. In production, choose ws for minimalism or socket.io for batteries-included features (fallbacks, reconnection, rooms).

---

## Design patterns & practices (quick)

- Mock-first: MSW (REST) + mock-socket (WS) for deterministic dev/tests
- Contract-first: Swagger UI + OpenAPI route
- Realtime progressive enhancement: WS primary; fallback to SSE→polling; timeouts/backoff
- Test pyramid: Jest unit → Playwright E2E; Storybook for components; optional Chromatic
- Env gating: NEXT_PUBLIC_ENABLE_MSW (mocks), NODE_ENV (dev-only tools)
- SoC: UI primitives (Radix/Tailwind) vs forms (RHF+zod) vs data (React Query) vs network (fetch)
- Schema validation at boundaries (zod)
- Typed event unions for streams
