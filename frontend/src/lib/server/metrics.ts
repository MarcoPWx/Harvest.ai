export type Metrics = {
  req_total: number;
  sse_open: number;
  sse_done: number;
  sse_err: number;
  open_sse: number;
  gen_ms: number[];
};

const metrics: Metrics = {
  req_total: 0,
  sse_open: 0,
  sse_done: 0,
  sse_err: 0,
  open_sse: 0,
  gen_ms: [],
};

export function recordReqStart() {
  metrics.req_total += 1;
}

export function recordSseOpen() {
  metrics.sse_open += 1;
  metrics.open_sse += 1;
}

export function recordSseDone() {
  metrics.sse_done += 1;
  metrics.open_sse = Math.max(0, metrics.open_sse - 1);
}

export function recordSseErr() {
  metrics.sse_err += 1;
  metrics.open_sse = Math.max(0, metrics.open_sse - 1);
}

export function observeGenMs(ms: number) {
  metrics.gen_ms.push(ms);
  if (metrics.gen_ms.length > 1000) metrics.gen_ms.shift();
}

function p95(arr: number[]) {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.floor(0.95 * (sorted.length - 1));
  return sorted[idx];
}

export function getMetrics() {
  return {
    ...metrics,
    p95_gen_ms: p95(metrics.gen_ms),
  };
}
