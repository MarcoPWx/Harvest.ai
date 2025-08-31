import { describe, it, expect } from "@jest/globals";
import {
  recordReqStart,
  recordSseOpen,
  recordSseDone,
  observeGenMs,
  getMetrics,
} from "@/lib/server/metrics";

describe("metrics counters & p95", () => {
  it("increments counters and computes p95", () => {
    const before = getMetrics();
    recordReqStart();
    recordSseOpen();
    observeGenMs(100);
    observeGenMs(200);
    observeGenMs(300);
    recordSseDone();
    const after = getMetrics();

    expect(after.req_total).toBeGreaterThanOrEqual((before.req_total || 0) + 1);
    expect(after.sse_open).toBeGreaterThanOrEqual((before.sse_open || 0) + 1);
    expect(after.sse_done).toBeGreaterThanOrEqual((before.sse_done || 0) + 1);
    expect(after.p95_gen_ms).toBeGreaterThanOrEqual(200);
  });
});
