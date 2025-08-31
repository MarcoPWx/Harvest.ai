import { http, HttpResponse, delay } from "msw";
import { maybeInjectNetworkControls } from "./util";

// Simple in-session memory store for Storybook
const memory = new Map<string, Array<{ id: string; text: string; created_at: string }>>();

export const localMemoryHandlers = [
  http.post("/api/local-memory/index", async ({ request }) => {
    const injected = await maybeInjectNetworkControls(request as unknown as Request);
    if (injected) return injected;
    await delay(150);
    const body = (await request.json().catch(() => ({}))) as any;
    const namespace = body.namespace || "default";
    const id = body.id || `mem_${Date.now()}`;
    const text = (body.text || "").toString();

    if (!text) return HttpResponse.json({ error: "text is required" }, { status: 400 });

    const list = memory.get(namespace) || [];
    const idx = list.findIndex((x) => x.id === id);
    const item = { id, text, created_at: new Date().toISOString() };
    if (idx >= 0) list[idx] = item;
    else list.push(item);
    memory.set(namespace, list);

    return HttpResponse.json({ ok: true, backend: "memory", item: { id, namespace } });
  }),

  http.post("/api/local-memory/search", async ({ request }) => {
    const injected = await maybeInjectNetworkControls(request as unknown as Request);
    if (injected) return injected;
    await delay(150);
    const body = (await request.json().catch(() => ({}))) as any;
    const namespace = body.namespace || "default";
    const query = (body.query || "").toString().toLowerCase();
    const topK = typeof body.topK === "number" ? body.topK : 5;

    if (!query) return HttpResponse.json({ error: "query is required" }, { status: 400 });

    const list = memory.get(namespace) || [];
    const scored = list.map((it) => ({ id: it.id, text: it.text, score: score(query, it.text) }));
    scored.sort((a, b) => b.score - a.score);
    return HttpResponse.json({ ok: true, backend: "memory", results: scored.slice(0, topK) });
  }),
];

function score(q: string, text: string) {
  const tokens = q.split(/\s+/).filter(Boolean);
  const lower = text.toLowerCase();
  let hits = 0;
  for (const t of tokens) if (lower.includes(t)) hits++;
  return hits / Math.max(1, tokens.length);
}
