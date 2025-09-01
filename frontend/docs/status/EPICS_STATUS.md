# Delivery Epics and Status

This document tracks high‑level testing/documentation epics and their current status, with owners and next actions.

## Epic: E2E “All Green” Baseline

- Goal: All Playwright Chromium specs pass reliably in NEXT_PUBLIC_E2E + MSW mode
- Status: Near complete
  - Green: unit (all), smoke (S2S JSON + /format JSON), demo core
  - In-flight: format.spec.ts (CTA enablement/outputs), generate-mock-flows.spec.ts (readiness under dev server)
- Next actions:
  - Finalize Format CTA enablement (controlled input; done) and re-run
  - Ensure mock flows wait for hydration + SW; done; promote to CI
  - Add CI jobs for smoke and full suites
- Owner: QA/Eng

## Epic: Provider Adapter (Real)

- Goal: Pluggable provider with timeout/abort/retry & telemetry; env-driven on server
- Status: Unit‑complete (OurProvider + tests)
- Next actions: Opt‑in E2E against staging provider; MSW parity handlers
- Owner: Backend/Platform

## Epic: Learning Lab (Storybook)

- Goal: Curated, learning‑centric docs with journeys and vocabulary
- Status: Delivered (Overview, Headlines, Definitions, Curated Journeys, S2S Journeys, Extended 20+50 flows, Docs Home, SSE Panel)
- Next actions: Link from app home; add a11y quick checks in Storybook
- Owner: DX/Docs

## Epic: S2S API Quality Gates

- Goal: JSON/SSE route coverage for success, errors, caching, rate‑limit, headers
- Status: Smoke green; unit tests added for triggers & caching
- Next actions: Add SSE reader test (node environment) with fake stream; add batch endpoint checks
- Owner: Backend/QA

## Epic: CI Test Matrix

- Goal: Fast signal (smoke) + full (nightly) across Chromium, and selective Firefox/WebKit
- Status: Planned
- Next actions: Add scripts test:smoke:e2e and test:all:fast; wire GitHub Actions
- Owner: DevInfra

## Epic: Accessibility and Mobile

- Goal: A11y smoke (critical only) and mobile viewport basic checks
- Status: Demo basic checks in place
- Next actions: Axe-core in Storybook for key screens; add Playwright a11y smoke
- Owner: Frontend
