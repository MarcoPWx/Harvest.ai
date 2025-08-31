import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

function UserJourneysBoard() {
  const [journeys, setJourneys] = useState([
    { id: "onboarding", title: "Onboarding → BYOK", status: "draft" },
    { id: "panic", title: "Panic Mode → First value", status: "ready" },
    { id: "flow", title: "Flow Mode → Draft → Export", status: "wip" },
    { id: "power", title: "Power Mode → Batch", status: "planned" },
  ]);

  function cycleStatus(i: number) {
    const order = ["draft", "wip", "ready", "planned"];
    setJourneys((prev) =>
      prev.map((j, idx) =>
        idx !== i ? j : { ...j, status: order[(order.indexOf(j.status) + 1) % order.length] },
      ),
    );
  }

  return (
    <div style={{ maxWidth: 900 }}>
      <h2>User Journeys</h2>
      <p style={{ color: "#555" }}>Lightweight tracker for key journeys (for demo/docs).</p>
      <div style={{ display: "grid", gap: 10 }}>
        {journeys.map((j, i) => (
          <div
            key={j.id}
            style={{
              border: "1px solid #eee",
              borderRadius: 8,
              padding: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontWeight: 600 }}>{j.title}</div>
              <div style={{ fontSize: 12, color: "#666" }}>{j.id}</div>
            </div>
            <button onClick={() => cycleStatus(i)} style={{ padding: "6px 10px" }}>
              {j.status}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const meta: Meta<typeof UserJourneysBoard> = {
  title: "Docs/User Journeys",
  component: UserJourneysBoard,
};
export default meta;

type Story = StoryObj<typeof meta>;
export const Board: Story = {};
