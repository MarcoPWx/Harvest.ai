import React from "react";

export const testsInfoDecorator = (Story: any, context: any) => {
  const status: string = String(context?.globals?.testsInfo || "closed");
  const open = status === "open";

  const [cov, setCov] = React.useState<any>(null);
  const [covErr, setCovErr] = React.useState<string>("");
  const [pw, setPw] = React.useState<any>(null);
  const [pwErr, setPwErr] = React.useState<string>("");

  React.useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const r = await fetch("/coverage/coverage-summary.json");
        if (r.ok) {
          const j = await r.json();
          if (alive) setCov(j);
        } else {
          if (alive) setCovErr("No coverage summary found");
        }
      } catch {
        if (alive) setCovErr("No coverage summary found");
      }
      try {
        const r2 = await fetch("/playwright-summary.json");
        if (r2.ok) {
          const j2 = await r2.json();
          if (alive) setPw(j2);
        } else {
          if (alive) setPwErr("No Playwright summary found");
        }
      } catch {
        if (alive) setPwErr("No Playwright summary found");
      }
    }
    load();
    return () => { alive = false };
  }, []);

  const overlay = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9997,
        background: "rgba(0,0,0,0.35)",
        display: open ? "flex" : "none",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      role="dialog"
      aria-label="Tests Info"
    >
      <div
        style={{
          width: "min(960px, 96vw)",
          maxHeight: "88vh",
          overflow: "auto",
          background: "#fff",
          borderRadius: 10,
          boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
          padding: 16,
          fontFamily:
            "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ margin: 0 }}>Tests Info</h3>
          <a
            href="?globals=testsInfo:closed"
            style={{
              textDecoration: "none",
              border: "1px solid #e5e7eb",
              borderRadius: 6,
              padding: "6px 10px",
              background: "white",
              fontSize: 12,
            }}
          >
            Close
          </a>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 }}>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Unit Coverage</div>
            {cov ? (
              <div style={{ fontFamily: "monospace", fontSize: 12 }}>
                <div>statements: {cov?.total?.statements?.pct ?? "?"}%</div>
                <div>branches: {cov?.total?.branches?.pct ?? "?"}%</div>
                <div>functions: {cov?.total?.functions?.pct ?? "?"}%</div>
                <div>lines: {cov?.total?.lines?.pct ?? "?"}%</div>
                <div style={{ marginTop: 6 }}>
                  <a href="/coverage/lcov-report/index.html" target="_blank" rel="noreferrer">
                    Open LCOV report
                  </a>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 12, color: "#666" }}>{covErr || "Loading…"}</div>
            )}
          </div>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>E2E Summary</div>
            {pw ? (
              <div style={{ fontFamily: "monospace", fontSize: 12 }}>
                <div>tests: {pw?.stats?.tests ?? pw?.suites?.length ?? "?"}</div>
                <div>ok: {pw?.stats?.expected ?? "?"}</div>
                <div>failed: {pw?.stats?.unexpected ?? "?"}</div>
                <div>flaky: {pw?.stats?.flaky ?? "?"}</div>
                <div style={{ marginTop: 6 }}>
                  <a href="/playwright-report/index.html" target="_blank" rel="noreferrer">
                    Open Playwright report
                  </a>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 12, color: "#666" }}>{pwErr || "Loading…"}</div>
            )}
          </div>
        </div>

        <div style={{ marginTop: 12, fontSize: 12, color: "#555" }}>
          Tips:
          <ul>
            <li>Run <code>npm run test:coverage</code> to generate coverage artifacts.</li>
            <li>Run <code>npm run test:e2e:json</code> to generate /playwright-summary.json.</li>
          </ul>
        </div>
      </div>
    </div>
  );

  // Small persistent badges (top-right) when failures/low coverage are detected
  function CoverageBadge() {
    const pct = cov?.total?.lines?.pct;
    const low = typeof pct === 'number' ? pct < 80 : false;
    if (!low) return null;
    return (
      <a
        href="?path=/docs/tests-unit-status--docs"
        style={{
          display: 'inline-block', marginLeft: 6,
          background: '#ffebe6', color: '#b42318', border: '1px solid #ffb4a6',
          padding: '2px 6px', borderRadius: 6, fontSize: 12, textDecoration: 'none'
        }}
      >
        Coverage < 80%
      </a>
    )
  }
  function E2EBadge() {
    const failed = pw?.stats?.unexpected || 0;
    if (!failed) return null;
    return (
      <a
        href="?path=/docs/tests-e2e-status--docs"
        style={{
          display: 'inline-block', marginLeft: 6,
          background: '#ffebe6', color: '#b42318', border: '1px solid #ffb4a6',
          padding: '2px 6px', borderRadius: 6, fontSize: 12, textDecoration: 'none'
        }}
      >
        E2E failing
      </a>
    )
  }

  return (
    <div style={{ position: "relative" }}>
      <Story />
      {/* badges container */}
      <div style={{ position: 'fixed', top: 8, right: 8, zIndex: 9996 }}>
        <CoverageBadge />
        <E2EBadge />
      </div>
      {overlay}
    </div>
  );
};

