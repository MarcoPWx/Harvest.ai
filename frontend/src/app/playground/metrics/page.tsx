"use client";

import { useEffect, useState } from "react";

export default function MetricsPlaygroundPage() {
  const [data, setData] = useState<any>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch("/api/metrics", { cache: "no-store" });
        const json = await res.json().catch(() => null);
        if (mounted) setData(json?.data || json);
      } catch {}
    }
    load();
    const id = setInterval(() => {
      setTick((x) => x + 1);
      load();
    }, 1500);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        <h1 className="text-2xl font-bold">Metrics Playground</h1>
        <p className="text-gray-600">
          Live counters from <code>/api/metrics</code>. Refreshes every 1.5s.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Metric label="req_total" value={data?.req_total} />
          <Metric label="sse_open" value={data?.sse_open} />
          <Metric label="sse_done" value={data?.sse_done} />
          <Metric label="sse_err" value={data?.sse_err} />
          <Metric label="open_sse" value={data?.open_sse} />
          <Metric label="p95_gen_ms" value={data?.p95_gen_ms} />
        </div>
        <pre className="bg-white border rounded p-3 text-xs overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: any }) {
  return (
    <div className="border rounded p-3 bg-white">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-xl font-semibold">{value ?? "—"}</div>
    </div>
  );
}
