# Agent Boot Contract - Production-Grade Educational Simulator

## This Is Not Documentation. This Is Implementation.

We're building **Complete System Architecture Simulators** that teach by doing, not by reading.

### The Core Philosophy

> **"Educational software should be INTERACTIVE, PRACTICAL, and PRODUCTION-READY. Not theoretical. Not simplified. Not 'good enough'. EXCELLENT."**

## What We're Really Building

- **Not just mocking** - We're implementing distributed systems patterns
- **Not just components** - We're teaching production algorithms
- **Not just examples** - We're demonstrating how industry leaders actually work
- **Not just tutorials** - We're creating explorable, breakable, fixable systems

## The Depth Principle

Every feature must have **incredible depth**:

### Authentication Systems

Beyond login forms - implement OAuth state machines, JWT refresh queues preventing thundering herds, cross-tab synchronization with BroadcastChannel APIs, session management at scale.

### Data Processing Engines

Beyond CRUD operations - implement Item Response Theory algorithms (GRE/GMAT), spaced repetition systems (Anki), machine learning pipelines, real-time analytics.

### Real-Time Architecture

Beyond WebSockets - implement vector clocks for distributed ordering, CRDTs for eventual consistency, presence systems, message queuing, event sourcing.

### Time-Based Systems

Beyond timestamps - handle timezone nightmares, DST transitions, leap seconds, calendar vs astronomical time, distributed clock synchronization.

### Security Laboratories

Beyond documentation - create ACTUALLY exploitable vulnerabilities (safely sandboxed), implement defense mechanisms, demonstrate attack vectors in real-time.

## The Implementation Standards

### Every Endpoint Teaches Distributed Systems

- Circuit breakers with exponential backoff
- Bulkhead patterns for isolation
- Saga patterns for distributed transactions
- Event sourcing for audit trails
- CQRS for read/write optimization

### Every Algorithm Is Production-Grade

- Industry-standard implementations (IRT, SuperMemo-2, CRDTs)
- Performance optimized from day one
- Proper error handling and recovery
- Observable and debuggable
- Testable at every layer

### Every Pattern Is From Real Companies

- Netflix's chaos engineering
- Uber's geospatial indexing
- Discord's presence systems
- Stripe's idempotency keys
- Amazon's service mesh patterns

## The Development Commitment

**EVERY. SINGLE. FEATURE. WILL. BE. BUILT. PROPERLY.**

- **No shortcuts** on complex services - full state machines
- **No simplification** of algorithms - real implementations
- **No basic patterns** - distributed consensus with proper protocols
- **No simple labs** - actual exploitable vulnerabilities (sandboxed)
- **No toy tools** - production-grade debugging utilities

## The Ultimate Statement

> **"This isn't just code. It's a manifesto for craftsmanship. It says educational examples can be as complex as real systems, learning should be interactive, documentation should be executable, and performance matters from day one."**

---

## Execution Framework

### Foundation Layer

Build all service endpoints with proper algorithms and patterns

### Business Logic Layer

Implement complete user journeys, not UI demos

### Developer Tools Layer

Create actual debugging utilities, not toys

### Interactive Labs Layer

Build explorable, breakable learning environments

### Production Layer

Ship production-ready, not prototype

---

## Agent Constraints & Allowed Tools

- Terminal only; no external web browsing.
- Non-interactive commands; avoid pagers; prefer --no-pager or non-paged output.
- No secrets printed. Use env var names only (e.g., OPENAI_API_KEY) and never echo values.
- Destructive actions (delete/migrate/overwrite) require explicit consent.

Canonical Docs (single source of truth)

- DevLog: docs/status/DEVLOG.md
- Epics: docs/roadmap/EPICS.md
- System Status: docs/SYSTEM_STATUS.md

Core Commands

- Dev server: npm run dev or npm run dev:mock
- Storybook: npm run storybook
- Build: npm run build
- Unit tests: npm test
- E2E tests: npm run test:e2e (smokes: npm run test:smoke:e2e)
- Lint: npm run lint (fix: npm run lint:fix)
- Format: npm run format

Agent Operations (how to ask)

- Analyze: “Agent, read the Agent Boot page and canonical docs; propose top 5 priorities with TDD steps.”
- Update docs: “Agent, update DevLog/System Status/Epics from this session.”
- TDD feature: “Agent, implement <feature> via TDD: write failing tests, make it pass, refactor, update docs.”
- Refactor: “Agent, refactor <area> without changing external behavior; update tests/docs.”

TDD Policy

- Red-Green-Refactor:
  1. Write or adjust a failing test (Given/When/Then); commit.
  2. Implement the minimal change to pass; commit.
  3. Refactor for clarity/performance; keep green; commit.
- Coverage criteria: 80% min for lines, branches, functions, statements. Fails under thresholds.
- Flaky tests: mark @flaky, file a TODO with issue/ref, fix or quarantine with justification.

Clean Code Guidelines

