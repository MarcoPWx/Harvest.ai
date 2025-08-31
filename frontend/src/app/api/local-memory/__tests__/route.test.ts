import { POST as indexRoute } from "../index/route";
import { POST as searchRoute } from "../search/route";

describe("local-memory endpoints (degraded mode)", () => {
  const origFetch = global.fetch;

  afterEach(() => {
    global.fetch = origFetch as any;
  });

  it("falls back to memory when gateway fails on index", async () => {
    // Simulate gateway error
    // @ts-ignore
    global.fetch = jest.fn().mockRejectedValue(new Error("gateway down"));

    const res = await indexRoute({
      json: async () => ({ namespace: "notes", id: "n1", text: "hello world" }),
    } as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.backend).toBe("memory");
  });

  it("falls back to memory when gateway fails on search", async () => {
    // Simulate gateway error
    // @ts-ignore
    global.fetch = jest.fn().mockRejectedValue(new Error("gateway down"));

    const res = await searchRoute({
      json: async () => ({ namespace: "notes", query: "hello", topK: 3 }),
    } as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.backend).toBe("memory");
    expect(Array.isArray(body.results)).toBe(true);
  });
});
