# 🧭 Harvest.ai Local Development Guide

This guide walks you through running, testing, and exploring Harvest.ai locally with a mock-first setup. It covers app runtime with MSW and WebSocket mocks, Storybook with interactive API playgrounds, unit/E2E tests, Swagger UI, and common troubleshooting.

Last updated: 2025-08-28

---

## Prerequisites

- Node.js 18+ (Node 20 recommended)
- npm 9+
- Git
- Optional (macOS): watchman

Verify:

```bash
node -v
npm -v
```

---

## Install

```bash
# From repo root
cd frontend
npm ci

# Install Playwright browsers
npx playwright install
```

---

## Run the app with mocks (recommended)

The mock-first dev server runs on port 3002 and enables:

- MSW (Mock Service Worker) to intercept API calls
- WebSocket mocks for realtime progress/streaming

```bash
npm run dev:mock
# App: http://localhost:3002
```

What this does under the hood:

- Sets NEXT_PUBLIC_ENABLE_MSW=1, which:
  - Starts MSW in the browser (see src/components/ClientLayoutWrapper.tsx)
  - Starts WebSocket mocks via mock-socket (src/mocks/ws.ts)
- Allows the Demo page to show realtime progress and streaming without a backend

Key pages to try:

- Home: http://localhost:3002/
- Demo: http://localhost:3002/demo
- Docs index: http://localhost:3002/docs
- Swagger UI (OpenAPI): http://localhost:3002/docs/api (renders /api/openapi.json)
- Network Playground: http://localhost:3002/dev/network (global defaults, overrides, timeline)

---

## Storybook (interactive docs + API playgrounds)

```bash
npm run storybook
# Storybook: http://localhost:6006
```

Storybook uses MSW via msw-storybook-addon and our handlers in src/mocks/handlers. Useful docs:

- Docs/API Playground — Send requests to /api/generate. Triggers:
  - Include "TRIGGER_RATE_LIMIT" in input → returns 429
  - Include "TRIGGER_ERROR" in input → returns 500
  - Include "TRIGGER_CACHED" in input → metadata.cached = true with near-zero processing_time
- Docs/Debug API — List endpoints and append logs using:
  - GET /api/debug/endpoints
  - GET/POST /api/debug/logs
- Docs/Local Memory API — Index and search text locally using:
  - POST /api/local-memory/index
  - POST /api/local-memory/search

New: live transport demo (WS → SSE fallback)

- Page: Docs/Tech Stack & API Playground → "Live WS → SSE Fallback (Real SSE)"
- Requires the app dev server running (npm run dev:mock)
- SSE endpoint: http://localhost:3002/api/sse-demo (CORS enabled for Storybook)
- You can configure WS URL and SSE URL fields, and optionally simulate WS failure

Note: Storybook mocks are in-memory and separate from the Next.js app runtime.

---

## Unit tests (Jest)

```bash
# All unit tests
npm test

# With coverage
npm run test:coverage

# Specific test file
npm test -- src/app/api/generate/__tests__/cache.test.ts
```

Details:

- JSDOM environment is used.
- fetch/Request/Response polyfilled via undici in jest.setup.js.
- Some route tests mock next/server and dynamically import the route after setting env and mocks.
- ESM support for select node_modules configured via transformIgnorePatterns in jest.config.js (msw, @upstash/redis, uncrypto).

---

## End-to-End tests (Playwright)

By default, Playwright spins up the dev mock server on port 3002.

```bash
# All E2E (headless)
npm run test:e2e

# Run in headed mode (watch in a browser)
npm run test:e2e:headed

# Only a specific suite
npx playwright test tests/e2e/local-memory.spec.ts --project=chromium --headed

# Debug mode
npx playwright test --debug

# Show last HTML report
npx playwright show-report
```

Notes:

- Base URL: http://localhost:3002
- Reuse server locally; on CI, fresh server is started.
- If port 3002 is already in use, stop the process or run your own server with npm run dev:mock and rerun tests.

---

## Swagger UI

Open the embedded Swagger UI to browse the API spec served from /api/openapi.json:

- http://localhost:3002/docs/api

---

## Realtime: SSE demo route

We provide a Server-Sent Events (SSE) demo endpoint for local development and fallbacks.

- Endpoint: GET /api/sse-demo
- Behavior: emits JSON-encoded events: `{ type: 'hello' }`, `{ type: 'progress', value }`, `{ type: 'complete' }`
- CORS: enabled; can be consumed from Storybook (different origin) or curl

Quick usage:

```bash
# Curl will show an event stream (press Ctrl+C to stop)
curl -N http://localhost:3002/api/sse-demo
```

Browser console example:

```js
const es = new EventSource("http://localhost:3002/api/sse-demo");
es.onmessage = (e) => console.log("SSE:", e.data);
```

---

## MSW header-based controls (dev-only)

You can inject latency and errors into mock handlers using request headers. This helps validate UX under adverse conditions.

Headers recognized:

- x-mock-delay: milliseconds to delay (e.g., 500)
- x-mock-error-rate: probability in [0..1] (e.g., 0.25)

Examples:

