import { NextRequest } from "next/server";
import {
  checkAndConsume,
  buildRateHeaders,
  getIdentifierFromHeaders,
} from "@/lib/server/ratelimit";
import { logInfo } from "@/lib/server/log";

export const runtime = "nodejs";

// In-memory thread store for dev
const threads = new Map<
  string,
  {
    created_at: string;
    title?: string;
    messages: Array<{ role: "user" | "assistant"; content: string; at: string }>;
  }
>();

export async function POST(req: NextRequest) {
  const identifier = getIdentifierFromHeaders(req.headers);
  const rl = checkAndConsume(identifier, 60, 60_000);
  const rlHeaders = buildRateHeaders(rl);
  if (!rl.allowed) {
    return new Response(
      JSON.stringify({ error: "Rate limit exceeded", code: "RATE_LIMIT_EXCEEDED" }),
      { status: 429, headers: { "Content-Type": "application/json", ...rlHeaders } },
    );
  }
  let body: any = {};
  try {
    body = await req.json();
  } catch {}
  const title = typeof body?.title === "string" ? body.title : undefined;
  const id = `thread_${crypto.randomUUID?.() || Math.random().toString(36).slice(2, 10)}`;
  const created_at = new Date().toISOString();
  threads.set(id, { created_at, title, messages: [] });
  logInfo("thread_create", { thread_id: id, title });
  return new Response(JSON.stringify({ thread_id: id, created_at, title }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Accept",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      ...rlHeaders,
    },
  });
}

export async function GET(req: NextRequest) {
  const identifier = getIdentifierFromHeaders(req.headers);
  const rl = checkAndConsume(identifier, 120, 60_000);
  const rlHeaders = buildRateHeaders(rl);
  if (!rl.allowed) {
    return new Response(
      JSON.stringify({ error: "Rate limit exceeded", code: "RATE_LIMIT_EXCEEDED" }),
      { status: 429, headers: { "Content-Type": "application/json", ...rlHeaders } },
    );
  }
  const url = new URL(req.url);
  const limit = Math.max(1, Math.min(100, Number(url.searchParams.get("limit") || "20")));
  const offset = Math.max(0, Number(url.searchParams.get("offset") || "0"));
  const all = [...threads.entries()].map(([id, t]) => ({
    id,
    created_at: t.created_at,
    title: t.title,
    size: t.messages.length,
  }));
  const data = all.slice(offset, offset + limit);
  const total = all.length;
  const next_offset = offset + limit < total ? offset + limit : null;
  logInfo("thread_list", { limit, offset, returned: data.length, total });
  return new Response(JSON.stringify({ data, total, limit, offset, next_offset }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Accept",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      ...rlHeaders,
    },
  });
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Accept",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    },
  });
}

// Export store for nested routes (not ideal but fine for dev)
export function __getThreadStore() {
  return threads;
}
