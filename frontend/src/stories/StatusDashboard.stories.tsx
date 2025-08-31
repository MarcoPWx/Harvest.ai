import React, { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from "@heroicons/react/24/outline";

function StatusDashboard() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    fetch("/docs/status/ci-status.json")
      .then(async (r) => {
        if (!alive) return;
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then((j) => alive && setData(j))
      .catch((e) => alive && setError(String(e)));
    return () => {
      alive = false;
    };
  }, []);

  const Badge = ({ ok, label }: { ok: boolean; label: string }) => (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 8px",
        borderRadius: 6,
        background: ok ? "#e6ffed" : "#ffebe6",
        color: ok ? "#027a48" : "#b42318",
        border: `1px solid ${ok ? "#abefc6" : "#ffb4a6"}`,
        fontSize: 12,
      }}
    >
      {ok ? <CheckCircleIcon width={14} height={14} /> : <XCircleIcon width={14} height={14} />}
      {label}: {ok ? "passed" : "failed"}
    </span>
  );

  if (error) return <div style={{ fontFamily: "monospace", color: "crimson" }}>Error: {error}</div>;
  if (!data) return <div style={{ fontFamily: "monospace" }}>Loading…</div>;

  const unitOk = data?.summary?.unit === "passed";
  const e2eOk = data?.summary?.e2e === "passed";
  const sbOk = data?.summary?.storybookInteractions === "passed";

  return (
    <div style={{ maxWidth: 900 }}>
      <h2>CI Status Dashboard</h2>
      <div style={{ display: "flex", gap: 8, margin: "8px 0 12px" }}>
        <Badge ok={unitOk} label="Unit" />
        <Badge ok={e2eOk} label="E2E" />
        <Badge ok={sbOk} label="Storybook" />
      </div>
      <div style={{ fontSize: 12, color: "#444" }}>Generated: {data.generatedAt}</div>
      <div style={{ marginTop: 12 }}>
        {data?.links?.coverage && (
          <a href={data.links.coverage} target="_blank" rel="noreferrer">
            Coverage report
          </a>
        )}{" "}
        {data?.links?.playwrightReport && (
          <a href={data.links.playwrightReport} target="_blank" rel="noreferrer">
            Playwright report
          </a>
        )}
      </div>
    </div>
  );
}

const meta: Meta<typeof StatusDashboard> = {
  title: "Docs/Status Dashboard",
  component: StatusDashboard,
};
export default meta;

type Story = StoryObj<typeof meta>;
export const Dashboard: Story = {};
