# Beta Production Readiness

This document summarizes what it means for Harvest.ai to be Beta-ready, with two tracks: Mock-Beta (no real backends) and True Beta (real auth, persistence, AI providers).

## Current Snapshot (2025-08-30)

- Local unit/integration tests: green (per docs, 229/229)
- Storybook: builds + test runner configured
- E2E: Playwright uses dev:mock (MSW) and local server
- CI: GitHub Actions pipeline covers type-check, lint, tests, E2E, Storybook, and artifacts

## Definition of Done — Mock-Beta

- All unit/integration tests pass
- E2E (mock mode) passes core flows (Chromium at minimum)
- Core journeys render without console errors
- Clear “Mock Beta” labeling (no real backends)
- Basic status/docs page describes mock mode

Nice to have

- Visual snapshot baselines for primary views
- A11y smoke checks (axe) clean for core pages

## Definition of Done — True Beta

Must have

- Authentication (Supabase Auth) for login/signup/sessions
- Persistence (Supabase Postgres) for user content and BYOK tables
- Real AI provider integration(s) with basic fallback and error handling
- Usage gating/limits or basic payments to prevent abuse
- Production monitoring: Sentry, uptime check, basic analytics

Should have

- Cost tracking and token usage per request
- Health endpoint with smoke checks
- Clear user-facing error states and retries

## CI Gates (recommended)

- TypeScript noEmit must pass
- ESLint: no errors (Prettier formatting enforced via plugin and pre-commit)
- Unit/Integration: all passing with coverage threshold (e.g., 80%)
- E2E (mock mode): green on Chromium (optionally Firefox/WebKit)
- Storybook: build + interaction runner pass
- Commit messages: Conventional Commits enforced (PR job) and husky commit-msg

## Code Quality & Conventions

- Linting: ESLint + plugin:prettier/recommended
- Formatting: Prettier with lint-staged on pre-commit
- Git hooks: Husky (pre-commit + commit-msg)
- Commits: Commitizen for conventional messages; commitlint enforced by CI

## Environment & Config

- Local mock: NEXT_PUBLIC_ENABLE_MSW=1
- Production (when ready): OPENAI_API_KEY and Supabase env
- Vercel (when used): configure project root to `frontend` in the Vercel dashboard; vercel.json is optional unless custom routing/build is needed

## References

- frontend/docs/roadmap/BETA_ROADMAP.md
- frontend/docs/BETA_LAUNCH_CHECKLIST.md
- docs/runbooks/PRODUCTION_READINESS_RUNBOOK.md
- docs/runbooks/DEPLOYMENT_RUNBOOK.md
