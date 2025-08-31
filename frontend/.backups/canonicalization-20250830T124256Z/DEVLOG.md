# DEVLOG — Implementation Progress

Source of truth: docs/status/implementation-progress.md
This DEVLOG mirrors the latest updates and next steps. For the full activity log and historical notes, see the canonical file above.

## Latest Update (2025-08-28)

What changed today to make Storybook a true “learn and try” hub — without broken routes:

- Storybook Docs Reader
  - Reads the repository’s /docs directly
  - Auto-generated left navigation from /docs/manifest.json
  - Safe Markdown rendering (headings, lists, links, code blocks)
  - Fallback curated nav if manifest isn’t present
- Global Help panel
  - One-line per-story parameter (repoDocPath) shows a bottom-right Help panel linking to the most relevant repo doc
  - Applied to docs and core component stories
- Swagger in Storybook
  - New “Docs/Swagger UI” story renders http://localhost:3002/api/openapi.json
  - CORS enabled on /api/openapi.json
  - Storybook controls to toggle docExpansion, deepLinking, tryItOutEnabled, etc.
- MSW consistency
  - All handlers now honor x-mock-delay and x-mock-error-rate headers with cookie defaults (auth, user, templates, generation, debug, localMemory)
- Network Playground (/dev/network)
  - Global latency/error presets
  - Per-request overrides
  - Batch runner (ASCII chart + CSV export)
- MDX 3 readiness
  - Aligned Next app (@next/mdx) and Storybook runtime with MDX v3
  - No story code changes required
- Testing & CI docs
  - Added Storybook Test Runner script (npm run storybook:test)
  - Local Dev Guide includes an end-to-end validation checklist
- Build-time docs manifest
  - Added scripts/generate-docs-manifest.mjs
  - Runs automatically before storybook dev/build to keep /docs nav fresh

## End-to-end Validation (Quick)

1. Run scripts

- npm run dev:mock # Next app on http://localhost:3002
- npm run storybook # Storybook on http://localhost:6006
- npm run storybook:test # Storybook interaction tests
- npm run test:coverage, npm run test:e2e

2. In Storybook

- Docs/Overview → orientation and quick links
- Docs/Project Docs Reader → navigate left nav (DEVLOG, EPICS, SYSTEM STATUS, Guides, API)
- Docs/Swagger UI → OpenAPI browsing (dev server required)
- Use Help panel links in stories (bottom-right)

3. API experiments

- Docs/API Playground (MSW, no server required) → POST /api/generate with TRIGGER\_\* inputs
- /dev/network in the app → set global latency/error, run batch, export CSV

## Next Steps (Epics)

Iteration 1 — Docs & Test Reliability

- Epic B: E2E Test Reliability
  - Align titles/selectors; add explicit waits for streaming (WS/SSE); stabilize “flaky” suite
  - Integrate MSW in Playwright for fully offline runs
- Epic J: Documentation & Storybook Coverage
  - Optional: generate a static /docs index page from the manifest to browse outside Storybook
- System Status
  - Refresh last-updated timestamp and ensure honest mock-first state; link Production Checklist and Implementation Progress

Iteration 2 — Observability & CI Signals

- Epic H: Observability & Operations
  - Emit a small CI status JSON (coverage, E2E, storybook:test)
  - Add a Storybook “Status Dashboard” story that reads the JSON and shows badges
- Epic A: Unit Testing Cleanups
  - Finalize AIService tests for fallback/streaming; standardize dataset/mocks
- Epic C: Mock-first Completeness
  - Expand WS mock events for generation progress; add controls to demo WS ok vs fallback

Optional Fast Wins

- Swagger fallback snapshot: /docs/api/openapi.snapshot.json as a backup when the app isn’t running; story falls back automatically
- Docs Reader polish: search filter for left nav; sort options
- Validation story: single page listing key commands and links

## Links

- Canonical DEVLOG: docs/status/implementation-progress.md
- Epics: docs/roadmap/EPICS.md
- System Status (Reality Check): docs/SYSTEM_STATUS.md
- Local Dev Guide: docs/status/LOCAL_DEV_GUIDE.md
- Testing & CI: docs/testing/TESTING.md
- REST API: docs/api/REST_API.md
