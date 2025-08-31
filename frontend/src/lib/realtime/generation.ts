export type GenerationEvent =
  | { type: "progress"; value: number }
  | { type: "stream"; delta: string }
  | { type: "complete"; content: string }
  | { type: "error"; message: string };

export interface GenerationProgressOptions {
  jobId?: string;
  onEvent?: (event: GenerationEvent) => void;
}

function getWsUrl(path: string) {
  if (typeof window === "undefined") return "ws://localhost" + path;
  const origin = window.location.origin;
  return origin.replace(/^http/i, "ws") + path;
}

// In mock mode, simulate progress without real sockets
function simulateProgress(opts: GenerationProgressOptions) {
  let progress = 0;
  const chunks = [
    "Parsing input...",
    "Composing outline...",
    "Drafting content...",
    "Refining and polishing...",
  ];

  const interval = setInterval(() => {
    progress += 15;
    opts.onEvent?.({ type: "progress", value: Math.min(progress, 100) });
    const delta = chunks.shift();
    if (delta) opts.onEvent?.({ type: "stream", delta: `\n${delta}` });
    if (progress >= 100) {
      clearInterval(interval);
      const content = "# Mock Result\n\nThis is a mock streamed result.";
      opts.onEvent?.({ type: "complete", content });
    }
  }, 350);

  return () => clearInterval(interval);
}

export function connectGenerationProgress(opts: GenerationProgressOptions = {}) {
  const isMock =
    typeof process !== "undefined" &&
    (process.env.NEXT_PUBLIC_ENABLE_MSW === "1" || process.env.NODE_ENV === "development");

  // Prefer real WS if available; otherwise simulate
  try {
    const url = getWsUrl("/ws/generation" + (opts.jobId ? `?jobId=${opts.jobId}` : ""));
    const ws = new WebSocket(url);
    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        opts.onEvent?.(data);
      } catch (e) {
        // ignore parse errors
      }
    };
    ws.onerror = () => {
      if (isMock) simulateProgress(opts);
    };
    return () => ws.close();
  } catch {
    if (isMock) return simulateProgress(opts);
    return () => {};
  }
}
