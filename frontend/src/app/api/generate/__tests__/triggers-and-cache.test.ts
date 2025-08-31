// Mock next/server minimal API used by route import if needed
jest.mock("next/server", () => ({
  NextRequest: class {},
  NextResponse: {
    json: (body: any, init?: any) => ({
      status: (init && init.status) || 200,
      json: async () => body,
    }),
  },
}));

// Keep external dependencies quiet for unit context
jest.mock("@/lib/server/metrics", () => ({
  recordReqStart: jest.fn(),
  recordSseOpen: jest.fn(),
  recordSseDone: jest.fn(),
  recordSseErr: jest.fn(),
  observeGenMs: jest.fn(),
}));

jest.mock("@/lib/server/log", () => ({ logInfo: jest.fn(), logError: jest.fn() }));

jest.mock("@/lib/server/ratelimit", () => ({
  getIdentifierFromHeaders: () => "test-id",
  checkAndConsume: () => ({ allowed: true, reset: Math.ceil(Date.now() / 1000) + 60 }),
  buildRateHeaders: () => ({}),
}));

describe("/api/generate JSON triggers and caching", () => {
  it("returns 500 for TRIGGER_ERROR", async () => {
    const req = {
      headers: new Headers({ Accept: "application/json" }),
      async json() { return { input: "please TRIGGER_ERROR now", format: "blog" }; },
    } as any;
    const { POST } = await import("@/app/api/generate/route");
    const res = await POST(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(String(body?.error || body?.message || "")).toMatch(/error|failed/i);
  });

  it("caches repeated input (second call cached=true, processing_time=0)", async () => {
    const req1 = {
      headers: new Headers({ Accept: "application/json" }),
      async json() { return { input: "cache-this", format: "blog" }; },
    } as any;
    const { POST } = await import("@/app/api/generate/route");
    const r1 = await POST(req1);
    expect(r1.status).toBe(200);
    const j1 = await r1.json();
    expect(j1?.metadata?.cached || false).toBeFalsy();

    const req2 = {
      headers: new Headers({ Accept: "application/json" }),
      async json() { return { input: "cache-this", format: "blog" }; },
    } as any;
    const r2 = await POST(req2);
    expect(r2.status).toBe(200);
    const j2 = await r2.json();
    expect(j2?.metadata?.cached).toBeTruthy();
    expect(j2?.processing_time).toBe(0);
  });
});

