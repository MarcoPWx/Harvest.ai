import { addLog, searchMemory } from "@/app/api/_debug/state";

const GATEWAY = process.env.LOCAL_GATEWAY_URL || "http://localhost:3005";

export const runtime = "nodejs";

// POST /api/local-memory/search
// Body: { namespace?: string, query: string, topK?: number }
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      namespace?: string;
      query?: string;
      topK?: number;
    };
    const namespace = body.namespace || "default";
    const query = body.query?.toString() || "";
    const topK = typeof body.topK === "number" ? body.topK : 5;

    if (!query || query.trim().length === 0) {
      return Response.json({ error: "query is required" }, { status: 400 });
    }

    // Try gateway first
    try {
      const res = await fetch(`${GATEWAY}/local-memory/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ namespace, query, topK }),
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        addLog({ level: "info", message: "gateway.search.ok", meta: { namespace, topK } });
        return Response.json({ ok: true, backend: "gateway", results: data.results ?? data });
      }
      addLog({ level: "warn", message: "gateway.search.failed", meta: { status: res.status } });
    } catch (err) {
      addLog({
        level: "warn",
        message: "gateway.search.error",
        meta: { error: (err as Error).message },
      });
    }

    // Fallback to in-memory degraded mode
    const results = searchMemory(namespace, query, topK);
    return Response.json({ ok: true, backend: "memory", results });
  } catch (err: any) {
    addLog({ level: "error", message: "local-memory.search.error", meta: { error: err?.message } });
    return Response.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}
