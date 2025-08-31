import { NextRequest } from "next/server";

// GET /api/openapi.json -> Returns a minimal OpenAPI 3.0 spec for the current API
export async function GET(_req: NextRequest) {
  const spec = {
    openapi: "3.0.3",
    info: {
      title: "Harvest.ai API",
      version: "0.2.0",
      description: "OpenAPI spec for Harvest.ai dev API (mock-first + Supabase-backed routes).",
    },
    servers: [{ url: "http://localhost:3002" }],
    paths: {
      "/api/auth/signup": {
        post: { summary: "Signup", responses: { "200": { description: "OK" } } },
      },
      "/api/auth/login": {
        post: { summary: "Login", responses: { "200": { description: "OK" } } },
      },
      "/api/auth/logout": {
        post: { summary: "Logout", responses: { "200": { description: "OK" } } },
      },
      "/api/auth/session": {
        get: { summary: "Get session", responses: { "200": { description: "OK" } } },
      },

      "/api/users/me": {
        get: { summary: "Get current user", responses: { "200": { description: "OK" } } },
      },
      "/api/users/{userId}": {
        get: {
          summary: "Get user by id",
          parameters: [{ name: "userId", in: "path", required: true }],
          responses: { "200": { description: "OK" } },
        },
      },

      "/api/generate": {
        post: { summary: "Generate content", responses: { "200": { description: "OK" } } },
      },
      "/api/generations": {
        get: { summary: "List generations", responses: { "200": { description: "OK" } } },
      },
      "/api/generate/{id}": {
        get: {
          summary: "Get generation by id",
          parameters: [{ name: "id", in: "path", required: true }],
          responses: { "200": { description: "OK" } },
        },
        delete: {
          summary: "Delete generation by id",
          parameters: [{ name: "id", in: "path", required: true }],
          responses: { "200": { description: "OK" } },
        },
      },

      "/api/local-memory/index": {
        post: {
          summary: "Index text into local memory",
          responses: { "200": { description: "OK" } },
        },
      },
      "/api/local-memory/search": {
        post: { summary: "Search local memory", responses: { "200": { description: "OK" } } },
      },

      "/api/debug/endpoints": {
        get: { summary: "List endpoints", responses: { "200": { description: "OK" } } },
      },
      "/api/debug/logs": {
        get: { summary: "List recent logs", responses: { "200": { description: "OK" } } },
        post: { summary: "Append log entry", responses: { "200": { description: "OK" } } },
      },
    },
  };

  return new Response(JSON.stringify(spec), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
    },
  });
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
