# API Operations Runbook

## Endpoints
- POST `/api/generate` – Transform content using BYOK
- GET `/api/format` – List available formats

## SLOs
- P95 latency: < 1500ms
- Error rate: < 2%

## On-call Procedures
1. Elevated Errors
   - Check provider status pages
   - Enable retries/backoff
   - Degrade gracefully (disable heavy formats)
2. Latency Spikes
   - Inspect cold start; warm critical routes
   - Enable cache for identical inputs
3. Incident Comms
   - Update Status Page (docs/status/SYSTEM_STATUS.md)
   - Postmortem in DEVLOG.md

## Secrets
- No server secrets for BYOK path
- CI scrubs logs; no request bodies retained
