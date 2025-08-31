# 📘 Harvest.ai Operations Book

A single reference for running, testing, and deploying Harvest.ai across environments. It covers local development, mocked/runtime architecture, testing (unit/E2E/visual), Storybook, CI/CD, configuration and secrets, observability, and production operations.

Last updated: 2025-08-28

---

## 1) Scope and audience

- Audience: Developers, QA, DevOps, and on-call operators.
- Scope: Local (mock + real), staging, and production operations. Includes runbooks for common tasks.

---

## 2) Environments and modes

- Local (mock-first): NEXT_PUBLIC_ENABLE_MSW=1; MSW + WebSocket mocks enabled for a full, backend-free demo.
- Local (real services): Real Supabase/Redis/AI keys configured; MSW disabled.
- CI: Uses mock-first for reliability; builds, tests, and publishes artifacts.
- Production: Built Next.js app with real services and keys; MSW disabled; observability and security enforced.

---

## 3) Configuration overview

Primary environment variables (set in .env.local for local; platform secrets for staging/prod):

- Public frontend
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY

- Backend integrations
  - OPENAI_API_KEY (BYOK in UI for mock/demo; may be server-side key in prod)
  - ANTHROPIC_API_KEY
  - GOOGLE_AI_API_KEY
  - (Optional) REDIS_URL (for caching & rate-limiting)

- Mock/dev flags and auxiliary
  - NEXT_PUBLIC_ENABLE_MSW=1 (enable MSW in the browser during dev)
  - LOCAL_GATEWAY_URL (optional, for local-memory gateway proxy)
  - BYPASS_AUTH=1 (test/CI only; do not use in prod)

Security notes

- Never echo or commit secrets. Use secret stores for CI and production.
- Prefer server-to-server keys for billing-sensitive providers (OpenAI, Anthropic) and gate access with strict auth.

---

## 4) Local development

Install and run

```bash
# From repo root
cd frontend
npm ci
npx playwright install

# Mock-first runtime (MSW + WebSocket mocks)
npm run dev:mock    # http://localhost:3002
```

Key pages

- Home: http://localhost:3002/
- Demo (streaming + progress): http://localhost:3002/demo
- Docs index: http://localhost:3002/docs
- Swagger UI (OpenAPI): http://localhost:3002/docs/api

Mock internals

- MSW: Enabled with NEXT_PUBLIC_ENABLE_MSW=1; started in ClientLayoutWrapper (src/components/ClientLayoutWrapper.tsx).
- WebSocket mocks: src/mocks/ws.ts; used by connectGenerationProgress with graceful fallback.

Local (real services)

- Provide real Supabase URL/anon key and provider API keys.
- Disable MSW by not setting NEXT_PUBLIC_ENABLE_MSW (or set =0) and run `npm run dev`.

---

## 5) Storybook

Start Storybook

```bash
npm run storybook   # http://localhost:6006
```

MSW integration

- Initialized with msw-storybook-addon in .storybook/preview.ts.
- Handlers combined in src/mocks/handlers/index.ts (generation, debug, localMemory, auth, user, templates).

Interactive docs

- Docs/API Playground — try /api/generate with triggers:
  - TRIGGER_RATE_LIMIT → 429
  - TRIGGER_ERROR → 500
  - TRIGGER_CACHED → cached=true & near-zero processing_time
- Docs/Debug API — list endpoints and append logs
- Docs/Local Memory API — index and search text locally

Visual/a11y testing

- @storybook/addon-a11y configured; set to ‘todo’ by default.
- Chromatic (optional): Install and run with project token to perform visual regression testing.

```bash
# Example (requires token)
npx chromatic --project-token={{CHROMATIC_TOKEN}}
```

---

## 6) Testing strategy

Unit (Jest + RTL)

```bash
npm test
npm run test:coverage
```

- JSDOM environment with undici polyfills for fetch/Request/Response/Headers.
- Some route tests mock next/server and dynamically import route handlers after env, to avoid global Request/Next polyfills clashing.
- Jest ESM transforms enabled for msw and uncrypto.

E2E (Playwright)

```bash
npm run test:e2e          # headless
npm run test:e2e:headed   # watch in a real browser
npx playwright show-report
```

- Base URL: http://localhost:3002
- Starts mock dev server; can reuse running server locally.
- Tracing on first retry; HTML reports uploaded in CI.

Visual testing (options)

- Storybook + Chromatic recommended for component visual diffs.
- Playwright screenshots can be enabled (there are skipped visual tests for the Demo page; enable when stable).

Accessibility (options)

- Storybook a11y addon provides automated checks.
- Jest-axe or Playwright + aXe can be integrated for automated a11y in CI.

---

## 7) API overview (runtime)

Endpoints (representative; see /api/debug/endpoints and docs/api/REST_API.md)

- POST /api/generate — content generation via AIService; supports caching, rate-limits, usage logging.
- GET /api/generations, GET/DELETE /api/generate/:id — generation history and management.
- Developer utilities: /api/debug/endpoints, /api/debug/logs
- OpenAPI: /api/openapi.json (rendered in UI at /docs/api)
- Local-memory (degraded/gateway): /api/local-memory/index, /api/local-memory/search

Caching & rate limiting

- Optional Redis for cache and counters; TTL commonly set to 24h for generation responses.
- In local/mock or without Redis, logic is permissive: skip rate-limit and caching.

Usage logging (Supabase)

- AIService writes generation records to content_generations and usage events to usage_logs; ensure these tables exist in your Supabase project.

---

