"use client";

import { useRef, useState } from "react";
import { useSSEStream } from "@/lib/client/useSSEStream";

export default function GeneratePlaygroundPage() {
  const [input, setInput] = useState("Write a short note about Harvest.ai streaming and threads.");
  const [format, setFormat] = useState("blog");
  const [provider, setProvider] = useState("mock");
  const [bypass, setBypass] = useState(false);
  const [simulate429, setSimulate429] = useState(false);
  const [simulate500, setSimulate500] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [events, setEvents] = useState<Array<{ t: string; v: any }>>([]);
  const [json, setJson] = useState<any>(null);
  const { start: stream, abort: cancel } = useSSEStream();

  function push(t: string, v: any) {
    setEvents((prev) => [...prev, { t, v }]);
  }

  function buildInput() {
    let s = input;
    if (simulate429) s += " TRIGGER_RATE_LIMIT";
    if (simulate500) s += " TRIGGER_ERROR";
    return s;
  }

  async function callJSON() {
    setJson(null);
    setEvents([]);
    const reqId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2, 10);
    const res = await fetch("/api/generate?real=1", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Request-ID": reqId,
        "X-Real-API": "1",
        ...(bypass ? { "x-cache-bypass": "1" } : {}),
      },
      body: JSON.stringify({ input: buildInput(), format, provider }),
    });
    const j = await res.json().catch(() => null);
    setJson(j);
  }

  async function callSSE() {
    setJson(null);
    setEvents([]);
    setStreaming(true);
    try {
      const reqId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2, 10);
      await stream(
        "/api/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "text/event-stream",
            "X-Request-ID": reqId,
            ...(bypass ? { "x-cache-bypass": "1" } : {}),
          },
          body: JSON.stringify({ input: buildInput(), format, provider }),
        },
        (e) => push(e.event, e.data),
      );
    } catch (e) {
      push("error", String(e));
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6 space-y-4">
        <h1 className="text-2xl font-bold">Generate Playground</h1>
        <p className="text-gray-600">
          Exercise /api/generate with streaming and JSON modes. Use triggers to simulate errors and
          cache behavior.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="block text-sm font-medium">Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="border rounded p-2 w-full"
            >
              {["blog", "email", "summary", "presentation"].map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>

            <label className="block text-sm font-medium">Provider (stub)</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="border rounded p-2 w-full"
            >
              {["mock", "openai", "anthropic", "gemini"].map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            <label className="block text-sm font-medium" htmlFor="generate-input">
              Input
            </label>
            <textarea
              id="generate-input"
              aria-label="Input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="border rounded p-2 w-full min-h-[120px]"
            />

            <div className="flex items-center gap-4 text-sm">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={bypass}
                  onChange={(e) => setBypass(e.target.checked)}
                />{" "}
                x-cache-bypass
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={simulate429}
                  onChange={(e) => setSimulate429(e.target.checked)}
                />{" "}
                simulate 429
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={simulate500}
                  onChange={(e) => setSimulate500(e.target.checked)}
                />{" "}
                simulate 500
              </label>
            </div>

            <div className="flex gap-2">
              <button
                onClick={callJSON}
                disabled={streaming}
                className="bg-gray-900 text-white px-3 py-2 rounded"
              >
                Call JSON
              </button>
              <button
                onClick={callSSE}
                disabled={streaming}
                className="bg-blue-600 text-white px-3 py-2 rounded"
              >
                Stream SSE
              </button>
              <button
                onClick={() => {
                  cancel();
                  setStreaming(false);
                }}
                disabled={!streaming}
                className="bg-gray-200 px-3 py-2 rounded"
              >
                Cancel
              </button>
            </div>

            <div className="text-xs text-gray-500">
              Triggers: include TRIGGER_RATE_LIMIT or TRIGGER_ERROR in input via checkboxes above.
            </div>
          </div>

          <div className="space-y-3">
            {!!events.length && (
              <div>
                <div className="font-semibold mb-1">SSE Events</div>
                <pre className="bg-white border rounded p-2 max-h-[260px] overflow-auto">
                  {events
                    .map(
                      (l, i) => `[${l.t}] ${typeof l.v === "string" ? l.v : JSON.stringify(l.v)}\n`,
                    )
                    .join("")}
                </pre>
              </div>
            )}
            {json && (
              <div>
                <div className="font-semibold mb-1">JSON Result</div>
                <pre className="bg-white border rounded p-2 max-h-[260px] overflow-auto">
                  {JSON.stringify(json, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
