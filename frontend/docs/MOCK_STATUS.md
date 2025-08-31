# Mock & Test Status (What Actually Works)

> This document shows exactly what's mocked, testable, and interactive in the current codebase.

## 🟢 Fully Mocked & Testable APIs

### Generation APIs (`src/mocks/handlers/generation.ts`)

- ✅ `POST /api/generate` - Full mock with triggers for errors, rate limits, cache
- ✅ `GET /api/generate/:id` - Returns mocked generation by ID
- ✅ `DELETE /api/generate/:id` - Deletes generation (mock)
- ✅ `GET /api/generations` - Lists generations with pagination
- ✅ `POST /api/generate/stream` - SSE streaming mock (partial support)
- **Tests**: `src/app/api/generate/__tests__/` (route, cache, rate-limit tests)
- **Playground**: API Playground in Storybook

### Auth APIs (`src/mocks/handlers/auth.ts`)

- ✅ `POST /api/auth/signup` - Mock signup (stores in memory)
- ✅ `POST /api/auth/login` - Mock login with session
- ✅ `POST /api/auth/logout` - Clears session
- ✅ `GET /api/auth/session` - Returns current session
- ✅ `POST /api/auth/forgot-password` - Mock password reset
- ✅ `GET /api/auth/oauth/google` - Mock OAuth redirect
- ✅ `GET /api/auth/oauth/github` - Mock OAuth redirect
- **Tests**: `tests/e2e/auth.spec.ts` (currently skipped)
- **Note**: No real backend, sessions are in-memory only

### User APIs (`src/mocks/handlers/user.ts`)

- ✅ `GET /api/user/profile` - Returns mock user profile
- ✅ `PUT /api/user/profile` - Updates mock profile
- ✅ `GET /api/user/usage` - Returns mock usage stats
- ✅ `GET /api/user/billing` - Returns mock billing info
- ✅ `POST /api/user/api-keys` - Creates mock API key
- ✅ `GET /api/user/api-keys` - Lists mock API keys
- ✅ `DELETE /api/user/api-keys/:id` - Deletes mock key
- **Tests**: Some coverage in unit tests
- **Playground**: None (no UI for these)

### Template & Team APIs (`src/mocks/handlers/templates.ts`)

- ✅ `GET /api/templates` - Lists mock templates
- ✅ `POST /api/templates` - Creates mock template
- ✅ `GET /api/templates/:id` - Gets template by ID
- ✅ `PUT /api/templates/:id` - Updates template
- ✅ `DELETE /api/templates/:id` - Deletes template
- ✅ `GET /api/teams` - Lists mock teams
- ✅ `POST /api/teams` - Creates mock team
- **Tests**: Limited
- **Playground**: None (no UI)

### Debug & Metrics APIs (`src/mocks/handlers/debug.ts`)

- ✅ `GET /api/debug/endpoints` - Lists all endpoints
- ✅ `GET /api/debug/logs` - Returns mock logs
- ✅ `POST /api/debug/logs` - Appends to logs
- ✅ `GET /api/metrics` - Returns counters and p95
- **Tests**: `src/lib/server/__tests__/metrics.test.ts`
- **Playground**: Observability Playground

### Other APIs

- ✅ `GET /api/openapi.json` - Returns OpenAPI spec
- ✅ `GET /api/health` - Health check
- ✅ `GET /api/local-memory` - Local memory storage endpoints
- **Tests**: Various unit tests

## 🟢 Interactive Playgrounds

### Security Playground ✅

- Session-only BYOK demo
- Auto-wipe timer
- Panic wipe button
- Sanitized request preview
- Copy-blocking on key input
- Local-only mode toggle
- "Why this is safe" checklist
- "What we store" panel

### API Playground ✅

- Generate content with various formats
- Trigger errors (TRIGGER_ERROR in input)
- Trigger rate limits (TRIGGER_RATE_LIMIT)
- Trigger cache hits (TRIGGER_CACHED)
- View response with metadata

### Observability Playground ✅

- Structured logging examples
- Correlation ID patterns
- Metrics collection snippets
- Local /api/metrics endpoint

### SSE/Streaming Playground ⚠️

- Requires dev server running
- Shows SSE event stream
- Token batches demo
- Available at http://localhost:3002/playground/sse

## 🟡 Partially Implemented

### E2E Tests

- 115 tests defined in `tests/e2e/`
- Most are placeholders or skipped
- Key files:
  - `auth.spec.ts` - All skipped
  - `generation-flow.spec.ts` - Some work
  - `caching.spec.ts` - Functional
  - `metrics.spec.ts` - Functional

### UI Components

- EcosystemWidget - Works but has test warnings
- Navigation - Desktop works, mobile broken in tests
- ContentGenerator - Basic UI, no real functionality
- Dark mode - Fully functional

## 🔴 Conceptual Only (No Implementation)

### Missing Features

- Real AI provider integration
- Database persistence
- File uploads/storage
- Email sending
- Payment processing
- Real-time WebSockets
- Search functionality
- Admin panel
- Multi-tenant support
- Actual caching (Redis)
- Rate limiting (real)

### Future Stories

- Team collaboration UI
- Template marketplace
- Cost calculator
- Provider comparison
- Analytics dashboard
- Incident management
- Compliance workflows

## Testing Coverage

### What's Tested

- ✅ API route handlers (70 tests passing)
- ✅ Sanitizer utility (redacts keys)
- ✅ Hash utility (deterministic)
- ✅ Metrics collection
- ✅ Rate limit logic
- ✅ Cache headers
- ✅ SSE writer
- ✅ Some UI components

### What's Not Tested

- ❌ Most E2E flows
- ❌ OAuth flows
- ❌ File operations
- ❌ Complex UI interactions
- ❌ Performance
- ❌ Security scenarios
- ❌ Load testing

## How to Test/Learn

### 1. Run Unit Tests

```bash
npm test
```

### 2. Run E2E Tests

```bash
npm run test:e2e
```

### 3. Explore in Storybook

```bash
npm run storybook
# Navigate to:
# - Docs → Security Playground
# - Docs → API Playground
# - Docs → Top-Level Overview
```

### 4. Use Dev Server with Mocks

```bash
npm run dev:mock
# Visit http://localhost:3002
```

### 5. Trigger Mock Behaviors

In API Playground or via curl:

- Add "TRIGGER_ERROR" to input → 500 error
- Add "TRIGGER_RATE_LIMIT" → 429 response
- Add "TRIGGER_CACHED" → cache hit
- Use same input twice → cache hit

## Summary

- **30%** of user stories have working mocks
- **60%** of S2S stories have API mocks
- **10%** have interactive UI
- **70%** of unit tests pass
- **0%** real backend functionality

The system is a functional prototype for learning and testing, not production use.
