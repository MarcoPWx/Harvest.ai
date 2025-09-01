export default function TestingPage() {
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      <h1>🧪 Testing & CI</h1>

      <p>Single, consolidated source of truth for our testing approach and commands.</p>

      <p>See the canonical doc for full details: docs/testing/TESTING.md</p>

      <h2>Layers (overview)</h2>

      <ul>
        <li>
          Unit (Jest + RTL)
          <ul>
            <li>Polyfills via undici; route tests mock next/server</li>
          </ul>
        </li>
        <li>
          E2E (Playwright)
          <ul>
            <li>dev:mock server; HTML report + traces on retry</li>
          </ul>
        </li>
        <li>
          Visual (optional)
          <ul>
            <li>Storybook + Chromatic</li>
          </ul>
        </li>
        <li>
          Accessibility
          <ul>
            <li>Storybook a11y; jest-axe optional</li>
          </ul>
        </li>
      </ul>

      <h2>Current Status (2025-08-30)</h2>

      <ul>
        <li>All Jest unit and integration tests green locally: 229/229</li>
        <li>Stable animation and Redis mocks in tests</li>
        <li>Deterministic UI tests for demo tour (immediate visibility in tests)</li>
        <li>
          ApiClient tests: abort-aware fetch mocks; short timeouts; globalThis.fetch usage in client
        </li>
        <li>Note: E2E (Playwright) to be revisited post-auth/DB integration</li>
      </ul>

      <h2>Commands</h2>

      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-x-auto">
        <code>{`npm test                  # unit
npm run test:coverage     # unit with coverage
npm run test:e2e          # e2e (headless)
npm run test:e2e:headed   # e2e (headed)`}</code>
      </pre>

      <h2>CI (summary)</h2>

      <ul>
        <li>Type-check, lint, unit with coverage</li>
        <li>Playwright E2E (mock)</li>
        <li>Storybook build</li>
        <li>Chromatic publish (if secret configured)</li>
      </ul>

      <h2>Dev tools & controls</h2>

      <ul>
        <li>/dev/tools: API Playground, SSE Viewer, WS Client</li>
        <li>
          /dev/network: global mock defaults (cookies), per-request overrides, timeline, presets,
          batch runner
        </li>
        <li>MSW mock controls: x-mock-delay (ms), x-mock-error-rate (0..1)</li>
      </ul>
    </div>
  );
}
