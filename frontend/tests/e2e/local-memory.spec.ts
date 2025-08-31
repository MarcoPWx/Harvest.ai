import { test, expect } from "@playwright/test";

test.describe.skip("Local-Memory API (degraded fallback)", () => {
  test("indexes and searches using in-memory backend when gateway unavailable", async ({
    request,
  }) => {
    // Index text
    const indexRes = await request.post("/api/local-memory/index", {
      data: { namespace: "e2e", id: "n1", text: "Harvest.ai makes content transformation easy" },
    });
    // give the dev server a moment to retain memory state in-process
    await new Promise((r) => setTimeout(r, 100));
    expect(indexRes.ok()).toBeTruthy();
    const indexJson = await indexRes.json();
    expect(indexJson.backend).toBe("memory"); // gateway is not running by default in dev:mock

    // Search text
    const searchRes = await request.post("/api/local-memory/search", {
      data: { namespace: "e2e", query: "content transformation", topK: 5 },
    });
    expect(searchRes.ok()).toBeTruthy();
    const searchJson = await searchRes.json();
    expect(searchJson.backend).toBe("memory");
    expect(Array.isArray(searchJson.results)).toBe(true);
    expect(searchJson.results.length).toBeGreaterThan(0);
  });
});
