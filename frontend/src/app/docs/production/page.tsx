export default function ProductionChecklistPage() {
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      <h1>Production Checklist</h1>

      <p>Use this checklist before releases and to keep production healthy.</p>

      <h2>Environment & secrets</h2>

      <ul>
        <li>
          Ensure all required env vars are set in the target environment.
          <ul>
            <li>Public flags: NEXT_PUBLIC_ENABLE_MSW should be disabled in production.</li>
            <li>
              API keys, provider tokens, and service URLs are configured in the platform (not
              committed to the repo).
            </li>
          </ul>
        </li>
        <li>Configure CORS, WAF, and allowed origins appropriately.</li>
        <li>Confirm JWT/Session settings (expiration, rotation, secure cookies).</li>
      </ul>

      <h2>Build & quality gates</h2>

      <ul>
        <li>
          Type-check passes: <code>npm run type-check</code>
        </li>
        <li>
          Lint passes: <code>npm run lint</code>
        </li>
        <li>
          Unit tests pass with coverage:
          <ul>
            <li>Statements/Functions/Lines ≥ 60%</li>
            <li>Branches ≥ 50%</li>
            <li>HTML coverage report is uploaded as a CI artifact.</li>
          </ul>
        </li>
        <li>
          E2E tests pass in mock mode: <code>npm run test:e2e</code>
        </li>
        <li>
          Storybook builds: <code>npm run build-storybook</code>
        </li>
        <li>
          Chromatic visual tests run in CI (optional but recommended):
          <ul>
            <li>Set CHROMATIC_PROJECT_TOKEN in repository secrets.</li>
            <li>The CI includes a Chromatic publish step that runs when the token is present.</li>
          </ul>
        </li>
      </ul>

      <h2>Post-deploy smoke</h2>

      <p>Use the included smoke script to validate deployments automatically:</p>

      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-x-auto">
        <code>{`# Minimal checks
SMOKE_BASE_URL=https://your-app.example.com npm run smoke

# Also exercise POST /api/generate
SMOKE_BASE_URL=https://your-app.example.com SMOKE_TRY_GENERATE=1 npm run smoke`}</code>
      </pre>

      <p>Checks:</p>

      <ul>
        <li>/ (200)</li>
        <li>/docs/api (200)</li>
        <li>/api/openapi.json (valid JSON)</li>
        <li>Optional: POST /api/generate</li>
      </ul>

      <h2>Rate limiting & caching</h2>

      <ul>
        <li>Configure upstream rate limiting (e.g., CDN, gateway) and confirm 429 handling UX.</li>
        <li>Validate cache policies and invalidation for API and docs assets.</li>
      </ul>

      <h2>Error handling & resilience</h2>

      <ul>
        <li>
          Client: graceful error states, retries with backoff where appropriate, and user messaging.
        </li>
        <li>Server: structured logging, request IDs, safe error surfaces.</li>
        <li>Realtime: fallbacks (WS→SSE→polling), timeouts, reconnections.</li>
      </ul>

      <h2>Observability</h2>

      <ul>
        <li>
          Dashboard tiles for: error rate, p95 latency, 4xx/5xx by route, WS connection rate,
          dropped connections.
        </li>
        <li>Tracing for key flows (generate, auth, file uploads) if available.</li>
        <li>Log sampling in production (PII-safe) and retention policy verified.</li>
      </ul>

      <h2>Security & privacy</h2>

      <ul>
        <li>No secrets in client bundles.</li>
        <li>PII handled according to policy; redact in logs.</li>
        <li>Dependency audit with GitHub Dependabot or npm audit in CI.</li>
      </ul>

      <h2>Rollback & recovery</h2>

      <ul>
        <li>Versioned deployments with fast rollback procedure documented.</li>
        <li>Smoke checks and alarms trigger on regression.</li>
        <li>DB migrations are backward compatible or have a rollback plan.</li>
      </ul>
    </div>
  );
}
