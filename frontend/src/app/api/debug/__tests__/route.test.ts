import { GET as listEndpoints } from "../endpoints/route";
import { GET as getLogs, POST as postLog } from "../logs/route";

// Mock fetch for consistency if needed (not used by debug endpoints)

describe("GET /api/debug/endpoints", () => {
  it("returns a list of endpoints", async () => {
    const res = await listEndpoints();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.total).toBeGreaterThan(0);
    expect(Array.isArray(body.endpoints)).toBe(true);
  });
});

describe("GET/POST /api/debug/logs", () => {
  it("appends and returns logs", async () => {
    const append = await postLog({
      json: async () => ({ level: "info", message: "hello-story", meta: { test: true } }),
    } as any);
    expect(append.status).toBe(200);

    const res = await getLogs();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.total).toBeGreaterThan(0);
    const last = body.logs[body.logs.length - 1];
    expect(last.message).toBe("hello-story");
    expect(last.level).toBe("info");
  });
});
