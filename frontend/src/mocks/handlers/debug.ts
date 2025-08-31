import { http, HttpResponse, delay } from "msw";
import { maybeInjectNetworkControls } from "./util";

// Ephemeral in-memory state for Storybook session
const logs: Array<{ ts: string; level: string; message: string; meta?: any }> = [];

export const debugHandlers = [
  // List endpoints (mocked snapshot)
  http.get("/api/debug/endpoints", async ({ request }) => {
    const injected = await maybeInjectNetworkControls(request as unknown as Request);
    if (injected) return injected;
    await delay(200);
    const endpoints = [
      { method: "POST", path: "/api/generate" },
      { method: "GET", path: "/api/generations" },
      { method: "GET", path: "/api/generate/:id" },
      { method: "DELETE", path: "/api/generate/:id" },
      { method: "POST", path: "/api/local-memory/index" },
      { method: "POST", path: "/api/local-memory/search" },
      { method: "GET", path: "/api/debug/endpoints" },
      { method: "GET", path: "/api/debug/logs" },
      { method: "POST", path: "/api/debug/logs" },
      { method: "GET", path: "/api/openapi.json" },
    ];
    return HttpResponse.json({ total: endpoints.length, endpoints });
  }),

  // Get logs
  http.get("/api/debug/logs", async ({ request }) => {
    const injected = await maybeInjectNetworkControls(request as unknown as Request);
    if (injected) return injected;
    await delay(100);
    return HttpResponse.json({ total: logs.length, logs });
  }),

  // Append log
  http.post("/api/debug/logs", async ({ request }) => {
    const injected = await maybeInjectNetworkControls(request as unknown as Request);
    if (injected) return injected;
    const body = (await request.json().catch(() => ({}))) as any;
    const entry = {
      ts: new Date().toISOString(),
      level: body.level || "info",
      message: body.message || "log",
      meta: body.meta || {},
    };
    logs.push(entry);
    if (logs.length > 1000) logs.shift();
    return HttpResponse.json({ ok: true, entry });
  }),
];
