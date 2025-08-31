# 🚀 Harvest.ai Epics and Tasks

> Updated: 2025-08-30
> Status: Living document (source of truth for planning)

This document defines the product and engineering epics for Harvest.ai and breaks them down into actionable tasks with acceptance criteria, dependencies, and cross-links to documentation and tests.

Legend:

- [ ] Not started
- [~] In progress
- [x] Done

---

### In-Progress Summary

- Epic A: Stabilize Unit Tests — [~] Fix AIService tests to align with fallback/error handling

## Epic A: Stabilize Unit Tests

- Goal: All unit tests pass reliably on CI with clear, fast feedback.
- Owner: Frontend
- Priority: P0

Tasks:

1. [~] Fix AIService tests to align with current fallback and error handling
   - Criteria: service.test.ts passes; mocks reflect current OpenAI/Anthropic/Gemini flows
   - Notes: Supabase client calls should be mocked for cache/usage updates
   - Links: src/lib/ai/service.ts, src/lib/ai/**tests**/service.test.ts
2. [x] Navigation tests stable for desktop/mobile interactions
   - Criteria: No role/name query failures; mobile menu a11y verified
   - Links: src/components/layout/**tests**/Navigation.test.tsx
3. [x] Layout and EcosystemWidget tests use robust selectors and suppress animation warnings
   - Criteria: Tests pass without React unknown prop warnings
   - Links: src/components/**tests**/Layout.test.tsx, src/components/ecosystem/**tests**/EcosystemWidget.test.tsx
4. [ ] Add coverage thresholds and collect coverage in CI
   - Criteria: Failing build if coverage < thresholds; text/HTML report artifact

---

## Epic B: E2E Test Reliability (Playwright)

- Goal: Critical user flows validated across Chromium/Firefox/WebKit.
- Owner: Frontend/QA
- Priority: P0

Tasks:

1. [ ] Align titles/labels and routes with current UI (e.g., project name, page headings)
   - Criteria: Home, Demo, Format, Docs pass basic smoke tests
2. [ ] Fix navigation flows, timeouts, and flakiness with proper waits
   - Criteria: Zero flaky retries locally; retry-based CI strategy in place
3. [ ] Add visual snapshot baselines and per-project thresholds
   - Criteria: Snapshots stored and reviewed; CI job compares on PRs

---

## Epic C: Mock-First Backend with MSW

- Goal: Frontend fully functional without real backend; deterministic demos.
- Owner: Frontend
- Priority: P0

Tasks:

1. [x] Seed mock DB and create handlers for auth, generation, templates, users
   - Links: src/mocks/db/schema.ts, src/mocks/handlers/
2. [x] Start worker in dev via client wrapper; opt-in via NEXT_PUBLIC_ENABLE_MSW
   - Links: src/components/ClientLayoutWrapper.tsx
3. [ ] Add WebSocket mock server and events for generation progress/notifications
   - Criteria: UI reflects streaming/progress in demo mode
4. [ ] Integrate MSW into Playwright tests via setup/teardown
   - Criteria: E2E tests run fully offline

---

## Epic D: Supabase Backend Foundations

- Goal: Minimal real backend for auth, content, and usage tracking.
- Owner: Backend
- Priority: P1

Tasks:

1. [ ] Implement server/client Supabase clients and env validation
   - Links: src/lib/supabase/
2. [ ] Create API routes for generate, history, templates backed by Supabase
   - Links: src/app/api/
3. [ ] Auth: email/password + OAuth providers (Google, GitHub)
   - Criteria: Protected routes for dashboard/settings
4. [ ] Migrations and types in repo; apply on CI
   - Links: supabase/, scripts

---

## Epic E: AI Service Robustness

- Goal: Provider-agnostic service with fallback, usage tracking, and caching.
- Owner: AI
- Priority: P1

Tasks:

1. [ ] Provider adapters (OpenAI/Anthropic/Gemini) with uniform interfaces
2. [ ] Fallback chain and error classification (rate limit, key errors)
3. [ ] Cost and token tracking; pricing table versioning
4. [ ] Cache strategy (request hash + TTL) with Supabase or Redis (later)

---

## Epic F: Authentication & User Management

- Goal: Full auth flow, profile, preferences, and session management.
- Owner: Backend/Frontend
- Priority: P1

Tasks:

1. [ ] Login/Signup pages in app router
2. [ ] Session management, SSR hydration, and client hooks
3. [ ] Profile and preferences endpoints and UI

---

## Epic G: Billing & Subscriptions

