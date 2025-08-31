# S2S Stories (Server-to-Server)

> This document tracks server-side and gateway/backend user stories for developers, operators, and API consumers. These are mock-first currently.

Legend for links:

- S2S SSE Streaming: ?path=/story/command-center-s2s-streaming-threads--generate-sse-json
- Observability Playground: ?path=/docs/docs-observability-playground--docs
- Security & Trust Plan: ?path=/docs/docs-security-trust--docs
- API Playground: ?path=/docs/docs-api-playground--docs

## A. API Routes & Contracts

1. POST /api/generate basic

- As an API client, I can POST JSON and get a content response.
- AC: Request with input/format; returns content+metadata.
- Links: API Playground

2. GET /api/generate/:id

- As a client, I can fetch a prior generation by ID (mock).
- AC: Returns cached result or 404.
- Links: API Playground

3. DELETE /api/generate/:id

- As a client, I can delete a generation (mock).
- AC: Returns 204 on success; 404 if not found.
- Links: API Playground

4. POST /api/generate/stream (SSE)

- As a client, I can request streaming output via Accept: text/event-stream.
- AC: Returns event stream; token batches; done event.
- Links: S2S SSE Streaming

5. GET /api/generations (list)

- As a client, I can list my generations (mock).
- AC: Paginated JSON; sorted by created_at desc.
- Links: API Playground

6. GET /api/metrics

- As an operator, I can fetch basic counters and p95.
- AC: Returns JSON with request totals, stream counts, p95.
- Links: Observability Playground

7. GET /api/health

- As a monitor, I can check if the API is up.
- AC: Returns 200 OK with timestamp.
- Links: API Playground

8. GET /api/openapi.json

- As a dev, I can fetch the OpenAPI spec.
- AC: Returns valid OpenAPI 3.0 JSON.
- Links: API Playground

9. OPTIONS preflight for CORS

- As a browser client, I can send preflight requests.
- AC: Returns allowed origins, methods, headers.
- Links: Security & Trust Plan

10. Rate limit headers

- As a client, I see X-RateLimit-\* headers.
- AC: Limit, remaining, reset headers on responses.
- Links: Observability Playground

## B. Caching & Idempotency

11. Cache by request hash

- As the gateway, I cache responses by input hash.
- AC: Same input → cache hit; different → miss.
- Links: API Playground

12. X-Cache response header

- As a client, I see X-Cache: hit/miss.
- AC: Header indicates cache status.
- Links: API Playground

13. Idempotency key support

- As a client, I can send X-Idempotency-Key to prevent duplicates.
- AC: Same key returns same response within TTL.
- Links: API Playground

14. Cache TTL configurable

- As an operator, I can set cache TTL via env.
- AC: CACHE_TTL_SECONDS env var controls duration.
- Links: Observability Playground

15. Clear cache endpoint (dev)

- As a dev, I can clear the cache in dev mode.
- AC: POST /api/cache/clear returns 204.
- Links: API Playground

## C. Streaming & SSE

16. SSE meta event

- As a client, I receive meta with request_id first.
- AC: event: meta with id, model, provider.
- Links: S2S SSE Streaming

17. SSE token events

- As a client, I receive incremental token batches.
- AC: event: token with partial content.
- Links: S2S SSE Streaming

18. SSE done event

- As a client, I receive done with full content and usage.
- AC: event: done with final payload.
- Links: S2S SSE Streaming

19. SSE error event

- As a client, I receive error events on failure.
- AC: event: error with message.
- Links: S2S SSE Streaming

20. SSE heartbeat

- As a client, I receive periodic comments to keep alive.
- AC: : heartbeat comments every 30s.
- Links: S2S SSE Streaming

21. SSE abort on client disconnect

- As the gateway, I stop processing if client disconnects.
- AC: Stream closes; resources freed.
- Links: S2S SSE Streaming

22. SSE retry recommendations

- As a client, I see retry suggestions in errors.
- AC: retry field in SSE error events.
- Links: S2S SSE Streaming

## D. Provider Adapters

23. OpenAI adapter (mock)

- As the gateway, I can route to OpenAI (mocked).
- AC: X-Provider: openai routes to mock handler.
- Links: API Playground

24. Anthropic adapter (mock)

- As the gateway, I can route to Anthropic (mocked).
- AC: X-Provider: anthropic routes to mock handler.
- Links: API Playground

25. Provider fallback chain

