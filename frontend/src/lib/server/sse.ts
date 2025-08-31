export type SseWriter = {
  send: (event: string, data: any) => void;
  comment: (text: string) => void;
  close: () => void;
};

export function createSseStream(
  onStart: (w: SseWriter) => Promise<void> | void,
  extraHeaders?: HeadersInit,
): Response {
  const encoder = new TextEncoder();
  // Ensure ReadableStream is available in Node test environments
  const RS: typeof ReadableStream =
    (globalThis as any).ReadableStream || require("stream/web").ReadableStream;
  const stream = new RS<Uint8Array>({
    async start(controller) {
      const write: SseWriter = {
        send: (event, data) => {
          const line = `event: ${event}\n` + `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(line));
        },
        comment: (text) => {
          controller.enqueue(encoder.encode(`: ${text}\n\n`));
        },
        close: () => controller.close(),
      };

      try {
        await onStart(write);
      } catch (e) {
        // emit an error event but try to end the stream cleanly
        write.send("error", { message: e instanceof Error ? e.message : String(e) });
      } finally {
        // End
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
      // CORS for cross-origin Storybook -> Next dev
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Accept",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      ...(extraHeaders || {}),
    },
  });
}
