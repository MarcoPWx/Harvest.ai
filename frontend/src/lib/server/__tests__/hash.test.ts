import { describe, it, expect } from "@jest/globals";
import { requestHash } from "@/lib/server/hash";

describe("requestHash", () => {
  it("is deterministic for same payload regardless of key order", () => {
    const a = { input: "hello", format: "blog", options: { tone: "pro", len: 100 } };
    const b = { format: "blog", options: { len: 100, tone: "pro" }, input: "hello" };
    const ha = requestHash(a);
    const hb = requestHash(b);
    expect(ha).toBe(hb);
  });

  it("differs for different inputs", () => {
    const ha = requestHash({ input: "hello", format: "blog" });
    const hb = requestHash({ input: "hello world", format: "blog" });
    expect(ha).not.toBe(hb);
  });
});