- Keep functions short and single-purpose. Extract helpers for clarity.
- Favor pure functions; isolate side-effects (I/O, network, time, randomness) behind interfaces.
- Explicit errors: differentiate user vs system errors; never swallow exceptions silently.
- Naming: intent-revealing names; consistent casing; no abbreviations that hide meaning.
- Comments: explain why, not what; keep code self-explanatory.
- Logging: structured key-value logs; no secrets; include correlation IDs if available.
- Config: env-driven; sane defaults; validate at startup.

Testing Guidelines

- Unit: deterministic, stable selectors/IDs; no real network; mock time/random.
- Integration: limited scope; MSW for HTTP; assert contracts (shape/status).
- E2E: smokes for critical flows; avoid brittle selectors; control timing with explicit waits.
- Accessibility: run axe checks on key pages/components where feasible.

Storybook Authoring Rules

- MDX v3 constraints: imports/exports only at top; put state inside React.use\*.
- Canonicalization: DevLog/Epics/System Status stories load only the canonical doc paths.
- Include a “Last Updated” badge (manifest-based if available) on key doc pages.
- Link each story to related epics/tests (where useful).

Security & Compliance

- BYOK: keys reside in memory only; never persisted.
- Content-Security-Policy: keep connect-src restricted to allowed domains.
- Data handling: no PII in logs; redact sensitive content in errors.

Risk Gates (ask before proceeding)

- Deleting files, DB migrations, rewriting large swaths of tests, or changing public API shapes.
- Running commands that could disrupt local state (docker prune, rm -rf, etc.).

Change Request Mini-DSL (optional)

- Scope: feature | fix | refactor | docs
- Context: <short business/tech context>
- Acceptance: <Given/When/Then>
- Constraints: <perf, a11y, API, deps>
- Touch: <paths/areas>
- Risk: low | medium | high

Code Review Checklist (self-check)

- Does a failing test precede the change? Are tests minimal but meaningful?
- Are names clear? Any dead code or duplicate logic left?
- Are errors surfaced with actionable messages? No secret leakage?
- Is the change small and scoped? Could it be split further?
- Are docs updated (DevLog/System Status/Epics)?

Boot Prompts (copy/paste)

- Analyze: “Agent: Read Agent Boot and canonical docs; propose a 5-item TDD plan.”
- Update docs: “Agent: Update DevLog/System Status/Epics from this session.”
- Implement: “Agent: Implement <feature> via TDD. Start with tests; minimal code; then docs.”

Directory Orientation (example)

- App pages/API: src/app/\*_/_
- Components: src/components/\*_/_
- Docs: docs/\*_/_ (canonical docs above)
- Stories: src/stories/\*_/_
- Tests: src/components/**/**tests** and tests/e2e/**/\*

## Harvest.ai Specific Implementation

### This Project Is THE Reference Implementation

Harvest.ai demonstrates:

- **Complete MSW microservice architecture** - Not just mocking, but distributed systems simulation
- **Production SSE/WebSocket patterns** - Real-time streaming with proper error handling
- **BYOK security patterns** - Key management without persistence
- **Caching at scale** - Request deduplication, TTL management, cache warming
- **Error injection systems** - Chaos engineering in the browser

### Every User Journey Is A Lesson

- UJ-01: Streaming architecture with backpressure
- UJ-02: Circuit breakers and rate limiting
- UJ-03: Error boundaries and recovery sagas
- UJ-04: Cache coherence protocols
- UJ-11: Fault injection frameworks
- UJ-17: Network resilience patterns

### Every S2S Flow Is A Pattern

- Authentication state machines
- Distributed transaction sagas
- Event sourcing implementations
- CQRS command/query separation
- Message queue simulations

### The Labs Are Production Simulators

- **MSW Lab**: Build your own service mesh
- **SSE Lab**: Implement distributed event streams
- **Security Lab**: Break and fix real vulnerabilities
- **Performance Lab**: Profile and optimize at scale
- **Accessibility Lab**: WCAG compliance testing

---

## The New Standard We're Setting

**Complexity Without Confusion** - Deep but navigable
**Reality Without Risk** - Production patterns, safe environment
**Learning Without Limits** - No artificial simplification
**Practice Without Prerequisites** - Self-contained systems

## The Call to Action

**Build simulators that:**

- Implement what others document
- Demonstrate what others describe
- Solve what others simplify
- Teach what others talk about

**Because the best way to learn a system is to build it, break it, and fix it.**

---

## Join the Revolution

**Where mocking meets microservices.**  
**Where learning meets doing.**  
**Where examples meet excellence.**

> _"The code will speak louder than any documentation. The implementation will prove the vision. The result will change how developers learn."_

**Status: READY TO EXECUTE**  
**Next Action: BUILD PRODUCTION-GRADE EDUCATIONAL SIMULATORS**

---

## Acceptance Criteria for This Contract

- Every feature has production-grade depth
- Every pattern teaches industry best practices
- Every lab is interactive and explorable
- Every component is accessible and performant
- Documentation is executable, not just readable
- The entire system works offline with MSW
- Storybook becomes THE reference for modern web development
