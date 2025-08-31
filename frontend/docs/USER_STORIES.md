# User Stories (Source of Truth)

> This document collects top-level user stories and acceptance criteria across core flows. Each story links to Storybook specs and playgrounds where applicable.

## Mock/Test Status Legend

- 🟢 **Mocked & Testable**: Has MSW handlers and/or interactive playground
- 🟡 **Partially Mocked**: Some functionality exists
- 🔴 **Conceptual Only**: Described but not implemented
- 🧪 **Has Tests**: Unit/integration/E2E tests exist

Legend for links:

- Security Playground: ?path=/docs/docs-security-playground--docs
- Security & Trust Plan: ?path=/docs/docs-security-trust--docs
- TDD Master Plan: ?path=/docs/docs-tdd-master-plan--docs
- API Playground: ?path=/docs/docs-api-playground--docs
- Epics Manager: ?path=/docs/command-center-epics-manager--docs
- Test Coverage: ?path=/docs/command-center-test-coverage--docs
- Observability Playground: ?path=/docs/docs-observability-playground--docs

## A. Onboarding & First Run

1. First visit — Mock Mode default 🟢

- As a first-time visitor, Mock Mode is enabled by default so I can safely try the app without keys.
- AC: Mock banner visible; generate works with deterministic mocks; no network to providers.
- Status: **Mocked via MSW handlers/generation.ts**
- Links: API Playground, TDD Master Plan

2. Learn BYOK model 🟢

- As a privacy-conscious user, I can learn that BYOK is optional, session-only, and never stored.
- AC: Security explainer card; link to Security & Trust.
- Status: **Interactive in Security Playground**
- Links: Security & Trust Plan

3. Start Storybook to learn

- As a developer, I can launch Storybook and find Expert Hub to understand the system.
- AC: Expert Hub visible and linked from Top-Level Overview; checklist to complete onboarding.
- Links: ?path=/docs/docs-🎓-expert-hub---master-harvest.ai--docs

4. System Status reality check

- As a contributor, I can read System Status to see what actually works.
- AC: System Status page with working/partial/missing; last updated timestamp.
- Links: ?path=/docs/docs-system-status--docs

5. Run tests locally

- As a dev, I can run unit tests and see coverage in Storybook.
- AC: npm test passes; Coverage page reads coverage-summary.json.
- Links: Test Coverage

6. Explore Generate Playground

- As a user, I can try the generate flow with sample inputs.
- AC: Inputs for format, text; response panel; triggers to simulate errors.
- Links: API Playground

7. Panic Mode quickstart

- As a user in a rush, I can use Panic Mode with minimal inputs.
- AC: Panic template accessible; short form; visible response in <10s with mocks.
- Links: Playgrounds

8. Accessibility baseline

- As a user with assistive tech, I can navigate primary flows.
- AC: Landmarks/labels; tab order; visible focus; no critical a11y violations in core flows.
- Links: TDD Master Plan

## B. Content Generation

9. Generate blog from text 🟢🧪

- As a user, I can input text and get a blog post.
- AC: Deterministic mock; output panel; copy button.
- Status: **Mocked in handlers/generation.ts, tested in **tests\*\*\*\*
- Links: API Playground

10. Generate summary from URL

- As a user, I can paste a URL and get a summary (mocked).
- AC: Validates URL; shows loading; returns summary.
- Links: API Playground

11. Change tone and length

- As a user, I can choose tone and length before generating.
- AC: Form controls affect payload; reflected in response metadata.
- Links: API Playground

12. Show token/latency metrics (mocked)

- As a user, I can see approximate tokens used and latency.
- AC: Metrics displayed; marked as approximate in Mock Mode.
- Links: Observability Playground

13. Retry with same input (cache demo)

- As a user, I can re-run the same input and see a cache hit indicator (mocked).
- AC: x-cache: hit on second request; banner in UI.
- Links: API Playground

14. Export result (copy/download)

- As a user, I can copy or download the result.
- AC: Copy success toast; plain text download.
- Links: API Playground

15. Error recovery suggestions

- As a user, I see clear actions when an error occurs.
- AC: Error banner; suggested fixes; no raw stack traces.
- Links: API Playground

16. Streaming preview (SSE mock)

- As a user, I can see partial output in a stream.
- AC: SSE demo shows token batches; finalization event.
- Links: Playgrounds (SSE)

17. Cancel generation mid-stream (mock)

- As a user, I can cancel and the stream stops.
- AC: Cancel button; stream closes; partial kept.
- Links: Playgrounds (SSE)

18. Provider selection (mock)

- As a user, I can choose a provider and see it reflected in response.
- AC: Provider select; metadata shows chosen provider.
- Links: API Playground

## C. Panic / Flow / Power Modes

19. Panic: minimum inputs

- As a user under stress, I can get a useful draft with 2 fields.
- AC: Panic form; output in <10s mocks; concise copy.
- Links: Playgrounds

20. Flow: guided steps

- As a creator, I can follow a wizard to improve quality.
- AC: Stepper; validation; state persists during session.
- Links: Playgrounds

21. Power: advanced controls

- As a power user, I can set model, temperature, max tokens.
- AC: Advanced section; payload matches; saved in session only.
- Links: API Playground

22. Templates gallery

- As a user, I can pick from example templates (mock).
- AC: Gallery grid; filter by use case; preview.
- Links: Storybook Components

23. Save my configuration (session)

- As a user, options persist during the tab session.
- AC: In-memory or sessionStorage; cleared on Panic Wipe.
- Links: Security Playground

## D. BYOK (Session-only) & Trust

