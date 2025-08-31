"use client";

import { useMemo, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";

function setCookie(name: string, value: string, days = 365) {
  try {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Expires=${expires}; Path=/`;
  } catch {}
}

function deleteCookie(name: string) {
  try {
    document.cookie = `${encodeURIComponent(name)}=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/`;
  } catch {}
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie.split(";").map((v) => v.trim());
  for (const kv of cookies) {
    if (!kv) continue;
    const idx = kv.indexOf("=");
    const k = idx === -1 ? kv : decodeURIComponent(kv.slice(0, idx));
    if (k === name) return decodeURIComponent(idx === -1 ? "" : kv.slice(idx + 1));
  }
  return null;
}

interface TimelineEntry {
  id: string;
  name: string;
  method: string;
  url: string;
  status: number | string;
  ms: number;
  startedAt: string;
  error?: string;
  bodySnippet?: string;
}

export default function NetworkPlaygroundPage() {
  const isDev = process.env.NODE_ENV !== "production";
  if (!isDev) {
    // NotFound throws; do not early return to keep Hooks order consistent
    notFound();
  }

  // Global defaults persisted in cookies + localStorage
  const [globalDelay, setGlobalDelay] = useState<number>(() => {
    const ck = getCookie("harvest_mock_delay");
    if (ck) return parseInt(ck, 10) || 0;
    const ls =
      typeof window !== "undefined" ? window.localStorage.getItem("harvest_mock_delay") : null;
    return ls ? parseInt(ls, 10) || 0 : 0;
  });
  const [globalErrorRate, setGlobalErrorRate] = useState<number>(() => {
    const ck = getCookie("harvest_mock_error_rate");
    if (ck) return parseFloat(ck) || 0;
    const ls =
      typeof window !== "undefined" ? window.localStorage.getItem("harvest_mock_error_rate") : null;
    return ls ? parseFloat(ls) || 0 : 0;
  });

  // Per-request overrides
  const [delayOverride, setDelayOverride] = useState<number>(0);
  const [errorRateOverride, setErrorRateOverride] = useState<number>(0);

  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const addTimeline = (e: TimelineEntry) => setTimeline((prev) => [e, ...prev].slice(0, 50));

  const headersFromOverrides = useMemo(() => {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    if (delayOverride > 0) h["x-mock-delay"] = String(delayOverride);
    if (errorRateOverride > 0) h["x-mock-error-rate"] = String(errorRateOverride);
    return h;
  }, [delayOverride, errorRateOverride]);

  function persistGlobals() {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("harvest_mock_delay", String(globalDelay || 0));
    window.localStorage.setItem("harvest_mock_error_rate", String(globalErrorRate || 0));
    setCookie("harvest_mock_delay", String(globalDelay || 0));
    setCookie("harvest_mock_error_rate", String(globalErrorRate || 0));
  }

  function setGlobalsAndPersist(delayMs: number, errorRate: number) {
    setGlobalDelay(delayMs);
    setGlobalErrorRate(errorRate);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("harvest_mock_delay", String(delayMs || 0));
      window.localStorage.setItem("harvest_mock_error_rate", String(errorRate || 0));
      setCookie("harvest_mock_delay", String(delayMs || 0));
      setCookie("harvest_mock_error_rate", String(errorRate || 0));
    }
  }

  function clearGlobals() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem("harvest_mock_delay");
    window.localStorage.removeItem("harvest_mock_error_rate");
    deleteCookie("harvest_mock_delay");
    deleteCookie("harvest_mock_error_rate");
    setGlobalDelay(0);
    setGlobalErrorRate(0);
  }

  async function run(name: string, method: string, url: string, body?: any) {
    const t0 = performance.now();
    let status: number | string = "ERR";
    let err: string | undefined;
    let snippet: string | undefined;
    try {
      const res = await fetch(url, {
        method,
        headers: headersFromOverrides,
        body: body ? JSON.stringify(body) : undefined,
      });
      status = res.status;
      try {
        const txt = await res.text();
        snippet = txt.slice(0, 400);
      } catch {}
    } catch (e: any) {
      err = e?.message || String(e);
    }
    const ms = Math.round(performance.now() - t0);
    addTimeline({
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name,
      method,
      url,
      status,
      ms,
      startedAt: new Date().toLocaleTimeString(),
      error: err,
      bodySnippet: snippet,
    });
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-2">Network Playground</h1>
      <p className="text-gray-600 mb-6">
        Dev-only page to simulate latency/errors across endpoints and visualize a request timeline.
        Global defaults affect all mock handlers via cookies; per-request overrides add headers.
      </p>

      <div className="mb-8 p-4 border rounded bg-gray-50">
        <h2 className="text-lg font-semibold mb-2">Global Mock Defaults</h2>
        <p className="text-sm text-gray-600 mb-3">
          Saved to cookies (harvest_mock_delay, harvest_mock_error_rate) and localStorage. Handlers
          read cookies automatically.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="text-sm block mb-1">Global latency (ms)</label>
            <input
              type="number"
              className="w-full border rounded px-3 py-2 text-sm"
              value={globalDelay}
              min={0}
              onChange={(e) => setGlobalDelay(parseInt(e.target.value || "0", 10))}
            />
          </div>
          <div>
            <label className="text-sm block mb-1">Global error rate (0..1)</label>
            <input
              type="number"
              className="w-full border rounded px-3 py-2 text-sm"
              value={globalErrorRate}
              min={0}
              max={1}
              step={0.1}
              onChange={(e) => setGlobalErrorRate(parseFloat(e.target.value || "0"))}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={persistGlobals}
              className="flex-1 bg-blue-600 text-white rounded px-4 py-2 text-sm"
            >
              Save defaults
            </button>
            <button
              onClick={clearGlobals}
              className="flex-1 bg-gray-200 text-gray-900 rounded px-4 py-2 text-sm"
            >
              Clear
            </button>
          </div>
          <div className="text-xs text-gray-500">
            Tip: Defaults apply to all requests unless overridden via headers.
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-sm font-semibold mb-2">Profile presets</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setGlobalsAndPersist(0, 0)}
              className="bg-gray-200 text-gray-900 rounded px-3 py-1 text-xs"
            >
              No Errors
            </button>
            <button
              onClick={() => setGlobalsAndPersist(80, 0.02)}
              className="bg-gray-200 text-gray-900 rounded px-3 py-1 text-xs"
            >
              Office WiFi
            </button>
            <button
              onClick={() => setGlobalsAndPersist(400, 0.03)}
              className="bg-gray-200 text-gray-900 rounded px-3 py-1 text-xs"
            >
              Good 3G
            </button>
            <button
              onClick={() => setGlobalsAndPersist(2000, 0.3)}
              className="bg-gray-200 text-gray-900 rounded px-3 py-1 text-xs"
            >
              Flaky WiFi
            </button>
          </div>
        </div>
      </div>

      <div className="mb-8 p-4 border rounded">
        <h2 className="text-lg font-semibold mb-2">Batch Runner</h2>
        <p className="text-sm text-gray-600 mb-3">
          Run a batch of endpoints and visualize timings. Uses per-request overrides (headers) in
          this section; global defaults still apply via cookies.
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            onClick={async () => {
              const endpoints = [
                {
                  name: "Generate (success)",
                  method: "POST",
                  url: "/api/generate",
                  body: { input: "Batch test", format: "blog" },
                },
                {
                  name: "Generate (rate limit)",
                  method: "POST",
                  url: "/api/generate",
                  body: { input: "TRIGGER_RATE_LIMIT", format: "blog" },
                },
                { name: "Debug endpoints", method: "GET", url: "/api/debug/endpoints" },
                {
                  name: "LocalMemory search",
                  method: "POST",
                  url: "/api/local-memory/search",
                  body: { namespace: "notes", query: "batch", topK: 3 },
                },
              ];
              const results: Array<{ name: string; ms: number; status: number | string }> = [];
              for (const ep of endpoints) {
                const t0 = performance.now();
                let status: number | string = "ERR";
                try {
                  const res = await fetch(ep.url, {
                    method: ep.method,
                    headers: {
                      "Content-Type": "application/json",
                      ...(delayOverride > 0 ? { "x-mock-delay": String(delayOverride) } : {}),
                      ...(errorRateOverride > 0
                        ? { "x-mock-error-rate": String(errorRateOverride) }
                        : {}),
                    },
                    body: ep.body ? JSON.stringify(ep.body) : undefined,
                  });
                  status = res.status;
                  await res.text().catch(() => {});
                } catch (e) {
                  status = "ERR";
                }
                const ms = Math.round(performance.now() - t0);
                results.push({ name: ep.name, ms, status });
              }
              // Simple ASCII bars
              const max = Math.max(...results.map((r) => r.ms), 1);
              const lines = results
                .map((r) => {
                  const bar = "#".repeat(Math.max(1, Math.round((r.ms / max) * 40)));
                  return `${r.ms.toString().padStart(4, " ")}ms | ${bar} | ${r.name} (${r.status})`;
                })
                .join("\n");
              alert(lines);
            }}
            className="bg-blue-600 text-white rounded px-4 py-2 text-sm"
          >
            Run batch (ASCII)
          </button>

          <button
            onClick={async () => {
              const endpoints = [
                {
                  name: "Generate (success)",
                  method: "POST",
                  url: "/api/generate",
                  body: { input: "Batch test", format: "blog" },
                },
                {
                  name: "Generate (rate limit)",
                  method: "POST",
                  url: "/api/generate",
                  body: { input: "TRIGGER_RATE_LIMIT", format: "blog" },
                },
                { name: "Debug endpoints", method: "GET", url: "/api/debug/endpoints" },
                {
                  name: "LocalMemory search",
                  method: "POST",
                  url: "/api/local-memory/search",
                  body: { namespace: "notes", query: "batch", topK: 3 },
                },
              ];
              const rows = [["name", "method", "url", "status", "ms"]];
              for (const ep of endpoints) {
                const t0 = performance.now();
                let status: number | string = "ERR";
                try {
                  const res = await fetch(ep.url, {
                    method: ep.method,
                    headers: {
                      "Content-Type": "application/json",
                      ...(delayOverride > 0 ? { "x-mock-delay": String(delayOverride) } : {}),
                      ...(errorRateOverride > 0
                        ? { "x-mock-error-rate": String(errorRateOverride) }
                        : {}),
                    },
                    body: ep.body ? JSON.stringify(ep.body) : undefined,
                  });
                  status = res.status;
                  await res.text().catch(() => {});
                } catch (e) {
                  status = "ERR";
                }
                const ms = Math.round(performance.now() - t0);
                rows.push([ep.name, ep.method, ep.url, String(status), String(ms)]);
              }
              const csv = rows
                .map((r) => r.map((v) => `"${v.replaceAll('"', '""')}"`).join(","))
                .join("\n");
              const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `network_batch_${Date.now()}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="bg-gray-200 text-gray-900 rounded px-4 py-2 text-sm"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="mb-8 p-4 border rounded">
        <h2 className="text-lg font-semibold mb-2">Per-request Overrides</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div>
            <label className="text-sm block mb-1">x-mock-delay (ms)</label>
            <input
              type="number"
              className="w-full border rounded px-3 py-2 text-sm"
              value={delayOverride}
              min={0}
              onChange={(e) => setDelayOverride(parseInt(e.target.value || "0", 10))}
            />
          </div>
          <div>
            <label className="text-sm block mb-1">x-mock-error-rate (0..1)</label>
            <input
              type="number"
              className="w-full border rounded px-3 py-2 text-sm"
              value={errorRateOverride}
              min={0}
              max={1}
              step={0.1}
              onChange={(e) => setErrorRateOverride(parseFloat(e.target.value || "0"))}
            />
          </div>
          <div className="text-xs text-gray-500">
            Overrides are sent as headers for the following requests.
          </div>
        </div>
      </div>

      <div className="mb-8 p-4 border rounded">
        <h2 className="text-lg font-semibold mb-2">Quick endpoints</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <button
            className="bg-indigo-600 text-white rounded px-4 py-2 text-sm"
            onClick={() =>
              run("Generate (success)", "POST", "/api/generate", {
                input: "Hello from /dev/network",
                format: "blog",
              })
            }
          >
            Generate (success)
          </button>
          <button
            className="bg-indigo-600 text-white rounded px-4 py-2 text-sm"
            onClick={() =>
              run("Generate (rate limit)", "POST", "/api/generate", {
                input: "TRIGGER_RATE_LIMIT",
                format: "blog",
              })
            }
          >
            Generate (rate limit)
          </button>
          <button
            className="bg-indigo-600 text-white rounded px-4 py-2 text-sm"
            onClick={() =>
              run("Generate (error)", "POST", "/api/generate", {
                input: "TRIGGER_ERROR",
                format: "blog",
              })
            }
          >
            Generate (error)
          </button>
          <button
            className="bg-indigo-600 text-white rounded px-4 py-2 text-sm"
            onClick={() =>
              run("Generate (cached)", "POST", "/api/generate", {
                input: "TRIGGER_CACHED",
                format: "blog",
              })
            }
          >
            Generate (cached)
          </button>
          <button
            className="bg-teal-600 text-white rounded px-4 py-2 text-sm"
            onClick={() => run("Debug endpoints", "GET", "/api/debug/endpoints")}
          >
            Debug endpoints
          </button>
          <button
            className="bg-teal-600 text-white rounded px-4 py-2 text-sm"
            onClick={() =>
              run("Debug append log", "POST", "/api/debug/logs", {
                level: "info",
                message: "hello from /dev/network",
              })
            }
          >
            Debug append log
          </button>
          <button
            className="bg-emerald-600 text-white rounded px-4 py-2 text-sm"
            onClick={() =>
              run("LocalMemory index", "POST", "/api/local-memory/index", {
                namespace: "notes",
                id: `n_${Date.now()}`,
                text: "Network playground sample text",
              })
            }
          >
            LocalMemory index
          </button>
          <button
            className="bg-emerald-600 text-white rounded px-4 py-2 text-sm"
            onClick={() =>
              run("LocalMemory search", "POST", "/api/local-memory/search", {
                namespace: "notes",
                query: "sample",
                topK: 5,
              })
            }
          >
            LocalMemory search
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Headers sent (overrides): {JSON.stringify(headersFromOverrides)}
        </p>
      </div>

      <div className="mb-8 p-4 border rounded bg-white">
        <h2 className="text-lg font-semibold mb-2">Timeline</h2>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-2">Time</th>
                <th className="py-2 pr-2">Name</th>
                <th className="py-2 pr-2">Method</th>
                <th className="py-2 pr-2">URL</th>
                <th className="py-2 pr-2">Status</th>
                <th className="py-2 pr-2">ms</th>
              </tr>
            </thead>
            <tbody>
              {timeline.length ? (
                timeline.map((e) => (
                  <tr key={e.id} className="border-b align-top">
                    <td className="py-2 pr-2 whitespace-nowrap">{e.startedAt}</td>
                    <td className="py-2 pr-2">{e.name}</td>
                    <td className="py-2 pr-2">{e.method}</td>
                    <td className="py-2 pr-2 text-xs text-gray-600">{e.url}</td>
                    <td className="py-2 pr-2">{e.status}</td>
                    <td className="py-2 pr-2">{e.ms}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-3 text-gray-500" colSpan={6}>
                    (no requests yet)
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {timeline.length > 0 && (
          <div className="mt-4">
            <h3 className="font-medium mb-1">Last response snippet</h3>
            <pre className="text-xs whitespace-pre-wrap bg-gray-50 border rounded p-2 overflow-auto">
              {timeline[0].error
                ? `[error] ${timeline[0].error}`
                : timeline[0].bodySnippet || "(no body)"}
            </pre>
          </div>
        )}
      </div>

      <div className="text-sm text-gray-600">
        <Link className="text-blue-600 hover:underline" href="/dev/tools">
          Back to Dev Tools
        </Link>
      </div>
    </div>
  );
}
