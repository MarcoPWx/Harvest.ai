"use client";

import { useRef, useState } from "react";

function useSSE() {
  const controllerRef = useRef<AbortController | null>(null);

  async function stream(
    url: string,
    init: RequestInit,
    onEvent: (e: { event: string; data: any }) => void,
  ) {
    const ctrl = new AbortController();
    controllerRef.current = ctrl;
    const res = await fetch(url, { ...init, signal: ctrl.signal });
    if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buffer.indexOf("\n\n")) !== -1) {
          const raw = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);
          const lines = raw.split("\n");
          let data = "";
          for (const line of lines) {
            if (line.startsWith("data:")) data += line.slice(5).trim();
          }
          if (data) {
            let obj: any = data;
            try {
              obj = JSON.parse(data);
            } catch {}
            onEvent({ event: "message", data: obj });
          }
        }
      }
    } finally {
      controllerRef.current = null;
    }
  }

  function cancel() {
    try {
      controllerRef.current?.abort();
    } catch {}
    controllerRef.current = null;
  }

  return { stream, cancel };
}

export default function SSEPlaygroundPage() {
  const [events, setEvents] = useState<Array<{ t: string; v: any }>>([]);
  const [streaming, setStreaming] = useState(false);
  const { stream, cancel } = useSSE();

  function push(t: string, v: any) {
    setEvents((prev) => [...prev, { t, v }]);
  }

  async function start() {
    setEvents([]);
    setStreaming(true);
    try {
      await stream(
        "/api/sse-demo",
        { method: "GET", headers: { Accept: "text/event-stream" } },
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
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        <h1 className="text-2xl font-bold">SSE Demo Playground</h1>
        <p className="text-gray-600">
          Connect to /api/sse-demo and observe events. Useful for learning SSE parsing.
        </p>
        <div className="flex gap-2">
          <button
            onClick={start}
            disabled={streaming}
            className="bg-blue-600 text-white px-3 py-2 rounded"
          >
            Start Stream
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
        {!!events.length && (
          <div>
            <div className="font-semibold mb-1">Events</div>
            <pre className="bg-white border rounded p-2 max-h-[320px] overflow-auto">
              {events
                .map((l, i) => `[${l.t}] ${typeof l.v === "string" ? l.v : JSON.stringify(l.v)}\n`)
                .join("")}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
