import React, { useEffect, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

function StreamingDemo() {
  const [lines, setLines] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const timerRef = useRef<any>(null);

  function startSim() {
    if (timerRef.current) clearInterval(timerRef.current);
    setLines([]);
    setRunning(true);
    let i = 0;
    timerRef.current = setInterval(() => {
      i++;
      setLines((prev) => [...prev, `token: chunk_${i}`]);
      if (i === 10) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        setLines((prev) => [...prev, 'final: { result: "Done" }', "done: { ok: true }"]);
        setRunning(false);
      }
    }, 200);
  }

  function stop() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setRunning(false);
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
        <button onClick={startSim} disabled={running} style={{ padding: "6px 10px" }}>
          Start (simulate)
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
        {lines.length ? lines.map((l, i) => <div key={i}>{l}</div>) : "No stream yet"}
      </div>
    </div>
  );
}

const meta: Meta<typeof StreamingDemo> = {
  title: "Specs/S2S Streaming",
  component: StreamingDemo,
  parameters: {
    docs: {
      description: {
        component: "Simulated SSE token stream demo (deterministic tokens/final/done events).",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;
export const SimulatedStream: Story = {};