- Goal: Stripe integration for Free/Pro/Team plans.
- Owner: Backend
- Priority: P2

Tasks:

1. [ ] Stripe products/prices config and webhook handling
2. [ ] Customer portal and payment methods UI
3. [ ] Usage-based limits enforced at API

---

## Epic H: Observability & Operations

- Goal: Error tracking, logs, metrics, and CI/CD quality gates.
- Owner: DevOps
- Priority: P2

Tasks:

1. [ ] Sentry integration and source maps
2. [ ] Basic metrics (latency, error rate) surfaced in status page
3. [ ] CI gates: type-check, lint, unit, e2e, coverage, build

---

## Epic I: Accessibility & Performance

- Goal: WCAG 2.1 AA, keyboard nav, and fast core vitals.
- Owner: Frontend
- Priority: P2

Tasks:

1. [ ] Axe checks in unit/E2E where feasible
2. [ ] Keyboard nav coverage in tests for nav/dialogs
3. [ ] Lighthouse performance budgets in CI (advisory)

---

## Epic J: Documentation & Storybook Coverage

- Goal: Source-of-truth docs and rich Storybook stories for all components.
- Owner: Docs/Frontend
- Priority: P2

Tasks:

1. [x] Expand Storybook to cover all key components (controls + a11y)
   - Added help panel parameter to stories (repoDocPath) so each story links to relevant docs
   - Added Swagger UI story; Project Docs Reader with left nav and Markdown rendering
2. [ ] Keep DOCUMENTATION_INDEX.md in sync with scripts and routes
3. [x] API docs snapshot from runtime contracts and handlers
   - /api/openapi.json exposed and CORS-enabled; embedded in Storybook Swagger story

---

## Epic K: S2S, SSE, Observability & Testing (Execution Plan)

- Goal: Track the 100-task execution plan via epics E-101..E-118.
- Owner: Platform/AI/Frontend
- Priority: P0-P2 mixed

Tasks (mapped to epics):

- E-101 S2S Gateway Hardening — SSE contract, validation, retries, timeouts, breakers, idempotency
- E-102 SSE Client & UX — shared hook, token/sec, cancel/undo, cached banner
- E-103 Conversations & Threads — persist, paginate, RBAC, export
- E-104 Caching & Idempotency — Redis, TTLs, hit/miss metrics
- E-105 Provider Integrations — OpenAI/Anthropic/Gemini adapters, fallback chain, costs
- E-106 Moderation & Compliance — input/output moderation, PII tags, redaction
- E-107 Rate Limiting & Quotas — Redis limits per IP/user/key, plan quotas
- E-108 Auth & RBAC — thread auth, roles, API key scopes
- E-109 Billing & Usage — Stripe plans, usage dashboards, upgrade flows
- E-110 Observability & Ops — logs, metrics, tracing, dashboards, alerts
- E-111 Security Hardening — CORS allowlist, CSP, secret hygiene
- E-112 Performance & Scale — load tests, keep-alive tuning, backpressure
- E-113 Testing — Playwright smokes (streaming/errors/metrics), unit
- E-114 Docs & Storybook — SSE guide, Observability doc, API reference, E2E status story
- E-115 DevEx & Tooling — smoke scripts, linting, hooks
- E-116 Deployment & Environments — staging, seeds, flags, env docs
- E-117 Analytics & Feedback — NPS/CSAT, action instrumentation
- E-118 Compliance & Data Lifecycle — retention, export, deletion

Links:

- Command Center → Epics Manager: ?path=/docs/command-center-epics-manager--docs
- S2S Streaming: ?path=/story/command-center-s2s-streaming-threads--generate-sse-json
- SSE Client Guide: ?path=/docs/docs-sse-client-guide--docs
- Observability Playground: ?path=/docs/docs-observability-playground--docs

---

## Backlog (Unsorted)

- I18n and RTL support
- Offline support and caching strategies
- SDKs (TS/Node) and client packages
- Admin dashboard and feature flags
- Template marketplace (sharing, rating)

---

## Cross-cutting Requirements

- Security: rate limiters, input validation, secure headers
- Privacy: PII handling, data retention, deletion
- Testing: deterministic tests, stable IDs/selectors, seed data
- Tooling: precommit hooks, formatting, linting, type strictness

---

## Links

- Master Doc: /DOCUMENTATION_INDEX.md
- Status: /docs/status/implementation-progress.md
- Testing: /docs/testing/TESTING.md
- Mock-First Strategy: /docs/MOCK_FIRST_STRATEGY.md