## 8) Observability & diagnostics

Logs & debug endpoints

- GET /api/debug/endpoints — inventory of route handlers
- GET/POST /api/debug/logs — in-memory log buffer (dev only)

Client/Server logs

- Use appropriate log levels (debug/info/warn/error). Avoid leaking secrets in logs.

Planned

- Sentry (errors) and PostHog (analytics). Wire DSNs/keys via environment.

Tracing/Artifacts

- Playwright traces & reports uploaded in CI.

---

## 9) CI/CD

Workflow: .github/workflows/ci.yml

- Type-check (tsc), lint, unit tests
- E2E (Playwright) against dev:mock
- Build Storybook (static) and upload artifacts

Extending CI

- Add coverage thresholds (Jest) and enforce.
- Add Chromatic for visual regressions.
- Gate merges on all green checks.

---

## 10) Deployment (staging/production)

Build & start

```bash
npm run build
npm run start
```

Hosting

- Vercel recommended for Next.js, or any Node-compatible runtime.
- Ensure environment variables set in the hosting platform (see Configuration overview).

Runtime flags

- Ensure NEXT_PUBLIC_ENABLE_MSW is not set in production.
- Disable BYPASS_AUTH.
- Provide real Supabase, Redis, and provider API keys.

Post-deploy smoke tests

- Open /docs/api and /api/openapi.json to verify docs are served.
- Validate /api/debug/endpoints (should be available if shipped) and key user flows.

---

## 11) Security & compliance

- Secrets: Managed via environment. Never log or echo secret values.
- CORS: Configure as needed at hosting/CDN layer.
- Rate limiting: Ensure Redis configured for protection in production.
- Data: Store minimal PII. Review Supabase RLS policies.
- Audit: Maintain logs; plan retention.

---

## 12) Runbooks

12.1 Local bring-up (mock)

```bash
npm ci
npx playwright install
npm run dev:mock  # http://localhost:3002
# In another terminal
npm run storybook # http://localhost:6006
```

12.2 Local bring-up (real)

```bash
# Prepare .env.local with Supabase + provider keys
npm run dev
```

12.3 E2E troubleshooting

- Port 3002 in use → stop existing dev server or update config; or reuse server.
- Intermittent flake → run headed with --debug; view trace report.

  12.4 Incident: generation errors in prod

- Check provider quota/billing and key validity (OpenAI/Anthropic/Gemini).
- Inspect error logs and add synthetic test with Playwright hitting /api/generate.
- Rate-limit spikes → verify Redis connectivity and counters.

  12.5 Cache issues

- Confirm Redis env vars present; inspect keys and TTLs.
- For emergency, temporarily bypass cache by disabling Redis vars (not recommended for long term).

  12.6 Usage logging gaps

- Confirm Supabase tables exist (content_generations, usage_logs, cache).
- Review service errors when writing rows.

  12.7 Visual regressions

- Promote Chromatic to CI with project token.
- Use Storybook stories as the golden source for design.

---

## 13) SLOs (targets)

- Availability: 99.9%
- p95 API latency: < 500ms
- Error rate: < 0.1%
- E2E suite duration: < 8 minutes

---

## 14) References

- Local Dev Guide: docs/status/LOCAL_DEV_GUIDE.md
- Testing (Consolidated): docs/testing/TESTING.md
- REST API: docs/api/REST_API.md
- Implementation Progress: docs/status/implementation-progress.md
- System Architecture: docs/architecture/SYSTEM_ARCHITECTURE.md

---

## 15) Real-time (WS/SSE) Hardening

Goal: Transition from mock-socket in dev to a robust, production-ready real-time channel using WebSockets or Server-Sent Events (SSE).

### A. Choose transport

- WebSocket: bi-directional; suited for interactive updates
- SSE: uni-directional (server→client); simpler infra and easier with proxies/CDNs

### B. Server implementation

- WebSocket
  - Provision a WS endpoint (e.g., /ws/generation)
  - Authenticate connection via short-lived token or cookie
  - Implement ping/pong with timeouts and backoff suggestions
  - Message types: connected, subscribed, progress, stream/chunk, complete, error, notification
- SSE
  - SSE endpoint (e.g., /api/generate/stream) using text/event-stream
  - Keep-alive comments to prevent timeouts
  - Same event taxonomy as WS (start/progress/complete/error)

### C. Client implementation steps

1. Feature flag

- `NEXT_PUBLIC_REALTIME_MODE="ws"|"sse"|"mock"`
- In dev:mock, auto-fallback to mock

2. Connection lifecycle

- Exponential backoff on disconnects
- Health checks: open within N seconds or fallback to simulated progress

3. Auth

- Supply auth token via query param or header on connect; refresh on 401/440

4. Resilience

- Debounce UI updates (large streams)
- Cap message sizes or chunk properly

### D. Observability

- Emit client metrics (connect time, reconnect count, bytes received, events/min)
- Server metrics (concurrent sessions, topic subscriptions)
- Alerts on abnormal closures, elevated reconnects

### E. Testing

- Unit test event parser and backoff
- E2E tests for progressive updates (mock server in test env)
- Load test channel (k6/artillery) to validate limits

### F. Rollout plan

- Start with SSE for simple stream of generate output
- Promote to WS if bi-directional control needed
- Retain mock path for demos and offline E2E

---

## 16) Change log (Ops Book)

- 2025-08-28: Real-time (WS/SSE) hardening section added; initial comprehensive draft (local + prod ops, MSW, Storybook, E2E, CI, runbooks)
