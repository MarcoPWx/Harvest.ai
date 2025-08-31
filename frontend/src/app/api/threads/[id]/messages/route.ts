import { NextRequest } from "next/server";
import { createSseStream } from "@/lib/server/sse";
import { __getThreadStore } from "@/app/api/threads/route";
import {
  checkAndConsume,
  buildRateHeaders,
  getIdentifierFromHeaders,
} from "@/lib/server/ratelimit";
import { logInfo } from "@/lib/server/log";

export const runtime = "nodejs";

function composeReply(prompt: string) {
  // Very simple deterministic reply for dev; replace with provider call later
  return `Here is a refined take:\n\n${prompt}\n\n— Assistant`;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const threads = __getThreadStore();
  const t = threads.get(id);
  if (!t)
    return new Response(JSON.stringify({ error: "thread not found" }), {
      status: 404,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Accept",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      },
    });

  let body: any = {};
  try {
    body = await req.json();
  } catch {}
  const content = (body?.content || "").toString();
  const role = (body?.role || "user") as "user" | "assistant";
  const provider = (body?.provider || "mock").toString();
  t.messages.push({ role, content, at: new Date().toISOString() });

  const accept = (req.headers.get("accept") || "").toLowerCase();
  const request_id =
    req.headers.get("x-request-id") || `req_${Math.random().toString(36).slice(2, 10)}`;

  // Rate limiting (dev)
  const identifier = getIdentifierFromHeaders(req.headers);
  const rl = checkAndConsume(identifier, 120, 60_000);
  const rlHeaders = buildRateHeaders(rl);
  if (!rl.allowed) {
    return new Response(
      JSON.stringify({
        error: "Rate limit exceeded",
        message: "Too many requests. Please try again later.",
        code: "RATE_LIMIT_EXCEEDED",
        retryAfter: Math.max(1, rl.reset - Math.ceil(Date.now() / 1000)),
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(Math.max(1, rl.reset - Math.ceil(Date.now() / 1000))),
          ...rlHeaders,
        },
      },
    );
  }

  logInfo("thread_message_start", {
    request_id,
    thread_id: id,
    provider,
    content_len: content.length,
  });
  const upper = content.toUpperCase();

  if (upper.includes("TRIGGER_RATE_LIMIT")) {
    return new Response(
      JSON.stringify({
        error: "Rate limit exceeded",
        message: "Too many requests. Please try again later.",
        code: "RATE_LIMIT_EXCEEDED",
        retryAfter: 60,
      }),
      { status: 429, headers: { "Content-Type": "application/json", "Retry-After": "60" } },
    );
  }
  if (upper.includes("TRIGGER_ERROR")) {
    return new Response(
      JSON.stringify({
        error: "Message handling failed",
        message: "An error occurred while generating a reply",
        code: "THREAD_MESSAGE_ERROR",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const reply = composeReply(content);

  if (accept.includes("text/event-stream")) {
    return createSseStream(async (w) => {
      w.send("meta", { model: "mock-gpt", thread_id: id, provider, request_id });
      const parts = reply.split(/(\s+)/);
      let acc = "";
      for (let i = 0; i < parts.length; i++) {
        acc += parts[i];
        if (i % 3 === 0) w.send("token", { text: parts[i] });
        await new Promise((r) => setTimeout(r, 20));
      }
      t.messages.push({ role: "assistant", content: acc, at: new Date().toISOString() });
      w.send("final", { content: acc, thread_id: id, provider, request_id });
      w.send("done", { ok: true });
      w.close();
      logInfo("thread_message_done", {
        request_id,
        thread_id: id,
        provider,
        length: acc.length,
      });
    }, rlHeaders);
  }

  // JSON mode
  t.messages.push({ role: "assistant", content: reply, at: new Date().toISOString() });
  logInfo("thread_message_done", {
    request_id,
    thread_id: id,
    provider,
    length: reply.length,
  });
  return new Response(
    JSON.stringify({ content: reply, thread_id: id, provider, request_id }),
    {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Accept",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        ...rlHeaders,
      },
    },
  );
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
