import { addLog, debugState } from "@/app/api/_debug/state";

export const runtime = "nodejs";

// GET /api/debug/endpoints -> returns a static list of implemented API endpoints
export async function GET() {
  const endpoints = [
    // Auth
    { method: "POST", path: "/api/auth/signup" },
    { method: "POST", path: "/api/auth/login" },
    { method: "POST", path: "/api/auth/logout" },
    { method: "GET", path: "/api/auth/session" },
    // Users
    { method: "GET", path: "/api/users/me" },
    { method: "GET", path: "/api/users/:userId" },
    // Generate
    { method: "POST", path: "/api/generate" },
    { method: "GET", path: "/api/generations" },
    { method: "GET", path: "/api/generate/:id" },
    { method: "DELETE", path: "/api/generate/:id" },
    // Local-memory (gateway/degraded)
    { method: "POST", path: "/api/local-memory/index" },
    { method: "POST", path: "/api/local-memory/search" },
    // Debug
    { method: "GET", path: "/api/debug/endpoints" },
    { method: "GET", path: "/api/debug/logs" },
    { method: "POST", path: "/api/debug/logs" },
    // OpenAPI
    { method: "GET", path: "/api/openapi.json" },
  ];

  addLog({ level: "info", message: "debug.endpoints.listed", meta: { total: endpoints.length } });
  return Response.json({ total: endpoints.length, endpoints });
}
