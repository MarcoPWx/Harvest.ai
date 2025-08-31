#!/usr/bin/env node
/*
  Quick SSE smoke: streams /api/generate and prints events.
  Usage: node scripts/sse-smoke.mjs "Your prompt here" blog
*/

const prompt = process.argv[2] || "Hello from SSE smoke";
const format = process.argv[3] || "blog";

const res = await fetch("http://localhost:3002/api/generate", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Accept": "text/event-stream",
    "X-Request-ID": `smoke_${Math.random().toString(36).slice(2, 8)}`,
  },
  body: JSON.stringify({ input: prompt, format }),
});

if (!res.ok || !res.body) {
  console.error("Stream failed:", res.status, res.statusText);
  process.exit(1);
}

const reader = res.body.getReader();
const decoder = new TextDecoder();
let buffer = "";

while (true) {
  const { value, done } = await reader.read();
  if (done) break;
  buffer += decoder.decode(value, { stream: true });
  let idx;
  while ((idx = buffer.indexOf("\n\n")) !== -1) {
    const raw = buffer.slice(0, idx);
    buffer = buffer.slice(idx + 2);
    const lines = raw.split("\n");
    let event = "message";
    let data = "";
    for (const line of lines) {
      if (line.startsWith("event:")) event = line.slice(6).trim();
      else if (line.startsWith("data:")) data += line.slice(5).trim();
    }
    console.log(`[${event}]`, data);
  }
}
