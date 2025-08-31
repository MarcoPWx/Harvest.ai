import { addLog, debugState } from "@/app/api/_debug/state";

export const runtime = "nodejs";

// GET /api/debug/logs -> returns recent logs
export async function GET() {
  return Response.json({ total: debugState.logs.length, logs: debugState.logs.slice(-200) });
}

// POST /api/debug/logs -> append a log
// Body: { level?: 'debug'|'info'|'warn'|'error', message: string, meta?: any }
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      level?: "debug" | "info" | "warn" | "error";
      message?: string;
      meta?: any;
    };
    if (!body.message) return Response.json({ error: "message is required" }, { status: 400 });
    const level = body.level || "info";
    const entry = addLog({ level, message: body.message, meta: body.meta });
    return Response.json({ ok: true, entry });
  } catch (err: any) {
    return Response.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}
