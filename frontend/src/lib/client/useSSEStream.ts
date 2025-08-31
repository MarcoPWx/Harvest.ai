import { useCallback, useRef, useState } from "react";

export type SSEEvent = { event: string; data: any };

export function useSSEStream() {
  const ctrlRef = useRef<AbortController | null>(null);
  const [status, setStatus] = useState<"idle" | "connecting" | "streaming" | "done" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(
    async (url: string, init: RequestInit, onEvent: (e: SSEEvent) => void) => {
      setError(null);
      setStatus("connecting");
      const ctrl = new AbortController();
      ctrlRef.current = ctrl;
      const res = await fetch(url, { ...init, signal: ctrl.signal });
      if (!res.ok || !res.body) {
        setError(`HTTP ${res.status}`);
        setStatus("error");
        return;
      }
      setStatus("streaming");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let currentEvent = "message";
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let idx;
          while ((idx = buffer.indexOf("\n\n")) !== -1) {
            const raw = buffer.slice(0, idx);
            buffer = buffer.slice(idx + 2);
            const lines = raw.split("\n");
            let ev = currentEvent;
            let data = "";
            for (const line of lines) {
              if (line.startsWith("event:")) ev = line.slice(6).trim();
              else if (line.startsWith("data:")) data += line.slice(5).trim();
            }
            if (data) {
              let obj: any = data;
              try {
                obj = JSON.parse(data);
              } catch {}
              onEvent({ event: ev, data: obj });
            }
            currentEvent = "message";
          }
        }
        setStatus("done");
      } catch (e: any) {
        if (ctrl.signal.aborted) return;
        setError(String(e));
        setStatus("error");
      } finally {
        ctrlRef.current = null;
      }
    },
    [],
  );

  const abort = useCallback(() => {
    try {
      ctrlRef.current?.abort();
    } catch {}
    ctrlRef.current = null;
  }, []);

  return { start, abort, status, error };
}
