export type LogEntry = {
  ts: string;
  level: "debug" | "info" | "warn" | "error";
  message: string;
  meta?: any;
};

export type MemoryItem = {
  id: string;
  text: string;
  created_at: string;
};

// Global in-memory dev state (persisting for the life of the dev server process)
export const debugState = {
  logs: [] as LogEntry[],
  memory: new Map<string, MemoryItem[]>(), // namespace -> items
};

export function addLog(entry: Omit<LogEntry, "ts"> & { ts?: string }) {
  const e: LogEntry = {
    ts: entry.ts ?? new Date().toISOString(),
    level: entry.level,
    message: entry.message,
    meta: entry.meta,
  };
  debugState.logs.push(e);
  if (debugState.logs.length > 1000) debugState.logs.shift();
  return e;
}

export function indexMemory(namespace: string, item: MemoryItem) {
  const list = debugState.memory.get(namespace) ?? [];
  const idx = list.findIndex((x) => x.id === item.id);
  if (idx >= 0) list[idx] = item;
  else list.push(item);
  debugState.memory.set(namespace, list);
  addLog({
    level: "info",
    message: "memory.index",
    meta: { namespace, id: item.id, size: list.length },
  });
}

export function searchMemory(namespace: string, query: string, topK = 5) {
  const list = debugState.memory.get(namespace) ?? [];
  const scored = list.map((it) => ({
    item: it,
    score: score(query, it.text),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).map((s) => ({ id: s.item.id, text: s.item.text, score: s.score }));
}

function score(q: string, text: string) {
  const ql = q.toLowerCase();
  const tl = text.toLowerCase();
  if (!ql || !tl) return 0;
  let hits = 0;
  for (const token of ql.split(/\s+/).filter(Boolean)) {
    if (tl.includes(token)) hits++;
  }
  return hits / Math.max(1, ql.split(/\s+/).filter(Boolean).length);
}
