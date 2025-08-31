# Product Brief — Harvest.ai

## North Star

Be the most trusted way to turn raw input into a publishable draft in under 90 seconds, with full cost transparency and zero lock‑in.

### Primary Metric

- **Time to First Useful Output (TTFUO)** P90 ≤ 90 seconds

### Trust Guardrails (Supporting KPIs)

- **Transparency Trust Score**: price-verification rate ≤ 5%
- **Export Success Rate**: 100% (no lock-in)
- **Crisis Return Rate**: ≥ 90% of users come back during their next urgent need
- **Quality Acceptance Rate**: ≥ 80% outputs accepted without major rework

## Our 3 Promises

### 1) Fast generation that actually delivers

- Start generating in under 30 seconds from landing
- Real-time streaming feedback (see progress as it happens)
- Emergency templates for crisis situations (resignation, apology, urgent update)
- Smart format detection based on your input

### 2) Transparency that builds trust

- See exact token count and cost per generation
- Quality score on every output (know what you're getting)
- Provider visibility (know which AI responded)
- 100% exportable — download or copy everything, no lock-in

### 3) Reliability when you need it most

- Fallback chain ensures generation never fails (Primary → Secondary → Mock)
- Clear error messages with actionable next steps
- Rate limiting with exact retry times (no guessing)
- Works offline in dev mode (MSW mocks)

## 3 Primary Journeys (mapped to UI surfaces)

### Journey A — Panic Mode (Crisis to Relief)

**Goal**: From landing to useful draft in under 90 seconds for crisis situations

**Surfaces**:

- **Landing**: Crisis detection via keywords → Auto-route to Panic Mode
- **Panic Mode** (`/panic`): Emergency template detection, quick field filling, instant generation
- **Output**: Formatted result with copy/download, success celebration if <90s

**Why it matters**:
This is our North Star — being there in crisis moments with speed and clarity. Users remember who helped them at 11 PM before a deadline.

**Representative Coverage**:

- Emergency templates (resignation, apology, urgent update, sick day, deadline extension)
- TTFUO tracking showing real-time elapsed seconds
- Trust indicators (no signup, data ownership, time guarantee)

---

### Journey B — Flow Mode (Quality & Iteration)

**Goal**: Convert rough ideas into polished content through guided refinement

**Surfaces**:

- **Demo** (`/demo`): Standard generation with format selection
- **Format** (`/format`): Transform existing content to new formats
- **Playgrounds** (`/playground/*`): API exploration and testing

**Why it matters**:
After crisis relief comes quality improvement. Users who trust us in emergencies will trust us for everyday content needs.

**Representative Coverage**:

- Format selection (blog, email, summary, presentation)
- Real-time streaming with token display
- Cost and quality metrics per generation
- Provider transparency and fallback visibility

---

### Journey C — Power Mode (Developer & API)

**Goal**: Enable programmatic content generation at scale

**Surfaces**:

- **API** (`/api/generate`): REST with SSE streaming or JSON response
- **Swagger UI** (`/docs/api`): Interactive API documentation
- **Dev Tools** (`/dev/tools`, `/dev/network`): Mock controls, SSE viewer, request timeline
- **Storybook**: Component playground with API integration examples

**Why it matters**:
Developers who experience our clean API and excellent mocks become evangelists. They integrate us into their workflows and bring their teams.

**Representative Coverage**:

- SSE streaming with fallback to JSON
- Rate limiting with clear X-RateLimit headers
- Request correlation IDs for debugging
- Mock-first development with MSW
- Header-based latency and error injection

## What Actually Works Today (Reality Check)

### ✅ Fully Functional

- **Generation API**: `/api/generate` with streaming SSE and JSON modes
- **Mock Infrastructure**: Complete MSW + WebSocket mocks for offline dev
- **Playgrounds**: Interactive API testing at `/playground/generate`, `/playground/sse`, `/playground/threads`
- **Developer Tools**: Network control panel, SSE viewer, request timeline
- **Documentation**: Swagger UI, MDX docs, Storybook stories
- **Testing**: 58/58 unit tests passing, E2E framework ready

### ⚠️ Partially Implemented

- **Caching**: In-memory only (Redis config exists but not wired)
- **Rate Limiting**: In-memory buckets (no persistence)
- **Providers**: Mock provider works; OpenAI/Anthropic/Gemini adapters exist but need API keys
- **Auth**: Supabase config exists but not integrated

### ❌ Not Yet Built

- **User Accounts**: No signup/login flow
- **Persistence**: No database storage of generations
- **Billing**: Stripe config but no integration
- **Teams**: No collaboration features
- **Analytics**: No usage tracking beyond logs

## Technical Alignment to North Star

### How we achieve ≤ 90 second TTFUO:

1. **Streaming First**: SSE starts sending tokens within 500ms
2. **Smart Caching**: Request hash → instant repeat results
3. **Provider Fallback**: Primary → Secondary → Mock (never fails)
4. **Progressive Enhancement**: Start with UI, add features as they stream

### How we ensure trust:

1. **Cost Transparency**: Every response includes token count + cost
2. **Quality Metrics**: Every response includes quality score
3. **Export Everything**: All outputs downloadable as JSON/TXT
4. **No Vendor Lock**: BYOK ready, provider agnostic

## Current Sprint Focus (Where We Are Now)

### This Week's Reality:

- **S2S API**: Stabilizing streaming endpoints for server-to-server use
- **Playgrounds**: Making every API endpoint explorable
- **Mocks**: Ensuring 100% offline development capability
- **Docs**: Storybook as living documentation

### Next Week's Priority:

1. Wire real AI providers (with graceful mock fallback)
2. Add persistent caching layer
3. Implement basic auth flow
4. Create crisis detection for Panic Mode

## Success Metrics Alignment

| Metric             | Current          | Target | Path to Close Gap               |
| ------------------ | ---------------- | ------ | ------------------------------- |
| TTFUO P90          | ~3-5s (mock)     | ≤90s   | ✅ Already achieving with mocks |
| Cache Hit Rate     | 0% (memory only) | >30%   | Add Redis persistence           |
| Quality Score >80% | 90% (mock)       | >80%   | ✅ Already achieving            |
| Export Success     | 100%             | 100%   | ✅ Already achieving            |
| Provider Uptime    | 100% (mock)      | >99.9% | Add real providers + fallback   |

## What Powers This (One Line)

A mock-first Next.js app with SSE streaming, provider fallback chain, transparent cost/quality metrics, and comprehensive Storybook playgrounds — delivering trust through radical transparency and developer-first design.

---

## Quick Wins vs Long Game

### Quick Wins (This Sprint)

- ✅ Hook up one real AI provider
- ✅ Add Redis caching
- ✅ Create "Try without signup" flow
- ✅ Add crisis detection keywords

### Long Game (Next Quarter)

- 🎯 Full auth + user persistence
- 🎯 Team workspaces
- 🎯 Batch API with webhooks
- 🎯 Usage analytics dashboard
- 🎯 Enterprise SSO + audit logs

## The Honest Assessment

**What we're great at:**

- Developer experience (mocks, playgrounds, docs)
- API design (SSE streaming, clear errors)
- Transparency (costs, quality, provider visibility)

**What needs work:**

- Real AI provider integration (currently mock only)
- User persistence (no database yet)
- Production readiness (monitoring, scaling)

**Our bet:**
If we nail the crisis moment (Panic Mode) with radical transparency, users will trust us for everything else. The mock-first approach lets us perfect the UX before spending on infrastructure.
