import { NextRequest } from "next/server";
import { requestHash } from "@/lib/server/hash";
import { createSseStream } from "@/lib/server/sse";
import {
  recordReqStart,
  recordSseOpen,
  recordSseDone,
  recordSseErr,
  observeGenMs,
} from "@/lib/server/metrics";
import {
  checkAndConsume,
  buildRateHeaders,
  getIdentifierFromHeaders,
} from "@/lib/server/ratelimit";
import { logInfo, logError } from "@/lib/server/log";

export const runtime = "nodejs";

// Simple in-memory cache for dev
const cache = new Map<string, { output: string; metadata: any }>();

import { generateWithProvider } from "@/lib/ai/providers";

function simulateOutput(input: string, format = "blog") {
  const base = input.trim() || "Harvest.ai content";
  if (format === "email")
    return `Subject: Update on ${base.slice(0, 24)}\n\nDear team,\n\n${base}...\n\nBest,\nHarvest.ai`;
  if (format === "summary")
    return `Executive Summary: ${base.slice(0, 80)}...\n- Point 1\n- Point 2\n- Point 3`;
  if (format === "presentation")
    return `# ${base}\n\n---\nSlide 1: Intro\n---\nSlide 2: Details\n---\nSlide 3: Wrap-up`;
  return `# ${base}\n\n## Introduction\n${base}...\n\n## Conclusion\nThanks for reading.`;
}

function approxTokens(s: string) {
  const words = s.split(/\s+/).filter(Boolean).length;
  const tokens = Math.round(words * 1.3);
  return tokens;
}

function buildJsonResult(
  input: string,
  output: string,
  format: string,
  cached = false,
  provider?: string,
  request_id?: string,
  model_used = "mock-gpt",
) {
  const tokens_used = approxTokens(output);
  const cost = +(tokens_used * 0.00002).toFixed(4);
  const quality_score = 90;
  const processing_time = cached ? 0 : Math.min(2500, 400 + Math.round(output.length / 2));
  return {
    result: output,
    cost: {
      tokens_used,
      estimated_cost: cost,
      model_used,
    },
    quality_score,
    processing_time,
    metadata: {
      format,
      provider,
      input_length: input.length,
      output_length: output.length,
      generated_at: new Date().toISOString(),
      cached,
      generation_id: `gen_${Math.random().toString(36).slice(2, 10)}`,
      request_id,
    },
  };
}

export async function POST(req: NextRequest) {
  // Allow triggers for E2E
  const headers: Headers =
    (req as any)?.headers && typeof (req as any).headers.get === "function"
      ? ((req as any).headers as Headers)
      : new Headers();
  const accept = (headers.get("accept") || "").toLowerCase();
  let body: any = {};
  try {
    body = await (req as any).json?.();
  } catch {}
  const input = (body?.input || "").toString();
  const format = (body?.format || "blog").toString();
  const provider = (body?.provider || "mock").toString();
  const request_id =
    headers.get("x-request-id") || `req_${Math.random().toString(36).slice(2, 10)}`;

  // Validate input
  if (!input || !input.trim()) {
    return new Response(JSON.stringify({ error: "Input content required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Rate limit (dev in-memory)
  const identifier = getIdentifierFromHeaders(headers);
  const rl = checkAndConsume(identifier, 60, 60_000);
  const rlHeaders = buildRateHeaders(rl);
  if (!rl.allowed) {
    logInfo("generate_rate_limited", { request_id, provider, format, identifier });
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

  const upper = input.toUpperCase();
  logInfo("generate_start", { request_id, provider, format, input_len: input.length });
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
        error: "Generation failed",
        message: "An error occurred during content generation",
        code: "GENERATION_ERROR",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  recordReqStart();
  const key = requestHash({ input, format });
  const bypass = headers.get("x-cache-bypass") === "1";
  const cached = !bypass && cache.get(key);

  // SSE mode if client asks for it
  if (accept.includes("text/event-stream")) {
    return createSseStream(async (w) => {
      recordSseOpen();
      const started = Date.now();
      try {
        if (cached) {
          w.send("cached", { cached: true });
          const cachedProvider = (cached.metadata && (cached.metadata as any).provider) || provider;
          const cachedModel =
            (cached.metadata && (cached.metadata as any).model_used) || "mock-gpt";
          w.send(
            "final",
            buildJsonResult(
              input,
              cached.output,
              format,
              true,
              cachedProvider,
              request_id,
              cachedModel,
            ),
          );
          w.send("done", { ok: true });
          w.close();
          observeGenMs(0);
          recordSseDone();
          return;
        }
        const { output, model } = await generateWithProvider(provider as any, {
          input,
          format: format as any,
        });
        const words = output.split(/(\s+)/);
        w.send("meta", { model, format, provider, request_id });
        let acc = "";
        for (let i = 0; i < words.length; i++) {
          const part = words[i];
          acc += part;
          // stream occasionally on word boundaries
          if (i % 3 === 0) w.send("token", { text: part });
          await new Promise((r) => setTimeout(r, 15));
        }
        const result = buildJsonResult(input, acc, format, false, provider, request_id, model);
        cache.set(key, { output: acc, metadata: result.metadata });
        w.send("final", result);
        w.send("done", { ok: true });
        w.close();
        observeGenMs(Date.now() - started);
        recordSseDone();
      } catch (e) {
        recordSseErr();
        throw e;
      }
    }, rlHeaders);
  }

  // JSON mode
  if (cached) {
    const payload = buildJsonResult(
      input,
      cached.output,
      format,
      true,
      (cached.metadata && (cached.metadata as any).provider) || provider,
      request_id,
      (cached.metadata && (cached.metadata as any).model_used) || "mock-gpt",
    );
    return new Response(JSON.stringify(payload), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Accept",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        ...rlHeaders,
      },
    });
  }
  const started = Date.now();
  const { output, model } = await generateWithProvider(provider as any, {
    input,
    format: format as any,
  });
  const result = buildJsonResult(input, output, format, false, provider, request_id, model);
  cache.set(key, { output, metadata: result.metadata });
  observeGenMs(Date.now() - started);
  const resp = new Response(JSON.stringify(result), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Accept",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      ...rlHeaders,
    },
  });
  logInfo("generate_done", {
    request_id,
    provider,
    format,
    duration_ms: Date.now() - started,
    cached: false,
  });
  return resp;
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