- As the gateway, I fallback to secondary on primary failure.
- AC: If primary fails, try secondary; log event.
- Links: Observability Playground

26. Provider cost tracking (mock)

- As the gateway, I estimate costs per request.
- AC: cost_estimate in response metadata.
- Links: Observability Playground

27. Provider latency tracking

- As the gateway, I measure provider call duration.
- AC: provider_latency_ms in response.
- Links: Observability Playground

## E. BYOK & Security Headers

28. X-Provider-Key header

- As a client, I can send my own key via header.
- AC: Gateway uses client key if provided.
- Links: Security Playground

29. Redact keys from logs

- As the gateway, I never log API keys.
- AC: Keys replaced with **_REDACTED_** in logs.
- Links: Security & Trust Plan

30. Cache-Control: no-store

- As the gateway, I send no-store on sensitive responses.
- AC: API routes return Cache-Control: no-store.
- Links: Security & Trust Plan

31. Strict CSP headers

- As the gateway, I send strict CSP headers.
- AC: CSP restricts sources; no unsafe-inline for scripts.
- Links: Security & Trust Plan

32. HSTS header

- As the gateway, I enforce HTTPS via HSTS.
- AC: Strict-Transport-Security header on all responses.
- Links: Security & Trust Plan

## F. Rate Limiting & Quotas

33. Per-IP rate limiting

- As the gateway, I limit requests per IP.
- AC: 60 req/min per IP; 429 when exceeded.
- Links: Observability Playground

34. Per-key rate limiting (future)

- As the gateway, I limit by API key when auth exists.
- AC: Placeholder; returns mock limits.
- Links: API Playground

35. Rate limit retry-after

- As the gateway, I send Retry-After on 429.
- AC: Retry-After header with seconds.
- Links: API Playground

36. Quota usage endpoint (mock)

- As a client, I can check my usage (mock).
- AC: GET /api/usage returns mock quota data.
- Links: API Playground

## G. Error Handling

37. Structured error responses

- As a client, I receive consistent error JSON.
- AC: { error: { code, message, details } } format.
- Links: API Playground

38. 400 for missing input

- As the gateway, I return 400 if input is missing.
- AC: Missing required field → 400 Bad Request.
- Links: API Playground

39. 413 for payload too large

- As the gateway, I return 413 if body exceeds limit.
- AC: Body > 256KB → 413 Payload Too Large.
- Links: API Playground

40. 500 with request_id

- As the gateway, I include request_id in 500 errors.
- AC: Internal errors include correlation ID.
- Links: Observability Playground

41. Graceful degradation

- As the gateway, I return partial results on partial failure.
- AC: If one provider fails, try another; note in metadata.
- Links: API Playground

## H. Observability & Logging

42. Structured JSON logs

- As the gateway, I log events as structured JSON.
- AC: Each log line is valid JSON with level, event, timestamp.
- Links: Observability Playground

43. Correlation IDs

- As the gateway, I assign and log request_id.
- AC: Every request gets UUID; threaded through logs.
- Links: Observability Playground

44. Latency histograms

- As the gateway, I track latency distribution.
- AC: Histogram of request durations; p50/p95/p99.
- Links: Observability Playground

45. Error rate tracking

- As the gateway, I count errors by type.
- AC: 4xx/5xx counts; provider errors separate.
- Links: Observability Playground

46. Request sanitization in logs

- As the gateway, I don't log raw user content.
- AC: Content replaced with [REDACTED] or hashed.
- Links: Security & Trust Plan

## I. Testing & Mocks

47. Deterministic mocks for tests

- As a dev, I can rely on stable mock responses.
- AC: Same input → same mock output.
- Links: API Playground

48. Trigger error conditions

- As a dev, I can trigger errors via special inputs.
- AC: TRIGGER_ERROR in input → 500 response.
- Links: API Playground

49. Trigger rate limits

- As a dev, I can trigger 429 via special input.
- AC: TRIGGER_RATE_LIMIT → 429 response.
- Links: API Playground

50. MSW handlers for all routes

- As a dev, I have MSW mocks for every API route.
- AC: All routes covered; no real network in tests.
- Links: TDD Master Plan

51. E2E fixtures

- As a QA, I have fixtures for complex scenarios.
- AC: Fixture files for multi-turn, errors, edge cases.
- Links: Testing Patterns

52. Contract tests (future)

- As a dev, I can validate API contracts.
- AC: OpenAPI validation in tests (placeholder).
- Links: API Playground
