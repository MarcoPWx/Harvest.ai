import { describe, it, expect } from "@jest/globals";
import { createSseStream } from "@/lib/server/sse";

async function streamToString(res: Response): Promise<string> {
  // Use text() to avoid depending on ReadableStream reader in test env
  return await res.text();
}

describe("SSE writer", () => {
  it("formats event and comment lines and closes", async () => {
    const res = createSseStream(async (w) => {
      w.comment("hello");
      w.send("meta", { ok: true });
      w.close();
    });
    const text = await streamToString(res);
    expect(text).toContain(": hello");
    expect(text).toContain("event: meta");
    expect(text).toContain('data: {"ok":true}');
  });
});
