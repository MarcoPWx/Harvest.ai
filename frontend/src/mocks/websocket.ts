// Deprecated: use startWebSocketMocks from './ws' instead.
// This file remains as a compatibility wrapper to avoid breaking imports.

export async function startWebSocketMocks() {
  console.warn("[DEPRECATION] src/mocks/websocket.ts is deprecated. Use src/mocks/ws.ts instead.");
  const mod = await import("./ws");
  return mod.startWebSocketMocks();
}

export function closeWebSocketMock() {
  console.warn("[DEPRECATION] closeWebSocketMock is a no-op in the consolidated WS mock.");
}
