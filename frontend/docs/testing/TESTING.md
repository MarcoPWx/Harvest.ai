# 🧪 Testing & CI (Consolidated)

Single source of truth for how we test Harvest.ai locally and in CI.

## Overview

Layers:

- Unit: Jest + React Testing Library
- E2E: Playwright (runs against dev:mock) with HTML report and trace-on-retry
- Visual (optional): Storybook + Chromatic
- Accessibility: Storybook a11y; jest-axe as optional layer

### Current Status (2025-08-30)

- All Jest unit and integration tests are passing locally: 229/229 green
- Framer Motion DOM prop warnings eliminated in tests via mock that strips motion-only props
- DemoTourButton test flakiness removed by making visibility immediate under NODE_ENV=test
- ApiClient tests stabilized by:
  - mocking AbortController abort behaviour (clearing long timers and setting error name="AbortError")
  - using short-timeout, no-retry client instances where appropriate
  - resolving fetch from globalThis.fetch inside the client to ensure mocks are respected
- External dependencies are mocked; tests run without external services
- Known benign console warning: a storage event-driven setState in DemoTourButton can log an act(...) notice in tests; UI and assertions are stable. Can be silenced by wrapping dispatch in act in tests if desired.

Tooling:

- API mocking: MSW (REST) with handlers; mock-socket for WebSocket
- Realtime: WS primary; fallback via SSE (demo route) → polling
- Docs: In-app MDX, Swagger UI (/docs/api), Storybook

## Commands

Unit:

```bash
npm test                  # unit
npm run test:coverage     # unit with coverage
```

E2E (Playwright):

```bash
# install browsers once
npx playwright install

npm run test:e2e          # headless
npm run test:e2e:headed   # headed
npx playwright show-report
```

Storybook & visual:

```bash
npm run storybook          # http://localhost:6006
npm run build-storybook
npm run storybook:test     # run Storybook Test Runner (interaction tests)
# optional Chromatic (requires secret)
```

## CI

- Node 20; npm ci
- Type-check, lint, unit with coverage (HTML report artifact)
- Playwright E2E (mock mode)
- Storybook build (artifact)
- Optional Chromatic publish
- Optional smoke script (scripts/smoke.mjs)

Coverage thresholds:

- Statements/Functions/Lines ≥ 60%
- Branches ≥ 50%

## MSW mock controls (dev-only)

- Headers (per request):
  - x-mock-delay: milliseconds of extra latency
  - x-mock-error-rate: probability [0..1] of injected 500
- Cookies (global defaults):
  - harvest_mock_delay
  - harvest_mock_error_rate

Precedence: headers override cookies. Handlers apply both via `maybeInjectNetworkControls`.

## Dev tools

- /dev/tools (dev-only):
  - API Playground for POST /api/generate (supports TRIGGER\_\* inputs)
  - SSE Viewer (GET /api/sse-demo)
  - WebSocket Client (mock)
- /dev/network (dev-only):
  - Set global defaults (cookies), override per request (headers)
  - Quick endpoint buttons + request timeline
  - Profile presets: No Errors, Office WiFi, Good 3G, Flaky WiFi
  - Batch Runner: run multiple endpoints, ASCII timing bars, CSV export
- Storybook: includes Swagger UI story (Docs/Swagger UI). Requires `npm run dev:mock` so http://localhost:3002/api/openapi.json is reachable. CORS enabled.

## Realtime testing

- WS mock server starts in dev:mock; client handles typed events
- SSE demo route: GET /api/sse-demo (CORS-enabled) for fallback/stream testing

## Playwright tips

- Base URL: http://localhost:3002 (dev:mock)
- Use stable selectors (role, data-testid) rather than text
- Add waits for async/streaming; use trace-on-retry
- Prefer mock triggers over time-based assertions

## Troubleshooting

- If MSW not active: ensure NEXT_PUBLIC_ENABLE_MSW=1 (dev:mock does this)
- Use `npx playwright show-report` to inspect failures
- For unit test fetch/Request/Response/Headers: undici polyfills in jest setup

## References

- In-app MDX: /docs/testing
- Swagger UI: /docs/api
- SSE demo: /api/sse-demo
- Storybook: http://localhost:6006
