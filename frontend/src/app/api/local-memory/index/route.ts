import { addLog, indexMemory, searchMemory } from "@/app/api/_debug/state";

const GATEWAY = process.env.LOCAL_GATEWAY_URL || "http://localhost:3005";

export const runtime = "nodejs";

// POST /api/local-memory/index
// Body: { namespace?: string, id?: string, text: string }
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      namespace?: string;
      id?: string;
      text?: string;
    };
    const namespace = body.namespace || "default";
    const id = body.id || `mem_${Date.now()}`;
    const text = body.text?.toString() || "";

    if (!text || text.trim().length === 0) {
      return Response.json({ error: "text is required" }, { status: 400 });
    }

    // Try gateway first
    try {
      const res = await fetch(`${GATEWAY}/local-memory/index`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ namespace, id, text }),
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        addLog({ level: "info", message: "gateway.index.ok", meta: { namespace, id } });
        return Response.json({ ok: true, backend: "gateway", data });
      }
      addLog({ level: "warn", message: "gateway.index.failed", meta: { status: res.status } });
    } catch (err) {
      addLog({
        level: "warn",
        message: "gateway.index.error",
        meta: { error: (err as Error).message },
      });
    }

    // Fallback to in-memory degraded mode
    indexMemory(namespace, { id, text, created_at: new Date().toISOString() });
    return Response.json({ ok: true, backend: "memory", item: { id, namespace } });
  } catch (err: any) {
    addLog({ level: "error", message: "local-memory.index.error", meta: { error: err?.message } });
    return Response.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}
