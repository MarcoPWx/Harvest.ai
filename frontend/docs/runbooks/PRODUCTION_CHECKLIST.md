# 🚀 Production Checklist

Use this checklist before every release to staging/production. It consolidates configuration, quality gates, security, observability, and rollback preparation.

Last updated: 2025-08-28

---

## 1) Configuration & secrets

- [ ] NEXT_PUBLIC_ENABLE_MSW is NOT set (ensure mocks are disabled)
- [ ] BYPASS_AUTH is NOT set
- [ ] NEXT_PUBLIC_SUPABASE_URL set and valid
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY set and valid
- [ ] Provider keys present (as needed): OPENAI_API_KEY / ANTHROPIC_API_KEY / GOOGLE_AI_API_KEY
- [ ] Cache layer configured (if used) or acceptable fallback
- [ ] Allowed origins/CORS configured for your domains
- [ ] Security headers and CSP configured at host/CDN level

## 2) Build & runtime flags

- [ ] Production build succeeds: `npm run build`
- [ ] Server starts with correct port and flags
- [ ] MSW, mock-socket, and dev-only endpoints not enabled

## 3) Database & schema

- [ ] Supabase tables exist: content_generations, usage_logs, cache (if used), others
- [ ] Row Level Security (RLS) policies reviewed and enabled where required
- [ ] Migrations applied successfully

## 4) Rate limit & cache

- [ ] Cache layer reachable from environment (if used)
- [ ] Rate limit parameters match plan tiers (free/pro/team)
- [ ] Cache TTLs configured (e.g., 24h) and memory usage acceptable

## 5) Tests & quality gates

- [ ] Unit tests passing with coverage thresholds met: `npm test -- --ci --coverage`
- [ ] E2E tests green (mock or staging): `npx playwright test`
- [ ] Storybook builds without errors: `npm run build-storybook`
- [ ] Visual diffs approved (Chromatic) if enabled
- [ ] Accessibility checks reviewed (Storybook a11y, optional jest-axe)
- [ ] Lighthouse run for core pages (advisory budgets)

## 6) API contract & docs

- [ ] OpenAPI validates (lint or schema check)
- [ ] /docs/api renders properly with expected endpoints
- [ ] Major endpoints tested via cURL or Postman against staging

## 7) Observability & alerts

- [ ] Sentry DSN configured (if enabled)
- [ ] Analytics key configured (PostHog/Vercel Analytics)
- [ ] 4xx/5xx rates monitored with alert thresholds
- [ ] p95 latency monitored with alert thresholds

## 8) Security

- [ ] Secrets managed in platform (not hard-coded)
- [ ] No secrets printed in logs
- [ ] TLS certs/HTTPS enforced
- [ ] CORS policy correct
- [ ] Auth required for protected endpoints

## 9) Release process

- [ ] Tagged release created
- [ ] Changelog prepared
- [ ] Smoke tests checklist complete (below)

## 10) Smoke tests (post-deploy)

- [ ] Open /docs/api (Swagger UI) — loads spec
- [ ] Call /api/openapi.json — returns JSON
- [ ] Generate content via UI — success with non-empty result
- [ ] Check cached response (repeat same input) — responds faster/with cached flag
- [ ] Force rate limit edge case (test user) — 429 observed
- [ ] Local-memory endpoints index/search — OK or proxied to gateway

## 11) Rollback & backups

- [ ] Previous release ready for rollback (tag/archive)
- [ ] DB backups confirmed
- [ ] Clear rollback doc linked in runbooks

## 12) Communications

- [ ] Release notes posted (internal/external)
- [ ] Incident channels ready (Slack/Email)

---

## Appendix: cURL sanity checks

```bash
# OpenAPI
curl -s $APP_URL/api/openapi.json | jq .info.title

# Generate
curl -s -X POST $APP_URL/api/generate \
  -H 'Content-Type: application/json' \
  -d '{"input":"Hello world","format":"blog"}' | jq '.result | length'

# Local memory (if applicable)
curl -s -X POST $APP_URL/api/local-memory/index \
  -H 'Content-Type: application/json' \
  -d '{"namespace":"check","id":"k1","text":"harvest ai content"}' | jq .ok

curl -s -X POST $APP_URL/api/local-memory/search \
  -H 'Content-Type: application/json' \
  -d '{"namespace":"check","query":"harvest ai","topK":3}' | jq '.results | length'
```
