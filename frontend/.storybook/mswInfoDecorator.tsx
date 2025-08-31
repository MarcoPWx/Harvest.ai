import React from "react";

import { handlers as appHandlers } from "../src/mocks/handlers";

export const mswInfoDecorator = (Story: any, context: any) => {
  const status: string = String(context?.globals?.mswInfo || "closed");
  const open = status === "open";

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
      aria-label="MSW Info"
    >
      <div
        style={{
          width: "min(900px, 96vw)",
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
          <h3 style={{ margin: 0 }}>MSW Info</h3>
          <a
            href="?globals=mswInfo:closed"
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

        <div style={{ marginTop: 8, fontSize: 14, color: "#374151" }}>
          <p style={{ marginTop: 0 }}>
            Storybook is running with MSW (Mock Service Worker) enabled by default. Handlers shape
            API responses and support triggers for deterministic demos.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Handlers (method & path)</div>
              <ul>
                {Array.isArray(appHandlers) && appHandlers.length > 0 ? (
                  appHandlers.map((h: any, idx: number) => {
                    const m = h?.info?.method?.toUpperCase?.() || h?.info?.method || "";
                    const p = h?.info?.path || h?.info?.mask || "";
                    return (
                      <li key={idx}>
                        <code>{m} {String(p)}</code>
                      </li>
                    );
                  })
                ) : (
                  <li style={{ fontSize: 12, color: '#666' }}>No handler metadata available.</li>
                )}
              </ul>
            </div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Useful links</div>
              <ul>
                <li>
                  <a href="?path=/docs/mock-status--docs">Docs/Mock Status</a>
                </li>
                <li>
                  <a href="?path=/docs/command-center-s2s-streaming-threads--docs">S2S — Streaming & Threads</a>
                </li>
                <li>
                  <a href="/docs/mocks/handlers/index.ts" target="_blank" rel="noreferrer">
                    Open handlers index (repo path)
                  </a>
                </li>
              </ul>
              <div style={{ fontSize: 12, color: "#555" }}>
                Triggers:
                <ul>
                  <li>Include <code>TRIGGER_RATE_LIMIT</code> in input for 429</li>
                  <li>Include <code>TRIGGER_ERROR</code> in input for 500</li>
                  <li>Include <code>TRIGGER_CACHED</code> to simulate cached result</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ position: "relative" }}>
      <Story />
      {overlay}
    </div>
  );
};

