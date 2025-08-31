import React, { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

function CoveragePanel() {
  const [cov, setCov] = useState<any>(null);
  const [covErr, setCovErr] = useState("");
  const [ci, setCi] = useState<any>(null);
  const [e2e, setE2e] = useState<any>(null);
  const [e2eErr, setE2eErr] = useState("");

  useEffect(() => {
    let alive = true;
    fetch("/coverage/coverage-summary.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("No local coverage"))))
      .then((j) => alive && setCov(j))
      .catch((e) => alive && setCovErr(String(e)));

    fetch("/docs/status/ci-status.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => alive && setCi(j))
      .catch(() => {});

    fetch("/playwright-summary.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("No /playwright-summary.json"))))
      .then((j) => alive && setE2e(j))
      .catch(() => {
        fetch("/playwright-report/data/test-results.json")
          .then((r) => (r.ok ? r.json() : null))
          .then((j) => alive && j && setE2e(j))
          .catch((err) => alive && setE2eErr(String(err)));
      });

    return () => {
      alive = false;
    };
  }, []);

  const total = cov?.total;
  const P = ({ label, pct }: { label: string; pct: number }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 140, fontSize: 12 }}>{label}</div>
      <div style={{ flex: 1, height: 8, background: "#eee", borderRadius: 4 }}>
        <div style={{ width: `${pct || 0}%`, height: 8, background: "#4caf50", borderRadius: 4 }} />
      </div>
      <div style={{ width: 50, textAlign: "right", fontSize: 12 }}>{(pct || 0).toFixed(1)}%</div>
    </div>
  );

  function summarizePlaywright(obj: any) {
    try {
      if (obj && obj.suites) {
        let total = 0,
          passed = 0,
          failed = 0,
          skipped = 0;
        const walk = (suite: any) => {
          for (const s of suite.suites || []) walk(s);
          for (const t of suite.tests || []) {
            total++;
            const st = t?.results?.[0]?.status || t?.status;
            if (st === "passed") passed++;
            else if (st === "skipped") skipped++;
            else failed++;
          }
        };
        for (const s of obj.suites) walk(s);
        return { total, passed, failed, skipped };
      }
      if (Array.isArray(obj?.tests)) {
        const total = obj.tests.length;
        let passed = 0,
          failed = 0,
          skipped = 0;
        for (const t of obj.tests) {
          const st = t?.outcome || t?.status;
          if (st === "expected" || st === "passed") passed++;
          else if (st === "skipped") skipped++;
          else failed++;
        }
        return { total, passed, failed, skipped };
      }
    } catch {}
    return null;
  }

  const e2eSummary = summarizePlaywright(e2e);

  return (
    <div style={{ maxWidth: 820 }}>
      <h3>Local coverage (Jest)</h3>
      {total ? (
        <div style={{ display: "grid", gap: 6 }}>
          <P label="Statements" pct={total.statements?.pct} />
          <P label="Branches" pct={total.branches?.pct} />
          <P label="Functions" pct={total.functions?.pct} />
          <P label="Lines" pct={total.lines?.pct} />
        </div>
      ) : (
        <div style={{ fontSize: 12, color: "#666" }}>
          {covErr
            ? `Coverage unavailable (${covErr}). Run npm run test:coverage.`
            : "Coverage summary not found. Run npm run test:coverage."}
        </div>
      )}

      <h3 style={{ marginTop: 16 }}>E2E & CI</h3>
      {e2eSummary ? (
        <div
          style={{ display: "flex", gap: 12, alignItems: "center", fontSize: 12, marginBottom: 8 }}
        >
          <span>Total: {e2eSummary.total}</span>
          <span style={{ color: "#027a48" }}>Passed: {e2eSummary.passed}</span>
          <span style={{ color: "#b42318" }}>Failed: {e2eSummary.failed}</span>
          <span style={{ color: "#6b7280" }}>Skipped: {e2eSummary.skipped}</span>
        </div>
      ) : (
        <div style={{ fontSize: 12, color: "#666" }}>
          {e2eErr
            ? `No E2E summary (${e2eErr}).`
            : "E2E summary not found. Tip: npm run test:e2e:json writes public/playwright-summary.json (served at /playwright-summary.json)."}
        </div>
      )}

      <ul style={{ fontSize: 14 }}>
        <li>
          Playwright report:{" "}
          <a href="/playwright-report/index.html" target="_blank" rel="noreferrer">
            /playwright-report/index.html
          </a>
          <span style={{ fontSize: 12, color: "#666" }}> (if you ran E2E locally)</span>
        </li>
        <li>
          CI artifacts via Status Dashboard:{" "}
          <a href="?path=/docs/docs-status-dashboard--docs">Docs → Status Dashboard</a>
        </li>
        {ci?.links?.coverage && (
          <li>
            CI Coverage artifact:{" "}
            <a href={ci.links.coverage} target="_blank" rel="noreferrer">
              {ci.links.coverage}
            </a>
          </li>
        )}
        {ci?.links?.playwrightReport && (
          <li>
            CI Playwright artifact:{" "}
            <a href={ci.links.playwrightReport} target="_blank" rel="noreferrer">
              {ci.links.playwrightReport}
            </a>
          </li>
        )}
      </ul>
    </div>
  );
}

const meta: Meta<typeof CoveragePanel> = {
  title: "Command Center/Test Coverage",
  component: CoveragePanel,
};
export default meta;

type Story = StoryObj<typeof meta>;
export const CoverageAndCI: Story = {};
