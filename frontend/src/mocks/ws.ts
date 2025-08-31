// WebSocket mocks for dev/mock mode using mock-socket
// Emits generation progress, stream chunks, and completion events

let started = false;

export async function startWebSocketMocks() {
  if (started) return;

  const { Server } = await import("mock-socket");

  // Compute ws URL based on current origin
  const wsUrl =
    typeof window !== "undefined"
      ? window.location.origin.replace(/^http/i, "ws") + "/ws/generation"
      : "ws://localhost/ws/generation";

  // Avoid creating multiple servers (e.g., HMR)
  // @ts-ignore
  if (typeof window !== "undefined" && (window as any).__harvest_ws_server__) {
    started = true;
    return;
  }

  const server = new Server(wsUrl);

  server.on("connection", (socket) => {
    // Optionally parse jobId from URL
    try {
      const url = new URL((socket as any).url);
      const jobId = url.searchParams.get("jobId") || "mock-job";
      // You could branch behavior by jobId
    } catch {}

    // Emit a deterministic progress sequence
    let progress = 0;
    const contentChunks = [
      "Generating outline...",
      "Writing introduction...",
      "Fleshing out key sections...",
      "Adding examples and transitions...",
      "Finalizing conclusion...",
    ];

    const interval = setInterval(() => {
      progress += 10;
      socket.send(JSON.stringify({ type: "progress", value: progress }));

      const chunk = contentChunks.shift();
      if (chunk) {
        socket.send(JSON.stringify({ type: "stream", delta: `\n${chunk}` }));
      }

      if (progress >= 100) {
        clearInterval(interval);
        const result = [
          "# Mock Generated Content",
          "",
          "This is a high-quality mock output produced by the WebSocket mock server.",
          "Use this during development demos to showcase progress and streaming.",
        ].join("\n");
        socket.send(JSON.stringify({ type: "complete", content: result }));
        socket.close();
      }
    }, 400);
  });

  // @ts-ignore
  if (typeof window !== "undefined") (window as any).__harvest_ws_server__ = server;
  started = true;
}
