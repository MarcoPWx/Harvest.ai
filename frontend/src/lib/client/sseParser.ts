export type ParsedSSE = { event: string; data: any };

// Utility to parse raw SSE text chunks into events; not used by default hook but available for tests
export function parseSSEBuffer(buffer: string): ParsedSSE[] {
  const events: ParsedSSE[] = [];
  const frames = buffer.split("\n\n");
  for (const frame of frames) {
    if (!frame.trim()) continue;
    const lines = frame.split("\n");
    let event = "message";
    let data = "";
    for (const line of lines) {
      if (line.startsWith("event:")) event = line.slice(6).trim();
      else if (line.startsWith("data:")) data += line.slice(5).trim();
    }
    if (!data) continue;
    let json: any = data;
    try {
      json = JSON.parse(data);
    } catch {}
    events.push({ event, data: json });
  }
  return events;
}
