import React, { useEffect, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

function SSEClient() {
  const [url, setUrl] = useState("http://localhost:3002/api/sse-demo");
  const [running, setRunning] = useState(false);
  const [lines, setLines] = useState<string[]>([]);
  const esRef = useRef<EventSource | null>(null);

  function start() {
    if (running) return;
    try {
      const es = new EventSource(url);
      esRef.current = es;
      setLines([]);
      setRunning(true);
      es.onmessage = (e) => setLines((prev) => [...prev, e.data]);
      es.onerror = () => {
        setLines((prev) => [...prev, "[error]"]);
        try {
          es.close();
        } catch {}
        esRef.current = null;
        setRunning(false);
      };
    } catch (e) {
      setLines((prev) => [...prev, `[exception] ${String(e)}`]);
    }
  }

  function stop() {
    try {
      esRef.current?.close();
    } catch {}
    esRef.current = null;
    setRunning(false);
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8 }}>
        <input
          style={{ flex: 1, padding: 6, border: "1px solid #ddd", borderRadius: 6 }}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button onClick={start} disabled={running} style={{ padding: "6px 10px" }}>
          Start
        </button>
        <button onClick={stop} disabled={!running} style={{ padding: "6px 10px" }}>
          Stop
        </button>
      </div>
      <div
        style={{
          border: "1px solid #eee",
          borderRadius: 6,
          padding: 8,
          minHeight: 120,
          fontFamily: "monospace",
          fontSize: 12,
        }}
      >
        {lines.length ? lines.map((l, i) => <div key={i}>{l}</div>) : "No events yet"}
      </div>
    </div>
  );
}

const meta: Meta<typeof SSEClient> = {
  title: "Docs/SSE Client",
  component: SSEClient,
};
export default meta;

type Story = StoryObj<typeof meta>;
export const Client: Story = {};
