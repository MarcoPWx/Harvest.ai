export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function GET() {
  const encoder = new TextEncoder();
  let timer: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      // Helper to send SSE event lines
      const send = (data: Record<string, unknown>) => {
        const payload = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(payload));
      };

      // Initial event
      send({ type: "hello", message: "SSE demo stream started" });

      let progress = 0;
      timer = setInterval(() => {
        progress += 10;
        if (progress <= 100) {
          send({ type: "progress", value: progress });
        }
        if (progress >= 100 && timer) {
          clearInterval(timer);
          timer = null;
          send({ type: "complete", message: "Stream complete" });
          controller.close();
        }
      }, 500);
    },
    cancel() {
      if (timer) clearInterval(timer);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      // Note: Transfer-Encoding: chunked is implicit for streamed responses
      "X-Accel-Buffering": "no",
      // CORS for Storybook (different origin)
      "Access-Control-Allow-Origin": "*",
    },
  });
}
