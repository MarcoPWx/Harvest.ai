import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  ShieldCheckIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  BoltIcon,
} from "@heroicons/react/24/outline";
import BYOKDashboard from "./byok/BYOKDashboard.stories";

function MaskedKeyInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [visible, setVisible] = useState(false);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
      <input
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter provider API key (never stored)"
        style={{ padding: 8, border: "1px solid #ddd", borderRadius: 6 }}
      />
      <button
        onClick={() => setVisible((v) => !v)}
        title="Toggle visibility"
        style={{ padding: "8px 12px" }}
      >
        <EyeSlashIcon width={18} height={18} />
      </button>
    </div>
  );
}

function SanitizedPreview({ keyValue, payload }: { keyValue: string; payload: any }) {
  const redacted = useMemo(() => {
    const json = JSON.stringify(payload, null, 2);
    if (!keyValue) return json;
    const safe = keyValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(safe, "g");
    return json.replace(re, "***REDACTED***");
  }, [keyValue, payload]);
  return (
    <pre
      style={{
        maxHeight: 220,
        overflow: "auto",
        background: "#0b0f19",
        color: "#e6edf3",
        padding: 10,
        borderRadius: 6,
      }}
    >
      {redacted}
    </pre>
  );
}

function SecurityPlayground() {
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState("openai");
  const [expiresInMin, setExpiresInMin] = useState(15);
  const [remaining, setRemaining] = useState(expiresInMin * 60);
  const [running, setRunning] = useState(false);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (!running) return;
    timerRef.current = setInterval(() => setRemaining((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timerRef.current);
  }, [running]);

  useEffect(() => {
    setRemaining(expiresInMin * 60);
  }, [expiresInMin]);

  function startSession() {
    if (!apiKey) return alert("Enter a key (demo only; never stored)");
    setRunning(true);
  }
  function panicWipe() {
    setApiKey("");
    setRunning(false);
    setRemaining(0);
  }
  function simulateRouteChange() {
    // wipe on route change
    panicWipe();
  }

  const requestPayload = {
    provider,
    headers: {
      "X-Provider": provider,
      "X-Provider-Key": apiKey,
    },
    body: { input: "hello world", format: "blog" },
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div
        style={{ background: "#f0f7ff", border: "1px solid #cfe2ff", borderRadius: 8, padding: 12 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ShieldCheckIcon width={20} height={20} color="#2563eb" />
          <div>
            <div style={{ fontWeight: 600 }}>Session-only BYOK</div>
            <div style={{ fontSize: 12, color: "#1d4ed8" }}>
              Keys live in memory only; no storage, no logs
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        <label style={{ fontSize: 12 }}>Provider</label>
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          style={{ padding: 8, border: "1px solid #ddd", borderRadius: 6 }}
        >
          <option value="openai">OpenAI</option>
          <option value="anthropic">Anthropic</option>
          <option value="google">Google</option>
          <option value="azure">Azure</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      <div>
        <label style={{ fontSize: 12, display: "block", marginBottom: 6 }}>API Key (masked)</label>
        <MaskedKeyInput value={apiKey} onChange={setApiKey} />
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, alignItems: "end" }}
      >
        <div>
          <label style={{ fontSize: 12 }}>Session expiry (minutes)</label>
          <input
            type="number"
            min={1}
            max={120}
            value={expiresInMin}
            onChange={(e) => setExpiresInMin(parseInt(e.target.value || "1", 10))}
            style={{ padding: 8, border: "1px solid #ddd", borderRadius: 6, width: "100%" }}
          />
        </div>
        <div>
          <label style={{ fontSize: 12 }}>Remaining</label>
          <div
            style={{ padding: 8, border: "1px solid #ddd", borderRadius: 6, background: "#fafafa" }}
          >
            {Math.floor(remaining / 60)}m {remaining % 60}s
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={startSession} disabled={running} style={{ padding: "8px 12px" }}>
            Start
          </button>
          <button
            onClick={panicWipe}
            style={{
              padding: "8px 12px",
              color: "#b42318",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <TrashIcon width={16} height={16} /> Panic wipe
          </button>
        </div>
      </div>

      <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <BoltIcon width={18} height={18} />
          <div style={{ fontWeight: 600 }}>Sanitized request preview</div>
        </div>
        <SanitizedPreview keyValue={apiKey} payload={requestPayload} />
        <div style={{ fontSize: 12, color: "#666" }}>
          Note: Keys are redacted from any previews/errors.
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button onClick={simulateRouteChange} style={{ padding: "6px 10px" }}>
          Simulate route change (wipe)
        </button>
        {!running && apiKey && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#b45309" }}>
            <ExclamationTriangleIcon width={16} height={16} /> Session not started yet
          </div>
        )}
      </div>
    </div>
  );
}

const meta: Meta<typeof SecurityPlayground> = {
  title: "Docs/Security Playground",
  component: SecurityPlayground,
  parameters: {
    docs: {
      description: {
        component:
          "Session-only BYOK demo with masked key input, auto-wipe timer, panic wipe, and sanitized request preview.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;
export const Default: Story = {};