```bash
# Add 1s latency
curl -s -X POST http://localhost:3002/api/generate \
  -H 'Content-Type: application/json' \
  -H 'x-mock-delay: 1000' \
  -d '{"input":"Hello","format":"blog"}' | jq

# 30% chance to inject a 500 error
curl -s -X POST http://localhost:3002/api/generate \
  -H 'Content-Type: application/json' \
  -H 'x-mock-error-rate: 0.3' \
  -d '{"input":"Hello","format":"blog"}' | jq
```

UI controls:

- Open /dev/tools → use x-mock-delay and x-mock-error-rate fields in the API Playground.

---

## Useful cURL examples

Local-Memory (degraded fallback):

```bash
# Index text
curl -s -X POST http://localhost:3002/api/local-memory/index \
  -H 'Content-Type: application/json' \
  -d '{"namespace":"notes","id":"n1","text":"Harvest.ai makes content transformation easy"}' | jq

# Search
curl -s -X POST http://localhost:3002/api/local-memory/search \
  -H 'Content-Type: application/json' \
  -d '{"namespace":"notes","query":"content transformation","topK":5}' | jq
```

Debug & discovery:

```bash
# List endpoints
curl -s http://localhost:3002/api/debug/endpoints | jq

# Append a log entry
curl -s -X POST http://localhost:3002/api/debug/logs \
  -H 'Content-Type: application/json' \
  -d '{"level":"info","message":"hello","meta":{"env":"dev"}}' | jq

# Get logs
curl -s http://localhost:3002/api/debug/logs | jq
```

OpenAPI:

```bash
curl -s http://localhost:3002/api/openapi.json | head -n 40
```

Generate API (mock mode):

```bash
# Success
curl -s -X POST http://localhost:3002/api/generate \
  -H 'Content-Type: application/json' \
  -d '{"input":"Hello world","format":"blog"}' | jq

# Triggers
curl -s -X POST http://localhost:3002/api/generate \
  -H 'Content-Type: application/json' \
  -d '{"input":"TRIGGER_RATE_LIMIT","format":"blog"}' | jq
```

---

## Where mocks live

- App runtime (Next.js):
  - ClientLayoutWrapper starts MSW and WebSocket mocks when NEXT_PUBLIC_ENABLE_MSW=1.
  - WebSocket mocks: src/mocks/ws.ts (src/mocks/websocket.ts is deprecated as a thin wrapper).
  - Realtime client: src/lib/realtime/generation.ts (tries WS, falls back to simulated progress).
  - SSE demo route: src/app/api/sse-demo/route.ts (for fallback demonstrations).
- Storybook runtime:
  - msw-storybook-addon initializes MSW for stories in .storybook/preview.ts.
  - Handlers are aggregated in src/mocks/handlers/index.ts and include:
    - generation.ts, debug.ts, localMemory.ts, auth.ts, user.ts, templates.ts

Add a new mock handler:

1. Create a file in src/mocks/handlers/yourFeature.ts
2. Export `yourFeatureHandlers = [ http.get(...), http.post(...), ... ]`
3. Add to src/mocks/handlers/index.ts:
   ```ts
   import { yourFeatureHandlers } from "./yourFeature";
   export const handlers = [...existing, ...yourFeatureHandlers];
   ```

---

## Ports

- App (mock mode): 3002
- Storybook: 6006

---

## CI overview

File: .github/workflows/ci.yml

- Type check, lint, unit tests
- Playwright E2E (mock mode)
- Build Storybook
- Artifacts: playwright-report, storybook-static

---

## Troubleshooting

Port 3002 already in use:

```bash
lsof -i :3002
kill -9 <PID>
```

Workspace root warning (Next.js):

- Next can warn about multiple lockfiles and inferred workspace root.
- This is harmless locally. To silence, see Next docs for `outputFileTracingRoot`.

Playwright server failed to start:

- Ensure no other process is running on 3002.
- Alternatively, run `npm run dev:mock` in another terminal and re-run tests.

Jest ESM parse errors:

- We allow transforms for a few ESM packages (`msw`, `@upstash/redis`, `uncrypto`) in `jest.config.js`.
- If you add new ESM-only packages, extend `transformIgnorePatterns` similarly.

`Request is not defined` in unit tests:

- Route tests either mock `next/server` and/or rely on undici polyfills in `jest.setup.js`.
- Keep `jest.setup.js` intact for fetch/Request/Response/Headers support.

WebSocket mocks not emitting:

- Confirm `NEXT_PUBLIC_ENABLE_MSW=1` (dev:mock script sets this) so `ClientLayoutWrapper` starts mocks.

Slow/flaky E2E locally:

- Use `--headed` to visualize and add explicit waits.
- Enable tracing on retry (default in config). View with `npx playwright show-report`.

---

## Security & secrets

- Do not hardcode secrets or print them to logs.
- The app uses BYOK for OpenAI in the UI; in dev:mock this is optional.
- If you add a secret in commands, use environment variables and never echo them.

---

## Quick command cheat sheet

```bash
# Install
npm ci && npx playwright install

# Run app with mocks
npm run dev:mock  # http://localhost:3002

# Storybook
npm run storybook # http://localhost:6006

# Unit tests
npm test

# E2E tests
npm run test:e2e:headed

# Swagger UI
open http://localhost:3002/docs/api
```

---

If anything is unclear or you need additional runbooks (e.g., for a gateway, Redis, or Supabase), let us know, and we’ll extend this guide.