24. Opt-in BYOK 🟢

- As a user, I must opt-in to enter a key; default is mock.
- AC: Toggle/panel disabled by default.
- Status: **Interactive demo in Security Playground**
- Links: Security Playground

25. Memory-only key

- As a user, my key is kept only in memory and not persisted.
- AC: Never written to storage; masked input; no echo.
- Links: Security Playground

26. Auto-wipe after inactivity

- As a user, my key auto-wipes after 15 minutes.
- AC: Timer banner; key cleared; actions disabled.
- Links: Security Playground

27. Panic Wipe

- As a user, I can wipe the key and session in one click.
- AC: Wipes key/state; confirmation toast.
- Links: Security Playground

28. Sanitized request preview

- As a user, I can preview the sanitized headers sent.
- AC: X-Provider-Key redacted; provider shown.
- Links: Security Playground

29. Local-only mode (explainer)

- As a power user, I can route through a local proxy so servers never see my key.
- AC: Toggle in UI (explainer-only now); instructions.
- Links: Security Playground, Security & Trust Plan

30. No-store responses

- As a user, sensitive API responses are not cached.
- AC: Cache-Control: no-store headers on /api.
- Links: Security & Trust Plan

31. Transparent data flow

- As a user, I can see a diagram of the data path.
- AC: Data-flow card; explicit what’s stored.
- Links: Security Playground

## E. Errors, Limits, Stability

32. Rate limit guidance

- As a user, I see clear guidance when rate-limited.
- AC: 429 mock; retry-after banner; suggested wait.
- Links: API Playground

33. Payload size guardrails

- As a user, large inputs show an informative error.
- AC: 413 mock; tips to reduce size; link to docs.
- Links: API Playground

34. Network timeouts

- As a user, I see a timeout message and can retry.
- AC: Timeout mock; Retry button.
- Links: Playgrounds

35. Resilient selectors (E2E)

- As a dev, I can rely on stable data-testid selectors.
- AC: Centralized selectors; failing tests fixed.
- Links: TDD Master Plan

36. Deterministic mocks for demos

- As a PM, I can demo predefined outputs.
- AC: Fixtures and handlers; switches in UI.
- Links: API Playground

## F. Observability & Metrics (Dev)

37. Show request id

- As a user, I see a request id for support.
- AC: ID in response panel; copy button.
- Links: Observability Playground

38. Local /api/metrics JSON

- As a dev, I can GET /api/metrics for counters.
- AC: JSON with req totals and p95 (mocked).
- Links: Observability Playground

39. Test coverage dashboard

- As a dev, I see local coverage in Storybook.
- AC: Coverage page reads JSON report.
- Links: Test Coverage

40. E2E summary

- As a dev, I see pass/fail/skipped counts.
- AC: Test Coverage story parses Playwright summary.
- Links: Test Coverage

## G. Export, Share, Docs

41. Copy/export outputs

- As a user, I can copy or download results.
- AC: Clipboard works; file saved.
- Links: API Playground

42. View OpenAPI spec

- As a dev, I can view /api/openapi.json and Swagger.
- AC: Route returns spec; docs page embeds.
- Links: API Playground

43. Find docs in one place

- As a stakeholder, I can view Top-Level Overview linking to all key docs.
- AC: Overview story with links to Expert Hub, TDD, Security, Epics, Coverage, Playgrounds, User/S2S Stories.
- Links: Top-Level Overview

## H. Internationalization & Accessibility

44. Locale-aware UI (mock)

- As a user, I can select a locale and see formatted dates and numbers.
- AC: Locale switch; formatting changes; placeholders in place of translations.
- Links: Storybook Components

45. Keyboard-only navigation

- As a user, I can navigate the core flows using keyboard only.
- AC: All actions accessible via keyboard; visible focus.
- Links: TDD Master Plan

46. Reduced motion support

- As a user, animations reduce when I set reduced motion.
- AC: CSS respects prefers-reduced-motion.
- Links: Storybook Components

## I. Governance & Safety (Mock)

47. Content policy guardrails

- As a user, I get a clear message if content violates policy (mock).
- AC: Policy violation banner; link to policy.
- Links: Security & Trust Plan

48. PII preflight (local-only)

- As a user, I’m warned if obvious secrets are detected before sending.
- AC: Local regex check with opt to proceed/cancel.
- Links: Security Playground

49. Auditability without exposure

- As an operator, I can correlate requests without seeing secrets.
- AC: One-way fingerprint shown in logs (optional) and never displayed to users.
- Links: Security & Trust Plan, Observability Playground

50. Honest limits disclosure

- As a user, I can see what the prototype can and cannot do.
- AC: System Status linked from key places; no misleading claims.
- Links: System Status

## J. Stretch / Future

51. Team collaboration (mock) 🟡

- As a team user, I can see how collaboration would work (read-only mock).
- AC: Mock screen with placeholders; clear "future" label.
- Status: **Has handlers/templates.ts team endpoints but no UI**
- Links: Harvest Overview

52. Template marketplace (mock)

- As a user, I can browse community templates (mock UI only).
- AC: List and filters; no backend.
- Links: Storybook Components

53. Cost transparency (mock)

- As a user, I can see estimated costs per request by provider.
- AC: Cost breakdown panel (mocked values).
- Links: Observability Playground

54. Compare providers (mock)

- As a user, I can compare outputs from two providers side-by-side.
- AC: Dual panel; mock outputs.
- Links: API Playground

55. Save / Restore session (opt-in)

- As a user, I can export/import a local session to a file for continuity.
- AC: Download/upload JSON; never sent to server.
- Links: Security Playground
