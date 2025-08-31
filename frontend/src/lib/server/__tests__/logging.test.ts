import { sanitizeForLogs } from "@/lib/server/logging";

describe("sanitizeForLogs", () => {
  it("redacts OpenAI-style keys", () => {
    const s = sanitizeForLogs({ key: "sk-abc123456789xyz", ok: true });
    expect(s).not.toContain("sk-abc");
    expect(s).toContain("REDACTED");
  });

  it("redacts other token-like secrets", () => {
    const s = sanitizeForLogs({ slack: "xoxb-123-456" });
    expect(s).toContain("REDACTED");
  });

  it("handles unserializable values", () => {
    const a: any = {};
    a.self = a;
    const s = sanitizeForLogs(a);
    expect(typeof s).toBe("string");
  });
});
