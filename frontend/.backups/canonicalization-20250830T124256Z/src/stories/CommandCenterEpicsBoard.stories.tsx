import React, { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

interface Epic {
  id: string;
  title: string;
  description?: string;
  status?: string;
  links?: string[];
}

function EpicsBoard() {
  const [rows, setRows] = useState<Epic[]>([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const r = await fetch("/api/epics");
        if (r.ok) {
          const j = await r.json();
          if (alive) setRows(Array.isArray(j) ? j : j?.data || []);
          return;
        }
        // fallback to sample JSON in repo
        const s = await fetch("/docs/roadmap/epics.sample.json");
        if (s.ok) {
          const j = await s.json();
          if (alive) setRows(j?.epics || []);
          return;
        }
        throw new Error("No epics source available");
      } catch (e: any) {
        if (alive) setErr(e?.message || String(e));
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, []);

  const StatusTag = ({ s }: { s: string }) => (
    <span
      style={{
        display: "inline-block",
        padding: "2px 6px",
        borderRadius: 6,
        fontSize: 12,
        background: s === "done" ? "#e6ffed" : s === "in-progress" ? "#fff7e6" : "#e6f0ff",
        color: s === "done" ? "#027a48" : s === "in-progress" ? "#b25e09" : "#0747a6",
        border: "1px solid #eee",
      }}
    >
      {s}
    </span>
  );

  return (
    <div style={{ maxWidth: 920 }}>
      {err && <div style={{ color: "crimson", fontFamily: "monospace" }}>Error: {err}</div>}
      {!rows.length && !err && <div style={{ color: "#666", fontSize: 12 }}>Loading epics…</div>}
      <div style={{ display: "grid", gap: 10 }}>
        {rows.map((e, i) => (
          <div key={e.id || i} style={{ border: "1px solid #eee", borderRadius: 8, padding: 12 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <div style={{ fontWeight: 600 }}>{e.title || `Epic ${e.id}`}</div>
              {e.status && <StatusTag s={e.status} />}
            </div>
            {e.description && (
              <div style={{ fontSize: 14, color: "#444", marginBottom: 8 }}>{e.description}</div>
            )}
            {Array.isArray(e.links) && e.links.length > 0 && (
              <div style={{ fontSize: 12 }}>
                Links:{" "}
                {e.links.map((l: string, idx: number) => (
                  <a key={idx} href={l} target="_blank" rel="noreferrer" style={{ marginRight: 8 }}>
                    {new URL(l, location.origin).pathname}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const meta: Meta<typeof EpicsBoard> = {
  title: "Command Center/Epics Board",
  component: EpicsBoard,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "This board lists epics from the API (if available) or falls back to a sample JSON in the repo.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
