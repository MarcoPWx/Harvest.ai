"use client";

import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default function DevToolsPage() {
  const isDev = process.env.NODE_ENV !== "production";
  if (!isDev) {
    // NotFound throws; do not early return to keep Hooks order consistent
    notFound();
  }

  const mswEnabled = process.env.NEXT_PUBLIC_ENABLE_MSW === "1";

  const [trigger, setTrigger] = useState<
    "none" | "TRIGGER_RATE_LIMIT" | "TRIGGER_ERROR" | "TRIGGER_CACHED"
  >("none");
  const [input, setInput] = useState<string>("Try the generate API from here!");
  const [status, setStatus] = useState<string>("");
  const [body, setBody] = useState<unknown>(null);
  const [loading, setLoading] = useState<boolean>(false);
  // Network controls for MSW (headers)
  const [mockDelayMs, setMockDelayMs] = useState<number>(0);
  const [mockErrorRate, setMockErrorRate] = useState<number>(0);

  // SSE viewer state
  const [sseUrl, setSseUrl] = useState<string>("http://localhost:3002/api/sse-demo");
  const [sseRunning, setSseRunning] = useState<boolean>(false);
  const [sseEvents, setSseEvents] = useState<string[]>([]);
  const esRef = useRef<EventSource | null>(null);

  const effectiveInput = useMemo(() => {
    if (trigger === "none") return input;
    return trigger;
  }, [trigger, input]);

  const callGenerate = useCallback(async () => {
    setLoading(true);
    setStatus("");
    setBody(null);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (mockDelayMs > 0) headers["x-mock-delay"] = String(mockDelayMs);
      if (mockErrorRate > 0) headers["x-mock-error-rate"] = String(mockErrorRate);
      const res = await fetch("/api/generate", {
        method: "POST",
        headers,
        body: JSON.stringify({ input: effectiveInput, format: "blog" }),
      });
      setStatus(`HTTP ${res.status}`);
      let json: unknown = null;
      try {
        json = await res.json();
      } catch {}
      setBody(json);
    } catch (e: unknown) {
      setStatus(`Error: ${e instanceof Error ? e.message : "unknown"}`);
    } finally {
      setLoading(false);
    }
  }, [effectiveInput, mockDelayMs, mockErrorRate]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-4">Developer Tools</h1>
      <p className="text-gray-600 mb-8">Local-only toolbox. This page 404s in production builds.</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Environment</h2>
        <ul className="list-disc pl-6 text-sm text-gray-700">
          <li>
            NODE_ENV: <code>{process.env.NODE_ENV}</code>
          </li>
          <li>
            MSW enabled: <code>{mswEnabled ? "yes (NEXT_PUBLIC_ENABLE_MSW=1)" : "no"}</code>
          </li>
        </ul>
        {!mswEnabled && (
          <p className="mt-2 text-xs text-gray-500">
            Tip: run <code>npm run dev:mock</code> to enable MSW and mock WebSocket in the browser.
          </p>
        )}
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Quick links</h2>
        <ul className="list-disc pl-6 text-blue-700">
          <li>
            <Link className="hover:underline" href="/docs">
              Docs Index
            </Link>
          </li>
          <li>
            <Link className="hover:underline" href="/docs/api">
              Swagger UI
            </Link>
          </li>
          <li>
            <Link className="hover:underline" href="/api/openapi.json">
              OpenAPI JSON
            </Link>
          </li>
          <li>
            <a
              className="hover:underline"
              href="http://localhost:6006"
              target="_blank"
              rel="noreferrer"
            >
              Storybook (localhost:6006)
            </a>
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">API Playground: POST /api/generate</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <label className="text-sm">Trigger</label>
            <select
              className="border rounded px-2 py-1 text-sm"
              value={trigger}
              onChange={(e) =>
                setTrigger(
                  e.target.value as
                    | "none"
                    | "TRIGGER_RATE_LIMIT"
                    | "TRIGGER_ERROR"
                    | "TRIGGER_CACHED",
                )
              }
            >
              <option value="none">none</option>
              <option value="TRIGGER_RATE_LIMIT">TRIGGER_RATE_LIMIT (429)</option>
              <option value="TRIGGER_ERROR">TRIGGER_ERROR (error)</option>
              <option value="TRIGGER_CACHED">TRIGGER_CACHED (cached)</option>
            </select>
          </div>
          {trigger === "none" && (
            <div>
              <label className="text-sm block mb-1">Input</label>
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Write me a short blog post about Harvest.ai"
              />
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div>
              <label className="text-sm block mb-1">x-mock-delay (ms)</label>
              <input
                type="number"
                className="w-full border rounded px-3 py-2 text-sm"
                value={mockDelayMs}
                onChange={(e) => setMockDelayMs(parseInt(e.target.value || "0", 10))}
                min={0}
              />
            </div>
            <div>
              <label className="text-sm block mb-1">x-mock-error-rate (0..1)</label>
              <input
                type="number"
                className="w-full border rounded px-3 py-2 text-sm"
                value={mockErrorRate}
                onChange={(e) => setMockErrorRate(parseFloat(e.target.value || "0"))}
                step={0.1}
                min={0}
                max={1}
              />
            </div>
            <div>
              <button
                onClick={callGenerate}
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white rounded px-4 py-2 text-sm disabled:opacity-50"
              >
                {loading ? "Calling…" : "POST /api/generate"}
              </button>
            </div>
          </div>
          {status && (
            <div className="mt-2 text-sm">
              <div className="font-mono">{status}</div>
              <pre className="mt-2 text-xs whitespace-pre-wrap bg-gray-50 border rounded p-2 overflow-auto">
                {body ? JSON.stringify(body, null, 2) : "(no body)"}
              </pre>
            </div>
          )}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">SSE Viewer: GET /api/sse-demo</h2>
        <div className="space-y-3">
          <div>
            <label className="text-sm block mb-1">SSE URL</label>
            <input
              className="w-full border rounded px-3 py-2 text-sm"
              value={sseUrl}
              onChange={(e) => setSseUrl(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (sseRunning) return;
                try {
                  const es = new EventSource(sseUrl);
                  esRef.current = es;
                  setSseEvents([]);
                  setSseRunning(true);
                  es.onmessage = (e) => {
                    setSseEvents((prev) => [...prev, e.data]);
                  };
                  es.onerror = () => {
                    setSseEvents((prev) => [...prev, "[error]"]);
                    setSseRunning(false);
                    try {
                      es.close();
                    } catch {}
                    esRef.current = null;
                  };
                } catch (e) {
                  setSseEvents((prev) => [...prev, `[exception] ${String(e)}`]);
                }
              }}
              disabled={sseRunning}
              className="inline-flex items-center gap-2 bg-green-600 text-white rounded px-4 py-2 text-sm disabled:opacity-50"
            >
              Start
            </button>
            <button
              onClick={() => {
                try {
                  esRef.current?.close();
                } catch {}
                esRef.current = null;
                setSseRunning(false);
              }}
              disabled={!sseRunning}
              className="inline-flex items-center gap-2 bg-gray-200 text-gray-900 rounded px-4 py-2 text-sm disabled:opacity-50"
            >
              Stop
            </button>
          </div>
          <pre className="mt-2 text-xs whitespace-pre-wrap bg-gray-50 border rounded p-2 overflow-auto min-h-[120px]">
            {sseEvents.length ? sseEvents.join("\n") : "(no events yet)"}
          </pre>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">WebSocket Client (mock)</h2>
        <WsClient />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Notes</h2>
        <ul className="list-disc pl-6 text-sm text-gray-700 space-y-1">
          <li>Mock triggers only work when MSW is enabled (mock mode).</li>
          <li>
            Use x-mock-delay and x-mock-error-rate headers to inject latency and errors in MSW
            handlers.
          </li>
          <li>
            Global defaults (cookies) can be set in{" "}
            <a className="text-blue-600 hover:underline" href="/dev/network">
              /dev/network
            </a>
            .
          </li>
          <li>
            For streaming/realtime debugging, use the SSE viewer here or Storybook’s live fallback
            demo.
          </li>
          <li>Swagger UI reflects /api/openapi.json. Keep it in sync with backend changes.</li>
        </ul>
      </section>
    </div>
  );
}

function WsClient() {
  const [wsUrl, setWsUrl] = useState("ws://localhost:3002/ws/generation?jobId=dev-tools");
  const [autoReconnect, setAutoReconnect] = useState(true);
  const [running, setRunning] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const [attempt, setAttempt] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(
    () => () => {
      try {
        wsRef.current?.close();
      } catch {}
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const push = (line: string) => setEvents((prev) => [...prev, line]);

  function connect(initial = false) {
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      setRunning(true);
      push("[WS] connecting...");
      ws.onopen = () => {
        push("[WS] open");
        setAttempt(0);
      };
      ws.onmessage = (e) => push(`[WS] ${typeof e.data === "string" ? e.data : "(binary)"} `);
      ws.onerror = () => push("[WS] error");
      ws.onclose = () => {
        push("[WS] closed");
        setRunning(false);
        if (autoReconnect) {
          const next = Math.min(5000, (attempt + 1) * 1000);
          setAttempt((a) => a + 1);
          timerRef.current = setTimeout(() => connect(), next);
          push(`[WS] reconnect in ${next}ms`);
        }
      };
    } catch (e) {
      push(`[WS] exception: ${String(e)}`);
      setRunning(false);
    }
  }

  function start() {
    setEvents([]);
    setAttempt(0);
    connect(true);
  }

  function stop() {
    try {
      wsRef.current?.close();
    } catch {}
    if (timerRef.current) clearTimeout(timerRef.current);
    setRunning(false);
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
        <div>
          <label className="text-sm block mb-1">WS URL</label>
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            value={wsUrl}
            onChange={(e) => setWsUrl(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            id="ws-auto"
            type="checkbox"
            checked={autoReconnect}
            onChange={(e) => setAutoReconnect(e.target.checked)}
          />
          <label htmlFor="ws-auto" className="text-sm">
            Auto-reconnect
          </label>
        </div>
        <div className="flex gap-2">
          <button
            onClick={start}
            disabled={running}
            className="flex-1 bg-purple-600 text-white rounded px-4 py-2 text-sm disabled:opacity-50"
          >
            Connect
          </button>
          <button
            onClick={stop}
            disabled={!running}
            className="flex-1 bg-gray-200 text-gray-900 rounded px-4 py-2 text-sm disabled:opacity-50"
          >
            Disconnect
          </button>
        </div>
      </div>
      <pre className="text-xs whitespace-pre-wrap bg-gray-50 border rounded p-2 overflow-auto min-h-[120px]">
        {events.length ? events.join("\n") : "(no messages yet)"}
      </pre>
    </div>
  );
}
